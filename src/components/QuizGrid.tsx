'use client'

import { Quiz } from '@/types'
import QuizCard from './QuizCard'
import styles from './QuizGrid.module.css'

interface QuizGridProps {
    quizzes: Quiz[]
}

export default function QuizGrid({ quizzes }: QuizGridProps) {
    return (
        <div className={styles.container}>
            <div className={styles.grid}>
                {quizzes.map((quiz, index) => (
                    <QuizCard key={quiz.id} quiz={quiz} priority={index < 4} />
                ))}
                {quizzes.length === 0 && (
                    <div className={styles.emptyState}>
                        퀴즈가 없습니다.
                    </div>
                )}
            </div>
        </div>
    )
}
