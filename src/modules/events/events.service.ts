import { EventStatus, ParticipantStatus, Role, Prisma } from '@prisma/client'
import { prisma } from '../../config/db'
import { AppError } from '../../utils/errors'
import { parseISO, isValid, isFuture } from 'date-fns'

function parseEventDate(dateStr: string): Date {
  const parsed = parseISO(dateStr)
  if (!isValid(parsed)) throw new AppError('Data inválida', 400)
  if (!isFuture(parsed)) throw new AppError('A data do evento deve ser no futuro', 400)
  return parsed
}

export async function createEvent(input: {
  organizerId: string
  title: string
  description?: string
  location: string
  date: string
  maxSlots: number
}) {
  const date = parseEventDate(input.date)
  return prisma.event.create({
    data: {
      organizerId: input.organizerId,
      title: input.title,
      description: input.description,
      location: input.location,
      date,
      maxSlots: input.maxSlots,
      status: EventStatus.PENDING,
    },
    select: {
      id: true,
      organizerId: true,
      title: true,
      description: true,
      location: true,
      date: true,
      maxSlots: true,
      status: true,
      createdAt: true,
    },
  })
}

export async function listEvents(opts: {
  skip: number
  take: number
  requesterId: string
  requesterRole: Role
}) {
  let where: Prisma.EventWhereInput

  if (opts.requesterRole === Role.ADMIN) {
    where = {}
  } else if (opts.requesterRole === Role.ORGANIZER) {
    where = {
      OR: [
        { status: EventStatus.APPROVED },
        { status: EventStatus.PENDING, organizerId: opts.requesterId },
      ],
    }
  } else {
    where = { status: EventStatus.APPROVED }
  }

  return prisma.$transaction([
    prisma.event.findMany({
      where,
      skip: opts.skip,
      take: opts.take,
      orderBy: { date: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        date: true,
        maxSlots: true,
        status: true,
        createdAt: true,
        organizer: { select: { id: true, name: true } },
        _count: { select: { participants: { where: { status: ParticipantStatus.CONFIRMED } } } },
      },
    }),
    prisma.event.count({ where }),
  ])
}

export async function getEvent(opts: {
  eventId: string
  requesterId: string
  requesterRole: Role
}) {
  const event = await prisma.event.findUnique({
    where: { id: opts.eventId },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      date: true,
      maxSlots: true,
      status: true,
      createdAt: true,
      organizerId: true,
      organizer: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { participants: { where: { status: ParticipantStatus.CONFIRMED } } } },
    },
  })

  if (!event) throw new AppError('Evento não encontrado', 404)

  const isVisible =
    opts.requesterRole === Role.ADMIN ||
    event.status === EventStatus.APPROVED ||
    (opts.requesterRole === Role.ORGANIZER &&
      event.status === EventStatus.PENDING &&
      event.organizerId === opts.requesterId)

  if (!isVisible) throw new AppError('Evento não encontrado', 404)

  return event
}

export async function updateEvent(opts: {
  eventId: string
  requesterId: string
  requesterRole: Role
  data: {
    title?: string
    description?: string
    location?: string
    date?: string
    maxSlots?: number
  }
}) {
  const event = await prisma.event.findUnique({
    where: { id: opts.eventId },
    select: {
      id: true,
      organizerId: true,
      status: true,
      _count: { select: { participants: { where: { status: ParticipantStatus.CONFIRMED } } } },
    },
  })

  if (!event) throw new AppError('Evento não encontrado', 404)
  if (opts.requesterRole !== Role.ADMIN && event.organizerId !== opts.requesterId) {
    throw new AppError('Evento não encontrado', 404)
  }

  if (event.status === EventStatus.CANCELLED || event.status === EventStatus.REJECTED) {
    throw new AppError('Não é possível editar um evento cancelado ou rejeitado', 422)
  }

  if (opts.data.maxSlots !== undefined && opts.data.maxSlots < event._count.participants) {
    throw new AppError('Número máximo de vagas não pode ser menor que o número de confirmados', 422)
  }

  const date = opts.data.date !== undefined ? parseEventDate(opts.data.date) : undefined

  return prisma.event.update({
    where: { id: opts.eventId },
    data: {
      ...(opts.data.title !== undefined && { title: opts.data.title }),
      ...(opts.data.description !== undefined && { description: opts.data.description }),
      ...(opts.data.location !== undefined && { location: opts.data.location }),
      ...(date !== undefined && { date }),
      ...(opts.data.maxSlots !== undefined && { maxSlots: opts.data.maxSlots }),
    },
    select: {
      id: true,
      organizerId: true,
      title: true,
      description: true,
      location: true,
      date: true,
      maxSlots: true,
      status: true,
      createdAt: true,
    },
  })
}

