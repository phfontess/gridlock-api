import { RequestHandler } from 'express'
import { AppError } from '../../utils/errors'
import * as authService from './auth.service'

export const register: RequestHandler = async (req, res) => {
  try {
    const user = await authService.register(req.body)
    res.status(201).json(user)
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ error: err.message })
    } else {
      res.status(400).json({ error: 'Erro ao criar conta' })
    }
  }
}

export const login: RequestHandler = async (req, res) => {
  try {
    const tokens = await authService.login(req.body)
    res.json(tokens)
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ error: err.message })
    } else {
      res.status(401).json({ error: 'Erro ao fazer login' })
    }
  }
}

export const refresh: RequestHandler = async (req, res) => {
  try {
    const tokens = await authService.refresh(req.body.refreshToken)
    res.json(tokens)
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ error: err.message })
    } else {
      res.status(401).json({ error: 'Token de refresh inválido' })
    }
  }
}
