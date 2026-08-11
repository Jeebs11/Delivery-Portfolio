// Process the user's deconstructed transparent PNGs into clean hero assets:
// trim transparent padding, resize, export webp. Panels overwrite the earlier
// crops; the character + airplane/tagline are prepped for the hero scene.
import sharp from 'sharp';

const RAW = 'design/hero-src';                        // raw deconstructed originals (not deployed)
const SRC = 'public/textures/corridor/avatar_src';   // derived runtime assets
const HUD = 'public/textures/corridor/hud';

// map deconstructed file -> [destination, kind]
const MAP = [
    ['ChatGPT Image Aug 11, 2026, 01_15_28 AM (1).png', `${SRC}/character.png`, 'char'],
    ['ChatGPT Image Aug 11, 2026, 01_15_29 AM (2).png', `${HUD}/roadmap.webp`, 'panel'],
    ['ChatGPT Image Aug 11, 2026, 01_15_29 AM (3).png', `${HUD}/gantt.webp`, 'panel'],
    ['ChatGPT Image Aug 11, 2026, 01_15_30 AM (4).png', `${HUD}/stakeholder.webp`, 'panel'],
    ['ChatGPT Image Aug 11, 2026, 01_15_30 AM (5).png', `${HUD}/kanban.webp`, 'panel'],
    ['ChatGPT Image Aug 11, 2026, 01_15_31 AM (6).png', `${HUD}/raid.webp`, 'panel'],
    ['ChatGPT Image Aug 11, 2026, 01_15_31 AM (7).png', `${HUD}/framework.webp`, 'panel'],
    ['ChatGPT Image Aug 11, 2026, 01_15_32 AM (8).png', `${HUD}/workflow.webp`, 'panel'],
    ['ChatGPT Image Aug 11, 2026, 01_15_33 AM (9).png', `${HUD}/airplane.webp`, 'panel'],
    ['ChatGPT Image Aug 11, 2026, 01_19_53 AM.png', `${SRC}/wordmark.png`, 'char'],
    ['ChatGPT Image Aug 11, 2026, 01_29_11 AM.png', `${SRC}/subtitle.png`, 'char'],
];

for (const [file, dest, kind] of MAP) {
    let img = sharp(`${RAW}/${file}`).trim(); // remove transparent padding
    if (kind === 'panel') {
        img = img.resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true });
        await img.webp({ quality: 90 }).toFile(dest);
    } else {
        img = img.resize({ width: 1100, height: 1600, fit: 'inside', withoutEnlargement: true });
        await img.png().toFile(dest);
    }
    const m = await sharp(dest).metadata();
    console.log(dest.split('/').pop(), '->', `${m.width}x${m.height} ratio ${(m.width / m.height).toFixed(2)}`);
}
console.log('done');
