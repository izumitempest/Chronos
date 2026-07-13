import { useMemo, useState } from 'react'
import { Layout } from '../Layout'
import { CheckInFlow, ManualCheckInLink } from './CheckInFlow'
import {
  AttendanceHistory,
  CourseAttendanceCard,
  DisputePanel,
} from './AttendanceSection'
import { useMandate } from '../../store/MandateContext'
import {
  classStartsIn,
  formatClassTime,
  formatRelativeMinutes,
  minutesUntil,
} from '../../utils/format'
import type { AttendanceRecord } from '../../data/types'

export function StudentView() {
  const { state, manualCheckIn, getStudentRecords, getCourseAttendance } = useMandate()
  const [checkedIn, setCheckedIn] = useState(false)
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null)
  const [disputingToday, setDisputingToday] = useState(false)

  const activeClass = state.classInstances.find((c) => c.status === 'active')
  const studentId = 's1'

  const todayCheckIn = useMemo(
    () =>
      state.attendanceRecords.find(
        (r) => r.classInstanceId === activeClass?.id && r.studentId === studentId,
      ),
    [state.attendanceRecords, activeClass?.id],
  )

  const hasCheckedIn = checkedIn || !!todayCheckIn
  const currentRecord = useMemo(() => {
    const id = todayRecord?.id ?? todayCheckIn?.id
    if (!id) return null
    return state.attendanceRecords.find((r) => r.id === id) ?? todayRecord ?? todayCheckIn ?? null
  }, [todayRecord, todayCheckIn, state.attendanceRecords])

  const courseAttendance = getCourseAttendance(studentId)
  const historyRecords = getStudentRecords(studentId).slice(0, 8)

  const handleManual = () => {
    if (!activeClass) return
    const record = manualCheckIn(activeClass.id)
    setTodayRecord(record)
    setCheckedIn(true)
  }

  return (
    <Layout title="Today">
      {activeClass ? (
        <section className="mb-14">
          <div className="card-quiet mb-8">
            <p className="section-label mb-4">Next class</p>
            <div className="flex items-end gap-3">
              <span className="hero-time text-accent">{minutesUntil(activeClass.classStartAt)}</span>
              <span className="mb-1.5 text-sm text-ink-muted">minutes away</span>
            </div>
            <p className="mt-3 text-sm text-ink-muted">{classStartsIn(activeClass.classStartAt)}</p>

            <div className="mt-8 border-t border-ink/[0.05] pt-6">
              <p className="text-lg font-medium text-ink">
                {activeClass.courseCode}
                <span className="font-normal text-ink-muted"> · {activeClass.courseTitle}</span>
              </p>
              <p className="mt-1 text-sm text-ink-muted">{activeClass.venue}</p>
              <p className="mt-2 text-xs text-ink-faint">
                {formatClassTime(activeClass.classStartAt)} · {formatRelativeMinutes(activeClass.windowOpenAt)}
              </p>
            </div>
          </div>

          {!hasCheckedIn ? (
            <>
              <CheckInFlow
                classInstanceId={activeClass.id}
                courseCode={activeClass.courseCode}
                onComplete={(record) => {
                  setTodayRecord(record)
                  setCheckedIn(true)
                }}
              />
              <ManualCheckInLink onManual={handleManual} />
            </>
          ) : currentRecord ? (
            <div
              className={`rounded-2xl px-6 py-8 ${
                currentRecord.verificationStatus === 'verified' ||
                currentRecord.verificationStatus === 'manual'
                  ? 'bg-success-soft'
                  : 'bg-caution-soft'
              }`}
            >
              {currentRecord.verificationStatus === 'verified' && (
                <p className="text-base text-ink">
                  You're marked present for {activeClass.courseCode}
                </p>
              )}
              {currentRecord.verificationStatus === 'manual' && (
                <p className="text-base text-ink">
                  Manual check-in recorded for {activeClass.courseCode}
                </p>
              )}
              {currentRecord.verificationStatus === 'disputed' && (
                <p className="text-base text-ink">
                  Your dispute is with your HOD for review
                </p>
              )}
              {currentRecord.verificationStatus === 'unverified' && (
                <>
                  <p className="text-base text-ink">
                    We couldn't confirm your exact location — this will be reviewed
                  </p>
                  {!disputingToday && (
                    <button
                      type="button"
                      onClick={() => setDisputingToday(true)}
                      className="mt-3 text-sm text-ink-muted underline decoration-ink-faint/40 underline-offset-2 hover:text-ink"
                    >
                      Dispute this record
                    </button>
                  )}
                  {disputingToday && (
                    <DisputePanel
                      record={currentRecord}
                      onClose={() => setDisputingToday(false)}
                      onSubmitted={() => setDisputingToday(false)}
                    />
                  )}
                </>
              )}
            </div>
          ) : null}
        </section>
      ) : (
        <p className="mb-12 text-sm text-ink-muted">No class scheduled right now.</p>
      )}

      {state.pendingSyncCount > 0 && (
        <p className="mb-8 text-sm text-ink-muted">
          {state.pendingSyncCount} check-in{state.pendingSyncCount > 1 ? 's' : ''} waiting to sync
        </p>
      )}

      <section className="mb-14">
        <p className="section-label mb-2">My attendance</p>
        <p className="mb-6 text-sm text-ink-muted">
          Nigerian universities require 75% attendance to sit exams.
        </p>
        <div className="space-y-3">
          {courseAttendance.map((c) => (
            <CourseAttendanceCard
              key={c.courseCode}
              courseCode={c.courseCode}
              courseTitle={c.courseTitle}
              percentage={c.percentage}
            />
          ))}
        </div>
      </section>

      <section>
        <p className="section-label mb-4">Recent check-ins</p>
        <AttendanceHistory records={historyRecords} />
        <p className="mt-4 text-xs text-ink-faint">
          Visible to you, your lecturer, and your HOD.
        </p>
      </section>
    </Layout>
  )
}
