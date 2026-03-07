'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './analyzing.module.css'

// 일반 퀴즈용 메시지
const GENERAL_MESSAGES = [
    '데이터를 정밀 분석 중...',
    '당신의 답변을 처리하고 있습니다...',
    '결과를 취합하는 중...',
]

// 게임북(BRANCHING)용 메시지 — 셜록 홈즈 테마지만 범용적으로도 쓸 수 있음
const GAMEBOOK_MESSAGES = [
    '이야기의 결말이 펼쳐지고 있습니다...',
    '당신의 선택이 운명을 결정짓고 있습니다...',
    '마지막 단서들이 맞춰지고 있습니다...',
    '진실의 문이 열리고 있습니다...',
    '이제 모든 것이 밝혀질 시간입니다...',
]

// 게임북 완료 메시지
const GAMEBOOK_DONE_MESSAGES: Record<string, string> = {
    default: '당신의 이야기가 완성되었습니다.',
}

export default function AnalyzingPage({ params }: { params: Promise<{ id: string }> }) {
    const [progress, setProgress] = useState(0)
    const [showResultButton, setShowResultButton] = useState(false)
    const [finalUrl, setFinalUrl] = useState('')
    const router = useRouter()
    const [quizId, setQuizId] = useState<string>('')
    const [isGamebook, setIsGamebook] = useState(false)
    const [messageIndex, setMessageIndex] = useState(0)

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

            // 게임북 여부 감지
            if (resultData.type === 'BRANCHING') {
                setIsGamebook(true)
            }

            // Construct Final URL
            if (resultData.type === 'SCORE') {
                setFinalUrl(`/quiz/${quizId}/result?score=${resultData.score}`)
            } else if (resultData.type === 'TYPE') {
                setFinalUrl(`/quiz/${quizId}/result?type=${resultData.resultType}`)
            } else if (resultData.type === 'BRANCHING') {
                const choiceParam = resultData.lastChoice ? `&lc=${encodeURIComponent(resultData.lastChoice)}` : ''
                setFinalUrl(`/quiz/${quizId}/result?resultId=${resultData.resultId}${choiceParam}`)
            } else {
                router.replace(`/quiz/${quizId}`)
                return
            }

            // Progress animation
            const timer = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(timer)
                        setShowResultButton(true)
                        return 100
                    }
                    return Math.min(100, prev + 1)
                })
            }, 30)

            return () => clearInterval(timer)

        } catch (e) {
            console.error(e)
            router.replace(`/quiz/${quizId}`)
        }

    }, [quizId, router])

    // 메시지 순환 (게임북일 때만)
    useEffect(() => {
        if (!isGamebook || showResultButton) return
        const msgs = GAMEBOOK_MESSAGES
        const interval = setInterval(() => {
            setMessageIndex(i => (i + 1) % msgs.length)
        }, 1800)
        return () => clearInterval(interval)
    }, [isGamebook, showResultButton])

    if (!quizId) return null

    const loadingMessage = isGamebook
        ? GAMEBOOK_MESSAGES[messageIndex]
        : GENERAL_MESSAGES[0]

    const doneMessage = isGamebook
        ? GAMEBOOK_DONE_MESSAGES.default
        : '분석이 완료되었습니다!'

    return (
        <main className={styles.container}>
            <div className={`${styles.questionCard} ${isGamebook ? styles.gamebookCard : ''}`}>
                <h2 className={`${styles.calculatingTitle} ${isGamebook ? styles.gamebookTitle : ''}`}>
                    {showResultButton ? doneMessage : loadingMessage}
                </h2>

                <div className={styles.calculatingProgress}>
                    <div
                        className={`${styles.calculatingBar} ${isGamebook ? styles.gamebookBar : ''}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <p className={styles.calculatingText}>{Math.floor(progress)}% 완료</p>

                <div style={{ marginTop: '2.5rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {showResultButton && (
                        <button
                            className={`${styles.resultButton} ${isGamebook ? styles.gamebookButton : ''}`}
                            onClick={() => router.push(finalUrl)}
                            style={{ margin: '0' }}
                        >
                            {isGamebook ? '결말 확인하기 →' : '결과 확인하기'}
                        </button>
                    )}
                </div>
            </div>
        </main>
    )
}
