import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'mandate-hackathon-secret-change-in-prod'

export interface AuthRequest extends Request {
  userId?: string
  userRole?: string
}

/**
 * Dual auth middleware: supports both JWT (Authorization: Bearer <token>)
 * and simple header auth (x-user-id: <userId>) for demo/prototype use.
 *
 * JWT takes priority if both are present.
 */
export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  // 1. Try JWT first
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
      req.userId = payload.userId
      req.userRole = payload.role
      return next()
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
  }

  // 2. Fallback: x-user-id header (prototype/demo mode)
  const headerUserId = req.headers['x-user-id'] as string | undefined
  if (headerUserId) {
    const user = await prisma.user.findUnique({ where: { id: headerUserId } })
    if (!user) {
      return res.status(401).json({ error: 'Unknown user ID' })
    }
    req.userId = user.id
    req.userRole = user.role
    return next()
  }

  return res.status(401).json({ error: 'Authentication required. Send Authorization: Bearer <token> or x-user-id header.' })
}

export function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' })
}
