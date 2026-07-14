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
import { apiClient } from '../api/client'

interface MandateContextValue {
  state: MandateState
  page: PageState
  pageHistory: PageState[]
  thresholdSummaries: ThresholdSummary[]
  scopedEnrollments: Record<string, import('../data/types').Enrollment[]>
  courseTitles: Record<string, string>
  demo: DemoSettings
  canGoBack: boolean
  loading: boolean
  setDemo: (settings: Partial<DemoSettings>) => void
  switchRole: (role: Role) => void
  goHome: () => void
  isAtHome: boolean
  navigate: (id: PageState['id'], params?: Record<string, string>) => void
  goBack: () => void
  checkIn: (classInstanceId: string) => Promise<AttendanceRecord | null>
  manualCheckIn: (classInstanceId: string) => Promise<AttendanceRecord | null>
  requestLecturerMark: (classInstanceId: string) => Promise<void>
  disputeRecord: (recordId: string, reason: string) => Promise<void>
  resolveDispute: (recordId: string, note: string) => Promise<void>
  markPresentManually: (studentId: string, classInstanceId: string) => Promise<void>
  fulfillLecturerRequest: (requestId: string) => Promise<void>
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
  const [loading, setLoading] = useState(false)
  const [demo, setDemoState] = useState<DemoSettings>({
    locationOutcome: 'verified',
    rosterSpeed: 'normal',
  })

  const fetchDashboardData = useCallback(async () => {
    if (!localStorage.getItem('mandate_token') || isAtHome) return
    setLoading(true)
    try {
      const [coursesData, activeClassesData] = await Promise.all([
        apiClient.get<any[]>('/courses'),
        apiClient.get<any[]>('/classes/active'),
      ])

      const courseCatalog = coursesData.map(c => ({
        code: c.code,
        title: c.title,
        level: c.level,
        department: c.department,
        faculty: c.faculty,
        lecturerIds: c.lecturers.map((l: any) => l.user.id),
        lecturerNames: c.lecturers.map((l: any) => l.user.name),
      }))

      const classInstances = activeClassesData.map(ci => ({
        id: ci.id,
        courseCode: ci.courseCode,
        courseTitle: ci.course?.title || ci.courseCode,
        venue: ci.venue,
        lecturer: 'Assigned Lecturer',
        lecturerIds: [], 
        windowOpenAt: ci.windowOpenAt,
        windowCloseAt: ci.windowCloseAt,
        classStartAt: ci.classStartAt,
        attendanceMode: ci.attendanceMode,
        status: ci.status,
      }))

      setState(prev => ({
        ...prev,
        courseCatalog,
        classInstances,
      }))
    } catch (e) {
      console.error('Failed to load dashboard data:', e)
    } finally {
      setLoading(false)
    }
  }, [isAtHome])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

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

  const switchRole = useCallback(async (role: Role) => {
    try {
      const response = await apiClient.post<{ token: string; user: User }>('/auth/demo-switch', { role })
      localStorage.setItem('mandate_token', response.token)
      setState((prev) => ({
        ...prev,
        currentUser: response.user,
      }))
      setPage({ id: defaultPageForRole(role) })
      setPageHistory([])
      setIsAtHome(false)
    } catch (error) {
      console.error('Failed to switch role:', error)
      alert('Backend API is not reachable. Ensure it is running on port 3001.')
    }
  }, [])

  const goHome = useCallback(() => {
    setIsAtHome(true)
    setPageHistory([])
  }, [])

  const checkIn = useCallback(
    async (classInstanceId: string): Promise<AttendanceRecord | null> => {
      const verified = demo.locationOutcome === 'verified'
      try {
        const record = await apiClient.post<AttendanceRecord>('/attendance/check-in', {
          classInstanceId,
          accuracyMetres: verified ? 14 : 312,
        })
        setState((prev) => ({
          ...prev,
          attendanceRecords: [record, ...prev.attendanceRecords],
        }))
        return record
      } catch (error) {
        console.error('Check-in failed:', error)
        return null
      }
    },
    [demo.locationOutcome],
  )

  const manualCheckIn = useCallback(
    async (classInstanceId: string): Promise<AttendanceRecord | null> => {
      if (demo.locationOutcome === 'manual_fail') return null
      try {
        const record = await apiClient.post<AttendanceRecord>('/attendance/manual', {
          classInstanceId,
        })
        setState((prev) => ({ ...prev, attendanceRecords: [record, ...prev.attendanceRecords] }))
        return record
      } catch (error) {
        console.error('Manual check-in failed:', error)
        return null
      }
    },
    [demo.locationOutcome],
  )

  const requestLecturerMark = useCallback(
    async (classInstanceId: string) => {
      try {
        const req = await apiClient.post<any>('/attendance/request-lecturer', { classInstanceId })
        setState((prev) => ({ ...prev, lecturerRequests: [req, ...prev.lecturerRequests] }))
      } catch (error) {
        console.error('Request lecturer mark failed:', error)
      }
    },
    [],
  )

  const fulfillLecturerRequest = useCallback(
    async (requestId: string) => {
      try {
        const response = await apiClient.post<any>('/attendance/fulfill-request', { requestId })
        setState((prev) => ({
          ...prev,
          lecturerRequests: prev.lecturerRequests.map((r) =>
            r.id === requestId ? { ...r, status: 'fulfilled' as const } : r,
          ),
          attendanceRecords: [response.record, ...prev.attendanceRecords],
        }))
      } catch (error) {
        console.error('Fulfill request failed:', error)
      }
    },
    [],
  )

  const disputeRecord = useCallback(
    async (recordId: string, reason: string) => {
      try {
        const record = await apiClient.post<AttendanceRecord>('/attendance/dispute', { recordId, reason })
        setState((prev) => ({
          ...prev,
          attendanceRecords: prev.attendanceRecords.map((r) =>
            r.id === recordId ? { ...r, verificationStatus: 'disputed' as const, disputeReason: reason } : r,
          ),
        }))
      } catch (error) {
        console.error('Dispute failed:', error)
      }
    },
    [],
  )

  const resolveDispute = useCallback(
    async (recordId: string, note: string) => {
      try {
        await apiClient.post<AttendanceRecord>('/attendance/resolve-dispute', { recordId, note })
        setState((prev) => ({
          ...prev,
          attendanceRecords: prev.attendanceRecords.map((r) =>
            r.id === recordId ? { ...r, verificationStatus: 'verified' as const, hodNote: note } : r,
          ),
        }))
      } catch (error) {
        console.error('Resolve dispute failed:', error)
      }
    },
    [],
  )

  const markPresentManually = useCallback(
    async (studentId: string, classInstanceId: string) => {
      try {
        const record = await apiClient.post<AttendanceRecord>('/attendance/mark-present', { studentId, classInstanceId })
        setState((prev) => ({ ...prev, attendanceRecords: [record, ...prev.attendanceRecords] }))
      } catch (error) {
        console.error('Mark present manually failed:', error)
      }
    },
    [],
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
    loading,
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
