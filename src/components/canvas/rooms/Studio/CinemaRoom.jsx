import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useScene } from '../../../../context/SceneContext';
import { PROGRAMMES } from '../../../../config/content';

/**
 * CinemaRoom — the Portfolio room as a cinema:
 *   - a big featured screen (left) showing one project,
 *   - a vertical filmstrip of the other projects (right) that auto-scrolls up.
 * As a thumbnail scrolls off the top the featured screen changes to it (auto-play).
 * Hovering the strip pauses the auto-play so you can browse; clicking a thumb
 * selects it as the new feature. Click the big screen to open its live case study.
 *
 * --- TUNABLES (built blind; nudge on Vercel) ---
 */
const MAIN_POS = [-0.95, 0.45, -8.6];
const MAIN_W = 3.3, MAIN_H = MAIN_W / 2;      // project images are 2:1
const STRIP_X = 2.5, STRIP_Z = -8.4;
const THUMB_W = 1.35, THUMB_H = THUMB_W / 2;
const THUMB_GAP = 0.22;
const STRIP_TOP = 1.7, STRIP_BOTTOM = -1.35;  // visible strip band (local Y)
const SCROLL_SPEED = 0.32;                     // units / sec
const AUTO_ADVANCE = true;

const PROJECTS = PROGRAMMES.slice(0, 6);
const N = PROJECTS.length;
const SLOT_H = THUMB_H + THUMB_GAP;
const NUM_SLOTS = Math.ceil((STRIP_TOP - STRIP_BOTTOM) / SLOT_H) + 2; // enough to fill + wrap

export default function CinemaRoom({ showRoom, onReady, isWarmup }) {
    const { openOverlay } = useScene();
    const textures = useTexture(PROJECTS.map((p) => p.image));
    const readyFired = useRef(false);

    const [featured, setFeatured] = useState(0);
    const pausedRef = useRef(false);
    const [, force] = useState(0);

    // main-screen fade transition
    const mainMatRef = useRef();
    const fade = useRef({ progress: 1, pending: null });

    // filmstrip slots
    const slotRefs = useRef([]);
    const slots = useRef(
        Array.from({ length: NUM_SLOTS }, (_, i) => ({
            y: STRIP_TOP - i * SLOT_H,
            proj: i % N,
        }))
    );

    useMemo(() => {
        (Array.isArray(textures) ? textures : [textures]).forEach((t) => { if (t) t.colorSpace = THREE.SRGBColorSpace; });
    }, [textures]);

    useEffect(() => {
        if (showRoom && !isWarmup && !readyFired.current) { readyFired.current = true; onReady?.(); }
    }, [showRoom, isWarmup, onReady]);

    // request a featured change with a fade
    const requestFeature = (idx) => {
        if (idx === featured && fade.current.progress >= 1) return;
        fade.current.pending = idx;
        fade.current.progress = 0; // start fade out
    };

    useFrame((_, delta) => {
        // --- main screen fade ---
        if (mainMatRef.current) {
            const f = fade.current;
            f.progress = Math.min(1, f.progress + delta * 2.2);
            // dip to ~0.12 opacity at the swap point, then back to 1
            const p = f.progress;
            const op = p < 0.5 ? 1 - p * 1.76 : 0.12 + (p - 0.5) * 1.76;
            mainMatRef.current.opacity = Math.max(0.12, Math.min(1, op));
            if (f.pending !== null && p >= 0.5) {
                setFeatured(f.pending);
                f.pending = null;
            }
        }

        // --- filmstrip scroll ---
        if (!pausedRef.current) {
            for (const s of slots.current) {
                s.y += SCROLL_SPEED * delta;
                if (s.y > STRIP_TOP + SLOT_H * 0.5) {
                    // wrapped off the top -> this project becomes the feature (auto-play)
                    s.y -= NUM_SLOTS * SLOT_H;
                    const exiting = s.proj;
                    s.proj = (s.proj + NUM_SLOTS) % N;
                    if (AUTO_ADVANCE) requestFeature(exiting);
                }
            }
            // push positions to meshes
            slots.current.forEach((s, i) => { if (slotRefs.current[i]) slotRefs.current[i].position.y = s.y; });
        }
    });

    if (!showRoom) return null;

    const featuredProj = PROJECTS[featured];
    const featuredTex = textures[featured];

    return (
        <group>
            {/* ===== FEATURED SCREEN ===== */}
            <group position={MAIN_POS}>
                {/* bezel */}
                <mesh position={[0, 0, -0.04]}>
                    <planeGeometry args={[MAIN_W + 0.2, MAIN_H + 0.2]} />
                    <meshBasicMaterial color="#0f0f0f" toneMapped={false} side={THREE.DoubleSide} />
                </mesh>
                <mesh
                    onClick={(e) => {
                        e.stopPropagation();
                        openOverlay({ title: featuredProj.title, description: featuredProj.description, url: featuredProj.url, image: featuredProj.image, platform: 'project', platformConfig: { label: 'PROJECT', color: '#2b5c9e' } });
                    }}
                    onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
                    onPointerOut={() => { document.body.style.cursor = 'auto'; }}
                >
                    <planeGeometry args={[MAIN_W, MAIN_H]} />
                    <meshBasicMaterial ref={mainMatRef} map={featuredTex} transparent toneMapped={false} side={THREE.DoubleSide} />
                </mesh>
                {/* title strip under the screen */}
                <Text position={[0, -MAIN_H / 2 - 0.2, 0.05]} fontSize={0.12} color="#f4f0e7" anchorX="center" anchorY="top" maxWidth={MAIN_W * 1.1} textAlign="center" outlineWidth={0.008} outlineColor="#1a1a1a">
                    {featuredProj.title}
                </Text>
            </group>

            {/* ===== FILMSTRIP ===== */}
            <group
                position={[STRIP_X, 0, STRIP_Z]}
                onPointerOver={() => { pausedRef.current = true; }}
                onPointerOut={() => { pausedRef.current = false; }}
            >
                {slots.current.map((s, i) => (
                    <group key={i} ref={(el) => (slotRefs.current[i] = el)} position={[0, s.y, 0]}>
                        <mesh
                            onClick={(e) => { e.stopPropagation(); requestFeature(slots.current[i].proj); }}
                            onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
                        >
                            <planeGeometry args={[THUMB_W, THUMB_H]} />
                            <meshBasicMaterial map={textures[s.proj]} toneMapped={false} side={THREE.DoubleSide} />
                        </mesh>
                        <mesh position={[0, 0, -0.02]}>
                            <planeGeometry args={[THUMB_W + 0.06, THUMB_H + 0.06]} />
                            <meshBasicMaterial color="#0f0f0f" toneMapped={false} side={THREE.DoubleSide} />
                        </mesh>
                    </group>
                ))}
            </group>
        </group>
    );
}
