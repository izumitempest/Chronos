import type {
  ActivityEntry,
  AttendanceRecord,
  ChronosState,
  ClassInstance,
  ClassTimeProposal,
  Enrollment,
  ThresholdSummary,
  User,
} from './types'

export const NUC_THRESHOLD = 75

export const STUDENTS: Enrollment[] = [
  { studentId: 's1', name: 'Adaeze Okonkwo', attendancePct: 82 },
  { studentId: 's2', name: 'Chukwuemeka Nwosu', attendancePct: 61 },
  { studentId: 's3', name: 'Fatima Ibrahim', attendancePct: 88 },
  { studentId: 's4', name: 'Oluwaseun Adeyemi', attendancePct: 74 },
  { studentId: 's5', name: 'Ngozi Eze', attendancePct: 91 },
  { studentId: 's6', name: 'Ibrahim Musa', attendancePct: 58 },
  { studentId: 's7', name: 'Blessing Okafor', attendancePct: 79 },
  { studentId: 's8', name: 'Tunde Bakare', attendancePct: 67 },
  { studentId: 's9', name: 'Amara Chukwu', attendancePct: 85 },
  { studentId: 's10', name: 'Kelechi Obi', attendancePct: 72 },
  { studentId: 's11', name: 'Zainab Abdullahi', attendancePct: 93 },
  { studentId: 's12', name: 'Emeka Okafor', attendancePct: 55 },
  { studentId: 's13', name: 'Chioma Nwankwo', attendancePct: 81 },
  { studentId: 's14', name: 'Yusuf Bello', attendancePct: 69 },
  { studentId: 's15', name: 'Grace Etim', attendancePct: 77 },
  { studentId: 's16', name: 'Samuel Uche', attendancePct: 64 },
  { studentId: 's17', name: 'Aisha Mohammed', attendancePct: 86 },
  { studentId: 's18', name: 'David Anya', attendancePct: 71 },
]

const now = new Date()

function relativeMinutes(offsetMin: number): string {
  const d = new Date(now.getTime() + offsetMin * 60000)
  return d.toISOString()
}

export const COURSES = [
  { code: 'CSC 401', title: 'Compiler Design' },
  { code: 'CSC 302', title: 'Software Engineering' },
  { code: 'MTH 201', title: 'Linear Algebra II' },
  { code: 'PHY 203', title: 'Electromagnetism' },
  { code: 'ENT 105', title: 'Introduction to Entrepreneurship' },
  { code: 'CSC 303', title: 'Database Systems' },
  { code: 'MTH 305', title: 'Numerical Methods' },
  { code: 'PHY 301', title: 'Quantum Mechanics' },
]

function pickStudents(count: number, offset = 0): Enrollment[] {
  return STUDENTS.slice(offset, offset + count).map((s) => ({ ...s }))
}

export const enrollments: Record<string, Enrollment[]> = {
  'CSC 401': pickStudents(12, 0),
  'CSC 302': pickStudents(10, 2),
  'MTH 201': pickStudents(14, 1),
  'PHY 203': pickStudents(11, 3),
  'ENT 105': pickStudents(16, 0),
  'CSC 303': pickStudents(9, 4),
  'MTH 305': pickStudents(8, 6),
  'PHY 301': pickStudents(7, 8),
}

export const classInstances: ClassInstance[] = [
  {
    id: 'ci_1',
    courseCode: 'CSC 401',
    courseTitle: 'Compiler Design',
    venue: 'LT2, Faculty of Natural Sciences',
    lecturer: 'Dr. Nneka Okafor',
    windowOpenAt: relativeMinutes(-5),
    windowCloseAt: relativeMinutes(25),
    classStartAt: relativeMinutes(12),
    attendanceMode: 'window',
    status: 'active',
  },
  {
    id: 'ci_2',
    courseCode: 'MTH 201',
    courseTitle: 'Linear Algebra II',
    venue: 'Room 14, Science Block',
    lecturer: 'Prof. Emeka Udeh',
    windowOpenAt: relativeMinutes(90),
    windowCloseAt: relativeMinutes(120),
    classStartAt: relativeMinutes(105),
    attendanceMode: 'window',
    status: 'upcoming',
  },
]

