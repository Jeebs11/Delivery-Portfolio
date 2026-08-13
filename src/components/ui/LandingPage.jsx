import { useState } from 'react';
import { useScene } from '../../context/SceneContext';

/**
 * LandingPage — flat 2D "MUJEEB HQ" home screen. A single storybook
 * illustration with a few lightweight animated overlays (drifting clouds, a
 * flying paper plane) in the open sky. Clicking the door requests the in-canvas
 * camera fly-through into the corridor.
 */
const BG = '/textures/entrance/home_bg.webp';
const L = '/textures/entrance/landing';

const LandingPage = () => {
    const { hasEntered, requestEntrance } = useScene();
    const [leaving, setLeaving] = useState(false);

    if (hasEntered) return null;

    const enter = () => {
        if (leaving) return;
        setLeaving(true);
        requestEntrance();
    };

    return (
        <div className={`home-landing${leaving ? ' leaving' : ''}`}>
            <div className="home-stage">
                <img className="home-bg" src={BG} alt="Mujeeb — Project Manager, Programme Manager, Transformation Lead" draggable="false" />

                {/* drifting clouds */}
                <img className="home-cloud cloud-1" src={`${L}/cloud_lg.webp`} alt="" aria-hidden="true" />
                <img className="home-cloud cloud-2" src={`${L}/cloud_md.webp`} alt="" aria-hidden="true" />
                <img className="home-cloud cloud-3" src={`${L}/cloud_sm.webp`} alt="" aria-hidden="true" />
                <img className="home-cloud cloud-4" src={`${L}/cloud_sm.webp`} alt="" aria-hidden="true" />

                {/* flying paper plane */}
                <img className="home-plane" src={`${L}/plane.webp`} alt="" aria-hidden="true" />

                {/* door hotspot -> step inside */}
                <button className="home-door" type="button" onClick={enter} aria-label="Step inside to explore" />
            </div>

            <style>{`
                .home-landing {
                    position: fixed; inset: 0; z-index: 9995;
                    background: #f4f0e7;
                    display: flex; align-items: center; justify-content: center;
                    overflow: hidden;
                    opacity: 1; transition: opacity .9s ease;
                }
                .home-landing.leaving { opacity: 0; pointer-events: none; }
                .home-stage {
                    position: relative;
                    width: min(100vw, calc(100vh * 1.7768));
                    aspect-ratio: 1672 / 941;
                }
                .home-bg {
                    position: absolute; inset: 0; width: 100%; height: 100%;
                    object-fit: contain; display: block;
                    user-select: none; -webkit-user-drag: none;
                }
                .home-cloud { position: absolute; pointer-events: none; opacity: .92; }
                .cloud-1 { right: 5%;  top: 4%;  width: 13%; animation: cdrift1 46s ease-in-out infinite alternate; }
                .cloud-2 { right: 15%; top: 31%; width: 11%; animation: cdrift2 57s ease-in-out infinite alternate; }
                .cloud-3 { right: 3%;  top: 17%; width: 8%;  animation: cdrift3 40s ease-in-out infinite alternate; }
                .cloud-4 { left: 20.5%; top: 4%; width: 7%; animation: cdrift1 50s ease-in-out infinite alternate; }
                @keyframes cdrift1 { from { transform: translateX(0); } to { transform: translateX(28px); } }
                @keyframes cdrift2 { from { transform: translateX(0); } to { transform: translateX(-32px); } }
                @keyframes cdrift3 { from { transform: translateX(0); } to { transform: translateX(20px); } }

                .home-plane {
                    position: absolute; width: 5.5%; pointer-events: none;
                    left: 46%; top: 28%; opacity: 0;
                    animation: planeFly 15s ease-in-out infinite;
                }
                @keyframes planeFly {
                    0%   { left: 46%; top: 28%; opacity: 0; transform: rotate(-6deg) scale(.9); }
                    6%   { opacity: 1; }
                    38%  { left: 99%; top: 5%;  opacity: 1; transform: rotate(-16deg) scale(1); }
                    45%  { left: 104%; top: 3%; opacity: 0; transform: rotate(-16deg) scale(1); }
                    100% { left: 104%; top: 3%; opacity: 0; }
                }

                .home-door {
                    position: absolute; left: 44%; top: 39%; width: 12.4%; height: 41%;
                    padding: 0; border: 0; background: transparent; cursor: pointer;
                    border-radius: 48% 48% 6% 6%;
                    transition: background .3s ease, box-shadow .3s ease;
                }
                .home-door:hover, .home-door:focus-visible {
                    outline: none;
                    background: radial-gradient(ellipse at 50% 45%, rgba(255,236,175,.30), rgba(255,236,175,0) 68%);
                    box-shadow: 0 0 22px rgba(255,220,150,.35);
                }
                @media (prefers-reduced-motion: reduce) {
                    .home-cloud, .home-plane { animation: none; }
                    .home-plane { opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
