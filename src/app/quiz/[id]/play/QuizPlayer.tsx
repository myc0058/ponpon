'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './play.module.css'
import { calculateTypeResult } from '@/lib/quiz-logic'

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
    results: {
        id: string
        typeCode: string | null
    }[]
}

export default function QuizPlayer({ quiz }: { quiz: Quiz }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [totalScore, setTotalScore] = useState(0)
    const [selectedTypes, setSelectedTypes] = useState<string[]>([])
    const [weightedScores, setWeightedScores] = useState<Record<string, number>>({})
    const [isCalculating, setIsCalculating] = useState(false)
    const [calculationProgress, setCalculationProgress] = useState(0)
    const [showResultButton, setShowResultButton] = useState(false)
    const [finalUrl, setFinalUrl] = useState('')
    const progressRef = useRef<HTMLDivElement>(null)
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
                    // Linear progress to exactly 5 seconds: 1% every 50ms (100 * 50ms = 5000ms)
                    const increment = 1
                    return Math.min(100, prev + increment)
                })
            }, 50) // Update more frequently for smoother animation
            return () => clearInterval(timer)
        }
    }, [isCalculating])

    // Scroll to progress bar when question changes or calculation starts
    useEffect(() => {
        if (progressRef.current) {
            progressRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [currentQuestionIndex, isCalculating])

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
            const newWeightedScores = { ...weightedScores }

            if (option.resultTypeCode) {
                newTypes.push(option.resultTypeCode)
                // Accumulate weighted score (default to 1 if score is 0 or undefined, though currently score is optional in Option type but present)
                // Actually the user wants to use `score` field which is likely option.score.
                // If option.score is 0 (default for type-based?), we might want to default to 1?
                // But the user said "make it +0.5 +1", so if it is explicitly set, use it.
                // If it's a legacy quiz, score might be 0.

                // Let's assume if score is explicitly provided (even 0), we use it. 
                // However, for backward compatibility, if all scores are 0, the logic in calculateTypeResult handles fallback.

                const scoreToAdd = option.score ?? 1; // Default to 1 if undefined? Or just use option.score. 
                // The Option type has score: number.

                newWeightedScores[option.resultTypeCode] = (newWeightedScores[option.resultTypeCode] || 0) + scoreToAdd
            }

            if (!isLastQuestion) {
                setSelectedTypes(newTypes)
                setWeightedScores(newWeightedScores)
                setCurrentQuestionIndex(nextIndex)
            } else {
                // Use the imported utility with validation
                const validCodes = quiz.results.map(r => r.typeCode).filter(Boolean) as string[]

                // Pass newWeightedScores to the calculation
                const finalType = calculateTypeResult(newTypes, quiz.typeCodeLimit, validCodes, newWeightedScores)
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
                <div className={styles.progressSection} ref={progressRef}>
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
