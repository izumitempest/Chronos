import type { ReactNode } from 'react'
import { useMandate } from '../store/MandateContext'
import { MandateMark } from './MandateMark'
import type { Role } from '../data/types'

interface LayoutProps {
  children: ReactNode
  title?: string
}

const roleLabels: Record<Role, string> = {
  student: 'Student',
  lecturer: 'Lecturer',
  admin: 'HOD',
}

export function Layout({ children, title }: LayoutProps) {
  const { state, goHome } = useMandate()
  const user = state.currentUser

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-3xl items-center justify-between border-b border-ink/[0.04] px-6 py-5">
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

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-10">
        {title && (
          <h1 className="mb-10 text-[1.75rem] font-medium tracking-tight text-ink">{title}</h1>
        )}
        {children}
      </main>
    </div>
  )
}
