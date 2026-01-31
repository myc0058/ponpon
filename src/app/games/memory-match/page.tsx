'use client';

import { useState, useEffect, useCallback } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './memory.module.css';

const ICONS = ['🍎', '🍌', '🍇', '🍉', '🥝', '🫐', '🍋', '🍐'];

interface Card {
    id: number;
    icon: string;
    isFlipped: boolean;
    isMatched: boolean;
}

function MemoryGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [matchedCount, setMatchedCount] = useState(0);

    const initGame = useCallback(() => {
        const initialCards = [...ICONS, ...ICONS]
            .sort(() => Math.random() - 0.5)
            .map((icon, index) => ({
                id: index,
                icon,
                isFlipped: false,
                isMatched: false,
            }));
        setCards(initialCards);
        setMoves(0);
        setMatchedCount(0);
        setFlippedCards([]);
    }, []);

    useEffect(() => {
        initGame();
    }, [initGame]);

    const handleCardClick = (id: number) => {
        if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;

        const newCards = [...cards];
        newCards[id].isFlipped = true;
        setCards(newCards);

        const newFlipped = [...flippedCards, id];
        setFlippedCards(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            const [firstId, secondId] = newFlipped;

            if (cards[firstId].icon === cards[secondId].icon) {
                setTimeout(() => {
                    const matchedCards = [...cards];
                    matchedCards[firstId].isMatched = true;
                    matchedCards[secondId].isMatched = true;
                    setCards(matchedCards);
                    setFlippedCards([]);
                    setMatchedCount(c => {
                        const next = c + 1;
                        if (next === ICONS.length) {
                            // Calculate score: base score minus move penalty
                            const finalScore = Math.max(10, 100 - (moves * 2));
                            onGameOver(finalScore);
                        }
                        return next;
                    });
                }, 600);
            } else {
                setTimeout(() => {
                    const resetCards = [...cards];
                    resetCards[firstId].isFlipped = false;
                    resetCards[secondId].isFlipped = false;
                    setCards(resetCards);
                    setFlippedCards([]);
                }, 1000);
            }
        }
    };

    return (
        <div className={styles.gameContainer}>
            <div className={styles.scoreUI}>
                <span>이동 횟수: {moves}</span>
                <span>맞춘 개수: {matchedCount}/{ICONS.length}</span>
            </div>
            <div className={styles.grid}>
                {cards.map(card => (
                    <div
                        key={card.id}
                        className={`${styles.card} ${card.isFlipped ? styles.cardFlipped : ''} ${card.isMatched ? styles.cardMatched : ''}`}
                        onClick={() => handleCardClick(card.id)}
                    >
                        <div className={styles.cardBack}>?</div>
                        <div className={styles.cardFront}>{card.icon}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function MemoryPage() {
    return (
        <GameContainer slug="memory-match">
            {(props) => <MemoryGame {...props} />}
        </GameContainer>
    );
}
