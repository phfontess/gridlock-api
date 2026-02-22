import { prisma } from '../../config/db'

export async function getUsers(opts: { skip: number; take: number }) {
  return prisma.$transaction([
    prisma.user.findMany({
      skip: opts.skip,
      take: opts.take,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true, createdAt: true },
    }),
    prisma.user.count(),
  ])
}
