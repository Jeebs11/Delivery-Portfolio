// Swap in the realistic v1 surface textures over the nc_* files.
// Run: node scripts/swap-surfaces-v1.mjs
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'design', 'corridor-elements', '01-surfaces.v1');
const OUT = path.join(ROOT, 'public', 'textures', 'corridor');

const byIndex = (n) => {
  const f = fs.readdirSync(SRC).find((x) => new RegExp(`\\(${n}\\)\\.png$`).test(x));
  if (!f) throw new Error('missing surface (' + n + ')');
  return path.join(SRC, f);
};

// Crop the skirting image to just its wood band (strip sits on white).
async function cropRail(src, out) {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  let minY = H, maxY = 0;
  for (let y = 0; y < H; y++) {
    let wood = 0;
    for (let x = 0; x < W; x += 8) {
      const i = (y * W + x) * C;
      // "wood" = not near-white
      if (!(data[i] > 232 && data[i + 1] > 228 && data[i + 2] > 220)) wood++;
    }
    if (wood > W / 8 * 0.4) { if (y < minY) minY = y; if (y > maxY) maxY = y; }
  }
  const pad = 2;
  minY = Math.max(0, minY - pad); maxY = Math.min(H - 1, maxY + pad);
  await sharp(src).extract({ left: 0, top: minY, width: W, height: maxY - minY + 1 })
    .webp({ quality: 88 }).toFile(out);
  console.log('rail -> nc_rail.webp  (cropped band', minY, '-', maxY, ')');
}

async function flat(src, out, w, h) {
  await sharp(src).resize({ width: w, height: h, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 86 }).toFile(out);
  console.log('->', path.basename(out));
}

(async () => {
  await flat(byIndex(1), path.join(OUT, 'nc_wall.webp'), 1400, 1400);
  await flat(byIndex(4), path.join(OUT, 'nc_ceiling.webp'), 1400, 1400);
  await flat(byIndex(2), path.join(OUT, 'nc_floor.webp'), 1400, 1400);
  await cropRail(byIndex(3), path.join(OUT, 'nc_rail.webp'));
  await flat(byIndex(5), path.join(OUT, 'nc_wood_h.webp'), 1600, 1600);
  await flat(byIndex(6), path.join(OUT, 'nc_wood_v.webp'), 1400, 1400);
  console.log('done');
})();
