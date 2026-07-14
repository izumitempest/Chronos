import { useMemo, useState } from 'react'
import { Layout } from '../Layout'
import { CheckInFlow } from './CheckInFlow'
import { DisputePanel, CourseAttendanceCard } from './AttendanceSection'
import { useMandate, NUC_THRESHOLD } from '../../store/MandateContext'
import { classStartsIn, formatClassTime, formatRelativeMinutes, minutesUntil } from '../../utils/format'
import { isAtRisk } from '../../utils/reports'
import type { AttendanceRecord } from '../../data/types'

export function StudentDashboard() {
  const { state, getStudentRecords, getCourseAttendance } = useMandate()
  const [checkedIn, setCheckedIn] = useState(false)
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null)
  const [disputingToday, setDisputingToday] = useState(false)

  const activeClass = state.classInstances.find((c) => c.status === 'active')
  const studentId = state.currentUser.id

  const todayCheckIn = useMemo(
    () => state.attendanceRecords.find((r) => r.classInstanceId === activeClass?.id && r.studentId === studentId),
    [state.attendanceRecords, activeClass?.id, studentId],
  )

  const pendingLecturerRequest = state.lecturerRequests.find(
    (r) => r.studentId === studentId && r.classInstanceId === activeClass?.id && r.status === 'pending',
  )

  const hasCheckedIn = checkedIn || !!todayCheckIn || !!pendingLecturerRequest
  const currentRecord = useMemo(() => {
    const id = todayRecord?.id ?? todayCheckIn?.id
    if (!id) return todayRecord ?? todayCheckIn ?? null
    return state.attendanceRecords.find((r) => r.id === id) ?? todayRecord ?? todayCheckIn ?? null
  }, [todayRecord, todayCheckIn, state.attendanceRecords])

  const courseAttendance = getCourseAttendance(studentId)
  const atRiskCourses = courseAttendance.filter((c) => isAtRisk(c.percentage))

  return (
    <Layout>
      <h1 className="mb-10 text-[1.75rem] font-medium tracking-tight text-ink">Today</h1>

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
            <CheckInFlow
              classInstanceId={activeClass.id}
              courseCode={activeClass.courseCode}
              onComplete={(record) => {
                setTodayRecord(record)
                setCheckedIn(true)
              }}
            />
          ) : pendingLecturerRequest ? (
            <div className="rounded-2xl bg-surface px-6 py-8">
              <p className="text-base text-ink">Waiting for your lecturer to mark you present</p>
              <p className="mt-1 text-sm text-ink-muted">Request sent for {activeClass.courseCode}</p>
            </div>
          ) : currentRecord ? (
            <div className={`rounded-2xl px-6 py-8 ${currentRecord.verificationStatus === 'verified' || currentRecord.verificationStatus === 'manual' ? 'bg-success-soft' : 'bg-caution-soft'}`}>
              {currentRecord.verificationStatus === 'verified' && <p className="text-base text-ink">You're marked present for {activeClass.courseCode}</p>}
              {currentRecord.verificationStatus === 'manual' && <p className="text-base text-ink">Manual check-in recorded for {activeClass.courseCode}</p>}
              {currentRecord.verificationStatus === 'disputed' && <p className="text-base text-ink">Your dispute is with your HOD for review</p>}
              {currentRecord.verificationStatus === 'unverified' && (
                <>
                  <p className="text-base text-ink">We couldn't confirm your exact location — this will be reviewed</p>
                  {!disputingToday && (
                    <button type="button" onClick={() => setDisputingToday(true)} className="mt-3 text-sm text-ink-muted underline underline-offset-2 hover:text-ink">
                      Dispute this record
                    </button>
                  )}
                  {disputingToday && (
                    <DisputePanel record={currentRecord} onClose={() => setDisputingToday(false)} onSubmitted={() => setDisputingToday(false)} />
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
        <p className="mb-8 text-sm text-ink-muted">{state.pendingSyncCount} check-ins waiting to sync</p>
      )}

      <section className="mb-14">
        <p className="section-label mb-2">My attendance</p>
        <p className="mb-6 text-sm text-ink-muted">Nigerian universities require {NUC_THRESHOLD}% attendance to sit exams.</p>
        <div className="space-y-3">
          {courseAttendance.slice(0, 3).map((c) => (
            <CourseAttendanceCard key={c.courseCode} courseCode={c.courseCode} courseTitle={c.courseTitle} percentage={c.percentage} />
          ))}
        </div>
      </section>

      <section>
        <p className="section-label mb-4">Courses at risk</p>
        <p className="mb-4 text-sm text-ink-muted">Courses where you may fall below the {NUC_THRESHOLD}% threshold.</p>
        {atRiskCourses.length === 0 ? (
          <p className="text-sm text-ink-muted">You're on track in all enrolled courses.</p>
        ) : (
          <ul className="space-y-2">
            {atRiskCourses.map((c) => (
              <li key={c.courseCode} className="rounded-xl bg-danger-soft/40 px-4 py-3">
                <span className="text-sm font-medium text-ink">{c.courseCode}</span>
                <span className="ml-2 text-sm text-danger">{c.percentage}% · projected {c.projected}%</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Layout>
  )
}

export function StudentCoursesPage() {
  const { getCourseAttendance, getStudentRecords, state } = useMandate()
  const studentId = state.currentUser.id
  const courses = getCourseAttendance(studentId)
  const records = getStudentRecords(studentId)

  return (
    <Layout>
      <h1 className="mb-8 text-[1.75rem] font-medium text-ink">My courses</h1>
      <p className="mb-8 text-sm text-ink-muted">Attendance records and projections for each enrolled course.</p>
      <div className="space-y-8">
        {courses.map((c) => {
          const courseRecords = records.filter((r) => r.courseCode === c.courseCode)
          return (
            <div key={c.courseCode} className="card-quiet">
              <div className="mb-4 flex items-baseline justify-between">
                <div>
                  <p className="font-medium text-ink">{c.courseCode}</p>
                  <p className="text-sm text-ink-muted">{c.courseTitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-medium tabular-nums text-accent">{c.percentage}%</p>
                  <p className="text-xs text-ink-faint">Projected {c.projected}%</p>
                </div>
              </div>
              <ul className="space-y-2 border-t border-ink/[0.05] pt-4">
                {courseRecords.length === 0 ? (
                  <li className="text-xs text-ink-faint">No sessions recorded yet</li>
                ) : (
                  courseRecords.slice(0, 5).map((r) => (
                    <li key={r.id} className="flex justify-between text-xs text-ink-muted">
                      <span>{new Date(r.timestamp).toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos' })}</span>
                      <span>{r.presenceMethod.replace(/_/g, ' ')}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )
        })}
      </div>
    </Layout>
  )
}

export function StudentCalendarPage() {
  const { state } = useMandate()
  const sessions = state.calendarSessions.filter((s) => s.studentId === state.currentUser.id)
  const weeks = [...new Set(sessions.map((s) => s.date.slice(0, 7)))]

  return (
    <Layout>
      <h1 className="mb-4 text-[1.75rem] font-medium text-ink">Academic calendar</h1>
      <p className="mb-8 text-sm text-ink-muted">Each cell shows whether you were recorded, missed, or have a class coming up.</p>
      {weeks.map((week) => (
        <div key={week} className="mb-10">
          <p className="section-label mb-3">{week}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {sessions
              .filter((s) => s.date.startsWith(week))
              .map((s) => (
                <div
                  key={s.id}
                  className={`rounded-lg px-3 py-3 text-xs ${
                    s.status === 'present' ? 'bg-success-soft' : s.status === 'missed' ? 'bg-danger-soft/50' : 'bg-surface'
                  }`}
                >
                  <p className="font-medium text-ink">{s.courseCode}</p>
                  <p className="text-ink-faint">{s.date.slice(8)} · {s.startTime}</p>
                  <p className="mt-1 capitalize text-ink-muted">
                    {s.status === 'present'
                      ? s.presenceMethod === 'autonomous_gaa'
                        ? 'Automatic'
                        : s.presenceMethod === 'manual_student'
                          ? 'Manual'
                          : s.presenceMethod === 'lecturer_requested'
                            ? 'Via lecturer'
                            : 'Lecturer marked'
                      : s.status}
                  </p>
                </div>
              ))}
          </div>
        </div>
      ))}
    </Layout>
  )
}
