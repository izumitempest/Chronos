import * as XLSX from 'xlsx'
import type { Enrollment } from '../data/types'
import { NUC_THRESHOLD } from '../data/types'

export function downloadExcel(
  filename: string,
  sheetName: string,
  rows: Record<string, string | number>[],
) {
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, filename)
}

export function downloadTemplate(
  filename: string,
  headers: string[],
  sampleRows: string[][],
) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Template')
  XLSX.writeFile(wb, filename)
}

export function isOnTrack(pct: number): boolean {
  return pct >= NUC_THRESHOLD
}

export function isAtRisk(pct: number): boolean {
  return pct < NUC_THRESHOLD + 8
}

export function eligibilityLabel(pct: number): string {
  if (pct >= NUC_THRESHOLD) return 'Above threshold'
  if (pct >= NUC_THRESHOLD - 5) return 'At risk'
  return 'Below threshold'
}

export function buildStudentReportRows(
  enrollments: Record<string, Enrollment[]>,
  courseTitles: Record<string, string>,
  filter?: 'all' | 'on-track' | 'at-risk' | 'above',
) {
  const rows: Record<string, string | number>[] = []

  for (const [courseCode, students] of Object.entries(enrollments)) {
    for (const s of students) {
      const pct = s.projectedPct ?? s.attendancePct
      const onTrack = isOnTrack(pct)
      const atRisk = isAtRisk(pct) && !onTrack

      if (filter === 'on-track' && !onTrack) continue
      if (filter === 'above' && !onTrack) continue
      if (filter === 'at-risk' && !atRisk && onTrack) continue
      if (filter === 'at-risk' && onTrack) continue

      rows.push({
        Student: s.name,
        'Student ID': s.studentId,
        Level: s.level,
        Department: s.department,
        Course: courseCode,
        'Course title': courseTitles[courseCode] ?? courseCode,
        'Current %': s.attendancePct,
        'Projected %': pct,
        Status: eligibilityLabel(pct),
        'Eligible for exams': onTrack ? 'Yes' : 'No',
      })
    }
  }

  return rows
}

export function buildDepartmentReportRows(
  enrollments: Record<string, Enrollment[]>,
  courseTitles: Record<string, string>,
  department?: string,
) {
  const studentMap = new Map<string, Enrollment & { courses: { code: string; pct: number }[] }>()

  for (const [courseCode, students] of Object.entries(enrollments)) {
    for (const s of students) {
      if (department && s.department !== department) continue
      const existing = studentMap.get(s.studentId)
      if (existing) {
        existing.courses.push({ code: courseCode, pct: s.attendancePct })
      } else {
        studentMap.set(s.studentId, { ...s, courses: [{ code: courseCode, pct: s.attendancePct }] })
      }
    }
  }

  return [...studentMap.values()].map((s) => {
    const courseCols: Record<string, string | number> = {}
    for (const c of s.courses) {
      courseCols[c.code] = `${c.pct}%`
    }
    const belowAny = s.courses.some((c) => c.pct < NUC_THRESHOLD)
    return {
      Name: s.name,
      'Student ID': s.studentId,
      Level: s.level,
      Department: s.department,
      Faculty: s.faculty,
      ...courseCols,
      'Below threshold in any course': belowAny ? 'Yes' : 'No',
    }
  })
}

export function presenceMethodLabel(method?: string): string {
  switch (method) {
    case 'autonomous_gaa':
      return 'Automatic'
    case 'manual_student':
      return 'Manual (in app)'
    case 'manual_lecturer':
      return 'Marked by lecturer'
    case 'lecturer_requested':
      return 'Forwarded to lecturer'
    default:
      return '—'
  }
}
