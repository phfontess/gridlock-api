import 'dotenv/config'
import http from 'http'
import { Server } from 'socket.io'
import app from './app'

interface MessagePayload {
  eventId: string
  message: string
}

const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: '*' },
})

io.on('connection', (socket) => {
  console.log('Socket conectado:', socket.id)

  socket.on('join:event', (eventId: string) => {
    socket.join(`event:${eventId}`)
  })

  socket.on('event:message', ({ eventId, message }: MessagePayload) => {
    io.to(`event:${eventId}`).emit('event:message', message)
  })

  socket.on('disconnect', () => {
    console.log('Socket desconectado:', socket.id)
  })
})

const PORT = process.env.PORT ?? 3000
server.listen(PORT, () => {
  console.log(`GRIDLOCK API rodando na porta ${PORT}`)
})
