import Link from 'next/link'
import Image from 'next/image'
import { PlayCircle } from 'lucide-react'
import { Quiz } from '@/types'
import styles from './QuizCard.module.css'
import { getBustedImageUrl } from '@/lib/image-utils'

interface QuizCardProps {
    quiz: Quiz
    priority?: boolean
}

const DEFAULT_THUMBNAIL = 'https://placehold.co/600x400/png?text=Quiz'

export default function QuizCard({ quiz, priority = false }: QuizCardProps) {
    return (
        <Link href={`/quiz/${quiz.id}`} className={styles.card}>
            <div className={styles.imageWrapper}>
                <Image
                    src={getBustedImageUrl(quiz.imageUrl) || DEFAULT_THUMBNAIL}
                    alt={quiz.title}
                    fill
                    priority={priority}
                    className={styles.thumbnail}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {quiz.isHot && (
                    <div className={styles.hotBadge}>
                        <span className={styles.hotText}>HOT</span>
                    </div>
                )}
            </div>
            <div className={styles.cardContent}>
                <h2 className={styles.cardTitle}>{quiz.title}</h2>
                <p className={styles.cardDesc}>{quiz.description}</p>
                <div className={styles.playCount}>
                    <PlayCircle size={14} />
                    <span>{quiz.plays.toLocaleString()} plays</span>
                </div>
            </div>
        </Link>
    )
}
