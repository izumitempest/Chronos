export const EXCEL_TEMPLATES = {
  users: {
    filename: 'mandate-users-template.xlsx',
    headers: [
      'Name',
      'Role',
      'Matric/Staff ID',
      'Level',
      'Department',
      'Faculty',
      'Course codes (lecturers)',
      'Can access admin',
    ],
    sample: [
      ['Adaeze Okonkwo', 'student', 'GOU/CSC/22/1047', '400', 'Computer Science', 'Natural Sciences', '', 'no'],
      ['Dr. Nneka Okafor', 'lecturer', 'GOU/STF/2019/044', '', 'Computer Science', 'Natural Sciences', 'CSC 401; CSC 302', 'no'],
    ],
  },
  courses: {
    filename: 'mandate-courses-template.xlsx',
    headers: ['Code', 'Title', 'Level', 'Department', 'Faculty', 'Lecturers'],
    sample: [
      ['CSC 401', 'Compiler Design', '400', 'Computer Science', 'Natural Sciences', 'Dr. Nneka Okafor'],
    ],
  },
  hierarchy: {
    filename: 'mandate-hierarchy-template.xlsx',
    headers: ['Role', 'Label', 'Can access app', 'Can access admin', 'Admin sections', 'Reports to'],
    sample: [
      ['student', 'Student', 'yes', 'no', '', 'lecturer'],
      ['hod', 'Head of Department', 'yes', 'yes', 'overview;reports;users', 'dean'],
    ],
  },
} as const

export const VERIFICATION_V1 = {
  title: 'How check-in works in v1',
  layers: [
    'Building-level GPS geofence',
    'Campus Wi-Fi BSSID check (connected network)',
    'Lecturer-displayed rotating OTP (GPS-gated)',
  ],
  beta: ['Ultrasonic chirp', 'BLE advertising'],
  note: 'Any two of the three v1 checks must pass. Manual check-in is for when background attendance cannot run; lecturer mark is the final fallback.',
}
