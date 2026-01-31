'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './higher.module.css';

function HigherLowerGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [currentNum, setCurrentNum] = useState<number>(0);
    const [nextNum, setNextNum] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [isRevealing, setIsRevealing] = useState(false);
    const [status, setStatus] = useState<'IDLE' | 'WIN' | 'LOSE'>('IDLE');

    const scoreRef = useRef(0);

    const initGame = useCallback(() => {
        const first = Math.floor(Math.random() * 100) + 1;
        setCurrentNum(first);
    }, []);

    useEffect(() => {
        initGame();
    }, [initGame]);

    const handleGuess = (guess: 'HIGHER' | 'LOWER') => {
        if (isRevealing) return;

        const next = Math.floor(Math.random() * 100) + 1;
        setNextNum(next);
        setIsRevealing(true);

        const isHigher = next > currentNum;
        const won = (guess === 'HIGHER' && isHigher) || (guess === 'LOWER' && !isHigher);

        setTimeout(() => {
            if (won) {
                setStatus('WIN');
                scoreRef.current += 10;
                setScore(scoreRef.current);
                setTimeout(() => {
                    setCurrentNum(next);
                    setNextNum(null);
                    setIsRevealing(false);
                    setStatus('IDLE');
                }, 1000);
            } else {
                setStatus('LOSE');
                setTimeout(() => {
                    onGameOver(scoreRef.current);
                }, 1000);
            }
        }, 600);
    };

    return (
        <div className={styles.gameContainer}>
            <div className={styles.streak}>SCORE: {score}</div>

            <div className={styles.cardArea}>
                <div className={`${styles.card} ${styles.flipped}`}>
                    <span className={styles.cardLabel}>Current</span>
                    {currentNum}
                </div>
                <div className={`${styles.card} ${isRevealing ? styles.revealing : ''} ${isRevealing ? styles.flipped : ''}`} style={{ backgroundColor: status === 'LOSE' ? '#7f1d1d' : status === 'WIN' ? '#064e3b' : '' }}>
                    <span className={styles.cardLabel}>Next</span>
                    {isRevealing ? nextNum : '?'}
                </div>
            </div>

            <div className={styles.buttonArea}>
                <button
                    className={`${styles.button} ${styles.higher}`}
                    onClick={() => handleGuess('HIGHER')}
                    disabled={isRevealing}
                >
                    HIGHER ▲
                </button>
                <button
                    className={`${styles.button} ${styles.lower}`}
                    onClick={() => handleGuess('LOWER')}
                    disabled={isRevealing}
                >
                    LOWER ▼
                </button>
            </div>

            <div style={{ marginTop: 20, fontWeight: 'bold', minHeight: '24px' }}>
                {status === 'WIN' && <span style={{ color: '#10b981' }}>SUCCESS!</span>}
                {status === 'LOSE' && <span style={{ color: '#ef4444' }}>GAME OVER!</span>}
            </div>
        </div>
    );
}

export default function HigherPage() {
    return (
        <GameContainer slug="higher-lower">
            {(props) => <HigherLowerGame {...props} />}
        </GameContainer>
    );
}
