import { Router } from 'express'
import authMiddleware from '../../middlewares/auth.middleware'
import { getUsers } from './users.controller'

const router = Router()

router.get('/', authMiddleware, getUsers)

export default router
