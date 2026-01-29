'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './play.module.css'

type Option = {
    id: string
    content: string
    score: number
    resultTypeCode: string | null
}

type Question = {
    id: string
    content: string
    imageUrl: string | null
    order: number
    options: Option[]
}

type Quiz = {
    id: string
    title: string
    resultType: 'SCORE_BASED' | 'TYPE_BASED'
    typeCodeLimit: number
    questions: Question[]
}

export default function QuizPlayer({ quiz }: { quiz: Quiz }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [totalScore, setTotalScore] = useState(0)
    const [selectedTypes, setSelectedTypes] = useState<string[]>([])
    const [isCalculating, setIsCalculating] = useState(false)
    const [calculationProgress, setCalculationProgress] = useState(0)
    const [showResultButton, setShowResultButton] = useState(false)
    const [finalUrl, setFinalUrl] = useState('')
    const router = useRouter()

    useEffect(() => {
        if (isCalculating) {
            const timer = setInterval(() => {
                setCalculationProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(timer)
                        setShowResultButton(true)
                        return 100
                    }
                    return prev + 1.5 // 약 6-7초 동안 진행
                })
            }, 100)
            return () => clearInterval(timer)
        }
    }, [isCalculating])

    // Safety check: if no questions, show error
    if (!quiz.questions || quiz.questions.length === 0) {
        return (
            <main className={styles.container}>
                <div className={styles.questionCard}>
                    <h2 style={{ textAlign: 'center', color: '#ef4444' }}>
                        이 퀴즈에는 아직 질문이 없습니다.
                    </h2>
                    <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                        관리자 페이지에서 질문을 추가해주세요.
                    </p>
                </div>
            </main>
        )
    }

    const currentQuestion = quiz.questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

    const calculateResult = (types: string[]) => {
        if (types.length === 0) return ''

        const counts: Record<string, number> = {}
        types.forEach(t => {
            counts[t] = (counts[t] || 0) + 1
        })

        // 빈도수 높은 순으로 정렬 (빈도수 같으면 알파벳 순)
        const sortedTypes = Object.entries(counts)
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
            .map(item => item[0])

        // 설정된 limit만큼 상위 코드들을 합쳐서 반환
        const limit = quiz.typeCodeLimit || 2
        return sortedTypes.slice(0, limit).join('')
    }

    const handleAnswer = (option: Option) => {
        const nextIndex = currentQuestionIndex + 1
        const isLastQuestion = nextIndex === quiz.questions.length

        if (quiz.resultType === 'SCORE_BASED') {
            const newScore = totalScore + option.score
            if (!isLastQuestion) {
                setTotalScore(newScore)
                setCurrentQuestionIndex(nextIndex)
            } else {
                setFinalUrl(`/quiz/${quiz.id}/result?score=${newScore}`)
                setIsCalculating(true)
            }
        } else {
            const newTypes = [...selectedTypes]
            if (option.resultTypeCode) {
                newTypes.push(option.resultTypeCode)
            }

            if (!isLastQuestion) {
                setSelectedTypes(newTypes)
                setCurrentQuestionIndex(nextIndex)
            } else {
                const finalType = calculateResult(newTypes)
                setFinalUrl(`/quiz/${quiz.id}/result?type=${finalType}`)
                setIsCalculating(true)
            }
        }
    }

    if (isCalculating) {
        return (
            <main className={styles.container}>
                <div className={styles.questionCard}>
                    <h2 className={styles.calculatingTitle}>
                        {showResultButton ? '분석이 완료되었습니다!' : '데이터를 정밀 분석 중...'}
                    </h2>

                    <div className={styles.calculatingProgress}>
                        <div
                            className={styles.calculatingBar}
                            style={{ width: `${calculationProgress}%` }}
                        />
                    </div>

                    <p className={styles.calculatingText}>{Math.floor(calculationProgress)}% 완료</p>

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



    // useEffect(() => {
    //     setIsImageLoaded(false)
    // }, [currentQuestionIndex])

    // ... (rest of code)

    return (
        <main className={styles.container}>
            <div className={styles.questionCard}>
                <div className={styles.progressSection}>
                    <div className={styles.progressText}>
                        <span className={styles.currentStep}>{currentQuestionIndex + 1}</span>
                        <span className={styles.totalStep}>/{quiz.questions.length}</span>
                    </div>
                    <div className={styles.customProgressBar}>
                        <div
                            className={styles.customProgressFill}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {currentQuestion.imageUrl && (
                    <div className={styles.imageWrapper}>
                        <Image
                            src={currentQuestion.imageUrl}
                            alt="Question"
                            className={styles.questionImage}
                            fill
                            sizes="(max-width: 768px) 100vw, 400px"
                            priority
                        />
                    </div>
                )}

                <div className={styles.contentAnimation} key={currentQuestion.id}>
                    <h2 className={styles.questionText}>{currentQuestion.content}</h2>

                    <div className={styles.options}>
                        {currentQuestion.options.map((option) => (
                            <button
                                key={option.id}
                                className={styles.optionButton}
                                onClick={() => handleAnswer(option)}
                            >
                                {option.content}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </main>
    )
}
