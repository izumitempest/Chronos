export function formatTimeWAT(iso: string): string {
  const date = new Date(iso)
  return (
    date.toLocaleTimeString('en-NG', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Africa/Lagos',
    }) + ' WAT'
  )
}

export function formatDateWAT(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString('en-NG', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'Africa/Lagos',
  })
}

export function formatRelativeMinutes(targetIso: string): string {
  const now = Date.now()
  const target = new Date(targetIso).getTime()
  const diffMs = target - now
  const diffMin = Math.round(diffMs / 60000)

  if (diffMin <= 0) return 'Open now'
  if (diffMin === 1) return 'Opens in 1 min'
  if (diffMin < 60) return `Opens in ${diffMin} min`

  const hours = Math.floor(diffMin / 60)
  const mins = diffMin % 60
  if (mins === 0) return `Opens in ${hours} hr`
  return `Opens in ${hours} hr ${mins} min`
}

export function formatClassTime(iso: string): string {
  const date = new Date(iso)
  const time = date.toLocaleTimeString('en-NG', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Africa/Lagos',
  })
  const day = date.toLocaleDateString('en-NG', {
    weekday: 'long',
    timeZone: 'Africa/Lagos',
  })
  return `${day}, ${time}`
}

export function classStartsIn(iso: string): string {
  const now = Date.now()
  const target = new Date(iso).getTime()
  const diffMin = Math.round((target - now) / 60000)

  if (diffMin <= 0) return 'Class has started'
  if (diffMin === 1) return 'Your class starts in 1 minute'
  if (diffMin < 60) return `Your class starts in ${diffMin} minutes`
  const hours = Math.floor(diffMin / 60)
  return `Your class starts in ${hours} hour${hours > 1 ? 's' : ''}`
}

export function minutesUntil(iso: string): number {
  return Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 60000))
}

export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}
