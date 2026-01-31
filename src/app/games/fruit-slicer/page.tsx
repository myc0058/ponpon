'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './slicer.module.css';

interface Fruit {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    type: string;
    isSliced: boolean;
}

const FRUITS = ['🍎', '🍉', '🍍', '🍊', '🥝', '💣'];

function FruitSlicerGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [fruits, setFruits] = useState<Fruit[]>([]);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [slashes, setSlashes] = useState<{ x: number, y: number, angle: number, width: number, id: number }[]>([]);

    const fruitsRef = useRef<Fruit[]>([]);
    const scoreRef = useRef(0);
    const livesRef = useRef(3);
    const lastMouseRef = useRef({ x: 0, y: 0 });
    const idRef = useRef(0);

    const spawnFruit = useCallback(() => {
        const type = FRUITS[Math.floor(Math.random() * FRUITS.length)];
        const newFruit: Fruit = {
            id: idRef.current++,
            x: 100 + Math.random() * 400,
            y: 400,
            vx: (Math.random() - 0.5) * 4,
            vy: -10 - Math.random() * 5,
            type,
            isSliced: false
        };
        fruitsRef.current.push(newFruit);
        setFruits([...fruitsRef.current]);
    }, []);

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Create slash visual
        const dx = x - lastMouseRef.current.x;
        const dy = y - lastMouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 10) {
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            const slashId = Date.now();
            setSlashes(prev => [...prev, { x: lastMouseRef.current.x, y: lastMouseRef.current.y, angle, width: dist, id: slashId }]);
            setTimeout(() => setSlashes(prev => prev.filter(s => s.id !== slashId)), 150);

            // Collision Check
            fruitsRef.current.forEach(f => {
                if (!f.isSliced) {
                    const fdx = x - f.x;
                    const fdy = y - f.y;
                    const fdist = Math.sqrt(fdx * fdx + fdy * fdy);
                    if (fdist < 40) {
                        f.isSliced = true;
                        if (f.type === '💣') {
                            livesRef.current = 0;
                            setLives(0);
                            onGameOver(scoreRef.current);
                        } else {
                            scoreRef.current += 10;
                            setScore(scoreRef.current);
                        }
                    }
                }
            });
            setFruits([...fruitsRef.current]);
        }
        lastMouseRef.current = { x, y };
    };

    useEffect(() => {
        const spawner = setInterval(spawnFruit, 1200);
        const loop = setInterval(() => {
            fruitsRef.current = fruitsRef.current.map(f => {
                f.x += f.vx;
                f.y += f.vy;
                f.vy += 0.25; // gravity
                return f;
            }).filter(f => {
                if (f.y > 450 && !f.isSliced && f.type !== '💣') {
                    livesRef.current -= 1;
                    setLives(livesRef.current);
                    if (livesRef.current <= 0) onGameOver(scoreRef.current);
                }
                return f.y < 500;
            });
            setFruits([...fruitsRef.current]);
        }, 16);

        return () => {
            clearInterval(spawner);
            clearInterval(loop);
        };
    }, [spawnFruit, onGameOver]);

    return (
        <div
            className={styles.gameContainer}
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onTouchMove={handleMouseMove}
        >
            <div className={styles.ui}>
                <div>SCORE: {score}</div>
                <div>LIVES: {'❤️'.repeat(lives)}</div>
            </div>

            {slashes.map(s => (
                <div
                    key={s.id}
                    className={styles.slash}
                    style={{ left: s.x, top: s.y, width: s.width, transform: `rotate(${s.angle}deg)` }}
                />
            ))}

            {fruits.map(f => (
                <div
                    key={f.id}
                    className={styles.fruit}
                    style={{ left: f.x - 20, top: f.y - 20, opacity: f.isSliced ? 0.3 : 1 }}
                >
                    {f.type}
                </div>
            ))}
        </div>
    );
}

export default function SlicerPage() {
    return (
        <GameContainer slug="fruit-slicer">
            {(props) => <FruitSlicerGame {...props} />}
        </GameContainer>
    );
}
