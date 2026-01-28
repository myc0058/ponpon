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

type Quiz = {
    id: string
    title: string
    resultType: 'SCORE_BASED' | 'TYPE_BASED'
    typeCodeLimit: number
    questions: Question[]
    results: Result[]
}

export default function QuizPlayer({ quiz }: { quiz: Quiz }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [totalScore, setTotalScore] = useState(0)
    const [selectedTypes, setSelectedTypes] = useState<string[]>([])
    const router = useRouter()

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
                router.push(`/quiz/${quiz.id}/result?score=${newScore}`)
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
                router.push(`/quiz/${quiz.id}/result?type=${finalType}`)
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
                    질문 {currentQuestionIndex + 1} / {quiz.questions.length}
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
