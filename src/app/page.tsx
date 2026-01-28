import { getTests } from '@/actions/test'
import Link from 'next/link'
import styles from './home.module.css'
import { PlayCircle } from 'lucide-react'

// Placeholder for missing thumbnails
const DEFAULT_THUMBNAIL = 'https://placehold.co/600x400/png?text=Test'

export default async function Home() {
  const tests = await getTests()

  return (
    <main className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>SimSim TAPA</h1>
        <p className={styles.subtitle}>Fun quizzes for everyone!</p>
      </div>

      <div className={styles.grid}>
        {tests.map((test) => (
          <Link href={`/test/${test.id}`} key={test.id} className={styles.card}>
            {/* Using img tag for simplicity for now, optimize with next/image later if needed */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={test.imageUrl || DEFAULT_THUMBNAIL}
              alt={test.title}
              className={styles.thumbnail}
            />
            <div className={styles.cardContent}>
              <h2 className={styles.cardTitle}>{test.title}</h2>
              <p className={styles.cardDesc}>{test.description}</p>
              <div className={styles.playCount}>
                <PlayCircle size={14} />
                <span>{test.plays.toLocaleString()} plays</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
