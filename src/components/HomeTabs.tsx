'use client'

import { useState } from 'react'
import { Quiz, MiniGame } from '@/types'
import QuizCard from './QuizCard'
import GameCard from './GameCard'
import styles from './HomeTabs.module.css'

interface HomeTabsProps {
    quizzes: Quiz[]
    games: MiniGame[]
}

type Tab = 'all' | 'quiz' | 'game'

export default function HomeTabs({ quizzes, games }: HomeTabsProps) {
    const [activeTab, setActiveTab] = useState<Tab>('all')

    // 합쳐진 콘텐츠 생성 (생성일자 기준 정렬)
    const allContent = [
        ...quizzes.map(q => ({ ...q, contentType: 'quiz' as const })),
        ...games.map(g => ({ ...g, contentType: 'game' as const }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const filteredContent = activeTab === 'all'
        ? allContent
        : activeTab === 'quiz'
            ? quizzes.map(q => ({ ...q, contentType: 'quiz' as const }))
            : games.map(g => ({ ...g, contentType: 'game' as const }))

    return (
        <div className={styles.container}>
            <div className={styles.tabList}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'all' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    전체
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'quiz' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('quiz')}
                >
                    퀴즈
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'game' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('game')}
                >
                    게임
                </button>
            </div>

            <div className={styles.grid}>
                {filteredContent.map((item, index) => (
                    item.contentType === 'quiz' ? (
                        <QuizCard key={item.id} quiz={item as Quiz} priority={index < 4} />
                    ) : (
                        <GameCard key={item.id} game={item as MiniGame} priority={index < 4} />
                    )
                ))}
                {filteredContent.length === 0 && (
                    <div className={styles.emptyState}>
                        콘텐츠가 없습니다.
                    </div>
                )}
            </div>
        </div>
    )
}
