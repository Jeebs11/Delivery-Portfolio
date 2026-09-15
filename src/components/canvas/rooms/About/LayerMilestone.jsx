import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';

/**
 * LayerMilestone — one "layer" of the About journey (Mujeeb at work / Beyond
 * work / Achievements). Renders an optional title + subtitle, a caption and a
 * cluster of transparent image planes at fixed local positions. Uses the same
 * scroll / visibility mechanic as the original milestones so the paper plane
 * flies through each layer in turn.
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
            {config.subtitle && (
                <Text position={[0, 4.4, 0.2]} fontSize={0.42} color="#666666" anchorX="center" anchorY="middle" font={CABIN}>
                    {config.subtitle}
                </Text>
            )}
            {config.items.map((item, i) => {
                const tex = textures[i];
                const aspect = tex?.image ? tex.image.width / tex.image.height : 1;
                const w = item.w;
                const h = item.h || w / aspect;
                return (
                    <mesh key={i} ref={(el) => (itemRefs.current[i] = el)} position={item.pos} rotation={item.rot || [0, 0, 0]} scale={item.scale || 1}>
                        <planeGeometry args={[w, h]} />
                        <meshBasicMaterial map={tex} color="#ffffff" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
                    </mesh>
                );
            })}
            {config.caption && (
                <Text position={[0, -5.2, 0.2]} fontSize={0.42} color="#555555" anchorX="center" anchorY="middle" font={CABIN} maxWidth={12} textAlign="center">
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
        // Titles/captions are baked AoT-styled text images, added as items.
        items: [
            { src: `${L}/l1-wordmark.webp?v=2`, pos: [0, 4.0, -0.6], w: 6.2 },
            { src: `${L}/l1-character.webp?v=2`, pos: [0, 0.7, 0], w: 1.5 },
            // job titles stacked directly under the man (Transformation Lead removed)
            { src: `${L}/l1-role-1.webp`, pos: [0, -2.1, 0.2], w: 2.8 },
            { src: `${L}/l1-role-2.webp`, pos: [0, -2.85, 0.2], w: 2.8 },
            { src: `${L}/t-l1-caption.webp`, pos: [0, -4.5, 0.2], w: 6.0 },
            { src: `${L}/l1-roadmap.webp?v=2`, pos: [-5.2, 2.6, 0], w: 2.7 },
            { src: `${L}/l1-gantt.webp?v=2`, pos: [5.2, 2.6, 0], w: 2.7 },
            { src: `${L}/l1-stakeholder.webp?v=2`, pos: [-5.7, 0.2, 0], w: 2.7 },
            { src: `${L}/l1-workflow.webp?v=2`, pos: [5.7, 0.2, 0], w: 2.7 },
            { src: `${L}/l1-framework.webp?v=2`, pos: [-5.0, -2.4, 0], w: 3.0 },
        ],
    },
    {
        id: 'beyond',
        items: [
            { src: `${L}/t-l2-title.webp`, pos: [0, 5.1, 0.2], w: 7.0 },
            // family island as the centrepiece
            { src: `${L}/l2-family.webp?v=2`, pos: [0, 0.6, 0.3], w: 3.0 },
            // the four sports as separate coloured islands, well spaced around the family
            { src: `${L}/l2-soccer.webp?v=3`, pos: [-4.7, 0.4, 0], w: 2.5 },
            { src: `${L}/l2-football.webp?v=3`, pos: [4.5, 0.8, 0], w: 2.9 },
            { src: `${L}/l2-basketball.webp?v=3`, pos: [-3.8, -2.6, 0], w: 2.7 },
            { src: `${L}/l2-golf.webp?v=3`, pos: [4.3, -2.5, 0], w: 2.6 },
            // corners: cycling + travel
            { src: `${L}/l2-cycling.webp?v=2`, pos: [-5.8, 3.1, 0], w: 2.7 },
            { src: `${L}/l2-travel.webp?v=2`, pos: [5.8, 3.1, 0], w: 2.5 },
            { src: `${L}/t-l2-caption.webp`, pos: [0, -5.0, 0.2], w: 6.5 },
        ],
    },
    {
        id: 'achievements',
        items: [
            { src: `${L}/t-l3-title.webp`, pos: [0, 5.2, 0.2], w: 7.5 },
            { src: `${L}/t-l3-sub.webp`, pos: [0, 3.9, 0.2], w: 6.0 },
            // cloud platform the certificates + trophy sit on
            { src: `${L}/l3-cloud.webp?v=2`, pos: [-3.2, -1.0, -0.6], w: 7.6 },
            // certificates fanned in an arc around the trophy, resting on the cloud
            { src: `${L}/l3-cert-prince2.webp?v=2`, pos: [-5.5, 0.15, -0.1], w: 1.5, rot: [0, 0, 0.22] },
            { src: `${L}/l3-cert-psm1.webp?v=2`, pos: [-4.15, 0.55, -0.05], w: 1.5, rot: [0, 0, 0.09] },
            { src: `${L}/l3-cert-psm2.webp?v=2`, pos: [-2.55, 0.55, -0.05], w: 1.5, rot: [0, 0, -0.09] },
            { src: `${L}/l3-cert-pmp.webp?v=2`, pos: [-1.2, 0.15, -0.1], w: 1.5, rot: [0, 0, -0.22] },
            // trophy front-and-centre on the cloud, nested inside the arc
            { src: `${L}/l3-trophy.webp?v=2`, pos: [-3.35, -0.9, 0.2], w: 1.5 },
            // measurable-impact stat clouds (text baked in)
            { src: `${L}/l3-stat-years.webp?v=2`, pos: [3.0, 2.3, 0], w: 2.6 },
            { src: `${L}/l3-stat-reporting.webp?v=2`, pos: [5.2, 1.0, 0], w: 2.7 },
            { src: `${L}/l3-stat-portfolio.webp?v=2`, pos: [2.8, -0.4, 0], w: 2.6 },
            { src: `${L}/l3-stat-processes.webp?v=2`, pos: [5.0, -1.9, 0], w: 2.7 },
            { src: `${L}/t-l3-caption.webp`, pos: [0, -5.0, 0.2], w: 6.5 },
        ],
    },
];

export default LayerMilestone;
