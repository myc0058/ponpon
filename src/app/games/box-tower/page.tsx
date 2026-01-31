'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './tower.module.css';

interface Box {
    id: number;
    x: number;
    y: number;
}

function BoxTowerGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [boxes, setBoxes] = useState<Box[]>([]);
    const [swingAngle, setSwingAngle] = useState(0);
    const [activeBox, setActiveBox] = useState<{ x: number, y: number } | null>({ x: 175, y: 50 });
    const [score, setScore] = useState(0);

    const scoreRef = useRef(0);
    const boxesRef = useRef<Box[]>([]);
    const isFallingRef = useRef(false);
    const idRef = useRef(0);
    const cameraYRef = useRef(0);

    const handleDrop = () => {
        if (isFallingRef.current || !activeBox) return;
        isFallingRef.current = true;
    };

    useEffect(() => {
        const loop = () => {
            // Swing Logic
            const time = Date.now() / 1000;
            const angle = Math.sin(time * 2.5) * 45;
            setSwingAngle(angle);

            if (!isFallingRef.current && activeBox) {
                const rad = angle * (Math.PI / 180);
                const x = 200 + Math.sin(rad) * 150 - 25;
                setActiveBox({ x, y: 50 });
            }

            // Falling Logic
            if (isFallingRef.current && activeBox) {
                setActiveBox(prev => {
                    if (!prev) return null;
                    const nextY = prev.y + 7;

                    // Collision Check
                    const floorY = boxesRef.current.length > 0 ? boxesRef.current[boxesRef.current.length - 1].y : 470;
                    const targetY = floorY - 50;

                    if (nextY >= targetY) {
                        isFallingRef.current = false;
                        const lastBox = boxesRef.current[boxesRef.current.length - 1];
                        const overlapX = lastBox ? Math.abs(prev.x - lastBox.x) : 0;

                        if (boxesRef.current.length === 0 || overlapX < 40) {
                            // Landed successfully
                            const newBox = { id: idRef.current++, x: prev.x, y: targetY };
                            boxesRef.current.push(newBox);
                            setBoxes([...boxesRef.current]);
                            scoreRef.current += 1;
                            setScore(scoreRef.current);

                            // Adjust camera if too high
                            if (targetY < 200) {
                                const diff = 50;
                                cameraYRef.current += diff;
                                boxesRef.current = boxesRef.current.map(b => ({ ...b, y: b.y + diff }));
                                setBoxes([...boxesRef.current]);
                            }
                            return { x: 175, y: 50 };
                        } else {
                            // Failed!
                            onGameOver(scoreRef.current);
                            return null;
                        }
                    }
                    return { ...prev, y: nextY };
                });
            }

            requestAnimationFrame(loop);
        };

        const id = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(id);
    }, [activeBox, onGameOver]);

    return (
        <div className={styles.gameContainer} onClick={handleDrop}>
            <div className={styles.ui}>SCORE: {score}</div>
            <div className={styles.ground} />

            {/* Crane Ropes */}
            {activeBox && !isFallingRef.current && (
                <div
                    className={styles.crane}
                    style={{
                        height: '50px',
                        left: '200px',
                        transformOrigin: 'top center',
                        transform: `rotate(${swingAngle}deg)`
                    }}
                />
            )}

            {activeBox && (
                <div
                    className={styles.box}
                    style={{
                        left: activeBox.x,
                        top: activeBox.y,
                        transition: isFallingRef.current ? 'none' : 'none'
                    }}
                />
            )}

            {boxes.map(box => (
                <div
                    key={box.id}
                    className={styles.box}
                    style={{ left: box.x, top: box.y }}
                />
            ))}
        </div>
    );
}

export default function TowerPage() {
    return (
        <GameContainer slug="box-tower">
            {(props) => <BoxTowerGame {...props} />}
        </GameContainer>
    );
}
