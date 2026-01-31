'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './jump.module.css';

const JUMP_FORCE = -8;
const GRAVITY = 0.3;
const WIDTH = 400;
const HEIGHT = 500;

interface Platform {
    id: number;
    x: number;
    y: number;
}

function JumpGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [player, setPlayer] = useState({ x: 185, y: 400, vy: 0 });
    const [score, setScore] = useState(0);
    const [started, setStarted] = useState(false);

    const playerRef = useRef({ x: 185, y: 400, vy: 0 });
    const platformsRef = useRef<Platform[]>([]);
    const scoreRef = useRef(0);
    const cameraYRef = useRef(0);

    const initRound = useCallback(() => {
        const initialPlatforms: Platform[] = [{ id: 0, x: 150, y: 450 }];
        for (let i = 1; i < 8; i++) {
            initialPlatforms.push({
                id: i,
                x: Math.random() * (WIDTH - 70),
                y: 450 - i * 100
            });
        }
        setPlatforms(initialPlatforms);
        platformsRef.current = initialPlatforms;
    }, []);

    useEffect(() => {
        initRound();
    }, [initRound]);

    useEffect(() => {
        if (!started) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = document.querySelector(`.${styles.gameContainer}`)?.getBoundingClientRect();
            if (rect) {
                const x = e.clientX - rect.left - 15;
                playerRef.current.x = Math.max(0, Math.min(WIDTH - 30, x));
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [started]);

    useEffect(() => {
        if (!started) return;

        const loop = () => {
            const p = playerRef.current;
            p.vy += GRAVITY;
            p.y += p.vy;

            // Collision with platforms
            if (p.vy > 0) {
                platformsRef.current.forEach(plat => {
                    if (
                        p.x + 30 > plat.x &&
                        p.x < plat.x + 70 &&
                        p.y + 30 > plat.y &&
                        p.y + 30 < plat.y + 15
                    ) {
                        p.vy = JUMP_FORCE;
                    }
                });
            }

            // Camera movement
            if (p.y < HEIGHT / 2) {
                const diff = HEIGHT / 2 - p.y;
                p.y = HEIGHT / 2;
                cameraYRef.current += diff;
                scoreRef.current = Math.max(scoreRef.current, Math.floor(cameraYRef.current / 10));
                setScore(scoreRef.current);

                // Move platforms
                platformsRef.current = platformsRef.current.map(plat => ({
                    ...plat,
                    y: plat.y + diff
                }));

                // Repopulate platforms
                if (platformsRef.current[platformsRef.current.length - 1].y > 0) {
                    platformsRef.current.push({
                        id: Date.now(),
                        x: Math.random() * (WIDTH - 70),
                        y: platformsRef.current[platformsRef.current.length - 1].y - 100
                    });
                }

                // Remove out of bounds
                platformsRef.current = platformsRef.current.filter(plat => plat.y < HEIGHT);
                setPlatforms([...platformsRef.current]);
            }

            // Game Over
            if (p.y > HEIGHT) {
                onGameOver(scoreRef.current);
                return;
            }

            setPlayer({ ...p });
            requestAnimationFrame(loop);
        };

        const id = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(id);
    }, [started, onGameOver]);

    return (
        <div className={styles.gameContainer} onClick={() => !started && setStarted(true)}>
            {!started && <div className={styles.startMessage}>CLICK TO START</div>}
            <div className={styles.scoreUI}>{score}</div>

            <div
                className={styles.player}
                style={{
                    left: player.x,
                    top: player.y,
                    transform: player.vy < 0 ? 'scaleY(1.2)' : 'scaleY(0.9)'
                }}
            />

            {platforms.map(plat => (
                <div key={plat.id} className={styles.platform} style={{ left: plat.x, top: plat.y }} />
            ))}
        </div>
    );
}

export default function JumpPage() {
    return (
        <GameContainer slug="jump-jump">
            {(props) => <JumpGame {...props} />}
        </GameContainer>
    );
}
