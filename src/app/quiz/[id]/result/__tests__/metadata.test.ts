// Mock nanoid
jest.mock('nanoid', () => ({
    nanoid: () => 'test-id'
}))

// Mock ResultDisplay component to avoid import issues with server actions
jest.mock('../ResultDisplay', () => {
    return function DummyResultDisplay() {
        return null
    }
})

// Mock compressData/decompressData
jest.mock('@/lib/compression', () => ({
    compressData: jest.fn(() => 'compressed_data'),
    decompressData: jest.fn()
}))

import { generateMetadata } from '../page'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
    prisma: {
        quiz: {
            findUnique: jest.fn()
        }
    }
}))

describe('Metadata Generation', () => {
    const mockQuiz = {
        id: 'quiz1',
        title: 'Test Quiz',
        resultType: 'SCORE_BASED',
        results: [
            {
                id: 'res1',
                title: 'Result Title',
                description: 'Result Description',
                imageUrl: '/result-image.jpg',
                minScore: 0,
                maxScore: 100
            }
        ]
    }

    beforeEach(() => {
        jest.clearAllMocks()
            ; (prisma.quiz.findUnique as jest.Mock).mockResolvedValue(mockQuiz)
    })

    it('should generate correct OG metadata', async () => {
        const params = Promise.resolve({ id: 'quiz1' })
        const searchParams = Promise.resolve({ score: '50' })

        const metadata = await generateMetadata({ params, searchParams })

        expect(metadata.openGraph?.type).toBe('article')
        expect(metadata.openGraph?.url).toBe('https://ponpon.factorization.co.kr/quiz/quiz1')

        const images = metadata.openGraph?.images as any[]
        expect(images).toHaveLength(1)
        expect(images[0].url).toBe('https://ponpon.factorization.co.kr/result-image.jpg')
    })

    it('should handle absolute image URLs', async () => {
        const absoluteQuiz = {
            ...mockQuiz,
            results: [{
                ...mockQuiz.results[0],
                imageUrl: 'https://example.com/image.jpg'
            }]
        }
            ; (prisma.quiz.findUnique as jest.Mock).mockResolvedValue(absoluteQuiz)

        const params = Promise.resolve({ id: 'quiz1' })
        const searchParams = Promise.resolve({ score: '50' })

        const metadata = await generateMetadata({ params, searchParams })

        const images = metadata.openGraph?.images as any[]
        expect(images[0].url).toBe('https://example.com/image.jpg')
    })
})
