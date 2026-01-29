import sitemap from '../sitemap'
import robots from '../robots'
import { prisma } from '@/lib/prisma'

// Prisma Mock
jest.mock('@/lib/prisma', () => ({
    prisma: {
        quiz: {
            findMany: jest.fn(),
        },
    },
}))

describe('SEO Integration Tests', () => {
    const originalEnv = process.env

    beforeEach(() => {
        jest.resetModules()
        process.env = { ...originalEnv }
        // 기본적으로 BASE_URL 설정
        process.env.NEXT_PUBLIC_BASE_URL = 'https://test-domain.com'
    })

    afterEach(() => {
        process.env = originalEnv
        jest.clearAllMocks()
    })

    describe('sitemap', () => {
        it('should generate static routes correctly', async () => {
            // 퀴즈가 없는 경우
            ; (prisma.quiz.findMany as jest.Mock).mockResolvedValue([])

            const result = await sitemap()

            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        url: 'https://test-domain.com',
                        changeFrequency: 'daily',
                        priority: 1,
                    }),
                ])
            )
        })

        it('should generate dynamic quiz routes correctly', async () => {
            const mockQuizzes = [
                { id: 'quiz-1', updatedAt: new Date('2024-01-01') },
                { id: 'quiz-2', updatedAt: new Date('2024-01-02') },
            ]
                ; (prisma.quiz.findMany as jest.Mock).mockResolvedValue(mockQuizzes)

            const result = await sitemap()

            // 정적 루트 1개 + 퀴즈 루트 2개 = 총 3개
            expect(result).toHaveLength(3)

            // 퀴즈 루트 확인
            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        url: 'https://test-domain.com/quiz/quiz-1',
                        lastModified: mockQuizzes[0].updatedAt,
                        changeFrequency: 'weekly',
                        priority: 0.8,
                    }),
                    expect.objectContaining({
                        url: 'https://test-domain.com/quiz/quiz-2',
                        lastModified: mockQuizzes[1].updatedAt,
                        changeFrequency: 'weekly',
                        priority: 0.8,
                    }),
                ])
            )
        })

        it('should fallback to default URL if process.env.NEXT_PUBLIC_BASE_URL is missing', async () => {
            delete process.env.NEXT_PUBLIC_BASE_URL

                // reload module to pick up env change (though function is imported, internal var might be cached if not careful, but here we call function directly)
                // Actually sitemap function reads env inside execution, so it's fine.

                ; (prisma.quiz.findMany as jest.Mock).mockResolvedValue([])

            const result = await sitemap()

            expect(result[0].url).toBe('https://ponpon.factorization.co.kr')
        })
    })

    describe('robots', () => {
        it('should allow all user agents and point to sitemap', () => {
            const result = robots()

            expect(result).toEqual({
                rules: {
                    userAgent: '*',
                    allow: '/',
                    disallow: '/admin/',
                },
                sitemap: 'https://test-domain.com/sitemap.xml',
            })
        })

        it('should fallback to default URL for sitemap in robots.txt', () => {
            delete process.env.NEXT_PUBLIC_BASE_URL
            const result = robots()

            expect(result.sitemap).toBe('https://ponpon.factorization.co.kr/sitemap.xml')
        })
    })
})
