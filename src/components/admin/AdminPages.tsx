import { useState } from 'react'
import { Layout } from '../Layout'
import { CourseOverview, CourseDetailPanel } from './DepartmentOverview'
import { ApprovalsList, FlaggedRecords, ActivityLog } from './AdminSections'
import { ReportButton } from '../shared/NavTabs'
import { useMandate } from '../../store/MandateContext'
import { adminSectionsForRole } from '../../navigation/pages'
import { EXCEL_TEMPLATES } from '../../data/constants'
import { downloadTemplate } from '../../utils/reports'
import { buildStudentReportRows } from '../../utils/reports'
import type { User } from '../../data/types'
import { NUC_THRESHOLD } from '../../data/types'

export function AdminDashboard() {
  const { state } = useMandate()
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const scopeLabel =
    state.currentUser.role === 'admin'
      ? 'Institution'
      : state.currentUser.role === 'dean'
        ? state.currentUser.faculty
        : state.currentUser.department

  return (
    <Layout>
      <h1 className="mb-2 text-[1.75rem] font-medium text-ink">{scopeLabel}</h1>
      <p className="mb-8 text-sm text-ink-muted">
        Department overview — {NUC_THRESHOLD}% NUC attendance threshold.
      </p>

      <section className="mb-12">
        <p className="section-label mb-4">Course compliance</p>
        <CourseOverview onSelectCourse={setSelectedCourse} />
      </section>

      <section className="mb-12">
        <p className="section-label mb-4">Approvals</p>
        <ApprovalsList />
      </section>

      <section className="mb-12">
        <p className="section-label mb-4">Flagged records</p>
        <FlaggedRecords />
      </section>

      <section>
        <p className="section-label mb-4">Recent activity</p>
        <ActivityLog />
      </section>

      {selectedCourse && (
        <CourseDetailPanel courseCode={selectedCourse} onClose={() => setSelectedCourse(null)} />
      )}
    </Layout>
  )
}

export function AdminReportsPage() {
  const { exportReport, navigate, state } = useMandate()
  const sections = adminSectionsForRole(state.currentUser.role)

  if (!sections.includes('reports')) {
    return (
      <Layout>
        <p className="text-sm text-ink-muted">Your role cannot access reports.</p>
      </Layout>
    )
  }

  return (
    <Layout>
      <h1 className="mb-8 text-[1.75rem] font-medium text-ink">Reports</h1>
      <p className="mb-8 text-sm text-ink-muted">Download Excel breakdowns or view on-screen lists.</p>

      <div className="space-y-3">
        <ReportButton label="All students — attendance by course" onExport={() => exportReport('all-students')} onView={() => navigate('reports-view', { type: 'all-students' })} />
        <ReportButton label="Students not on track (below threshold)" onExport={() => exportReport('at-risk')} onView={() => navigate('reports-view', { type: 'at-risk' })} />
        <ReportButton label="Students above threshold" onExport={() => exportReport('above-threshold')} onView={() => navigate('reports-view', { type: 'above-threshold' })} />
        <ReportButton label="All students grouped by level & department" onExport={() => exportReport('by-department')} onView={() => navigate('reports-view', { type: 'by-department' })} />
        <ReportButton label="Students below threshold in any course" onExport={() => exportReport('below-any')} onView={() => navigate('reports-view', { type: 'below-any' })} />
      </div>
    </Layout>
  )
}

export function AdminUsersPage() {
  const { state, addUser, removeUser, mockUploadUsers, navigate } = useMandate()
  const [name, setName] = useState('')
  const [department, setDepartment] = useState('Computer Science')
  const [role, setRole] = useState<User['role']>('student')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    addUser({
      role,
      name: name.trim(),
      department,
      faculty: 'Natural Sciences',
      level: role === 'student' ? '400' : undefined,
      canAccessAdmin: role === 'hod' || role === 'dean' || role === 'admin',
    })
    setName('')
  }

  return (
    <Layout>
      <h1 className="mb-8 text-[1.75rem] font-medium text-ink">Users</h1>

      <div className="mb-8 flex flex-wrap gap-3">
        {Object.entries(EXCEL_TEMPLATES).map(([key, tpl]) => (
          <button
            key={key}
            type="button"
            onClick={() => downloadTemplate(tpl.filename, [...tpl.headers], tpl.sample.map((r) => [...r]))}
            className="rounded-lg bg-surface px-3 py-2 text-xs text-accent hover:underline"
          >
            Download {key} template
          </button>
        ))}
        <label className="cursor-pointer rounded-lg bg-accent px-3 py-2 text-xs font-medium text-white">
          Upload filled Excel
          <input type="file" accept=".xlsx,.xls" className="hidden" onChange={() => mockUploadUsers()} />
        </label>
      </div>

      <form onSubmit={handleAdd} className="card-quiet mb-10">
        <p className="section-label mb-4">Add user manually</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="rounded-lg bg-surface-raised px-3 py-2 text-sm ring-1 ring-ink/5" />
          <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Department" className="rounded-lg bg-surface-raised px-3 py-2 text-sm ring-1 ring-ink/5" />
          <select value={role} onChange={(e) => setRole(e.target.value as User['role'])} className="rounded-lg bg-surface-raised px-3 py-2 text-sm ring-1 ring-ink/5">
            <option value="student">Student</option>
            <option value="lecturer">Lecturer</option>
            <option value="hod">HOD</option>
            <option value="dean">Dean</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white">Add user</button>
      </form>

      <ul className="space-y-2">
        {state.users.slice(0, 20).map((u) => (
          <li key={u.id} className="flex items-center justify-between rounded-xl bg-surface/80 px-4 py-3">
            <div>
              <button type="button" onClick={() => navigate('student-detail', { studentId: u.id })} className="text-sm text-ink hover:underline">
                {u.name}
              </button>
              <p className="text-xs text-ink-faint">{u.role} · {u.department}</p>
            </div>
            <button type="button" onClick={() => removeUser(u.id)} className="text-xs text-danger">Remove</button>
          </li>
        ))}
      </ul>
    </Layout>
  )
}

