import { useState } from 'react'
import { useMandate } from '../store/MandateContext'

export function DemoControls() {
  const { demo, setDemo } = useMandate()
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-2 w-64 rounded-xl border border-dashed border-ink-faint/40 bg-[#F0EDE8] p-4 shadow-sm animate-fade-in">
          <p className="mb-3 text-xs text-ink-muted">Demo controls</p>

          <label className="mb-3 block">
            <span className="mb-1 block text-xs text-ink-faint">Check-in outcome</span>
            <select
              value={demo.locationOutcome}
              onChange={(e) =>
                setDemo({ locationOutcome: e.target.value as typeof demo.locationOutcome })
              }
              className="w-full rounded-lg bg-surface-raised px-3 py-2 text-sm text-ink outline-none ring-1 ring-ink/5"
            >
              <option value="verified">Location confirmed</option>
              <option value="unverified">Location unconfirmed</option>
              <option value="manual_fail">Manual check-in fails</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-ink-faint">Roster fill speed</span>
            <select
              value={demo.rosterSpeed}
              onChange={(e) =>
                setDemo({ rosterSpeed: e.target.value as 'normal' | 'fast' })
              }
              className="w-full rounded-lg bg-surface-raised px-3 py-2 text-sm text-ink outline-none ring-1 ring-ink/5"
            >
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
            </select>
          </label>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded-full border border-dashed border-ink-faint/50 bg-[#F0EDE8] px-3 py-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
      >
        Demo
      </button>
    </div>
  )
}
