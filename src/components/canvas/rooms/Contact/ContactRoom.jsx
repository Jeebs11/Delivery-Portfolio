import { useEffect } from 'react';

/**
 * ContactRoom — the visible experience is now the ContactShowcase DOM overlay
 * (the One Piece "Let's Connect" scene), shown while in this room. In-canvas we
 * only need a calm backdrop behind it and to signal the room is ready.
 */
export default function ContactRoom({ showRoom, onReady }) {
    useEffect(() => { if (showRoom) onReady?.(); }, [showRoom, onReady]);
    return (
        <mesh position={[0, 0, -9]}>
            <planeGeometry args={[60, 40]} />
            <meshBasicMaterial color="#0e2230" />
        </mesh>
    );
}
