import { getQuizzes } from '@/actions/quiz'
import { getGames } from '@/actions/game'
import styles from './home.module.css'
import HeroCarousel from '@/components/HeroCarousel'
import HomeTabs from '@/components/HomeTabs'
import { Quiz, MiniGame } from '@/types'

export const revalidate = 60


export default async function Home() {
  const [quizzes, games] = await Promise.all([
    getQuizzes() as Promise<Quiz[]>,
    getGames() as Promise<MiniGame[]>
  ])

  // 정렬 및 가공은 HomeTabs에서 처리하거나 여기서 처리 가능
  // 여기서는 원본 데이터를 넘겨줌
  const featuredQuizzes = quizzes.filter((quiz) => quiz.isFeatured)
  const featuredGames = games.filter((game) => game.isFeatured)

  // Carousel에는 퀴즈와 게임 중 featured인 것들을 모두 보여줄 수 있음
  // 현재 HeroCarousel이 Quiz 타입만 받는지 확인 필요
  // 일단 기존처럼 featuredQuizzes만 유지하거나, 타입을 맞춰서 합침
  const allFeatured = [
    ...featuredQuizzes.map(q => ({ ...q, type: 'quiz' })),
    ...featuredGames.map(g => ({ ...g, type: 'game' }))
  ]

  return (
    <main className={styles.container}>
      {/* Hero Carousel Section */}
      {featuredQuizzes.length > 0 && (
        <HeroCarousel quizzes={featuredQuizzes} />
      )}

      {/* Content Tabs Section */}
      <HomeTabs quizzes={quizzes} games={games} />
    </main>
  )
}
