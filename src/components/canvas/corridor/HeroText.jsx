import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

/**
 * HeroText — the drawn MUJEEB wordmark + the role subtitle
 * ("Project Manager – Programme Manager – Transformation Lead"), rendered as
 * clean image planes with a gentle float. Sits behind the character.
 */
const HeroText = ({ position = [0, 0.3, 0] }) => {
    const groupRef = useRef();
    const wordmarkRef = useRef();
    const subtitleRef = useRef();

    const [scale, setScale] = useState(1);
    useEffect(() => {
        const update = () => {
            const w = window.innerWidth;
            const t = (Math.max(320, Math.min(1200, w)) - 320) / (1200 - 320);
            setScale(0.7 + t * 0.3); // 0.7 → 1.0
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    const [wordmark, subtitle] = useTexture([
        '/textures/corridor/avatar_src/wordmark.png',
        '/textures/corridor/avatar_src/subtitle.png',
    ]);
    useEffect(() => {
        [wordmark, subtitle].forEach((t) => { if (t) t.colorSpace = THREE.SRGBColorSpace; });
    }, [wordmark, subtitle]);

    // sizes from asset aspect (realistic wordmark 1300x279, subtitle 1400x88)
    const WM_W = 4.0, WM_H = WM_W * (279 / 1300);
    const ST_W = 3.1, ST_H = ST_W * (88 / 1400);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (wordmarkRef.current) wordmarkRef.current.position.y = 0.4 + Math.sin(t * 0.6) * 0.02;
        if (subtitleRef.current) subtitleRef.current.position.y = -0.62 + Math.sin(t * 0.6 + 1) * 0.015;
    });

    return (
        <group ref={groupRef} position={position} scale={[scale, scale, 1]}>
            {/* MUJEEB wordmark (behind the character) */}
            <mesh ref={wordmarkRef} position={[0, 0.4, 0]}>
                <planeGeometry args={[WM_W, WM_H]} />
                <meshBasicMaterial map={wordmark} color="#ffffff" transparent side={THREE.DoubleSide} depthWrite={false} />
            </mesh>

            {/* Role subtitle (below the character, slightly forward) */}
            <mesh ref={subtitleRef} position={[0, -0.62, 0.3]}>
                <planeGeometry args={[ST_W, ST_H]} />
                <meshBasicMaterial map={subtitle} color="#ffffff" transparent side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
        </group>
    );
};

export default HeroText;
