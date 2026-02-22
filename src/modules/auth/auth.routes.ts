import { Router } from 'express'
import { register, login, refresh } from './auth.controller'
import { loginLimiter, registerLimiter, refreshLimiter } from '../../middlewares/rateLimiter.middleware'

const router = Router()

router.post('/register', registerLimiter, register)
router.post('/login', loginLimiter, login)
router.post('/refresh', refreshLimiter, refresh)

export default router
