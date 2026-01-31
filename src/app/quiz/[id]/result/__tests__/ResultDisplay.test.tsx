/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
// Adjusted import path relative to the test file location
// test file: src/app/quiz/[id]/result/__tests__/ResultDisplay.test.tsx
// component: src/app/quiz/[id]/result/ResultDisplay.tsx
import ResultDisplay from '../ResultDisplay'
import { ToastProvider } from '@/components/Toast'
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
                <ToastProvider>
                    <ResultDisplay
                        quiz={mockQuiz}
                        result={mockResult}
                        score={80}
                        resultType="SCORE_BASED"
                        compressedData="test"
                    />
                </ToastProvider>
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
                <ToastProvider>
                    <ResultDisplay
                        quiz={mockQuiz}
                        result={mockResult}
                        score={0}
                        resultType="TYPE_BASED"
                        typeCode="ENTP"
                        compressedData="test"
                    />
                </ToastProvider>
            )
        })
        expect(screen.getByText('나의 타입: ENTP')).toBeInTheDocument()
    })

    it('should show premium lock if isPremium and not paid', async () => {
        const premiumResult = { ...mockResult, isPremium: true }

        await act(async () => {
            render(
                <ToastProvider>
                    <ResultDisplay
                        quiz={mockQuiz}
                        result={premiumResult}
                        score={100}
                        resultType="SCORE_BASED"
                        compressedData="test"
                    />
                </ToastProvider>
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
                <ToastProvider>
                    <ResultDisplay
                        quiz={mockQuiz}
                        result={premiumResult}
                        score={100}
                        resultType="SCORE_BASED"
                        compressedData="test"
                    />
                </ToastProvider>
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

    it('should show share drawer when share button is clicked', async () => {
        await act(async () => {
            render(
                <ToastProvider>
                    <ResultDisplay
                        quiz={mockQuiz}
                        result={mockResult}
                        score={80}
                        resultType="SCORE_BASED"
                        compressedData="test"
                    />
                </ToastProvider>
            )
        })

        // Share button should be visible
        const shareBtn = screen.getByText('공유하기')
        expect(shareBtn).toBeInTheDocument()

        // Drawer content should not be visible initially
        expect(screen.queryByText('카카오톡')).not.toBeInTheDocument()

        // Click share button
        await act(async () => {
            fireEvent.click(shareBtn)
        })

        // Drawer content should now be visible
        expect(screen.getByText('카카오톡')).toBeInTheDocument()
        expect(screen.getByText('페이스북')).toBeInTheDocument()
        expect(screen.getByText('트위터')).toBeInTheDocument()
        expect(screen.getByText('링크복사')).toBeInTheDocument()

        // Preview card should be visible matching title and description
        const titles = screen.getAllByText('Result Title')
        expect(titles.length).toBeGreaterThanOrEqual(2)

        const descriptions = screen.getAllByText('Result Description')
        expect(descriptions.length).toBeGreaterThanOrEqual(2)

        // "Preview" button should NOT be there anymore (it's now a card)
        expect(screen.queryByText('미리보기')).not.toBeInTheDocument()
    })

    it('should generate and copy short link via drawer', async () => {
        await act(async () => {
            render(
                <ToastProvider>
                    <ResultDisplay
                        quiz={mockQuiz}
                        result={mockResult}
                        score={80}
                        resultType="SCORE_BASED"
                        compressedData="test"
                    />
                </ToastProvider>
            )
        })

        // Wait for short url generation
        await waitFor(() => {
            expect(generateShortUrl).toHaveBeenCalled()
        })

        // Open share drawer
        const shareBtn = screen.getByText('공유하기')
        await act(async () => {
            fireEvent.click(shareBtn)
        })

        // Find copy button in drawer
        const copyBtn = screen.getByText('링크복사')

        await act(async () => {
            fireEvent.click(copyBtn)
        })

        // The toast will handle the alert UI-wise, but here check logic
        const expectedLink = expect.stringContaining('/s/short123')
        expect(mockWriteText).toHaveBeenCalledWith(expectedLink)
        // With toast, alert is not called. We check if copy to clipboard happened
    })

    it('should match retry link', async () => {
        await act(async () => {
            render(
                <ToastProvider>
                    <ResultDisplay
                        quiz={mockQuiz}
                        result={mockResult}
                        score={80}
                        resultType="SCORE_BASED"
                        compressedData="test"
                    />
                </ToastProvider>
            )
        })

        const retryLink = screen.getByText('다시하기')
        expect(retryLink.closest('a')).toHaveAttribute('href', '/quiz/quiz1')
    })
})
