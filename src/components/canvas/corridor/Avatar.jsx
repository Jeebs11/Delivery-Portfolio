import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Avatar — Mujeeb's illustrated character, frame-animated (a hand wave) from the
 * 10 cut-out frames in /avatar_new. Ping-pongs through the frames for a smooth
 * back-and-forth wave, plus a gentle breathing bob and the "step aside as you
 * approach" dodge.
 */
const easeOutQuad = (t) => t * (2 - t);

const FRAME_COUNT = 10;
const FRAME_PATHS = Array.from({ length: FRAME_COUNT }, (_, i) => `/textures/corridor/avatar_new/${i + 1}.webp`);
const FPS = 5; // wave speed (frames per second)

const Avatar = ({ position = [0, 0, 0] }) => {
    const groupRef = useRef();
    const idleRef = useRef();
    const matRef = useRef();
    const { camera } = useThree();

    const dodgeX = useRef(0);
    const targetDodgeX = useRef(0);
    const worldPosVec = useRef(new THREE.Vector3());
    const lastFrame = useRef(-1);

    const frames = useTexture(FRAME_PATHS);
    const [dims, setDims] = useState({ w: 1.53, h: 2.3 });

    // Set sRGB synchronously (before first GPU upload) so every frame renders with
    // the same bold colour — a deferred effect leaves the first frame washed out,
    // which flashes as a "white filter" each wave cycle.
    useMemo(() => {
        frames.forEach((t) => { if (t) { t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; } });
    }, [frames]);

    useEffect(() => {
        const img = frames[0]?.image;
        if (img) {
            const baseH = 2.3;
            setDims({ w: baseH * (img.width / img.height), h: baseH });
        }
    }, [frames]);

    useFrame((state) => {
        if (!groupRef.current) return;
        const time = state.clock.elapsedTime;

        // Dodge (step aside as the camera approaches)
        groupRef.current.getWorldPosition(worldPosVec.current);
        const distance = camera.position.z - worldPosVec.current.z;
        const DODGE_START = 3, DODGE_PEAK = 0, DODGE_END = -2, DODGE_AMOUNT = -1.5;
        if (distance > DODGE_PEAK && distance < DODGE_START) {
            targetDodgeX.current = DODGE_AMOUNT * easeOutQuad((DODGE_START - distance) / (DODGE_START - DODGE_PEAK));
        } else if (distance <= DODGE_PEAK && distance > DODGE_END) {
            targetDodgeX.current = DODGE_AMOUNT * easeOutQuad((distance - DODGE_END) / (DODGE_PEAK - DODGE_END));
        } else {
            targetDodgeX.current = 0;
        }
        dodgeX.current = THREE.MathUtils.lerp(dodgeX.current, targetDodgeX.current, 0.08);
        groupRef.current.position.x = position[0] + dodgeX.current;
        groupRef.current.position.y = position[1];

        // Frame animation: ping-pong through the wave frames (0..9..0)
        const span = 2 * (FRAME_COUNT - 1);
        const c = Math.floor(time * FPS) % span;
        const idx = c < FRAME_COUNT ? c : span - c;
        if (idx !== lastFrame.current && matRef.current && frames[idx]) {
            matRef.current.map = frames[idx];
            matRef.current.needsUpdate = true;
            lastFrame.current = idx;
        }

        // Gentle "alive" breathing bob
        if (idleRef.current) {
            idleRef.current.position.y = Math.sin(time * 1.3) * 0.015;
        }
    });

    return (
        <group ref={groupRef} position={position}>
            <group ref={idleRef}>
                <mesh>
                    <planeGeometry args={[dims.w, dims.h]} />
                    <meshBasicMaterial ref={matRef} map={frames[0]} color="#ffffff" transparent side={THREE.DoubleSide} depthWrite={false} />
                </mesh>
            </group>
        </group>
    );
};

export default Avatar;
