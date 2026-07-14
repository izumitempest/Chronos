import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import type { AuthRequest } from '../middleware/auth'

export const coursesRouter = Router()

/**
 * GET /api/courses
 * List all courses, optionally filtered by department
 */
coursesRouter.get('/', async (req: AuthRequest, res: Response) => {
  const { department, faculty } = req.query

  const where: Record<string, string> = {}
  if (department) where.department = department as string
  if (faculty) where.faculty = faculty as string

  const courses = await prisma.course.findMany({
    where,
    include: {
      lecturers: { include: { user: { select: { id: true, name: true } } } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { code: 'asc' },
  })

  return res.json(courses)
})

/**
 * GET /api/courses/:code
 */
coursesRouter.get('/:code', async (req: AuthRequest, res: Response) => {
  const course = await prisma.course.findUnique({
    where: { code: req.params.code as string },
    include: {
      lecturers: { include: { user: { select: { id: true, name: true } } } },
      enrollments: { include: { student: { select: { id: true, name: true, matric: true, level: true } } } },
      timetableSlots: true,
    },
  })

  if (!course) return res.status(404).json({ error: 'Course not found' })
  return res.json(course)
})

/**
 * POST /api/courses
 * Body: { code, title, level, department, faculty }
 */
coursesRouter.post('/', async (req: AuthRequest, res: Response) => {
  const { code, title, level, department, faculty } = req.body

  if (!code || !title) {
    return res.status(400).json({ error: 'code and title are required' })
  }

  const course = await prisma.course.create({
    data: {
      code,
      title,
      level: level || '400',
      department: department || 'Computer Science',
      faculty: faculty || 'Natural Sciences',
    },
  })

  return res.status(201).json(course)
})

/**
 * DELETE /api/courses/:code
 */
coursesRouter.delete('/:code', async (req: AuthRequest, res: Response) => {
  await prisma.course.delete({ where: { code: req.params.code as string } })
  return res.json({ ok: true })
})

/**
 * GET /api/courses/:code/enrollments
 * List all students enrolled in a course with their attendance percentages
 */
coursesRouter.get('/:code/enrollments', async (req: AuthRequest, res: Response) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { courseCode: req.params.code as string },
    include: {
      student: { select: { id: true, name: true, matric: true, level: true, department: true, faculty: true } },
    },
    orderBy: { student: { name: 'asc' } },
  })

  return res.json(enrollments)
})
