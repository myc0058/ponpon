'use client';

import { useState, useEffect } from 'react';
import GameContainer from '@/components/games/GameContainer';

import styles from './clicker.module.css';

function ClickerGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [clicks, setClicks] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            onGameOver(clicks);
        }
    }, [timeLeft, clicks, onGameOver]);

    return (
        <div className={styles.gameContainer}>
            <div className={styles.titleSection}>
                <p className={styles.label}>남은 시간</p>
                <p className={`${styles.timerValue} ${timeLeft <= 3 ? styles.danger : ''}`}>
                    {timeLeft}s
                </p>
            </div>

            <div className={styles.scoreSection}>
                <p className={styles.label}>현재 점수</p>
                <p className={styles.scoreValue}>{clicks}</p>
            </div>

            <button
                onClick={() => setClicks(c => c + 1)}
                className={styles.clickButton}
            >
                CLICK!
            </button>
        </div>
    );
}

export default function ClickerPage() {
    return (
        <GameContainer slug="clicker-hero">
            {(props) => <ClickerGame {...props} />}
        </GameContainer>
    );
}
