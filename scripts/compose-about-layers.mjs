// Rename + web-optimise the deconstructed About-room images into clean layer assets.
import sharp from 'sharp';
import { mkdirSync } from 'fs';

const SRC = 'public/textures/about/concept';
const OUT = 'public/textures/about/layers';
mkdirSync(OUT, { recursive: true });

const MAP = [
    // Layer 1 — Mujeeb at work
    ['456a282a-d6c6-4815-a7bd-f60c205b63c9.png', 'l1-character', 1400],
    ['cb38c5eb-7177-40f0-9752-e1609f31dcbf.png', 'l1-wordmark', 1000],
    ['f8b566d6-ef3b-4c03-bd00-f9d79033f874.png', 'l1-subtitle', 1000],
    ['ChatGPT Image Aug 11, 2026, 05_13_57 PM (1).png', 'l1-roadmap', 900],
    ['ChatGPT Image Aug 11, 2026, 05_13_57 PM (2).png', 'l1-gantt', 900],
    ['ChatGPT Image Aug 11, 2026, 05_13_58 PM (3).png', 'l1-stakeholder', 900],
    ['ChatGPT Image Aug 11, 2026, 05_13_59 PM (4).png', 'l1-workflow', 900],
    ['ChatGPT Image Aug 11, 2026, 05_13_59 PM (5).png', 'l1-framework', 900],
    // Layer 2 — Beyond work
    ['07cc4768-b5b8-4328-a733-074e35d37aab.png', 'l2-sports', 1400],
    ['2e1b9627-7f92-49c2-b094-e5f9444c0eea.png', 'l2-cycling', 1000],
    ['3897a88a-1093-4360-879f-d2aa98f47990.png', 'l2-travel', 1000],
    // Layer 3 — What drives me
    ['dcb39b59-8b77-4889-bc9c-bf23eb909ddc.png', 'l3-book', 1000],
    ['a744ceaa-f7a6-467b-8c9e-5d38058039c6.png', 'l3-bulb', 600],
    ['1e8d09cd-d700-4d14-b00e-28d655df799c.png', 'l3-productivity', 700],
    ['408024ab-5255-42f2-9e46-55437b97aa06.png', 'l3-learning', 700],
    ['60d6feed-32e4-482a-ae47-3340de68100b.png', 'l3-portfolio', 700],
    ['8ee7eb0c-f67f-42e9-829e-be4dc2209838.png', 'l3-bot', 1400],
];

for (const [f, name, w] of MAP) {
    await sharp(`${SRC}/${f}`).trim().resize({ width: w, height: w, fit: 'inside', withoutEnlargement: true }).webp({ quality: 88 }).toFile(`${OUT}/${name}.webp`);
    const m = await sharp(`${OUT}/${name}.webp`).metadata();
    console.log(name, '->', `${m.width}x${m.height}`, (m.width / m.height).toFixed(2));
}
console.log('done');
