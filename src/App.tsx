import { MandateProvider, useMandate } from './store/MandateContext'
import { EntryScreen } from './components/EntryScreen'
import { DemoControls } from './components/DemoControls'
import { StudentDashboard, StudentCoursesPage, StudentCalendarPage } from './components/student/StudentPages'
import { LecturerDashboard, LecturerTimetablePage, LecturerCoursePage } from './components/lecturer/LecturerPages'
import {
  AdminDashboard,
  AdminReportsPage,
  AdminUsersPage,
  AdminCoursesPage,
  AdminHierarchyPage,
  AdminTimetablePage,
  AdminLecturerAttendancePage,
  StudentDetailPage,
  ReportsViewPage,
} from './components/admin/AdminPages'
import type { Role } from './data/types'

function RoleRouter() {
  const { page, state } = useMandate()
  const role = state.currentUser.role

  if (role === 'student') {
    switch (page.id) {
      case 'courses':
        return <StudentCoursesPage />
      case 'calendar':
        return <StudentCalendarPage />
      default:
        return <StudentDashboard />
    }
  }

  if (role === 'lecturer') {
    switch (page.id) {
      case 'timetable':
        return <LecturerTimetablePage />
      case 'course-detail':
        return <LecturerCoursePage />
      case 'reports':
        return <AdminReportsPage />
      default:
        return <LecturerDashboard />
    }
  }

  const adminRole = role as Role
  if (adminRole === 'hod' || adminRole === 'dean' || adminRole === 'admin') {
    switch (page.id) {
      case 'reports':
        return <AdminReportsPage />
      case 'reports-view':
        return <ReportsViewPage />
      case 'users':
        return <AdminUsersPage />
      case 'courses-admin':
        return <AdminCoursesPage />
      case 'hierarchy':
        return <AdminHierarchyPage />
      case 'timetable-admin':
        return <AdminTimetablePage />
      case 'lecturer-attendance':
        return <AdminLecturerAttendancePage />
      case 'student-detail':
        return <StudentDetailPage />
      default:
        return <AdminDashboard />
    }
  }

  return <AdminDashboard />
}

function AppContent() {
  const { isAtHome } = useMandate()
  if (isAtHome) return <EntryScreen />
  return <RoleRouter />
}

export default function App() {
  return (
    <MandateProvider>
      <AppContent />
      <DemoControls />
    </MandateProvider>
  )
}
