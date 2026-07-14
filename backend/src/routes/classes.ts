import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import type { AuthRequest } from '../middleware/auth'

export const classesRouter = Router()

/**
 * GET /api/classes/active
 * Returns currently active class instances for the authenticated user.
 * For students: classes they're enrolled in.
 * For lecturers: classes they teach.
 */
classesRouter.get('/active', async (req: AuthRequest, res: Response) => {
  const userId = req.userId!
  const role = req.userRole

  let classInstances

  if (role === 'lecturer') {
    // Find courses this lecturer teaches
    const lecturerCourses = await prisma.courseLecturer.findMany({
      where: { userId },
      select: { courseCode: true },
    })
    const courseCodes = lecturerCourses.map((c) => c.courseCode)

    classInstances = await prisma.classInstance.findMany({
      where: {
        courseCode: { in: courseCodes },
        status: { in: ['active', 'upcoming'] },
      },
      include: { course: true },
      orderBy: { classStartAt: 'asc' },
    })
  } else {
    // Students — find enrolled courses
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: userId },
      select: { courseCode: true },
    })
    const courseCodes = enrollments.map((e) => e.courseCode)

    classInstances = await prisma.classInstance.findMany({
      where: {
        courseCode: { in: courseCodes },
        status: { in: ['active', 'upcoming'] },
      },
      include: { course: true },
      orderBy: { classStartAt: 'asc' },
    })
  }

  return res.json(classInstances)
})

/**
 * GET /api/classes/:id
 * Get a single class instance with its attendance records
 */
classesRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params

  const classInstance = await prisma.classInstance.findUnique({
    where: { id },
    include: {
      course: true,
      attendanceRecords: {
        include: { student: { select: { id: true, name: true, matric: true } } },
        orderBy: { timestamp: 'desc' },
      },
      lecturerRequests: {
        where: { status: 'pending' },
        include: { student: { select: { id: true, name: true, matric: true } } },
      },
    },
  })

  if (!classInstance) {
    return res.status(404).json({ error: 'Class instance not found' })
  }

  return res.json(classInstance)
})

/**
 * GET /api/classes
 * List all class instances (with optional filters)
 */
classesRouter.get('/', async (req: AuthRequest, res: Response) => {
  const { status, courseCode } = req.query

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (courseCode) where.courseCode = courseCode

  const instances = await prisma.classInstance.findMany({
    where,
    include: { course: true },
    orderBy: { classStartAt: 'desc' },
    take: 50,
  })

  return res.json(instances)
})
