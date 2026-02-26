import { RequestHandler } from 'express'
import { AppError } from '../../utils/errors'
import { parsePagination, paginated } from '../../utils/pagination'
import * as eventsService from './events.service'

export const createEvent: RequestHandler = async (req, res, next) => {
  try {
    const { title, description, location, date, maxSlots } = req.body
    const event = await eventsService.createEvent({
      organizerId: req.user!.id,
      title,
      description,
      location,
      date,
      maxSlots,
    })
    res.status(201).json(event)
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ error: err.message })
    } else {
      next(err)
    }
  }
}

export const listEvents: RequestHandler = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query)
    const [events, total] = await eventsService.listEvents({
      skip,
      take: limit,
      requesterId: req.user!.id,
      requesterRole: req.user!.role,
    })
    res.json(paginated(events, total, page, limit))
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ error: err.message })
    } else {
      next(err)
    }
  }
}

export const getEvent: RequestHandler = async (req, res, next) => {
  try {
    const event = await eventsService.getEvent({
      eventId: req.params.id,
      requesterId: req.user!.id,
      requesterRole: req.user!.role,
    })
    res.json(event)
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ error: err.message })
    } else {
      next(err)
    }
  }
}

export const updateEvent: RequestHandler = async (req, res, next) => {
  try {
    const event = await eventsService.updateEvent({
      eventId: req.params.id,
      requesterId: req.user!.id,
      requesterRole: req.user!.role,
      data: req.body,
    })
    res.json(event)
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ error: err.message })
    } else {
      next(err)
    }
  }
}

export const cancelEvent: RequestHandler = async (req, res, next) => {
  try {
    const event = await eventsService.cancelEvent({
      eventId: req.params.id,
      requesterId: req.user!.id,
      requesterRole: req.user!.role,
    })
    res.json(event)
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ error: err.message })
    } else {
      next(err)
    }
  }
}

export const joinEvent: RequestHandler = async (req, res, next) => {
  try {
    const participant = await eventsService.joinEvent({
      eventId: req.params.id,
      userId: req.user!.id,
      carId: req.body.carId,
    })
    res.status(201).json(participant)
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ error: err.message })
    } else {
      next(err)
    }
  }
}

export const listParticipants: RequestHandler = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query)
    const [participants, total] = await eventsService.listParticipants({
      eventId: req.params.id,
      requesterId: req.user!.id,
      requesterRole: req.user!.role,
      skip,
      take: limit,
    })
    res.json(paginated(participants, total, page, limit))
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ error: err.message })
    } else {
      next(err)
    }
  }
}
