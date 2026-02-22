import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Role } from '@prisma/client'
import { prisma } from '../../config/db'
import { env } from '../../config/env'
import { AppError } from '../../utils/errors'

interface RegisterInput {
  name: string
  email: string
  password: string
  role?: Role
}

interface LoginInput {
  email: string
  password: string
}

interface TokenPair {
  accessToken: string
  refreshToken: string
}

export async function register(input: RegisterInput) {
  const exists = await prisma.user.findUnique({ where: { email: input.email } })
  if (exists) throw new AppError('Email já cadastrado', 409)

  const passwordHash = await bcrypt.hash(input.password, 10)
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role ?? Role.PARTICIPANT,
    },
    select: { id: true, name: true, email: true, role: true },
  })

  return user
}

export async function login(input: LoginInput): Promise<TokenPair> {
  const user = await prisma.user.findUnique({ where: { email: input.email } })
  if (!user) throw new AppError('Credenciais inválidas', 401)

  const valid = await bcrypt.compare(input.password, user.passwordHash)
  if (!valid) throw new AppError('Credenciais inválidas', 401)

  return generateTokens(user)
}

export async function refresh(refreshToken: string): Promise<TokenPair> {
  const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { id: string }
  const user = await prisma.user.findUnique({ where: { id: decoded.id } })
  if (!user) throw new AppError('Usuário não encontrado', 404)

  return generateTokens(user)
}

function generateTokens(user: { id: string; role: Role }): TokenPair {
  const payload = { id: user.id, role: user.role }
  const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m' })
  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
  return { accessToken, refreshToken }
}
