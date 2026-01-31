'use client';

import { useState, useEffect, useCallback } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './mines.module.css';

const GRID_SIZE = 10;
const MINE_COUNT = 15;

interface Cell {
    isMine: boolean;
    isRevealed: boolean;
    isFlagged: boolean;
    neighborCount: number;
}

function MinesweeperGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [board, setBoard] = useState<Cell[]>([]);
    const [isGameOver, setIsGameOver] = useState(false);
    const [mineCount, setMineCount] = useState(MINE_COUNT);

    const initBoard = useCallback(() => {
        let newBoard: Cell[] = Array(GRID_SIZE * GRID_SIZE).fill(null).map(() => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            neighborCount: 0,
        }));

        // Place mines
        let placedMines = 0;
        while (placedMines < MINE_COUNT) {
            const index = Math.floor(Math.random() * newBoard.length);
            if (!newBoard[index].isMine) {
                newBoard[index].isMine = true;
                placedMines++;
            }
        }

        // Calculate neighbors
        for (let i = 0; i < newBoard.length; i++) {
            if (newBoard[i].isMine) continue;
            let count = 0;
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);

            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
                        if (newBoard[ny * GRID_SIZE + nx].isMine) count++;
                    }
                }
            }
            newBoard[i].neighborCount = count;
        }

        setBoard(newBoard);
        setIsGameOver(false);
        setMineCount(MINE_COUNT);
    }, []);

    useEffect(() => {
        initBoard();
    }, [initBoard]);

    const revealCell = (index: number) => {
        if (isGameOver || board[index].isRevealed || board[index].isFlagged) return;

        const newBoard = [...board];
        if (newBoard[index].isMine) {
            // Game Over
            newBoard[index].isRevealed = true;
            setBoard(newBoard);
            setIsGameOver(true);
            onGameOver(0); // Lost
            return;
        }

        // Flood fill for empty cells
        const reveal = (idx: number) => {
            if (newBoard[idx].isRevealed || newBoard[idx].isFlagged) return;
            newBoard[idx].isRevealed = true;
            if (newBoard[idx].neighborCount === 0) {
                const x = idx % GRID_SIZE;
                const y = Math.floor(idx / GRID_SIZE);
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
                            reveal(ny * GRID_SIZE + nx);
                        }
                    }
                }
            }
        };

        reveal(index);
        setBoard(newBoard);

        // Check Win
        const win = newBoard.every(c => c.isMine ? !c.isRevealed : c.isRevealed);
        if (win) {
            setIsGameOver(true);
            onGameOver(200); // Won
        }
    };

    const toggleFlag = (e: React.MouseEvent, index: number) => {
        e.preventDefault();
        if (isGameOver || board[index].isRevealed) return;
        const newBoard = [...board];
        newBoard[index].isFlagged = !newBoard[index].isFlagged;
        setBoard(newBoard);
        setMineCount(prev => newBoard[index].isFlagged ? prev - 1 : prev + 1);
    };

    return (
        <div className={styles.gameContainer}>
            <div className={styles.header}>
                <span>💣 {mineCount.toString().padStart(3, '0')}</span>
            </div>
            <div className={styles.board}>
                {board.map((cell, i) => (
                    <div
                        key={i}
                        className={`${styles.cell} ${cell.isRevealed ? styles.cellRevealed : ''} ${cell.isRevealed && cell.isMine ? styles.cellMine : ''}`}
                        onClick={() => revealCell(i)}
                        onContextMenu={(e) => toggleFlag(e, i)}
                    >
                        {cell.isRevealed ? (cell.isMine ? '💣' : (cell.neighborCount || '')) : (cell.isFlagged ? '🚩' : '')}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function MinesPage() {
    return (
        <GameContainer slug="minesweeper">
            {(props) => <MinesweeperGame {...props} />}
        </GameContainer>
    );
}
