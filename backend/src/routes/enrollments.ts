import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import type { AuthRequest } from '../middleware/auth'

export const enrollmentsRouter = Router()

/**
 * GET /api/enrollments/scoped
 * Returns a mapping of courseCode -> Enrollment[]
 */
enrollmentsRouter.get('/scoped', async (req: AuthRequest, res: Response) => {
  const role = req.userRole
  const userId = req.userId!

  // Fetch the current user to get their department/faculty/adminScope
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return res.status(404).json({ error: 'User not found' })

  // Find enrollments based on admin scope
  const where: any = {}
  
  if (role !== 'admin' && user.adminScope !== 'institution') {
    if (user.adminScope === 'faculty') {
      where.student = { faculty: user.faculty }
    } else {
      // Default to department level for HODs and lecturers viewing reports
      where.student = { department: user.department }
    }
  }

  const enrollments = await prisma.enrollment.findMany({
    where,
    include: {
      student: {
        select: {
          id: true,
          name: true,
          level: true,
          department: true,
          faculty: true,
        }
      }
    }
  })

  // Format into Record<string, Enrollment[]>
  const formatted: Record<string, any[]> = {}
  
  for (const e of enrollments) {
    if (!formatted[e.courseCode]) {
      formatted[e.courseCode] = []
    }
    
    formatted[e.courseCode].push({
      studentId: e.student.id,
      name: e.student.name,
      attendancePct: e.attendancePct,
      level: e.student.level || '',
      department: e.student.department,
      faculty: e.student.faculty,
      projectedPct: e.projectedPct,
    })
  }

  return res.json(formatted)
})
