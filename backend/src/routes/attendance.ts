import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import type { AuthRequest } from '../middleware/auth'

export const attendanceRouter = Router()

/**
 * POST /api/attendance/check-in
 * Body: { classInstanceId, latitude?, longitude?, accuracyMetres? }
 */
attendanceRouter.post('/check-in', async (req: AuthRequest, res: Response) => {
  const userId = req.userId!
  const { classInstanceId, accuracyMetres } = req.body

  if (!classInstanceId) {
    return res.status(400).json({ error: 'classInstanceId is required' })
  }

  const ci = await prisma.classInstance.findUnique({ where: { id: classInstanceId } })
  if (!ci) {
    return res.status(404).json({ error: 'Class instance not found' })
  }

  // Check for duplicate
  const existing = await prisma.attendanceRecord.findFirst({
    where: { classInstanceId, studentId: userId },
  })
  if (existing) {
    return res.status(409).json({ error: 'Already checked in', record: existing })
  }

  // Location verification logic (simplified for prototype)
  const accuracy = accuracyMetres ?? null
  const verified = accuracy !== null && accuracy <= 50
  const verificationStatus = verified ? 'verified' : 'unverified'

  const record = await prisma.attendanceRecord.create({
    data: {
      classInstanceId,
      studentId: userId,
      presenceMethod: 'autonomous_gaa',
      verificationStatus,
      accuracyMetres: accuracy,
    },
  })

  return res.status(201).json(record)
})

/**
 * POST /api/attendance/manual
 * Body: { classInstanceId }
 * Manual in-app check-in (student taps "I'm here" without GPS)
 */
attendanceRouter.post('/manual', async (req: AuthRequest, res: Response) => {
  const userId = req.userId!
  const { classInstanceId } = req.body

  if (!classInstanceId) {
    return res.status(400).json({ error: 'classInstanceId is required' })
  }

  const existing = await prisma.attendanceRecord.findFirst({
    where: { classInstanceId, studentId: userId },
  })
  if (existing) {
    return res.status(409).json({ error: 'Already checked in', record: existing })
  }

  const record = await prisma.attendanceRecord.create({
    data: {
      classInstanceId,
      studentId: userId,
      presenceMethod: 'manual_student',
      verificationStatus: 'manual',
      accuracyMetres: null,
    },
  })

  return res.status(201).json(record)
})

/**
 * POST /api/attendance/request-lecturer
 * Body: { classInstanceId }
 * Student requests their lecturer to mark them present
 */
attendanceRouter.post('/request-lecturer', async (req: AuthRequest, res: Response) => {
  const userId = req.userId!
  const { classInstanceId } = req.body

  if (!classInstanceId) {
    return res.status(400).json({ error: 'classInstanceId is required' })
  }

  const existing = await prisma.lecturerRequest.findFirst({
    where: { classInstanceId, studentId: userId, status: 'pending' },
  })
  if (existing) {
    return res.status(409).json({ error: 'Request already pending' })
  }

  const request = await prisma.lecturerRequest.create({
    data: { classInstanceId, studentId: userId },
  })

  return res.status(201).json(request)
})

/**
 * POST /api/attendance/fulfill-request
 * Body: { requestId }
 * Lecturer fulfills a student's attendance request
 */
attendanceRouter.post('/fulfill-request', async (req: AuthRequest, res: Response) => {
  const { requestId } = req.body

  const request = await prisma.lecturerRequest.findUnique({ where: { id: requestId } })
  if (!request || request.status !== 'pending') {
    return res.status(404).json({ error: 'Pending request not found' })
  }

  const [updatedRequest, record] = await prisma.$transaction([
    prisma.lecturerRequest.update({
      where: { id: requestId },
      data: { status: 'fulfilled' },
    }),
    prisma.attendanceRecord.create({
      data: {
        classInstanceId: request.classInstanceId,
        studentId: request.studentId,
        presenceMethod: 'lecturer_requested',
        verificationStatus: 'manual',
        accuracyMetres: null,
      },
    }),
  ])

  return res.json({ request: updatedRequest, record })
})

/**
 * POST /api/attendance/mark-present
 * Body: { studentId, classInstanceId }
 * Lecturer manually marks a student present
 */
attendanceRouter.post('/mark-present', async (req: AuthRequest, res: Response) => {
  const { studentId, classInstanceId } = req.body

  if (!studentId || !classInstanceId) {
    return res.status(400).json({ error: 'studentId and classInstanceId are required' })
  }

  const record = await prisma.attendanceRecord.create({
    data: {
      classInstanceId,
      studentId,
      presenceMethod: 'manual_lecturer',
      verificationStatus: 'manual',
      accuracyMetres: null,
    },
  })

  return res.status(201).json(record)
})

/**
 * POST /api/attendance/dispute
 * Body: { recordId, reason }
 */
attendanceRouter.post('/dispute', async (req: AuthRequest, res: Response) => {
  const { recordId, reason } = req.body

  if (!recordId || !reason) {
    return res.status(400).json({ error: 'recordId and reason are required' })
  }

  const record = await prisma.attendanceRecord.update({
    where: { id: recordId },
    data: { verificationStatus: 'disputed', disputeReason: reason },
  })

  return res.json(record)
})

/**
 * POST /api/attendance/resolve-dispute
 * Body: { recordId, note }
 * HOD resolves a disputed record
 */
attendanceRouter.post('/resolve-dispute', async (req: AuthRequest, res: Response) => {
  const { recordId, note } = req.body

  if (!recordId) {
    return res.status(400).json({ error: 'recordId is required' })
  }

  const record = await prisma.attendanceRecord.update({
    where: { id: recordId },
    data: { verificationStatus: 'verified', hodNote: note || null },
  })

  return res.json(record)
})

/**
 * GET /api/attendance/records?classInstanceId=xxx
 * Get all attendance records for a class instance
 */
attendanceRouter.get('/records', async (req: AuthRequest, res: Response) => {
  const { classInstanceId, studentId } = req.query

  const where: Record<string, string> = {}
  if (classInstanceId) where.classInstanceId = classInstanceId as string
  if (studentId) where.studentId = studentId as string

  const records = await prisma.attendanceRecord.findMany({
    where,
    include: { student: { select: { name: true, matric: true } } },
    orderBy: { timestamp: 'desc' },
  })

  return res.json(records)
})
