'use client';

import { useState, useEffect, useCallback } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './solitaire.module.css';

const TILE_SET = ['🍎', '🍌', '🍒', '🥑', '🍉', '🍇', '🥝', '🥭', '🍍', '🍓', '🍋', '🍐'];

interface Tile {
    id: number;
    icon: string;
    isMatched: boolean;
}

function SolitaireGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [tiles, setTiles] = useState<Tile[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);

    const initBoard = useCallback(() => {
        const board: Tile[] = [];
        const pairs = [...TILE_SET, ...TILE_SET, ...TILE_SET]; // 3 pairs of each for 6x6-ish? No, let's do 6x4 = 24 tiles.
        const shuffled = pairs.sort(() => Math.random() - 0.5);

        shuffled.forEach((icon, idx) => {
            board.push({ id: idx, icon, isMatched: false });
        });
        setTiles(board);
    }, []);

    useEffect(() => {
        initBoard();
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
    }, [initBoard, onGameOver, score]);

    const handleTileClick = (id: number) => {
        if (selected.includes(id)) {
            setSelected([]);
            return;
        }

        const newSelected = [...selected, id];
        setSelected(newSelected);

        if (newSelected.length === 2) {
            const [firstId, secondId] = newSelected;
            if (tiles[firstId].icon === tiles[secondId].icon) {
                // Match!
                setTiles(prev => prev.map(t =>
                    (t.id === firstId || t.id === secondId) ? { ...t, isMatched: true } : t
                ));
                setScore(s => s + 20);
                setSelected([]);

                // Win check
                if (tiles.filter(t => !t.isMatched).length === 2) {
                    onGameOver(score + 100); // Bonus for completion
                }
            } else {
                // No match
                setTimeout(() => setSelected([]), 300);
            }
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div className={styles.scoreBoard}>
                <div>SCORE: {score}</div>
                <div className={styles.timer}>TIME: {timeLeft}s</div>
            </div>
            <div className={styles.gameContainer}>
                {tiles.map(tile => (
                    <div
                        key={tile.id}
                        className={`${styles.tile} ${tile.isMatched ? styles.hidden : ''} ${selected.includes(tile.id) ? styles.selected : ''}`}
                        onClick={() => handleTileClick(tile.id)}
                    >
                        {tile.icon}
                    </div>
                ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '20px', color: '#64748b' }}>
                같은 모양의 타일을 찾아 제거하세요!
            </div>
        </div>
    );
}

export default function SolitairePage() {
    return (
        <GameContainer slug="card-solitaire">
            {(props) => <SolitaireGame {...props} />}
        </GameContainer>
    );
}
