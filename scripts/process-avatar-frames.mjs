// Convert the 10 new avatar wave frames (already alpha-cut) to sized WebP,
// ordered by their (N) index -> avatar_new/1.webp .. 10.webp.
// Run: node scripts/process-avatar-frames.mjs
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', 'public', 'textures', 'corridor', 'avatar_anim', 'New Avatar');
const OUT = path.join(__dirname, '..', 'public', 'textures', 'corridor', 'avatar_new');
fs.mkdirSync(OUT, { recursive: true });

const files = fs.readdirSync(SRC)
    .filter((f) => /\.png$/i.test(f))
    .map((f) => ({ f, n: parseInt((f.match(/\((\d+)\)/) || [])[1], 10) }))
    .filter((x) => !Number.isNaN(x.n))
    .sort((a, b) => a.n - b.n);

(async () => {
    let i = 1;
    for (const { f } of files) {
        await sharp(path.join(SRC, f))
            .resize({ width: 512, height: 768, fit: 'inside' })
            .webp({ quality: 88, alphaQuality: 100 })
            .toFile(path.join(OUT, `${i}.webp`));
        console.log(`${f} -> avatar_new/${i}.webp`);
        i++;
    }
    console.log('done', i - 1, 'frames');
})();
