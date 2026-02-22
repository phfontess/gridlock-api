import rateLimit from 'express-rate-limit'

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Muitas contas criadas. Tente novamente em 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: { error: 'Muitas requisições de refresh. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
})
