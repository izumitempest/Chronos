import { useState } from 'react'
import { useMandate } from '../../store/MandateContext'
import { formatTimeWAT } from '../../utils/format'
import type { AttendanceRecord } from '../../data/types'

type CheckInPhase = 'idle' | 'confirming' | 'done'

interface CheckInFlowProps {
  classInstanceId: string
  courseCode: string
  onComplete: (record: AttendanceRecord) => void
}

export function CheckInFlow({ classInstanceId, courseCode, onComplete }: CheckInFlowProps) {
  const { checkIn } = useMandate()
  const [phase, setPhase] = useState<CheckInPhase>('idle')
  const [result, setResult] = useState<AttendanceRecord | null>(null)

  const handleCheckIn = () => {
    setPhase('confirming')
    setTimeout(() => {
      const record = checkIn(classInstanceId)
      setResult(record)
      setPhase('done')
      onComplete(record)
    }, 2200)
  }

  if (phase === 'idle') {
    return (
      <button
        type="button"
        onClick={handleCheckIn}
        className="w-full rounded-2xl bg-accent px-6 py-5 text-[15px] font-medium text-white shadow-[0_4px_20px_-6px_rgba(61,107,107,0.45)] transition-all hover:shadow-[0_6px_28px_-6px_rgba(61,107,107,0.55)] active:scale-[0.99]"
      >
        Check in
      </button>
    )
  }

  if (phase === 'confirming') {
    return (
      <div className="flex flex-col items-center rounded-2xl bg-surface px-6 py-10">
        <div className="mb-4 h-2 w-2 rounded-full bg-accent animate-pulse-soft" />
        <p className="text-sm text-ink-muted">Confirming your location…</p>
        <div className="mt-6 h-px w-32 overflow-hidden bg-ink/5">
          <div className="h-full w-1/2 bg-accent/40 animate-[slide-in_1.5s_ease-in-out_infinite_alternate]" />
        </div>
      </div>
    )
  }

  if (!result) return null

  const verified = result.verificationStatus === 'verified'

  return (
    <div
      className={`rounded-2xl px-6 py-8 animate-fade-in ${
        verified ? 'bg-success-soft' : 'bg-caution-soft'
      }`}
    >
      {verified ? (
        <>
          <p className="text-base text-ink">
            You're marked present for {courseCode}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Checked in at {formatTimeWAT(result.timestamp)}
          </p>
        </>
      ) : (
        <>
          <p className="text-base text-ink">
            We couldn't confirm your exact location — this will be reviewed
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Your lecturer and HOD can see this record
          </p>
        </>
      )}
      <p className="mt-4 text-xs text-ink-faint">
        Location data is stored securely and visible only to your lecturer and HOD.
      </p>
    </div>
  )
}

interface ManualCheckInLinkProps {
  onManual: () => void
}

export function ManualCheckInLink({ onManual }: ManualCheckInLinkProps) {
  return (
    <button
      type="button"
      onClick={onManual}
      className="mt-4 text-sm text-ink-muted underline decoration-ink-faint/40 underline-offset-2 transition-colors hover:text-ink"
    >
      Check in manually if location isn't working
    </button>
  )
}
