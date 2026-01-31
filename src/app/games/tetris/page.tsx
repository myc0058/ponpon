'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './tetris.module.css';

const COLS = 10;
const ROWS = 20;

const TETROMINOS = {
    I: { shape: [[1, 1, 1, 1]], class: 'typeI' },
    J: { shape: [[1, 0, 0], [1, 1, 1]], class: 'typeJ' },
    L: { shape: [[0, 0, 1], [1, 1, 1]], class: 'typeL' },
    O: { shape: [[1, 1], [1, 1]], class: 'typeO' },
    S: { shape: [[0, 1, 1], [1, 1, 0]], class: 'typeS' },
    T: { shape: [[0, 1, 0], [1, 1, 1]], class: 'typeT' },
    Z: { shape: [[1, 1, 0], [0, 1, 1]], class: 'typeZ' },
};

function TetrisGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [grid, setGrid] = useState<string[][]>(Array(ROWS).fill(null).map(() => Array(COLS).fill('')));
    const [activePiece, setActivePiece] = useState<{ x: number, y: number, shape: number[][], type: string } | null>(null);
    const [score, setScore] = useState(0);

    const gridRef = useRef<string[][]>(Array(ROWS).fill(null).map(() => Array(COLS).fill('')));
    const pieceRef = useRef<{ x: number, y: number, shape: number[][], type: string } | null>(null);
    const scoreRef = useRef(0);

    const spawnPiece = useCallback(() => {
        const types = Object.keys(TETROMINOS) as (keyof typeof TETROMINOS)[];
        const type = types[Math.floor(Math.random() * types.length)];
        const piece = TETROMINOS[type];
        const newPiece = {
            x: Math.floor(COLS / 2) - Math.floor(piece.shape[0].length / 2),
            y: 0,
            shape: piece.shape,
            type: piece.class
        };

        if (checkCollision(newPiece.x, newPiece.y, newPiece.shape)) {
            onGameOver(scoreRef.current);
            return null;
        }
        return newPiece;
    }, [onGameOver]);

    const checkCollision = (px: number, py: number, shape: number[][]) => {
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const nx = px + x;
                    const ny = py + y;
                    if (nx < 0 || nx >= COLS || ny >= ROWS || (ny >= 0 && gridRef.current[ny][nx])) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    const rotate = (shape: number[][]) => {
        return shape[0].map((_, i) => shape.map(row => row[i]).reverse());
    };

    const drop = useCallback(() => {
        if (!pieceRef.current) return;
        if (!checkCollision(pieceRef.current.x, pieceRef.current.y + 1, pieceRef.current.shape)) {
            pieceRef.current.y += 1;
            setActivePiece({ ...pieceRef.current });
        } else {
            // Lock piece
            const newGrid = [...gridRef.current.map(row => [...row])];
            pieceRef.current.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        const ny = pieceRef.current!.y + y;
                        const nx = pieceRef.current!.x + x;
                        if (ny >= 0) newGrid[ny][nx] = pieceRef.current!.type;
                    }
                });
            });

            // Clear lines
            let linesCleared = 0;
            for (let y = ROWS - 1; y >= 0; y--) {
                if (newGrid[y].every(cell => cell !== '')) {
                    newGrid.splice(y, 1);
                    newGrid.unshift(Array(COLS).fill(''));
                    linesCleared++;
                    y++; // Re-check same row index
                }
            }

            if (linesCleared > 0) {
                scoreRef.current += [0, 40, 100, 300, 1200][linesCleared];
                setScore(scoreRef.current);
            }

            gridRef.current = newGrid;
            setGrid(newGrid);
            const next = spawnPiece();
            pieceRef.current = next;
            setActivePiece(next);
        }
    }, [spawnPiece]);

    useEffect(() => {
        const firstPiece = spawnPiece();
        pieceRef.current = firstPiece;
        setActivePiece(firstPiece);

        const timer = setInterval(drop, 800);
        return () => clearInterval(timer);
    }, [spawnPiece, drop]);

    useEffect(() => {
        const handleKeys = (e: KeyboardEvent) => {
            if (!pieceRef.current) return;
            if (e.key === 'ArrowLeft' && !checkCollision(pieceRef.current.x - 1, pieceRef.current.y, pieceRef.current.shape)) {
                pieceRef.current.x -= 1;
            } else if (e.key === 'ArrowRight' && !checkCollision(pieceRef.current.x + 1, pieceRef.current.y, pieceRef.current.shape)) {
                pieceRef.current.x += 1;
            } else if (e.key === 'ArrowDown') {
                drop();
            } else if (e.key === 'ArrowUp') {
                const rotated = rotate(pieceRef.current.shape);
                if (!checkCollision(pieceRef.current.x, pieceRef.current.y, rotated)) {
                    pieceRef.current.shape = rotated;
                }
            }
            setActivePiece({ ...pieceRef.current });
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [drop]);

    return (
        <div className={styles.gameContainer}>
            <div className={styles.scoreUI}>SCORE: {score}</div>
            {grid.map((row, y) => row.map((cell, x) => {
                let pieceClass = cell || '';
                if (activePiece) {
                    const py = y - activePiece.y;
                    const px = x - activePiece.x;
                    if (py >= 0 && py < activePiece.shape.length && px >= 0 && px < activePiece.shape[0].length) {
                        if (activePiece.shape[py][px]) pieceClass = activePiece.type;
                    }
                }
                return <div key={`${y}-${x}`} className={`${styles.cell} ${pieceClass ? styles.block + ' ' + styles[pieceClass] : ''}`} />;
            }))}
        </div>
    );
}

export default function TetrisPage() {
    return (
        <GameContainer slug="game-tetris">
            {(props) => <TetrisGame {...props} />}
        </GameContainer>
    );
}
