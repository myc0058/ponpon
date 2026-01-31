'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import GameContainer from '@/components/games/GameContainer';
import styles from './runner.module.css';

function CubeRunnerGame({ onGameOver }: { onGameOver: (score: number) => void }) {
    const mountRef = useRef<HTMLDivElement>(null);
    const [score, setScore] = useState(0);
    const scoreRef = useRef(0);
    const isGameOverRef = useRef(false);

    useEffect(() => {
        if (!mountRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x050505);
        scene.fog = new THREE.Fog(0x050505, 10, 50);

        const camera = new THREE.Camera();
        const persCamera = new THREE.PerspectiveCamera(75, 600 / 400, 0.1, 1000);
        persCamera.position.set(0, 2, 5);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(400, 400); // Fixed size for consistency
        mountRef.current.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0x00ff00, 1);
        pointLight.position.set(0, 5, 0);
        scene.add(pointLight);

        // Texture Loading
        const loader = new THREE.TextureLoader();
        const floorTexture = loader.load('https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/games/sprites/cube-runner-3d/floor.webp?v=1769861353139');
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(10, 100);

        const cubeTexture = loader.load('https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/games/sprites/cube-runner-3d/cube.webp?v=1769861352932');
        const bgTexture = loader.load('https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/games/sprites/cube-runner-3d/bg.webp?v=1769861352745');
        scene.background = bgTexture;

        // Floor
        const planeGeo = new THREE.PlaneGeometry(100, 1000);
        const planeMat = new THREE.MeshStandardMaterial({
            map: floorTexture,
            color: 0x888888
        });
        const floor = new THREE.Mesh(planeGeo, planeMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -0.5;
        scene.add(floor);

        // Player
        const playerGeo = new THREE.BoxGeometry(1, 1, 1);
        const playerMat = new THREE.MeshStandardMaterial({ map: cubeTexture, color: 0x00ffff });
        const player = new THREE.Mesh(playerGeo, playerMat);
        player.position.y = 0.5;
        scene.add(player);

        // Obstacles
        const obstacles: THREE.Mesh[] = [];
        const spawnObstacle = () => {
            const geo = new THREE.BoxGeometry(1, 1, 1);
            const mat = new THREE.MeshStandardMaterial({ map: cubeTexture, color: 0xff0000 });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(Math.random() * 10 - 5, 0.5, -50);
            scene.add(mesh);
            obstacles.push(mesh);
        };

        // Input handling
        let moveX = 0;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') moveX = -0.15;
            if (e.key === 'ArrowRight') moveX = 0.15;
        };
        const handleKeyUp = () => moveX = 0;
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Game loop
        let frame = 0;
        const animate = () => {
            if (isGameOverRef.current) return;

            frame++;
            if (frame % 60 === 0) {
                spawnObstacle();
                scoreRef.current += 1;
                setScore(scoreRef.current);
            }

            // Move player
            player.position.x += moveX;
            player.position.x = Math.max(-5, Math.min(5, player.position.x));

            // View follow
            persCamera.position.x = player.position.x * 0.5;
            persCamera.lookAt(player.position.x, 0, -10);

            // Move floor for scrolling effect
            floor.position.z += 0.2;
            if (floor.position.z > 100) floor.position.z = 0;

            // Move and check obstacles
            for (let i = obstacles.length - 1; i >= 0; i--) {
                const obs = obstacles[i];
                obs.position.z += 0.3 + scoreRef.current * 0.01;

                // Collision Detection
                const dist = player.position.distanceTo(obs.position);
                if (dist < 1.0) {
                    isGameOverRef.current = true;
                    onGameOver(scoreRef.current * 10);
                }

                if (obs.position.z > 10) {
                    scene.remove(obs);
                    obstacles.splice(i, 1);
                }
            }

            renderer.render(scene, persCamera);
            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, [onGameOver]);

    return (
        <div className={styles.gameContainer}>
            <div className={styles.ui}>
                <div className={styles.score}>{score}0</div>
                <div style={{ color: '#fff' }}>LIFE: 1</div>
            </div>
            <div ref={mountRef} className={styles.canvas} />
            <div className={styles.controls}>방향키 (← →) 로 이동하세요!</div>
        </div>
    );
}

export default function RunnerPage() {
    return (
        <GameContainer slug="cube-runner-3d">
            {(props) => <CubeRunnerGame {...props} />}
        </GameContainer>
    );
}
