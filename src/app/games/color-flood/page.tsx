'use client';

import { useState, useEffect, useCallback } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './flood.module.css';

const SIZE = 12;
const MAX_TURNS = 25;
const COLORS = [0, 1, 2, 3, 4, 5];

function ColorFloodGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [grid, setGrid] = useState<number[][]>([]);
    const [turns, setTurns] = useState(0);
    const [status, setStatus] = useState<'PLAYING' | 'WON' | 'LOST'>('PLAYING');

    const initGrid = useCallback(() => {
        const newGrid = Array(SIZE).fill(null).map(() =>
            Array(SIZE).fill(null).map(() => COLORS[Math.floor(Math.random() * COLORS.length)])
        );
        setGrid(newGrid);
        setTurns(0);
        setStatus('PLAYING');
    }, []);

    useEffect(() => {
        initGrid();
    }, [initGrid]);

    const handleColorClick = (targetColor: number) => {
        if (status !== 'PLAYING' || grid[0][0] === targetColor) return;

        const newGrid = grid.map(row => [...row]);
        const startColor = newGrid[0][0];

        // Flood Fill Algorithm
        const fill = (r: number, c: number) => {
            if (r < 0 || r >= SIZE || c < 0 || c >= SIZE || newGrid[r][c] !== startColor) return;
            newGrid[r][c] = targetColor;
            fill(r + 1, c);
            fill(r - 1, c);
            fill(r, c + 1);
            fill(r, c - 1);
        };

        fill(0, 0);
        setGrid(newGrid);
        const newTurns = turns + 1;
        setTurns(newTurns);

        // Win check
        const isAllSame = newGrid.every(row => row.every(cell => cell === targetColor));
        if (isAllSame) {
            setStatus('WON');
            setTimeout(() => onGameOver(Math.max(0, (MAX_TURNS - newTurns) * 20 + 100)), 1500);
        } else if (newTurns >= MAX_TURNS) {
            setStatus('LOST');
            setTimeout(() => onGameOver(10), 1000);
        }
    };

    return (
        <div className={styles.gameContainer}>
            <div className={styles.ui}>
                <div>TURNS: {turns} / {MAX_TURNS}</div>
                <div style={{ color: status === 'WON' ? '#10b981' : status === 'LOST' ? '#ef4444' : 'white' }}>
                    {status === 'WON' ? 'SUCCESS!' : status === 'LOST' ? 'FAILED!' : 'FLOOD IT!'}
                </div>
            </div>

            <div className={styles.grid}>
                {grid.map((row, r) => row.map((cell, c) => (
                    <div key={`${r}-${c}`} className={`${styles.cell} ${styles['c' + cell]}`} />
                )))}
            </div>

            <div className={styles.controls}>
                {COLORS.map(c => (
                    <button
                        key={c}
                        className={`${styles.colorBtn} ${styles['c' + c]}`}
                        onClick={() => handleColorClick(c)}
                    />
                ))}
            </div>

            <div style={{ marginTop: '15px', color: '#94a3b8', fontSize: '13px' }}>
                좌측 상단(0,0)부터 색을 물들여 전체를 채우세요!
            </div>
        </div>
    );
}

export default function FloodPage() {
    return (
        <GameContainer slug="color-flood">
            {(props) => <ColorFloodGame {...props} />}
        </GameContainer>
    );
}
