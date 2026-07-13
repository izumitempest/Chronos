import { Layout } from '../Layout'
import { LiveRoster } from './LiveRoster'
import { ProposeClassTime } from './ProposeClassTime'
import { useChronos } from '../../store/ChronosContext'
import { formatClassTime } from '../../utils/format'

export function LecturerView() {
  const { state } = useChronos()
  const activeClass = state.classInstances.find((c) => c.status === 'active')

  return (
    <Layout title="Today's class">
      {activeClass ? (
        <>
          <section className="mb-10">
            <h2 className="mb-1 text-xl font-medium text-ink">
              {activeClass.courseCode} · {activeClass.courseTitle}
            </h2>
            <p className="mb-1 text-sm text-ink-muted">{activeClass.venue}</p>
            <p className="mb-8 text-sm text-ink-faint">
              {formatClassTime(activeClass.classStartAt)}
            </p>

            <LiveRoster
              courseCode={activeClass.courseCode}
              classInstanceId={activeClass.id}
            />
          </section>

          <section>
            <h2 className="mb-4 text-lg font-medium text-ink">Schedule</h2>
            <ProposeClassTime />
          </section>
        </>
      ) : (
        <p className="text-sm text-ink-muted">No active class session right now.</p>
      )}
    </Layout>
  )
}
