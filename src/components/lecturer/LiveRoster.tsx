import { useEffect, useMemo, useRef, useState } from 'react'
import { useMandate } from '../../store/MandateContext'
import type { Enrollment } from '../../data/types'

type RosterStatus = 'waiting' | 'present' | 'unconfirmed' | 'manual'

interface RosterEntry {
  student: Enrollment
  status: RosterStatus
}

interface LiveRosterProps {
  courseCode: string
  classInstanceId: string
}

export function LiveRoster({ courseCode, classInstanceId }: LiveRosterProps) {
  const { state, demo, markPresentManually, fulfillLecturerRequest } = useMandate()
  const [roster, setRoster] = useState<RosterEntry[]>([])
  const initialized = useRef(false)

  const students = state.enrollments[courseCode] ?? []

  const pendingRequestIds = useMemo(
    () =>
      new Set(
        state.lecturerRequests
          .filter((r) => r.classInstanceId === classInstanceId && r.status === 'pending')
          .map((r) => r.studentId),
      ),
    [state.lecturerRequests, classInstanceId],
  )

  const requestByStudent = useMemo(() => {
    const map = new Map<string, string>()
    state.lecturerRequests
      .filter((r) => r.classInstanceId === classInstanceId && r.status === 'pending')
      .forEach((r) => map.set(r.studentId, r.id))
    return map
  }, [state.lecturerRequests, classInstanceId])

  const checkedInIds = useMemo(
    () =>
      new Set(
        state.attendanceRecords
          .filter((r) => r.classInstanceId === classInstanceId)
          .map((r) => r.studentId),
      ),
    [state.attendanceRecords, classInstanceId],
  )

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const entries: RosterEntry[] = students.map((s) => {
      if (checkedInIds.has(s.studentId)) {
        const record = state.attendanceRecords.find(
          (r) => r.classInstanceId === classInstanceId && r.studentId === s.studentId,
        )
        const status: RosterStatus =
          record?.presenceMethod === 'manual_lecturer'
            ? 'manual'
            : record?.verificationStatus === 'unverified'
              ? 'unconfirmed'
              : 'present'
        return { student: s, status }
      }
      return { student: s, status: 'waiting' as RosterStatus }
    })
    setRoster(entries)

    const waiting = entries.filter((e) => e.status === 'waiting')
    const belowCount = students.filter((s) => s.attendancePct < 75).length
    const unconfirmedTarget = Math.max(1, Math.round(belowCount * 0.35))

    const shuffled = [...waiting].sort(() => Math.random() - 0.5)
    let unconfirmedAssigned = 0

    const unconfirmedSet = new Set<string>()
    for (const entry of shuffled) {
      if (
        unconfirmedAssigned < unconfirmedTarget &&
        entry.student.attendancePct < 75 &&
        Math.random() > 0.45
      ) {
        unconfirmedSet.add(entry.student.studentId)
        unconfirmedAssigned++
      }
    }

    shuffled.forEach((entry, index) => {
      const baseDelay = demo.rosterSpeed === 'fast' ? 200 : 600
      const delay =
        baseDelay +
        Math.random() * (demo.rosterSpeed === 'fast' ? 800 : 2400) +
        index * 120

      setTimeout(() => {
        setRoster((prev) =>
          prev.map((r) => {
            if (r.student.studentId !== entry.student.studentId) return r
            if (r.status !== 'waiting') return r
            return {
              ...r,
              status: unconfirmedSet.has(entry.student.studentId)
                ? 'unconfirmed'
                : 'present',
            }
          }),
        )
      }, delay)
    })
  }, [
    courseCode,
    classInstanceId,
    students,
    demo.rosterSpeed,
    checkedInIds,
    state.attendanceRecords,
  ])

  // React to new check-ins after mount
  useEffect(() => {
    if (!initialized.current) return
    setRoster((prev) =>
      prev.map((r) => {
        if (r.status !== 'waiting') return r
        if (!checkedInIds.has(r.student.studentId)) return r
        const record = state.attendanceRecords.find(
          (rec) =>
            rec.classInstanceId === classInstanceId &&
            rec.studentId === r.student.studentId,
        )
        if (!record) return r
        const status: RosterStatus =
          record.presenceMethod === 'manual_lecturer'
            ? 'manual'
            : record.verificationStatus === 'unverified'
              ? 'unconfirmed'
              : 'present'
        return { ...r, status }
      }),
    )
  }, [checkedInIds, classInstanceId, state.attendanceRecords])

  const presentCount = roster.filter(
    (r) => r.status === 'present' || r.status === 'manual',
  ).length
  const waitingCount = roster.filter((r) => r.status === 'waiting').length

  function statusText(status: RosterStatus): string {
    switch (status) {
      case 'waiting':
        return 'Waiting'
      case 'present':
        return 'Present'
      case 'unconfirmed':
        return 'Unconfirmed'
      case 'manual':
        return 'Marked manually'
    }
  }

  return (
    <div>
      <p className="mb-6 text-sm text-ink-muted">
        {presentCount} of {students.length} checked in
        {waitingCount > 0 && ` · ${waitingCount} still arriving`}
      </p>

      <ul className="space-y-1">
        {roster.map((entry) => (
          <li
            key={entry.student.studentId}
            className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors duration-500"
            style={{
              backgroundColor:
                entry.status === 'waiting'
                  ? 'transparent'
                  : entry.status === 'present' || entry.status === 'manual'
                    ? 'rgba(237, 244, 239, 0.6)'
                    : 'rgba(251, 246, 232, 0.6)',
            }}
          >
            <div className="flex items-center gap-3">
              {entry.status === 'waiting' ? (
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink-faint/30" />
              ) : entry.status === 'present' || entry.status === 'manual' ? (
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
              ) : (
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-caution" />
              )}
              <span className="text-sm text-ink">{entry.student.name}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-faint">{statusText(entry.status)}</span>
              {(entry.status === 'waiting' || entry.status === 'unconfirmed') && (
                <button
                  type="button"
                  onClick={() => {
                    markPresentManually(entry.student.studentId, classInstanceId)
                    setRoster((prev) =>
                      prev.map((r) =>
                        r.student.studentId === entry.student.studentId
                          ? { ...r, status: 'manual' }
                          : r,
                      ),
                    )
                  }}
                  className="text-xs text-accent hover:underline"
                >
                  Mark present
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
