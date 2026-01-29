import { createShortUrl, getOriginalUrl } from '../url-shortener'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
    prisma: {
        shortUrl: {
            findFirst: jest.fn(),
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    },
}))

jest.mock('nanoid', () => ({
    nanoid: jest.fn(),
}))

describe('URL Shortener', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('createShortUrl', () => {
        it('should return existing ID if URL already exists', async () => {
            const originalUrl = 'https://google.com'
            const existingId = 'existing123'

                ; (prisma.shortUrl.findFirst as jest.Mock).mockResolvedValue({
                    id: existingId,
                    originalUrl,
                })

            const result = await createShortUrl(originalUrl)

            expect(prisma.shortUrl.findFirst).toHaveBeenCalledWith({
                where: { originalUrl },
            })
            expect(result).toBe(existingId)
            expect(prisma.shortUrl.create).not.toHaveBeenCalled()
        })

        it('should create new short URL if not exists', async () => {
            const originalUrl = 'https://google.com'
            const newId = 'new123'

                ; (prisma.shortUrl.findFirst as jest.Mock).mockResolvedValue(null)
                ; (nanoid as unknown as jest.Mock).mockReturnValue(newId)
                ; (prisma.shortUrl.create as jest.Mock).mockResolvedValue({
                    id: newId,
                    originalUrl,
                })

            const result = await createShortUrl(originalUrl)

            expect(prisma.shortUrl.findFirst).toHaveBeenCalledWith({
                where: { originalUrl },
            })
            expect(nanoid).toHaveBeenCalledWith(6)
            expect(prisma.shortUrl.create).toHaveBeenCalledWith({
                data: {
                    id: newId,
                    originalUrl,
                },
            })
            expect(result).toBe(newId)
        })
    })

    describe('getOriginalUrl', () => {
        it('should return original URL and increment visits', async () => {
            const id = 'someId'
            const originalUrl = 'https://google.com'

                ; (prisma.shortUrl.findUnique as jest.Mock).mockResolvedValue({
                    id,
                    originalUrl,
                })

            const result = await getOriginalUrl(id)

            expect(prisma.shortUrl.findUnique).toHaveBeenCalledWith({
                where: { id },
            })
            expect(prisma.shortUrl.update).toHaveBeenCalledWith({
                where: { id },
                data: { visits: { increment: 1 } },
            })
            expect(result).toBe(originalUrl)
        })

        it('should return null if not found', async () => {
            const id = 'notfound'

                ; (prisma.shortUrl.findUnique as jest.Mock).mockResolvedValue(null)

            const result = await getOriginalUrl(id)

            expect(result).toBeNull()
            expect(prisma.shortUrl.update).not.toHaveBeenCalled()
        })
    })
})
