'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './whack.module.css';

const GAME_DURATION = 30; // 30 seconds

function WhackAMoleGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [activeHole, setActiveHole] = useState<number | null>(null);
    const [isHit, setIsHit] = useState(false);

    const scoreRef = useRef(0);
    const isGameOverRef = useRef(false);

    const spawnMole = useCallback(() => {
        if (isGameOverRef.current) return;
        const randomHole = Math.floor(Math.random() * 9);
        setActiveHole(randomHole);
        setIsHit(false);

        // Mole stays for random duration
        const duration = Math.max(400, 1000 - (scoreRef.current * 10)); // Gets faster
        setTimeout(() => {
            setActiveHole(null);
            if (!isGameOverRef.current) {
                setTimeout(spawnMole, Math.random() * 500 + 200);
            }
        }, duration);
    }, []);

    useEffect(() => {
        spawnMole();
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    isGameOverRef.current = true;
                    onGameOver(scoreRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => {
            clearInterval(timer);
            isGameOverRef.current = true;
        };
    }, [spawnMole, onGameOver]);

    const handleWhack = (index: number) => {
        if (index === activeHole && !isHit) {
            setIsHit(true);
            scoreRef.current += 10;
            setScore(scoreRef.current);
            // Hide mole immediately on hit
            setTimeout(() => setActiveHole(null), 100);
        }
    };

    return (
        <div className={styles.gameContainer}>
            <div className={styles.header}>
                <span>점수: {score}</span>
                <span>시간: {timeLeft}s</span>
            </div>
            <div className={styles.grid}>
                {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className={styles.hole}>
                        <div
                            className={`${styles.mole} ${activeHole === i ? styles.moleActive : ''} ${activeHole === i && isHit ? styles.moleHit : ''}`}
                            onClick={() => handleWhack(i)}
                        >
                            {/* Image handled by CSS */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function WhackPage() {
    return (
        <GameContainer slug="whack-a-mole">
            {(props) => <WhackAMoleGame {...props} />}
        </GameContainer>
    );
}
