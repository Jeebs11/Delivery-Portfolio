// Compose the deconstructed exit pieces into one flat "Thank you / Let's talk"
// background image (the open-door piece is intentionally dropped — the existing
// corridor door is reused).
import sharp from 'sharp';
import { readdirSync } from 'fs';

const SRC = 'public/textures/exit/source';
const OUT = 'public/textures/exit';
const W = 1600, H = 1180;
const CREAM = { r: 244, g: 240, b: 231 };

const all = readdirSync(SRC).filter((f) => /\.png$/i.test(f));
const bySuffix = (n) => all.find((f) => f.includes(`(${n}).png`));

// key -> [source (N), nx, ny, wfrac]   (center-based, fractions of W/H)
const LAYOUT = [
    ['heading', 1, 0.50, 0.075, 0.44],
    ['plan',    2, 0.155, 0.25, 0.27],
    ['enhance', 3, 0.155, 0.47, 0.27],
    ['lead',    4, 0.155, 0.71, 0.27],
    ['talk',    6, 0.525, 0.53, 0.33],
    ['sign',    7, 0.85, 0.32, 0.205],
    ['plant',   8, 0.905, 0.72, 0.12],
    ['mug',     9, 0.79, 0.83, 0.10],
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
