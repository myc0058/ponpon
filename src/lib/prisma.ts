// Prisma Client Singleton
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma: any =
    globalForPrisma.prisma ??
    new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Triggering hot reload for prisma client update at 2026-01-28 11:13