export function AdminCoursesPage() {
  const { state, addCourse, removeCourse } = useMandate()
  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || !title) return
    addCourse({
      code,
      title,
      level: '400',
      department: state.currentUser.department,
      faculty: state.currentUser.faculty,
      lecturerIds: [],
      lecturerNames: [],
    })
    setCode('')
    setTitle('')
  }

  return (
    <Layout>
      <h1 className="mb-8 text-[1.75rem] font-medium text-ink">Courses</h1>
      <form onSubmit={handleAdd} className="card-quiet mb-8">
        <p className="section-label mb-4">Add course</p>
        <div className="flex flex-wrap gap-3">
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code" className="rounded-lg px-3 py-2 text-sm ring-1 ring-ink/5" />
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="flex-1 rounded-lg px-3 py-2 text-sm ring-1 ring-ink/5" />
          <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm text-white">Add</button>
        </div>
      </form>
      <ul className="space-y-2">
        {state.courseCatalog.map((c) => (
          <li key={c.code} className="flex justify-between rounded-xl bg-surface px-4 py-3 text-sm">
            <span>{c.code} — {c.title} · Level {c.level}</span>
            <button type="button" onClick={() => removeCourse(c.code)} className="text-xs text-danger">Remove</button>
          </li>
        ))}
      </ul>
    </Layout>
  )
}

export function AdminHierarchyPage() {
  const { state } = useMandate()
  return (
    <Layout>
      <h1 className="mb-8 text-[1.75rem] font-medium text-ink">Hierarchy</h1>
      <p className="mb-6 text-sm text-ink-muted">Who can access the app and admin dashboard.</p>
      <ul className="space-y-3">
        {state.hierarchy.map((h) => (
          <li key={h.role} className="card-quiet">
            <p className="font-medium text-ink">{h.label}</p>
            <p className="mt-1 text-xs text-ink-muted">
              App: {h.canAccessApp ? 'yes' : 'no'} · Admin: {h.canAccessAdmin ? 'yes' : 'no'}
            </p>
            {h.adminSections.length > 0 && (
              <p className="mt-1 text-xs text-ink-faint">Sections: {h.adminSections.join(', ')}</p>
            )}
          </li>
        ))}
      </ul>
    </Layout>
  )
}

