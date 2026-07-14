import { useState } from 'react'
import { Layout } from '../Layout'
import { CourseOverview, CourseDetailPanel } from './DepartmentOverview'
import { ApprovalsList, FlaggedRecords, ActivityLog } from './AdminSections'
export function AdminView() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)

  return (
    <Layout>
      <h1 className="mb-2 text-[1.75rem] font-medium text-ink">Computer Science</h1>
      <section className="mb-12">
        <h2 className="mb-1 text-lg font-medium text-ink">Department overview</h2>
        <p className="mb-6 text-sm text-ink-muted">
          Nigerian universities require 75% attendance to sit exams. Each bar shows how
          many enrolled students are above that line.
        </p>
        <CourseOverview onSelectCourse={setSelectedCourse} />
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-lg font-medium text-ink">Approvals</h2>
        <ApprovalsList />
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-lg font-medium text-ink">Flagged records</h2>
        <FlaggedRecords />
      </section>

      <section>
        <h2 className="mb-4 text-sm font-medium text-ink-muted">Recent activity</h2>
        <ActivityLog />
      </section>

      {selectedCourse && (
        <CourseDetailPanel
          courseCode={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </Layout>
  )
}
