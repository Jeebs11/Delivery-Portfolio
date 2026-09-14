import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

/**
 * SkyBackdrop — the far AoT sky/walls painting behind the whole About journey.
 * fog is disabled so the cream scene fog can't wash it out at this distance.
 * It parallax-drifts sideways with the scroll so, together with the clouds
 * streaming past in front, it reads as flying through the sky.
 */
const BG_ASPECT = 1672 / 941; // 1.78

export default function SkyBackdrop({ scrollProgressRef }) {
    const tex = useTexture('/textures/about/sky-bg.webp');
    tex.colorSpace = THREE.SRGBColorSpace;

    const ref = useRef();
    const height = 150;
    const width = height * BG_ASPECT; // ~267

    useFrame((state) => {
        if (!ref.current) return;
        const sp = scrollProgressRef?.current || 0;
        // Horizontal parallax tied to scroll (clamped so the big plane never
        // shows an edge), plus a slow idle sway so it always feels alive.
        const parallax = THREE.MathUtils.clamp(-sp * 0.05, -55, 55);
        const idle = Math.sin(state.clock.elapsedTime * 0.05) * 4;
        ref.current.position.x = parallax + idle;
    });

    return (
        <mesh ref={ref} position={[0, 4, -140]}>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial map={tex} fog={false} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
    );
}
