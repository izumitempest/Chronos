import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import { generateToken } from '../middleware/auth'

export const authRouter = Router()

/**
 * POST /api/auth/login
 * Body: { staffId?: string, matric?: string }
 * Returns a JWT token + user info.
 * For the hackathon demo, any known staffId or matric is accepted without a password.
 */
authRouter.post('/login', async (req, res: Response) => {
  const { staffId, matric } = req.body

  if (!staffId && !matric) {
    return res.status(400).json({ error: 'Provide staffId or matric' })
  }

  const user = await prisma.user.findFirst({
    where: staffId ? { staffId } : { matric },
  })

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  const token = generateToken(user.id, user.role)

  return res.json({
    token,
    user: {
      id: user.id,
      role: user.role,
      name: user.name,
      department: user.department,
      faculty: user.faculty,
      level: user.level,
      title: user.title,
      matric: user.matric,
      staffId: user.staffId,
      adminScope: user.adminScope,
    },
  })
})

/**
 * POST /api/auth/demo-switch
 * Body: { role: string }
 * Quick role-switch for the demo — returns the first user with that role.
 */
authRouter.post('/demo-switch', async (req, res: Response) => {
  const { role } = req.body
  if (!role) {
    return res.status(400).json({ error: 'Provide a role' })
  }

  const user = await prisma.user.findFirst({ where: { role } })
  if (!user) {
    return res.status(404).json({ error: `No user with role "${role}"` })
  }

  const token = generateToken(user.id, user.role)
  return res.json({ token, user })
})
