/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import QuizPlayer from '../QuizPlayer' // Imports from ../QuizPlayer.tsx
import { useRouter } from 'next/navigation'

// Mock useRouter
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}))

// Mock next/image
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img {...props} alt={props.alt} />
    },
}))

describe('QuizPlayer', () => {
    const mockRouter = {
        push: jest.fn(),
    }

    // Type definition setup
    const mockQuestions = [
        {
            id: 'q1',
            content: 'Question 1',
            imageUrl: null,
            order: 1,
            options: [
                { id: 'o1', content: 'Option 1-A', score: 10, resultTypeCode: 'A' },
                { id: 'o2', content: 'Option 1-B', score: 0, resultTypeCode: 'B' }
            ]
        },
        {
            id: 'q2',
            content: 'Question 2',
            imageUrl: '/q2.jpg',
            order: 2,
            options: [
                { id: 'o3', content: 'Option 2-A', score: 10, resultTypeCode: 'A' },
                { id: 'o4', content: 'Option 2-B', score: 0, resultTypeCode: 'B' }
            ]
        }
    ]

    const mockQuiz = {
        id: 'quiz1',
        title: 'Test Quiz',
        resultType: 'SCORE_BASED' as const,
        typeCodeLimit: 0,
        questions: mockQuestions,
        results: []
    }

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue(mockRouter)
        jest.clearAllMocks()
        jest.useFakeTimers() // For calculating progress simulation
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should show error if no questions', () => {
        const emptyQuiz = { ...mockQuiz, questions: [] }
        render(<QuizPlayer quiz={emptyQuiz} />)
        expect(screen.getByText(/이 퀴즈에는 아직 질문이 없습니다/)).toBeInTheDocument()
    })

    it('should render the first question', () => {
        render(<QuizPlayer quiz={mockQuiz} />)
        expect(screen.getByText('Question 1')).toBeInTheDocument()
        expect(screen.getByText('Option 1-A')).toBeInTheDocument()
        expect(screen.getByText('Option 1-B')).toBeInTheDocument()
        // Progress: Step 1/2
        expect(screen.getByText('1')).toBeInTheDocument()
        expect(screen.getByText('/2')).toBeInTheDocument()
    })

    it('should navigate to next question on answer', () => {
        render(<QuizPlayer quiz={mockQuiz} />)

        // Answer first question
        fireEvent.click(screen.getByText('Option 1-A'))

        // Should show second question
        expect(screen.getByText('Question 2')).toBeInTheDocument()
        expect(screen.getByText('Option 2-A')).toBeInTheDocument()

        // Check progress update
        expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('should calculate result and redirect after last question (Score Based)', async () => {
        render(<QuizPlayer quiz={mockQuiz} />)

        // Q1 -> Option 1-A (Score 10)
        fireEvent.click(screen.getByText('Option 1-A'))

        // Q2 -> Option 2-A (Score 10)
        fireEvent.click(screen.getByText('Option 2-A'))

        // Should show analyzing state
        expect(screen.getByText(/데이터를 정밀 분석 중/)).toBeInTheDocument()

        // Fast-forward processing timer
        act(() => {
            jest.advanceTimersByTime(5000)
        })

        // Check for result button
        const resultBtn = screen.getByText('결과 확인하기')
        expect(resultBtn).toBeInTheDocument()

        fireEvent.click(resultBtn)

        // Total Score: 10 + 10 = 20
        expect(mockRouter.push).toHaveBeenCalledWith('/quiz/quiz1/result?score=20')
    })

    it('should calculate result correctly for Type Based', async () => {
        const typeQuiz = {
            ...mockQuiz,
            resultType: 'TYPE_BASED' as const,
            typeCodeLimit: 1,
            results: [{ id: 'r1', typeCode: 'A' }, { id: 'r2', typeCode: 'B' }]
        }

        render(<QuizPlayer quiz={typeQuiz} />)

        // Q1 -> Option 1-A (Type A)
        fireEvent.click(screen.getByText('Option 1-A'))

        // Q2 -> Option 2-B (Type B)
        fireEvent.click(screen.getByText('Option 2-B'))

        act(() => {
            jest.advanceTimersByTime(5000)
        })

        fireEvent.click(screen.getByText('결과 확인하기'))

        // Should sort types. A and B. Alphabetically A? Or frequency?
        // Both count 1. Type limit 1. 'AB'? or 'A'? 
        // Logic: frequency sort desc, then alphabet. A=1, B=1. A comes first. Limit 1 -> A.
        expect(mockRouter.push).toHaveBeenCalledWith('/quiz/quiz1/result?type=A')
    })
})
