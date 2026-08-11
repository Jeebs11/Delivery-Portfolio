import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Avatar — Mujeeb's illustrated character (transparent cutout), puppet-rigged:
 * the raised forearm+hand is a separate layer that pivots at the elbow for a
 * continuous friendly wave. Keeps the "step aside as you approach" dodge and a
 * gentle breathing idle.
 *
 * NOTE: arm-box + elbow fractions must match scripts/compose-avatar-split.mjs.
 */

// Source image aspect (character.png = 622 x 1505)
const IMG_ASPECT = 622 / 1505;
const BASE_H = 2.3;
const FULL_W = BASE_H * IMG_ASPECT;
const FULL_H = BASE_H;

// arm crop box (fractions of the image) + elbow pivot (fraction)
const AB = { l: 0.661, t: 0.135, w: 0.339, h: 0.260 };
const ELBOW = { fx: 0.762, fy: 0.374 };

// derived local geometry
const ARM_W = AB.w * FULL_W;
const ARM_H = AB.h * FULL_H;
const armCenterLocal = [(AB.l + AB.w / 2 - 0.5) * FULL_W, (0.5 - (AB.t + AB.h / 2)) * FULL_H];
const elbowLocal = [(ELBOW.fx - 0.5) * FULL_W, (0.5 - ELBOW.fy) * FULL_H];
const armOffset = [armCenterLocal[0] - elbowLocal[0], armCenterLocal[1] - elbowLocal[1]];

const easeOutQuad = (t) => t * (2 - t);

const Avatar = ({ position = [0, 0, 0] }) => {
    const groupRef = useRef();
    const idleRef = useRef();
    const armPivotRef = useRef();
    const { camera } = useThree();

    const dodgeX = useRef(0);
    const targetDodgeX = useRef(0);
    const worldPosVec = useRef(new THREE.Vector3());

    const [bodyTex, armTex] = useTexture([
        '/textures/corridor/avatar_src/body.png',
        '/textures/corridor/avatar_src/arm.png',
    ]);
    useMemo(() => {
        [bodyTex, armTex].forEach((t) => { if (t) t.colorSpace = THREE.SRGBColorSpace; });
    }, [bodyTex, armTex]);

    useFrame((state) => {
        if (!groupRef.current) return;
        const time = state.clock.elapsedTime;

        // === DODGE (step aside as camera approaches) ===
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

        // === IDLE breathing bob + tiny sway ===
        if (idleRef.current) {
            idleRef.current.position.y = Math.sin(time * 1.4) * 0.015;
            idleRef.current.rotation.z = Math.sin(time * 0.9) * 0.004;
        }
        // === CONTINUOUS FRIENDLY WAVE (forearm pivots at the elbow) ===
        if (armPivotRef.current) {
            armPivotRef.current.rotation.z = Math.sin(time * 6.5) * 0.14;
        }
    });

    return (
        <group ref={groupRef} position={position}>
            <group ref={idleRef}>
                {/* Body (forearm removed) */}
                <mesh>
                    <planeGeometry args={[FULL_W, FULL_H]} />
                    <meshBasicMaterial map={bodyTex} color="#ffffff" transparent side={THREE.DoubleSide} depthWrite={false} />
                </mesh>
                {/* Forearm + hand, pivoting at the elbow */}
                <group ref={armPivotRef} position={[elbowLocal[0], elbowLocal[1], 0.01]}>
                    <mesh position={[armOffset[0], armOffset[1], 0]}>
                        <planeGeometry args={[ARM_W, ARM_H]} />
                        <meshBasicMaterial map={armTex} color="#ffffff" transparent side={THREE.DoubleSide} depthWrite={false} />
                    </mesh>
                </group>
            </group>
        </group>
    );
};

export default Avatar;
