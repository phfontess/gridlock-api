import express from 'express'
import helmet from 'helmet'
import cors from 'cors'

import authRoutes from './modules/auth/auth.routes'
import usersRoutes from './modules/users/users.routes'
import eventsRoutes from './modules/events/events.routes'
import chatRoutes from './modules/chat/chat.routes'
import moderationRoutes from './modules/moderation/moderation.routes'

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/users', usersRoutes)
app.use('/events', eventsRoutes)
app.use('/chat', chatRoutes)
app.use('/moderation', moderationRoutes)

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

export default app
