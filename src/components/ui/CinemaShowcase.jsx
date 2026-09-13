import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useScene } from '../../context/SceneContext';

/**
 * CinemaShowcase — the Portfolio room. A DOM layer laid over a clean render of a
 * luxury screening room. The featured screen + the "OUR PROJECTS" rail are warped
 * with matrix3d onto the exact tilted corners of the screen / panel in the render,
 * so they sit on those surfaces. Shown while currentRoom === 'studio'.
 */
const IMG = '/textures/studio/mujeeb/';
const PROJECTS = [
    { title: 'Program Management Dashboard', sub: 'Governance PM Tool', tag: 'Timesheets, audit trails & multi-tenant — 36% less manual reporting.', img: IMG + 'pm-dashboard.webp', url: null },
    { title: 'Risk Radar', sub: 'AI Risk Monitor', tag: 'AI-driven programme risk monitoring, built for Careem.', img: IMG + 'risk-radar.webp', url: 'https://carreemriskradar.replit.app' },
    { title: 'Executive Dashboard', sub: 'Programme Command Centre', tag: 'Executive dashboard with AI-generated MD-pack summaries.', img: IMG + 'exec-dashboard.webp', url: 'https://Moove-Executive-Dashboard.replit.app' },
    { title: 'Energy Benchmark Tool', sub: 'GSMA · UN 2030 SDGs', tag: 'Helping telecom operators monitor & cut energy consumption.', img: IMG + 'energy-benchmark.webp', url: 'https://www.gsma.com/solutions-and-impact/technologies/networks/digest/gsma-beta-labs-launches-energy-benchmarking-tool-to-help-operators-monitor-their-energy-consumptions/' },
    { title: 'This Portfolio', sub: 'Full-Stack CV Platform', tag: 'CMS, blog engine, CV gate and an AI chatbot — built end to end.', img: IMG + 'portfolio.webp', url: 'https://mujeeb-lawal.replit.app/' },
    { title: 'Digital Transformation', sub: 'E-commerce · Novocycle', tag: 'Stood up an online storefront and fulfilment flow.', img: IMG + 'ecommerce.webp', url: 'https://shop.novocycle.com/' },
];
const N = PROJECTS.length;
const PLATE_W = 1672, PLATE_H = 941;
// corners measured from the plate (px in 1672x941): TL, TR, BR, BL
const SCREEN = { tl: [770, 126], tr: [1626, 112], br: [1622, 566], bl: [770, 552] };
const RAIL = { tl: [92, 150], tr: [270, 132], br: [268, 686], bl: [84, 664] };

// --- 2D projective transform -> matrix3d (maps elt (0,0)(w,0)(0,h)(w,h) to TL,TR,BL,BR) ---
const adj = (m) => [m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4], m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5], m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3]];
const mm = (a, b) => { const c = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { let s = 0; for (let k = 0; k < 3; k++) s += a[3*i+k]*b[3*k+j]; c[3*i+j] = s; } return c; };
const mv = (m, v) => [m[0]*v[0]+m[1]*v[1]+m[2]*v[2], m[3]*v[0]+m[4]*v[1]+m[5]*v[2], m[6]*v[0]+m[7]*v[1]+m[8]*v[2]];
const basis = (x1,y1,x2,y2,x3,y3,x4,y4) => { const m = [x1,x2,x3,y1,y2,y3,1,1,1]; const v = mv(adj(m), [x4,y4,1]); return mm(m, [v[0],0,0,0,v[1],0,0,0,v[2]]); };
function warp(el, d) {
    const w = el.offsetWidth, h = el.offsetHeight;
    if (!w || !h) return;
    const s = basis(0,0, w,0, 0,h, w,h);
    const t = basis(d.tl[0],d.tl[1], d.tr[0],d.tr[1], d.bl[0],d.bl[1], d.br[0],d.br[1]);
    const g = mm(t, adj(s));
    for (let i = 0; i < 9; i++) g[i] /= g[8];
    el.style.transform = `matrix3d(${[g[0],g[3],0,g[6], g[1],g[4],0,g[7], 0,0,1,0, g[2],g[5],0,g[8]].join(',')})`;
}

