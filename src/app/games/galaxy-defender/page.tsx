'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './shmup.module.css';

interface Entity {
    id: number;
    x: number;
    y: number;
}

function GalaxyDefenderGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [playerPos, setPlayerPos] = useState({ x: 185, y: 450 });
    const [bullets, setBullets] = useState<Entity[]>([]);
    const [enemies, setEnemies] = useState<Entity[]>([]);
    const [score, setScore] = useState(0);

    const playerRef = useRef({ x: 185, y: 450 });
    const bulletsRef = useRef<Entity[]>([]);
    const enemiesRef = useRef<Entity[]>([]);
    const scoreRef = useRef(0);
    const idRef = useRef(0);

    const handleMouseMove = (e: MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - 15;
        playerRef.current.x = Math.max(0, Math.min(370, x));
        setPlayerPos({ ...playerRef.current });
    };

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('mousemove', handleMouseMove);
        }
        return () => container?.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        const loop = () => {
            // Update bullets
            bulletsRef.current = bulletsRef.current
                .map(b => ({ ...b, y: b.y - 7 }))
                .filter(b => b.y > -20);

            // Update enemies
            enemiesRef.current = enemiesRef.current
                .map(e => ({ ...e, y: e.y + 2 }))
                .filter(e => e.y < 520);

            // Spawn enemies
            if (Math.random() < 0.05) {
                enemiesRef.current.push({
                    id: idRef.current++,
                    x: Math.random() * 370,
                    y: -30
                });
            }

            // Auto fire bullets
            if (Date.now() % 300 < 20) {
                bulletsRef.current.push({
                    id: idRef.current++,
                    x: playerRef.current.x + 13,
                    y: playerRef.current.y
                });
            }

            // Collision Detection
            for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
                const e = enemiesRef.current[i];

                // Player collision
                const dx = e.x - playerRef.current.x;
                const dy = e.y - playerRef.current.y;
                if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
                    onGameOver(scoreRef.current);
                    return;
                }

                // Bullet collision
                for (let j = bulletsRef.current.length - 1; j >= 0; j--) {
                    const b = bulletsRef.current[j];
                    if (Math.abs(e.x - b.x) < 20 && Math.abs(e.y - b.y) < 20) {
                        enemiesRef.current.splice(i, 1);
                        bulletsRef.current.splice(j, 1);
                        scoreRef.current += 10;
                        setScore(scoreRef.current);
                        break;
                    }
                }
            }

            setBullets([...bulletsRef.current]);
            setEnemies([...enemiesRef.current]);
            requestAnimationFrame(loop);
        };

        const id = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(id);
    }, [onGameOver]);

    return (
        <div className={styles.gameContainer} ref={containerRef}>
            <div className={styles.ui}>
                <div>SCORE: {score}</div>
                <div>LIFE: 1</div>
            </div>

            <div className={styles.player} style={{ left: playerPos.x, top: playerPos.y }} />

            {bullets.map(b => (
                <div key={b.id} className={styles.bullet} style={{ left: b.x, top: b.y }} />
            ))}

            {enemies.map(e => (
                <div key={e.id} className={styles.enemy} style={{ left: e.x, top: e.y }} />
            ))}
        </div>
    );
}

export default function GalaxyPage() {
    return (
        <GameContainer slug="galaxy-defender">
            {(props) => <GalaxyDefenderGame {...props} />}
        </GameContainer>
    );
}