export function AdminTimetablePage() {
  const { state } = useMandate()
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  return (
    <Layout>
      <h1 className="mb-4 text-[1.75rem] font-medium text-ink">Weekly timetable</h1>
      <p className="mb-8 text-sm text-ink-muted">Edits here update what students and lecturers see across the app.</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-ink/[0.06]">
              <th className="py-2 text-left text-xs text-ink-faint">Day</th>
              <th className="py-2 text-left text-xs text-ink-faint">Time</th>
              <th className="py-2 text-left text-xs text-ink-faint">Course</th>
              <th className="py-2 text-left text-xs text-ink-faint">Level</th>
              <th className="py-2 text-left text-xs text-ink-faint">Dept</th>
            </tr>
          </thead>
          <tbody>
            {days.flatMap((day) =>
              state.timetable
                .filter((t) => t.day === day)
                .map((t) => (
                  <tr key={t.id} className="border-b border-ink/[0.04]">
                    <td className="py-3 text-ink-muted">{t.day}</td>
                    <td className="py-3 tabular-nums">{t.startTime}–{t.endTime}</td>
                    <td className="py-3">{t.courseCode}</td>
                    <td className="py-3 text-ink-muted">{t.level}</td>
                    <td className="py-3 text-ink-muted">{t.department}</td>
                  </tr>
                )),
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}

export function AdminLecturerAttendancePage() {
  const { state, exportReport } = useMandate()
  return (
    <Layout>
      <h1 className="mb-8 text-[1.75rem] font-medium text-ink">Lecturer attendance</h1>
      <p className="mb-6 text-sm text-ink-muted">Alerts when lecturers miss taking class attendance.</p>
      <ul className="mb-10 space-y-2">
        {state.lecturerAttendance.map((l) => (
          <li key={l.id} className={`rounded-xl px-4 py-3 text-sm ${l.tookAttendance ? 'bg-success-soft/50' : 'bg-danger-soft/40'}`}>
            {l.lecturerName} — {l.courseCode} on {l.date} · {l.tookAttendance ? 'Took attendance' : 'Missed — alert sent to admin'}
          </li>
        ))}
      </ul>
      <div className="space-y-3">
        <ReportButton label="Lecturers passing attendance metrics" onExport={() => exportReport('lecturer-pass')} />
        <ReportButton label="Lecturers failing attendance metrics" onExport={() => exportReport('lecturer-fail')} />
      </div>
    </Layout>
  )
}

export function StudentDetailPage() {
  const { page, state, scopedEnrollments, goBack, canGoBack } = useMandate()
  const studentId = page.params?.studentId ?? 's1'
  const courses = Object.entries(scopedEnrollments)
    .flatMap(([code, students]) => {
      const s = students.find((st) => st.studentId === studentId)
      return s ? [{ code, ...s }] : []
    })

  return (
    <Layout showNav={false}>
      {canGoBack && (
        <button type="button" onClick={goBack} className="mb-6 inline-flex rounded-xl bg-ink px-4 py-2 text-sm font-medium text-paper">
          ← Back
        </button>
      )}
      <h1 className="mb-2 text-[1.75rem] font-medium text-ink">
        {courses[0]?.name ?? state.users.find((u) => u.id === studentId)?.name ?? 'Student'}
      </h1>
      <p className="mb-8 text-sm text-ink-muted">Attendance across all courses under your scope.</p>
      <ul className="space-y-3">
        {courses.map((c) => (
          <li key={c.code} className="flex justify-between rounded-xl bg-surface px-4 py-3">
            <span className="text-sm text-ink">{c.code}</span>
            <span className={`text-sm tabular-nums ${c.attendancePct >= NUC_THRESHOLD ? 'text-accent' : 'text-danger'}`}>
              {c.attendancePct}% · {c.attendancePct >= NUC_THRESHOLD ? 'Eligible' : 'Not eligible'}
            </span>
          </li>
        ))}
      </ul>
    </Layout>
  )
}

export function ReportsViewPage() {
  const { page, exportReport, scopedEnrollments, courseTitles, navigate, state } = useMandate()
  const type = page.params?.type ?? 'all-students'
  
  let rows: Record<string, string | number>[] = []
  let title = 'Full attendance breakdown'

  switch (type) {
    case 'all-students':
      rows = buildStudentReportRows(scopedEnrollments, courseTitles, 'all')
      break
    case 'on-track':
      rows = buildStudentReportRows(scopedEnrollments, courseTitles, 'on-track')
      title = 'Students on track'
      break
    case 'at-risk':
      rows = buildStudentReportRows(scopedEnrollments, courseTitles, 'at-risk')
      title = 'Students not on track'
      break
    case 'above-threshold':
      rows = buildStudentReportRows(scopedEnrollments, courseTitles, 'above')
      title = 'Students above threshold'
      break
    case 'by-department':
      rows = buildDepartmentReportRows(scopedEnrollments, courseTitles, state.currentUser.department)
      title = 'By level & department'
      break
    case 'below-any':
      rows = buildDepartmentReportRows(scopedEnrollments, courseTitles).filter(
        (r) => r['Below threshold in any course'] === 'Yes',
      )
      title = 'Below threshold in any course'
      break
    default:
      rows = buildStudentReportRows(scopedEnrollments, courseTitles, 'all')
  }

  return (
    <Layout showNav={false}>
      <button type="button" onClick={() => navigate('reports')} className="mb-6 inline-flex rounded-xl bg-ink px-4 py-2 text-sm font-medium text-paper">
        ← Back
      </button>
      <h1 className="mb-8 text-[1.75rem] font-medium text-ink">{title}</h1>
      <button type="button" onClick={() => exportReport(type)} className="mb-6 rounded-lg bg-accent px-4 py-2 text-sm text-white">
        Download Excel
      </button>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-ink/[0.06]">
              {rows[0] && Object.keys(rows[0]).map((k) => (
                <th key={k} className="py-2 pr-3 text-ink-faint">{k}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 30).map((row, i) => (
              <tr key={i} className="border-b border-ink/[0.04]">
                {Object.values(row).map((v, j) => (
                  <td key={j} className="py-2 pr-3 text-ink-muted">{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}

