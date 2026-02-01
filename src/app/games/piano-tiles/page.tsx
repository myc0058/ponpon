'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import GameContainer from '@/components/games/GameContainer';
import styles from './tiles.module.css';

interface Tile {
    id: number;
    lane: number;
    y: number;
    tapped: boolean;
}

function PianoTilesGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const [tiles, setTiles] = useState<Tile[]>([]);
    const [score, setScore] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);

    const tilesRef = useRef<Tile[]>([]);
    const scoreRef = useRef(0);
    const speedRef = useRef(3);
    const lastTileYRef = useRef(-125);
    const tileIdRef = useRef(0);

    const spawnTile = useCallback(() => {
        const lane = Math.floor(Math.random() * 4);
        const newTile: Tile = {
            id: tileIdRef.current++,
            lane,
            y: lastTileYRef.current - 125,
            tapped: false
        };
        lastTileYRef.current = newTile.y;
        tilesRef.current.push(newTile);
        setTiles([...tilesRef.current]);
    }, []);

    useEffect(() => {
        // Init first 4 tiles
        for (let i = 0; i < 5; i++) spawnTile();
    }, [spawnTile]);

    useEffect(() => {
        if (!gameStarted) return;

        const loop = () => {
            let gameOver = false;
            tilesRef.current = tilesRef.current.map(t => {
                t.y += speedRef.current;
                if (!t.tapped && t.y > 500) {
                    gameOver = true;
                }
                return t;
            }).filter(t => t.y < 600);

            if (gameOver) {
                onGameOver(scoreRef.current);
                return;
            }

            // Keep spawning
            if (tilesRef.current[tilesRef.current.length - 1].y > -125) {
                spawnTile();
            }

            // Speed up
            speedRef.current = 3 + Math.floor(scoreRef.current / 20) * 0.5;

            setTiles([...tilesRef.current]);
            requestAnimationFrame(loop);
        };

        const id = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(id);
    }, [gameStarted, spawnTile, onGameOver]);

    const handleTileTap = (id: number) => {
        if (!gameStarted) setGameStarted(true);

        const tile = tilesRef.current.find(t => t.id === id);
        if (tile && !tile.tapped) {
            tile.tapped = true;
            scoreRef.current += 1;
            setScore(scoreRef.current);
            setTiles([...tilesRef.current]);
        }
    };

    const handleMissClick = () => {
        if (gameStarted) {
            onGameOver(scoreRef.current);
        }
    };

    return (
        <div className={styles.gameContainer} onClick={handleMissClick}>
            <div className={styles.scoreUI}>{score}</div>
            {[0, 1, 2, 3].map(laneIndex => (
                <div key={laneIndex} className={styles.lane}>
                    {tiles
                        .filter(t => t.lane === laneIndex)
                        .map(t => (
                            <div
                                key={t.id}
                                className={`${styles.tile} ${t.tapped ? styles.tapped : ''}`}
                                style={{ top: t.y, opacity: t.tapped ? 0 : 1 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleTileTap(t.id);
                                }}
                            />
                        ))}
                </div>
            ))}
            {!gameStarted && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.7)', color: 'white', zIndex: 20 }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>TAP TO START</h2>
                    <p>검은색 타일을 탭하세요!</p>
                </div>
            )}
        </div>
    );
}

export default function PianoPage() {
    return (
        <GameContainer slug="piano-tiles">
            {(props) => <PianoTilesGame {...props} />}
        </GameContainer>
    );
}
