import { useState } from 'react'
import { useMandate, NUC_THRESHOLD } from '../../store/MandateContext'
import { formatDateWAT, formatTimeWAT } from '../../utils/format'
import type { AttendanceRecord } from '../../data/types'

interface DisputePanelProps {
  record: AttendanceRecord
  onClose: () => void
  onSubmitted: () => void
}

export function DisputePanel({ record, onClose, onSubmitted }: DisputePanelProps) {
  const { disputeRecord } = useMandate()
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!reason.trim()) return
    disputeRecord(record.id, reason.trim())
    setSubmitted(true)
    setTimeout(onSubmitted, 1800)
  }

  if (submitted) {
    return (
      <div className="mt-4 rounded-xl bg-surface px-5 py-6 animate-fade-in">
        <p className="text-sm text-ink">
          We've sent this to your HOD for review
        </p>
      </div>
    )
  }

  return (
    <div className="mt-4 rounded-xl bg-surface px-5 py-5 animate-fade-in">
      <p className="mb-3 text-sm text-ink-muted">
        Tell us what happened with this check-in
      </p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        placeholder="e.g. I was in class but had no signal"
        className="mb-3 w-full resize-none rounded-lg bg-surface-raised px-3 py-2.5 text-sm text-ink outline-none ring-1 ring-ink/5 placeholder:text-ink-faint"
      />
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!reason.trim()}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-sm text-ink-muted hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function statusLabel(status: AttendanceRecord['verificationStatus']): string {
  switch (status) {
    case 'verified':
      return 'Present'
    case 'unverified':
      return 'Unconfirmed'
    case 'disputed':
      return 'Under review'
    case 'manual':
      return 'Manual check-in'
    default:
      return 'Pending'
  }
}

interface AttendanceHistoryProps {
  records: AttendanceRecord[]
}

export function AttendanceHistory({ records }: AttendanceHistoryProps) {
  const [disputingId, setDisputingId] = useState<string | null>(null)

  if (records.length === 0) {
    return <p className="text-sm text-ink-muted">No attendance records yet.</p>
  }

  return (
    <ul className="space-y-2">
      {records.map((record) => (
        <li key={record.id}>
          <div className="rounded-xl bg-surface px-4 py-3.5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-ink">{formatDateWAT(record.timestamp)}</p>
                <p className="text-xs text-ink-faint">{formatTimeWAT(record.timestamp)}</p>
              </div>
              <span className="text-sm text-ink-muted">{statusLabel(record.verificationStatus)}</span>
            </div>

            {(record.verificationStatus === 'unverified' ||
              record.verificationStatus === 'disputed') && (
              <div className="mt-2">
                {record.verificationStatus === 'unverified' && disputingId !== record.id && (
                  <button
                    type="button"
                    onClick={() => setDisputingId(record.id)}
                    className="text-xs text-ink-muted underline decoration-ink-faint/40 underline-offset-2 hover:text-ink"
                  >
                    Dispute this record
                  </button>
                )}
                {record.verificationStatus === 'disputed' && record.disputeReason && (
                  <p className="text-xs text-ink-faint italic">"{record.disputeReason}"</p>
                )}
              </div>
            )}
          </div>

          {disputingId === record.id && (
            <DisputePanel
              record={record}
              onClose={() => setDisputingId(null)}
              onSubmitted={() => setDisputingId(null)}
            />
          )}
        </li>
      ))}
    </ul>
  )
}

interface CourseAttendanceCardProps {
  courseCode: string
  courseTitle: string
  percentage: number
}

export function CourseAttendanceCard({
  courseCode,
  courseTitle,
  percentage,
}: CourseAttendanceCardProps) {
  const belowThreshold = percentage < NUC_THRESHOLD

  return (
    <div className="rounded-xl bg-surface px-5 py-4">
      <div className="mb-3 flex items-baseline justify-between">
        <div>
          <p className="text-sm font-medium text-ink">{courseCode}</p>
          <p className="text-xs text-ink-faint">{courseTitle}</p>
        </div>
        <p
          className={`text-2xl font-medium tabular-nums ${
            belowThreshold ? 'text-danger' : 'text-accent'
          }`}
        >
          {percentage}%
        </p>
      </div>

      <div className="relative h-1.5 rounded-full bg-ink/5">
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${
            belowThreshold ? 'bg-danger/60' : 'bg-accent/70'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
        <div
          className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-ink-faint/50"
          style={{ left: `${NUC_THRESHOLD}%` }}
          title="75% NUC threshold"
        />
      </div>
      <p className="mt-2 text-xs text-ink-faint">
        {belowThreshold
          ? 'Below 75% — you may not be eligible to sit exams'
          : 'Above 75% — eligible for exams'}
      </p>
    </div>
  )
}
