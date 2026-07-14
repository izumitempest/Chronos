import type {
  ActivityEntry,
  AttendanceRecord,
  CalendarSession,
  ClassInstance,
  ClassTimeProposal,
  CourseCatalogEntry,
  Enrollment,
  HierarchyNode,
  LecturerAttendanceRecord,
  LecturerRequest,
  MandateState,
  ThresholdSummary,
  TimetableSlot,
  User,
} from './types'
import { NUC_THRESHOLD } from './types'

export { NUC_THRESHOLD }

const FACULTY = 'Natural Sciences'
const DEPT_CS = 'Computer Science'

const now = new Date()

function relativeMinutes(offsetMin: number): string {
  return new Date(now.getTime() + offsetMin * 60000).toISOString()
}

function daysAgo(days: number, hour: number, minute: number): string {
  const d = new Date(now)
  d.setDate(d.getDate() - days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

function dateOnly(daysFromNow: number): string {
  const d = new Date(now)
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().slice(0, 10)
}

export const courseCatalog: CourseCatalogEntry[] = [
  { code: 'CSC 401', title: 'Compiler Design', level: '400', department: DEPT_CS, faculty: FACULTY, lecturerIds: ['l1', 'l2'], lecturerNames: ['Dr. Nneka Okafor', 'Dr. Samuel Eze'] },
  { code: 'CSC 302', title: 'Software Engineering', level: '300', department: DEPT_CS, faculty: FACULTY, lecturerIds: ['l1'], lecturerNames: ['Dr. Nneka Okafor'] },
  { code: 'MTH 201', title: 'Linear Algebra II', level: '200', department: 'Mathematics', faculty: FACULTY, lecturerIds: ['l3'], lecturerNames: ['Prof. Emeka Udeh'] },
  { code: 'PHY 203', title: 'Electromagnetism', level: '200', department: 'Physics', faculty: FACULTY, lecturerIds: ['l4'], lecturerNames: ['Dr. Samuel Eze'] },
  { code: 'ENT 105', title: 'Introduction to Entrepreneurship', level: '100', department: 'Business Admin', faculty: 'Management Sciences', lecturerIds: ['l5'], lecturerNames: ['Dr. Grace Nnamani'] },
  { code: 'CSC 303', title: 'Database Systems', level: '300', department: DEPT_CS, faculty: FACULTY, lecturerIds: ['l2'], lecturerNames: ['Dr. Samuel Eze'] },
  { code: 'MTH 305', title: 'Numerical Methods', level: '300', department: 'Mathematics', faculty: FACULTY, lecturerIds: ['l3'], lecturerNames: ['Prof. Emeka Udeh'] },
  { code: 'PHY 301', title: 'Quantum Mechanics', level: '300', department: 'Physics', faculty: FACULTY, lecturerIds: ['l4'], lecturerNames: ['Dr. Samuel Eze'] },
]

export const COURSES = courseCatalog.map((c) => ({ code: c.code, title: c.title }))

const baseStudents: Omit<Enrollment, 'attendancePct' | 'projectedPct'>[] = [
  { studentId: 's1', name: 'Adaeze Okonkwo', level: '400', department: DEPT_CS, faculty: FACULTY },
  { studentId: 's2', name: 'Chukwuemeka Nwosu', level: '400', department: DEPT_CS, faculty: FACULTY },
  { studentId: 's3', name: 'Fatima Ibrahim', level: '400', department: DEPT_CS, faculty: FACULTY },
  { studentId: 's4', name: 'Oluwaseun Adeyemi', level: '300', department: DEPT_CS, faculty: FACULTY },
  { studentId: 's5', name: 'Ngozi Eze', level: '300', department: DEPT_CS, faculty: FACULTY },
  { studentId: 's6', name: 'Ibrahim Musa', level: '400', department: DEPT_CS, faculty: FACULTY },
  { studentId: 's7', name: 'Blessing Okafor', level: '200', department: 'Mathematics', faculty: FACULTY },
  { studentId: 's8', name: 'Tunde Bakare', level: '200', department: 'Physics', faculty: FACULTY },
  { studentId: 's9', name: 'Amara Chukwu', level: '400', department: DEPT_CS, faculty: FACULTY },
  { studentId: 's10', name: 'Kelechi Obi', level: '300', department: DEPT_CS, faculty: FACULTY },
  { studentId: 's11', name: 'Zainab Abdullahi', level: '100', department: 'Business Admin', faculty: 'Management Sciences' },
  { studentId: 's12', name: 'Emeka Okafor', level: '400', department: DEPT_CS, faculty: FACULTY },
  { studentId: 's13', name: 'Chioma Nwankwo', level: '300', department: DEPT_CS, faculty: FACULTY },
  { studentId: 's14', name: 'Yusuf Bello', level: '200', department: 'Mathematics', faculty: FACULTY },
  { studentId: 's15', name: 'Grace Etim', level: '400', department: DEPT_CS, faculty: FACULTY },
  { studentId: 's16', name: 'Samuel Uche', level: '300', department: DEPT_CS, faculty: FACULTY },
  { studentId: 's17', name: 'Aisha Mohammed', level: '400', department: DEPT_CS, faculty: FACULTY },
  { studentId: 's18', name: 'David Anya', level: '300', department: DEPT_CS, faculty: FACULTY },
]

const pcts = [82, 61, 88, 74, 91, 58, 79, 67, 85, 72, 93, 55, 81, 69, 77, 64, 86, 71]

export const STUDENTS: Enrollment[] = baseStudents.map((s, i) => ({
  ...s,
  attendancePct: pcts[i],
  projectedPct: Math.min(100, pcts[i] + (i % 3 === 0 ? 2 : i % 3 === 1 ? -3 : 0)),
}))

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

export const allUsers: User[] = [
  { id: 's1', role: 'student', name: 'Adaeze Okonkwo', matric: 'GOU/CSC/22/1047', department: DEPT_CS, faculty: FACULTY, level: '400', canAccessAdmin: false },
  { id: 'l1', role: 'lecturer', name: 'Dr. Nneka Okafor', staffId: 'GOU/STF/2019/044', department: DEPT_CS, faculty: FACULTY, title: 'Senior Lecturer', courseCodes: ['CSC 401', 'CSC 302'], canAccessAdmin: false },
  { id: 'l2', role: 'lecturer', name: 'Dr. Samuel Eze', staffId: 'GOU/STF/2018/031', department: DEPT_CS, faculty: FACULTY, title: 'Lecturer I', courseCodes: ['CSC 401', 'CSC 303'], canAccessAdmin: false },
  { id: 'hod1', role: 'hod', name: 'Prof. Chidi Nwosu', staffId: 'GOU/STF/2012/008', department: DEPT_CS, faculty: FACULTY, title: 'Head of Department', adminScope: 'department', canAccessAdmin: true },
  { id: 'dean1', role: 'dean', name: 'Prof. Angela Okorie', staffId: 'GOU/STF/2010/002', department: DEPT_CS, faculty: FACULTY, title: 'Dean, Natural Sciences', adminScope: 'faculty', canAccessAdmin: true },
  { id: 'adm1', role: 'admin', name: 'Dr. Emmanuel Nwankwo', staffId: 'GOU/STF/2015/019', department: 'Registry', faculty: 'Administration', title: 'Registrar (Systems)', adminScope: 'institution', canAccessAdmin: true },
  ...STUDENTS.filter((s) => s.studentId !== 's1').map((s) => ({
    id: s.studentId,
    role: 'student' as const,
    name: s.name,
    matric: `GOU/${s.department.slice(0, 3).toUpperCase()}/22/${s.studentId.slice(1)}`,
    department: s.department,
    faculty: s.faculty,
    level: s.level,
    canAccessAdmin: false,
  })),
]

export const users: Record<string, User> = {
  student: allUsers.find((u) => u.id === 's1')!,
  lecturer: allUsers.find((u) => u.id === 'l1')!,
  hod: allUsers.find((u) => u.id === 'hod1')!,
  dean: allUsers.find((u) => u.id === 'dean1')!,
  admin: allUsers.find((u) => u.id === 'adm1')!,
}

export const classInstances: ClassInstance[] = [
  {
    id: 'ci_1',
    courseCode: 'CSC 401',
    courseTitle: 'Compiler Design',
    venue: 'LT2, Faculty of Natural Sciences',
    lecturer: 'Dr. Nneka Okafor',
    lecturerIds: ['l1', 'l2'],
    windowOpenAt: relativeMinutes(-5),
    windowCloseAt: relativeMinutes(25),
    classStartAt: relativeMinutes(12),
    attendanceMode: 'window',
    status: 'active',
  },
  {
    id: 'ci_2',
    courseCode: 'CSC 302',
    courseTitle: 'Software Engineering',
    venue: 'Lab 3, CS Block',
    lecturer: 'Dr. Nneka Okafor',
    lecturerIds: ['l1'],
    windowOpenAt: relativeMinutes(180),
    windowCloseAt: relativeMinutes(210),
    classStartAt: relativeMinutes(195),
    attendanceMode: 'window',
    status: 'upcoming',
  },
  {
    id: 'ci_3',
    courseCode: 'MTH 201',
    courseTitle: 'Linear Algebra II',
    venue: 'Room 14, Science Block',
    lecturer: 'Prof. Emeka Udeh',
    lecturerIds: ['l3'],
    windowOpenAt: relativeMinutes(90),
    windowCloseAt: relativeMinutes(120),
    classStartAt: relativeMinutes(105),
    attendanceMode: 'window',
    status: 'upcoming',
  },
]

export const attendanceRecords: AttendanceRecord[] = [
  { id: 'ar_1', classInstanceId: 'sess_1', courseCode: 'CSC 401', studentId: 's1', studentName: 'Adaeze Okonkwo', presenceMethod: 'autonomous_gaa', verificationStatus: 'verified', accuracyMetres: 12, timestamp: daysAgo(1, 8, 52), disputeReason: null },
  { id: 'ar_2', classInstanceId: 'sess_2', courseCode: 'CSC 401', studentId: 's1', studentName: 'Adaeze Okonkwo', presenceMethod: 'autonomous_gaa', verificationStatus: 'verified', accuracyMetres: 8, timestamp: daysAgo(3, 9, 3), disputeReason: null },
  { id: 'ar_3', classInstanceId: 'sess_3', courseCode: 'CSC 302', studentId: 's1', studentName: 'Adaeze Okonkwo', presenceMethod: 'manual_student', verificationStatus: 'manual', accuracyMetres: null, timestamp: daysAgo(5, 9, 10), disputeReason: null },
  { id: 'ar_4', classInstanceId: 'sess_4', courseCode: 'CSC 401', studentId: 's1', studentName: 'Adaeze Okonkwo', presenceMethod: 'autonomous_gaa', verificationStatus: 'unverified', accuracyMetres: 340, timestamp: daysAgo(7, 8, 58), disputeReason: null },
  { id: 'ar_5', classInstanceId: 'sess_5', courseCode: 'MTH 201', studentId: 's1', studentName: 'Adaeze Okonkwo', presenceMethod: 'lecturer_requested', verificationStatus: 'manual', accuracyMetres: null, timestamp: daysAgo(8, 9, 25), disputeReason: null },
  { id: 'ar_6', classInstanceId: 'sess_6', courseCode: 'CSC 401', studentId: 's6', studentName: 'Ibrahim Musa', presenceMethod: 'autonomous_gaa', verificationStatus: 'disputed', accuracyMetres: 280, timestamp: daysAgo(2, 9, 5), disputeReason: 'I was in the lecture hall but my phone had no signal.' },
  { id: 'ar_7', classInstanceId: 'sess_7', courseCode: 'CSC 401', studentId: 's2', studentName: 'Chukwuemeka Nwosu', presenceMethod: 'manual_lecturer', verificationStatus: 'manual', accuracyMetres: null, timestamp: daysAgo(4, 9, 20), disputeReason: null },
]

export const lecturerRequests: LecturerRequest[] = [
  { id: 'lr_1', classInstanceId: 'ci_1', courseCode: 'CSC 401', studentId: 's4', studentName: 'Oluwaseun Adeyemi', requestedAt: relativeMinutes(-20), status: 'pending' },
]

export const timetable: TimetableSlot[] = [
  { id: 'tt_1', courseCode: 'CSC 401', courseTitle: 'Compiler Design', day: 'Monday', startTime: '09:00', endTime: '11:00', venue: 'LT2', level: '400', department: DEPT_CS, lecturerIds: ['l1', 'l2'], lecturerNames: ['Dr. Nneka Okafor', 'Dr. Samuel Eze'] },
  { id: 'tt_2', courseCode: 'CSC 302', courseTitle: 'Software Engineering', day: 'Monday', startTime: '14:00', endTime: '16:00', venue: 'Lab 3', level: '300', department: DEPT_CS, lecturerIds: ['l1'], lecturerNames: ['Dr. Nneka Okafor'] },
  { id: 'tt_3', courseCode: 'CSC 401', courseTitle: 'Compiler Design', day: 'Wednesday', startTime: '09:00', endTime: '11:00', venue: 'LT2', level: '400', department: DEPT_CS, lecturerIds: ['l1', 'l2'], lecturerNames: ['Dr. Nneka Okafor', 'Dr. Samuel Eze'] },
  { id: 'tt_4', courseCode: 'MTH 201', courseTitle: 'Linear Algebra II', day: 'Tuesday', startTime: '11:00', endTime: '13:00', venue: 'Room 14', level: '200', department: 'Mathematics', lecturerIds: ['l3'], lecturerNames: ['Prof. Emeka Udeh'] },
  { id: 'tt_5', courseCode: 'CSC 303', courseTitle: 'Database Systems', day: 'Thursday', startTime: '10:00', endTime: '12:00', venue: 'Lab 1', level: '300', department: DEPT_CS, lecturerIds: ['l2'], lecturerNames: ['Dr. Samuel Eze'] },
]

function buildCalendarForStudent(studentId: string): CalendarSession[] {
  const sessions: CalendarSession[] = []
  const courseCodes = Object.entries(enrollments)
    .filter(([, st]) => st.some((s) => s.studentId === studentId))
    .map(([code]) => code)

  for (let week = -4; week <= 2; week++) {
    for (const slot of timetable.filter((t) => courseCodes.includes(t.courseCode))) {
      const dayOffset = week * 7 + ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].indexOf(slot.day)
      const record = attendanceRecords.find(
        (r) => r.studentId === studentId && r.courseCode === slot.courseCode && Math.abs(new Date(r.timestamp).getDate() - new Date(dateOnly(dayOffset)).getDate()) < 2,
      )
      let status: CalendarSession['status'] = dayOffset < 0 ? 'missed' : dayOffset === 0 ? 'pending' : 'upcoming'
      if (record) status = 'present'
      if (dayOffset < -1 && !record) status = 'missed'

      sessions.push({
        id: `cal_${studentId}_${slot.id}_${week}`,
        courseCode: slot.courseCode,
        courseTitle: slot.courseTitle,
        date: dateOnly(dayOffset),
        startTime: slot.startTime,
        venue: slot.venue,
        studentId,
        status,
        presenceMethod: record?.presenceMethod,
        recordId: record?.id,
      })
    }
  }
  return sessions
}

export const calendarSessions: CalendarSession[] = buildCalendarForStudent('s1')

export const lecturerAttendance: LecturerAttendanceRecord[] = [
  { id: 'la_1', courseCode: 'CSC 401', courseTitle: 'Compiler Design', date: dateOnly(-7), lecturerId: 'l1', lecturerName: 'Dr. Nneka Okafor', tookAttendance: true, onTime: true },
  { id: 'la_2', courseCode: 'CSC 401', courseTitle: 'Compiler Design', date: dateOnly(-7), lecturerId: 'l2', lecturerName: 'Dr. Samuel Eze', tookAttendance: true, onTime: true },
  { id: 'la_3', courseCode: 'CSC 302', courseTitle: 'Software Engineering', date: dateOnly(-3), lecturerId: 'l1', lecturerName: 'Dr. Nneka Okafor', tookAttendance: false, onTime: false },
  { id: 'la_4', courseCode: 'CSC 401', courseTitle: 'Compiler Design', date: dateOnly(-1), lecturerId: 'l1', lecturerName: 'Dr. Nneka Okafor', tookAttendance: true, onTime: true },
]

export const hierarchy: HierarchyNode[] = [
  { role: 'admin', label: 'Registrar / Systems admin', canAccessApp: true, canAccessAdmin: true, adminSections: ['overview', 'reports', 'users', 'courses-admin', 'hierarchy', 'timetable-admin', 'lecturer-attendance'] },
  { role: 'dean', label: 'Dean', canAccessApp: true, canAccessAdmin: true, adminSections: ['overview', 'reports', 'users', 'courses-admin', 'timetable-admin', 'lecturer-attendance'], reportsTo: 'admin' },
  { role: 'hod', label: 'Head of Department', canAccessApp: true, canAccessAdmin: true, adminSections: ['overview', 'reports', 'users', 'courses-admin', 'timetable-admin', 'lecturer-attendance'], reportsTo: 'dean' },
  { role: 'lecturer', label: 'Lecturer', canAccessApp: true, canAccessAdmin: false, adminSections: [], reportsTo: 'hod' },
  { role: 'student', label: 'Student', canAccessApp: true, canAccessAdmin: false, adminSections: [], reportsTo: 'lecturer' },
]

export const classTimeProposals: ClassTimeProposal[] = [
  { id: 'ctp_1', courseCode: 'CSC 302', proposedBy: 'Dr. Nneka Okafor', proposedDay: 'Wednesday', proposedTime: '2:00 PM', status: 'pending', submittedAt: daysAgo(1, 14, 30) },
  { id: 'ctp_2', courseCode: 'PHY 203', proposedBy: 'Dr. Samuel Eze', proposedDay: 'Friday', proposedTime: '10:00 AM', status: 'pending', submittedAt: daysAgo(2, 11, 0) },
]

export const activityLog: ActivityEntry[] = [
  { id: 'act_1', timestamp: daysAgo(0, 8, 52), message: 'Adaeze Okonkwo checked in to CSC 401 — location confirmed' },
  { id: 'act_2', timestamp: daysAgo(0, 8, 48), message: 'Fatima Ibrahim checked in to CSC 401 — location confirmed' },
  { id: 'act_3', timestamp: daysAgo(1, 14, 30), message: 'Dr. Nneka Okafor proposed a new time for CSC 302' },
  { id: 'act_4', timestamp: daysAgo(2, 9, 5), message: 'Ibrahim Musa disputed an attendance record for CSC 401' },
  { id: 'act_5', timestamp: daysAgo(0, 7, 0), message: 'Alert: Dr. Nneka Okafor did not take attendance for CSC 302 on Monday' },
]

export function computeThresholdSummaries(enrollmentMap: Record<string, Enrollment[]>): ThresholdSummary[] {
  return courseCatalog.map(({ code, title }) => {
    const students = enrollmentMap[code] ?? []
    const above = students.filter((s) => s.attendancePct >= NUC_THRESHOLD).length
    return {
      courseCode: code,
      courseTitle: title,
      studentsAbove75: above,
      studentsBelow75: students.length - above,
      totalEnrolled: students.length,
    }
  }).filter((s) => s.totalEnrolled > 0)
}

export function createInitialState(role: keyof typeof users = 'student'): MandateState {
  return {
    currentUser: users[role],
    users: [...allUsers],
    courseCatalog: [...courseCatalog],
    classInstances: [...classInstances],
    enrollments,
    attendanceRecords: [...attendanceRecords],
    lecturerRequests: [...lecturerRequests],
    calendarSessions: [...calendarSessions],
    timetable: [...timetable],
    lecturerAttendance: [...lecturerAttendance],
    hierarchy: [...hierarchy],
    classTimeProposals: [...classTimeProposals],
    activityLog: [...activityLog],
    pendingSyncCount: 2,
  }
}

export function courseTitlesMap(catalog: CourseCatalogEntry[]): Record<string, string> {
  return Object.fromEntries(catalog.map((c) => [c.code, c.title]))
}

export function filterEnrollmentsByScope(
  enrollmentMap: Record<string, Enrollment[]>,
  user: User,
): Record<string, Enrollment[]> {
  if (user.role === 'admin' || user.adminScope === 'institution') return enrollmentMap
  if (user.adminScope === 'faculty') {
    const filtered: Record<string, Enrollment[]> = {}
    for (const [code, students] of Object.entries(enrollmentMap)) {
      const scoped = students.filter((s) => s.faculty === user.faculty)
      if (scoped.length) filtered[code] = scoped
    }
    return filtered
  }
  const filtered: Record<string, Enrollment[]> = {}
  for (const [code, students] of Object.entries(enrollmentMap)) {
    const scoped = students.filter((s) => s.department === user.department)
    if (scoped.length) filtered[code] = scoped
  }
  return filtered
}
