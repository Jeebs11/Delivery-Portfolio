import { useState, useEffect } from 'react';
import { useScene } from '../../context/SceneContext';

/**
 * ExitPage — the flat 2D "Thank you for visiting / Let's talk" scene shown at
 * the end of the corridor. Walking through the open door returns you to the
 * landing; the LinkedIn button opens Mujeeb's profile.
 */
const BG = '/textures/exit/exit_bg.webp';
const LINKEDIN_URL = 'https://www.linkedin.com/in/mujeeb-lawal-b381032a';

const ExitPage = () => {
    const { exitReached, returnToEntrance } = useScene();
    const [leaving, setLeaving] = useState(false);

    // Reset the fade when the scene is dismissed so it re-shows cleanly.
    useEffect(() => { if (!exitReached) setLeaving(false); }, [exitReached]);

    if (!exitReached) return null;

    const walkThrough = () => {
        if (leaving) return;
        setLeaving(true);
        setTimeout(() => returnToEntrance(), 650); // fade, then back to the landing
    };

    return (
        <div className={`exit-scene${leaving ? ' leaving' : ''}`}>
            <div className="exit-stage">
                <img className="exit-bg" src={BG} alt="Thank you for visiting — let's talk. Connect on LinkedIn." draggable="false" />

                {/* Walk through the open doorway -> back to the landing */}
                <button className="exit-door" type="button" onClick={walkThrough} aria-label="Walk through the door back to the entrance" />

                {/* Connect on LinkedIn — hotspot over the baked button (on top of the doorway) */}
                <a
                    className="exit-linkedin"
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Connect on LinkedIn"
                    title="Connect on LinkedIn"
                />
            </div>

            <style>{`
                .exit-scene {
                    position: fixed; inset: 0; z-index: 9995;
                    background: #f4f0e7;
                    display: flex; align-items: center; justify-content: center;
                    overflow: hidden;
                    animation: exitFade .7s ease both;
                }
                .exit-scene.leaving { animation: exitLeave .65s ease both; }
                @keyframes exitFade { from { opacity: 0; } to { opacity: 1; } }
                @keyframes exitLeave { from { opacity: 1; } to { opacity: 0; } }
                .exit-stage {
                    position: relative;
                    width: min(100vw, calc(100vh * 1.3333));
                    aspect-ratio: 4 / 3;
                }
                .exit-bg {
                    position: absolute; inset: 0; width: 100%; height: 100%;
                    object-fit: contain; display: block;
                    user-select: none; -webkit-user-drag: none;
                }
                /* the doorway = "walk through" to the landing */
                .exit-door {
                    position: absolute; left: 37.5%; top: 22%; width: 25%; height: 56%;
                    padding: 0; border: 0; background: transparent; cursor: pointer;
                    border-radius: 40% 40% 4% 4%;
                    transition: background .3s ease, box-shadow .3s ease;
                }
                .exit-door:hover, .exit-door:focus-visible {
                    outline: none;
                    background: radial-gradient(ellipse at 50% 55%, rgba(255,240,190,.22), rgba(255,240,190,0) 70%);
                    box-shadow: inset 0 0 40px rgba(255,220,150,.30);
                }
                /* LinkedIn button — sits above the doorway hotspot */
                .exit-linkedin {
                    position: absolute; left: 39%; top: 52.5%; width: 22%; height: 6.5%;
                    border-radius: 8px; cursor: pointer;
                    transition: background .25s ease, box-shadow .25s ease;
                }
                .exit-linkedin:hover, .exit-linkedin:focus-visible {
                    outline: none;
                    background: rgba(40,103,178,.12);
                    box-shadow: 0 0 18px rgba(40,103,178,.28);
                }
            `}</style>
        </div>
    );
};

export default ExitPage;
