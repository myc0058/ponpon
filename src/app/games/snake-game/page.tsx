'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './snake.module.css';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 }
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const TICK_RATE = 150;

function SnakeGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [snake, setSnake] = useState(INITIAL_SNAKE);
    const [food, setFood] = useState({ x: 5, y: 5 });
    const [direction, setDirection] = useState(INITIAL_DIRECTION);
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);

    const directionRef = useRef(INITIAL_DIRECTION);
    const snakeRef = useRef(INITIAL_SNAKE);
    const foodRef = useRef({ x: 5, y: 5 });
    const scoreRef = useRef(0);
    const lastTickRef = useRef(0);

    const generateFood = useCallback((currentSnake: { x: number, y: number }[]) => {
        let newFood;
        while (true) {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
            const onSnake = currentSnake.some(segment => segment.x === newFood!.x && segment.y === newFood!.y);
            if (!onSnake) break;
        }
        return newFood;
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const key = e.key;
        let newDir = directionRef.current;

        if (key === 'ArrowUp' && directionRef.current.y !== 1) newDir = { x: 0, y: -1 };
        else if (key === 'ArrowDown' && directionRef.current.y !== -1) newDir = { x: 0, y: 1 };
        else if (key === 'ArrowLeft' && directionRef.current.x !== 1) newDir = { x: -1, y: 0 };
        else if (key === 'ArrowRight' && directionRef.current.x !== -1) newDir = { x: 1, y: 0 };

        directionRef.current = newDir;
        setDirection(newDir);
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        const gameLoop = (time: number) => {
            if (isGameOver) return;

            if (time - lastTickRef.current > TICK_RATE) {
                lastTickRef.current = time;

                const head = snakeRef.current[0];
                const newHead = {
                    x: head.x + directionRef.current.x,
                    y: head.y + directionRef.current.y
                };

                // Wall collision
                if (
                    newHead.x < 0 || newHead.x >= GRID_SIZE ||
                    newHead.y < 0 || newHead.y >= GRID_SIZE
                ) {
                    endGame();
                    return;
                }

                // Self collision
                if (snakeRef.current.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                    endGame();
                    return;
                }

                const newSnake = [newHead, ...snakeRef.current];

                // Food collision
                if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
                    scoreRef.current += 10;
                    setScore(scoreRef.current);
                    const nf = generateFood(newSnake);
                    foodRef.current = nf;
                    setFood(nf);
                } else {
                    newSnake.pop();
                }

                snakeRef.current = newSnake;
                setSnake([...newSnake]);
            }

            requestAnimationFrame(gameLoop);
        };

        const endGame = () => {
            setIsGameOver(true);
            onGameOver(scoreRef.current);
        };

        const frameId = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(frameId);
    }, [isGameOver, onGameOver, generateFood]);

    return (
        <div className={styles.gameContainer}>
            <div className={styles.scoreUI}>SCORE: {score}</div>

            {/* Render Grid Cells */}
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                const x = i % GRID_SIZE;
                const y = Math.floor(i / GRID_SIZE);

                const isSnake = snake.some(s => s.x === x && s.y === y);
                const isHead = snake[0].x === x && snake[0].y === y;
                const isFood = food.x === x && food.y === y;

                return (
                    <div
                        key={i}
                        className={`${styles.cell} ${isSnake ? (isHead ? styles.snakeHead : styles.snake) : ''} ${isFood ? styles.food : ''}`}
                    />
                );
            })}

            <div className={styles.controlGuide}>방향키로 뱀을 조종하세요</div>

            {isGameOver && (
                <div className={styles.gameStartPrompt}>
                    <h2>GAME OVER</h2>
                    <p>Click RESTART to try again</p>
                </div>
            )}
        </div>
    );
}

export default function SnakePage() {
    return (
        <GameContainer slug="snake-game">
            {(props) => <SnakeGame {...props} />}
        </GameContainer>
    );
}
