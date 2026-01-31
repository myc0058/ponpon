'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './simon.module.css';

const COLORS = ['green', 'red', 'yellow', 'blue'];

function SimonSaysGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [sequence, setSequence] = useState<string[]>([]);
    const [userSequence, setUserSequence] = useState<string[]>([]);
    const [activeColor, setActiveColor] = useState<string | null>(null);
    const [isDisplaying, setIsDisplaying] = useState(false);
    const [round, setRound] = useState(0);

    const sequenceRef = useRef<string[]>([]);
    const userIndexRef = useRef(0);

    const playSequence = useCallback(async (seq: string[]) => {
        setIsDisplaying(true);
        for (const color of seq) {
            await new Promise(r => setTimeout(r, 400));
            setActiveColor(color);
            await new Promise(r => setTimeout(r, 600));
            setActiveColor(null);
        }
        setIsDisplaying(false);
    }, []);

    const nextRound = useCallback(() => {
        const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        const nextSeq = [...sequenceRef.current, nextColor];
        sequenceRef.current = nextSeq;
        setSequence(nextSeq);
        setRound(nextSeq.length);
        userIndexRef.current = 0;
        setUserSequence([]);
        playSequence(nextSeq);
    }, [playSequence]);

    useEffect(() => {
        nextRound();
    }, [nextRound]);

    const handleColorClick = (color: string) => {
        if (isDisplaying) return;

        setActiveColor(color);
        setTimeout(() => setActiveColor(null), 200);

        if (color === sequenceRef.current[userIndexRef.current]) {
            userIndexRef.current += 1;
            if (userIndexRef.current === sequenceRef.current.length) {
                // Correct sequence completed
                setTimeout(nextRound, 1000);
            }
        } else {
            // Wrong color
            onGameOver(round > 0 ? (round - 1) * 10 : 0);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div className={styles.gameContainer}>
                <div className={styles.center}>
                    <div className={styles.scoreLabel}>ROUND</div>
                    <div className={styles.scoreValue}>{round}</div>
                </div>
                {COLORS.map(color => (
                    <button
                        key={color}
                        className={`${styles.button} ${styles[color]} ${activeColor === color ? styles.active : ''}`}
                        onClick={() => handleColorClick(color)}
                        disabled={isDisplaying}
                    />
                ))}
            </div>
            <p style={{ textAlign: 'center', marginTop: '20px', color: '#64748b' }}>
                {isDisplaying ? '패턴을 기억하세요...' : '패턴을 따라 누르세요!'}
            </p>
        </div>
    );
}

export default function SimonPage() {
    return (
        <GameContainer slug="simon-says">
            {(props) => <SimonSaysGame {...props} />}
        </GameContainer>
    );
}
