import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { attendanceRouter } from './routes/attendance'
import { classesRouter } from './routes/classes'
import { usersRouter } from './routes/users'
import { coursesRouter } from './routes/courses'
import { reportsRouter } from './routes/reports'
import { authRouter } from './routes/auth'
import { enrollmentsRouter } from './routes/enrollments'
import { proposalsRouter } from './routes/proposals'
import { timetableRouter } from './routes/timetable'
import { authMiddleware } from './middleware/auth'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mandate-api', timestamp: new Date().toISOString() })
})

// Auth routes (login — no middleware needed)
app.use('/api/auth', authRouter)

// Protected routes
app.use('/api/attendance', authMiddleware, attendanceRouter)
app.use('/api/classes', authMiddleware, classesRouter)
app.use('/api/users', authMiddleware, usersRouter)
app.use('/api/courses', authMiddleware, coursesRouter)
app.use('/api/reports', authMiddleware, reportsRouter)
app.use('/api/enrollments', authMiddleware, enrollmentsRouter)
app.use('/api/proposals', authMiddleware, proposalsRouter)
app.use('/api/timetable', authMiddleware, timetableRouter)

app.listen(PORT, () => {
  console.log(`Mandate API running on http://localhost:${PORT}`)
})

export default app
