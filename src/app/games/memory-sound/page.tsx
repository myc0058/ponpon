'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './memory.module.css';

const COLORS = ['blue', 'red', 'green', 'yellow'] as const;
type Color = typeof COLORS[number];

const FREQUENCIES: Record<Color, number> = {
    blue: 261.63, // C4
    red: 329.63,  // E4
    green: 392.00, // G4
    yellow: 440.00 // A4
};

function MemorySoundGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [sequence, setSequence] = useState<Color[]>([]);
    const [userSequence, setUserSequence] = useState<Color[]>([]);
    const [activeColor, setActiveColor] = useState<Color | null>(null);
    const [score, setScore] = useState(0);
    const [isInputDisabled, setIsInputDisabled] = useState(true);

    const audioCtxRef = useRef<AudioContext | null>(null);

    const playTone = (color: Color) => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.frequency.setValueAtTime(FREQUENCIES[color], ctx.currentTime);
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.3);

        setActiveColor(color);
        setTimeout(() => setActiveColor(null), 250);
    };

    const addToSequence = useCallback(() => {
        const next = COLORS[Math.floor(Math.random() * 4)];
        setSequence(prev => [...prev, next]);
        setUserSequence([]);
        setIsInputDisabled(true);
    }, []);

    const playSequence = useCallback(async (seq: Color[]) => {
        for (const color of seq) {
            await new Promise(r => setTimeout(r, 400));
            playTone(color);
        }
        setIsInputDisabled(false);
    }, []);

    useEffect(() => {
        if (sequence.length === 0) {
            addToSequence();
        } else {
            playSequence(sequence);
        }
    }, [sequence, addToSequence, playSequence]);

    const handlePadClick = (color: Color) => {
        if (isInputDisabled) return;

        playTone(color);
        const newUserSeq = [...userSequence, color];
        setUserSequence(newUserSeq);

        const currentIdx = newUserSeq.length - 1;
        if (newUserSeq[currentIdx] !== sequence[currentIdx]) {
            // Wrong!
            setIsInputDisabled(true);
            setTimeout(() => onGameOver(score), 1000);
            return;
        }

        if (newUserSeq.length === sequence.length) {
            setScore(s => s + 10);
            setIsInputDisabled(true);
            setTimeout(addToSequence, 1000);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div className={styles.gameContainer}>
                {COLORS.map(color => (
                    <div
                        key={color}
                        className={`${styles.pad} ${styles[color]} ${activeColor === color ? styles.active : ''}`}
                        onClick={() => handlePadClick(color)}
                    />
                ))}
                <div className={styles.center}>
                    <div className={styles.score}>{score}</div>
                    <div className={styles.label}>{isInputDisabled ? 'LISTEN' : 'YOUR TURN'}</div>
                </div>
            </div>
        </div>
    );
}

export default function MemoryPage() {
    return (
        <GameContainer slug="memory-sound">
            {(props) => <MemorySoundGame {...props} />}
        </GameContainer>
    );
}
