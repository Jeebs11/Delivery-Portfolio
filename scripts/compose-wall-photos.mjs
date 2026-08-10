// Turn Mujeeb's personal photos into clean "framed print" wall textures:
// a thin white mat + dark keyline, in both colour and grayscale (the grayscale
// is shown by default and blooms to colour on hover, matching the site theme).
import sharp from 'sharp';

const SRC = 'public/textures/wall';
const OUT = 'public/textures/wall';

// source file -> output slug
const MAP = [
    ['Medal.jpg', 'medal'],
    ['Cycling.jpg', 'cycling'],
    ['American Football.jpg', 'football'],
    ['Golf.jpg', 'golf'],
    ['Clay Pidgeon Shooting.jpg', 'shooting'],
];

const LONG = 900;      // longest edge of the photo
const MAT = 44;        // white mat thickness (px)
const KEY = 8;         // dark keyline thickness (px)
const WHITE = '#f7f4ec';
const INK = '#2b2b28';

for (const [file, slug] of MAP) {
    // respect EXIF orientation, fit within LONG box
    const base = await sharp(`${SRC}/${file}`)
        .rotate()
        .resize({ width: LONG, height: LONG, fit: 'inside', withoutEnlargement: true })
        .toBuffer();

    const framed = (buf) => sharp(buf)
        .extend({ top: MAT, bottom: MAT, left: MAT, right: MAT, background: WHITE })
        .extend({ top: KEY, bottom: KEY, left: KEY, right: KEY, background: INK });

    // colour
    await framed(base).webp({ quality: 86 }).toFile(`${OUT}/${slug}.webp`);
    // grayscale (default / not-hovered)
    const gray = await sharp(base).grayscale().toBuffer();
    await framed(gray).webp({ quality: 86 }).toFile(`${OUT}/${slug}_bw.webp`);

    const m = await sharp(`${OUT}/${slug}.webp`).metadata();
    console.log(slug, '->', `${m.width}x${m.height} ratio ${(m.width / m.height).toFixed(2)}`);
}
console.log('done');
