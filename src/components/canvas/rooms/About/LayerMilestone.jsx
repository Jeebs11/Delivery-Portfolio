import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';

/**
 * LayerMilestone — one "layer" of the About journey (Mujeeb at work / Beyond
 * work / What drives me). Renders a title, a caption and a cluster of
 * transparent image planes at fixed local positions. Uses the same scroll /
 * visibility mechanic as the original milestones so the paper plane flies
 * through each layer in turn.
 */
const ROOM_Z = -25;
const CLIP_Z = -8.0;
const CABIN = '/fonts/CabinSketch-Bold.ttf';
const RUBIK = '/fonts/RubikScribble-Regular.ttf';

const LayerMilestone = ({ z, scrollProgressRef, config }) => {
    const groupRef = useRef();
    const itemRefs = useRef([]);

    const srcs = useMemo(() => config.items.map((i) => i.src), [config]);
    const textures = useTexture(srcs);
    useMemo(() => { textures.forEach((t) => { if (t) t.colorSpace = THREE.SRGBColorSpace; }); }, [textures]);

    useFrame(() => {
        if (!groupRef.current) return;
        const sp = scrollProgressRef?.current || 0;
        const worldZ = ROOM_Z + sp + z;
        groupRef.current.visible = worldZ < CLIP_Z;

        // Fade in as the layer approaches, out as it nears the clip plane.
        const fade = THREE.MathUtils.clamp((worldZ + 75) / 35, 0, 1) * THREE.MathUtils.clamp((CLIP_Z - worldZ - 3) / 14, 0, 1);
        itemRefs.current.forEach((m) => {
            if (m && m.material) { m.material.opacity = fade; m.material.transparent = true; }
        });
    });

    return (
        <group ref={groupRef} position={[0, 0, z]}>
            {config.title && (
                <Text position={[0, 5.4, 0.2]} fontSize={0.9} color="#1a1a1a" anchorX="center" anchorY="middle" font={RUBIK}>
                    {config.title}
                </Text>
            )}
            {config.items.map((item, i) => {
                const tex = textures[i];
                const aspect = tex?.image ? tex.image.width / tex.image.height : 1;
                const w = item.w;
                const h = item.h || w / aspect;
                return (
                    <mesh key={i} ref={(el) => (itemRefs.current[i] = el)} position={item.pos} scale={item.scale || 1}>
                        <planeGeometry args={[w, h]} />
                        <meshBasicMaterial map={tex} color="#ffffff" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
                    </mesh>
                );
            })}
            {config.caption && (
                <Text position={[0, -5.2, 0.2]} fontSize={0.42} color="#555555" anchorX="center" anchorY="middle" font={CABIN} maxWidth={11} textAlign="center">
                    {config.caption}
                </Text>
            )}
        </group>
    );
};

// ---------------------------------------------------------------------------
// Layer content (positions are local to the layer plane; camera faces -z)
// ---------------------------------------------------------------------------
const L = '/textures/about/layers';

export const ABOUT_LAYERS = [
    {
        id: 'work',
        title: 'MUJEEB AT WORK',
        caption: '"Turning messy work into structured delivery."',
        items: [
            { src: `${L}/l1-wordmark.webp`, pos: [0, 2.3, -0.6], w: 6.2 },
            { src: `${L}/l1-character.webp`, pos: [0, -0.2, 0], w: 1.7 },
            { src: `${L}/l1-subtitle.webp`, pos: [0, -3.1, 0.1], w: 3.6 },
            { src: `${L}/l1-roadmap.webp`, pos: [-5.2, 2.6, 0], w: 2.7 },
            { src: `${L}/l1-gantt.webp`, pos: [5.2, 2.6, 0], w: 2.7 },
            { src: `${L}/l1-stakeholder.webp`, pos: [-5.7, 0.2, 0], w: 2.7 },
            { src: `${L}/l1-workflow.webp`, pos: [5.7, 0.2, 0], w: 2.7 },
            { src: `${L}/l1-framework.webp`, pos: [-5.0, -2.4, 0], w: 3.0 },
        ],
    },
    {
        id: 'beyond',
        title: 'BEYOND WORK',
        caption: 'Travel, sport, curiosity.',
        items: [
            { src: `${L}/l2-sports.webp`, pos: [0, 0.2, 0], w: 7.5 },
            { src: `${L}/l2-cycling.webp`, pos: [-5.5, 2.8, 0], w: 3.4 },
            { src: `${L}/l2-travel.webp`, pos: [5.3, 2.8, 0], w: 3.2 },
        ],
    },
    {
        id: 'drives',
        title: 'WHAT DRIVES ME',
        caption: 'Ideas, systems, side projects.',
        items: [
            { src: `${L}/l3-book.webp`, pos: [-1.5, 2.6, 0], w: 4.4 },
            { src: `${L}/l3-bulb.webp`, pos: [3.6, 3.4, 0], w: 1.4 },
            { src: `${L}/l3-portfolio.webp`, pos: [-5.2, 0.2, 0], w: 2.3 },
            { src: `${L}/l3-productivity.webp`, pos: [-2.6, -0.6, 0], w: 2.3 },
            { src: `${L}/l3-learning.webp`, pos: [0.2, -0.9, 0], w: 2.3 },
            { src: `${L}/l3-bot.webp`, pos: [4.4, -1.0, 0], w: 4.6 },
        ],
    },
];

export default LayerMilestone;
