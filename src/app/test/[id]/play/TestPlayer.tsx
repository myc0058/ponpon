'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

type Result = {
    id: string
    title: string
    description: string
    imageUrl: string | null
    minScore: number
    maxScore: number
    typeCode: string | null
    isPremium: boolean
}

type Test = {
    id: string
    title: string
    resultType: 'SCORE_BASED' | 'TYPE_BASED'
    questions: Question[]
    results: Result[]
}

export default function TestPlayer({ test }: { test: Test }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [totalScore, setTotalScore] = useState(0)
    const [selectedTypes, setSelectedTypes] = useState<string[]>([])
    const router = useRouter()

    // Safety check: if no questions, show error
    if (!test.questions || test.questions.length === 0) {
        return (
            <main className={styles.container}>
                <div className={styles.questionCard}>
                    <h2 style={{ textAlign: 'center', color: '#ef4444' }}>
                        이 테스트에는 아직 질문이 없습니다.
                    </h2>
                    <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                        관리자 페이지에서 질문을 추가해주세요.
                    </p>
                </div>
            </main>
        )
    }

    const currentQuestion = test.questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / test.questions.length) * 100

    const calculateResult = (types: string[]) => {
        if (types.length === 0) return ''

        const counts: Record<string, number> = {}
        types.forEach(t => {
            counts[t] = (counts[t] || 0) + 1
        })

        // Check if MBTI (is there a 4-letter typeCode in results?)
        const hasMBTIResults = test.results.some(r => r.typeCode && r.typeCode.length === 4)

        if (hasMBTIResults) {
            const getWinner = (a: string, b: string) => {
                const countA = counts[a] || 0
                const countB = counts[b] || 0
                if (countA === 0 && countB === 0) return ''
                return countA >= countB ? a : b
            }

            const mbti =
                getWinner('E', 'I') +
                getWinner('S', 'N') +
                getWinner('T', 'F') +
                getWinner('J', 'P')

            if (mbti.length > 0) return mbti
        }

        // Default: Most Frequent Type
        let maxCount = 0
        let winner = ''

        for (const [type, count] of Object.entries(counts)) {
            if (count > maxCount) {
                maxCount = count
                winner = type
            }
        }

        return winner
    }

    const handleAnswer = (option: Option) => {
        const nextIndex = currentQuestionIndex + 1
        const isLastQuestion = nextIndex === test.questions.length

        if (test.resultType === 'SCORE_BASED') {
            const newScore = totalScore + option.score
            if (!isLastQuestion) {
                setTotalScore(newScore)
                setCurrentQuestionIndex(nextIndex)
            } else {
                router.push(`/test/${test.id}/result?score=${newScore}`)
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
                router.push(`/test/${test.id}/result?type=${finalType}`)
            }
        }
    }

    return (
        <main className={styles.container}>
            <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>

            <div className={styles.questionCard}>
                <div className={styles.questionNumber}>
                    질문 {currentQuestionIndex + 1} / {test.questions.length}
                </div>

                {currentQuestion.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={currentQuestion.imageUrl}
                        alt="Question"
                        className={styles.questionImage}
                    />
                )}

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
        </main>
    )
}
