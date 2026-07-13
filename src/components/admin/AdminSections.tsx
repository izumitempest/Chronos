import { useState } from 'react'
import { useMandate } from '../../store/MandateContext'
import { formatDateWAT } from '../../utils/format'

export function ApprovalsList() {
  const { state, approveProposal, declineProposal } = useMandate()
  const pending = state.classTimeProposals.filter((p) => p.status === 'pending')

  if (pending.length === 0) {
    return <p className="text-sm text-ink-muted">No pending approvals.</p>
  }

  return (
    <ul className="space-y-3">
      {pending.map((proposal) => (
        <li key={proposal.id} className="rounded-xl bg-surface px-5 py-4">
          <p className="text-sm font-medium text-ink">{proposal.courseCode}</p>
          <p className="text-sm text-ink-muted">
            {proposal.proposedDay} at {proposal.proposedTime}
          </p>
          <p className="mt-1 text-xs text-ink-faint">
            Proposed by {proposal.proposedBy} · {formatDateWAT(proposal.submittedAt)}
          </p>
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={() => approveProposal(proposal.id)}
              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => declineProposal(proposal.id)}
              className="rounded-lg px-3 py-1.5 text-xs text-ink-muted hover:text-ink"
            >
              Decline
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function FlaggedRecords() {
  const { state, resolveDispute } = useMandate()
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [note, setNote] = useState('')

  const disputed = state.attendanceRecords.filter(
    (r) => r.verificationStatus === 'disputed',
  )

  if (disputed.length === 0) {
    return <p className="text-sm text-ink-muted">No flagged records.</p>
  }

  const handleResolve = (recordId: string) => {
    if (!note.trim()) return
    resolveDispute(recordId, note.trim())
    setResolvingId(null)
    setNote('')
  }

  return (
    <ul className="space-y-3">
      {disputed.map((record) => (
        <li key={record.id} className="rounded-xl bg-surface px-5 py-4">
          <p className="text-sm text-ink">{record.studentName}</p>
          <p className="text-xs text-ink-faint">
            {formatDateWAT(record.timestamp)}
          </p>
          {record.disputeReason && (
            <p className="mt-2 text-sm text-ink-muted italic">
              "{record.disputeReason}"
            </p>
          )}

          {resolvingId === record.id ? (
            <div className="mt-3">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Resolution note"
                className="mb-2 w-full resize-none rounded-lg bg-surface-raised px-3 py-2 text-sm outline-none ring-1 ring-ink/5"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleResolve(record.id)}
                  className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white"
                >
                  Resolve
                </button>
                <button
                  type="button"
                  onClick={() => setResolvingId(null)}
                  className="px-3 py-1.5 text-xs text-ink-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setResolvingId(record.id)}
              className="mt-2 text-xs text-accent hover:underline"
            >
              Resolve
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}

export function ActivityLog() {
  const { state } = useMandate()

  return (
    <ul className="space-y-2">
      {state.activityLog.slice(0, 8).map((entry) => (
        <li key={entry.id} className="flex gap-3 text-xs text-ink-faint">
          <span className="shrink-0 tabular-nums">
            {new Date(entry.timestamp).toLocaleTimeString('en-NG', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
              timeZone: 'Africa/Lagos',
            })}
          </span>
          <span>{entry.message}</span>
        </li>
      ))}
    </ul>
  )
}
