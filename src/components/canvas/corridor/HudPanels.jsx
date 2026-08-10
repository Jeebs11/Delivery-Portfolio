import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

/**
 * HudPanels — the PM-tool diagrams from the welcome illustration, extracted as
 * transparent ink sketches and floated around the hero (Roadmap / Stakeholder /
 * Transformation Framework on the left; Gantt / Kanban / RAID on the right;
 * AI Agentic Workflow below). Each gently bobs. Decorative only (no raycast).
 */
const PANELS = [
    { name: 'roadmap', pos: [-2.35, 1.15, -0.35], w: 1.55, rotY: 0.20 },
    { name: 'stakeholder', pos: [-2.55, 0.10, -0.20], w: 1.20, rotY: 0.18 },
    { name: 'framework', pos: [-2.25, -0.95, -0.35], w: 1.55, rotY: 0.20 },
    { name: 'gantt', pos: [2.35, 1.15, -0.35], w: 1.65, rotY: -0.20 },
    { name: 'kanban', pos: [2.55, 0.10, -0.20], w: 1.55, rotY: -0.18 },
    { name: 'raid', pos: [2.25, -0.95, -0.35], w: 1.55, rotY: -0.20 },
    { name: 'workflow', pos: [0.0, -1.45, 0.15], w: 2.05, rotY: 0.0 },
];

const HudPanels = () => {
    const paths = PANELS.map((p) => `/textures/corridor/hud/${p.name}.webp`);
    const textures = useTexture(paths);
    const refs = useRef([]);

    useEffect(() => {
        textures.forEach((t) => { if (t) t.colorSpace = THREE.SRGBColorSpace; });
    }, [textures]);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        refs.current.forEach((m, i) => {
            if (!m) return;
            const ph = i * 1.3;
            m.position.y = PANELS[i].pos[1] + Math.sin(t * 0.5 + ph) * 0.05;
            m.rotation.z = Math.sin(t * 0.4 + ph) * 0.012;
        });
    });

    return (
        <group>
            {PANELS.map((p, i) => {
                const tex = textures[i];
                const aspect = tex?.image ? tex.image.width / tex.image.height : 1.8;
                const h = p.w / aspect;
                return (
                    <mesh
                        key={p.name}
                        ref={(el) => (refs.current[i] = el)}
                        position={p.pos}
                        rotation={[0, p.rotY, 0]}
                        raycast={() => null}
                    >
                        <planeGeometry args={[p.w, h]} />
                        <meshBasicMaterial
                            map={tex}
                            transparent={true}
                            alphaTest={0.08}
                            depthWrite={false}
                            side={THREE.DoubleSide}
                            opacity={0.92}
                        />
                    </mesh>
                );
            })}
        </group>
    );
};

export default HudPanels;
