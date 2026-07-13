import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  computeThresholdSummaries,
  createInitialState,
  NUC_THRESHOLD,
  users,
} from '../data/seedData'
import type {
  AttendanceRecord,
  MandateState,
  DemoSettings,
  Role,
  ThresholdSummary,
  VerificationStatus,
} from '../data/types'
import { uid } from '../utils/format'

interface MandateContextValue {
  state: MandateState
  thresholdSummaries: ThresholdSummary[]
  demo: DemoSettings
  setDemo: (settings: Partial<DemoSettings>) => void
  switchRole: (role: Role) => void
  goHome: () => void
  isAtHome: boolean
  checkIn: (classInstanceId: string) => AttendanceRecord
  manualCheckIn: (classInstanceId: string) => AttendanceRecord
  disputeRecord: (recordId: string, reason: string) => void
  resolveDispute: (recordId: string, note: string) => void
  markPresentManually: (studentId: string, classInstanceId: string) => void
  proposeClassTime: (courseCode: string, day: string, time: string) => void
  approveProposal: (proposalId: string) => void
  declineProposal: (proposalId: string) => void
  getStudentRecords: (studentId: string) => AttendanceRecord[]
  getCourseAttendance: (studentId: string) => { courseCode: string; courseTitle: string; percentage: number }[]
}

const MandateContext = createContext<MandateContextValue | null>(null)

