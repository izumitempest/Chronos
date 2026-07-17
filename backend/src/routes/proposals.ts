import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import type { AuthRequest } from '../middleware/auth'

export const proposalsRouter = Router()

/**
 * GET /api/proposals
 * List all class time proposals.
 * If user is HOD/Dean, it could be filtered by department/faculty
 */
proposalsRouter.get('/', async (req: AuthRequest, res: Response) => {
  const proposals = await prisma.classTimeProposal.findMany({
    include: {
      course: true,
      proposedBy: { select: { id: true, name: true, role: true } },
    },
    orderBy: { submittedAt: 'desc' },
  })

  return res.json(proposals)
})

/**
 * POST /api/proposals
 * Submit a new class time proposal
 */
proposalsRouter.post('/', async (req: AuthRequest, res: Response) => {
  const { courseCode, proposedDay, proposedTime } = req.body
  const userId = req.userId!

  if (!courseCode || !proposedDay || !proposedTime) {
    return res.status(400).json({ error: 'courseCode, proposedDay, and proposedTime are required' })
  }

  const proposal = await prisma.classTimeProposal.create({
    data: {
      courseCode,
      proposedDay,
      proposedTime,
      proposedById: userId,
    },
    include: {
      course: true,
      proposedBy: { select: { id: true, name: true, role: true } },
    }
  })

  // Create an activity entry
  await prisma.activityEntry.create({
    data: {
      message: `${proposal.proposedBy.name} proposed a new time for ${courseCode}`,
    }
  })

  return res.status(201).json(proposal)
})

/**
 * POST /api/proposals/:id/approve
 * Approve a proposal
 */
proposalsRouter.post('/:id/approve', async (req: AuthRequest, res: Response) => {
  const { id } = req.params

  const proposal = await prisma.classTimeProposal.update({
    where: { id },
    data: { status: 'approved' },
  })

  await prisma.activityEntry.create({
    data: {
      message: `A class time proposal for ${proposal.courseCode} was approved`,
    }
  })

  return res.json(proposal)
})

/**
 * POST /api/proposals/:id/decline
 * Decline a proposal
 */
proposalsRouter.post('/:id/decline', async (req: AuthRequest, res: Response) => {
  const { id } = req.params

  const proposal = await prisma.classTimeProposal.update({
    where: { id },
    data: { status: 'declined' },
  })

  await prisma.activityEntry.create({
    data: {
      message: `A class time proposal for ${proposal.courseCode} was declined`,
    }
  })

  return res.json(proposal)
})
