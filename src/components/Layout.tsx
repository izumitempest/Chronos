import type { ReactNode } from 'react'
import { useMandate } from '../store/MandateContext'
import { MandateMark } from './MandateMark'
import { PrototypeDisclaimer } from './shared/PrototypeDisclaimer'
import { NavTabs } from './shared/NavTabs'
import type { Role } from '../data/types'

const roleLabels: Record<Role, string> = {
  student: 'Student',
  lecturer: 'Lecturer',
  hod: 'HOD',
  dean: 'Dean',
  admin: 'Admin',
}

interface LayoutProps {
  children: ReactNode
  showNav?: boolean
  showDisclaimer?: boolean
}

export function Layout({ children, showNav = true, showDisclaimer = true }: LayoutProps) {
  const { state, goHome, loading } = useMandate()
  const user = state.currentUser

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-4xl items-center justify-between border-b border-ink/[0.04] px-6 py-5">
        <button
          type="button"
          onClick={goHome}
          className="flex items-center gap-2 text-ink-muted transition-colors hover:text-ink"
        >
          <MandateMark size={18} className="text-accent" />
          <span className="text-sm font-medium">Mandate</span>
        </button>
        <div className="flex items-center gap-4">
          <span className="hidden rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent sm:inline">
            {roleLabels[user.role]}
          </span>
          <div className="text-right">
            <p className="text-sm text-ink">{user.name}</p>
            <p className="text-xs text-ink-faint">
              {user.matric ?? user.title ?? user.department}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-24 pt-8">
        {showDisclaimer && <PrototypeDisclaimer />}
        {showNav && <NavTabs />}
        {loading ? (
          <div className="flex h-64 items-center justify-center animate-pulse-soft">
            <div className="flex flex-col items-center gap-4">
              <MandateMark size={32} className="text-accent/50" />
              <p className="text-sm text-ink-faint">Loading dashboard data...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  )
}
