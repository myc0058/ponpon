'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './color.module.css';

const COLORS = [
    { name: '빨강', value: '#ef4444' },
    { name: '파랑', value: '#3b82f6' },
    { name: '초록', value: '#10b981' },
    { name: '노랑', value: '#eab308' },
    { name: '보라', value: '#8b5cf6' },
    { name: '검정', value: '#000000' }
];

function ColorMatchGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [currentWord, setCurrentWord] = useState(COLORS[0]);
    const [currentColor, setCurrentColor] = useState(COLORS[1].value);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0); // For progress bar or limit
    const [shake, setShake] = useState(false);

    const isGameOverRef = useRef(false);
    const scoreRef = useRef(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const generateChallenge = useCallback(() => {
        const wordIndex = Math.floor(Math.random() * COLORS.length);
        const colorIndex = Math.random() > 0.5 ? wordIndex : Math.floor(Math.random() * COLORS.length);

        setCurrentWord(COLORS[wordIndex]);
        setCurrentColor(COLORS[colorIndex].value);
    }, []);

    useEffect(() => {
        generateChallenge();
        let totalTime = 20;
        setTimeLeft(totalTime);

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    isGameOverRef.current = true;
                    onGameOver(scoreRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [generateChallenge, onGameOver]);

    const handleChoice = (match: boolean) => {
        if (isGameOverRef.current) return;

        const actualMatch = currentWord.value === currentColor;
        if (match === actualMatch) {
            scoreRef.current += 10;
            setScore(scoreRef.current);
            generateChallenge();
        } else {
            setShake(true);
            setTimeout(() => setShake(false), 400);
            // Penalty or just harder? Let's subtract time
            setTimeLeft(prev => Math.max(0, prev - 2));
            generateChallenge();
        }
    };

    return (
        <div className={styles.gameContainer}>
            <div className={styles.header}>
                <span>점수: {score}</span>
                <span>남은 시간: {timeLeft}s</span>
            </div>

            <div className={`${styles.wordDisplay} ${shake ? styles.shake : ''}`} style={{ color: currentColor }}>
                {currentWord.name}
            </div>

            <div className={styles.buttonGroup}>
                <button className={`${styles.choiceButton} ${styles.matchBtn}`} onClick={() => handleChoice(true)}>일치!</button>
                <button className={`${styles.choiceButton} ${styles.mismatchBtn}`} onClick={() => handleChoice(false)}>불일치!</button>
            </div>
        </div>
    );
}

export default function ColorPage() {
    return (
        <GameContainer slug="color-match">
            {(props) => <ColorMatchGame {...props} />}
        </GameContainer>
    );
}
