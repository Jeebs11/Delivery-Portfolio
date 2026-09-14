import { useEffect, useRef } from 'react';
import { useScene } from '../../context/SceneContext';

/**
 * ContactShowcase — the One Piece "Let's Connect" scene, a live DOM overlay
 * shown while currentRoom === 'contact' (the 3D room behind is just a backdrop).
 * A fixed 1672x941 stage is cover-scaled to the viewport; sprites are animated
 * with CSS (drifting clouds, gliding gulls, bobbing bottles, a ship sailing
 * right→left, and a shimmering sea).
 */

// Update these with your real profiles.
const LINKEDIN_URL = 'https://www.linkedin.com/';
const GITHUB_URL = 'https://github.com/Jeebs11';

const IMG = '/textures/contact-op/';

export default function ContactShowcase() {
    const { currentRoom } = useScene();
    const visible = currentRoom === 'contact';
    const stageRef = useRef(null);

    useEffect(() => {
        if (!visible) return;
        const fit = () => {
            const el = stageRef.current;
            if (!el) return;
            const s = Math.max(window.innerWidth / 1672, window.innerHeight / 941);
            el.style.transform = `translate(-50%, -50%) scale(${s})`;
        };
        fit();
        window.addEventListener('resize', fit);
        return () => window.removeEventListener('resize', fit);
    }, [visible]);

    if (!visible) return null;

    return (
        <div className="contact-scene">
            <style>{CSS}</style>
            <div className="cs-stage" ref={stageRef}>
                {/* clouds */}
                <div className="cs-sprite cs-cloud" style={{ left: 60, top: 60, width: 360, '--dx': '1400px', animation: 'cs-drift 90s linear infinite' }}><img src={`${IMG}cloud-1.webp`} alt="" /></div>
                <div className="cs-sprite cs-cloud" style={{ left: 900, top: 30, width: 520, '--dx': '900px', animation: 'cs-drift 120s linear infinite' }}><img src={`${IMG}cloud-2.webp`} alt="" /></div>
                <div className="cs-sprite cs-cloud" style={{ left: 1180, top: 150, width: 460, '--dx': '-1500px', animation: 'cs-drift 110s linear infinite' }}><img src={`${IMG}cloud-3.webp`} alt="" /></div>

                {/* ship sailing right -> left */}
                <div className="cs-sprite" style={{ left: 1150, top: 360, width: 300, animation: 'cs-sail 46s linear infinite' }}><img src={`${IMG}ship.webp`} alt="" /></div>

                {/* gliding gulls */}
                <div className="cs-sprite" style={{ left: 0, top: 120, width: 90, '--x0': '1500px', '--x1': '-120px', animation: 'cs-glide 34s linear infinite' }}><img src={`${IMG}bird-1.webp`} alt="" /></div>
                <div className="cs-sprite" style={{ left: 0, top: 230, width: 70, '--x0': '1650px', '--x1': '-120px', animation: 'cs-glide 44s linear infinite 6s' }}><img src={`${IMG}bird-3.webp`} alt="" /></div>
                <div className="cs-sprite" style={{ left: 0, top: 80, width: 64, '--x0': '1650px', '--x1': '-140px', animation: 'cs-glide 52s linear infinite 14s' }}><img src={`${IMG}bird-5.webp`} alt="" /></div>
                <div className="cs-sprite" style={{ left: 0, top: 300, width: 58, '--x0': '1700px', '--x1': '-120px', animation: 'cs-glide 40s linear infinite 22s' }}><img src={`${IMG}bird-4.webp`} alt="" /></div>

                {/* living sea */}
                <div className="cs-sea" />
                <div className="cs-sea2" />

                {/* luffy on the dock */}
                <div className="cs-sprite" style={{ left: 836, top: 520, height: 360, transform: 'translateX(-50%)' }}>
                    <img style={{ height: 360, width: 'auto' }} src={`${IMG}luffy.webp`} alt="" />
                </div>

                {/* message-in-a-bottle links */}
                <a className="cs-sprite cs-link" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" style={{ left: 205, top: 600, width: 190 }}>
                    <span className="cs-bottle" style={{ '--rot': '-24deg', animation: 'cs-bob 5s ease-in-out infinite' }}><img src={`${IMG}bottle-linkedin.webp`} alt="LinkedIn" /></span>
                    <span className="cs-caption">Connect on LinkedIn</span>
                </a>
                <a className="cs-sprite cs-link" href={GITHUB_URL} target="_blank" rel="noopener noreferrer" style={{ left: 1275, top: 590, width: 185 }}>
                    <span className="cs-bottle" style={{ '--rot': '22deg', animation: 'cs-bob 5.6s ease-in-out infinite .6s' }}><img src={`${IMG}bottle-github.webp`} alt="GitHub" /></span>
                    <span className="cs-caption">Explore my GitHub</span>
                </a>

                {/* headings */}
                <div className="cs-sprite cs-title"><b>Let's<br />Connect</b><div className="cs-u" /></div>
                <div className="cs-sprite cs-subtitle">Same seas.<br />Bigger adventures.</div>
            </div>
        </div>
    );
}

