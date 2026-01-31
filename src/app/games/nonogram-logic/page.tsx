'use client';

import { useState, useEffect, useCallback } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './nono.module.css';

const SIZE = 10;
const SOLUTION = [
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
    [1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
    [0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
].map(row => row.map(cell => cell === 1));

function NonogramGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [grid, setGrid] = useState<('EMPTY' | 'FILLED' | 'MARKED')[][]>(
        Array(SIZE).fill(null).map(() => Array(SIZE).fill('EMPTY'))
    );
    const [rowHints, setRowHints] = useState<number[][]>([]);
    const [colHints, setColHints] = useState<number[][]>([]);
    const [timeLeft, setTimeLeft] = useState(300);

    const generateHints = useCallback(() => {
        const rows = SOLUTION.map(row => {
            const hints: number[] = [];
            let count = 0;
            row.forEach(cell => {
                if (cell) count++;
                else if (count > 0) { hints.push(count); count = 0; }
            });
            if (count > 0) hints.push(count);
            return hints.length ? hints : [0];
        });

        const cols = [];
        for (let c = 0; c < SIZE; c++) {
            const hints: number[] = [];
            let count = 0;
            for (let r = 0; r < SIZE; r++) {
                if (SOLUTION[r][c]) count++;
                else if (count > 0) { hints.push(count); count = 0; }
            }
            if (count > 0) hints.push(count);
            cols.push(hints.length ? hints : [0]);
        }
        setRowHints(rows);
        setColHints(cols);
    }, []);

    useEffect(() => {
        generateHints();
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [generateHints]);

    const handleCellClick = (r: number, c: number, e: React.MouseEvent) => {
        e.preventDefault();
        const newGrid = grid.map(row => [...row]);
        if (e.type === 'contextmenu') {
            newGrid[r][c] = newGrid[r][c] === 'MARKED' ? 'EMPTY' : 'MARKED';
        } else {
            newGrid[r][c] = newGrid[r][c] === 'FILLED' ? 'EMPTY' : 'FILLED';
        }
        setGrid(newGrid);

        // Win check
        const isCorrect = newGrid.every((row, ri) => row.every((cell, ci) => {
            const shouldBeFilled = SOLUTION[ri][ci];
            const isActuallyFilled = cell === 'FILLED';
            return shouldBeFilled === isActuallyFilled;
        }));

        if (isCorrect) {
            onGameOver(Math.max(50, Math.floor(timeLeft / 2)));
        }
    };

    return (
        <div className={styles.gameContainer} onContextMenu={e => e.preventDefault()}>
            <div className={styles.ui}>
                <div>NONOGRAM LOGIC</div>
                <div>TIME: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</div>
            </div>

            <div className={styles.gridContainer}>
                <div />
                <div className={styles.topHints}>
                    {colHints.map((hints, i) => (
                        <div key={i} className={styles.hintItem}>
                            {hints.map((h, hi) => <div key={hi}>{h}</div>)}
                        </div>
                    ))}
                </div>
                <div className={styles.leftHints}>
                    {rowHints.map((hints, i) => (
                        <div key={i}>
                            {hints.join(' ')}
                        </div>
                    ))}
                </div>
                <div className={styles.grid}>
                    {grid.map((row, r) => row.map((cell, c) => (
                        <div
                            key={`${r}-${c}`}
                            className={`${styles.cell} ${cell === 'FILLED' ? styles.filled : ''} ${cell === 'MARKED' ? styles.marked : ''}`}
                            onClick={(e) => handleCellClick(r, c, e)}
                            onContextMenu={(e) => handleCellClick(r, c, e)}
                        />
                    )))}
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 15, fontSize: 12, color: '#64748b' }}>
                클릭: 채우기 / 우클릭: X 표시
            </div>
        </div>
    );
}

export default function NonogramPage() {
    return (
        <GameContainer slug="nonogram-logic">
            {(props) => <NonogramGame {...props} />}
        </GameContainer>
    );
}
