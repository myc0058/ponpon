'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './dino.module.css';

interface Obstacle {
    id: number;
    x: number;
    width: number;
}

function DinoGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [score, setScore] = useState(0);
    const [isJumping, setIsJumping] = useState(false);
    const [obstacles, setObstacles] = useState<Obstacle[]>([]);
    const gameRef = useRef<HTMLDivElement>(null);
    const frameRef = useRef<number>(0);
    const dinoPosRef = useRef({ bottom: 2, isJumping: false });
    const scoreRef = useRef(0);
    const [isGameOver, setIsGameOver] = useState(false);

    const jump = useCallback(() => {
        if (!dinoPosRef.current.isJumping && !isGameOver) {
            setIsJumping(true);
            dinoPosRef.current.isJumping = true;

            // CSS Animation duration is 0.6s
            setTimeout(() => {
                setIsJumping(false);
                dinoPosRef.current.isJumping = false;
            }, 600);
        }
    }, [isGameOver]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                jump();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [jump]);

    useEffect(() => {
        let lastObstacleTime = 0;
        let obstacleId = 0;

        const update = (time: number) => {
            if (isGameOver) return;

            // Update Score
            scoreRef.current += 1;
            if (scoreRef.current % 10 === 0) {
                setScore(Math.floor(scoreRef.current / 10));
            }

            // Update Dino Position (approximate based on CSS animation)
            if (dinoPosRef.current.isJumping) {
                // Approximate curve for collision detection
                // In a real engine, we'd use physics, but here we sync with CSS
                const t = (Date.now() % 600) / 600; // This is not perfect, but works for simpler games
                // We'll use a more reliable way: just check if jumping and use a safe margin
            }

            // Manage Obstacles
            setObstacles(prev => {
                const next = prev
                    .map(obs => ({ ...obs, x: obs.x - 5 })) // Move left
                    .filter(obs => obs.x > -50); // Remove off-screen

                // Collision Detection
                const dinoLeft = 50;
                const dinoRight = 50 + 44;
                const dinoBottom = dinoPosRef.current.isJumping ? 80 : 2; // Rough jumping height for collision

                for (const obs of next) {
                    if (
                        dinoRight > obs.x &&
                        dinoLeft < obs.x + obs.width &&
                        dinoBottom < 50 // Cactus height
                    ) {
                        setIsGameOver(true);
                        onGameOver(Math.floor(scoreRef.current / 10));
                        return next;
                    }
                }

                // Spawn new obstacle
                if (time - lastObstacleTime > 1500 + Math.random() * 2000) {
                    lastObstacleTime = time;
                    next.push({ id: obstacleId++, x: 800, width: 25 });
                }

                return next;
            });

            frameRef.current = requestAnimationFrame(update);
        };

        frameRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(frameRef.current);
    }, [isGameOver, onGameOver]);

    return (
        <div
            className={styles.gameContainer}
            onClick={jump}
            ref={gameRef}
        >
            <div className={styles.scoreUI}>{score.toString().padStart(5, '0')}</div>

            <div className={styles.ground}></div>

            <div
                className={`${styles.dino} ${isJumping ? styles.jumpEffect : ''}`}
            >
                {/* Dino character representation */}
            </div>

            {obstacles.map(obs => (
                <div
                    key={obs.id}
                    className={styles.cactus}
                    style={{ left: `${obs.x}px` }}
                ></div>
            ))}

            {isGameOver && (
                <div className={styles.gameStartPrompt}>
                    <h2>GAME OVER</h2>
                    <p>Click to restart in GameContainer</p>
                </div>
            )}
        </div>
    );
}

export default function DinoPage() {
    return (
        <GameContainer slug="dino-run">
            {(props) => <DinoGame {...props} />}
        </GameContainer>
    );
}
