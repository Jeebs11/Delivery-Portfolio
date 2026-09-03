import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useScene } from '../../../../context/SceneContext';
import { PROGRAMMES } from '../../../../config/content';

/**
 * ShowcaseWall — the Portfolio room, reimagined as a cinematic wall of live project
 * screens. Six real project dashboards glow in a concave 3x2 video-wall grid; each
 * gently floats, lifts + captions on hover, and opens a case-study overlay on click.
 * Replaces the old falling-monitor tower (which showed the forked author's content).
 *
 * --- TUNABLES (positions are done blind; expect to nudge these on Vercel) ---
 */
const R = 7;            // arc radius (distance of the wall from its focal point)
const CZ = -16;         // focal point Z (screens sit ~CZ + R in front of it)
const CY = 0.15;        // focal point Y (eye level-ish)
const COL_DEG = 15;     // horizontal angle between columns (concave curve)
const ROWS = [0.72, -0.52]; // top / bottom row Y offsets
const SCREEN_W = 1.7;
const SCREEN_H = SCREEN_W / 2; // project images are 2:1

const PROJECTS = PROGRAMMES.slice(0, 6);
const COLS = [-COL_DEG, 0, COL_DEG].map((d) => THREE.MathUtils.degToRad(d));

// grid slots: 3 columns x 2 rows -> 6, mapped to the 6 projects in order
const SLOTS = PROJECTS.map((p, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const a = COLS[col];
    return {
        project: p,
        x: R * Math.sin(a),
        y: CY + ROWS[row],
        z: CZ + R * Math.cos(a),
        rotY: -a,
        phase: i * 1.1,
    };
});

function Screen({ slot, tex, onOpen }) {
    const groupRef = useRef();
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.elapsedTime;
        const bob = Math.sin(t * 0.6 + slot.phase) * 0.04;
        groupRef.current.position.y = slot.y + bob;
        const s = hovered ? 1.14 : 1;
        groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, s, 0.16);
        groupRef.current.scale.y = groupRef.current.scale.x;
        groupRef.current.scale.z = groupRef.current.scale.x;
    });

    return (
        <group ref={groupRef} position={[slot.x, slot.y, slot.z]} rotation={[0, slot.rotY, 0]}>
            {/* bezel / glowing backing */}
            <mesh position={[0, 0, -0.03]}>
                <planeGeometry args={[SCREEN_W + 0.14, SCREEN_H + 0.14]} />
                <meshBasicMaterial color={hovered ? '#2b5c9e' : '#141414'} toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
            {/* the live project screen (unlit -> glows like a real display) */}
            <mesh
                onClick={(e) => { e.stopPropagation(); onOpen(slot.project); }}
                onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
                onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
            >
                <planeGeometry args={[SCREEN_W, SCREEN_H]} />
                <meshBasicMaterial map={tex} toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
            {/* caption on hover */}
            {hovered && (
                <Text
                    position={[0, -SCREEN_H / 2 - 0.16, 0.06]}
                    fontSize={0.088}
                    color="#f4f0e7"
                    anchorX="center"
                    anchorY="top"
                    maxWidth={SCREEN_W * 1.5}
                    textAlign="center"
                    outlineWidth={0.008}
                    outlineColor="#1a1a1a"
                >
                    {slot.project.title}
                </Text>
            )}
        </group>
    );
}

export default function ShowcaseWall({ showRoom, onReady, isWarmup }) {
    const { openOverlay } = useScene();
    const textures = useTexture(PROJECTS.map((p) => p.image));
    const readyFired = useRef(false);

    useMemo(() => {
        (Array.isArray(textures) ? textures : [textures]).forEach((t) => { if (t) t.colorSpace = THREE.SRGBColorSpace; });
    }, [textures]);

    useEffect(() => {
        if (showRoom && !isWarmup && !readyFired.current) {
            readyFired.current = true;
            onReady?.();
        }
    }, [showRoom, isWarmup, onReady]);

    const onOpen = (p) => openOverlay({
        title: p.title,
        description: p.description,
        url: p.url,
        image: p.image,
        platform: 'project',
        platformConfig: { label: 'PROJECT', color: '#2b5c9e' },
    });

    if (!showRoom) return null;

    return (
        <group>
            {SLOTS.map((slot, i) => (
                <Screen key={slot.project.title} slot={slot} tex={textures[i]} onOpen={onOpen} />
            ))}
        </group>
    );
}
