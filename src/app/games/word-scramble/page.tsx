'use client';

import { useState, useEffect, useCallback } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './scramble.module.css';

const WORDS = [
    'APPLE', 'BANANA', 'CHERRY', 'DURIDURI', 'ORANGE', 'GRAPES', 'MELON',
    'PONPON', 'VONVON', 'REACT', 'NEXTJS', 'PRISMA', 'SNAKE', 'FLAPPY', 'DINO'
];

function WordScrambleGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [currentWord, setCurrentWord] = useState('');
    const [scrambled, setScrambled] = useState('');
    const [input, setInput] = useState('');
    const [score, setScore] = useState(0);
    const [stage, setStage] = useState(1);
    const [status, setStatus] = useState<{ text: string, type: 'correct' | 'wrong' | '' }>({ text: '', type: '' });

    const initWord = useCallback(() => {
        const word = WORDS[Math.floor(Math.random() * WORDS.length)];
        setCurrentWord(word);

        let shuffled = word;
        while (shuffled === word) {
            shuffled = word.split('').sort(() => Math.random() - 0.5).join('');
        }
        setScrambled(shuffled);
        setInput('');
        setStatus({ text: `Stage ${stage}`, type: '' });
    }, [stage]);

    useEffect(() => {
        initWord();
    }, [initWord]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.toUpperCase() === currentWord) {
            const points = 20;
            setScore(s => s + points);
            setStatus({ text: 'CORRECT! +20pts', type: 'correct' });
            setTimeout(() => {
                if (stage >= 10) {
                    onGameOver(score + points);
                } else {
                    setStage(s => s + 1);
                }
            }, 1000);
        } else {
            setStatus({ text: 'WRONG! TRY AGAIN', type: 'wrong' });
            setTimeout(() => setStatus({ text: `Stage ${stage}`, type: '' }), 1000);
        }
    };

    return (
        <div className={styles.gameContainer}>
            <div style={{ marginBottom: 20, color: '#666' }}>SCORE: {score} | STAGE: {stage}/10</div>
            <div className={styles.scrambled}>{scrambled}</div>
            <form onSubmit={handleSubmit}>
                <input
                    className={styles.input}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="올바른 단어를 입력하세요"
                    autoFocus
                />
                <button type="submit" className={styles.button}>제출</button>
            </form>
            <div className={`${styles.status} ${status.type === 'correct' ? styles.correct : status.type === 'wrong' ? styles.wrong : ''}`}>
                {status.text}
            </div>
        </div>
    );
}

export default function ScramblePage() {
    return (
        <GameContainer slug="word-scramble">
            {(props) => <WordScrambleGame {...props} />}
        </GameContainer>
    );
}
