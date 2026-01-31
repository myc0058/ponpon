'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './2048.module.css';

type Tile = {
    id: number;
    value: number;
    x: number;
    y: number;
};

function Game2048({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [tiles, setTiles] = useState<Tile[]>([]);
    const [score, setScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const tileIdRef = useRef(0);

    const spawnTile = useCallback((currentTiles: Tile[]) => {
        const emptyPositions = [];
        for (let x = 0; x < 4; x++) {
            for (let y = 0; y < 4; y++) {
                if (!currentTiles.some(t => t.x === x && t.y === y)) {
                    emptyPositions.push({ x, y });
                }
            }
        }

        if (emptyPositions.length === 0) return currentTiles;

        const pos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
        const newVal = Math.random() < 0.9 ? 2 : 4;
        const newTile: Tile = { id: tileIdRef.current++, value: newVal, x: pos.x, y: pos.y };

        return [...currentTiles, newTile];
    }, []);

    const initGame = useCallback(() => {
        let newTiles: Tile[] = [];
        newTiles = spawnTile(newTiles);
        newTiles = spawnTile(newTiles);
        setTiles(newTiles);
        setScore(0);
        setIsGameOver(false);
    }, [spawnTile]);

    useEffect(() => {
        initGame();
    }, [initGame]);

    const move = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
        if (isGameOver) return;

        let moved = false;
        let newScore = score;
        const newTiles = [...tiles];

        const isVertical = direction === 'UP' || direction === 'DOWN';
        const isReverse = direction === 'DOWN' || direction === 'RIGHT';

        // 정렬 순서 결정
        const sortTiles = (a: Tile, b: Tile) => {
            if (isVertical) {
                return isReverse ? b.y - a.y : a.y - b.y;
            }
            return isReverse ? b.x - a.x : a.x - b.x;
        };

        const sortedTiles = [...newTiles].sort(sortTiles);
        const mergedIds = new Set<number>();

        sortedTiles.forEach(tile => {
            let cx = tile.x;
            let cy = tile.y;

            while (true) {
                let nx = cx + (direction === 'LEFT' ? -1 : direction === 'RIGHT' ? 1 : 0);
                let ny = cy + (direction === 'UP' ? -1 : direction === 'DOWN' ? 1 : 0);

                if (nx < 0 || nx >= 4 || ny < 0 || ny >= 4) break;

                const targetTile = newTiles.find(t => t.x === nx && t.y === ny);

                if (!targetTile) {
                    tile.x = nx;
                    tile.y = ny;
                    cx = nx;
                    cy = ny;
                    moved = true;
                } else if (targetTile.value === tile.value && !mergedIds.has(targetTile.id) && !mergedIds.has(tile.id)) {
                    // Merge
                    targetTile.value *= 2;
                    newScore += targetTile.value;
                    mergedIds.add(targetTile.id);
                    // Remove current tile
                    const index = newTiles.findIndex(t => t.id === tile.id);
                    newTiles.splice(index, 1);
                    moved = true;
                    break;
                } else {
                    break;
                }
            }
        });

        if (moved) {
            const spawned = spawnTile(newTiles);
            setTiles(spawned);
            setScore(newScore);

            // Check Game Over
            if (checkGameOver(spawned)) {
                setIsGameOver(true);
                onGameOver(newScore);
            }
        }
    }, [tiles, score, isGameOver, spawnTile, onGameOver]);

    const checkGameOver = (currentTiles: Tile[]) => {
        if (currentTiles.length < 16) return false;

        for (const tile of currentTiles) {
            const neighbors = [
                { x: tile.x + 1, y: tile.y },
                { x: tile.x - 1, y: tile.y },
                { x: tile.x, y: tile.y + 1 },
                { x: tile.x, y: tile.y - 1 }
            ];

            for (const n of neighbors) {
                if (n.x >= 0 && n.x < 4 && n.y >= 0 && n.y < 4) {
                    const neighborTile = currentTiles.find(t => t.x === n.x && t.y === n.y);
                    if (neighborTile && neighborTile.value === tile.value) return false;
                }
            }
        }
        return true;
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp') move('UP');
            else if (e.key === 'ArrowDown') move('DOWN');
            else if (e.key === 'ArrowLeft') move('LEFT');
            else if (e.key === 'ArrowRight') move('RIGHT');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [move]);

    return (
        <div>
            <div className={styles.scoreUI}>
                <div className={styles.scoreBox}>
                    <span className={styles.scoreLabel}>SCORE</span>
                    <span className={styles.scoreValue}>{score}</span>
                </div>
            </div>

            <div className={styles.gameContainer}>
                <div className={styles.gridContainer}>
                    {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className={styles.cell} />
                    ))}
                </div>

                {tiles.map(tile => (
                    <div
                        key={tile.id}
                        className={`${styles.tile} ${styles['tile' + tile.value]}`}
                        style={{
                            left: `${10 + tile.x * 77.5}px`,
                            top: `${10 + tile.y * 77.5}px`
                        }}
                    >
                        {tile.value}
                    </div>
                ))}

                {isGameOver && (
                    <div className={styles.gameOverOverlay}>
                        <div className={styles.gameOverTitle}>Game Over!</div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Page2048() {
    return (
        <GameContainer slug="game-2048">
            {(props) => <Game2048 {...props} />}
        </GameContainer>
    );
}
