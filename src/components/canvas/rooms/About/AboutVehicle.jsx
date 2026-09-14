import { useState, useEffect, useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// The three ride options that replace the paper plane in the About room.
// Each is a flat sprite billboarded in the airplane group (so it banks/pitches
// with the flight maneuvers, exactly like the old paper plane did).
export const ABOUT_VEHICLES = [
    { id: 'glider', label: 'Glider', src: '/textures/about/vehicle-glider.webp', aspect: 1.78, w: 3.4, y: 0.0 },
    { id: 'soldier', label: 'Scout', src: '/textures/about/vehicle-soldier.webp', aspect: 1.12, w: 2.6, y: 0.1 },
    { id: 'airship', label: 'Airship', src: '/textures/about/vehicle-airship.webp', aspect: 0.74, w: 2.3, y: 0.2 },
];

const STORAGE_KEY = 'aboutVehicle';

export const readVehicleIndex = () => {
    try {
        const v = parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10);
        return Number.isFinite(v) && v >= 0 && v < ABOUT_VEHICLES.length ? v : 0;
    } catch { return 0; }
};

export const setVehicleIndex = (i) => {
    try { localStorage.setItem(STORAGE_KEY, String(i)); } catch { /* ignore */ }
    window.dispatchEvent(new CustomEvent('about-vehicle-change', { detail: i }));
};

export default function AboutVehicle() {
    const textures = useTexture(ABOUT_VEHICLES.map((v) => v.src));
    useMemo(() => { textures.forEach((t) => { if (t) t.colorSpace = THREE.SRGBColorSpace; }); }, [textures]);

    const [idx, setIdx] = useState(readVehicleIndex);
    useEffect(() => {
        const onChange = (e) => setIdx(typeof e.detail === 'number' ? e.detail : readVehicleIndex());
        window.addEventListener('about-vehicle-change', onChange);
        return () => window.removeEventListener('about-vehicle-change', onChange);
    }, []);

    const v = ABOUT_VEHICLES[idx] || ABOUT_VEHICLES[0];
    const tex = textures[idx] || textures[0];
    const h = v.w / v.aspect;

    return (
        <mesh position={[0, v.y, 0]}>
            <planeGeometry args={[v.w, h]} />
            <meshBasicMaterial
                map={tex}
                transparent
                alphaTest={0.08}
                side={THREE.DoubleSide}
                depthWrite={false}
            />
        </mesh>
    );
}
