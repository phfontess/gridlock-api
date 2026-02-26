import { RequestHandler } from 'express'
import * as usersService from './users.service'
import { parsePagination, paginated } from '../../utils/pagination'

export const getUsers: RequestHandler = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query)
    const [users, total] = await usersService.getUsers({ skip, take: limit })
    res.json(paginated(users, total, page, limit))
  } catch (err) {
    next(err)
  }
}
