// Process the new About assets: the Layer-2 dad+son island and the Layer-3
// "Achievements" set (certificates, trophy, stat clouds, cloud base).
import sharp from 'sharp';
import { mkdirSync } from 'fs';

const SRC = 'public/textures/about/concept';
const OUT = 'public/textures/about/layers';
mkdirSync(OUT, { recursive: true });

const MAP = [
    // Layer 2 — family
    ['3cf506ae-2331-43be-a0cb-3ee6979a74cf.png', 'l2-family', 1200],
    // Layer 3 — certificates
    ['ChatGPT Image Aug 11, 2026, 07_51_02 PM (1).png', 'l3-cert-prince2', 700],
    ['ChatGPT Image Aug 11, 2026, 07_51_02 PM (2).png', 'l3-cert-psm1', 700],
    ['ChatGPT Image Aug 11, 2026, 07_51_03 PM (3).png', 'l3-cert-psm2', 700],
    ['ChatGPT Image Aug 11, 2026, 07_51_03 PM (4).png', 'l3-cert-pmp', 700],
    // Layer 3 — trophy + stat clouds (text baked in)
    ['ChatGPT Image Aug 11, 2026, 07_51_04 PM (5).png', 'l3-trophy', 700],
    ['ChatGPT Image Aug 11, 2026, 07_51_04 PM (6).png', 'l3-stat-years', 800],
    ['ChatGPT Image Aug 11, 2026, 07_51_05 PM (7).png', 'l3-stat-reporting', 800],
    ['ChatGPT Image Aug 11, 2026, 07_51_05 PM (8).png', 'l3-stat-portfolio', 800],
    ['ChatGPT Image Aug 11, 2026, 07_51_05 PM (9).png', 'l3-stat-processes', 800],
    // Layer 3 — cloud platform under the certificates
    ['d66dc2d6-f809-4e6c-acd5-372e5b5efa5d.png', 'l3-cloud', 1200],
];

for (const [f, name, w] of MAP) {
    await sharp(`${SRC}/${f}`).trim({ threshold: 8 }).resize({ width: w, height: w, fit: 'inside', withoutEnlargement: true }).webp({ quality: 88 }).toFile(`${OUT}/${name}.webp`);
    const m = await sharp(`${OUT}/${name}.webp`).metadata();
    console.log(name, '->', `${m.width}x${m.height}`, (m.width / m.height).toFixed(2));
}
console.log('done');