const CSS = `
.contact-scene{position:fixed;inset:0;overflow:hidden;z-index:90;pointer-events:none;
  background:#e9dfcc;font-family:'Caveat','Comic Sans MS',cursive}
.contact-scene .cs-stage{position:absolute;left:50%;top:50%;width:1672px;height:941px;transform-origin:center center;
  background:url('${IMG}bg-dock.webp') center/cover no-repeat}
.contact-scene .cs-sprite{position:absolute}
.contact-scene .cs-sprite img{display:block;width:100%;height:auto;pointer-events:none;-webkit-user-drag:none}
.contact-scene .cs-cloud{opacity:.9}
@keyframes cs-drift{from{transform:translateX(0)}to{transform:translateX(var(--dx))}}
@keyframes cs-glide{0%{transform:translate(var(--x0),0)}50%{transform:translate(calc((var(--x0) + var(--x1))/2),-18px)}100%{transform:translate(var(--x1),0)}}
.contact-scene .cs-bottle{display:block}
@keyframes cs-bob{0%,100%{transform:rotate(var(--rot)) translateY(0)}50%{transform:rotate(var(--rot)) translateY(-14px)}}
@keyframes cs-sail{0%{transform:translateX(0) translateY(0)}50%{transform:translateX(-620px) translateY(-10px)}100%{transform:translateX(-1240px) translateY(0)}}
.contact-scene .cs-sea{position:absolute;left:-10%;top:60%;width:120%;height:42%;pointer-events:none;mix-blend-mode:screen;opacity:.35;
  background:repeating-linear-gradient(100deg, rgba(255,255,255,0) 0 60px, rgba(255,255,255,.5) 70px, rgba(255,255,255,0) 90px);
  animation:cs-shimmer 9s linear infinite}
@keyframes cs-shimmer{from{background-position:0 0}to{background-position:340px 0}}
.contact-scene .cs-sea2{position:absolute;left:0;top:62%;width:100%;height:40%;pointer-events:none;mix-blend-mode:soft-light;opacity:.5;
  background:radial-gradient(120% 60% at 40% 30%, rgba(255,240,200,.5), transparent 60%);
  animation:cs-breathe 7s ease-in-out infinite}
@keyframes cs-breathe{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}
.contact-scene .cs-title{left:520px;top:70px;width:560px;text-align:center;color:#20303a}
.contact-scene .cs-title b{display:block;font-size:104px;line-height:.92;font-weight:700;text-shadow:1px 2px 0 rgba(255,255,255,.4)}
.contact-scene .cs-title .cs-u{width:230px;height:10px;margin:6px auto 0;background:#20303a;border-radius:8px;
  -webkit-mask:radial-gradient(circle at 6px 50%,#000 5px,transparent 6px) left/14px 100% repeat-x;
  mask:radial-gradient(circle at 6px 50%,#000 5px,transparent 6px) left/14px 100% repeat-x}
.contact-scene .cs-subtitle{left:1110px;top:250px;width:420px;font-size:34px;line-height:1.05;color:#33454f;transform:rotate(-3deg)}
.contact-scene .cs-link{cursor:pointer;text-decoration:none;pointer-events:auto;transition:transform .18s ease, filter .18s ease}
.contact-scene .cs-link:hover{transform:scale(1.06);filter:drop-shadow(0 6px 12px rgba(0,0,0,.25))}
.contact-scene .cs-caption{position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);white-space:nowrap;
  font-weight:700;font-size:26px;color:#2a3b44;background:rgba(255,252,244,.72);padding:2px 12px;border-radius:10px}
`;
