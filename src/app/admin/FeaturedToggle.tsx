'use client'

import { toggleQuizFeatured } from '@/actions/quiz'
import { Star } from 'lucide-react'
import { useState } from 'react'

interface FeaturedToggleProps {
    quizId: string
    initialFeatured: boolean
}

export default function FeaturedToggle({ quizId, initialFeatured }: FeaturedToggleProps) {
    const [isFeatured, setIsFeatured] = useState(initialFeatured)
    const [isLoading, setIsLoading] = useState(false)

    const handleToggle = async () => {
        setIsLoading(true)
        try {
            await toggleQuizFeatured(quizId, !isFeatured)
            setIsFeatured(!isFeatured)
        } catch (error) {
            console.error('Failed to toggle featured status:', error)
            alert('Failed to update featured status')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            style={{
                background: isFeatured ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e5e7eb',
                color: isFeatured ? 'white' : '#6b7280',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                transition: 'all 0.2s',
                opacity: isLoading ? 0.6 : 1
            }}
            title={isFeatured ? 'Remove from hero section' : 'Add to hero section'}
        >
            <Star size={16} fill={isFeatured ? 'white' : 'none'} />
            {isFeatured ? 'Featured' : 'Feature'}
        </button>
    )
}
