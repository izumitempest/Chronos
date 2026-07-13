import { useMandate } from '../store/MandateContext'
import { MandateMark } from './MandateMark'
import type { Role } from '../data/types'

const roles: { role: Role; label: string; description: string }[] = [
  {
    role: 'student',
    label: 'Student',
    description: 'Check in, view attendance, flag records',
  },
  {
    role: 'lecturer',
    label: 'Lecturer',
    description: "Today's class roster and manual overrides",
  },
  {
    role: 'admin',
    label: 'Admin',
    description: 'Department overview and approvals',
  },
]

export function EntryScreen() {
  const { switchRole } = useMandate()

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-16">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-10 flex items-center gap-3">
          <MandateMark size={28} className="text-accent" />
          <span className="text-sm text-ink-faint">Godfrey Okoye University</span>
        </div>

        <h1 className="mb-4 text-[2.5rem] font-medium leading-[1.1] tracking-tight text-ink">
          Mandate
        </h1>
        <p className="mb-14 max-w-md text-balance text-[15px] leading-relaxed text-ink-muted">
          Location-verified attendance for real campus conditions — patchy Wi-Fi,
          low-end phones, and the NUC 75% rule.
        </p>

        <p className="section-label mb-4">Continue as</p>
        <div className="space-y-2.5">
          {roles.map(({ role, label, description }) => (
            <button
              key={role}
              type="button"
              onClick={() => switchRole(role)}
              className="role-card group"
            >
              <span className="block text-[15px] font-medium text-ink">{label}</span>
              <span className="mt-0.5 block text-sm text-ink-muted">{description}</span>
            </button>
          ))}
        </div>

        <p className="mt-20 text-xs text-ink-faint">
          Enugu · Hackoholics 7.0 pilot
        </p>
      </div>
    </div>
  )
}
