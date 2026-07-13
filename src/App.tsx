import { ChronosProvider, useChronos } from './store/ChronosContext'
import { EntryScreen } from './components/EntryScreen'
import { DemoControls } from './components/DemoControls'
import { StudentView } from './components/student/StudentView'
import { LecturerView } from './components/lecturer/LecturerView'
import { AdminView } from './components/admin/AdminView'

function AppContent() {
  const { isAtHome, state } = useChronos()

  if (isAtHome) {
    return <EntryScreen />
  }

  switch (state.currentUser.role) {
    case 'student':
      return <StudentView />
    case 'lecturer':
      return <LecturerView />
    case 'admin':
      return <AdminView />
  }
}

export default function App() {
  return (
    <ChronosProvider>
      <AppContent />
      <DemoControls />
    </ChronosProvider>
  )
}
