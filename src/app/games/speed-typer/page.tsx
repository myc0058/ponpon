'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './typer.module.css';

const WORDS = [
    '애플', '바나나', '포도', '수박', '오렌지', '딸기', '초콜릿', '컴퓨터', '리액트', '넥스트',
    '자바스크립트', '프리즈마', '데이터베이스', '프로그래밍', '알고리즘', '인공지능', '메타버스',
    '블록체인', '클라우드', '네트워크', '보안', '웹사이트', '모바일', '애플리케이션', '디자인'
];

interface ActiveWord {
    id: number;
    text: string;
    x: number;
    y: number;
    speed: number;
}

function SpeedTyperGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [activeWords, setActiveWords] = useState<ActiveWord[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [isMissed, setIsMissed] = useState(false);

    const activeWordsRef = useRef<ActiveWord[]>([]);
    const scoreRef = useRef(0);
    const livesRef = useRef(3);
    const lastSpawnRef = useRef(0);
    const wordIdRef = useRef(0);

    const spawnWord = useCallback(() => {
        const text = WORDS[Math.floor(Math.random() * WORDS.length)];
        const x = Math.random() * 350 + 50; // Ensure it stays within bounds
        const speed = 0.5 + Math.min(scoreRef.current / 200, 1.5);

        const newWord: ActiveWord = {
            id: wordIdRef.current++,
            text,
            x,
            y: -20,
            speed
        };
        activeWordsRef.current.push(newWord);
        setActiveWords([...activeWordsRef.current]);
    }, []);

    useEffect(() => {
        const gameLoop = (time: number) => {
            if (livesRef.current <= 0) return;

            // Spawn words
            if (time - lastSpawnRef.current > Math.max(1000, 2500 - (scoreRef.current * 10))) {
                spawnWord();
                lastSpawnRef.current = time;
            }

            // Move words
            let lostLife = false;
            activeWordsRef.current = activeWordsRef.current.filter(word => {
                word.y += word.speed;
                if (word.y > 540) { // Reached bottom
                    lostLife = true;
                    return false;
                }
                return true;
            });

            if (lostLife) {
                livesRef.current -= 1;
                setLives(livesRef.current);
                setIsMissed(true);
                setTimeout(() => setIsMissed(false), 300);
                if (livesRef.current <= 0) {
                    onGameOver(scoreRef.current);
                    return;
                }
            }

            setActiveWords([...activeWordsRef.current]);
            requestAnimationFrame(gameLoop);
        };

        const id = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(id);
    }, [spawnWord, onGameOver]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const matchedIndex = activeWordsRef.current.findIndex(w => w.text === value);

        if (matchedIndex !== -1) {
            activeWordsRef.current.splice(matchedIndex, 1);
            setActiveWords([...activeWordsRef.current]);
            scoreRef.current += 10;
            setScore(scoreRef.current);
            setInputValue('');
        } else {
            setInputValue(value);
        }
    };

    return (
        <div className={`${styles.gameContainer} ${isMissed ? styles.missed : ''}`}>
            <div className={styles.lifeUI}>{'❤️'.repeat(lives)}</div>
            <div className={styles.scoreUI}>SCORE: {score}</div>

            {activeWords.map(word => (
                <div
                    key={word.id}
                    className={styles.word}
                    style={{ left: word.x, top: word.y }}
                >
                    {word.text}
                </div>
            ))}

            <div className={styles.inputArea}>
                <input
                    className={styles.input}
                    value={inputValue}
                    onChange={handleInput}
                    placeholder="여기에 입력하세요"
                    autoFocus
                />
            </div>
        </div>
    );
}

export default function TyperPage() {
    return (
        <GameContainer slug="speed-typer">
            {(props) => <SpeedTyperGame {...props} />}
        </GameContainer>
    );
}
