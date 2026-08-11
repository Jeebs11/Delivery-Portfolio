import { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useScene } from '../../../context/SceneContext';
import { playBackgroundMusic } from '../../../utils/audioManager';

/**
 * LandingScene — the "MUJEEB HQ" outdoor landing. A layered 3D scene built from
 * the deconstructed storybook elements. Three doors (About Me / Career / Side
 * Projects) fly you straight into their rooms; clouds drift and the paper plane
 * flies for a touch of life.
 *
 * Coordinate system: the scene lives on a plane ~6 units in front of the camera
 * (group at z=22, camera at z=28, fov 60 -> visible ~12.4 x 7.75). Element
 * layout is expressed in normalised mockup coords (nx, ny in [0,1], origin
 * top-left) and mapped into scene space here.
 */
const L = '/textures/entrance/landing';

// scene frame — sized so the full height fits inside the camera view (visible
// height at z=22 is ~6.9), with the width bleeding past the sides on wide screens.
const W = 9.76;
const H = 6.1;
const CAM_Y = 0.2;

// normalised mockup coords -> scene position + size
const place = (nx, ny, wfrac, aspect, z) => {
    const w = wfrac * W;
    const h = w / aspect;
    const x = (nx - 0.5) * W;
    const y = CAM_Y + (0.5 - ny) * H;
    return { pos: [x, y, z], w, h };
};

const ASPECT = {
    door_about: 0.557, door_career: 0.463, door_sideprojects: 0.495,
    tree: 0.693, signpost: 0.474, bike: 1.435, plane: 1.592,
    cloud_sm: 2.577, cloud_md: 2.295, cloud_lg: 1.843, wall: 1.778,
    vines: 1.503, lamp: 0.474, plants_right: 1.818, plants_left: 1.923,
    rock: 1.397, valuebar: 11.873, wordmark: 4.858, subtitle: 15.909,
    intro: 1.935, pickdoor: 10.112,
};

// static / simple decor: [name, nx, ny, wfrac, z]
const DECOR = [
    ['wall', 0.50, 0.66, 0.62, -0.7],
    ['tree', 0.095, 0.26, 0.20, -0.35],
    ['vines', 0.85, 0.44, 0.15, -0.5],
    ['lamp', 0.20, 0.55, 0.03, -0.45],
    ['lamp', 0.80, 0.50, 0.03, -0.45],
    ['signpost', 0.075, 0.64, 0.09, -0.2],
    ['bike', 0.15, 0.80, 0.14, 0.05],
    ['plants_left', 0.05, 0.87, 0.13, 0.1],
    ['plants_right', 0.88, 0.85, 0.11, 0.1],
    ['rock', 0.92, 0.85, 0.11, 0.12],
    ['wordmark', 0.50, 0.06, 0.30, 0.5],
    ['subtitle', 0.50, 0.13, 0.42, 0.5],
    ['intro', 0.515, 0.238, 0.235, 0.5],
    ['pickdoor', 0.49, 0.37, 0.20, 0.5],
    ['valuebar', 0.50, 0.885, 0.72, 0.5],
];

const DOORS = [
    { name: 'door_about', room: 'about', nx: 0.265, ny: 0.65, wfrac: 0.11 },
    { name: 'door_career', room: 'gallery', nx: 0.50, ny: 0.655, wfrac: 0.11 },
    { name: 'door_sideprojects', room: 'studio', nx: 0.735, ny: 0.65, wfrac: 0.11 },
];

const CLOUDS = [
    { name: 'cloud_lg', nx: 0.15, ny: 0.10, wfrac: 0.15, speed: 0.06 },
    { name: 'cloud_md', nx: 0.87, ny: 0.075, wfrac: 0.13, speed: -0.05 },
    { name: 'cloud_sm', nx: 0.32, ny: 0.05, wfrac: 0.09, speed: 0.08 },
];

const RUBIK = '/fonts/RubikScribble-Regular.ttf';

function Img({ src, pos, w, h, z, color = '#ffffff', ...rest }) {
    const tex = useTexture(src);
    useMemo(() => { if (tex) tex.colorSpace = THREE.SRGBColorSpace; }, [tex]);
    return (
        <mesh position={pos} raycast={() => null} {...rest}>
            <planeGeometry args={[w, h]} />
            <meshBasicMaterial map={tex} color={color} transparent side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
    );
}

