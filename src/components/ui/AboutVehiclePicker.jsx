import { useState, useEffect } from 'react';
import { useScene } from '../../context/SceneContext';
import { ABOUT_VEHICLES, readVehicleIndex, setVehicleIndex } from '../canvas/rooms/About/AboutVehicle';

/**
 * Small DOM chooser that lets the visitor pick which ride they fly on in the
 * About room (glider / scout / airship). Only visible while in the About room.
 * Rendered OUTSIDE .navigation-ui so its clicks aren't swallowed by that
 * wrapper's pointer-events trap.
 */
export default function AboutVehiclePicker() {
    const { currentRoom } = useScene();
    const [idx, setIdx] = useState(readVehicleIndex);

    // keep in sync if changed elsewhere (e.g. another tab / initial load)
    useEffect(() => {
        const onChange = (e) => setIdx(typeof e.detail === 'number' ? e.detail : readVehicleIndex());
        window.addEventListener('about-vehicle-change', onChange);
        return () => window.removeEventListener('about-vehicle-change', onChange);
    }, []);

    if (currentRoom !== 'about') return null;

    const pick = (i) => { setIdx(i); setVehicleIndex(i); };

    return (
        <div
            style={{
                position: 'fixed',
                top: '18px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 200,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                pointerEvents: 'auto',
                fontFamily: "'Caveat', 'Comic Sans MS', cursive",
            }}
        >
            <span style={{ color: '#4a4a4a', fontSize: '18px', fontWeight: 700, marginRight: '2px' }}>Ride:</span>
            {ABOUT_VEHICLES.map((v, i) => (
                <button
                    key={v.id}
                    onClick={() => pick(i)}
                    style={{
                        cursor: 'pointer',
                        padding: '6px 14px',
                        fontSize: '16px',
                        fontWeight: 700,
                        fontFamily: 'inherit',
                        color: i === idx ? '#faf6ec' : '#3a3a3a',
                        background: i === idx ? '#3a3a3a' : 'rgba(255,255,255,0.85)',
                        border: '2px solid #3a3a3a',
                        borderRadius: '10px',
                        boxShadow: '2px 2px 0 rgba(0,0,0,0.15)',
                        transition: 'background 0.15s, color 0.15s',
                    }}
                >
                    {v.label}
                </button>
            ))}
        </div>
    );
}
