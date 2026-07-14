import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const FACULTY = 'Natural Sciences'
const DEPT_CS = 'Computer Science'

const now = new Date()

function relativeMinutes(offsetMin: number): Date {
  return new Date(now.getTime() + offsetMin * 60000)
}

function daysAgo(days: number, hour: number, minute: number): Date {
  const d = new Date(now)
  d.setDate(d.getDate() - days)
  d.setHours(hour, minute, 0, 0)
  return d
}

function dateOnly(daysFromNow: number): string {
  const d = new Date(now)
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().slice(0, 10)
}

async function main() {
  console.log('🌱 Seeding Mandate database...')

  // Clean
  await prisma.activityEntry.deleteMany()
  await prisma.classTimeProposal.deleteMany()
  await prisma.lecturerRequest.deleteMany()
  await prisma.attendanceRecord.deleteMany()
  await prisma.lecturerAttendanceRecord.deleteMany()
  await prisma.classInstance.deleteMany()
  await prisma.timetableSlot.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.courseLecturer.deleteMany()
  await prisma.hierarchyNode.deleteMany()
  await prisma.course.deleteMany()
  await prisma.user.deleteMany()

  // ─── Users ───────────────────────────────────────────────────────
  const pcts = [82, 61, 88, 74, 91, 58, 79, 67, 85, 72, 93, 55, 81, 69, 77, 64, 86, 71]

  const studentData = [
    { id: 's1',  name: 'Adaeze Okonkwo',    matric: 'GOU/CSC/22/1047', level: '400', department: DEPT_CS,       faculty: FACULTY },
    { id: 's2',  name: 'Chukwuemeka Nwosu',  matric: 'GOU/CSC/22/2',    level: '400', department: DEPT_CS,       faculty: FACULTY },
    { id: 's3',  name: 'Fatima Ibrahim',      matric: 'GOU/CSC/22/3',    level: '400', department: DEPT_CS,       faculty: FACULTY },
    { id: 's4',  name: 'Oluwaseun Adeyemi',  matric: 'GOU/CSC/22/4',    level: '300', department: DEPT_CS,       faculty: FACULTY },
    { id: 's5',  name: 'Ngozi Eze',          matric: 'GOU/CSC/22/5',    level: '300', department: DEPT_CS,       faculty: FACULTY },
    { id: 's6',  name: 'Ibrahim Musa',       matric: 'GOU/CSC/22/6',    level: '400', department: DEPT_CS,       faculty: FACULTY },
    { id: 's7',  name: 'Blessing Okafor',    matric: 'GOU/MAT/22/7',    level: '200', department: 'Mathematics', faculty: FACULTY },
    { id: 's8',  name: 'Tunde Bakare',       matric: 'GOU/PHY/22/8',    level: '200', department: 'Physics',     faculty: FACULTY },
    { id: 's9',  name: 'Amara Chukwu',       matric: 'GOU/CSC/22/9',    level: '400', department: DEPT_CS,       faculty: FACULTY },
    { id: 's10', name: 'Kelechi Obi',        matric: 'GOU/CSC/22/10',   level: '300', department: DEPT_CS,       faculty: FACULTY },
    { id: 's11', name: 'Zainab Abdullahi',   matric: 'GOU/BUS/22/11',   level: '100', department: 'Business Admin', faculty: 'Management Sciences' },
    { id: 's12', name: 'Emeka Okafor',       matric: 'GOU/CSC/22/12',   level: '400', department: DEPT_CS,       faculty: FACULTY },
    { id: 's13', name: 'Chioma Nwankwo',     matric: 'GOU/CSC/22/13',   level: '300', department: DEPT_CS,       faculty: FACULTY },
    { id: 's14', name: 'Yusuf Bello',        matric: 'GOU/MAT/22/14',   level: '200', department: 'Mathematics', faculty: FACULTY },
    { id: 's15', name: 'Grace Etim',         matric: 'GOU/CSC/22/15',   level: '400', department: DEPT_CS,       faculty: FACULTY },
    { id: 's16', name: 'Samuel Uche',        matric: 'GOU/CSC/22/16',   level: '300', department: DEPT_CS,       faculty: FACULTY },
    { id: 's17', name: 'Aisha Mohammed',     matric: 'GOU/CSC/22/17',   level: '400', department: DEPT_CS,       faculty: FACULTY },
    { id: 's18', name: 'David Anya',         matric: 'GOU/CSC/22/18',   level: '300', department: DEPT_CS,       faculty: FACULTY },
  ]

  for (const s of studentData) {
    await prisma.user.create({
      data: { id: s.id, role: 'student', name: s.name, matric: s.matric, department: s.department, faculty: s.faculty, level: s.level },
    })
  }

  const staffData = [
    { id: 'l1',    role: 'lecturer', name: 'Dr. Nneka Okafor',      staffId: 'GOU/STF/2019/044', department: DEPT_CS,   faculty: FACULTY, title: 'Senior Lecturer',            adminScope: null },
    { id: 'l2',    role: 'lecturer', name: 'Dr. Samuel Eze',        staffId: 'GOU/STF/2018/031', department: DEPT_CS,   faculty: FACULTY, title: 'Lecturer I',                  adminScope: null },
    { id: 'l3',    role: 'lecturer', name: 'Prof. Emeka Udeh',      staffId: 'GOU/STF/2016/022', department: 'Mathematics', faculty: FACULTY, title: 'Professor',               adminScope: null },
    { id: 'l4',    role: 'lecturer', name: 'Dr. Samuel Eze',        staffId: 'GOU/STF/2017/028', department: 'Physics', faculty: FACULTY, title: 'Lecturer II',                  adminScope: null },
    { id: 'l5',    role: 'lecturer', name: 'Dr. Grace Nnamani',     staffId: 'GOU/STF/2020/051', department: 'Business Admin', faculty: 'Management Sciences', title: 'Lecturer I', adminScope: null },
    { id: 'hod1',  role: 'hod',      name: 'Prof. Chidi Nwosu',     staffId: 'GOU/STF/2012/008', department: DEPT_CS,   faculty: FACULTY, title: 'Head of Department',           adminScope: 'department' },
    { id: 'dean1', role: 'dean',     name: 'Prof. Angela Okorie',   staffId: 'GOU/STF/2010/002', department: DEPT_CS,   faculty: FACULTY, title: 'Dean, Natural Sciences',       adminScope: 'faculty' },
    { id: 'adm1',  role: 'admin',    name: 'Dr. Emmanuel Nwankwo',  staffId: 'GOU/STF/2015/019', department: 'Registry', faculty: 'Administration', title: 'Registrar (Systems)', adminScope: 'institution' },
  ]

  for (const s of staffData) {
    await prisma.user.create({
      data: { id: s.id, role: s.role, name: s.name, staffId: s.staffId, department: s.department, faculty: s.faculty, title: s.title, adminScope: s.adminScope },
    })
  }

  console.log('  ✓ Users created')

  // ─── Courses ─────────────────────────────────────────────────────
  const courses = [
    { code: 'CSC 401', title: 'Compiler Design',                    level: '400', department: DEPT_CS,        faculty: FACULTY },
    { code: 'CSC 302', title: 'Software Engineering',               level: '300', department: DEPT_CS,        faculty: FACULTY },
    { code: 'MTH 201', title: 'Linear Algebra II',                  level: '200', department: 'Mathematics',  faculty: FACULTY },
    { code: 'PHY 203', title: 'Electromagnetism',                   level: '200', department: 'Physics',      faculty: FACULTY },
    { code: 'ENT 105', title: 'Introduction to Entrepreneurship',   level: '100', department: 'Business Admin', faculty: 'Management Sciences' },
    { code: 'CSC 303', title: 'Database Systems',                   level: '300', department: DEPT_CS,        faculty: FACULTY },
    { code: 'MTH 305', title: 'Numerical Methods',                  level: '300', department: 'Mathematics',  faculty: FACULTY },
    { code: 'PHY 301', title: 'Quantum Mechanics',                  level: '300', department: 'Physics',      faculty: FACULTY },
  ]

  for (const c of courses) {
    await prisma.course.create({ data: c })
  }

  // Course ↔ Lecturer links
  const courseLecturers = [
    { courseCode: 'CSC 401', userId: 'l1' },
    { courseCode: 'CSC 401', userId: 'l2' },
    { courseCode: 'CSC 302', userId: 'l1' },
    { courseCode: 'MTH 201', userId: 'l3' },
    { courseCode: 'PHY 203', userId: 'l4' },
    { courseCode: 'ENT 105', userId: 'l5' },
    { courseCode: 'CSC 303', userId: 'l2' },
    { courseCode: 'MTH 305', userId: 'l3' },
    { courseCode: 'PHY 301', userId: 'l4' },
  ]

  for (const cl of courseLecturers) {
    await prisma.courseLecturer.create({ data: cl })
  }

  console.log('  ✓ Courses created')

  // ─── Enrollments ─────────────────────────────────────────────────
  // Map: courseCode → which students (by index slice), matching frontend
  const enrollmentMap: Record<string, { offset: number; count: number }> = {
    'CSC 401': { offset: 0, count: 12 },
    'CSC 302': { offset: 2, count: 10 },
    'MTH 201': { offset: 1, count: 14 },
    'PHY 203': { offset: 3, count: 11 },
    'ENT 105': { offset: 0, count: 16 },
    'CSC 303': { offset: 4, count: 9 },
    'MTH 305': { offset: 6, count: 8 },
    'PHY 301': { offset: 8, count: 7 },
  }

  for (const [courseCode, { offset, count }] of Object.entries(enrollmentMap)) {
    const slice = studentData.slice(offset, offset + count)
    for (let i = 0; i < slice.length; i++) {
      const s = slice[i]
      const pctIdx = offset + i
      const pct = pcts[pctIdx % pcts.length]
      const projPct = Math.min(100, pct + (pctIdx % 3 === 0 ? 2 : pctIdx % 3 === 1 ? -3 : 0))
      await prisma.enrollment.create({
        data: { studentId: s.id, courseCode, attendancePct: pct, projectedPct: projPct },
      })
    }
  }

  console.log('  ✓ Enrollments created')

  // ─── Class Instances ─────────────────────────────────────────────
  await prisma.classInstance.createMany({
    data: [
      { id: 'ci_1', courseCode: 'CSC 401', venue: 'LT2, Faculty of Natural Sciences', windowOpenAt: relativeMinutes(-5), windowCloseAt: relativeMinutes(25), classStartAt: relativeMinutes(12), status: 'active' },
      { id: 'ci_2', courseCode: 'CSC 302', venue: 'Lab 3, CS Block', windowOpenAt: relativeMinutes(180), windowCloseAt: relativeMinutes(210), classStartAt: relativeMinutes(195), status: 'upcoming' },
      { id: 'ci_3', courseCode: 'MTH 201', venue: 'Room 14, Science Block', windowOpenAt: relativeMinutes(90), windowCloseAt: relativeMinutes(120), classStartAt: relativeMinutes(105), status: 'upcoming' },
    ],
  })

  // Historical sessions (closed) for attendance records
  await prisma.classInstance.createMany({
    data: [
      { id: 'sess_1', courseCode: 'CSC 401', venue: 'LT2', windowOpenAt: daysAgo(1, 8, 30), windowCloseAt: daysAgo(1, 9, 0), classStartAt: daysAgo(1, 8, 45), status: 'closed' },
      { id: 'sess_2', courseCode: 'CSC 401', venue: 'LT2', windowOpenAt: daysAgo(3, 8, 45), windowCloseAt: daysAgo(3, 9, 15), classStartAt: daysAgo(3, 9, 0), status: 'closed' },
      { id: 'sess_3', courseCode: 'CSC 302', venue: 'Lab 3', windowOpenAt: daysAgo(5, 8, 50), windowCloseAt: daysAgo(5, 9, 20), classStartAt: daysAgo(5, 9, 5), status: 'closed' },
      { id: 'sess_4', courseCode: 'CSC 401', venue: 'LT2', windowOpenAt: daysAgo(7, 8, 40), windowCloseAt: daysAgo(7, 9, 10), classStartAt: daysAgo(7, 8, 55), status: 'closed' },
      { id: 'sess_5', courseCode: 'MTH 201', venue: 'Room 14', windowOpenAt: daysAgo(8, 9, 0), windowCloseAt: daysAgo(8, 9, 30), classStartAt: daysAgo(8, 9, 15), status: 'closed' },
      { id: 'sess_6', courseCode: 'CSC 401', venue: 'LT2', windowOpenAt: daysAgo(2, 8, 45), windowCloseAt: daysAgo(2, 9, 15), classStartAt: daysAgo(2, 9, 0), status: 'closed' },
      { id: 'sess_7', courseCode: 'CSC 401', venue: 'LT2', windowOpenAt: daysAgo(4, 9, 0), windowCloseAt: daysAgo(4, 9, 30), classStartAt: daysAgo(4, 9, 15), status: 'closed' },
    ],
  })

  console.log('  ✓ Class instances created')

  // ─── Attendance Records ──────────────────────────────────────────
  await prisma.attendanceRecord.createMany({
    data: [
      { id: 'ar_1', classInstanceId: 'sess_1', studentId: 's1', presenceMethod: 'autonomous_gaa', verificationStatus: 'verified', accuracyMetres: 12, timestamp: daysAgo(1, 8, 52) },
      { id: 'ar_2', classInstanceId: 'sess_2', studentId: 's1', presenceMethod: 'autonomous_gaa', verificationStatus: 'verified', accuracyMetres: 8, timestamp: daysAgo(3, 9, 3) },
      { id: 'ar_3', classInstanceId: 'sess_3', studentId: 's1', presenceMethod: 'manual_student', verificationStatus: 'manual', accuracyMetres: null, timestamp: daysAgo(5, 9, 10) },
      { id: 'ar_4', classInstanceId: 'sess_4', studentId: 's1', presenceMethod: 'autonomous_gaa', verificationStatus: 'unverified', accuracyMetres: 340, timestamp: daysAgo(7, 8, 58) },
      { id: 'ar_5', classInstanceId: 'sess_5', studentId: 's1', presenceMethod: 'lecturer_requested', verificationStatus: 'manual', accuracyMetres: null, timestamp: daysAgo(8, 9, 25) },
      { id: 'ar_6', classInstanceId: 'sess_6', studentId: 's6', presenceMethod: 'autonomous_gaa', verificationStatus: 'disputed', accuracyMetres: 280, timestamp: daysAgo(2, 9, 5), disputeReason: 'I was in the lecture hall but my phone had no signal.' },
      { id: 'ar_7', classInstanceId: 'sess_7', studentId: 's2', presenceMethod: 'manual_lecturer', verificationStatus: 'manual', accuracyMetres: null, timestamp: daysAgo(4, 9, 20) },
    ],
  })

  console.log('  ✓ Attendance records created')

  // ─── Lecturer Requests ───────────────────────────────────────────
  await prisma.lecturerRequest.create({
    data: { id: 'lr_1', classInstanceId: 'ci_1', studentId: 's4', status: 'pending', requestedAt: relativeMinutes(-20) },
  })

  // ─── Timetable Slots ────────────────────────────────────────────
  await prisma.timetableSlot.createMany({
    data: [
      { id: 'tt_1', courseCode: 'CSC 401', day: 'Monday',    startTime: '09:00', endTime: '11:00', venue: 'LT2',     level: '400', department: DEPT_CS },
      { id: 'tt_2', courseCode: 'CSC 302', day: 'Monday',    startTime: '14:00', endTime: '16:00', venue: 'Lab 3',   level: '300', department: DEPT_CS },
      { id: 'tt_3', courseCode: 'CSC 401', day: 'Wednesday', startTime: '09:00', endTime: '11:00', venue: 'LT2',     level: '400', department: DEPT_CS },
      { id: 'tt_4', courseCode: 'MTH 201', day: 'Tuesday',   startTime: '11:00', endTime: '13:00', venue: 'Room 14', level: '200', department: 'Mathematics' },
      { id: 'tt_5', courseCode: 'CSC 303', day: 'Thursday',  startTime: '10:00', endTime: '12:00', venue: 'Lab 1',   level: '300', department: DEPT_CS },
    ],
  })

  console.log('  ✓ Timetable slots created')

  // ─── Lecturer Attendance ─────────────────────────────────────────
  await prisma.lecturerAttendanceRecord.createMany({
    data: [
      { id: 'la_1', courseCode: 'CSC 401', date: dateOnly(-7), lecturerId: 'l1', tookAttendance: true,  onTime: true },
      { id: 'la_2', courseCode: 'CSC 401', date: dateOnly(-7), lecturerId: 'l2', tookAttendance: true,  onTime: true },
      { id: 'la_3', courseCode: 'CSC 302', date: dateOnly(-3), lecturerId: 'l1', tookAttendance: false, onTime: false },
      { id: 'la_4', courseCode: 'CSC 401', date: dateOnly(-1), lecturerId: 'l1', tookAttendance: true,  onTime: true },
    ],
  })

  // ─── Hierarchy ───────────────────────────────────────────────────
  await prisma.hierarchyNode.createMany({
    data: [
      { role: 'admin',    label: 'Registrar / Systems admin', canAccessApp: true, canAccessAdmin: true,  adminSections: 'overview,reports,users,courses-admin,hierarchy,timetable-admin,lecturer-attendance' },
      { role: 'dean',     label: 'Dean',                      canAccessApp: true, canAccessAdmin: true,  adminSections: 'overview,reports,users,courses-admin,timetable-admin,lecturer-attendance', reportsTo: 'admin' },
      { role: 'hod',      label: 'Head of Department',        canAccessApp: true, canAccessAdmin: true,  adminSections: 'overview,reports,users,courses-admin,timetable-admin,lecturer-attendance', reportsTo: 'dean' },
      { role: 'lecturer', label: 'Lecturer',                  canAccessApp: true, canAccessAdmin: false, adminSections: '', reportsTo: 'hod' },
      { role: 'student',  label: 'Student',                   canAccessApp: true, canAccessAdmin: false, adminSections: '', reportsTo: 'lecturer' },
    ],
  })

  // ─── Class Time Proposals ────────────────────────────────────────
  await prisma.classTimeProposal.createMany({
    data: [
      { id: 'ctp_1', courseCode: 'CSC 302', proposedById: 'l1', proposedDay: 'Wednesday', proposedTime: '2:00 PM', status: 'pending', submittedAt: daysAgo(1, 14, 30) },
      { id: 'ctp_2', courseCode: 'PHY 203', proposedById: 'l4', proposedDay: 'Friday',    proposedTime: '10:00 AM', status: 'pending', submittedAt: daysAgo(2, 11, 0) },
    ],
  })

  // ─── Activity Log ────────────────────────────────────────────────
  await prisma.activityEntry.createMany({
    data: [
      { id: 'act_1', timestamp: daysAgo(0, 8, 52), message: 'Adaeze Okonkwo checked in to CSC 401 — location confirmed' },
      { id: 'act_2', timestamp: daysAgo(0, 8, 48), message: 'Fatima Ibrahim checked in to CSC 401 — location confirmed' },
      { id: 'act_3', timestamp: daysAgo(1, 14, 30), message: 'Dr. Nneka Okafor proposed a new time for CSC 302' },
      { id: 'act_4', timestamp: daysAgo(2, 9, 5),  message: 'Ibrahim Musa disputed an attendance record for CSC 401' },
      { id: 'act_5', timestamp: daysAgo(0, 7, 0),  message: 'Alert: Dr. Nneka Okafor did not take attendance for CSC 302 on Monday' },
    ],
  })

  console.log('  ✓ Seed data complete')
  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
