import sharp from 'sharp';
const DIR = 'public/textures/corridor/doors';
const NDIR = 'public/textures/doors';
const base = `${DIR}/backsingledoors.webp`;
const meta = await sharp(base).metadata();
const W = meta.width, H = meta.height;
console.log('door base', W + 'x' + H);

const fit = async (file, w) => {
    const buf = await sharp(`${NDIR}/${file}`).trim({ threshold: 10 }).resize({ width: w }).png().toBuffer();
    const m = await sharp(buf).metadata();
    return { buf, w: m.width, h: m.height };
};
const centreX = (m) => Math.round((W - m.w) / 2);

// CAREER — single word-art centred, spanning the door
const career = await fit('Career.png', Math.round(W * 0.86));
await sharp(base).composite([{ input: career.buf, left: centreX(career), top: Math.round(H * 0.5 - career.h / 2) }])
    .webp({ quality: 92 }).toFile(`${DIR}/career_door.webp`);
console.log('career_door.webp', `${career.w}x${career.h}`);

// PORTFOLIO — Portfolio (top panel) + Side Projects (bottom panel)
const port = await fit('Portfolio.png', Math.round(W * 0.74));
const side = await fit('Side Project.png', Math.round(W * 0.74));
await sharp(base).composite([
    { input: port.buf, left: centreX(port), top: Math.round(H * 0.27 - port.h / 2) },
    { input: side.buf, left: centreX(side), top: Math.round(H * 0.74 - side.h / 2) },
]).webp({ quality: 92 }).toFile(`${DIR}/portfolio_door.webp`);
console.log('portfolio_door.webp', `port ${port.w}x${port.h}, side ${side.w}x${side.h}`);
