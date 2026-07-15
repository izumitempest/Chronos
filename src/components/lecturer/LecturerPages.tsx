import { useState } from 'react'
import { Layout } from '../Layout'
import { LiveRoster } from './LiveRoster'
import { ProposeClassTime } from './ProposeClassTime'
import { useMandate } from '../../store/MandateContext'
import { classStartsIn, formatClassTime, minutesUntil } from '../../utils/format'
import { ReportButton } from '../shared/NavTabs'
import { NUC_THRESHOLD } from '../../data/types'

export function LecturerDashboard() {
  const { state, navigate } = useMandate()
  const myClasses = state.classInstances.filter(
    (c) => c.lecturerIds.includes(state.currentUser.id) || c.lecturer.includes(state.currentUser.name),
  )
  const activeClass = myClasses.find((c) => c.status === 'active') ?? myClasses[0]
  const pendingRequests = state.lecturerRequests.filter((r) => r.status === 'pending')

  return (
    <Layout>
      <h1 className="mb-10 text-[1.75rem] font-medium text-ink">Today</h1>

      {activeClass ? (
        <>
          <div className="card-quiet mb-8">
            <p className="section-label mb-4">{activeClass.status === 'active' ? 'Now teaching' : 'Up next'}</p>
            <div className="flex items-end gap-3">
              <span className="hero-time text-accent">{minutesUntil(activeClass.classStartAt)}</span>
              <span className="mb-1.5 text-sm text-ink-muted">minutes</span>
            </div>
            <p className="mt-3 text-sm text-ink-muted">{classStartsIn(activeClass.classStartAt)}</p>
            <div className="mt-6 border-t border-ink/[0.05] pt-6">
              <p className="text-lg font-medium text-ink">{activeClass.courseCode} · {activeClass.courseTitle}</p>
              <p className="mt-1 text-sm text-ink-muted">{activeClass.venue}</p>
              <p className="mt-2 text-xs text-ink-faint">{formatClassTime(activeClass.classStartAt)}</p>
            </div>
          </div>

          {pendingRequests.length > 0 && (
            <div className="mb-6 rounded-xl bg-caution-soft px-5 py-4">
              <p className="text-sm text-ink">{pendingRequests.length} student(s) asked you to mark them present</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate('course-detail', { courseCode: activeClass.courseCode })}
            className="mb-10 w-full rounded-2xl bg-accent px-6 py-4 text-sm font-medium text-white"
          >
            Take attendance for {activeClass.courseCode}
          </button>

          <section className="mb-10">
            <p className="section-label mb-4">Live roster</p>
            <LiveRoster courseCode={activeClass.courseCode} classInstanceId={activeClass.id} />
          </section>
        </>
      ) : (
        <p className="text-sm text-ink-muted">No classes on your timetable today.</p>
      )}

      <section>
        <p className="section-label mb-4">Schedule</p>
        <ProposeClassTime />
      </section>
    </Layout>
  )
}

export function LecturerTimetablePage() {
  const { state } = useMandate()
  const mySlots = state.timetable.filter(
    (t) => t.lecturerIds.includes(state.currentUser.id) || t.lecturerNames.includes(state.currentUser.name),
  )
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  return (
    <Layout>
      <h1 className="mb-8 text-[1.75rem] font-medium text-ink">My timetable</h1>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink/[0.06]">
              <th className="py-2 pr-4 text-xs text-ink-faint">Day</th>
              <th className="py-2 pr-4 text-xs text-ink-faint">Time</th>
              <th className="py-2 pr-4 text-xs text-ink-faint">Course</th>
              <th className="py-2 text-xs text-ink-faint">Venue</th>
            </tr>
          </thead>
          <tbody>
            {days.flatMap((day) =>
              mySlots
                .filter((s) => s.day === day)
                .map((s) => (
                  <tr key={s.id} className="border-b border-ink/[0.04]">
                    <td className="py-3 pr-4 text-ink-muted">{s.day}</td>
                    <td className="py-3 pr-4 tabular-nums text-ink">{s.startTime}–{s.endTime}</td>
                    <td className="py-3 pr-4 text-ink">{s.courseCode}</td>
                    <td className="py-3 text-ink-muted">{s.venue}</td>
                  </tr>
                )),
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}

export function LecturerCoursePage() {
  const { page, state, scopedEnrollments, navigate, exportReport, fulfillLecturerRequest, markPresentManually } = useMandate()
  const courseCode = page.params?.courseCode ?? 'CSC 401'
  const activeClass = state.classInstances.find((c) => c.courseCode === courseCode && c.status === 'active')
  const students = scopedEnrollments[courseCode] ?? []
  const requests = state.lecturerRequests.filter((r) => r.courseCode === courseCode && r.status === 'pending')

  return (
    <Layout showNav={false}>
      <button type="button" onClick={() => navigate('dashboard')} className="mb-6 inline-flex rounded-xl bg-ink px-4 py-2 text-sm font-medium text-paper">
        ← Back
      </button>
      <h1 className="mb-2 text-[1.75rem] font-medium text-ink">{courseCode}</h1>
      <p className="mb-8 text-sm text-ink-muted">Student attendance for this course. If two lecturers share a class, one taking attendance marks both.</p>

      {activeClass && (
        <section className="mb-10">
          <LiveRoster courseCode={courseCode} classInstanceId={activeClass.id} />
        </section>
      )}

      {requests.length > 0 && (
        <section className="mb-10">
          <p className="section-label mb-3">Forwarded requests</p>
          <ul className="space-y-2">
            {requests.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-xl bg-surface px-4 py-3">
                <span className="text-sm text-ink">{r.studentName}</span>
                <button type="button" onClick={() => fulfillLecturerRequest(r.id)} className="text-xs text-accent hover:underline">
                  Mark present
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-10">
        <p className="section-label mb-4">Student metrics</p>
        <ul className="space-y-2">
          {students.map((s) => (
            <li key={s.studentId} className="flex items-center justify-between rounded-xl bg-surface/80 px-4 py-3">
              <span className="text-sm text-ink">{s.name}</span>
              <div className="flex items-center gap-3">
                <span className={`text-sm tabular-nums ${s.attendancePct >= NUC_THRESHOLD ? 'text-ink-muted' : 'text-danger'}`}>{s.attendancePct}%</span>
                <span className="text-xs text-ink-faint">{s.attendancePct >= NUC_THRESHOLD ? 'On track' : 'Below threshold'}</span>
                {activeClass && (
                  <button type="button" onClick={() => markPresentManually(s.studentId, activeClass.id)} className="text-xs text-accent">
                    Mark today
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <p className="section-label mb-2">Reports for this course</p>
        <ReportButton label="All students — full breakdown" onExport={() => exportReport('all-students', courseCode)} />
        <ReportButton label="Students not on track" onExport={() => exportReport('at-risk', courseCode)} />
        <ReportButton label="Students above threshold" onExport={() => exportReport('above-threshold', courseCode)} />
      </section>
    </Layout>
  )
}

export function LecturerPastClassesPage() {
  const { state, navigate } = useMandate()
  const [showInfo, setShowInfo] = useState<string | null>(null)
  
  const myPastClasses = state.lecturerAttendance.filter(
    (l) => l.lecturerId === state.currentUser.id || l.lecturerName === state.currentUser.name
  )

  return (
    <Layout>
      <h1 className="mb-4 text-[1.75rem] font-medium text-ink">Past classes</h1>
      <p className="mb-8 text-sm text-ink-muted">Recent lectures you were scheduled to take.</p>
      
      <div className="space-y-3">
        {myPastClasses.map((c) => (
          <div key={c.id}>
            <div
              role={c.tookAttendance ? 'button' : undefined}
              tabIndex={c.tookAttendance ? 0 : undefined}
              onClick={() => {
                if (c.tookAttendance) {
                  navigate('course-detail', { courseCode: c.courseCode })
                }
              }}
              className={`w-full text-left rounded-xl px-4 py-3 transition-colors ${
                !c.tookAttendance
                  ? 'bg-danger-soft/40 cursor-default'
                  : 'bg-surface hover:bg-surface-raised cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink">{c.courseCode}</p>
                  <p className="text-sm text-ink-muted">{c.date} · {c.courseTitle}</p>
                </div>
                {!c.tookAttendance ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowInfo(showInfo === c.id ? null : c.id)
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-danger/10 text-danger hover:bg-danger/20"
                    title="Why is this red?"
                  >
                    i
                  </button>
                ) : (
                  <span className="text-sm text-ink-faint">View →</span>
                )}
              </div>
            </div>
            {showInfo === c.id && !c.tookAttendance && (
              <div className="mt-2 rounded-lg bg-surface px-4 py-3 text-sm text-ink-muted">
                This class did not hold, or attendance was missed. No student attendance records exist for this session.
              </div>
            )}
          </div>
        ))}
        {myPastClasses.length === 0 && (
          <p className="text-sm text-ink-muted">No past classes found.</p>
        )}
      </div>
    </Layout>
  )
}
