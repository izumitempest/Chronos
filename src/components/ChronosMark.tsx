interface ChronosMarkProps {
  className?: string
  size?: number
}

/** Quiet arc mark — time, not security */
export function ChronosMark({ className = '', size = 20 }: ChronosMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
      <path
        d="M12 12 L12 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 12 L17 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" />
    </svg>
  )
}
