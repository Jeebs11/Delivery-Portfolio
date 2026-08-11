// Turn Mujeeb's personal photos into framed wall prints: white mat + dark
// keyline + a wooden frame. The whole framed photo is grayscale by default and
// blooms to colour on hover (so the wood frame greys out too, staying on-theme).
import sharp from 'sharp';

const SRC = 'public/textures/wall';
const OUT = 'public/textures/wall';

const MAP = [
    ['Medal.jpg', 'medal'],
    ['Cycling.jpg', 'cycling'],
    ['American Football.jpg', 'football'],
    ['Golf.jpg', 'golf'],
    ['Clay Pidgeon Shooting.jpg', 'shooting'],
];

const LONG = 900;
const MAT = 40;         // white mat
const KEY = 6;          // dark keyline
const BEVEL = 6;        // inner bevel highlight
const WOOD = 40;        // wooden frame
const EDGE = 7;         // outer dark edge
const WHITE = '#f7f4ec', INK = '#2b2b28';
const WOOD_BEVEL = '#9a7752', WOOD_MAIN = '#6f5238', WOOD_EDGE = '#382413';

// build the full framed print (colour)
async function framed(photoBuf) {
    return sharp(photoBuf)
        .extend({ top: MAT, bottom: MAT, left: MAT, right: MAT, background: WHITE })
        .extend({ top: KEY, bottom: KEY, left: KEY, right: KEY, background: INK })
        .extend({ top: BEVEL, bottom: BEVEL, left: BEVEL, right: BEVEL, background: WOOD_BEVEL })
        .extend({ top: WOOD, bottom: WOOD, left: WOOD, right: WOOD, background: WOOD_MAIN })
        .extend({ top: EDGE, bottom: EDGE, left: EDGE, right: EDGE, background: WOOD_EDGE })
        .toBuffer();
}

for (const [file, slug] of MAP) {
    const base = await sharp(`${SRC}/${file}`)
        .rotate()
        .resize({ width: LONG, height: LONG, fit: 'inside', withoutEnlargement: true })
        .toBuffer();

    const colour = await framed(base);
    await sharp(colour).webp({ quality: 86 }).toFile(`${OUT}/${slug}.webp`);           // colour (hover)
    await sharp(colour).grayscale().webp({ quality: 86 }).toFile(`${OUT}/${slug}_bw.webp`); // grayscale (default)

    const m = await sharp(`${OUT}/${slug}.webp`).metadata();
    console.log(slug, '->', `${m.width}x${m.height} ratio ${(m.width / m.height).toFixed(2)}`);
}
console.log('done');
