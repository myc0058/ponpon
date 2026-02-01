'use server'

import { prisma } from '@/lib/prisma'

export async function getGames(options?: { includeHidden?: boolean }) {
    const where = options?.includeHidden ? {} : { isActive: true }
    return await prisma.miniGame.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    })
}
