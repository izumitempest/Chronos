import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import type { AuthRequest } from '../middleware/auth'

export const timetableRouter = Router()

/**
 * GET /api/timetable
 * Fetch the timetable slots.
 */
timetableRouter.get('/', async (req: AuthRequest, res: Response) => {
  const slots = await prisma.timetableSlot.findMany({
    include: {
      course: {
        include: {
          lecturers: {
            include: { user: { select: { id: true, name: true } } }
          }
        }
      }
    }
  })

  // Format response
  const formattedSlots = slots.map(slot => ({
    id: slot.id,
    courseCode: slot.courseCode,
    courseTitle: slot.course.title,
    day: slot.day,
    startTime: slot.startTime,
    endTime: slot.endTime,
    venue: slot.venue,
    level: slot.level,
    department: slot.department,
    lecturerIds: slot.course.lecturers.map(l => l.user.id),
    lecturerNames: slot.course.lecturers.map(l => l.user.name),
  }))

  return res.json(formattedSlots)
})

/**
 * PUT /api/timetable
 * Update the timetable (overwrite for simplicity in prototype)
 */
timetableRouter.put('/', async (req: AuthRequest, res: Response) => {
  const slots: any[] = req.body

  if (!Array.isArray(slots)) {
    return res.status(400).json({ error: 'Expected an array of slots' })
  }

  // Clear existing slots and recreate (for prototype simplicity)
  await prisma.timetableSlot.deleteMany({})

  const newSlots = await Promise.all(
    slots.map(slot => prisma.timetableSlot.create({
      data: {
        courseCode: slot.courseCode,
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        venue: slot.venue,
        level: slot.level,
        department: slot.department,
      }
    }))
  )

  await prisma.activityEntry.create({
    data: {
      message: 'Timetable was updated by admin',
    }
  })

  return res.json(newSlots)
})
