// Individual transparent textures for the 3D exit wall (replaces the loop doodles).
import sharp from 'sharp';
import { readdirSync } from 'fs';
const SRC = 'public/textures/exit/source';
const OUT = 'public/textures/exit';
const all = readdirSync(SRC).filter(f => /\.png$/i.test(f));
const by = n => all.find(f => f.includes(`(${n}).png`));
const MAP = [
    [1, 'exit_thankyou', 1200],
    [2, 'exit_plan', 900],
    [3, 'exit_enhance', 900],
    [4, 'exit_lead', 900],
    [6, 'exit_talk', 1000],
    [7, 'exit_sign', 800],
    [8, 'exit_plant', 700],
];
const asp = {};
for (const [n, name, w] of MAP) {
    await sharp(`${SRC}/${by(n)}`).trim({ threshold: 8 }).resize({ width: w, height: w, fit: 'inside', withoutEnlargement: true }).webp({ quality: 90 }).toFile(`${OUT}/${name}.webp`);
    const m = await sharp(`${OUT}/${name}.webp`).metadata();
    asp[name] = +(m.width / m.height).toFixed(3);
    console.log(name.padEnd(14), `${m.width}x${m.height}`, asp[name]);
}
console.log('ASPECTS', JSON.stringify(asp));
