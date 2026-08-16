import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useAudio } from '../../context/AudioManager';

// Checklist steps + the progress % at which each one ticks.
const STEPS = [
  { label: 'Define the problem', at: 20 },
  { label: 'Build the plan', at: 40 },
  { label: 'Align the moving parts', at: 60 },
  { label: 'Deliver the solution', at: 80 },
  { label: 'Launch', at: 99 },
];

const statusFor = (v) => {
  if (v >= 99) return { text: 'Ready. Step inside.', done: true };
  if (v >= 80) return { text: 'Preparing to launch…' };
  if (v >= 60) return { text: 'Putting it all together…' };
  if (v >= 40) return { text: 'Aligning the moving parts…' };
  if (v >= 20) return { text: 'Building the plan…' };
  return { text: 'Defining the problem…' };
};

const RING_R = 26;
const RING_C = 2 * Math.PI * RING_R;

const Preloader = ({ onComplete, ready }) => {
  const [isDone, setIsDone] = useState(false);

  const [realProgress, setRealProgress] = useState(0);
  const [active, setActive] = useState(true);

  useEffect(() => {
    let t = 0;
    const origOnStart = THREE.DefaultLoadingManager.onStart;
    const origOnProgress = THREE.DefaultLoadingManager.onProgress;
    const origOnLoad = THREE.DefaultLoadingManager.onLoad;

    THREE.DefaultLoadingManager.onStart = (url, loaded, total) => {
      setActive(true);
      origOnStart?.(url, loaded, total);
    };
    THREE.DefaultLoadingManager.onProgress = (url, loaded, total) => {
      cancelAnimationFrame(t);
      t = requestAnimationFrame(() => setRealProgress((loaded / total) * 100));
      origOnProgress?.(url, loaded, total);
    };
    THREE.DefaultLoadingManager.onLoad = () => {
      cancelAnimationFrame(t);
      setRealProgress(100);
      setActive(false);
      origOnLoad?.();
    };
    return () => {
      THREE.DefaultLoadingManager.onStart = origOnStart;
      THREE.DefaultLoadingManager.onProgress = origOnProgress;
      THREE.DefaultLoadingManager.onLoad = origOnLoad;
    };
  }, []);

  const { play } = useAudio();
  const pencilSoundRef = useRef(null);

  // Refs the progress engine writes to directly (skip React re-renders)
  const containerRef = useRef(null);
  const noteRef = useRef(null);
  const percentRef = useRef(null);
  const statusRef = useRef(null);
  const ringRef = useRef(null);
  const checkRefs = useRef([]);

  const [targetProgress, setTargetProgress] = useState(0);
  const displayProgressRef = useRef(0);
  const trackerRef = useRef({ val: 0 });
  const readyRef = useRef(ready);
  const exitStarted = useRef(false);

  useEffect(() => { readyRef.current = ready; }, [ready]);

  // Real load % -> a target the visual eases toward (hold at 90 until ready).
  useEffect(() => {
    let newTarget = 0;
    if (active) newTarget = (realProgress / 100) * 85;
    else newTarget = ready ? 100 : 90;
    setTargetProgress(prev => Math.max(prev, newTarget));
  }, [realProgress, active, ready]);

  const applyProgress = (val) => {
    const v = Math.min(100, Math.max(0, val));
    if (percentRef.current) percentRef.current.innerText = `${Math.round(v)}%`;
    if (ringRef.current) ringRef.current.style.strokeDashoffset = RING_C * (1 - v / 100);
    if (statusRef.current) {
      const s = statusFor(v);
      statusRef.current.innerText = s.text;
      statusRef.current.style.color = s.done ? '#3a7d44' : '#2b5c9e';
    }
    checkRefs.current.forEach((el, i) => {
      if (el) el.style.opacity = v >= STEPS[i].at ? '1' : '0';
    });
  };

  const checkProgressTriggers = (val) => {
    if (val < 99 && !pencilSoundRef.current) {
      pencilSoundRef.current = play('pencil', { loop: true, volume: 0.5 });
    } else if (val >= 99 && pencilSoundRef.current) {
      pencilSoundRef.current.stop();
      pencilSoundRef.current = null;
    }
    if (val >= 99.5 && readyRef.current && !exitStarted.current) {
      exitStarted.current = true;
      startExit();
    }
  };

  useEffect(() => () => {
    if (pencilSoundRef.current) { pencilSoundRef.current.stop(); pencilSoundRef.current = null; }
  }, []);

  useEffect(() => {
    const distance = targetProgress - displayProgressRef.current;
    let duration = 0.5;
    if (distance > 60) duration = 1.5;
    else if (distance > 30) duration = 1.0;
    else if (distance > 10) duration = 0.6;
    else if (distance > 0) duration = 0.4;

    gsap.to(trackerRef.current, {
      val: targetProgress,
      duration,
      ease: 'power2.out',
      overwrite: true,
      onUpdate: () => {
        const val = trackerRef.current.val;
        displayProgressRef.current = val;
        applyProgress(val);
        checkProgressTriggers(val);
      },
    });
  }, [targetProgress]);

  // Fallback: if ready arrives after we've already reached the end
  useEffect(() => {
    if (displayProgressRef.current >= 99.5 && ready && !exitStarted.current) {
      exitStarted.current = true;
      startExit();
    }
  }, [ready]);

  const startExit = () => {
    if (pencilSoundRef.current) { pencilSoundRef.current.stop(); pencilSoundRef.current = null; }
    try { play('tear', { volume: 0.6 }); } catch (e) { /* noop */ }

    const tl = gsap.timeline({
      onComplete: () => { setIsDone(true); onComplete?.(); },
    });
    tl.to({}, { duration: 0.35 }); // let the completed checklist register
    tl.to(noteRef.current, { y: -26, scale: 1.03, duration: 0.5, ease: 'power2.out' });
    tl.to(containerRef.current, { opacity: 0, duration: 0.55, ease: 'power2.in' }, '-=0.15');
  };

  if (isDone) return null;

  return (
    <div className="mexe-loader" ref={containerRef}>
      <div className="mexe-note" ref={noteRef}>
        <span className="mexe-pin" aria-hidden="true" />
        <div className="mexe-project">PROJECT:</div>
        <div className="mexe-title">Meet Mujeeb</div>
        <div className="mexe-rule" />

        <ul className="mexe-list">
          {STEPS.map((step, i) => (
            <li className="mexe-item" key={step.label}>
              <span className="mexe-box">
                <svg viewBox="0 0 24 24" className="mexe-square"><rect x="2.5" y="2.5" width="19" height="19" rx="3" /></svg>
                <svg viewBox="0 0 24 24" className="mexe-tick" ref={(el) => (checkRefs.current[i] = el)}>
                  <path d="M4 12.5 L10 18.5 L20 5.5" />
                </svg>
              </span>
              <span className="mexe-label">{step.label}</span>
            </li>
          ))}
        </ul>

        <div className="mexe-foot">
          <div className="mexe-ring">
            <svg viewBox="0 0 60 60">
              <circle cx="30" cy="30" r={RING_R} className="mexe-ring-bg" />
              <circle
                cx="30" cy="30" r={RING_R} className="mexe-ring-fg" ref={ringRef}
                style={{ strokeDasharray: RING_C, strokeDashoffset: RING_C, transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
              />
            </svg>
            <span className="mexe-percent" ref={percentRef}>0%</span>
          </div>
          <div className="mexe-divider" />
          <div className="mexe-status" ref={statusRef}>Defining the problem…</div>
        </div>
      </div>

      <style>{`
        @font-face { font-family: 'Cabin Sketch'; src: url('/fonts/CabinSketch-Bold.ttf') format('truetype'); font-weight: 700; font-display: swap; }
        .mexe-loader {
          position: fixed; inset: 0; z-index: 99999;
          background: #f4f1ea;
          display: flex; align-items: center; justify-content: center;
        }
        .mexe-note {
          position: relative;
          width: min(88vw, 460px);
          background: #fffdf8;
          border: 2.5px solid #1c1c1c;
          border-radius: 8px;
          padding: 34px 34px 26px;
          box-shadow: 7px 9px 0 rgba(0,0,0,0.16);
          transform: rotate(-0.6deg);
        }
        .mexe-pin {
          position: absolute; top: -12px; left: 50%; width: 20px; height: 20px;
          transform: translateX(-50%);
          background: radial-gradient(circle at 35% 30%, #e07a63, #b23a26 70%);
          border-radius: 50%;
          box-shadow: 0 3px 4px rgba(0,0,0,0.3);
        }
        .mexe-pin::after {
          content: ''; position: absolute; left: 50%; top: 90%;
          width: 2px; height: 10px; background: #7a7a7a; transform: translateX(-50%);
        }
        .mexe-project {
          font-family: 'Caveat', cursive; font-size: 1.15rem; color: #444;
          letter-spacing: 1px; line-height: 1;
        }
        .mexe-title {
          font-family: 'Cabin Sketch', 'Caveat', cursive; font-weight: 700;
          font-size: 2.6rem; color: #1c1c1c; line-height: 1.05; margin-top: 2px;
        }
        .mexe-rule { height: 3px; background: #2b5c9e; border-radius: 2px; margin: 8px 0 18px; width: 62%; opacity: 0.85; }
        .mexe-list { list-style: none; margin: 0; padding: 0; }
        .mexe-item { display: flex; align-items: center; gap: 14px; padding: 7px 0; border-bottom: 1.5px dashed #d9d4c7; }
        .mexe-item:last-child { border-bottom: 0; }
        .mexe-box { position: relative; width: 26px; height: 26px; flex: 0 0 26px; }
        .mexe-square { position: absolute; inset: 0; }
        .mexe-square rect { fill: #fff; stroke: #1c1c1c; stroke-width: 2; }
        .mexe-tick { position: absolute; inset: 0; opacity: 0; transition: opacity 0.3s ease; }
        .mexe-tick path { fill: none; stroke: #2b5c9e; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
        .mexe-label { font-family: 'Caveat', cursive; font-size: 1.5rem; color: #222; line-height: 1; }
        .mexe-foot { display: flex; align-items: center; gap: 16px; margin-top: 20px; padding-top: 16px; border-top: 2px solid #1c1c1c; }
        .mexe-ring { position: relative; width: 66px; height: 66px; flex: 0 0 66px; }
        .mexe-ring svg { width: 100%; height: 100%; }
        .mexe-ring-bg { fill: none; stroke: #cfc9ba; stroke-width: 3; stroke-dasharray: 3 6; stroke-linecap: round; }
        .mexe-ring-fg { fill: none; stroke: #2b5c9e; stroke-width: 3.5; stroke-linecap: round; transition: stroke-dashoffset 0.1s linear; }
        .mexe-percent {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          font-family: 'Caveat', cursive; font-weight: 700; font-size: 1.35rem; color: #1c1c1c;
        }
        .mexe-divider { width: 2px; align-self: stretch; background: #d9d4c7; }
        .mexe-status { font-family: 'Caveat', cursive; font-size: 1.5rem; color: #2b5c9e; line-height: 1.15; }
        @media (max-width: 480px) {
          .mexe-title { font-size: 2.1rem; }
          .mexe-label, .mexe-status { font-size: 1.3rem; }
        }
      `}</style>
    </div>
  );
};

export default Preloader;
