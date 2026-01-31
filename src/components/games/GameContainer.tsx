'use client';

import { useState, useEffect } from 'react';
import styles from './GameContainer.module.css';
import { PlayCircle, Share2, Trophy } from 'lucide-react';
import { useToast } from '@/components/Toast';

type GameState = 'IDLE' | 'PLAYING' | 'SUBMITTING' | 'RANKING';

interface RankingItem {
    nickname: string;
    score: number;
    rank: number;
}

interface GameContainerProps {
    slug: string;
    children: (props: { onGameOver: (score: number) => void }) => React.ReactNode;
}

export default function GameContainer({ slug, children }: GameContainerProps) {
    const [gameState, setGameState] = useState<GameState>('IDLE');
    const [nickname, setNickname] = useState('');
    const [score, setScore] = useState<number | null>(null);
    const [ranking, setRanking] = useState<RankingItem[]>([]);
    const [userRank, setUserRank] = useState<number | null>(null);
    const [gameInfo, setGameInfo] = useState<{ title: string; description: string; thumbnailUrl?: string } | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        // Fetch game metadata
        fetch(`/api/games/${slug}/info`)
            .then((res) => res.json())
            .then((data) => {
                if (!data.error) setGameInfo(data);
            })
            .catch(console.error);
    }, [slug]);

    const handleStartGame = () => {
        if (nickname.trim()) {
            setGameState('PLAYING');
        } else {
            showToast('시작하기 전에 닉네임을 입력해주세요!', 'error');
        }
    };

    const handleGameOver = async (finalScore: number) => {
        setScore(finalScore);
        setGameState('SUBMITTING');

        try {
            // Submit score
            const res = await fetch(`/api/games/${slug}/score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nickname, score: finalScore }),
            });
            const data = await res.json();
            setUserRank(data.rank);

            // Fetch leaderboard
            const rankRes = await fetch(`/api/games/${slug}/ranking`);
            const rankData = await rankRes.json();
            setRanking(rankData.ranking);

            setGameState('RANKING');
        } catch (error) {
            console.error('Failed to submit score:', error);
            alert('Score submission failed due to an error.');
            setGameState('IDLE');
        }
    };

    const handleRestart = () => {
        setGameState('PLAYING');
        setScore(null);
        setUserRank(null);
    };

    if (!gameInfo) return (
        <div className={styles.container}>
            <div className={styles.spinner}></div>
        </div>
    );

    return (
        <main className={styles.container}>
            <div className={styles.introCard}>
                {gameState === 'IDLE' && (
                    <>
                        {gameInfo.thumbnailUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={gameInfo.thumbnailUrl} alt={gameInfo.title} className={styles.coverImage} />
                        ) : (
                            <div className={styles.placeholderCover}>🎮</div>
                        )}
                        <div className={styles.content}>
                            <h1 className={styles.title}>{gameInfo.title}</h1>
                            <p className={styles.description}>{gameInfo.description}</p>

                            <div className={styles.stats}>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>모드</span>
                                    <span className={styles.statValue}>무한 랭킹</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>장르</span>
                                    <span className={styles.statValue}>아케이드</span>
                                </div>
                            </div>

                            <div className={styles.nicknameSection}>
                                <label className={styles.inputLabel}>닉네임</label>
                                <input
                                    type="text"
                                    placeholder="닉네임을 입력하세요"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    maxLength={10}
                                    className={styles.nicknameInput}
                                    required
                                />
                            </div>

                            <div className={styles.actionButtons}>
                                <button className={styles.secondaryButton} onClick={() => alert('Coming soon!')}>
                                    <Share2 size={24} />
                                    공유하기
                                </button>
                                <button
                                    className={styles.startButton}
                                    onClick={handleStartGame}
                                >
                                    <PlayCircle size={24} />
                                    시작하기
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {gameState === 'PLAYING' && (
                    <div className={styles.gameArea}>
                        {children({ onGameOver: handleGameOver })}
                    </div>
                )}

                {gameState === 'SUBMITTING' && (
                    <div className={styles.gameArea}>
                        <div className={styles.loadingOverlay}>
                            <div className={styles.spinner}></div>
                            <p>기록 저장 중...</p>
                        </div>
                    </div>
                )}

                {gameState === 'RANKING' && (
                    <div className={styles.rankingContainer}>
                        <div className={styles.rankingHeader}>
                            <h2>GAME OVER</h2>
                            <div className={styles.finalScore}>{score}</div>
                            {userRank && (
                                <div className={styles.userRankBadge}>
                                    <Trophy size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-top' }} />
                                    현재 순위: {userRank}위
                                </div>
                            )}
                        </div>

                        <div className={styles.leaderboard}>
                            <h3 className={styles.leaderboardTitle}>명예의 전당</h3>
                            <div className={styles.rankingList}>
                                {ranking.map((item) => (
                                    <div
                                        key={`${item.rank}-${item.nickname}`}
                                        className={`${styles.rankingItem} ${item.nickname === nickname ? styles.highlight : ''}`}
                                    >
                                        <div className={`${styles.rankNumber} ${item.rank === 1 ? styles.rank1 : item.rank === 2 ? styles.rank2 : item.rank === 3 ? styles.rank3 : ''}`}>
                                            {item.rank}
                                        </div>
                                        <div className={styles.playerNickname}>{item.nickname}</div>
                                        <div className={styles.playerScore}>{item.score}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.rankingFooter}>
                            <button className={styles.startButton} onClick={handleRestart}>
                                <PlayCircle size={24} />
                                다시 하기
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
