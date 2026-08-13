// Compose the deconstructed exit pieces into one flat "Thank you / Let's talk"
// background image (the open-door piece is intentionally dropped — the existing
// corridor door is reused).
import sharp from 'sharp';
import { readdirSync } from 'fs';

const SRC = 'public/textures/exit/source';
const OUT = 'public/textures/exit';
const W = 1600, H = 1200;
const CREAM = { r: 244, g: 240, b: 231 };

const all = readdirSync(SRC).filter((f) => /\.png$/i.test(f));
const bySuffix = (n) => all.find((f) => f.includes(`(${n}).png`));

// key -> [source (N), nx, ny, wfrac]   (center-based, fractions of W/H)
// Order = back-to-front: the open door frames the "Let's talk" invitation.
// (No doormat piece exists, so the scene is doormat-free by construction.)
const LAYOUT = [
    ['door',    5, 0.505, 0.505, 0.46],
    ['talk',    6, 0.505, 0.475, 0.245],
    ['heading', 1, 0.50, 0.085, 0.40],
    ['plan',    2, 0.155, 0.21, 0.25],
    ['enhance', 3, 0.155, 0.44, 0.25],
    ['lead',    4, 0.155, 0.69, 0.25],
    ['sign',    7, 0.85, 0.35, 0.195],
    ['plant',   8, 0.905, 0.66, 0.125],
    ['mug',     9, 0.80, 0.78, 0.10],
];

const composites = [];
const report = {};
for (const [key, n, nx, ny, wfrac] of LAYOUT) {
    const file = bySuffix(n);
    const targetW = Math.round(wfrac * W);
    const buf = await sharp(`${SRC}/${file}`).trim({ threshold: 8 }).resize({ width: targetW }).png().toBuffer();
    const m = await sharp(buf).metadata();
    const left = Math.round(nx * W - m.width / 2);
    const top = Math.round(ny * H - m.height / 2);
    composites.push({ input: buf, left, top });
    report[key] = { left, top, w: m.width, h: m.height, cx: +(nx).toFixed(3), cy: +(ny).toFixed(3) };
}

await sharp({ create: { width: W, height: H, channels: 3, background: CREAM } })
    .composite(composites)
    .webp({ quality: 90 })
    .toFile(`${OUT}/exit_bg.webp`);

console.log('exit_bg.webp', `${W}x${H}`);
console.log('TALK box (for LinkedIn hotspot):', report.talk);
