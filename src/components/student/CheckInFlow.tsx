import { useState } from 'react'
import { useMandate } from '../../store/MandateContext'
import { formatTimeWAT } from '../../utils/format'
import { VERIFICATION_V1 } from '../../data/constants'
import type { AttendanceRecord } from '../../data/types'

type CheckInPhase = 'idle' | 'confirming' | 'done' | 'manual' | 'manual-failed' | 'lecturer-sent'

interface CheckInFlowProps {
  classInstanceId: string
  courseCode: string
  onComplete: (record: AttendanceRecord | null) => void
}

export function CheckInFlow({ classInstanceId, courseCode, onComplete }: CheckInFlowProps) {
  const { checkIn, manualCheckIn, requestLecturerMark } = useMandate()
  const [phase, setPhase] = useState<CheckInPhase>('idle')
  const [result, setResult] = useState<AttendanceRecord | null>(null)

  const handleAutoCheckIn = () => {
    setPhase('confirming')
    setTimeout(async () => {
      const record = await checkIn(classInstanceId)
      setResult(record)
      setPhase('done')
      onComplete(record)
    }, 2200)
  }

  const handleManual = () => {
    setPhase('manual')
    setTimeout(async () => {
      const record = await manualCheckIn(classInstanceId)
      if (record) {
        setResult(record)
        setPhase('done')
        onComplete(record)
      } else {
        setPhase('manual-failed')
        onComplete(null)
      }
    }, 1200)
  }

  const handleLecturerRequest = () => {
    requestLecturerMark(classInstanceId)
    setPhase('lecturer-sent')
    onComplete(null)
  }

  if (phase === 'idle') {
    return (
      <div>
        <button
          type="button"
          onClick={handleAutoCheckIn}
          className="w-full rounded-2xl bg-accent px-6 py-5 text-[15px] font-medium text-white shadow-[0_4px_20px_-6px_rgba(61,107,107,0.45)] transition-all hover:shadow-[0_6px_28px_-6px_rgba(61,107,107,0.55)] active:scale-[0.99]"
        >
          Check in
        </button>
        <p className="mt-4 text-xs leading-relaxed text-ink-faint">
          Background attendance runs when your phone allows it. If it did not record you,
          use manual check-in below.
        </p>
        <button
          type="button"
          onClick={handleManual}
          className="mt-3 text-sm text-ink-muted underline decoration-ink-faint/40 underline-offset-2 hover:text-ink"
        >
          Check in manually in the app
        </button>
        <details className="mt-6 text-xs text-ink-faint">
          <summary className="cursor-pointer text-ink-muted">{VERIFICATION_V1.title}</summary>
          <ul className="mt-2 list-inside list-disc space-y-1">
            {VERIFICATION_V1.layers.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <p className="mt-2">{VERIFICATION_V1.note}</p>
        </details>
      </div>
    )
  }

  if (phase === 'confirming' || phase === 'manual') {
    return (
      <div className="flex flex-col items-center rounded-2xl bg-surface px-6 py-10">
        <div className="mb-4 h-2 w-2 rounded-full bg-accent animate-pulse-soft" />
        <p className="text-sm text-ink-muted">
          {phase === 'manual' ? 'Recording manual check-in…' : 'Confirming your location…'}
        </p>
      </div>
    )
  }

  if (phase === 'manual-failed') {
    return (
      <div className="rounded-2xl bg-caution-soft px-6 py-8 animate-fade-in">
        <p className="text-base text-ink">Manual check-in could not complete</p>
        <p className="mt-1 text-sm text-ink-muted">
          This can happen when the app cannot verify campus Wi-Fi or location.
        </p>
        <button
          type="button"
          onClick={handleLecturerRequest}
          className="mt-4 rounded-xl bg-accent px-4 py-3 text-sm font-medium text-white"
        >
          Ask lecturer to mark me present
        </button>
      </div>
    )
  }

  if (phase === 'lecturer-sent') {
    return (
      <div className="rounded-2xl bg-surface px-6 py-8 animate-fade-in">
        <p className="text-base text-ink">Request sent to your lecturer</p>
        <p className="mt-1 text-sm text-ink-muted">
          They will see your name on today's roster for {courseCode}.
        </p>
      </div>
    )
  }

  if (!result) return null
  const verified = result.verificationStatus === 'verified'

  return (
    <div className={`rounded-2xl px-6 py-8 animate-fade-in ${verified ? 'bg-success-soft' : 'bg-caution-soft'}`}>
      {verified ? (
        <>
          <p className="text-base text-ink">You're marked present for {courseCode}</p>
          <p className="mt-1 text-sm text-ink-muted">Checked in at {formatTimeWAT(result.timestamp)}</p>
        </>
      ) : result.presenceMethod === 'manual_student' ? (
        <>
          <p className="text-base text-ink">Manual check-in recorded for {courseCode}</p>
          <p className="mt-1 text-sm text-ink-muted">Checked in at {formatTimeWAT(result.timestamp)}</p>
        </>
      ) : (
        <>
          <p className="text-base text-ink">We couldn't confirm your exact location — this will be reviewed</p>
          <p className="mt-1 text-sm text-ink-muted">Your lecturer and HOD can see this record</p>
        </>
      )}
    </div>
  )
}

export function ManualCheckInLink({ onManual }: { onManual: () => void }) {
  return (
    <button
      type="button"
      onClick={onManual}
      className="mt-4 text-sm text-ink-muted underline decoration-ink-faint/40 underline-offset-2 hover:text-ink"
    >
      Check in manually if background attendance did not run
    </button>
  )
}
