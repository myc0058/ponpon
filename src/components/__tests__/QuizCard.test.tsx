/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import QuizCard from '../QuizCard'

// Mock next/image
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img {...props} alt={props.alt} />
    },
}))

describe('QuizCard', () => {
    const mockQuiz = {
        id: '1',
        title: 'Test Quiz',
        description: 'Test Description',
        thumbnailUrl: '/test-image.jpg',
        plays: 100,
        isFeatured: false,
        updatedAt: new Date(),
        // Add missing props to satisfy TS
        resultType: 'SCORE_BASED' as const,
        typeCodeLimit: 0,
        isVisible: true,
        createdAt: new Date(),
    }

    it('should render quiz information correctly', () => {
        render(<QuizCard quiz={mockQuiz} />)

        expect(screen.getByText('Test Quiz')).toBeInTheDocument()
        expect(screen.getByText('Test Description')).toBeInTheDocument()
        // Use regex to match text with multiple lines/whitespace
        expect(screen.getByText(/100\s*plays/)).toBeInTheDocument()
        // Check image alt text
        expect(screen.getByAltText('Test Quiz')).toBeInTheDocument()
    })

    it('should link to the quiz page', () => {
        render(<QuizCard quiz={mockQuiz} />)

        const link = screen.getByRole('link')
        // Updated expectation to match implementation
        expect(link).toHaveAttribute('href', '/quiz/1')
    })
})
