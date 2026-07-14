interface CloseButtonProps {
  onClick: () => void
  label?: string
}

export function CloseButton({ onClick, label = 'Back' }: CloseButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-paper shadow-sm transition-opacity hover:opacity-90"
    >
      <span aria-hidden>←</span>
      {label}
    </button>
  )
}
