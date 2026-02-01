import Link from 'next/link'
import Image from 'next/image'
import { Gamepad2 } from 'lucide-react'
import { MiniGame } from '@/types'
import styles from './GameCard.module.css'

interface GameCardProps {
    game: MiniGame
    priority?: boolean
}

const DEFAULT_THUMBNAIL = 'https://placehold.co/600x400/png?text=Game'

export default function GameCard({ game, priority = false }: GameCardProps) {
    return (
        <Link href={`/games/${game.slug}`} className={styles.card}>
            <div className={styles.imageWrapper}>
                <Image
                    src={game.thumbnailUrl || DEFAULT_THUMBNAIL}
                    alt={game.title}
                    fill
                    priority={priority}
                    className={styles.thumbnail}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className={styles.badge}>
                    <Gamepad2 size={12} />
                    <span>GAME</span>
                </div>
            </div>
            <div className={styles.cardContent}>
                <h2 className={styles.cardTitle}>{game.title}</h2>
                <p className={styles.cardDesc}>{game.description}</p>
            </div>
        </Link>
    )
}
