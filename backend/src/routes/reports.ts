import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import type { AuthRequest } from '../middleware/auth'

const NUC_THRESHOLD = 75

export const reportsRouter = Router()

/**
 * GET /api/reports/thresholds
 * Per-course summary: how many students are above/below the NUC 75% threshold
 */
reportsRouter.get('/thresholds', async (req: AuthRequest, res: Response) => {
  const { department, faculty } = req.query

  const courseWhere: Record<string, string> = {}
  if (department) courseWhere.department = department as string
  if (faculty) courseWhere.faculty = faculty as string

  const courses = await prisma.course.findMany({
    where: courseWhere,
    include: {
      enrollments: true,
    },
  })

  const summaries = courses.map((course) => {
    const above = course.enrollments.filter((e) => e.attendancePct >= NUC_THRESHOLD).length
    const below = course.enrollments.filter((e) => e.attendancePct < NUC_THRESHOLD).length
    return {
      courseCode: course.code,
      courseTitle: course.title,
      studentsAbove75: above,
      studentsBelow75: below,
      totalEnrolled: course.enrollments.length,
    }
  })

  return res.json(summaries)
})

/**
 * GET /api/reports/at-risk
 * Students at risk of falling below the NUC threshold
 */
reportsRouter.get('/at-risk', async (req: AuthRequest, res: Response) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { attendancePct: { lt: NUC_THRESHOLD + 8 } },
    include: {
      student: { select: { id: true, name: true, matric: true, level: true, department: true } },
      course: { select: { code: true, title: true } },
    },
    orderBy: { attendancePct: 'asc' },
  })

  return res.json(enrollments)
})

/**
 * GET /api/reports/lecturer-attendance
 * Lecturer attendance tracking records
 */
reportsRouter.get('/lecturer-attendance', async (req: AuthRequest, res: Response) => {
  const records = await prisma.lecturerAttendanceRecord.findMany({
    include: {
      lecturer: { select: { id: true, name: true } },
      course: { select: { code: true, title: true } },
    },
    orderBy: { date: 'desc' },
    take: 50,
  })

  return res.json(records)
})

/**
 * GET /api/reports/activity-log
 */
reportsRouter.get('/activity-log', async (_req: AuthRequest, res: Response) => {
  const entries = await prisma.activityEntry.findMany({
    orderBy: { timestamp: 'desc' },
    take: 30,
  })

  return res.json(entries)
})
