'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './math.module.css';

function MathQuickieGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [equation, setEquation] = useState({ text: '', answer: 0 });
    const [input, setInput] = useState('');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isWrong, setIsWrong] = useState(false);

    const scoreRef = useRef(0);
    const timeLeftRef = useRef(30);

    const generateEquation = useCallback(() => {
        const level = Math.floor(scoreRef.current / 50) + 1;
        const ops = ['+', '-', '*'];
        const op = ops[Math.floor(Math.random() * (level > 2 ? 3 : 2))];

        let a, b, ans;
        if (op === '+') {
            a = Math.floor(Math.random() * (10 * level)) + 1;
            b = Math.floor(Math.random() * (10 * level)) + 1;
            ans = a + b;
        } else if (op === '-') {
            a = Math.floor(Math.random() * (10 * level)) + 5;
            b = Math.floor(Math.random() * a) + 1;
            ans = a - b;
        } else {
            a = Math.floor(Math.random() * 10) + 2;
            b = Math.floor(Math.random() * 5) + 2;
            ans = a * b;
        }

        setEquation({ text: `${a} ${op} ${b} = ?`, answer: ans });
        setInput('');
    }, []);

    useEffect(() => {
        generateEquation();
        const timer = setInterval(() => {
            timeLeftRef.current -= 1;
            setTimeLeft(timeLeftRef.current);
            if (timeLeftRef.current <= 0) {
                clearInterval(timer);
                onGameOver(scoreRef.current);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [generateEquation, onGameOver]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInput(val);

        if (parseInt(val) === equation.answer) {
            scoreRef.current += 10;
            setScore(scoreRef.current);
            timeLeftRef.current += 1; // Bonus time
            setTimeLeft(timeLeftRef.current);
            generateEquation();
        } else if (val.length >= equation.answer.toString().length && parseInt(val) !== equation.answer) {
            // Check only if length is same or more
            setIsWrong(true);
            setTimeout(() => setIsWrong(false), 200);
        }
    };

    return (
        <div className={styles.gameContainer}>
            <div className={styles.score}>SCORE: {score}</div>
            <div className={styles.timer}>TIME: {timeLeft}s</div>

            <div className={styles.equation}>{equation.text}</div>

            <input
                className={`${styles.input} ${isWrong ? styles.wrong : ''}`}
                value={input}
                onChange={handleInput}
                type="number"
                placeholder="?"
                autoFocus
            />

            <div className={styles.feedback}>
                {isWrong && 'WRONG! TRY AGAIN'}
            </div>
        </div>
    );
}

export default function MathPage() {
    return (
        <GameContainer slug="math-quickie">
            {(props) => <MathQuickieGame {...props} />}
        </GameContainer>
    );
}
