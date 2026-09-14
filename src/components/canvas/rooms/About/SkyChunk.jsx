import { useMemo, useRef } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * SkyChunk Component
 * 
 * A single repeatable segment of sky with clouds.
 * Hard world-space clipping - no camera-relative fade.
 */
const CHUNK_LENGTH = 40;
const CHUNK_WIDTH = 20;
const CHUNK_HEIGHT = 12;

// === TWARDA LINIA ZANIKANIA (WORLD SPACE) ===
// Pokój About jest na Z = -25 (group position w AboutRoom.jsx)
// Wszystko z world Z > CORRIDOR_CLIP_Z jest NATYCHMIAST niewidoczne
const CORRIDOR_CLIP_Z = -8.0;

// Pozycja pokoju w world space (hardcoded, bo AboutRoom ma position=[0,0,-25])
const ROOM_Z = -25;

// Available cloud textures — About-room specific (Attack-on-Titan painterly
// clouds). Kept separate from the shared /textures/clouds set so the Career
// room's clouds are unaffected.
const L = '/textures/about/layers';
const CLOUD_TEXTURES = [
    `${L}/x-cloud-1.webp`,
    `${L}/x-cloud-2.webp`,
    `${L}/x-cloud-3.webp`,
    `${L}/x-cloud-4.webp`,
    `${L}/x-cloud-5.webp`,
    `${L}/x-cloud-6.webp`,
    `${L}/x-cloud-7.webp`,
];

const SkyChunk = ({ chunkIndex = 0, seed = 0, scrollProgressRef }) => {
    const zOffset = -(chunkIndex * CHUNK_LENGTH) - 15;

    const clouds = useMemo(() => {
        const items = [];
        const random = seededRandom(seed + chunkIndex * 1000);
        const cloudCount = 15 + Math.floor(random() * 8); // Significantly more clouds

        for (let i = 0; i < cloudCount; i++) {
            const x = (random() - 0.5) * CHUNK_WIDTH;
            const y = (random() - 0.5) * CHUNK_HEIGHT;
            const z = zOffset - (random() * CHUNK_LENGTH);

            items.push({
                id: `${chunkIndex}-${i}`,
                position: [x, y, z],
                scale: 0.8 + random() * 1.5,
                baseOpacity: 0.5 + random() * 0.4,
                textureIndex: Math.floor(random() * CLOUD_TEXTURES.length),
                // Animation properties - unique per cloud
                driftSpeed: 0.3 + random() * 0.4,  // How fast it sways
                driftAmount: 0.5 + random() * 1.0, // How far it sways (X)
                bobAmount: 0.1 + random() * 0.2,   // Vertical bob amount
                timeOffset: random() * Math.PI * 2, // Phase offset so clouds don't sync
            });
        }

        return items;
    }, [chunkIndex, seed, zOffset]);

    return (
        <group>
            {clouds.map((cloud) => (
                <Cloud
                    key={cloud.id}
                    position={cloud.position}
                    scale={cloud.scale}
                    baseOpacity={cloud.baseOpacity}
                    textureIndex={cloud.textureIndex}
                    driftSpeed={cloud.driftSpeed}
                    driftAmount={cloud.driftAmount}
                    bobAmount={cloud.bobAmount}
                    timeOffset={cloud.timeOffset}
                    scrollProgressRef={scrollProgressRef}
                />
            ))}
        </group>
    );
};

// Cloud with hard world-space clipping + drift animation
const Cloud = ({
    position,
    scale,
    baseOpacity,
    textureIndex,
    driftSpeed = 0.5,
    driftAmount = 0.8,
    bobAmount = 0.15,
    timeOffset = 0,
    scrollProgressRef
}) => {
    const meshRef = useRef();
    const materialRef = useRef();
    const { camera } = useThree();

    // Store base position for animation
    const basePosition = useRef(position);

    // Load the specific cloud texture
    const texture = useLoader(THREE.TextureLoader, CLOUD_TEXTURES[textureIndex]);

    // Aspect ratios of the redesigned AoT clouds (prevents stretching).
    const legacyCloudAspects = {
        'x-cloud-1.webp': 1.88,
        'x-cloud-2.webp': 1.86,
        'x-cloud-3.webp': 2.08,
        'x-cloud-4.webp': 1.57,
        'x-cloud-5.webp': 1.95,
        'x-cloud-6.webp': 1.94,
        'x-cloud-7.webp': 1.62,
    };

    const cloudFile = CLOUD_TEXTURES[textureIndex].split('/').pop().split('?')[0];
    const aspectRatio = legacyCloudAspects[cloudFile] || 1.8; // Default to common ratio
    const width = 3 * scale;
    const height = width / aspectRatio;

    useFrame((state) => {
        if (!meshRef.current) return;

        const time = state.clock.elapsedTime;

        // === TWARDA LINIA CLIP (RĘCZNE OBLICZENIE WORLD Z) ===
        // worldZ = pokój(-25) + scrollProgress + lokalna pozycja chmury
        // NIE używamy getWorldPosition() bo useFrame dzieci odpala się PRZED rodzicem!
        const scrollProgress = scrollProgressRef?.current || 0;
        const cloudLocalZ = basePosition.current[2];
        const worldZ = ROOM_Z + scrollProgress + cloudLocalZ;

        // === CLOUD EVASION EFFECT ===
        // As clouds get closer to the camera, they move aside to keep the center clear
        const evasionStart = -60;
        const evasionEnd = -10;
        let evasionFactor = 0;

        if (worldZ > evasionStart && worldZ < evasionEnd) {
            evasionFactor = (worldZ - evasionStart) / (evasionEnd - evasionStart);
            // Smoothstep for natural ease in and out
            evasionFactor = evasionFactor * evasionFactor * (3 - 2 * evasionFactor);
        } else if (worldZ >= evasionEnd) {
            evasionFactor = 1;
        }

        // Push left/right based on initial X position to open up the middle
        const dirX = basePosition.current[0] >= 0 ? 1 : -1;
        const maxEvasion = 15;
        const evasionX = evasionFactor * maxEvasion * dirX;

        // === DRIFT ANIMATION ===
        const driftX = Math.sin(time * driftSpeed + timeOffset) * driftAmount;
        const driftY = Math.sin(time * driftSpeed * 0.7 + timeOffset + 1.5) * bobAmount;

        // Apply drift and evasion to position
        meshRef.current.position.x = basePosition.current[0] + driftX + evasionX;
        meshRef.current.position.y = basePosition.current[1] + driftY;
        meshRef.current.position.z = basePosition.current[2];

        // Jeśli chmura jest za linią clipu → natychmiast niewidoczna
        if (materialRef.current) {
            materialRef.current.opacity = worldZ > CORRIDOR_CLIP_Z ? 0 : baseOpacity;
        }

        // Billboard effect - always face camera, turned 90° left
        const offsetRotation = new THREE.Euler(0, -Math.PI / 3, 0);
        const offsetQuaternion = new THREE.Quaternion().setFromEuler(offsetRotation);
        meshRef.current.quaternion.copy(camera.quaternion).multiply(offsetQuaternion);
    });

    return (
        <mesh ref={meshRef} position={position}>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial color="#e0e0e0"
                ref={materialRef}
                map={texture}
                transparent
                opacity={baseOpacity}
                depthWrite={false}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};

function seededRandom(seed) {
    let s = seed;
    return function () {
        s = Math.sin(s * 9999) * 10000;
        return s - Math.floor(s);
    };
}

export { CHUNK_LENGTH, CORRIDOR_CLIP_Z, ROOM_Z };
export default SkyChunk;
