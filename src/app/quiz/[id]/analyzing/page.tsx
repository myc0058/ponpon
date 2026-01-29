'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './analyzing.module.css'

export default function AnalyzingPage({ params }: { params: Promise<{ id: string }> }) {
    const [progress, setProgress] = useState(0)
    const [showResultButton, setShowResultButton] = useState(false)
    const [finalUrl, setFinalUrl] = useState('')
    const router = useRouter()
    const [quizId, setQuizId] = useState<string>('')

    useEffect(() => {
        params.then(p => setQuizId(p.id))
    }, [params])

    useEffect(() => {
        if (!quizId) return

        const storedResult = sessionStorage.getItem(`quiz_result_${quizId}`)

        if (!storedResult) {
            router.replace(`/quiz/${quizId}`)
            return
        }

        try {
            const resultData = JSON.parse(storedResult)

            // Construct Final URL
            if (resultData.type === 'SCORE') {
                setFinalUrl(`/quiz/${quizId}/result?score=${resultData.score}`)
            } else if (resultData.type === 'TYPE') {
                setFinalUrl(`/quiz/${quizId}/result?type=${resultData.resultType}`)
            } else {
                // Invalid data
                router.replace(`/quiz/${quizId}`)
                return
            }

            // Start animation
            const timer = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(timer)
                        setShowResultButton(true)
                        return 100
                    }
                    return Math.min(100, prev + 1)
                })
            }, 30) // 3 seconds approx (100 * 30ms = 3000ms)

            return () => clearInterval(timer)

        } catch (e) {
            console.error(e)
            router.replace(`/quiz/${quizId}`)
        }

    }, [quizId, router])

    if (!quizId) return null

    return (
        <main className={styles.container}>
            <div className={styles.questionCard}>
                <h2 className={styles.calculatingTitle}>
                    {showResultButton ? '분석이 완료되었습니다!' : '데이터를 정밀 분석 중...'}
                </h2>

                <div className={styles.calculatingProgress}>
                    <div
                        className={styles.calculatingBar}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <p className={styles.calculatingText}>{Math.floor(progress)}% 완료</p>

                {showResultButton && (
                    <button
                        className={styles.resultButton}
                        onClick={() => router.push(finalUrl)}
                        style={{ marginTop: '1rem' }}
                    >
                        결과 확인하기
                    </button>
                )}
            </div>
        </main>
    )
}
