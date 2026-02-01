import { getQuizzes } from '@/actions/quiz'
import styles from './home.module.css'
import HeroCarousel from '@/components/HeroCarousel'
import QuizGrid from '@/components/QuizGrid'
import { Quiz } from '@/types'

export const revalidate = 60

export default async function Home() {
  const quizzes = await getQuizzes() as Quiz[]
  const featuredQuizzes = quizzes.filter((quiz) => quiz.isFeatured)

  return (
    <main className={styles.container}>
      {/* Hero Carousel Section */}
      {featuredQuizzes.length > 0 && (
        <HeroCarousel quizzes={featuredQuizzes} />
      )}

      {/* Quiz Grid Section */}
      <QuizGrid quizzes={quizzes} />
    </main>
  )
}
