import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ponpon.factorization.co.kr'

    // 정적 페이지 (필요하다면 추가)
    const staticRoutes = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1,
        },
    ]

    // 동적 페이지: 퀴즈 목록 가져오기
    const quizzes = await prisma.quiz.findMany({
        where: { isVisible: true },
        select: { id: true, updatedAt: true },
    })

    const quizRoutes = quizzes.map((quiz: { id: string; updatedAt: Date }) => ({
        url: `${baseUrl}/quiz/${quiz.id}`,
        lastModified: quiz.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    return [...staticRoutes, ...quizRoutes]
}
