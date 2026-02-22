import { RequestHandler } from 'express'
import { Role } from '@prisma/client'

const roleMiddleware = (...roles: Role[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Acesso negado' })
      return
    }
    next()
  }
}

export default roleMiddleware
