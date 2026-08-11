import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Avatar — Mujeeb's illustrated character (transparent cutout), rendered as a
 * single plane. The raised-hand pose already reads as a welcome; we add a gentle
 * "alive" idle (breathing bob + subtle sway) rather than a puppet wave (which
 * showed a seam at the elbow). Keeps the "step aside as you approach" dodge.
 */
const easeOutQuad = (t) => t * (2 - t);

const Avatar = ({ position = [0, 0, 0] }) => {
    const groupRef = useRef();
    const idleRef = useRef();
    const { camera } = useThree();

    const dodgeX = useRef(0);
    const targetDodgeX = useRef(0);
    const worldPosVec = useRef(new THREE.Vector3());

    const [dims, setDims] = useState({ w: 0.95, h: 2.3 });
    const tex = useTexture('/textures/corridor/avatar_src/character.png');

    useEffect(() => {
        if (!tex) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        if (tex.image) {
            const baseH = 2.3;
            setDims({ w: baseH * (tex.image.width / tex.image.height), h: baseH });
        }
    }, [tex]);

    useMemo(() => { if (tex) tex.colorSpace = THREE.SRGBColorSpace; }, [tex]);

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

        // Gentle "alive" idle: breathing bob + subtle sway
        if (idleRef.current) {
            idleRef.current.position.y = Math.sin(time * 1.3) * 0.018;
            idleRef.current.rotation.z = Math.sin(time * 0.8) * 0.006;
        }
    });

    return (
        <group ref={groupRef} position={position}>
            <group ref={idleRef}>
                <mesh>
                    <planeGeometry args={[dims.w, dims.h]} />
                    <meshBasicMaterial map={tex} color="#ffffff" transparent side={THREE.DoubleSide} depthWrite={false} />
                </mesh>
            </group>
        </group>
    );
};

export default Avatar;
