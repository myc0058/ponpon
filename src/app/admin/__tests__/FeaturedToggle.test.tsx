/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FeaturedToggle from '../FeaturedToggle'
import { toggleQuizFeatured } from '@/actions/quiz'

// Mock the server action
jest.mock('@/actions/quiz', () => ({
    toggleQuizFeatured: jest.fn()
}))

// Mock window.alert
window.alert = jest.fn()

describe('FeaturedToggle', () => {
    const defaultProps = {
        quizId: 'quiz-1',
        initialFeatured: false
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render correctly with initial unfeatured state', () => {
        render(<FeaturedToggle {...defaultProps} />)
        const button = screen.getByRole('button')
        expect(button).toHaveTextContent('Feature')
        expect(button).not.toHaveStyle({ color: 'white' })
    })

    it('should render correctly with initial featured state', () => {
        render(<FeaturedToggle {...defaultProps} initialFeatured={true} />)
        const button = screen.getByRole('button')
        expect(button).toHaveTextContent('Featured')
        // JSDOM computes colors as rgb
        expect(button).toHaveStyle({ color: 'rgb(255, 255, 255)' })
    })

    it('should call server action and update state on click', async () => {
        (toggleQuizFeatured as jest.Mock).mockResolvedValue({ success: true })

        render(<FeaturedToggle {...defaultProps} />)
        const button = screen.getByRole('button')

        fireEvent.click(button)

        expect(toggleQuizFeatured).toHaveBeenCalledWith('quiz-1', true)

        await waitFor(() => {
            expect(button).toHaveTextContent('Featured')
        })
    })

    it('should handle toggle back to unfeatured', async () => {
        (toggleQuizFeatured as jest.Mock).mockResolvedValue({ success: true })

        render(<FeaturedToggle {...defaultProps} initialFeatured={true} />)
        const button = screen.getByRole('button')

        fireEvent.click(button)

        expect(toggleQuizFeatured).toHaveBeenCalledWith('quiz-1', false)

        await waitFor(() => {
            expect(button).toHaveTextContent('Feature')
        })
    })

    it('should handle error gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        (toggleQuizFeatured as jest.Mock).mockRejectedValue(new Error('Failed'))

        render(<FeaturedToggle {...defaultProps} />)
        const button = screen.getByRole('button')

        fireEvent.click(button)

        await waitFor(() => {
            expect(toggleQuizFeatured).toHaveBeenCalled()
        })

        expect(window.alert).toHaveBeenCalledWith('Failed to update featured status')
        // State should remain unchanged
        expect(button).toHaveTextContent('Feature')

        consoleSpy.mockRestore()
    })
})