function Door({ def, onEnter }) {
    const meshRef = useRef();
    const matRef = useRef();
    const [hovered, setHovered] = useState(false);
    const tex = useTexture(`${L}/${def.name}.webp`);
    useMemo(() => { if (tex) tex.colorSpace = THREE.SRGBColorSpace; }, [tex]);
    const { pos, w, h } = place(def.nx, def.ny, def.wfrac, ASPECT[def.name], -0.4);

    const hover = (on) => {
        setHovered(on);
        document.body.style.cursor = on ? 'pointer' : 'auto';
        if (meshRef.current) gsap.to(meshRef.current.scale, { x: on ? 1.05 : 1, y: on ? 1.05 : 1, duration: 0.3, ease: 'power2.out' });
        if (matRef.current) gsap.to(matRef.current.color, { r: on ? 1 : 0.86, g: on ? 1 : 0.86, b: on ? 1 : 0.86, duration: 0.3 });
    };

    const click = (e) => {
        e.stopPropagation();
        document.body.style.cursor = 'auto';
        if (meshRef.current) {
            gsap.timeline({ onComplete: () => onEnter(def.room) })
                .to(meshRef.current.scale, { x: 1.12, y: 1.12, duration: 0.18, ease: 'power2.out' })
                .to(meshRef.current.scale, { x: 1.0, y: 1.0, duration: 0.14, ease: 'power2.in' });
        } else onEnter(def.room);
    };

    return (
        <mesh
            ref={meshRef}
            position={pos}
            onPointerOver={(e) => { e.stopPropagation(); hover(true); }}
            onPointerOut={() => hover(false)}
            onClick={click}
        >
            <planeGeometry args={[w, h]} />
            <meshBasicMaterial ref={matRef} map={tex} color="#dbdbdb" transparent side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
    );
}

function Cloud({ def }) {
    const ref = useRef();
    const tex = useTexture(`${L}/${def.name}.webp`);
    useMemo(() => { if (tex) tex.colorSpace = THREE.SRGBColorSpace; }, [tex]);
    const { pos, w, h } = place(def.nx, def.ny, def.wfrac, ASPECT[def.name], -0.9);
    const baseX = pos[0];
    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime;
        ref.current.position.x = baseX + Math.sin(t * def.speed) * 0.6;
    });
    return (
        <mesh ref={ref} position={pos} raycast={() => null}>
            <planeGeometry args={[w, h]} />
            <meshBasicMaterial map={tex} color="#ffffff" transparent side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
    );
}

function Plane() {
    const ref = useRef();
    const tex = useTexture(`${L}/plane.webp`);
    useMemo(() => { if (tex) tex.colorSpace = THREE.SRGBColorSpace; }, [tex]);
    const { pos, w, h } = place(0.87, 0.175, 0.075, ASPECT.plane, 0.6);
    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime * 0.5;
        ref.current.position.x = pos[0] + Math.sin(t) * 0.5;
        ref.current.position.y = pos[1] + Math.cos(t * 0.9) * 0.28;
        ref.current.rotation.z = -0.12 + Math.sin(t) * 0.08;
    });
    return (
        <mesh ref={ref} position={pos} raycast={() => null}>
            <planeGeometry args={[w, h]} />
            <meshBasicMaterial map={tex} color="#ffffff" transparent side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
    );
}

const LandingScene = ({ position = [0, 0, 22] }) => {
    const { markEntered, teleportTo } = useScene();

    const enter = (room) => {
        try { playBackgroundMusic?.(); } catch (e) { /* noop */ }
        markEntered();
        setTimeout(() => teleportTo(room), 350);
    };

    return (
        <group position={position}>
            {/* cream backdrop */}
            <mesh position={[0, CAM_Y, -1.2]} raycast={() => null}>
                <planeGeometry args={[W * 1.25, H * 1.25]} />
                <meshBasicMaterial color="#f3efe6" side={THREE.DoubleSide} depthWrite={false} />
            </mesh>

            {CLOUDS.map((c, i) => <Cloud key={`cloud-${i}`} def={c} />)}

            {DECOR.map(([name, nx, ny, wfrac, z], i) => {
                const p = place(nx, ny, wfrac, ASPECT[name], z);
                return <Img key={`${name}-${i}`} src={`${L}/${name}.webp`} pos={p.pos} w={p.w} h={p.h} />;
            })}

            {/* MUJEEB HQ sign (rendered text — no baked asset) */}
            {(() => { const p = place(0.50, 0.43, 0.19, 4.2, -0.45); return (
                <group position={p.pos}>
                    <Text position={[0, 0, 0.05]} fontSize={0.26} color="#3a3a3a" anchorX="center" anchorY="middle" font={RUBIK}>
                        MUJEEB HQ
                    </Text>
                </group>
            ); })()}

            {DOORS.map((d) => <Door key={d.room} def={d} onEnter={enter} />)}

            <Plane />
        </group>
    );
};

export default LandingScene;
