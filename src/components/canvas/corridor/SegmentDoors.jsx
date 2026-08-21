import { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture, PositionalAudio } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useAudio } from '../../../context/AudioManager';
import { useScene } from '../../../context/SceneContext';

const EXIT_LINKEDIN_URL = 'https://www.linkedin.com/in/mujeeb-lawal-b381032a';

// Global settings for automatic segment doors audio
const SEGMENT_DOOR_AUDIO_SETTINGS = {
    openVolume: 0.15, // Volume for "otwarciedrzwi"
    closeVolume: 0.15,// Volume for "zamknieciedrzwi"
    distance: 4,      // Reference distance for spatial audio
    rolloff: 2,       // Dropoff factor
    closeDelay: 0.5   // Seconds to wait before playing close sound
};

/**
 * SegmentDoors Component
 * 
 * Textured double doors at the end of a corridor segment.
 * Copies the visual style of EntranceDoors 1:1 but with auto-opening logic.
 */
const SegmentDoors = ({
    position = [0, 0, 0],
    corridorHeight = 3.5,
    corridorWidth = 7,
    isExit = false
}) => {
    const leftDoorRef = useRef();
    const rightDoorRef = useRef();
    const leftHandleRef = useRef();
    const rightHandleRef = useRef();
    const isOpenRef = useRef(false);
    const passedRef = useRef(false); // guards the walk-through -> landing trigger

    // Audio Refs for 3D positional sound
    const openAudioRef = useRef();
    const closeAudioRef = useRef();
    const closeAudioTimeoutRef = useRef(null);

    const { camera } = useThree();
    const { globalVolume, isMuted } = useAudio();
    const { returnToEntrance } = useScene();

    // Load textures
    // Note: User provided specific filenames in corridor/doors/
    const frameTexture = useTexture('/textures/corridor/doors/frame_sketch_wood.webp');
    const doorLeftTexture = useTexture('/textures/corridor/doors/doorrleft.webp');
    const doorRightTexture = useTexture('/textures/corridor/doors/dorright.webp');
    const doorPlainTexture = useTexture('/textures/corridor/doors/backsingledoors_wood.webp'); // no ∞, for the exit doors
    const handleLeftTexture = useTexture('/textures/corridor/doors/handle_left_sketch.webp');
    const handleRightTexture = useTexture('/textures/corridor/doors/handle_right_sketch.webp');
    const doorBackTexture = useTexture('/textures/corridor/doors/door_back_wood.webp');
    const edgeTexture = useTexture('/textures/corridor/doors/pien_wood.webp');
    const wallTexture = useTexture('/textures/corridor/nc_wall.webp');

    wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;

    // Baseboard texture (1582x94 px)
    const baseboardTexSrc = useTexture('/textures/corridor/nc_rail.webp');
    const NATURAL_TILE_W = (1582 / 94) * 0.15; // ~2.524 units per natural tile

    // --- Dimensions from EntranceDoors ---
    // Door dimensions - calculated from legacy texture proportions (332x848 = 0.391)
    const doorHeight = 2.4;
    const doorWidth = doorHeight * 0.391;
    const doorOpeningWidth = doorWidth * 2;
    const wallThickness = 0.12;

    // Frame dimensions from legacy texture (718x877 = 0.818)
    const frameWidth = doorOpeningWidth + 0.16;
    const frameHeight = frameWidth * (1 / 0.818);

    // Floor is at Y = -corridorHeight/2 = -1.75
    const floorY = -corridorHeight / 2;
    const doorBottomY = floorY;
    const doorCenterY = doorBottomY + doorHeight / 2;
    const frameCenterY = doorBottomY + frameHeight / 2;

    const wallCenterY = floorY + corridorHeight / 2;
    const topWallHeight = corridorHeight - doorHeight;
    const topWallCenterY = doorBottomY + doorHeight + topWallHeight / 2;
    const sideWallWidth = (corridorWidth - doorOpeningWidth) / 2;

    // Trigger distances
    const openDistance = 12;
    const closeDistance = 18; // Close when far enough away (behind or front?) 
    // Actually, distinct logic: open when close, close when far.
    // The previous logic was: if (dist < open) open; if (dist > close) close.

    useFrame(() => {
        if (!leftDoorRef.current || !rightDoorRef.current) return;

        // Simple distance check to the door's Z position combined with X bounds.
        // During normal corridor scrolling, camera X is bounded by parallax to [-0.3, 0.3].
        // When entering a room (like Contact), camera X moves > 1.2
        const distanceZ = Math.abs(camera.position.z - position[2]);
        const distanceX = Math.abs(camera.position.x - position[0]);

        if (distanceZ < openDistance && distanceX < 0.8 && !isOpenRef.current) {
            isOpenRef.current = true;

            // Clear any pending close audio timeout
            if (closeAudioTimeoutRef.current) clearTimeout(closeAudioTimeoutRef.current);

            if (openAudioRef.current) {
                const vol = isMuted ? 0 : SEGMENT_DOOR_AUDIO_SETTINGS.openVolume * globalVolume;
                openAudioRef.current.setVolume(vol);
                if (openAudioRef.current.isPlaying) openAudioRef.current.stop();
                openAudioRef.current.play();
            }

            // Animate Handles
            if (leftHandleRef.current) {
                gsap.to(leftHandleRef.current.rotation, { z: 0.4, duration: 0.15, ease: 'power2.out' });
            }
            if (rightHandleRef.current) {
                gsap.to(rightHandleRef.current.rotation, { z: -0.4, duration: 0.15, ease: 'power2.out' });
            }

            // Open Doors
            gsap.to(leftDoorRef.current.rotation, { y: -Math.PI * 0.55, duration: 0.9, ease: 'power2.out', delay: 0.1 });
            gsap.to(rightDoorRef.current.rotation, { y: Math.PI * 0.55, duration: 0.9, ease: 'power2.out', delay: 0.1 });
        }

        // Close if user moves away in Z, OR if they move away in X (like flying sideways into a room)
        if ((distanceZ > closeDistance || distanceX > 1.5) && isOpenRef.current) {
            isOpenRef.current = false;

            if (closeAudioRef.current) {
                closeAudioTimeoutRef.current = setTimeout(() => {
                    const vol = isMuted ? 0 : SEGMENT_DOOR_AUDIO_SETTINGS.closeVolume * globalVolume;
                    if (closeAudioRef.current) {
                        closeAudioRef.current.setVolume(vol);
                        if (closeAudioRef.current.isPlaying) closeAudioRef.current.stop();
                        closeAudioRef.current.play();
                    }
                }, SEGMENT_DOOR_AUDIO_SETTINGS.closeDelay * 1000);
            }

            // Close Doors
            gsap.to(leftDoorRef.current.rotation, { y: 0, duration: 0.7, ease: 'power2.in' });
            gsap.to(rightDoorRef.current.rotation, { y: 0, duration: 0.7, ease: 'power2.in' });

            // Reset Handles
            if (leftHandleRef.current) {
                gsap.to(leftHandleRef.current.rotation, { z: 0, duration: 0.2, ease: 'power2.out', delay: 0.5 });
            }
            if (rightHandleRef.current) {
                gsap.to(rightHandleRef.current.rotation, { z: 0, duration: 0.2, ease: 'power2.out', delay: 0.5 });
            }
        }

        // Exit doors: walking through (past the doorway) returns to the landing.
        if (isExit) {
            if (!passedRef.current && camera.position.z < position[2] - 0.6 && distanceX < 1.2) {
                passedRef.current = true;
                returnToEntrance();
            }
            if (camera.position.z > 0) passedRef.current = false; // re-arm after returning
        }
    });

    // Wall Decorations (loop version)
    const whileTrueTexture = useTexture('/textures/corridor/decorations/while_true_loop.webp');
    const coffeeTexture = useTexture('/textures/corridor/decorations/coffee_debug.webp');
    const ideaTexture = useTexture('/textures/corridor/decorations/idea_process.webp');

    // Exit-wall decorations (only used when isExit)
    const thankyouTex = useTexture('/textures/exit/exit_thankyou.webp');
    const planTex = useTexture('/textures/exit/exit_plan.webp');
    const enhanceTex = useTexture('/textures/exit/exit_enhance.webp');
    const leadTex = useTexture('/textures/exit/exit_lead.webp');
    const talkTex = useTexture('/textures/exit/exit_talk.webp');
    const signTex = useTexture('/textures/exit/exit_sign.webp');
    const plantTex = useTexture('/textures/exit/exit_plant.webp');

    return (
        <group position={[position[0], 0, position[2]]}>
            {/* === LEFT WALL PANEL (Brainstorming) === */}
            <mesh position={[-(doorOpeningWidth / 2 + sideWallWidth / 2), wallCenterY, 0]}>
                <boxGeometry args={[sideWallWidth, corridorHeight, wallThickness]} />
                <meshBasicMaterial color="#e0e0e0" map={wallTexture} roughness={0.95} />
            </mesh>
            {/* Decoration Left (Idea Process) */}
            {/* 
                EDYCJA GRAFIKI LEWEJ (Idea):
                - rotation={[x, y, z]} -> Obrót (np. z = 0.1 to lekki przechył)
                - args={[Szerokość, Wysokość]} -> Rozmiar
            */}
            {!isExit && (
                <mesh
                    position={[-(doorOpeningWidth / 2 + sideWallWidth / 2), wallCenterY, 0.07]}
                    rotation={[0, 0, 0.05]}
                >
                    <planeGeometry args={[1.2, 1.2 / 0.402]} />
                    <meshBasicMaterial color="#e0e0e0"
                        map={ideaTexture}
                        transparent={true}
                        roughness={0.9}
                        alphaTest={0.1}
                    />
                </mesh>
            )}
            {/* EXIT: PLAN / ENHANCE / LEAD panels stacked on the left wall */}
            {isExit && (() => {
                const lx = -(doorOpeningWidth / 2 + sideWallWidth / 2);
                const panels = [
                    { tex: planTex, y: 1.05, a: 1.48 },
                    { tex: enhanceTex, y: 0.0, a: 1.525 },
                    { tex: leadTex, y: -1.05, a: 1.48 },
                ];
                const w = 1.55;
                return panels.map((p, i) => (
                    <mesh key={i} position={[lx, p.y, 0.07]}>
                        <planeGeometry args={[w, w / p.a]} />
                        <meshBasicMaterial map={p.tex} color="#ffffff" transparent alphaTest={0.05} depthWrite={false} />
                    </mesh>
                ));
            })()}

            {/* === RIGHT WALL PANEL (Coffee & Bug) === */}
            <mesh position={[(doorOpeningWidth / 2 + sideWallWidth / 2), wallCenterY, 0]}>
                <boxGeometry args={[sideWallWidth, corridorHeight, wallThickness]} />
                <meshBasicMaterial color="#e0e0e0" map={wallTexture} roughness={0.95} />
            </mesh>
            {/* Decoration Right (Coffee) */}
            {/* 
                EDYCJA GRAFIKI PRAWEJ (Coffee):
            */}
            {!isExit && (
                <mesh
                    position={[(doorOpeningWidth / 2 + sideWallWidth / 2), wallCenterY, 0.08]}
                    rotation={[0, 0, -0.05]}
                >
                    <planeGeometry args={[2.2, 2.2 / 1.833]} />
                    <meshBasicMaterial color="#e0e0e0"
                        map={coffeeTexture}
                        transparent={true}
                        roughness={0.9}
                        alphaTest={0.1}
                    />
                </mesh>
            )}
            {/* EXIT: "Good work" sign + plant on the right wall */}
            {isExit && (() => {
                const rx = (doorOpeningWidth / 2 + sideWallWidth / 2);
                return (
                    <group>
                        <mesh position={[rx, 0.6, 0.07]}>
                            <planeGeometry args={[1.3, 1.3 / 0.917]} />
                            <meshBasicMaterial map={signTex} color="#ffffff" transparent alphaTest={0.05} depthWrite={false} />
                        </mesh>
                        {/* plant standing on the floor, in front of the wall, under the sign */}
                        <mesh position={[rx - 0.15, -1.03, 0.5]}>
                            <planeGeometry args={[0.98, 0.98 / 0.67]} />
                            <meshBasicMaterial map={plantTex} color="#ffffff" transparent alphaTest={0.05} depthWrite={false} />
                        </mesh>
                    </group>
                );
            })()}

            {/* === TOP WALL PANEL (While True) === */}
            <mesh position={[0, topWallCenterY, 0]}>
                <boxGeometry args={[doorOpeningWidth, topWallHeight, wallThickness]} />
                <meshBasicMaterial color="#e0e0e0" map={wallTexture} roughness={0.95} />
            </mesh>
            {/* Decoration Top (While True) */}
            {!isExit && (
                <mesh position={[0, topWallCenterY, 0.07]}>
                    <planeGeometry args={[1.4, 1.4 / 1.833]} />
                    <meshBasicMaterial color="#e0e0e0"
                        map={whileTrueTexture}
                        transparent={true}
                        roughness={0.9}
                        alphaTest={0.1}
                    />
                </mesh>
            )}
            {/* EXIT: "Thank you for visiting" above the doors */}
            {isExit && (
                <mesh position={[0, topWallCenterY, 0.07]}>
                    <planeGeometry args={[1.85, 1.85 / 3.636]} />
                    <meshBasicMaterial map={thankyouTex} color="#ffffff" transparent alphaTest={0.05} depthWrite={false} />
                </mesh>
            )}
            {/* EXIT: "Let's talk" panel revealed through the open doorway + LinkedIn hotspot */}
            {isExit && (
                <group>
                    {/* cream backdrop so the doorway doesn't open onto the void */}
                    <mesh position={[0, doorCenterY, -0.6]}>
                        <planeGeometry args={[doorOpeningWidth + 0.3, doorHeight + 0.2]} />
                        <meshBasicMaterial color="#f4f0e7" />
                    </mesh>
                    {/* Let's talk / Connect on LinkedIn art */}
                    <mesh position={[0, doorCenterY + 0.35, -0.45]}>
                        <planeGeometry args={[1.55, 1.55 / 1.01]} />
                        <meshBasicMaterial map={talkTex} color="#ffffff" transparent alphaTest={0.05} depthWrite={false} />
                    </mesh>
                    {/* clickable LinkedIn hotspot over the baked button */}
                    <mesh
                        position={[0, doorCenterY + 0.05, -0.43]}
                        onClick={(e) => { e.stopPropagation(); window.open(EXIT_LINKEDIN_URL, '_blank', 'noopener'); }}
                        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
                        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
                    >
                        <planeGeometry args={[0.95, 0.18]} />
                        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                    </mesh>
                </group>
            )}

            {/* === TEXTURED FRAME === */}
            {/* Moved to Z = 0.09 to sit in front of baseboards (Z=0.07), hiding the hole edges */}
            <mesh position={[0, frameCenterY, 0.09]}>
                <planeGeometry args={[frameWidth, frameHeight]} />
                <meshBasicMaterial color="#e0e0e0"
                    map={frameTexture}
                    transparent={true}
                    alphaTest={0.1}
                    roughness={0.9}
                    depthWrite={false}
                />
            </mesh>

            {/* === LEFT DOOR === */}
            <group ref={leftDoorRef} position={[-doorWidth, doorCenterY, 0]}>
                {/* Solid 3D Door Body with edge texture */}
                <mesh position={[doorWidth / 2, 0, 0.06]}>
                    <boxGeometry args={[doorWidth, doorHeight, 0.04]} />
                    <meshBasicMaterial color="#e0e0e0" map={edgeTexture} roughness={0.9} />
                </mesh>

                {/* Front Texture Face */}
                <mesh position={[doorWidth / 2, 0, 0.09]}>
                    <planeGeometry args={[doorWidth, doorHeight]} />
                    <meshBasicMaterial color="#e0e0e0"
                        map={isExit ? doorPlainTexture : doorLeftTexture}
                        transparent={true}
                        alphaTest={0.5}
                        roughness={0.8}
                    />
                </mesh>

                {/* Back Texture Face (mirrored) */}
                <mesh position={[doorWidth / 2, 0, 0.03]} rotation={[0, Math.PI, 0]} scale={[-1, 1, 1]}>
                    <planeGeometry args={[doorWidth, doorHeight]} />
                    <meshBasicMaterial color="#e0e0e0"
                        map={doorBackTexture}
                        transparent={true}
                        alphaTest={0.5}
                        roughness={0.8}
                        side={2}
                    />
                </mesh>

                {/* Handle Layer */}
                <group ref={leftHandleRef} position={[doorWidth / 2 + 0.357, -0.099, 0.10]}>
                    <mesh position={[-0.357, 0.099, 0]}>
                        <planeGeometry args={[doorWidth, doorHeight]} />
                        <meshBasicMaterial color="#e0e0e0"
                            map={handleLeftTexture}
                            transparent={true}
                            alphaTest={0.5}
                            depthWrite={false}
                        />
                    </mesh>
                </group>
            </group>

            {/* === RIGHT DOOR === */}
            <group ref={rightDoorRef} position={[doorWidth, doorCenterY, 0]}>
                {/* Solid 3D Door Body with edge texture */}
                <mesh position={[-doorWidth / 2, 0, 0.06]}>
                    <boxGeometry args={[doorWidth, doorHeight, 0.04]} />
                    <meshBasicMaterial color="#e0e0e0" map={edgeTexture} roughness={0.9} />
                </mesh>

                {/* Front Texture Face */}
                <mesh position={[-doorWidth / 2, 0, 0.09]}>
                    <planeGeometry args={[doorWidth, doorHeight]} />
                    <meshBasicMaterial color="#e0e0e0"
                        map={isExit ? doorPlainTexture : doorRightTexture}
                        transparent={true}
                        alphaTest={0.5}
                        roughness={0.8}
                    />
                </mesh>

                {/* Back Texture Face */}
                <mesh position={[-doorWidth / 2, 0, 0.03]} rotation={[0, Math.PI, 0]}>
                    <planeGeometry args={[doorWidth, doorHeight]} />
                    <meshBasicMaterial color="#e0e0e0"
                        map={doorBackTexture}
                        transparent={true}
                        alphaTest={0.5}
                        roughness={0.8}
                    />
                </mesh>

                {/* Handle Layer */}
                <group ref={rightHandleRef} position={[-doorWidth / 2 - 0.357, -0.099, 0.10]}>
                    <mesh position={[0.357, 0.099, 0]}>
                        <planeGeometry args={[doorWidth, doorHeight]} />
                        <meshBasicMaterial color="#e0e0e0"
                            map={handleRightTexture}
                            transparent={true}
                            alphaTest={0.5}
                            depthWrite={false}
                        />
                    </mesh>
                </group>
            </group>

            {/* Warm lighting for the door area - WYLACZONE */}
            {/* <pointLight
                position={[0, doorBottomY + doorHeight * 0.5, 1]}
                intensity={0.6}
                color="#fff8e8"
                distance={6}
                decay={2}
            /> */}
            {/* === THRESHOLD STRIPE (Próg przy drzwiach) === */}
            {(() => {
                // =============================================
                // REGULACJA PROGU PRZY DRZWIACH KOŃCOWYCH
                // =============================================
                // THRESHOLD_DEPTH  → grubość progu (wzdłuż Z korytarza)
                // THRESHOLD_WIDTH  → szerokość progu (wzdłuż X korytarza)
                const THRESHOLD_DEPTH = 0.15;
                const THRESHOLD_WIDTH = frameWidth + 0.1;

                const threshTex = baseboardTexSrc.clone();
                threshTex.needsUpdate = true;
                threshTex.wrapS = threshTex.wrapT = THREE.RepeatWrapping;
                threshTex.rotation = 0; // Brak rotacji - tekstura idzie wzdłuż X
                threshTex.offset.set(0, 0);
                // Naturalny kafelek: 1582x94px przy wysokości 0.15 → szerokość ~2.524 units
                // Dla progu: powtarzamy wzdłuż X (szerokość), 1 raz wzdłuż Z (głębokość)
                threshTex.repeat.set(THRESHOLD_WIDTH / NATURAL_TILE_W, 1);

                return (
                    <mesh
                        position={[0, floorY + 0.005, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                    >
                        <planeGeometry args={[THRESHOLD_WIDTH, THRESHOLD_DEPTH]} />
                        <meshBasicMaterial color="#e0e0e0"
                            map={threshTex}
                            roughness={0.9}
                            metalness={0}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                );
            })()}
            {/* === BASEBOARD (Listwa) LEFT SIDE === */}
            {(() => {
                const bbTex = baseboardTexSrc.clone();
                bbTex.wrapS = bbTex.wrapT = THREE.RepeatWrapping;
                bbTex.rotation = 0;
                bbTex.offset.set(0, 0);
                bbTex.needsUpdate = true;
                bbTex.repeat.set(sideWallWidth / NATURAL_TILE_W, 1);
                return (
                    <mesh position={[-(doorOpeningWidth / 2 + sideWallWidth / 2), floorY + 0.075, wallThickness / 2 + 0.01]}>
                        <planeGeometry args={[sideWallWidth, 0.15]} />
                        <meshBasicMaterial color="#e0e0e0" map={bbTex} roughness={0.8} side={THREE.DoubleSide} />
                    </mesh>
                );
            })()}

            {/* === BASEBOARD (Listwa) RIGHT SIDE === */}
            {(() => {
                const bbTex = baseboardTexSrc.clone();
                bbTex.wrapS = bbTex.wrapT = THREE.RepeatWrapping;
                bbTex.rotation = 0;
                bbTex.offset.set(0, 0);
                bbTex.needsUpdate = true;
                bbTex.repeat.set(sideWallWidth / NATURAL_TILE_W, 1);
                return (
                    <mesh position={[(doorOpeningWidth / 2 + sideWallWidth / 2), floorY + 0.075, wallThickness / 2 + 0.01]}>
                        <planeGeometry args={[sideWallWidth, 0.15]} />
                        <meshBasicMaterial color="#e0e0e0" map={bbTex} roughness={0.8} side={THREE.DoubleSide} />
                    </mesh>
                );
            })()}

            {/* SPATIAL AUDIO NODES */}
            <PositionalAudio
                ref={openAudioRef}
                url="/sounds/otwarciedrzwi.mp3"
                distanceModel="exponential"
                rolloffFactor={SEGMENT_DOOR_AUDIO_SETTINGS.rolloff}
                refDistance={SEGMENT_DOOR_AUDIO_SETTINGS.distance}
                loop={false}
            />
            <PositionalAudio
                ref={closeAudioRef}
                url="/sounds/zamknieciedrzwi.mp3"
                distanceModel="exponential"
                rolloffFactor={SEGMENT_DOOR_AUDIO_SETTINGS.rolloff}
                refDistance={SEGMENT_DOOR_AUDIO_SETTINGS.distance}
                loop={false}
            />
        </group>
    );
};

export default SegmentDoors;
