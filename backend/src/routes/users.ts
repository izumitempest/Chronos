import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import type { AuthRequest } from '../middleware/auth'

export const usersRouter = Router()

/**
 * GET /api/users
 * List users, optionally filtered by role or department
 */
usersRouter.get('/', async (req: AuthRequest, res: Response) => {
  const { role, department } = req.query

  const where: Record<string, string> = {}
  if (role) where.role = role as string
  if (department) where.department = department as string

  const users = await prisma.user.findMany({
    where,
    orderBy: { name: 'asc' },
    take: 100,
  })

  return res.json(users)
})

/**
 * GET /api/users/me
 * Current authenticated user's profile
 */
usersRouter.get('/me', async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) return res.status(404).json({ error: 'User not found' })
  return res.json(user)
})

/**
 * GET /api/users/:id
 */
usersRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: {
      enrollments: { include: { course: true } },
    },
  })
  if (!user) return res.status(404).json({ error: 'User not found' })
  return res.json(user)
})

/**
 * POST /api/users
 * Create a new user (admin only)
 */
usersRouter.post('/', async (req: AuthRequest, res: Response) => {
  const { role, name, department, faculty, level, title, matric, staffId, adminScope } = req.body

  if (!name || !role || !department || !faculty) {
    return res.status(400).json({ error: 'name, role, department, and faculty are required' })
  }

  const user = await prisma.user.create({
    data: { role, name, department, faculty, level, title, matric, staffId, adminScope },
  })

  return res.status(201).json(user)
})

/**
 * DELETE /api/users/:id
 */
usersRouter.delete('/:id', async (req: AuthRequest, res: Response) => {
  await prisma.user.delete({ where: { id: req.params.id } })
  return res.json({ ok: true })
})
