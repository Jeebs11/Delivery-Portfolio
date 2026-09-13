import { useEffect } from 'react';

/**
 * StudioBackdrop — the Portfolio room's in-canvas content is just a dark plane.
 * The real experience is the CinemaShowcase DOM layer (shown while in this room),
 * so here we only need a dark backdrop behind it and to signal the room is ready.
 */
export default function StudioBackdrop({ showRoom, onReady }) {
    useEffect(() => { if (showRoom) onReady?.(); }, [showRoom, onReady]);
    return (
        <mesh position={[0, 0, -9]}>
            <planeGeometry args={[44, 32]} />
            <meshBasicMaterial color="#0a0a0c" />
        </mesh>
    );
}
