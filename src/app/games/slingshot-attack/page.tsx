'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './slingshot.module.css';

const GRAVITY = 0.25;
const GROUND_Y = 360;

interface Projectile {
    x: number;
    y: number;
    vx: number;
    vy: number;
    active: boolean;
}

interface Target {
    id: number;
    x: number;
    y: number;
    destroyed: boolean;
}

function SlingshotGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);
    const [dragEnd, setDragEnd] = useState<{ x: number, y: number } | null>(null);
    const [projectile, setProjectile] = useState<Projectile | null>(null);
    const [targets, setTargets] = useState<Target[]>([]);
    const [score, setScore] = useState(0);
    const [shots, setShots] = useState(5);

    const scoreRef = useRef(0);
    const projectileRef = useRef<Projectile | null>(null);
    const targetsRef = useRef<Target[]>([]);

    const initRound = useCallback(() => {
        const newTargets: Target[] = [];
        for (let i = 0; i < 5; i++) {
            newTargets.push({
                id: i,
                x: 400 + Math.random() * 150,
                y: GROUND_Y - 30 - (i * 35 % 100),
                destroyed: false
            });
        }
        setTargets(newTargets);
        targetsRef.current = newTargets;
    }, []);

    useEffect(() => {
        initRound();
    }, [initRound]);

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (projectile || shots <= 0) return;
        const rect = containerRef.current!.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        // Center of slingshot position roughly
        const startX = 90;
        const startY = 320;
        setDragStart({ x: startX, y: startY });
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!dragStart) return;
        const rect = containerRef.current!.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        setDragEnd({ x, y });
    };

    const handleMouseUp = () => {
        if (!dragStart || !dragEnd) return;

        const vx = (dragStart.x - dragEnd.x) * 0.15;
        const vy = (dragStart.y - dragEnd.y) * 0.15;

        const newProj = { x: dragStart.x, y: dragStart.y, vx, vy, active: true };
        setProjectile(newProj);
        projectileRef.current = newProj;
        setShots(s => s - 1);
        setDragStart(null);
        setDragEnd(null);
    };

    useEffect(() => {
        if (!projectile) return;

        const loop = () => {
            if (!projectileRef.current) return;
            const p = projectileRef.current;
            p.vy += GRAVITY;
            p.x += p.vx;
            p.y += p.vy;

            // Target collision
            targetsRef.current.forEach(t => {
                if (!t.destroyed) {
                    const dx = p.x - t.x;
                    const dy = p.y - t.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 25) {
                        t.destroyed = true;
                        scoreRef.current += 20;
                        setScore(scoreRef.current);
                        setTargets([...targetsRef.current]);
                    }
                }
            });

            // Ground or Out of bounds
            if (p.y >= GROUND_Y || p.x > 600 || p.x < 0) {
                setProjectile(null);
                projectileRef.current = null;
                if (shots <= 0 && !targetsRef.current.some(t => !t.destroyed)) {
                    onGameOver(scoreRef.current + 50); // Clear bonus
                } else if (shots <= 0) {
                    onGameOver(scoreRef.current);
                }
                return;
            }

            setProjectile({ ...p });
            requestAnimationFrame(loop);
        };

        const id = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(id);
    }, [projectile, shots, onGameOver]);

    return (
        <div
            className={styles.gameContainer}
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
        >
            <div className={styles.ui}>
                <div>SCORE: {score}</div>
                <div>SHOTS: {shots}</div>
            </div>

            <div className={styles.ground} />
            <div className={styles.slingshot} />

            {dragStart && dragEnd && (
                <div
                    className={styles.dragLine}
                    style={{
                        left: dragEnd.x,
                        top: dragEnd.y,
                        width: Math.sqrt(Math.pow(dragStart.x - dragEnd.x, 2) + Math.pow(dragStart.y - dragEnd.y, 2)),
                        transform: `rotate(${Math.atan2(dragStart.y - dragEnd.y, dragStart.x - dragEnd.x)}rad)`
                    }}
                />
            )}

            {projectile && (
                <div className={styles.projectile} style={{ left: projectile.x, top: projectile.y }} />
            )}

            {targets.map(t => !t.destroyed && (
                <div key={t.id} className={styles.target} style={{ left: t.x, top: t.y }} />
            ))}
        </div>
    );
}

export default function SlingshotPage() {
    return (
        <GameContainer slug="slingshot-attack">
            {(props) => <SlingshotGame {...props} />}
        </GameContainer>
    );
}
