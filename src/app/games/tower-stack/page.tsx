'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './stack.module.css';

const CONTAINER_W = 300;
const BLOCK_H = 30;

interface Block {
    id: number;
    x: number;
    w: number;
    y: number;
    color: string;
}

function TowerStackGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [activeBlock, setActiveBlock] = useState<Block | null>(null);
    const [score, setScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);

    const blocksRef = useRef<Block[]>([]);
    const activeRef = useRef<Block | null>(null);
    const dirRef = useRef(1); // 1 for right, -1 for left
    const speedRef = useRef(2);

    const spawnBlock = useCallback(() => {
        const prevBlock = blocksRef.current[blocksRef.current.length - 1];
        const width = prevBlock ? prevBlock.w : 150;
        const y = CONTAINER_W - (blocksRef.current.length + 1) * BLOCK_H; // Simplified Y using height

        const newBlock = {
            id: Date.now(),
            x: 0,
            w: width,
            y: 500 - 40 - (blocksRef.current.length + 1) * BLOCK_H,
            color: `hsl(${(blocksRef.current.length * 20) % 360}, 70%, 60%)`
        };
        activeRef.current = newBlock;
        setActiveBlock(newBlock);
        speedRef.current = 2 + Math.floor(blocksRef.current.length / 5);
    }, []);

    useEffect(() => {
        spawnBlock();
    }, [spawnBlock]);

    useEffect(() => {
        if (isGameOver) return;

        const loop = () => {
            if (activeRef.current) {
                let nx = activeRef.current.x + dirRef.current * speedRef.current;
                if (nx <= 0 || nx + activeRef.current.w >= CONTAINER_W) {
                    dirRef.current *= -1;
                }
                activeRef.current.x = nx;
                setActiveBlock({ ...activeRef.current });
            }
            requestAnimationFrame(loop);
        };
        const id = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(id);
    }, [isGameOver]);

    const handleDrop = () => {
        if (isGameOver || !activeRef.current) return;

        const current = activeRef.current;
        const prev = blocksRef.current[blocksRef.current.length - 1];

        if (!prev) {
            // First block
            blocksRef.current.push(current);
            setBlocks([...blocksRef.current]);
            setScore(1);
            spawnBlock();
            return;
        }

        const diff = current.x - prev.x;
        const absDiff = Math.abs(diff);

        if (absDiff >= prev.w) {
            // Missed entirely
            setIsGameOver(true);
            onGameOver(score);
            return;
        }

        // Cut the block
        const newWidth = prev.w - absDiff;
        const newX = diff > 0 ? current.x : prev.x;

        const stackedBlock = { ...current, x: newX, w: newWidth };
        blocksRef.current.push(stackedBlock);
        setBlocks([...blocksRef.current]);
        setScore(s => s + 1);

        spawnBlock();
    };

    return (
        <div className={styles.gameContainer} onClick={handleDrop}>
            <div className={styles.scoreUI}>{score}</div>
            <div className={styles.ground} />
            {blocks.map(b => (
                <div key={b.id} className={styles.block} style={{ left: b.x, width: b.w, bottom: 500 - b.y - BLOCK_H, backgroundColor: b.color }} />
            ))}
            {activeBlock && (
                <div className={styles.block} style={{ left: activeBlock.x, width: activeBlock.w, bottom: 500 - activeBlock.y - BLOCK_H, backgroundColor: activeBlock.color }} />
            )}
            {isGameOver && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.5)', color: 'white' }}>
                    <h2>GAME OVER!</h2>
                </div>
            )}
        </div>
    );
}

export default function TowerPage() {
    return (
        <GameContainer slug="tower-stack">
            {(props) => <TowerStackGame {...props} />}
        </GameContainer>
    );
}
