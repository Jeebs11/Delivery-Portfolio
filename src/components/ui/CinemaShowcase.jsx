import { useEffect, useRef, useState } from 'react';
import { useScene } from '../../context/SceneContext';

/**
 * CinemaShowcase — the Portfolio room. A DOM layer laid over a clean render of a
 * luxury screening room: a big featured project screen + a scrolling "OUR PROJECTS"
 * rail. Auto-plays through the projects, pauses when you browse the rail, and
 * features a project when you click it. Shown while currentRoom === 'studio'.
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

const CinemaShowcase = () => {
    const { currentRoom, requestExit } = useScene();
    const visible = currentRoom === 'studio';

    const [featured, setFeatured] = useState(0);
    const featRef = useRef(0);
    const useARef = useRef(true);
    const pausedRef = useRef(false);
    const scrollRef = useRef(0);
    const shotA = useRef(null), shotB = useRef(null), trackRef = useRef(null);

    const feature = (i) => {
        const idx = (i + N) % N;
        featRef.current = idx;
        setFeatured(idx);
        const p = PROJECTS[idx];
        const inc = useARef.current ? shotB.current : shotA.current;
        const out = useARef.current ? shotA.current : shotB.current;
        if (inc) { inc.style.backgroundImage = `url('${p.img}')`; inc.classList.add('on'); }
        if (out) out.classList.remove('on');
        useARef.current = !useARef.current;
    };

    // run the auto-play + rail scroll only while the room is open
    useEffect(() => {
        if (!visible) return;
        feature(featRef.current); // ensure the current one is painted on (re)enter
        let raf;
        const loop = () => {
            if (!pausedRef.current && trackRef.current) {
                scrollRef.current += 0.15;
                const h = trackRef.current.scrollHeight || 1;
                if (scrollRef.current > h) scrollRef.current = 0;
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
            <button className="cin-exit" onClick={() => requestExit()} aria-label="Back to corridor">
                <span>&larr;</span> Back
            </button>
            <div className="cin-stage">
                <div className="cin-plate">
                    {/* featured screen */}
                    <div className="cin-screen">
                        <div className="cin-shot on" ref={shotA} />
                        <div className="cin-shot" ref={shotB} />
                        <div className="cin-veil" />
                        <div className="cin-counter">{String(featured + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}</div>
                        <div className="cin-cap">
                            <div className="cin-kicker">{p.sub}</div>
                            <h2>{p.title}</h2>
                            <p>{p.tag}</p>
                            <button className="cin-cta" style={{ opacity: hasUrl ? 1 : 0.4 }}
                                onClick={() => hasUrl && window.open(p.url, '_blank', 'noopener')}>
                                <span>View case study</span><span className="ln" /><span>&rarr;</span>
                            </button>
                        </div>
                    </div>
                    {/* rail */}
                    <div className="cin-rail"
                        onMouseEnter={() => { pausedRef.current = true; }}
                        onMouseLeave={() => { pausedRef.current = false; }}>
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
                .cin-exit{position:absolute;top:24px;left:26px;z-index:2;display:inline-flex;align-items:center;gap:.5em;
                    font-family:var(--sans);font-weight:500;font-size:12px;letter-spacing:.18em;text-transform:uppercase;
                    color:var(--cream);background:rgba(10,10,12,.55);border:1px solid rgba(217,183,121,.35);
                    padding:9px 16px;border-radius:30px;cursor:pointer;backdrop-filter:blur(4px);transition:color .2s,border-color .2s}
                .cin-exit:hover{color:var(--gold);border-color:var(--gold)}
                .cin-exit span{font-size:15px}
                .cin-stage{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
                .cin-plate{position:relative;aspect-ratio:1672/941;width:min(100vw,calc(100vh*1.7768));height:auto;
                    background:#0a0a0a url('/textures/studio/cinema-plate.webp') center/cover}
                /* featured screen */
                .cin-screen{position:absolute;left:47.6%;top:11.2%;width:47.6%;height:46.6%;overflow:hidden;border-radius:2px}
                .cin-shot{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;transition:opacity .7s ease}
                .cin-shot.on{opacity:1}
                .cin-veil{position:absolute;inset:0;background:linear-gradient(to top,rgba(6,8,12,.92) 0%,rgba(6,8,12,.55) 18%,rgba(6,8,12,0) 40%)}
                .cin-counter{position:absolute;top:5.5%;left:4%;font-family:var(--serif);font-size:clamp(11px,1.15vw,20px);letter-spacing:.18em;color:var(--cream);opacity:.85}
                .cin-cap{position:absolute;left:4.5%;right:5%;bottom:5.5%;color:var(--cream)}
                .cin-kicker{font-family:var(--sans);font-weight:500;font-size:clamp(7px,.62vw,11px);letter-spacing:.34em;color:var(--gold);text-transform:uppercase;margin-bottom:.5em}
                .cin-cap h2{font-family:var(--serif);font-weight:500;font-size:clamp(18px,2.5vw,46px);line-height:1.02;margin-bottom:.18em}
                .cin-cap p{font-family:var(--serif);font-style:italic;font-weight:400;font-size:clamp(10px,1.15vw,21px);color:#d8cdb8;margin-bottom:.7em;max-width:78%}
                .cin-cta{display:inline-flex;align-items:center;gap:.6em;font-family:var(--sans);font-weight:500;font-size:clamp(7px,.66vw,12px);letter-spacing:.24em;color:var(--cream);text-transform:uppercase;cursor:pointer;border:0;background:none}
                .cin-cta .ln{width:clamp(20px,2vw,40px);height:1px;background:var(--gold)}
                .cin-cta:hover{color:var(--gold)}
                /* rail */
                .cin-rail{position:absolute;left:5.6%;top:14.5%;width:10.3%;height:50%;overflow:hidden;
                    -webkit-mask-image:linear-gradient(to bottom,transparent,#000 8%,#000 92%,transparent);mask-image:linear-gradient(to bottom,transparent,#000 8%,#000 92%,transparent)}
                .cin-track{position:absolute;left:0;right:0;top:0;display:flex;flex-direction:column;gap:6%}
                .cin-row{position:relative;width:100%;aspect-ratio:16/10;border-radius:3px;overflow:hidden;cursor:pointer;outline:1px solid rgba(217,183,121,.16);transition:outline-color .25s,transform .25s}
                .cin-thumb{position:absolute;inset:0;background-size:cover;background-position:center;filter:brightness(.72) saturate(.9)}
                .cin-rg{position:absolute;inset:0;background:linear-gradient(to top,rgba(4,6,10,.9),rgba(4,6,10,.15))}
                .cin-num{position:absolute;top:6%;left:7%;font-family:var(--serif);font-size:clamp(9px,.8vw,15px);color:var(--gold);letter-spacing:.05em}
                .cin-t{position:absolute;left:7%;right:6%;bottom:8%;color:var(--cream)}
                .cin-t b{display:block;font-family:var(--serif);font-weight:500;font-size:clamp(8px,.72vw,13px);line-height:1.05}
                .cin-t s{display:block;text-decoration:none;font-family:var(--sans);font-weight:400;font-size:clamp(5px,.44vw,8px);letter-spacing:.12em;color:#b8ab90;text-transform:uppercase;margin-top:.25em}
                .cin-row.active{outline:1.5px solid var(--gold);transform:scale(1.015)}
                .cin-row.active .cin-thumb{filter:brightness(.95) saturate(1)}
            `}</style>
        </div>
    );
};

export default CinemaShowcase;
