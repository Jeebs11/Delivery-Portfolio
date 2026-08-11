// Process the "New Entrance" deconstructed PNGs into clean, named webp assets
// for the MUJEEB HQ landing scene.
import sharp from 'sharp';
import { mkdirSync } from 'fs';

const SRC = 'public/textures/entrance/New Entrance';
const OUT = 'public/textures/entrance/landing';
mkdirSync(OUT, { recursive: true });

// [sourceFile, outName, maxSize, trim?]
const MAP = [
    ['ChatGPT Image Aug 11, 2026, 09_45_20 PM (1).png', 'door_about', 800, true],
    ['ChatGPT Image Aug 11, 2026, 09_45_20 PM (2).png', 'door_career', 800, true],
    ['ChatGPT Image Aug 11, 2026, 09_45_20 PM (3).png', 'door_sideprojects', 800, true],
    ['ChatGPT Image Aug 11, 2026, 09_45_20 PM (4).png', 'tree', 1200, true],
    ['ChatGPT Image Aug 11, 2026, 09_45_20 PM (5).png', 'signpost', 700, true],
    ['ChatGPT Image Aug 11, 2026, 09_45_20 PM (6).png', 'bike', 900, true],
    ['ChatGPT Image Aug 11, 2026, 09_45_20 PM (7).png', 'plane', 500, true],
    ['ChatGPT Image Aug 11, 2026, 09_45_20 PM (8).png', 'cloud_sm', 500, true],
    ['ChatGPT Image Aug 11, 2026, 09_45_21 PM (9).png', 'cloud_md', 700, true],
    ['ChatGPT Image Aug 11, 2026, 09_45_21 PM (10).png', 'cloud_lg', 800, true],
    ['94d8aa06-575e-4713-b1b4-74cddecaf499.png', 'wall', 1600, false],
    ['4e690f66-f2bb-4dbc-a3fd-e732854425f8.png', 'vines', 900, true],
    ['3de3f6e0-3873-473e-9ec5-4fb98187fb6e.png', 'lamp', 500, true],
    ['d2859ae9-ae7a-4635-af48-44b1e518905d.png', 'plants_right', 700, true],
    ['87475e88-4a68-4564-af90-947700dba5c6.png', 'plants_left', 800, true],
    ['74e8e854-0711-4861-8597-87b4699dacf9.png', 'rock', 700, true],
    ['c17265d3-0158-4c76-ae09-e15f337c8c73.png', 'valuebar', 1600, true],
    ['7cdb0413-4f78-4182-b53b-a6ef7b1f3ad7.png', 'wordmark', 1200, true],
    ['a6907328-74d2-4c1c-9f6b-3fe62957b651.png', 'subtitle', 1400, true],
    ['a5613720-ed73-4c08-a824-8c73db7f7505.png', 'intro', 1200, true],
    ['bc842b0c-e3c0-49ab-bb53-fcd6ff7c25d2.png', 'pickdoor', 900, true],
];

const aspects = {};
for (const [f, name, max, doTrim] of MAP) {
    let pipe = sharp(`${SRC}/${f}`);
    if (doTrim) pipe = pipe.trim({ threshold: 10 });
    await pipe.resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 88 })
        .toFile(`${OUT}/${name}.webp`);
    const m = await sharp(`${OUT}/${name}.webp`).metadata();
    aspects[name] = +(m.width / m.height).toFixed(3);
    console.log(name.padEnd(18), `${m.width}x${m.height}`, aspects[name]);
}
console.log('\nASPECTS =', JSON.stringify(aspects));
