'use client';

import { useState, useEffect, useCallback } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './tictactoe.module.css';

type CellValue = 'X' | 'O' | null;

function TicTacToeGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [winner, setWinner] = useState<CellValue | 'Draw'>(null);

    const calculateWinner = (squares: CellValue[]) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        if (squares.every(s => s !== null)) return 'Draw';
        return null;
    };

    const handleClick = (i: number) => {
        if (winner || board[i]) return;

        const nextBoard = [...board];
        nextBoard[i] = 'X';
        setBoard(nextBoard);
        setIsXNext(false);

        const res = calculateWinner(nextBoard);
        if (res) {
            setWinner(res);
            onGameOver(res === 'X' ? 100 : res === 'Draw' ? 20 : 0);
        }
    };

    // Computer Move (very simple random)
    useEffect(() => {
        if (!isXNext && !winner) {
            const emptyIndices = board.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
            if (emptyIndices.length > 0) {
                const timer = setTimeout(() => {
                    const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
                    const nextBoard = [...board];
                    nextBoard[randomIndex] = 'O';
                    setBoard(nextBoard);
                    setIsXNext(true);

                    const res = calculateWinner(nextBoard);
                    if (res) {
                        setWinner(res);
                        onGameOver(res === 'X' ? 100 : res === 'Draw' ? 20 : 0);
                    }
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [isXNext, winner, board, onGameOver]);

    return (
        <div className={styles.gameContainer}>
            <div className={styles.status}>
                {winner ? (
                    winner === 'Draw' ? '무승부!' : <span className={styles.winner}>{winner} 승리!</span>
                ) : (
                    `다음 차례: ${isXNext ? '내 차례 (X)' : '컴퓨터 (O)'}`
                )}
            </div>
            <div className={styles.board}>
                {board.map((cell, i) => (
                    <div
                        key={i}
                        className={`${styles.cell} ${cell === 'X' ? styles.cellX : cell === 'O' ? styles.cellO : ''}`}
                        onClick={() => handleClick(i)}
                    >
                        {cell}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function TicTacToePage() {
    return (
        <GameContainer slug="tic-tac-toe">
            {(props) => <TicTacToeGame {...props} />}
        </GameContainer>
    );
}
