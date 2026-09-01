import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

/**
 * CorridorLife — the "bring it to life" layer for the corridor:
 *   - <Sway> : a gentle breeze wobble wrapper for billboards
 *   - <DustMotes> : slow warm motes drifting in the air
 *   - scattered potted trees + a chest of drawers down the walk
 * All positions are relative to the segment's zOffset (corridor runs down -z).
 */

// Soft round sprite for the dust motes (radial alpha), generated once.
function makeMoteTexture() {
    const s = 64;
    const cv = document.createElement('canvas');
    cv.width = cv.height = s;
    const ctx = cv.getContext('2d');
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(255,244,222,1)');
    g.addColorStop(0.4, 'rgba(255,240,210,0.5)');
    g.addColorStop(1, 'rgba(255,240,210,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

export function Sway({ children, amplitude = 0.025, speed = 1, phase = 0, ...props }) {
    const ref = useRef();
    useFrame((state) => {
        if (ref.current) {
            const t = state.clock.elapsedTime;
            ref.current.rotation.z = Math.sin(t * speed + phase) * amplitude;
        }
    });
    return <group ref={ref} {...props}>{children}</group>;
}

function DustMotes({ zStart, zEnd, wallX, floorY, ceilingY, count = 80 }) {
    const pointsRef = useRef();
    const spriteTex = useMemo(() => makeMoteTexture(), []);

    const { positions, speeds } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const speeds = new Float32Array(count * 2); // [riseSpeed, swayPhase]
        const zLen = Math.abs(zEnd - zStart);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() * 2 - 1) * (wallX - 0.4);
            positions[i * 3 + 1] = floorY + Math.random() * (ceilingY - floorY);
            positions[i * 3 + 2] = zStart - Math.random() * zLen;
            speeds[i * 2] = 0.05 + Math.random() * 0.12;
            speeds[i * 2 + 1] = Math.random() * Math.PI * 2;
        }
        return { positions, speeds };
    }, [count, zStart, zEnd, wallX, floorY, ceilingY]);

    useFrame((state, delta) => {
        const geo = pointsRef.current?.geometry;
        if (!geo) return;
        const arr = geo.attributes.position.array;
        const t = state.clock.elapsedTime;
        const top = ceilingY - 0.1;
        for (let i = 0; i < count; i++) {
            arr[i * 3 + 1] += speeds[i * 2] * delta;              // drift up
            arr[i * 3] += Math.sin(t * 0.5 + speeds[i * 2 + 1]) * 0.0025; // gentle sway
            if (arr[i * 3 + 1] > top) arr[i * 3 + 1] = floorY + 0.1; // wrap to floor
        }
        geo.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial
                map={spriteTex}
                size={0.09}
                sizeAttenuation
                transparent
                opacity={0.5}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
            />
        </points>
    );
}

// Billboard plane grounded on the floor, optionally swaying.
function Prop({ texture, z, side, width, aspect, floorY, wallX, sway = false, phase = 0 }) {
    const height = width / aspect;
    const x = side === 'left' ? -wallX + 0.7 : wallX - 0.7;
    const rotY = side === 'left' ? Math.PI / 4 : -Math.PI / 4;
    const mesh = (
        <mesh position={[0, height / 2, 0]} rotation={[0, rotY, 0]}>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial map={texture} transparent alphaTest={0.1} side={THREE.DoubleSide} />
        </mesh>
    );
    return (
        <group position={[x, floorY, z]}>
            {sway ? <Sway phase={phase} amplitude={0.02}>{mesh}</Sway> : mesh}
        </group>
    );
}

export default function CorridorLife({ zOffset, wallX, floorY, ceilingY }) {
    const treeTex = useTexture('/textures/corridor/nc_tree.webp');
    const dresserTex = useTexture('/textures/corridor/nc_dresser.webp');
    const seedlingTex = useTexture('/textures/corridor/nc_seedling.webp');

    // Extra props scattered down the walk. z is relative to zOffset (corridor runs -z).
    // Kept clear of the existing tree (~-58 left) and table (~-35 left).
    const scatter = [
        { type: 'tree', z: -22, side: 'right', phase: 0.0 },
    ];

    return (
        <group>
            {scatter.map((s, i) => {
                if (s.type === 'tree') {
                    return (
                        <Prop key={i} texture={treeTex} z={zOffset + s.z} side={s.side}
                            width={1.6} aspect={0.585} floorY={floorY} wallX={wallX} sway phase={s.phase} />
                    );
                }
                // dresser + a little seedling on top
                const dW = 1.2, dAspect = 0.930, dH = dW / dAspect;
                const dx = s.side === 'left' ? -wallX + 0.7 : wallX - 0.7;
                const rotY = s.side === 'left' ? Math.PI / 4 : -Math.PI / 4;
                return (
                    <group key={i} position={[dx, floorY, zOffset + s.z]} rotation={[0, rotY, 0]}>
                        <mesh position={[0, dH / 2, 0]}>
                            <planeGeometry args={[dW, dH]} />
                            <meshBasicMaterial map={dresserTex} transparent alphaTest={0.1} side={THREE.DoubleSide} />
                        </mesh>
                        <Sway phase={s.phase} amplitude={0.02}>
                            <mesh position={[0, dH + 0.30, 0.05]}>
                                <planeGeometry args={[0.34, 0.34 / 0.554]} />
                                <meshBasicMaterial map={seedlingTex} transparent alphaTest={0.1} side={THREE.DoubleSide} />
                            </mesh>
                        </Sway>
                    </group>
                );
            })}
        </group>
    );
}
