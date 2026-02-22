import { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

interface JwtPayload {
  id: string
  role: string
}

const authMiddleware: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não fornecido' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    req.user = { id: decoded.id, role: decoded.role as import('@prisma/client').Role }
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}

export default authMiddleware
