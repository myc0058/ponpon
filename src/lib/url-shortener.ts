import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

export async function createShortUrl(originalUrl: string): Promise<string> {
    const existing = await prisma.shortUrl.findFirst({
        where: { originalUrl },
    });

    if (existing) {
        return existing.id;
    }

    const id = nanoid(6);
    await prisma.shortUrl.create({
        data: {
            id,
            originalUrl,
        },
    });

    return id;
}

export async function getOriginalUrl(id: string): Promise<string | null> {
    const shortUrl = await prisma.shortUrl.findUnique({
        where: { id },
    });

    if (shortUrl) {
        await prisma.shortUrl.update({
            where: { id },
            data: { visits: { increment: 1 } },
        });
        return shortUrl.originalUrl;
    }

    return null;
}
