import sharp from 'sharp';
const DIR = 'public/textures/corridor/doors';
const NDIR = 'public/textures/doors';
const base = `${DIR}/backsingledoors.webp`;
const meta = await sharp(base).metadata();
const W = meta.width, H = meta.height;

// colour source filenames
const C_CAREER = 'ChatGPT Image Aug 14, 2026, 03_34_53 PM (1).png';
const C_PORTFOLIO = 'ChatGPT Image Aug 14, 2026, 03_34_54 PM (2).png';
const C_SIDE = 'ChatGPT Image Aug 14, 2026, 03_34_55 PM (3).png';

const fit = async (file, wfrac) => {
    const buf = await sharp(`${NDIR}/${file}`).trim({ threshold: 10 }).resize({ width: Math.round(W * wfrac) }).png().toBuffer();
    const m = await sharp(buf).metadata();
    return { buf, w: m.width, h: m.height };
};
const place = (m, ny) => ({ input: m.buf, left: Math.round((W - m.w) / 2), top: Math.round(H * ny - m.h / 2) });

const TOP = 0.27, BOTTOM = 0.74;

// CAREER — single word-art in the TOP panel (sketch + colour)
for (const [src, out] of [['Career.png', 'career_door.webp'], [C_CAREER, 'career_door_painted.webp']]) {
    const art = await fit(src, 0.80);
    await sharp(base).composite([place(art, TOP)]).webp({ quality: 92 }).toFile(`${DIR}/${out}`);
}

// PORTFOLIO — Portfolio (top) + Side Projects (bottom); sketch + colour
for (const [pSrc, sSrc, out] of [
    ['Portfolio.png', 'Side Project.png', 'portfolio_door.webp'],
    [C_PORTFOLIO, C_SIDE, 'portfolio_door_painted.webp'],
]) {
    const port = await fit(pSrc, 0.74);
    const side = await fit(sSrc, 0.74);
    await sharp(base).composite([place(port, TOP), place(side, BOTTOM)]).webp({ quality: 92 }).toFile(`${DIR}/${out}`);
}
console.log('done: career_door(+painted), portfolio_door(+painted)');
