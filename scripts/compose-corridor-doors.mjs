import sharp from 'sharp';
const DIR = 'public/textures/corridor/doors';
const NDIR = 'public/textures/doors';
const base = `${DIR}/backsingledoors.webp`;
const meta = await sharp(base).metadata();
const W = meta.width, H = meta.height;

// colour source art (the "new style"). The B&W default is a grayscale of these,
// so hovering only changes the colour, not the letterforms.
const C_CAREER = 'ChatGPT Image Aug 14, 2026, 03_34_53 PM (1).png';
const C_PORTFOLIO = 'ChatGPT Image Aug 14, 2026, 03_34_54 PM (2).png';
const C_SIDE = 'ChatGPT Image Aug 14, 2026, 03_34_55 PM (3).png';

const fit = async (file, wfrac, gray) => {
    let p = sharp(`${NDIR}/${file}`).trim({ threshold: 10 }).resize({ width: Math.round(W * wfrac) });
    if (gray) p = p.grayscale();
    const buf = await p.png().toBuffer();
    const m = await sharp(buf).metadata();
    return { buf, w: m.width, h: m.height };
};
const place = (m, ny) => ({ input: m.buf, left: Math.round((W - m.w) / 2), top: Math.round(H * ny - m.h / 2) });
const TOP = 0.27, BOTTOM = 0.74;

// CAREER — top panel
for (const gray of [true, false]) {
    const art = await fit(C_CAREER, 0.80, gray);
    await sharp(base).composite([place(art, TOP)]).webp({ quality: 92 })
        .toFile(`${DIR}/career_door${gray ? '' : '_painted'}.webp`);
}
// PORTFOLIO — Portfolio (top) + Side Projects (bottom)
for (const gray of [true, false]) {
    const port = await fit(C_PORTFOLIO, 0.74, gray);
    const side = await fit(C_SIDE, 0.74, gray);
    await sharp(base).composite([place(port, TOP), place(side, BOTTOM)]).webp({ quality: 92 })
        .toFile(`${DIR}/portfolio_door${gray ? '' : '_painted'}.webp`);
}
console.log('done — sketch = grayscale of colour art');
