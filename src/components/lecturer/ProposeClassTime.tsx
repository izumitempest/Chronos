import { useState } from 'react'
import { useChronos } from '../../store/ChronosContext'
import { COURSES } from '../../data/seedData'

export function ProposeClassTime() {
  const { proposeClassTime } = useChronos()
  const [courseCode, setCourseCode] = useState('CSC 401')
  const [day, setDay] = useState('Thursday')
  const [time, setTime] = useState('11:00 AM')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    proposeClassTime(courseCode, day, time)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="rounded-xl bg-surface px-5 py-6">
        <p className="text-sm text-ink">Waiting for department approval</p>
        <p className="mt-1 text-xs text-ink-faint">
          {courseCode} · {day} at {time}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl bg-surface px-5 py-5">
      <p className="mb-4 text-sm text-ink-muted">Propose a class time</p>

      <div className="mb-3">
        <label className="mb-1 block text-xs text-ink-faint">Course</label>
        <select
          value={courseCode}
          onChange={(e) => setCourseCode(e.target.value)}
          className="w-full rounded-lg bg-surface-raised px-3 py-2 text-sm text-ink outline-none ring-1 ring-ink/5"
        >
          {COURSES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} — {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-ink-faint">Day</label>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-full rounded-lg bg-surface-raised px-3 py-2 text-sm text-ink outline-none ring-1 ring-ink/5"
          >
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-faint">Time</label>
          <input
            type="text"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded-lg bg-surface-raised px-3 py-2 text-sm text-ink outline-none ring-1 ring-ink/5"
          />
        </div>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
      >
        Submit proposal
      </button>
    </form>
  )
}
