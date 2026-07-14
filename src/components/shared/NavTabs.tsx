import { navForRole } from '../../navigation/pages'
import { useMandate } from '../../store/MandateContext'


export function NavTabs() {
  const { state, page, navigate } = useMandate()
  const items = navForRole(state.currentUser.role)

  if (items.length <= 1) return null

  return (
    <nav className="mb-8 flex gap-1 overflow-x-auto pb-1">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => navigate(item.id)}
          className={`shrink-0 rounded-lg px-3 py-2 text-sm transition-colors ${
            page.id === item.id
              ? 'bg-accent text-white'
              : 'text-ink-muted hover:bg-surface hover:text-ink'
          }`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}

export function PageHeader({
  title,
  subtitle,
  showBack,
}: {
  title: string
  subtitle?: string
  showBack?: boolean
}) {
  const { goBack, canGoBack } = useMandate()

  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div>
        {showBack && canGoBack && (
          <button
            type="button"
            onClick={goBack}
            className="mb-3 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-medium text-paper"
          >
            ← Back
          </button>
        )}
        <h1 className="text-[1.75rem] font-medium tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
      </div>
    </div>
  )
}

export function ReportButton({
  label,
  onExport,
  onView,
}: {
  label: string
  onExport: () => void
  onView?: () => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface/80 px-5 py-4">
      <span className="text-sm text-ink">{label}</span>
      <div className="flex gap-2">
        {onView && (
          <button type="button" onClick={onView} className="rounded-lg px-3 py-1.5 text-xs text-accent hover:underline">
            View page
          </button>
        )}
        <button
          type="button"
          onClick={onExport}
          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white"
        >
          Download Excel
        </button>
      </div>
    </div>
  )
}

export function PanelOverlay({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode
  onClose: () => void
  title: string
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink/15 backdrop-blur-[1px]" onClick={onClose} aria-hidden />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-paper shadow-xl animate-slide-in">
        <div className="flex items-center justify-between border-b border-ink/[0.06] px-6 py-4">
          <h2 className="text-lg font-medium text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-paper"
          >
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
      </aside>
    </>
  )
}
