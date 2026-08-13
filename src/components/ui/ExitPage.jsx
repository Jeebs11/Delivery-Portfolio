import { useScene } from '../../context/SceneContext';

/**
 * ExitPage — the flat 2D "Thank you for visiting / Let's talk" scene shown at
 * the end of the corridor (instead of the endless loop). Connect on LinkedIn,
 * or head back to the entrance (which returns to the landing).
 */
const BG = '/textures/exit/exit_bg.webp';

const LINKEDIN_URL = 'https://www.linkedin.com/in/mujeeb-lawal-b381032a';

const ExitPage = () => {
    const { exitReached, returnToEntrance } = useScene();
    if (!exitReached) return null;

    return (
        <div className="exit-scene">
            <div className="exit-stage">
                <img className="exit-bg" src={BG} alt="Thank you for visiting — let's talk. Connect on LinkedIn." draggable="false" />

                {/* Connect on LinkedIn — hotspot over the baked button */}
                <a
                    className="exit-linkedin"
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Connect on LinkedIn"
                    title="Connect on LinkedIn"
                />

                {/* Head back to the entrance / landing */}
                <button className="exit-return" type="button" onClick={returnToEntrance}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 12a9 9 0 1 0 3-6.7" />
                        <polyline points="3 3 3 8 8 8" />
                    </svg>
                    Back to the entrance
                </button>
            </div>

            <style>{`
                .exit-scene {
                    position: fixed; inset: 0; z-index: 9995;
                    background: #f4f0e7;
                    display: flex; align-items: center; justify-content: center;
                    overflow: hidden;
                    animation: exitFade .7s ease both;
                }
                @keyframes exitFade { from { opacity: 0; } to { opacity: 1; } }
                .exit-stage {
                    position: relative;
                    width: min(100vw, calc(100vh * 1.3559));
                    aspect-ratio: 1600 / 1180;
                }
                .exit-bg {
                    position: absolute; inset: 0; width: 100%; height: 100%;
                    object-fit: contain; display: block;
                    user-select: none; -webkit-user-drag: none;
                }
                .exit-linkedin {
                    position: absolute; left: 38%; top: 60%; width: 29%; height: 7%;
                    border-radius: 8px; cursor: pointer;
                    transition: background .25s ease, box-shadow .25s ease;
                }
                .exit-linkedin:hover, .exit-linkedin:focus-visible {
                    outline: none;
                    background: rgba(40,103,178,.12);
                    box-shadow: 0 0 18px rgba(40,103,178,.28);
                }
                .exit-return {
                    position: absolute; left: 50%; bottom: 3.5%; transform: translateX(-50%);
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 9px 16px;
                    background: rgba(255,255,255,0.92);
                    border: 2px solid #1a1a1a; border-radius: 7px;
                    color: #1a1a1a; cursor: pointer;
                    font-family: "Caveat", cursive; font-size: 20px; font-weight: 700; line-height: 1;
                    box-shadow: 2px 2px 0 rgba(0,0,0,0.18);
                }
                .exit-return:hover, .exit-return:focus-visible { outline: none; background: #fff; }
            `}</style>
        </div>
    );
};

export default ExitPage;
