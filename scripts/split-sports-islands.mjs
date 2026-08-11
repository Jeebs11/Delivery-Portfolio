// Split the 4-in-1 sports cluster into four separate floating islands so they
// can be spaced out around the family island (de-clutter Layer 2).
import sharp from 'sharp';

const SRC = 'public/textures/about/concept/07cc4768-b5b8-4328-a733-074e35d37aab.png';
const OUT = 'public/textures/about/layers';

// crop boxes over the 1400x955 composite (left, top, width, height)
const BOXES = [
    ['l2-football', 355, 0, 640, 430],    // helmet + football (top-centre)
    ['l2-soccer', 0, 305, 450, 440],      // soccer ball (mid-left)
    ['l2-basketball', 445, 515, 560, 440],// basketball + hoop (bottom-centre)
    ['l2-golf', 965, 285, 435, 460],      // golf flag + club (right)
];

const meta = await sharp(SRC).metadata();
console.log('source', `${meta.width}x${meta.height}`);

for (const [name, left, top, width, height] of BOXES) {
    await sharp(SRC)
        .extract({ left, top, width, height })
        .trim({ threshold: 8 })
        .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 88 })
        .toFile(`${OUT}/${name}.webp`);
    const m = await sharp(`${OUT}/${name}.webp`).metadata();
    console.log(name, '->', `${m.width}x${m.height}`, (m.width / m.height).toFixed(2));
}
console.log('done');
