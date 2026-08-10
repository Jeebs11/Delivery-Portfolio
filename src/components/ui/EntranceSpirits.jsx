import { useScene } from '../../context/SceneContext';

/**
 * EntranceSpirits — original, Ghibli-inspired forest spirits scattered on the
 * landing scene. Pure DOM/SVG overlay (crisp vector, cheap). Ink line-art by
 * default; a soft colour palette blooms in on hover/focus. Only shown before
 * the visitor enters (landing only). All designs are original — not any
 * existing character.
 */
const EntranceSpirits = () => {
    const { hasEntered, isTeleporting } = useScene();
    if (hasEntered || isTeleporting) return null;

    return (
        <div className="esp-layer" aria-hidden="true">
            {/* Moss sprite — ground, lower left */}
            <div className="esp esp-moss" style={{ left: '7%', bottom: '13%', width: '92px' }} tabIndex={0}>
                <svg viewBox="0 0 120 130">
                    <ellipse className="esp-ln esp-f1" cx="60" cy="78" rx="30" ry="30" />
                    <path className="esp-ln esp-f2" d="M32 60c4-14 15-24 28-24s24 10 28 24c-8-6-18-9-28-9s-20 3-28 9z" />
                    <path className="esp-ln esp-f3" d="M60 34c1-9 7-15 15-16-2 9-7 15-15 16z" />
                    <circle className="esp-eye" cx="50" cy="76" r="4.2" /><circle className="esp-eye" cx="70" cy="76" r="4.2" />
                    <path className="esp-ln esp-mouth" d="M55 88q5 5 10 0" fill="none" />
                    <circle className="esp-cheek" cx="42" cy="85" r="3.6" /><circle className="esp-cheek" cx="78" cy="85" r="3.6" />
                </svg>
            </div>

            {/* Lantern bug — floating near the tree, upper left */}
            <div className="esp esp-float esp-lantern" style={{ left: '24%', top: '20%', width: '74px' }} tabIndex={0}>
                <svg viewBox="0 0 120 130">
                    <ellipse className="esp-ln esp-g1" cx="60" cy="84" rx="22" ry="24" />
                    <circle className="esp-ln esp-g2" cx="60" cy="52" r="16" />
                    <path className="esp-ln" d="M54 40l-6-10M66 40l6-10" fill="none" />
                    <circle className="esp-tip" cx="48" cy="30" r="2.4" /><circle className="esp-tip" cx="72" cy="30" r="2.4" />
                    <circle className="esp-eye" cx="54" cy="52" r="3.4" /><circle className="esp-eye" cx="66" cy="52" r="3.4" />
                    <path className="esp-ln esp-mouth" d="M56 60q4 4 8 0" fill="none" />
                    <path className="esp-ln" d="M50 96h20M52 104h16" fill="none" />
                </svg>
            </div>

            {/* Pebble spirit — ground, lower right by the plants */}
            <div className="esp esp-pebble" style={{ right: '12%', bottom: '10%', width: '84px' }} tabIndex={0}>
                <svg viewBox="0 0 120 130">
                    <path className="esp-ln esp-s1" d="M28 82c0-20 14-34 32-34s32 14 32 34c0 10-6 16-16 16H44c-10 0-16-6-16-16z" />
                    <path className="esp-ln esp-s2" d="M60 48c0-10 5-17 13-18-1 10-6 16-13 18z" />
                    <circle className="esp-eye" cx="50" cy="78" r="4" /><circle className="esp-eye" cx="70" cy="78" r="4" />
                    <path className="esp-ln esp-mouth" d="M55 88q5 4 10 0" fill="none" />
                    <path className="esp-ln" d="M46 98v6M74 98v6" fill="none" />
                </svg>
            </div>

            <style>{`
                .esp-layer{position:fixed;inset:0;z-index:9997;pointer-events:none}
                .esp{position:absolute;pointer-events:auto;cursor:pointer;outline:none;
                    transition:transform .4s ease;filter:drop-shadow(1px 2px 0 rgba(43,43,40,.12))}
                .esp svg{width:100%;height:auto;display:block;overflow:visible}
                .esp:hover,.esp:focus-visible{transform:translateY(-5px) rotate(-2deg) scale(1.06)}
                .esp-ln{stroke:#2b2b28;stroke-width:2.4;stroke-linejoin:round;stroke-linecap:round}
                .esp-f1,.esp-f2,.esp-f3,.esp-g1,.esp-g2,.esp-s1,.esp-s2{fill:#fff;transition:fill .5s ease}
                .esp-eye{fill:#2b2b28}
                .esp-tip{fill:#2b2b28;transition:fill .5s ease}
                .esp-cheek{fill:none;transition:fill .5s ease}
                .esp-mouth{stroke:#2b2b28}
                /* colour bloom on hover */
                .esp-moss:hover .esp-f1,.esp-moss:focus-visible .esp-f1{fill:#cfe0cf}
                .esp-moss:hover .esp-f2,.esp-moss:focus-visible .esp-f2{fill:#5a7d5a}
                .esp-moss:hover .esp-f3,.esp-moss:focus-visible .esp-f3{fill:#8ba888}
                .esp-moss:hover .esp-cheek,.esp-moss:focus-visible .esp-cheek{fill:#e0a9a0}
                .esp-lantern:hover .esp-g1,.esp-lantern:focus-visible .esp-g1{fill:#e8c56a}
                .esp-lantern:hover .esp-g2,.esp-lantern:focus-visible .esp-g2{fill:#f0d98f}
                .esp-lantern:hover .esp-tip,.esp-lantern:focus-visible .esp-tip{fill:#cf8b6a}
                .esp-pebble:hover .esp-s1,.esp-pebble:focus-visible .esp-s1{fill:#c9c2b4}
                .esp-pebble:hover .esp-s2,.esp-pebble:focus-visible .esp-s2{fill:#5a7d5a}
                /* gentle idle float for the lantern bug */
                .esp-float{animation:esp-bob 4.5s ease-in-out infinite}
                @keyframes esp-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
                .esp-float:hover,.esp-float:focus-visible{animation-play-state:paused}
                @media (max-width:520px){.esp-lantern{display:none}}
                @media (prefers-reduced-motion:reduce){.esp-float{animation:none}}
            `}</style>
        </div>
    );
};

export default EntranceSpirits;