const CinemaShowcase = () => {
    const { currentRoom, requestExit } = useScene();
    const visible = currentRoom === 'studio';

    const [featured, setFeatured] = useState(0);
    const featRef = useRef(0), useARef = useRef(true), pausedRef = useRef(false), scrollRef = useRef(0);
    const shotA = useRef(null), shotB = useRef(null), trackRef = useRef(null);
    const plateRef = useRef(null), screenRef = useRef(null), railRef = useRef(null);

    const feature = (i) => {
        const idx = (i + N) % N;
        featRef.current = idx; setFeatured(idx);
        const p = PROJECTS[idx];
        const inc = useARef.current ? shotB.current : shotA.current;
        const out = useARef.current ? shotA.current : shotB.current;
        if (inc) { inc.style.backgroundImage = `url('${p.img}')`; inc.classList.add('on'); }
        if (out) out.classList.remove('on');
        useARef.current = !useARef.current;
    };

    // scale the fixed-size plate to fit the viewport + warp the screen/rail onto the plate corners
    const layout = () => {
        if (plateRef.current) {
            const s = Math.min(window.innerWidth / PLATE_W, window.innerHeight / PLATE_H);
            plateRef.current.style.transform = `scale(${s})`;
        }
        if (screenRef.current) warp(screenRef.current, SCREEN);
        if (railRef.current) warp(railRef.current, RAIL);
    };
    useLayoutEffect(() => { layout(); window.addEventListener('resize', layout); return () => window.removeEventListener('resize', layout); }, []);
    useEffect(() => { if (visible) layout(); }, [visible]);

    // auto-play + rail scroll while open
    useEffect(() => {
        if (!visible) return;
        feature(featRef.current);
        let raf;
        const loop = () => {
            if (!pausedRef.current && trackRef.current) {
                scrollRef.current += 0.3;
                if (scrollRef.current > (trackRef.current.scrollHeight || 1)) scrollRef.current = 0;
                trackRef.current.style.transform = `translateY(${-scrollRef.current}px)`;
            }
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        const timer = setInterval(() => { if (!pausedRef.current) feature(featRef.current + 1); }, 4600);
        return () => { cancelAnimationFrame(raf); clearInterval(timer); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    const p = PROJECTS[featured];
    const hasUrl = p.url && p.url !== '#';

    return (
        <div className={`cinema${visible ? ' show' : ''}`} aria-hidden={!visible}>
            <button className="cin-exit" onClick={() => requestExit()} aria-label="Back to corridor"><span>&larr;</span> Back</button>
            <div className="cin-stage">
                <div className="cin-plate" ref={plateRef}>
                    <div className="cin-screen" ref={screenRef}>
                        <div className="cin-shot on" ref={shotA} />
                        <div className="cin-shot" ref={shotB} />
                        <div className="cin-veil" />
                        <div className="cin-counter">{String(featured + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}</div>
                        <div className="cin-cap">
                            <div className="cin-kicker">{p.sub}</div>
                            <h2>{p.title}</h2>
                            <p>{p.tag}</p>
                            <button className="cin-cta" style={{ opacity: hasUrl ? 1 : 0.4 }} onClick={() => hasUrl && window.open(p.url, '_blank', 'noopener')}>
                                <span>View case study</span><span className="ln" /><span>&rarr;</span>
                            </button>
                        </div>
                    </div>
                    <div className="cin-rail" ref={railRef}
                        onMouseEnter={() => { pausedRef.current = true; }} onMouseLeave={() => { pausedRef.current = false; }}>
                        <div className="cin-track" ref={trackRef}>
                            {PROJECTS.map((pr, i) => (
                                <div key={pr.title} className={`cin-row${i === featured ? ' active' : ''}`} onClick={() => feature(i)}>
                                    <div className="cin-thumb" style={{ backgroundImage: `url('${pr.img}')` }} />
                                    <div className="cin-rg" />
                                    <div className="cin-num">{String(i + 1).padStart(2, '0')}</div>
                                    <div className="cin-t"><b>{pr.title}</b><s>{pr.sub}</s></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500&display=swap');
                .cinema{position:fixed;inset:0;z-index:9994;background:#000;opacity:0;pointer-events:none;transition:opacity .8s ease;
                    --gold:#d9b779;--cream:#efe6d6;--serif:'Cormorant Garamond',Georgia,serif;--sans:'Inter',system-ui,sans-serif}
                .cinema.show{opacity:1;pointer-events:auto}
                .cin-exit{position:absolute;top:24px;left:26px;z-index:3;display:inline-flex;align-items:center;gap:.5em;font-family:var(--sans);
                    font-weight:500;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--cream);background:rgba(10,10,12,.55);
                    border:1px solid rgba(217,183,121,.35);padding:9px 16px;border-radius:30px;cursor:pointer;backdrop-filter:blur(4px);transition:color .2s,border-color .2s}
                .cin-exit:hover{color:var(--gold);border-color:var(--gold)} .cin-exit span{font-size:15px}
                .cin-stage{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
                .cin-plate{position:relative;width:1672px;height:941px;flex:0 0 auto;transform-origin:center;
                    background:#0a0a0a url('/textures/studio/cinema-plate.webp') center/cover}
                .cin-screen{position:absolute;left:0;top:0;width:852px;height:424px;transform-origin:0 0;overflow:hidden}
                .cin-shot{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;transition:opacity .7s ease}
                .cin-shot.on{opacity:1}
                .cin-veil{position:absolute;inset:0;background:linear-gradient(to top,rgba(6,8,12,.92) 0%,rgba(6,8,12,.55) 18%,rgba(6,8,12,0) 40%)}
                .cin-counter{position:absolute;top:22px;left:32px;font-family:var(--serif);font-size:22px;letter-spacing:.18em;color:var(--cream);opacity:.85}
                .cin-cap{position:absolute;left:36px;right:44px;bottom:30px;color:var(--cream)}
                .cin-kicker{font-family:var(--sans);font-weight:500;font-size:11px;letter-spacing:.34em;color:var(--gold);text-transform:uppercase;margin-bottom:8px}
                .cin-cap h2{font-family:var(--serif);font-weight:500;font-size:52px;line-height:1;margin-bottom:6px}
                .cin-cap p{font-family:var(--serif);font-style:italic;font-size:23px;color:#d8cdb8;margin-bottom:14px;max-width:78%}
                .cin-cta{display:inline-flex;align-items:center;gap:12px;font-family:var(--sans);font-weight:500;font-size:12px;letter-spacing:.24em;color:var(--cream);text-transform:uppercase;cursor:pointer;border:0;background:none}
                .cin-cta .ln{width:40px;height:1px;background:var(--gold)} .cin-cta:hover{color:var(--gold)}
                .cin-rail{position:absolute;left:0;top:0;width:180px;height:530px;transform-origin:0 0;overflow:hidden;
                    -webkit-mask-image:linear-gradient(to bottom,transparent,#000 7%,#000 93%,transparent);mask-image:linear-gradient(to bottom,transparent,#000 7%,#000 93%,transparent)}
                .cin-track{position:absolute;left:0;right:0;top:0;display:flex;flex-direction:column;gap:12px;padding:0 6px}
                .cin-row{position:relative;width:100%;aspect-ratio:16/10;border-radius:4px;overflow:hidden;cursor:pointer;outline:1px solid rgba(217,183,121,.18)}
                .cin-thumb{position:absolute;inset:0;background-size:cover;background-position:center;filter:brightness(.72)}
                .cin-rg{position:absolute;inset:0;background:linear-gradient(to top,rgba(4,6,10,.9),rgba(4,6,10,.15))}
                .cin-num{position:absolute;top:6px;left:9px;font-family:var(--serif);font-size:15px;color:var(--gold)}
                .cin-t{position:absolute;left:9px;right:8px;bottom:8px;color:var(--cream)}
                .cin-t b{display:block;font-family:var(--serif);font-weight:500;font-size:14px;line-height:1.05}
                .cin-t s{display:block;text-decoration:none;font-family:var(--sans);font-weight:400;font-size:8px;letter-spacing:.12em;color:#b8ab90;text-transform:uppercase;margin-top:3px}
                .cin-row.active{outline:1.5px solid var(--gold)} .cin-row.active .cin-thumb{filter:brightness(.95)}
            `}</style>
        </div>
    );
};

export default CinemaShowcase;
