
/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, act } from '@testing-library/react'
import QuizResultPage from '../page'
import { prisma } from '@/lib/prisma'
import { decompressData } from '@/lib/compression'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
    prisma: {
        quiz: {
            findUnique: jest.fn(),
            update: jest.fn()
        }
    }
}))

jest.mock('@/lib/compression', () => ({
    compressData: jest.fn(() => 'new_compressed_data'),
    decompressData: jest.fn()
}))

jest.mock('../ResultDisplay', () => {
    return function MockResultDisplay({ typeCode, score }: any) {
        return (
            <div>
                <span data-testid="type-code">{typeCode || 'N/A'}</span>
                <span data-testid="score">{score}</span>
            </div>
        )
    }
})

jest.mock('next/link', () => {
    return ({ children }: any) => <div>{children}</div>
})

describe('QuizResultPage Logic', () => {
    const mockQuiz = {
        id: 'quiz1',
        title: 'Test Quiz',
        resultType: 'TYPE_BASED',
        results: []
    }

    beforeEach(() => {
        jest.clearAllMocks()
            ; (prisma.quiz.findUnique as jest.Mock).mockResolvedValue(mockQuiz)
    })

    it('should restore typeCode and score from compressed data', async () => {
        const mockDecoded = {
            t: 'Title',
            d: 'Desc',
            i: '/img.jpg',
            s: 80,
            ty: 'ENTP'
        }
            ; (decompressData as jest.Mock).mockReturnValue(mockDecoded)

        const params = Promise.resolve({ id: 'quiz1' })
        const searchParams = Promise.resolve({ o: 'compressed_string' })

        await act(async () => {
            const result = await QuizResultPage({ params, searchParams })
            render(result)
        })

        expect(screen.getByTestId('type-code')).toHaveTextContent('ENTP')
        expect(screen.getByTestId('score')).toHaveTextContent('80')
    })

    it('should handle missing typeCode in compressed data', async () => {
        const mockDecoded = {
            t: 'Title',
            d: 'Desc',
            i: '/img.jpg'
            // s and ty missing
        }
            ; (decompressData as jest.Mock).mockReturnValue(mockDecoded)

        const params = Promise.resolve({ id: 'quiz1' })
        const searchParams = Promise.resolve({ o: 'compressed_string' })

        await act(async () => {
            const result = await QuizResultPage({ params, searchParams })
            render(result)
        })

        expect(screen.getByTestId('type-code')).toHaveTextContent('N/A')
    })
})
