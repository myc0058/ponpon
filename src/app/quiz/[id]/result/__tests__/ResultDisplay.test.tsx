/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
// Adjusted import path relative to the test file location
// test file: src/app/quiz/[id]/result/__tests__/ResultDisplay.test.tsx
// component: src/app/quiz/[id]/result/ResultDisplay.tsx
import ResultDisplay from '../ResultDisplay'
import { generateShortUrl } from '@/app/actions/shorten-url'

// Mock shorten-url action
jest.mock('@/app/actions/shorten-url', () => ({
    generateShortUrl: jest.fn()
}))

// Mock next/image
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // Prevent passing invalid props to img
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { priority, fill, ...rest } = props
        // eslint-disable-next-line @next/next/no-img-element
        return <img {...rest} alt={props.alt} />
    },
}))

// Define navigator.clipboard
const mockWriteText = jest.fn();
Object.assign(navigator, {
    clipboard: {
        writeText: mockWriteText,
    },
});

// Mock window.open and alert
window.open = jest.fn();
window.alert = jest.fn();

// We do NOT mock window.location because it is read-only in JSDOM.
// We accept that origin is 'http://localhost'.

describe('ResultDisplay', () => {
    const mockQuiz = {
        id: 'quiz1',
        title: 'Test Quiz'
    }

    const mockResult = {
        id: 'res1',
        title: 'Result Title',
        description: 'Result Description',
        imageUrl: '/res.jpg',
        isPremium: false
    }

    beforeEach(() => {
        jest.clearAllMocks()
            // Default short url mock
            ; (generateShortUrl as jest.Mock).mockResolvedValue({ success: true, id: 'short123' })
    })

    it('should render result content correctly', async () => {
        await act(async () => {
            render(
                <ResultDisplay
                    quiz={mockQuiz}
                    result={mockResult}
                    score={80}
                    resultType="SCORE_BASED"
                />
            )
        })

        expect(screen.getByText('Test Quiz')).toBeInTheDocument()
        expect(screen.getByText('나의 점수: 80점')).toBeInTheDocument()
        expect(screen.getByText('Result Title')).toBeInTheDocument()
        expect(screen.getByText('Result Description')).toBeInTheDocument()
    })

    it('should render type code if type based', async () => {
        await act(async () => {
            render(
                <ResultDisplay
                    quiz={mockQuiz}
                    result={mockResult}
                    score={0}
                    resultType="TYPE_BASED"
                    typeCode="ENTP"
                />
            )
        })
        expect(screen.getByText('나의 타입: ENTP')).toBeInTheDocument()
    })

    it('should show premium lock if isPremium and not paid', async () => {
        const premiumResult = { ...mockResult, isPremium: true }

        await act(async () => {
            render(
                <ResultDisplay
                    quiz={mockQuiz}
                    result={premiumResult}
                    score={100}
                    resultType="SCORE_BASED"
                />
            )
        })

        expect(screen.getByText('프리미엄 결과')).toBeInTheDocument()
        expect(screen.getByText('이 결과를 보려면 결제가 필요합니다.')).toBeInTheDocument()
        expect(screen.queryByText('Result Title')).not.toBeInTheDocument()
    })

    it('should unlock premium result after payment', async () => {
        jest.useFakeTimers()
        const premiumResult = { ...mockResult, isPremium: true }

        await act(async () => {
            render(
                <ResultDisplay
                    quiz={mockQuiz}
                    result={premiumResult}
                    score={100}
                    resultType="SCORE_BASED"
                />
            )
        })

        const payBtn = screen.getByText('1,000원에 결과 보기')
        await act(async () => {
            fireEvent.click(payBtn)
        })

        expect(screen.getByText('처리 중...')).toBeInTheDocument()

        await act(async () => {
            jest.advanceTimersByTime(2000)
        })

        expect(screen.getByText('Result Title')).toBeInTheDocument()

        jest.useRealTimers()
    })

    it('should generate and copy short link', async () => {
        await act(async () => {
            render(
                <ResultDisplay
                    quiz={mockQuiz}
                    result={mockResult}
                    score={80}
                    resultType="SCORE_BASED"
                />
            )
        })

        // Wait for short url generation to complete
        await waitFor(() => {
            expect(generateShortUrl).toHaveBeenCalled()
        })

        // Wait for state update to settle
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 50))
        })

        const copyBtn = screen.getByText('링크 복사')

        await act(async () => {
            fireEvent.click(copyBtn)
        })

        // Expect short id 'short123' to be in the copied text
        // The full URL will be http://localhost/s/short123 in JSDOM
        expect(mockWriteText).toHaveBeenCalledWith(
            expect.stringContaining('/s/short123')
        )
        expect(window.alert).toHaveBeenCalledWith('단축 링크가 클립보드에 복사되었습니다!')
    })
})
