import { getQuizzes } from '@/actions/quiz'
import styles from './home.module.css'
import HeroCarousel from '@/components/HeroCarousel'
import QuizCard from '@/components/QuizCard'
import { Quiz } from '@/types'

export const revalidate = 60


export default async function Home() {
  const quizzes = (await getQuizzes()) as unknown as Quiz[]
  const featuredQuizzes = quizzes.filter((quiz) => quiz.isFeatured)

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
        {quizzes.map((quiz, index) => (
          <QuizCard key={quiz.id} quiz={quiz} priority={index < 4} />
        ))}
      </div>
    </main>
  )
}
