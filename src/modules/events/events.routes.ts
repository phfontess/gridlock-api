import { Router } from 'express'
import authMiddleware from '../../middlewares/auth.middleware'
import roleMiddleware from '../../middlewares/role.middleware'
import { Role } from '@prisma/client'
import {
  createEvent,
  listEvents,
  getEvent,
  updateEvent,
  cancelEvent,
  joinEvent,
  listParticipants,
} from './events.controller'

const router = Router()

router.post('/', authMiddleware, roleMiddleware(Role.ORGANIZER, Role.ADMIN), createEvent)
router.get('/', authMiddleware, listEvents)
router.get('/:id', authMiddleware, getEvent)
router.put('/:id', authMiddleware, updateEvent)
router.delete('/:id', authMiddleware, cancelEvent)
router.post('/:id/join', authMiddleware, joinEvent)
router.get('/:id/participants', authMiddleware, listParticipants)

export default router