export function MandateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MandateState>(createInitialState)
  const [isAtHome, setIsAtHome] = useState(true)
  const [demo, setDemoState] = useState<DemoSettings>({
    locationOutcome: 'verified',
    rosterSpeed: 'normal',
  })

  const thresholdSummaries = useMemo(
    () => computeThresholdSummaries(state.enrollments),
    [state.enrollments],
  )

  const setDemo = useCallback((settings: Partial<DemoSettings>) => {
    setDemoState((prev) => ({ ...prev, ...settings }))
  }, [])

  const addActivity = useCallback((message: string) => {
    setState((prev) => ({
      ...prev,
      activityLog: [
        {
          id: uid('act'),
          timestamp: new Date().toISOString(),
          message,
        },
        ...prev.activityLog,
      ].slice(0, 20),
    }))
  }, [])

  const switchRole = useCallback((role: Role) => {
    setState((prev) => ({
      ...prev,
      currentUser: users[role],
    }))
    setIsAtHome(false)
  }, [])

  const goHome = useCallback(() => {
    setIsAtHome(true)
  }, [])

  const checkIn = useCallback(
    (classInstanceId: string): AttendanceRecord => {
      const ci = state.classInstances.find((c) => c.id === classInstanceId)
      const user = state.currentUser
      const verified = demo.locationOutcome === 'verified'
      const status: VerificationStatus = verified ? 'verified' : 'unverified'

      const record: AttendanceRecord = {
        id: uid('ar'),
        classInstanceId,
        studentId: 's1',
        studentName: user.name,
        presenceMethod: 'autonomous_gaa',
        verificationStatus: status,
        accuracyMetres: verified ? 14 : 312,
        timestamp: new Date().toISOString(),
        disputeReason: null,
      }

      setState((prev) => ({
        ...prev,
        attendanceRecords: [record, ...prev.attendanceRecords],
        pendingSyncCount: Math.max(0, prev.pendingSyncCount - 1),
      }))

      addActivity(
        verified
          ? `${user.name} checked in to ${ci?.courseCode ?? 'class'} — location confirmed`
          : `${user.name} checked in to ${ci?.courseCode ?? 'class'} — location unconfirmed`,
      )

      return record
    },
    [state.classInstances, state.currentUser, demo.locationOutcome, addActivity],
  )

  const manualCheckIn = useCallback(
    (classInstanceId: string): AttendanceRecord => {
      const ci = state.classInstances.find((c) => c.id === classInstanceId)
      const user = state.currentUser

      const record: AttendanceRecord = {
        id: uid('ar'),
        classInstanceId,
        studentId: 's1',
        studentName: user.name,
        presenceMethod: 'manual_student',
        verificationStatus: 'manual',
        accuracyMetres: null,
        timestamp: new Date().toISOString(),
        disputeReason: null,
      }

      setState((prev) => ({
        ...prev,
        attendanceRecords: [record, ...prev.attendanceRecords],
      }))

      addActivity(`${user.name} used manual check-in for ${ci?.courseCode ?? 'class'}`)
      return record
    },
    [state.classInstances, state.currentUser, addActivity],
  )

  const disputeRecord = useCallback(
    (recordId: string, reason: string) => {
      setState((prev) => ({
        ...prev,
        attendanceRecords: prev.attendanceRecords.map((r) =>
          r.id === recordId
            ? { ...r, verificationStatus: 'disputed' as const, disputeReason: reason }
            : r,
        ),
      }))
      const record = state.attendanceRecords.find((r) => r.id === recordId)
      addActivity(`${state.currentUser.name} disputed an attendance record`)
      if (record) {
        addActivity(`${record.studentName} flagged a record for review`)
      }
    },
    [state.attendanceRecords, state.currentUser.name, addActivity],
  )

  const resolveDispute = useCallback(
    (recordId: string, note: string) => {
      setState((prev) => ({
        ...prev,
        attendanceRecords: prev.attendanceRecords.map((r) =>
          r.id === recordId
            ? {
                ...r,
                verificationStatus: 'verified' as const,
                hodNote: note,
              }
            : r,
        ),
      }))
      addActivity(`HOD resolved a flagged attendance record`)
    },
    [addActivity],
  )

  const markPresentManually = useCallback(
    (studentId: string, classInstanceId: string) => {
      const student = Object.values(state.enrollments)
        .flat()
        .find((s) => s.studentId === studentId)
      const ci = state.classInstances.find((c) => c.id === classInstanceId)

      const record: AttendanceRecord = {
        id: uid('ar'),
        classInstanceId,
        studentId,
        studentName: student?.name ?? 'Unknown',
        presenceMethod: 'manual_lecturer',
        verificationStatus: 'manual',
        accuracyMetres: null,
        timestamp: new Date().toISOString(),
        disputeReason: null,
      }

      setState((prev) => ({
        ...prev,
        attendanceRecords: [record, ...prev.attendanceRecords],
      }))

      addActivity(
        `${state.currentUser.name} marked ${student?.name ?? 'a student'} present for ${ci?.courseCode ?? 'class'}`,
      )
    },
    [state.enrollments, state.classInstances, state.currentUser.name, addActivity],
  )

  const proposeClassTime = useCallback(
    (courseCode: string, day: string, time: string) => {
      const proposal = {
        id: uid('ctp'),
        courseCode,
        proposedBy: state.currentUser.name,
        proposedDay: day,
        proposedTime: time,
        status: 'pending' as const,
        submittedAt: new Date().toISOString(),
      }

      setState((prev) => ({
        ...prev,
        classTimeProposals: [proposal, ...prev.classTimeProposals],
      }))

      addActivity(`${state.currentUser.name} proposed a new time for ${courseCode}`)
    },
    [state.currentUser.name, addActivity],
  )

  const approveProposal = useCallback(
    (proposalId: string) => {
      setState((prev) => ({
        ...prev,
        classTimeProposals: prev.classTimeProposals.map((p) =>
          p.id === proposalId ? { ...p, status: 'approved' as const } : p,
        ),
      }))
      addActivity('HOD approved a class time proposal')
    },
    [addActivity],
  )

  const declineProposal = useCallback(
    (proposalId: string) => {
      setState((prev) => ({
        ...prev,
        classTimeProposals: prev.classTimeProposals.map((p) =>
          p.id === proposalId ? { ...p, status: 'declined' as const } : p,
        ),
      }))
      addActivity('HOD declined a class time proposal')
    },
    [addActivity],
  )

  const getStudentRecords = useCallback(
    (studentId: string) =>
      state.attendanceRecords.filter((r) => r.studentId === studentId),
    [state.attendanceRecords],
  )

  const getCourseAttendance = useCallback(
    (studentId: string) => {
      const studentEnrollments = Object.entries(state.enrollments)
        .filter(([, students]) => students.some((s) => s.studentId === studentId))
        .map(([courseCode, students]) => {
          const student = students.find((s) => s.studentId === studentId)!
          const courseTitle =
            thresholdSummaries.find((t) => t.courseCode === courseCode)?.courseTitle ?? courseCode
          return {
            courseCode,
            courseTitle,
            percentage: student.attendancePct,
          }
        })
      return studentEnrollments
    },
    [state.enrollments, thresholdSummaries],
  )

  const value: MandateContextValue = {
    state,
    thresholdSummaries,
    demo,
    setDemo,
    switchRole,
    goHome,
    isAtHome,
    checkIn,
    manualCheckIn,
    disputeRecord,
    resolveDispute,
    markPresentManually,
    proposeClassTime,
    approveProposal,
    declineProposal,
    getStudentRecords,
    getCourseAttendance,
  }

  return <MandateContext.Provider value={value}>{children}</MandateContext.Provider>
}

export function useMandate() {
  const ctx = useContext(MandateContext)
  if (!ctx) throw new Error('useMandate must be used within MandateProvider')
  return ctx
}

export { NUC_THRESHOLD }
