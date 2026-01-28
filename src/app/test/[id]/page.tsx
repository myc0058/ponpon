import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import styles from './test.module.css'
import { PlayCircle } from 'lucide-react'

export default async function TestIntroPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const test = await prisma.test.findUnique({
        where: { id },
        include: {
            questions: true,
            results: true
        }
    })

    if (!test) {
        return <div>Test not found</div>
    }

    return (
        <main className={styles.container}>
            <div className={styles.introCard}>
                {test.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={test.imageUrl} alt={test.title} className={styles.coverImage} />
                )}
                <div className={styles.content}>
                    <h1 className={styles.title}>{test.title}</h1>
                    <p className={styles.description}>{test.description}</p>

                    <div className={styles.stats}>
                        <div className={styles.stat}>
                            <span className={styles.statLabel}>질문 수</span>
                            <span className={styles.statValue}>{test.questions.length}</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statLabel}>참여 수</span>
                            <span className={styles.statValue}>{test.plays.toLocaleString()}</span>
                        </div>
                    </div>

                    <Link href={`/test/${test.id}/play`} className={styles.startButton}>
                        <PlayCircle size={24} />
                        시작하기
                    </Link>
                </div>
            </div>
        </main>
    )
}
