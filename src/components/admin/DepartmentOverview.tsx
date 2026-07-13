import { useMandate, NUC_THRESHOLD } from '../../store/MandateContext'
import type { Enrollment, ThresholdSummary } from '../../data/types'

interface CourseOverviewProps {
  onSelectCourse: (courseCode: string) => void
}

export function CourseOverview({ onSelectCourse }: CourseOverviewProps) {
  const { thresholdSummaries } = useMandate()

  return (
    <div className="space-y-5">
      {thresholdSummaries.map((summary) => (
        <CourseBar
          key={summary.courseCode}
          summary={summary}
          onClick={() => onSelectCourse(summary.courseCode)}
        />
      ))}
    </div>
  )
}

function CourseBar({
  summary,
  onClick,
}: {
  summary: ThresholdSummary
  onClick: () => void
}) {
  const pctAbove =
    summary.totalEnrolled > 0
      ? Math.round((summary.studentsAbove75 / summary.totalEnrolled) * 100)
      : 0
  const hasRisk = summary.studentsBelow75 > 0

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-xl bg-surface/80 px-5 py-4 text-left backdrop-blur-sm transition-all hover:bg-surface-raised hover:shadow-[0_4px_20px_-10px_rgba(26,29,34,0.1)]"
    >
      <div className="mb-3 flex items-baseline justify-between">
        <div>
          <p className="text-sm font-medium text-ink">{summary.courseCode}</p>
          <p className="text-xs text-ink-faint">{summary.courseTitle}</p>
        </div>
        <p className="text-sm text-ink-muted">
          {summary.studentsAbove75}/{summary.totalEnrolled} eligible
        </p>
      </div>

      <div className="relative h-2 rounded-full bg-ink/5">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all ${
            hasRisk ? 'bg-accent/50' : 'bg-accent/70'
          }`}
          style={{ width: `${pctAbove}%` }}
        />
        <div
          className="absolute top-1/2 h-4 w-px -translate-y-1/2 bg-ink-faint/40"
          style={{ left: `${NUC_THRESHOLD}%` }}
        />
      </div>

      {hasRisk && (
        <p className="mt-2 text-xs text-danger">
          {summary.studentsBelow75} student{summary.studentsBelow75 > 1 ? 's' : ''} below 75%
        </p>
      )}

      <p className="mt-1 text-xs text-ink-faint opacity-0 transition-opacity group-hover:opacity-100">
        View student list
      </p>
    </button>
  )
}

interface CourseDetailPanelProps {
  courseCode: string
  onClose: () => void
}

export function CourseDetailPanel({ courseCode, onClose }: CourseDetailPanelProps) {
  const { state, thresholdSummaries } = useMandate()
  const students = state.enrollments[courseCode] ?? []
  const summary = thresholdSummaries.find((s) => s.courseCode === courseCode)

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-ink/10 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden
      />
      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-paper shadow-lg animate-slide-in">
        <div className="px-6 py-8">
          <button
            type="button"
            onClick={onClose}
            className="mb-6 text-sm text-ink-muted hover:text-ink"
          >
            Close
          </button>

          <h2 className="mb-1 text-xl font-medium text-ink">{courseCode}</h2>
          <p className="mb-1 text-sm text-ink-muted">{summary?.courseTitle}</p>
          <p className="mb-8 text-xs text-ink-faint">
            {summary?.studentsAbove75} of {summary?.totalEnrolled} eligible for exams
          </p>

          <ul className="space-y-2">
            {students.map((student) => (
              <StudentRow key={student.studentId} student={student} />
            ))}
          </ul>

          <p className="mt-8 text-xs text-ink-faint">
            Visible to HOD, Dean, and Vice-Chancellor. Lecturers see their own courses only.
          </p>
        </div>
      </aside>
    </>
  )
}

function StudentRow({ student }: { student: Enrollment }) {
  const eligible = student.attendancePct >= NUC_THRESHOLD

  return (
    <li className="flex items-center justify-between rounded-lg px-4 py-3 bg-surface">
      <span className="text-sm text-ink">{student.name}</span>
      <div className="flex items-center gap-3">
        <span
          className={`text-sm font-medium tabular-nums ${
            eligible ? 'text-ink-muted' : 'text-danger'
          }`}
        >
          {student.attendancePct}%
        </span>
        <span className="text-xs text-ink-faint">
          {eligible ? 'Eligible for exams' : 'Not eligible'}
        </span>
      </div>
    </li>
  )
}