function daysAgo(days: number, hour: number, minute: number): string {
  const d = new Date(now)
  d.setDate(d.getDate() - days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

export const attendanceRecords: AttendanceRecord[] = [
  {
    id: 'ar_1',
    classInstanceId: 'ci_hist_1',
    studentId: 's1',
    studentName: 'Adaeze Okonkwo',
    presenceMethod: 'autonomous_gaa',
    verificationStatus: 'verified',
    accuracyMetres: 12,
    timestamp: daysAgo(1, 8, 52),
    disputeReason: null,
  },
  {
    id: 'ar_2',
    classInstanceId: 'ci_hist_2',
    studentId: 's1',
    studentName: 'Adaeze Okonkwo',
    presenceMethod: 'autonomous_gaa',
    verificationStatus: 'verified',
    accuracyMetres: 8,
    timestamp: daysAgo(3, 9, 3),
    disputeReason: null,
  },
  {
    id: 'ar_3',
    classInstanceId: 'ci_hist_3',
    studentId: 's1',
    studentName: 'Adaeze Okonkwo',
    presenceMethod: 'manual_student',
    verificationStatus: 'manual',
    accuracyMetres: null,
    timestamp: daysAgo(5, 9, 10),
    disputeReason: null,
  },
  {
    id: 'ar_4',
    classInstanceId: 'ci_hist_4',
    studentId: 's1',
    studentName: 'Adaeze Okonkwo',
    presenceMethod: 'autonomous_gaa',
    verificationStatus: 'unverified',
    accuracyMetres: 340,
    timestamp: daysAgo(7, 8, 58),
    disputeReason: null,
  },
  {
    id: 'ar_5',
    classInstanceId: 'ci_hist_5',
    studentId: 's1',
    studentName: 'Adaeze Okonkwo',
    presenceMethod: 'autonomous_gaa',
    verificationStatus: 'verified',
    accuracyMetres: 15,
    timestamp: daysAgo(10, 9, 1),
    disputeReason: null,
  },
  {
    id: 'ar_6',
    classInstanceId: 'ci_hist_6',
    studentId: 's6',
    studentName: 'Ibrahim Musa',
    presenceMethod: 'autonomous_gaa',
    verificationStatus: 'disputed',
    accuracyMetres: 280,
    timestamp: daysAgo(2, 9, 5),
    disputeReason: 'I was in the lecture hall but my phone had no signal.',
  },
  {
    id: 'ar_7',
    classInstanceId: 'ci_hist_7',
    studentId: 's2',
    studentName: 'Chukwuemeka Nwosu',
    presenceMethod: 'manual_lecturer',
    verificationStatus: 'manual',
    accuracyMetres: null,
    timestamp: daysAgo(4, 9, 20),
    disputeReason: null,
  },
]

export const classTimeProposals: ClassTimeProposal[] = [
  {
    id: 'ctp_1',
    courseCode: 'CSC 302',
    proposedBy: 'Dr. Nneka Okafor',
    proposedDay: 'Wednesday',
    proposedTime: '2:00 PM',
    status: 'pending',
    submittedAt: daysAgo(1, 14, 30),
  },
  {
    id: 'ctp_2',
    courseCode: 'PHY 203',
    proposedBy: 'Dr. Samuel Eze',
    proposedDay: 'Friday',
    proposedTime: '10:00 AM',
    status: 'pending',
    submittedAt: daysAgo(2, 11, 0),
  },
]

export const activityLog: ActivityEntry[] = [
  {
    id: 'act_1',
    timestamp: daysAgo(0, 8, 52),
    message: 'Adaeze Okonkwo checked in to CSC 401 — location confirmed',
  },
  {
    id: 'act_2',
    timestamp: daysAgo(0, 8, 48),
    message: 'Fatima Ibrahim checked in to CSC 401 — location confirmed',
  },
  {
    id: 'act_3',
    timestamp: daysAgo(1, 14, 30),
    message: 'Dr. Nneka Okafor proposed a new time for CSC 302',
  },
  {
    id: 'act_4',
    timestamp: daysAgo(2, 9, 5),
    message: 'Ibrahim Musa disputed an attendance record for CSC 401',
  },
  {
    id: 'act_5',
    timestamp: daysAgo(3, 16, 0),
    message: 'Department threshold report generated for Computer Science',
  },
]

export const users: Record<string, User> = {
  student: {
    role: 'student',
    name: 'Adaeze Okonkwo',
    matric: 'GOU/CSC/22/1047',
    department: 'Computer Science',
  },
  lecturer: {
    role: 'lecturer',
    name: 'Dr. Nneka Okafor',
    staffId: 'GOU/STF/2019/044',
    department: 'Computer Science',
    title: 'Senior Lecturer',
  },
  admin: {
    role: 'admin',
    name: 'Prof. Chidi Nwosu',
    staffId: 'GOU/STF/2012/008',
    department: 'Computer Science',
    title: 'Head of Department',
  },
}

export function computeThresholdSummaries(
  enrollmentMap: Record<string, Enrollment[]>,
): ThresholdSummary[] {
  return COURSES.map(({ code, title }) => {
    const students = enrollmentMap[code] ?? []
    const above = students.filter((s) => s.attendancePct >= NUC_THRESHOLD).length
    const below = students.length - above
    return {
      courseCode: code,
      courseTitle: title,
      studentsAbove75: above,
      studentsBelow75: below,
      totalEnrolled: students.length,
    }
  }).filter((s) => s.totalEnrolled > 0)
}

export function createInitialState(role: keyof typeof users = 'student'): ChronosState {
  return {
    currentUser: users[role],
    classInstances,
    enrollments,
    attendanceRecords: [...attendanceRecords],
    classTimeProposals: [...classTimeProposals],
    activityLog: [...activityLog],
    pendingSyncCount: 2,
  }
}
