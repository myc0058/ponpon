'use client';

import { useState, useEffect, useCallback } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './board.module.css';

const COLS = 7;
const ROWS = 6;

function ConnectFourGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [board, setBoard] = useState<(string | null)[][]>(
        Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
    );
    const [turn, setTurn] = useState<'RED' | 'YELLOW'>('RED');
    const [winner, setWinner] = useState<string | null>(null);

    const checkWinner = (grid: (string | null)[][]) => {
        // Horizontal
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS - 3; c++) {
                if (grid[r][c] && grid[r][c] === grid[r][c + 1] && grid[r][c] === grid[r][c + 2] && grid[r][c] === grid[r][c + 3]) return grid[r][c];
            }
        }
        // Vertical
        for (let r = 0; r < ROWS - 3; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c] && grid[r][c] === grid[r + 1][c] && grid[r][c] === grid[r + 2][c] && grid[r][c] === grid[r + 3][c]) return grid[r][c];
            }
        }
        // Diagonal /
        for (let r = 3; r < ROWS; r++) {
            for (let c = 0; c < COLS - 3; c++) {
                if (grid[r][c] && grid[r][c] === grid[r - 1][c + 1] && grid[r][c] === grid[r - 2][c + 2] && grid[r][c] === grid[r - 3][c + 3]) return grid[r][c];
            }
        }
        // Diagonal \
        for (let r = 0; r < ROWS - 3; r++) {
            for (let c = 0; c < COLS - 3; c++) {
                if (grid[r][c] && grid[r][c] === grid[r + 1][c + 1] && grid[r][c] === grid[r + 2][c + 2] && grid[r][c] === grid[r + 3][c + 3]) return grid[r][c];
            }
        }
        return null;
    };

    const dropChip = useCallback((col: number) => {
        if (winner || turn !== 'RED') return;

        const newBoard = board.map(row => [...row]);
        for (let r = ROWS - 1; r >= 0; r--) {
            if (!newBoard[r][col]) {
                newBoard[r][col] = 'RED';
                setBoard(newBoard);
                const win = checkWinner(newBoard);
                if (win) {
                    setWinner(win);
                    setTimeout(() => onGameOver(100), 2000);
                } else if (newBoard.flat().every(cell => cell)) {
                    setWinner('DRAW');
                    setTimeout(() => onGameOver(50), 2000);
                } else {
                    setTurn('YELLOW');
                }
                return;
            }
        }
    }, [board, turn, winner, onGameOver]);

    // AI Turn (Yellow)
    useEffect(() => {
        if (turn === 'YELLOW' && !winner) {
            setTimeout(() => {
                const availableCols = [];
                for (let c = 0; c < COLS; c++) {
                    if (!board[0][c]) availableCols.push(c);
                }
                if (availableCols.length === 0) return;

                const col = availableCols[Math.floor(Math.random() * availableCols.length)];
                const newBoard = board.map(row => [...row]);
                for (let r = ROWS - 1; r >= 0; r--) {
                    if (!newBoard[r][col]) {
                        newBoard[r][col] = 'YELLOW';
                        setBoard(newBoard);
                        const win = checkWinner(newBoard);
                        if (win) {
                            setWinner(win);
                            setTimeout(() => onGameOver(0), 2000);
                        } else {
                            setTurn('RED');
                        }
                        return;
                    }
                }
            }, 1000);
        }
    }, [turn, winner, board, onGameOver]);

    return (
        <div style={{ padding: '20px' }}>
            <div className={styles.status}>
                {winner === 'RED' && <span style={{ color: '#ef4444' }}>YOU WIN! 🎉</span>}
                {winner === 'YELLOW' && <span style={{ color: '#eab308' }}>CPU WINS! 🤖</span>}
                {winner === 'DRAW' && <span>DRAW! 🤝</span>}
                {!winner && (turn === 'RED' ? "Your Turn (RED)" : "CPU Thinking...")}
            </div>

            <div className={styles.gameContainer}>
                {board.map((row, r) =>
                    row.map((cell, c) => (
                        <div key={`${r}-${c}`} className={styles.cell} onClick={() => dropChip(c)}>
                            {cell && <div className={`${styles.chip} ${cell === 'RED' ? styles.red : styles.yellow}`} />}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default function ConnectPage() {
    return (
        <GameContainer slug="connect-four">
            {(props) => <ConnectFourGame {...props} />}
        </GameContainer>
    );
}
