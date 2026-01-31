'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './brick.module.css';

const CONTAINER_WIDTH = 400;
const CONTAINER_HEIGHT = 500;
const PADDLE_WIDTH = 80;
const BRICK_ROWS = 5;
const BRICK_COLS = 6;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 5;

interface Brick {
    id: number;
    x: number;
    y: number;
    color: string;
    destroyed: boolean;
}

function BrickBreakerGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [paddleX, setPaddleX] = useState((CONTAINER_WIDTH - PADDLE_WIDTH) / 2);
    const [ballPos, setBallPos] = useState({ x: 200, y: 450 });
    const [bricks, setBricks] = useState<Brick[]>([]);
    const [score, setScore] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const paddleXRef = useRef((CONTAINER_WIDTH - PADDLE_WIDTH) / 2);
    const ballPosRef = useRef({ x: 200, y: 450 });
    const ballVelRef = useRef({ x: 3, y: -3 });
    const scoreRef = useRef(0);
    const bricksRef = useRef<Brick[]>([]);

    const initBricks = useCallback(() => {
        const newBricks: Brick[] = [];
        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
        const totalPadding = (BRICK_COLS + 1) * BRICK_PADDING;
        const brickWidth = (CONTAINER_WIDTH - totalPadding) / BRICK_COLS;

        for (let r = 0; r < BRICK_ROWS; r++) {
            for (let c = 0; c < BRICK_COLS; c++) {
                newBricks.push({
                    id: r * BRICK_COLS + c,
                    x: BRICK_PADDING + c * (brickWidth + BRICK_PADDING),
                    y: 40 + r * (BRICK_HEIGHT + BRICK_PADDING),
                    color: colors[r],
                    destroyed: false
                });
            }
        }
        setBricks(newBricks);
        bricksRef.current = newBricks;
    }, []);

    useEffect(() => {
        initBricks();
    }, [initBricks]);

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        const container = e.currentTarget.getBoundingClientRect();
        let clientX;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
        } else {
            clientX = e.clientX;
        }
        let x = clientX - container.left - PADDLE_WIDTH / 2;
        x = Math.max(0, Math.min(x, CONTAINER_WIDTH - PADDLE_WIDTH));
        setPaddleX(x);
        paddleXRef.current = x;
    };

    useEffect(() => {
        if (!isPlaying) return;

        const loop = () => {
            const { x, y } = ballPosRef.current;
            const { x: vx, y: vy } = ballVelRef.current;

            let nx = x + vx;
            let ny = y + vy;

            // Wall collision
            if (nx <= 0 || nx >= CONTAINER_WIDTH - 12) ballVelRef.current.x *= -1;
            if (ny <= 0) ballVelRef.current.y *= -1;

            // Paddle collision
            if (ny >= CONTAINER_HEIGHT - 32 - 12 && nx >= paddleXRef.current && nx <= paddleXRef.current + PADDLE_WIDTH) {
                ballVelRef.current.y *= -1;
                ny = CONTAINER_HEIGHT - 32 - 12; // Snap to top of paddle
            }

            // Brick collision
            const brickWidth = (CONTAINER_WIDTH - (BRICK_COLS + 1) * BRICK_PADDING) / BRICK_COLS;
            for (let brick of bricksRef.current) {
                if (!brick.destroyed) {
                    if (nx + 12 >= brick.x && nx <= brick.x + brickWidth && ny + 12 >= brick.y && ny <= brick.y + BRICK_HEIGHT) {
                        brick.destroyed = true;
                        setBricks([...bricksRef.current]);
                        ballVelRef.current.y *= -1;
                        scoreRef.current += 10;
                        setScore(scoreRef.current);
                        break;
                    }
                }
            }

            // Game Over
            if (ny >= CONTAINER_HEIGHT) {
                setIsPlaying(false);
                onGameOver(scoreRef.current);
                return;
            }

            // Win condition
            if (bricksRef.current.every(b => b.destroyed)) {
                setIsPlaying(false);
                onGameOver(scoreRef.current + 100);
                return;
            }

            ballPosRef.current = { x: nx, y: ny };
            setBallPos({ x: nx, y: ny });
            requestAnimationFrame(loop);
        };

        const id = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(id);
    }, [isPlaying, onGameOver]);

    const startGame = () => {
        if (!isPlaying) {
            setIsPlaying(true);
            ballPosRef.current = { x: 200, y: 440 };
            ballVelRef.current = { x: 3, y: -3 };
            scoreRef.current = 0;
            setScore(0);
            initBricks();
        }
    };

    return (
        <div
            className={styles.gameContainer}
            onMouseMove={handleMouseMove}
            onTouchMove={handleMouseMove}
            onClick={startGame}
        >
            <div className={styles.scoreUI}>SCORE: {score}</div>
            <div className={styles.paddle} style={{ left: paddleX, width: PADDLE_WIDTH }} />
            <div className={styles.ball} style={{ left: ballPos.x, top: ballPos.y }} />
            {bricks.map(brick => !brick.destroyed && (
                <div
                    key={brick.id}
                    className={styles.brick}
                    style={{
                        left: brick.x,
                        top: brick.y,
                        width: (CONTAINER_WIDTH - (BRICK_COLS + 1) * BRICK_PADDING) / BRICK_COLS,
                        backgroundColor: brick.color
                    }}
                />
            ))}
            {!isPlaying && (
                <div className={styles.startPrompt}>
                    <h2>CLICK TO START</h2>
                    <p>패들을 움직여 공을 튕겨내세요!</p>
                </div>
            )}
        </div>
    );
}

export default function BrickPage() {
    return (
        <GameContainer slug="brick-breaker">
            {(props) => <BrickBreakerGame {...props} />}
        </GameContainer>
    );
}
