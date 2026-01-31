'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './traffic.module.css';

interface Car {
    id: number;
    x: number;
    y: number;
    direction: 'H' | 'V';
    isStopped: boolean;
    speed: number;
    type: 'RED' | 'BLUE';
}

function TrafficGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [cars, setCars] = useState<Car[]>([]);
    const [score, setScore] = useState(0);

    const carsRef = useRef<Car[]>([]);
    const scoreRef = useRef(0);
    const idRef = useRef(0);

    const spawnCar = useCallback(() => {
        const direction = Math.random() > 0.5 ? 'H' : 'V';
        const newCar: Car = {
            id: idRef.current++,
            x: direction === 'H' ? -100 : 225,
            y: direction === 'V' ? -100 : 225,
            direction,
            isStopped: false,
            speed: 2 + Math.random() * 2,
            type: Math.random() > 0.5 ? 'RED' : 'BLUE'
        };
        carsRef.current.push(newCar);
        setCars([...carsRef.current]);
    }, []);

    const toggleCar = (id: number) => {
        const car = carsRef.current.find(c => c.id === id);
        if (car) {
            car.isStopped = !car.isStopped;
            setCars([...carsRef.current]);
        }
    };

    useEffect(() => {
        const spawner = setInterval(spawnCar, 2000);
        const loop = setInterval(() => {
            carsRef.current = carsRef.current.map(c => {
                if (!c.isStopped) {
                    if (c.direction === 'H') c.x += c.speed;
                    else c.y += c.speed;
                }
                return c;
            }).filter(c => {
                if (c.x > 600 || c.y > 600) {
                    scoreRef.current += 10;
                    setScore(scoreRef.current);
                    return false;
                }
                return true;
            });

            // Collision Check
            for (let i = 0; i < carsRef.current.length; i++) {
                for (let j = i + 1; j < carsRef.current.length; j++) {
                    const c1 = carsRef.current[i];
                    const c2 = carsRef.current[j];

                    const dx = Math.abs(c1.x - c2.x);
                    const dy = Math.abs(c1.y - c2.y);

                    if (dx < 40 && dy < 40) {
                        // CRASH!
                        clearInterval(spawner);
                        clearInterval(loop);
                        onGameOver(scoreRef.current);
                        return;
                    }
                }
            }

            setCars([...carsRef.current]);
        }, 32);

        return () => {
            clearInterval(spawner);
            clearInterval(loop);
        };
    }, [spawnCar, onGameOver]);

    return (
        <div className={styles.gameContainer}>
            <div className={styles.ui}>SCORE: {score}</div>
            <div className={styles.roadHorizontal} />
            <div className={styles.roadVertical} />

            {cars.map(c => (
                <div
                    key={c.id}
                    className={`${styles.car} ${c.type === 'BLUE' ? styles.carBlue : ''} ${c.isStopped ? styles.stopped : ''}`}
                    style={{
                        left: c.x,
                        top: c.y,
                        transform: c.direction === 'H' ? 'rotate(90deg)' : 'none'
                    }}
                    onClick={() => toggleCar(c.id)}
                />
            ))}
        </div>
    );
}

export default function TrafficPage() {
    return (
        <GameContainer slug="traffic-control">
            {(props) => <TrafficGame {...props} />}
        </GameContainer>
    );
}
