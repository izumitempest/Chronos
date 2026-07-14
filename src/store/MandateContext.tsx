import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import {
  computeThresholdSummaries,
  createInitialState,
  courseTitlesMap,
  filterEnrollmentsByScope,
  users,
} from '../data/seedData'
import { defaultPageForRole } from '../navigation/pages'
import type {
  AttendanceRecord,
  CourseCatalogEntry,
  MandateState,
  DemoSettings,
  PageState,
  Role,
  ThresholdSummary,
  TimetableSlot,
  User,
  VerificationStatus,
} from '../data/types'
import { NUC_THRESHOLD } from '../data/types'
import {
  buildDepartmentReportRows,
  buildStudentReportRows,
  downloadExcel,
} from '../utils/reports'
import { uid } from '../utils/format'

interface MandateContextValue {
  state: MandateState
  page: PageState
  pageHistory: PageState[]
  thresholdSummaries: ThresholdSummary[]
  scopedEnrollments: Record<string, import('../data/types').Enrollment[]>
  courseTitles: Record<string, string>
  demo: DemoSettings
  canGoBack: boolean
  setDemo: (settings: Partial<DemoSettings>) => void
  switchRole: (role: Role) => void
  goHome: () => void
  isAtHome: boolean
  navigate: (id: PageState['id'], params?: Record<string, string>) => void
  goBack: () => void
  checkIn: (classInstanceId: string) => AttendanceRecord
  manualCheckIn: (classInstanceId: string) => AttendanceRecord | null
  requestLecturerMark: (classInstanceId: string) => void
  disputeRecord: (recordId: string, reason: string) => void
  resolveDispute: (recordId: string, note: string) => void
  markPresentManually: (studentId: string, classInstanceId: string) => void
  fulfillLecturerRequest: (requestId: string) => void
  proposeClassTime: (courseCode: string, day: string, time: string) => void
  approveProposal: (proposalId: string) => void
  declineProposal: (proposalId: string) => void
  getStudentRecords: (studentId: string) => AttendanceRecord[]
  getCourseAttendance: (studentId: string) => { courseCode: string; courseTitle: string; percentage: number; projected: number }[]
  exportReport: (type: string, courseCode?: string) => void
  addUser: (user: Omit<User, 'id'>) => void
  removeUser: (userId: string) => void
  addCourse: (course: CourseCatalogEntry) => void
  removeCourse: (code: string) => void
  updateTimetable: (slots: TimetableSlot[]) => void
  mockUploadUsers: () => void
}

const MandateContext = createContext<MandateContextValue | null>(null)

