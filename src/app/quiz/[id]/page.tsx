import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import styles from './quiz.module.css'
import { PlayCircle } from 'lucide-react'

export default async function QuizIntroPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const quiz = await prisma.quiz.findUnique({
        where: { id },
        include: {
            questions: true,
            results: true
        }
    })

    if (!quiz) {
        return <div>Quiz not found</div>
    }

    return (
        <main className={styles.container}>
            <div className={styles.introCard}>
                {quiz.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={quiz.imageUrl} alt={quiz.title} className={styles.coverImage} />
                )}
                <div className={styles.content}>
                    <h1 className={styles.title}>{quiz.title}</h1>
                    <p className={styles.description}>{quiz.description}</p>

                    <div className={styles.stats}>
                        <div className={styles.stat}>
                            <span className={styles.statLabel}>질문 수</span>
                            <span className={styles.statValue}>{quiz.questions.length}</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statLabel}>참여 수</span>
                            <span className={styles.statValue}>{quiz.plays.toLocaleString()}</span>
                        </div>
                    </div>

                    <Link href={`/quiz/${quiz.id}/play`} className={styles.startButton}>
                        <PlayCircle size={24} />
                        시작하기
                    </Link>
                </div>
            </div>
        </main>
    )
}
