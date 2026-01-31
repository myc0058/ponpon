'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './ping.module.css';

const WIDTH = 500;
const HEIGHT = 350;
const PADDLE_H = 80;
const PADDLE_W = 12;

function PingPongGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [ball, setBall] = useState({ x: WIDTH / 2, y: HEIGHT / 2 });
    const [p1Y, setP1Y] = useState(HEIGHT / 2 - PADDLE_H / 2);
    const [p2Y, setP2Y] = useState(HEIGHT / 2 - PADDLE_H / 2);
    const [scores, setScores] = useState({ p1: 0, p2: 0 });
    const [isPlaying, setIsPlaying] = useState(false);

    const ballRef = useRef({ x: WIDTH / 2, y: HEIGHT / 2 });
    const velRef = useRef({ x: 4, y: 3 });
    const p1YRef = useRef(HEIGHT / 2 - PADDLE_H / 2);
    const p2YRef = useRef(HEIGHT / 2 - PADDLE_H / 2);
    const scoreRef = useRef({ p1: 0, p2: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top - PADDLE_H / 2;
        p1YRef.current = Math.max(0, Math.min(y, HEIGHT - PADDLE_H));
        setP1Y(p1YRef.current);
    };

    useEffect(() => {
        if (!isPlaying) return;

        const loop = () => {
            let { x, y } = ballRef.current;
            let { x: vx, y: vy } = velRef.current;

            x += vx;
            y += vy;

            // Wall bounce
            if (y <= 0 || y >= HEIGHT - 12) {
                vy *= -1;
                y = y <= 0 ? 0 : HEIGHT - 12;
            }

            // Paddle collision
            if (x <= 20 + PADDLE_W && x >= 20 && y + 12 >= p1YRef.current && y <= p1YRef.current + PADDLE_H) {
                vx = Math.abs(vx) + 0.2; // Speed up
                x = 20 + PADDLE_W;
            }
            if (x >= WIDTH - 20 - PADDLE_W - 12 && x <= WIDTH - 20 && y + 12 >= p2YRef.current && y <= p2YRef.current + PADDLE_H) {
                vx = -(Math.abs(vx) + 0.2);
                x = WIDTH - 20 - PADDLE_W - 12;
            }

            // Scoring
            if (x < 0) {
                scoreRef.current.p2 += 1;
                resetBall();
            } else if (x > WIDTH) {
                scoreRef.current.p1 += 1;
                resetBall();
            } else {
                ballRef.current = { x, y };
                velRef.current = { x: vx, y: vy };
                setBall({ x, y });

                // Simple AI for P2
                const aiY = p2YRef.current + (y - (p2YRef.current + PADDLE_H / 2)) * 0.1;
                p2YRef.current = Math.max(0, Math.min(aiY, HEIGHT - PADDLE_H));
                setP2Y(p2YRef.current);

                setScores({ ...scoreRef.current });
            }

            if (scoreRef.current.p1 >= 5 || scoreRef.current.p2 >= 5) {
                setIsPlaying(false);
                onGameOver(scoreRef.current.p1 * 20);
                return;
            }

            requestAnimationFrame(loop);
        };

        const resetBall = () => {
            ballRef.current = { x: WIDTH / 2, y: HEIGHT / 2 };
            velRef.current = { x: scoreRef.current.p1 > scoreRef.current.p2 ? -4 : 4, y: 3 };
        };

        const id = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(id);
    }, [isPlaying, onGameOver]);

    return (
        <div className={styles.gameContainer} onMouseMove={handleMouseMove} onClick={() => setIsPlaying(true)}>
            <div className={styles.centerLine} />
            <div className={styles.scoreUI}>
                <span>{scores.p1}</span>
                <span>{scores.p2}</span>
            </div>
            <div className={styles.paddle} style={{ left: 20, top: p1Y, backgroundImage: `url('https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/games/sprites/ping-pong/paddle_red.webp?v=1769861017048')`, backgroundSize: '100% 100%' }} />
            <div className={styles.paddle} style={{ right: 20, top: p2Y, backgroundImage: `url('https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/games/sprites/ping-pong/paddle_blue.webp?v=1769861016857')`, backgroundSize: '100% 100%' }} />
            <div className={styles.ball} style={{ left: ball.x, top: ball.y }} />
            {!isPlaying && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.5)', color: 'white' }}>
                    <h2>CLICK TO START (5 POINTS TO WIN)</h2>
                </div>
            )}
        </div>
    );
}

export default function PingPage() {
    return (
        <GameContainer slug="ping-pong">
            {(props) => <PingPongGame {...props} />}
        </GameContainer>
    );
}
