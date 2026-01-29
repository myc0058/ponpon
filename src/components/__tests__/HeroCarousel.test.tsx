/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import HeroCarousel from '../HeroCarousel'

// Mock next/image
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img {...props} alt={props.alt} />
    },
}))

describe('HeroCarousel', () => {
    const mockQuizzes = [
        {
            id: '1',
            title: 'Featured Quiz 1',
            description: 'Desc 1',
            thumbnailUrl: '/img1.jpg',
            plays: 50,
            isFeatured: true,
            updatedAt: new Date(),
            resultType: 'SCORE_BASED' as const,
            typeCodeLimit: 0,
            isVisible: true,
            createdAt: new Date(),
        },
        {
            id: '2',
            title: 'Featured Quiz 2',
            description: 'Desc 2',
            thumbnailUrl: '/img2.jpg',
            plays: 30,
            isFeatured: true,
            updatedAt: new Date(),
            resultType: 'SCORE_BASED' as const,
            typeCodeLimit: 0,
            isVisible: true,
            createdAt: new Date(),
        }
    ]

    it('should render slides for provided quizzes', () => {
        render(<HeroCarousel quizzes={mockQuizzes} />)

        // Use getAllByText because carousel clones slides for infinite loop
        expect(screen.getAllByText('Featured Quiz 1')[0]).toBeInTheDocument()
        expect(screen.getAllByText('Featured Quiz 2')[0]).toBeInTheDocument()
    })

    it('should show message if no quizzes provided', () => {
        render(<HeroCarousel quizzes={[]} />)
        const slides = screen.queryAllByRole('link')
        expect(slides).toHaveLength(0)
    })
})
