'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './flappy.module.css';

interface Pipe {
    id: number;
    x: number;
    topHeight: number;
    bottomHeight: number;
    passed: boolean;
}

const GRAVITY = 0.6;
const LIFT = -8;
const PIPE_WIDTH = 52;
const BIRD_SIZE = 24;
const GAP = 150;
const PIPE_SPEED = 3.5;

function FlappyBirdGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [score, setScore] = useState(0);
    const [birdY, setBirdY] = useState(250);
    const [pipes, setPipes] = useState<Pipe[]>([]);
    const [isGameOver, setIsGameOver] = useState(false);

    const birdPosRef = useRef(250);
    const birdVelocityRef = useRef(0);
    const pipesRef = useRef<Pipe[]>([]);
    const scoreRef = useRef(0);
    const frameRef = useRef(0);
    const lastTimeRef = useRef(0);

    const fly = useCallback(() => {
        if (isGameOver) return;
        birdVelocityRef.current = LIFT;
    }, [isGameOver]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                fly();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [fly]);

    useEffect(() => {
        const spawnPipe = () => {
            const minHeight = 50;
            const maxHeight = 500 - GAP - minHeight;
            const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
            const newPipe: Pipe = {
                id: Date.now(),
                x: 600,
                topHeight,
                bottomHeight: 500 - topHeight - GAP,
                passed: false
            };
            pipesRef.current.push(newPipe);
        };

        const update = (time: number) => {
            if (isGameOver) return;

            if (lastTimeRef.current === 0) {
                lastTimeRef.current = time;
                spawnPipe();
            }

            // Apply Gravity
            birdVelocityRef.current += GRAVITY;
            birdPosRef.current += birdVelocityRef.current;
            setBirdY(birdPosRef.current);

            // Floor/Ceiling collision
            if (birdPosRef.current < 0 || birdPosRef.current + BIRD_SIZE > 500) {
                endGame();
                return;
            }

            // Update Pipes
            const nextPipes = pipesRef.current
                .map(p => ({ ...p, x: p.x - PIPE_SPEED }))
                .filter(p => p.x > -PIPE_WIDTH);

            // Spawn new pipe
            if (nextPipes.length > 0 && nextPipes[nextPipes.length - 1].x < 350) {
                const minHeight = 50;
                const maxHeight = 500 - GAP - minHeight;
                const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
                nextPipes.push({
                    id: Date.now(),
                    x: 600,
                    topHeight,
                    bottomHeight: 500 - topHeight - GAP,
                    passed: false
                });
            }

            // Collision Detection & Scoring
            for (const p of nextPipes) {
                // Scoring
                if (!p.passed && p.x + PIPE_WIDTH < 50) {
                    p.passed = true;
                    scoreRef.current += 1;
                    setScore(scoreRef.current);
                }

                // Collision
                const birdLeft = 50;
                const birdRight = 50 + 34;
                const birdTop = birdPosRef.current;
                const birdBottom = birdPosRef.current + BIRD_SIZE;

                if (birdRight > p.x && birdLeft < p.x + PIPE_WIDTH) {
                    if (birdTop < p.topHeight || birdBottom > 500 - p.bottomHeight) {
                        endGame();
                        return;
                    }
                }
            }

            pipesRef.current = nextPipes;
            setPipes([...nextPipes]);
            frameRef.current = requestAnimationFrame(update);
        };

        const endGame = () => {
            setIsGameOver(true);
            onGameOver(scoreRef.current);
            cancelAnimationFrame(frameRef.current);
        };

        frameRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(frameRef.current);
    }, [isGameOver, onGameOver]);

    return (
        <div
            className={styles.gameContainer}
            onClick={fly}
        >
            <div className={styles.scoreUI}>{score}</div>

            <div className={styles.skyline}></div>

            <div
                className={styles.bird}
                style={{
                    top: `${birdY}px`,
                    transform: `rotate(${Math.min(Math.max(birdVelocityRef.current * 3, -25), 90)}deg)`
                }}
            ></div>

            {pipes.map(p => (
                <div key={p.id}>
                    <div
                        className={styles.pipe}
                        style={{ left: `${p.x}px`, top: 0, height: `${p.topHeight}px`, borderTop: 'none' }}
                    ></div>
                    <div
                        className={styles.pipe}
                        style={{ left: `${p.x}px`, bottom: 0, height: `${p.bottomHeight}px`, borderBottom: 'none' }}
                    ></div>
                </div>
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

export default function FlappyBirdPage() {
    return (
        <GameContainer slug="flappy-bird">
            {(props) => <FlappyBirdGame {...props} />}
        </GameContainer>
    );
}