export async function cancelEvent(opts: {
  eventId: string
  requesterId: string
  requesterRole: Role
}) {
  const event = await prisma.event.findUnique({
    where: { id: opts.eventId },
    select: { id: true, organizerId: true, status: true },
  })

  if (!event) throw new AppError('Evento não encontrado', 404)
  if (opts.requesterRole !== Role.ADMIN && event.organizerId !== opts.requesterId) {
    throw new AppError('Evento não encontrado', 404)
  }

  if (event.status === EventStatus.CANCELLED) {
    throw new AppError('Evento já está cancelado', 422)
  }
  if (event.status === EventStatus.REJECTED) {
    throw new AppError('Não é possível cancelar um evento rejeitado', 422)
  }

  return prisma.event.update({
    where: { id: opts.eventId },
    data: { status: EventStatus.CANCELLED },
    select: {
      id: true,
      organizerId: true,
      title: true,
      description: true,
      location: true,
      date: true,
      maxSlots: true,
      status: true,
      createdAt: true,
    },
  })
}

export async function joinEvent(opts: { eventId: string; userId: string; carId: string }) {
  const event = await prisma.event.findUnique({
    where: { id: opts.eventId },
    select: {
      id: true,
      status: true,
      maxSlots: true,
      _count: { select: { participants: { where: { status: ParticipantStatus.CONFIRMED } } } },
    },
  })

  if (!event) throw new AppError('Evento não encontrado', 404)

  if (event.status !== EventStatus.APPROVED) {
    throw new AppError('Evento não está disponível para inscrições', 422)
  }

  if (event._count.participants >= event.maxSlots) {
    throw new AppError('Evento está com todas as vagas preenchidas', 422)
  }

  const existing = await prisma.eventParticipant.findUnique({
    where: { eventId_userId: { eventId: opts.eventId, userId: opts.userId } },
  })
  if (existing) throw new AppError('Você já está inscrito neste evento', 409)

  const car = await prisma.car.findUnique({ where: { id: opts.carId }, select: { ownerId: true } })
  if (!car || car.ownerId !== opts.userId) {
    throw new AppError('Carro não encontrado ou não pertence a você', 422)
  }

  return prisma.eventParticipant.create({
    data: {
      eventId: opts.eventId,
      userId: opts.userId,
      carId: opts.carId,
      status: ParticipantStatus.PENDING,
    },
    select: {
      id: true,
      eventId: true,
      userId: true,
      carId: true,
      status: true,
      joinedAt: true,
    },
  })
}

export async function listParticipants(opts: {
  eventId: string
  requesterId: string
  requesterRole: Role
  skip: number
  take: number
}) {
  const event = await prisma.event.findUnique({
    where: { id: opts.eventId },
    select: { id: true },
  })
  if (!event) throw new AppError('Evento não encontrado', 404)

  const statusFilter: Prisma.EventParticipantWhereInput =
    opts.requesterRole === Role.PARTICIPANT ? { status: ParticipantStatus.CONFIRMED } : {}

  const where: Prisma.EventParticipantWhereInput = { eventId: opts.eventId, ...statusFilter }

  return prisma.$transaction([
    prisma.eventParticipant.findMany({
      where,
      skip: opts.skip,
      take: opts.take,
      orderBy: { joinedAt: 'asc' },
      select: {
        id: true,
        status: true,
        joinedAt: true,
        user: { select: { id: true, name: true, avatarUrl: true } },
        car: { select: { id: true, brand: true, model: true, year: true, photoUrl: true } },
      },
    }),
    prisma.eventParticipant.count({ where }),
  ])
}
