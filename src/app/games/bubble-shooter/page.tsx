'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './bubbles.module.css';

const BUBBLE_SIZE = 30;
const ROWS = 8;
const COLS = 13;
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple'];

interface Bubble {
    r: number;
    c: number;
    color: string;
}

function BubbleShooterGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [grid, setGrid] = useState<(string | null)[][]>([]);
    const [angle, setAngle] = useState(0);
    const [nextColor, setNextColor] = useState(COLORS[0]);
    const [fired, setFired] = useState<{ x: number, y: number, vx: number, vy: number, color: string } | null>(null);
    const [score, setScore] = useState(0);

    const scoreRef = useRef(0);

    const initGrid = useCallback(() => {
        const newGrid = Array(ROWS).fill(null).map((_, r) =>
            Array(COLS).fill(null).map(() => r < 4 ? COLORS[Math.floor(Math.random() * COLORS.length)] : null)
        );
        setGrid(newGrid);
        setNextColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    }, []);

    useEffect(() => {
        initGrid();
    }, [initGrid]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height;

        const rad = Math.atan2(mouseX - centerX, centerY - mouseY);
        setAngle(rad * (180 / Math.PI));
    };

    const fireBubble = () => {
        if (fired) return;
        const rad = angle * (Math.PI / 180);
        setFired({
            x: 200 - 15,
            y: 470,
            vx: Math.sin(rad) * 8,
            vy: -Math.cos(rad) * 8,
            color: nextColor
        });
        setNextColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    };

    useEffect(() => {
        if (!fired) return;

        const loop = () => {
            setFired(prev => {
                if (!prev) return null;
                let nx = prev.x + prev.vx;
                let ny = prev.y + prev.vy;

                // Wall bounce
                if (nx <= 0 || nx >= 400 - 30) {
                    prev.vx *= -1;
                    nx = nx <= 0 ? 0 : 400 - 30;
                }

                // Check collision with top or bubbles
                const r = Math.floor(ny / BUBBLE_SIZE);
                const c = Math.floor(nx / BUBBLE_SIZE);

                if (ny <= 0 || (r >= 0 && r < ROWS && c >= 0 && c < COLS && grid[r][c])) {
                    // Snap to grid
                    const snapR = Math.max(0, Math.min(ROWS - 1, r + (ny % BUBBLE_SIZE > 15 ? 1 : 0)));
                    const snapC = Math.max(0, Math.min(COLS - 1, c));

                    const newGrid = grid.map(row => [...row]);
                    newGrid[snapR][snapC] = prev.color;

                    // Pop logic (simplified BFS)
                    const popped = popBubbles(newGrid, snapR, snapC, prev.color);
                    if (popped >= 3) {
                        scoreRef.current += popped * 10;
                        setScore(scoreRef.current);
                        setGrid(newGrid);
                    } else {
                        // Just stick
                        setGrid(newGrid);
                    }

                    if (snapR >= ROWS - 1) onGameOver(scoreRef.current);
                    return null;
                }

                return { ...prev, x: nx, y: ny };
            });
        };

        const interval = setInterval(loop, 16);
        return () => clearInterval(interval);
    }, [fired, grid, onGameOver]);

    const popBubbles = (g: (string | null)[][], r: number, c: number, color: string) => {
        const queue = [[r, c]];
        const seen = new Set([`${r},${c}`]);
        const matched = [[r, c]];

        while (queue.length > 0) {
            const [currR, currC] = queue.shift()!;
            const neighbors = [[currR - 1, currC], [currR + 1, currC], [currR, currC - 1], [currR, currC + 1]];
            for (const [nr, nc] of neighbors) {
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && g[nr][nc] === color && !seen.has(`${nr},${nc}`)) {
                    seen.add(`${nr},${nc}`);
                    queue.push([nr, nc]);
                    matched.push([nr, nc]);
                }
            }
        }

        if (matched.length >= 3) {
            matched.forEach(([mr, mc]) => g[mr][mc] = null);
        }
        return matched.length;
    };

    return (
        <div className={styles.gameContainer} onMouseMove={handleMouseMove} onClick={fireBubble}>
            <div className={styles.scoreUI}>SCORE: {score}</div>
            {grid.map((row, r) => row.map((color, c) => (
                color && <div key={`${r}-${c}`} className={`${styles.bubble} ${styles[color]}`} style={{ top: r * BUBBLE_SIZE, left: c * BUBBLE_SIZE }} />
            )))}
            {fired && <div className={`${styles.bubble} ${styles[fired.color]}`} style={{ top: fired.y, left: fired.x }} />}
            <div className={styles.launcher} style={{ transform: `translateX(-50%) rotate(${angle}deg)` }} />
            <div className={`${styles.bubble} ${styles[nextColor]} ${styles.readyBubble}`} />
        </div>
    );
}

export default function BubblePage() {
    return (
        <GameContainer slug="bubble-shooter">
            {(props) => <BubbleShooterGame {...props} />}
        </GameContainer>
    );
}
