'use client';

import { useState, useEffect, useCallback } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './maze.module.css';

const SIZE = 15; // 15x15 grid

function MazeEscapeGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [grid, setGrid] = useState<number[][]>([]); // 1: Wall, 0: Path
    const [player, setPlayer] = useState({ x: 1, y: 1 });
    const [exit, setExit] = useState({ x: SIZE - 2, y: SIZE - 2 });
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(45);

    const generateMaze = useCallback(() => {
        const newGrid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(1));

        // Simple Recursive Backtracking / Randomized DFS
        const walk = (x: number, y: number) => {
            newGrid[y][x] = 0;
            const dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]].sort(() => Math.random() - 0.5);

            for (const [dx, dy] of dirs) {
                const nx = x + dx, ny = y + dy;
                if (nx > 0 && nx < SIZE - 1 && ny > 0 && ny < SIZE - 1 && newGrid[ny][nx] === 1) {
                    newGrid[y + dy / 2][x + dx / 2] = 0;
                    walk(nx, ny);
                }
            }
        };

        walk(1, 1);
        newGrid[SIZE - 2][SIZE - 2] = 0; // Ensure exit path
        setGrid(newGrid);
        setPlayer({ x: 1, y: 1 });
        setExit({ x: SIZE - 2, y: SIZE - 2 });
    }, []);

    useEffect(() => {
        generateMaze();
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onGameOver(score);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [generateMaze, onGameOver, score]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (timeLeft <= 0) return;

        let nx = player.x;
        let ny = player.y;

        if (e.key === 'ArrowUp') ny--;
        if (e.key === 'ArrowDown') ny++;
        if (e.key === 'ArrowLeft') nx--;
        if (e.key === 'ArrowRight') nx++;

        if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE && grid[ny][nx] === 0) {
            setPlayer({ x: nx, y: ny });
            if (nx === exit.x && ny === exit.y) {
                setScore(s => s + 50);
                setTimeout(generateMaze, 300); // Generate new level
            }
        }
    }, [player, grid, exit, timeLeft, generateMaze]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <div className={styles.gameContainer}>
            <div className={styles.ui}>
                <div>SCORE: {score}</div>
                <div>TIME: {timeLeft}s</div>
            </div>

            <div className={styles.mazeGrid} style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
                {grid.map((row, y) => row.map((cell, x) => {
                    let className = styles.cell;
                    if (cell === 1) className += ` ${styles.wall}`;
                    else className += ` ${styles.path}`;

                    if (x === player.x && y === player.y) className += ` ${styles.player}`;
                    else if (x === exit.x && y === exit.y) className += ` ${styles.exit}`;

                    return <div key={`${x}-${y}`} className={className} />;
                }))}
            </div>

            <div className={styles.controls}>방향키로 미로를 탈출하세요!</div>
        </div>
    );
}

export default function MazePage() {
    return (
        <GameContainer slug="maze-escape">
            {(props) => <MazeEscapeGame {...props} />}
        </GameContainer>
    );
}
