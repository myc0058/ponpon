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
    const progressRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const [isLoaded, setIsLoaded] = useState(false)

    // Restore state on mount
    useEffect(() => {
        const savedState = sessionStorage.getItem(`quiz_progress_${quiz.id}`)
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState)
                if (parsed.currentQuestionIndex < quiz.questions.length) {
                    setCurrentQuestionIndex(parsed.currentQuestionIndex)
                    setTotalScore(parsed.totalScore)
                    setSelectedTypes(parsed.selectedTypes)
                    setWeightedScores(parsed.weightedScores)
                }
            } catch (e) {
                console.error('Failed to parse saved state', e)
            }
        }
        setIsLoaded(true)
    }, [quiz.id, quiz.questions.length])

    // Save state on change
    useEffect(() => {
        if (!isLoaded) return

        const state = {
            currentQuestionIndex,
            totalScore,
            selectedTypes,
            weightedScores
        }
        sessionStorage.setItem(`quiz_progress_${quiz.id}`, JSON.stringify(state))
    }, [quiz.id, currentQuestionIndex, totalScore, selectedTypes, weightedScores, isLoaded])

    // Scroll to progress bar when question changes
    useEffect(() => {
        if (progressRef.current) {
            progressRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [currentQuestionIndex])

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

        let newScore = totalScore
        let newTypes = [...selectedTypes]
        let newWeightedScores = { ...weightedScores }

        if (quiz.resultType === 'SCORE_BASED') {
            newScore = totalScore + option.score
        } else {
            if (option.resultTypeCode) {
                newTypes.push(option.resultTypeCode)
                const scoreToAdd = option.score ?? 1
                newWeightedScores[option.resultTypeCode] = (newWeightedScores[option.resultTypeCode] || 0) + scoreToAdd
            }
        }

        if (!isLastQuestion) {
            if (quiz.resultType === 'SCORE_BASED') {
                setTotalScore(newScore)
            } else {
                setSelectedTypes(newTypes)
                setWeightedScores(newWeightedScores)
            }
            setCurrentQuestionIndex(nextIndex)
        } else {
            // Determine final result and save to session storage
            let resultQuery = ''
            if (quiz.resultType === 'SCORE_BASED') {
                // Save result data for analyzing page
                sessionStorage.setItem(`quiz_result_${quiz.id}`, JSON.stringify({
                    type: 'SCORE',
                    score: newScore
                }))
            } else {
                const validCodes = quiz.results.map(r => r.typeCode).filter(Boolean) as string[]
                const finalType = calculateTypeResult(newTypes, quiz.typeCodeLimit, validCodes, newWeightedScores)

                sessionStorage.setItem(`quiz_result_${quiz.id}`, JSON.stringify({
                    type: 'TYPE',
                    resultType: finalType
                }))
            }

            // Clear progress
            sessionStorage.removeItem(`quiz_progress_${quiz.id}`)

            router.push(`/quiz/${quiz.id}/analyzing`)
        }
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

                {/* Preload next image */}
                {/* Preload next image with exact same props as main image to ensure cache hit */}
                {quiz.questions[currentQuestionIndex + 1]?.imageUrl && (
                    <div style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
                        <Image
                            src={quiz.questions[currentQuestionIndex + 1].imageUrl!}
                            alt="preload"
                            fill
                            sizes="(max-width: 768px) 100vw, 400px"
                            priority
                        />
                    </div>
                )}

            </div>
        </main>
    )
}
