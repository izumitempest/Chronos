export type Role = 'student' | 'lecturer' | 'hod' | 'dean' | 'admin'

export type AdminScope = 'department' | 'faculty' | 'institution'

export type VerificationStatus =
  | 'verified'
  | 'unverified'
  | 'disputed'
  | 'manual'
  | 'pending'
  | 'missed'

export type PresenceMethod =
  | 'autonomous_gaa'
  | 'manual_student'
  | 'manual_lecturer'
  | 'lecturer_requested'

export type AttendanceSessionStatus = 'present' | 'missed' | 'upcoming' | 'pending'

export interface User {
  id: string
  role: Role
  name: string
  matric?: string
  staffId?: string
  department: string
  faculty: string
  level?: string
  title?: string
  courseCodes?: string[]
  adminScope?: AdminScope
  canAccessAdmin?: boolean
}

export interface CourseCatalogEntry {
  code: string
  title: string
  level: string
  department: string
  faculty: string
  lecturerIds: string[]
  lecturerNames: string[]
}

export interface ClassInstance {
  id: string
  courseCode: string
  courseTitle: string
  venue: string
  lecturer: string
  lecturerIds: string[]
  windowOpenAt: string
  windowCloseAt: string
  classStartAt: string
  attendanceMode: 'window'
  status: 'active' | 'upcoming' | 'closed'
}

export interface Enrollment {
  studentId: string
  name: string
  attendancePct: number
  level: string
  department: string
  faculty: string
  projectedPct?: number
}

export interface AttendanceRecord {
  id: string
  classInstanceId: string
  courseCode: string
  studentId: string
  studentName: string
  presenceMethod: PresenceMethod
  verificationStatus: VerificationStatus
  accuracyMetres: number | null
  timestamp: string
  disputeReason: string | null
  hodNote?: string | null
}

export interface LecturerRequest {
  id: string
  classInstanceId: string
  courseCode: string
  studentId: string
  studentName: string
  requestedAt: string
  status: 'pending' | 'fulfilled' | 'declined'
}

export interface CalendarSession {
  id: string
  courseCode: string
  courseTitle: string
  date: string
  startTime: string
  venue: string
  studentId?: string
  status: AttendanceSessionStatus
  presenceMethod?: PresenceMethod
  recordId?: string
}

export interface TimetableSlot {
  id: string
  courseCode: string
  courseTitle: string
  day: string
  startTime: string
  endTime: string
  venue: string
  level: string
  department: string
  lecturerIds: string[]
  lecturerNames: string[]
}

export interface LecturerAttendanceRecord {
  id: string
  courseCode: string
  courseTitle: string
  date: string
  lecturerId: string
  lecturerName: string
  tookAttendance: boolean
  onTime: boolean
}

export interface HierarchyNode {
  role: Role
  label: string
  canAccessApp: boolean
  canAccessAdmin: boolean
  adminSections: string[]
  reportsTo?: Role
}

export interface ThresholdSummary {
  courseCode: string
  courseTitle: string
  studentsAbove75: number
  studentsBelow75: number
  totalEnrolled: number
}

export interface ClassTimeProposal {
  id: string
  courseCode: string
  proposedBy: string
  proposedDay: string
  proposedTime: string
  status: 'pending' | 'approved' | 'declined'
  submittedAt: string
}

export interface ActivityEntry {
  id: string
  timestamp: string
  message: string
}

export interface MandateState {
  currentUser: User
  users: User[]
  courseCatalog: CourseCatalogEntry[]
  classInstances: ClassInstance[]
  enrollments: Record<string, Enrollment[]>
  attendanceRecords: AttendanceRecord[]
  lecturerRequests: LecturerRequest[]
  calendarSessions: CalendarSession[]
  timetable: TimetableSlot[]
  lecturerAttendance: LecturerAttendanceRecord[]
  hierarchy: HierarchyNode[]
  classTimeProposals: ClassTimeProposal[]
  activityLog: ActivityEntry[]
  pendingSyncCount: number
}

export type PageId =
  | 'dashboard'
  | 'courses'
  | 'calendar'
  | 'past-classes'
  | 'timetable'
  | 'course-detail'
  | 'reports'
  | 'users'
  | 'courses-admin'
  | 'hierarchy'
  | 'timetable-admin'
  | 'lecturer-attendance'
  | 'student-detail'
  | 'reports-view'
  | 'verification'

export interface PageState {
  id: PageId
  params?: Record<string, string>
}

export type DemoLocationOutcome = 'verified' | 'unverified' | 'manual_fail'
export type DemoRosterSpeed = 'normal' | 'fast'

export interface DemoSettings {
  locationOutcome: DemoLocationOutcome
  rosterSpeed: DemoRosterSpeed
}

export const NUC_THRESHOLD = 75
export const AT_RISK_BUFFER = 5
