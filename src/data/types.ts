export type Role = 'student' | 'lecturer' | 'admin'

export type VerificationStatus =
  | 'verified'
  | 'unverified'
  | 'disputed'
  | 'manual'
  | 'pending'

export type PresenceMethod =
  | 'autonomous_gaa'
  | 'manual_lecturer'
  | 'manual_student'

export interface User {
  role: Role
  name: string
  matric?: string
  staffId?: string
  department: string
  title?: string
}

export interface ClassInstance {
  id: string
  courseCode: string
  courseTitle: string
  venue: string
  lecturer: string
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
}

export interface AttendanceRecord {
  id: string
  classInstanceId: string
  studentId: string
  studentName: string
  presenceMethod: PresenceMethod
  verificationStatus: VerificationStatus
  accuracyMetres: number | null
  timestamp: string
  disputeReason: string | null
  hodNote?: string | null
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

export interface StudentCourseAttendance {
  courseCode: string
  courseTitle: string
  percentage: number
  history: AttendanceRecord[]
}

export interface ChronosState {
  currentUser: User
  classInstances: ClassInstance[]
  enrollments: Record<string, Enrollment[]>
  attendanceRecords: AttendanceRecord[]
  classTimeProposals: ClassTimeProposal[]
  activityLog: ActivityEntry[]
  pendingSyncCount: number
}

export type DemoLocationOutcome = 'verified' | 'unverified'
export type DemoRosterSpeed = 'normal' | 'fast'

export interface DemoSettings {
  locationOutcome: DemoLocationOutcome
  rosterSpeed: DemoRosterSpeed
}
