import { getQuizzes } from '@/actions/quiz'
import Link from 'next/link'
import styles from './home.module.css'
import { PlayCircle } from 'lucide-react'
import HeroCarousel from '@/components/HeroCarousel'

// Placeholder for missing thumbnails
const DEFAULT_THUMBNAIL = 'https://placehold.co/600x400/png?text=Quiz'

export default async function Home() {
  const quizzes = await getQuizzes()
  const featuredQuizzes = quizzes.filter((quiz: any) => quiz.isFeatured)

  console.log('Total quizzes:', quizzes.length)
  console.log('Featured quizzes:', featuredQuizzes.length)
  console.log('Featured quiz data:', featuredQuizzes)

  return (
    <main className={styles.container}>
      {/* Logo Section */}
      <div className={styles.logoSection}>
        <h1 className={styles.logo}>PonPon</h1>
      </div>

      {/* Hero Carousel Section */}
      {featuredQuizzes.length > 0 && (
        <HeroCarousel quizzes={featuredQuizzes} />
      )}

      {/* All Quizzes Grid */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>모든 퀴즈</h2>
      </div>

      <div className={styles.grid}>
        {quizzes.map((quiz: any) => (
          <Link href={`/quiz/${quiz.id}`} key={quiz.id} className={styles.card}>
            {/* Using img tag for simplicity for now, optimize with next/image later if needed */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={quiz.imageUrl || DEFAULT_THUMBNAIL}
              alt={quiz.title}
              className={styles.thumbnail}
            />
            <div className={styles.cardContent}>
              <h2 className={styles.cardTitle}>{quiz.title}</h2>
              <p className={styles.cardDesc}>{quiz.description}</p>
              <div className={styles.playCount}>
                <PlayCircle size={14} />
                <span>{quiz.plays.toLocaleString()} plays</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
