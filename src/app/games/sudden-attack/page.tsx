'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './shooting.module.css';

interface Target {
    id: number;
    x: number;
    y: number;
    createdAt: number;
}

function SuddenAttackGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [targets, setTargets] = useState<Target[]>([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [hits, setHits] = useState<{ id: number; x: number; y: number }[]>([]);

    const scoreRef = useRef(0);
    const timeLeftRef = useRef(30);
    const targetIdRef = useRef(0);

    const spawnTarget = useCallback(() => {
        const x = Math.random() * 500 + 25;
        const y = Math.random() * 300 + 50;
        const newTarget = { id: targetIdRef.current++, x, y, createdAt: Date.now() };
        setTargets(prev => [...prev, newTarget]);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            timeLeftRef.current -= 0.1;
            setTimeLeft(Math.max(0, Math.ceil(timeLeftRef.current)));
            if (timeLeftRef.current <= 0) {
                clearInterval(timer);
                onGameOver(scoreRef.current);
            }
        }, 100).toString();

        const spawner = setInterval(() => {
            if (timeLeftRef.current > 0) {
                spawnTarget();
            }
        }, 800);

        return () => {
            clearInterval(timer);
            clearInterval(spawner);
        };
    }, [spawnTarget, onGameOver]);

    // Cleanup expired targets
    useEffect(() => {
        const cleaner = setInterval(() => {
            setTargets(prev => prev.filter(t => Date.now() - t.createdAt < 1500));
        }, 500);
        return () => clearInterval(cleaner);
    }, []);

    const handleShoot = (targetId: number, x: number, y: number) => {
        setTargets(prev => prev.filter(t => t.id !== targetId));
        scoreRef.current += 10;
        setScore(scoreRef.current);

        const hitId = Date.now();
        setHits(prev => [...prev, { id: hitId, x, y }]);
        setTimeout(() => setHits(prev => prev.filter(h => h.id !== hitId)), 300);
    };

    return (
        <div className={styles.gameContainer}>
            <div className={styles.timerUI}>TIME: {timeLeft}s</div>
            <div className={styles.scoreUI}>SCORE: {score}</div>

            {targets.map(t => (
                <div
                    key={t.id}
                    className={styles.target}
                    style={{ left: t.x, top: t.y }}
                    onMouseDown={() => handleShoot(t.id, t.x + 25, t.y + 25)}
                />
            ))}

            {hits.map(h => (
                <div
                    key={h.id}
                    className={styles.hitEffect}
                    style={{ left: h.x - 30, top: h.y - 30 }}
                />
            ))}
        </div>
    );
}

export default function AttackPage() {
    return (
        <GameContainer slug="sudden-attack">
            {(props) => <SuddenAttackGame {...props} />}
        </GameContainer>
    );
}