export function MandateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MandateState>(createInitialState)
  const [isAtHome, setIsAtHome] = useState(true)
  const [page, setPage] = useState<PageState>({ id: 'dashboard' })
  const [pageHistory, setPageHistory] = useState<PageState[]>([])
  const [demo, setDemoState] = useState<DemoSettings>({
    locationOutcome: 'verified',
    rosterSpeed: 'normal',
  })

  const scopedEnrollments = useMemo(
    () => filterEnrollmentsByScope(state.enrollments, state.currentUser),
    [state.enrollments, state.currentUser],
  )

  const thresholdSummaries = useMemo(
    () => computeThresholdSummaries(scopedEnrollments),
    [scopedEnrollments],
  )

  const courseTitles = useMemo(() => courseTitlesMap(state.courseCatalog), [state.courseCatalog])

  const setDemo = useCallback((settings: Partial<DemoSettings>) => {
    setDemoState((prev) => ({ ...prev, ...settings }))
  }, [])

  const addActivity = useCallback((message: string) => {
    setState((prev) => ({
      ...prev,
      activityLog: [{ id: uid('act'), timestamp: new Date().toISOString(), message }, ...prev.activityLog].slice(0, 30),
    }))
  }, [])

  const navigate = useCallback((id: PageState['id'], params?: Record<string, string>) => {
    window.history.pushState({ id, params }, '')
    setPageHistory((h) => [...h, page])
    setPage({ id, params })
  }, [page])

  const goBack = useCallback(() => {
    window.history.back()
  }, [])

  useEffect(() => {
    const handlePop = (e: PopStateEvent) => {
      if (e.state && e.state.id) {
        setPage(e.state)
        setPageHistory((h) => h.slice(0, -1))
      } else {
        setPage({ id: 'dashboard' })
      }
    }
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [])

  const canGoBack = pageHistory.length > 0

  const switchRole = useCallback((role: Role) => {
    setState((prev) => ({
      ...prev,
      currentUser: users[role as keyof typeof users] ?? users.admin,
    }))
    setPage({ id: defaultPageForRole(role) })
    setPageHistory([])
    setIsAtHome(false)
  }, [])

  const goHome = useCallback(() => {
    setIsAtHome(true)
    setPageHistory([])
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
        courseCode: ci?.courseCode ?? '',
        studentId: user.id,
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
      addActivity(`${user.name} checked in to ${ci?.courseCode ?? 'class'} — ${verified ? 'location confirmed' : 'location unconfirmed'}`)
      return record
    },
    [state.classInstances, state.currentUser, demo.locationOutcome, addActivity],
  )

  const manualCheckIn = useCallback(
    (classInstanceId: string): AttendanceRecord | null => {
      if (demo.locationOutcome === 'manual_fail') return null
      const ci = state.classInstances.find((c) => c.id === classInstanceId)
      const user = state.currentUser
      const record: AttendanceRecord = {
        id: uid('ar'),
        classInstanceId,
        courseCode: ci?.courseCode ?? '',
        studentId: user.id,
        studentName: user.name,
        presenceMethod: 'manual_student',
        verificationStatus: 'manual',
        accuracyMetres: null,
        timestamp: new Date().toISOString(),
        disputeReason: null,
      }
      setState((prev) => ({ ...prev, attendanceRecords: [record, ...prev.attendanceRecords] }))
      addActivity(`${user.name} used in-app manual check-in for ${ci?.courseCode ?? 'class'}`)
      return record
    },
    [state.classInstances, state.currentUser, demo.locationOutcome, addActivity],
  )

  const requestLecturerMark = useCallback(
    (classInstanceId: string) => {
      const ci = state.classInstances.find((c) => c.id === classInstanceId)
      const user = state.currentUser
      const req = {
        id: uid('lr'),
        classInstanceId,
        courseCode: ci?.courseCode ?? '',
        studentId: user.id,
        studentName: user.name,
        requestedAt: new Date().toISOString(),
        status: 'pending' as const,
      }
      setState((prev) => ({ ...prev, lecturerRequests: [req, ...prev.lecturerRequests] }))
      addActivity(`${user.name} asked their lecturer to mark attendance for ${ci?.courseCode ?? 'class'}`)
    },
    [state.classInstances, state.currentUser, addActivity],
  )

  const fulfillLecturerRequest = useCallback(
    (requestId: string) => {
      const req = state.lecturerRequests.find((r) => r.id === requestId)
      if (!req) return
      const record: AttendanceRecord = {
        id: uid('ar'),
        classInstanceId: req.classInstanceId,
        courseCode: req.courseCode,
        studentId: req.studentId,
        studentName: req.studentName,
        presenceMethod: 'lecturer_requested',
        verificationStatus: 'manual',
        accuracyMetres: null,
        timestamp: new Date().toISOString(),
        disputeReason: null,
      }
      setState((prev) => ({
        ...prev,
        lecturerRequests: prev.lecturerRequests.map((r) =>
          r.id === requestId ? { ...r, status: 'fulfilled' as const } : r,
        ),
        attendanceRecords: [record, ...prev.attendanceRecords],
      }))
      addActivity(`Lecturer marked ${req.studentName} present (forwarded request)`)
    },
    [state.lecturerRequests, addActivity],
  )

  const disputeRecord = useCallback(
    (recordId: string, reason: string) => {
      setState((prev) => ({
        ...prev,
        attendanceRecords: prev.attendanceRecords.map((r) =>
          r.id === recordId ? { ...r, verificationStatus: 'disputed' as const, disputeReason: reason } : r,
        ),
      }))
      addActivity(`${state.currentUser.name} disputed an attendance record`)
    },
    [state.currentUser.name, addActivity],
  )

  const resolveDispute = useCallback(
    (recordId: string, note: string) => {
      setState((prev) => ({
        ...prev,
        attendanceRecords: prev.attendanceRecords.map((r) =>
          r.id === recordId ? { ...r, verificationStatus: 'verified' as const, hodNote: note } : r,
        ),
      }))
      addActivity('HOD resolved a flagged attendance record')
    },
    [addActivity],
  )

  const markPresentManually = useCallback(
    (studentId: string, classInstanceId: string) => {
      const student = Object.values(state.enrollments).flat().find((s) => s.studentId === studentId)
      const ci = state.classInstances.find((c) => c.id === classInstanceId)
      const record: AttendanceRecord = {
        id: uid('ar'),
        classInstanceId,
        courseCode: ci?.courseCode ?? '',
        studentId,
        studentName: student?.name ?? 'Unknown',
        presenceMethod: 'manual_lecturer',
        verificationStatus: 'manual',
        accuracyMetres: null,
        timestamp: new Date().toISOString(),
        disputeReason: null,
      }
      setState((prev) => ({ ...prev, attendanceRecords: [record, ...prev.attendanceRecords] }))
      addActivity(`${state.currentUser.name} marked ${student?.name ?? 'a student'} present`)
    },
    [state.enrollments, state.classInstances, state.currentUser.name, addActivity],
  )

  const proposeClassTime = useCallback(
    (courseCode: string, day: string, time: string) => {
      setState((prev) => ({
        ...prev,
        classTimeProposals: [{
          id: uid('ctp'),
          courseCode,
          proposedBy: state.currentUser.name,
          proposedDay: day,
          proposedTime: time,
          status: 'pending',
          submittedAt: new Date().toISOString(),
        }, ...prev.classTimeProposals],
      }))
      addActivity(`${state.currentUser.name} proposed a new time for ${courseCode}`)
    },
    [state.currentUser.name, addActivity],
  )

  const approveProposal = useCallback((proposalId: string) => {
    setState((prev) => ({
      ...prev,
      classTimeProposals: prev.classTimeProposals.map((p) =>
        p.id === proposalId ? { ...p, status: 'approved' as const } : p,
      ),
    }))
    addActivity('HOD approved a class time proposal')
  }, [addActivity])

  const declineProposal = useCallback((proposalId: string) => {
    setState((prev) => ({
      ...prev,
      classTimeProposals: prev.classTimeProposals.map((p) =>
        p.id === proposalId ? { ...p, status: 'declined' as const } : p,
      ),
    }))
    addActivity('HOD declined a class time proposal')
  }, [addActivity])

  const getStudentRecords = useCallback(
    (studentId: string) => state.attendanceRecords.filter((r) => r.studentId === studentId),
    [state.attendanceRecords],
  )

  const getCourseAttendance = useCallback(
    (studentId: string) =>
      Object.entries(state.enrollments)
        .filter(([, students]) => students.some((s) => s.studentId === studentId))
        .map(([courseCode, students]) => {
          const student = students.find((s) => s.studentId === studentId)!
          return {
            courseCode,
            courseTitle: courseTitles[courseCode] ?? courseCode,
            percentage: student.attendancePct,
            projected: student.projectedPct ?? student.attendancePct,
          }
        }),
    [state.enrollments, courseTitles],
  )

  const exportReport = useCallback(
    (type: string, courseCode?: string) => {
      const enrollMap = courseCode
        ? { [courseCode]: scopedEnrollments[courseCode] ?? [] }
        : scopedEnrollments

      let rows: Record<string, string | number>[] = []
      let filename = 'mandate-report.xlsx'

      switch (type) {
        case 'all-students':
          rows = buildStudentReportRows(enrollMap, courseTitles, 'all')
          filename = 'mandate-all-students.xlsx'
          break
        case 'on-track':
          rows = buildStudentReportRows(enrollMap, courseTitles, 'on-track')
          filename = 'mandate-on-track.xlsx'
          break
        case 'at-risk':
          rows = buildStudentReportRows(enrollMap, courseTitles, 'at-risk')
          filename = 'mandate-at-risk.xlsx'
          break
        case 'above-threshold':
          rows = buildStudentReportRows(enrollMap, courseTitles, 'above')
          filename = 'mandate-above-threshold.xlsx'
          break
        case 'by-department':
          rows = buildDepartmentReportRows(scopedEnrollments, courseTitles, state.currentUser.department)
          filename = 'mandate-by-department.xlsx'
          break
        case 'below-any':
          rows = buildDepartmentReportRows(scopedEnrollments, courseTitles).filter(
            (r) => r['Below threshold in any course'] === 'Yes',
          )
          filename = 'mandate-below-threshold.xlsx'
          break
        case 'lecturer-pass':
          rows = state.lecturerAttendance.filter((l) => l.tookAttendance).map((l) => ({
            Lecturer: l.lecturerName,
            Course: l.courseCode,
            Date: l.date,
            Status: 'Passing',
          }))
          filename = 'mandate-lecturers-passing.xlsx'
          break
        case 'lecturer-fail':
          rows = state.lecturerAttendance.filter((l) => !l.tookAttendance).map((l) => ({
            Lecturer: l.lecturerName,
            Course: l.courseCode,
            Date: l.date,
            Status: 'Missed class / no attendance',
          }))
          filename = 'mandate-lecturers-failing.xlsx'
          break
        default:
          rows = buildStudentReportRows(enrollMap, courseTitles, 'all')
      }

      downloadExcel(filename, 'Report', rows)
      addActivity(`Report exported: ${filename}`)
    },
    [scopedEnrollments, courseTitles, state.currentUser.department, state.lecturerAttendance, addActivity],
  )

  const addUser = useCallback((user: Omit<User, 'id'>) => {
    setState((prev) => ({
      ...prev,
      users: [...prev.users, { ...user, id: uid('u') }],
    }))
    addActivity(`User added: ${user.name}`)
  }, [addActivity])

  const removeUser = useCallback((userId: string) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.id !== userId),
    }))
    addActivity('User removed')
  }, [addActivity])

  const addCourse = useCallback((course: CourseCatalogEntry) => {
    setState((prev) => ({
      ...prev,
      courseCatalog: [...prev.courseCatalog, course],
    }))
    addActivity(`Course added: ${course.code}`)
  }, [addActivity])

  const removeCourse = useCallback((code: string) => {
    setState((prev) => ({
      ...prev,
      courseCatalog: prev.courseCatalog.filter((c) => c.code !== code),
    }))
    addActivity(`Course removed: ${code}`)
  }, [addActivity])

  const updateTimetable = useCallback((slots: TimetableSlot[]) => {
    setState((prev) => ({ ...prev, timetable: slots }))
    addActivity('Timetable updated')
  }, [addActivity])

  const mockUploadUsers = useCallback(() => {
    addActivity('Bulk user upload processed (prototype)')
  }, [addActivity])

  const value: MandateContextValue = {
    state,
    page,
    pageHistory,
    thresholdSummaries,
    scopedEnrollments,
    courseTitles,
    demo,
    canGoBack,
    setDemo,
    switchRole,
    goHome,
    isAtHome,
    navigate,
    goBack,
    checkIn,
    manualCheckIn,
    requestLecturerMark,
    disputeRecord,
    resolveDispute,
    markPresentManually,
    fulfillLecturerRequest,
    proposeClassTime,
    approveProposal,
    declineProposal,
    getStudentRecords,
    getCourseAttendance,
    exportReport,
    addUser,
    removeUser,
    addCourse,
    removeCourse,
    updateTimetable,
    mockUploadUsers,
  }

  return <MandateContext.Provider value={value}>{children}</MandateContext.Provider>
}

export function useMandate() {
  const ctx = useContext(MandateContext)
  if (!ctx) throw new Error('useMandate must be used within MandateProvider')
  return ctx
}

export { NUC_THRESHOLD }
