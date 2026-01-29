'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            gap: '1rem',
            padding: '2rem',
            textAlign: 'center'
        }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>문제가 발생했습니다</h2>
            <p style={{ color: '#6b7280' }}>잠시 후 다시 시도해주세요.</p>
            <button
                onClick={reset}
                style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: '600'
                }}
            >
                다시 시도
            </button>
        </div>
    )
}
