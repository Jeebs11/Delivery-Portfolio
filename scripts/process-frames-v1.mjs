// Process realistic frames + fixtures: erode the coloured matte fringe, force to
// the original aspect so they drop into the existing meshes.
// Run: node scripts/process-frames-v1.mjs
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'design', 'corridor-elements', '05-frames-fixtures.v1');
const OUT = path.join(ROOT, 'public', 'textures', 'corridor');
const files = fs.readdirSync(SRC).filter((f) => /\.png$/i.test(f));
const byIndex = (n) => path.join(SRC, files.find((f) => new RegExp(`\\(${n}\\)\\.png$`).test(f)));
const named = (frag) => path.join(SRC, files.find((f) => f.includes(frag)));

// erode partial-alpha edges (removes red/yellow fringe), then force to w x h.
async function process(src, out, w, h, erode = 2) {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const idx = (x, y) => (y * W + x) * C;
  // knock any semi-transparent pixel toward its state, then erode opaque edge
  for (let e = 0; e < erode; e++) {
    const clr = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = idx(x, y);
      if (data[i + 3] < 200) { data[i + 3] = 0; continue; }
      const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx < 0 || ny < 0 || nx >= W || ny >= H || data[idx(nx, ny) + 3] < 200; });
      if (nb) clr.push(i);
    }
    for (const i of clr) data[i + 3] = 0;
  }
  await sharp(data, { raw: { width: W, height: H, channels: C } })
    .resize(w, h, { fit: 'fill' })
    .webp({ quality: 90, alphaQuality: 100 }).toFile(out);
  console.log('->', path.basename(out));
}

(async () => {
  const wood = named('4b105d2c');
  await process(wood, path.join(OUT, 'ramkanazdjecieduza.webp'), 2048, 1024);
  await process(wood, path.join(OUT, 'ramkanazdjecieduza_painted.webp'), 2048, 1024);
  await process(byIndex(5), path.join(OUT, 'ramkanazdjeciemala.webp'), 512, 1024);
  await process(byIndex(6), path.join(OUT, 'kratkawentylacyjna.webp'), 2048, 1024);
  await process(byIndex(1), path.join(OUT, 'kratanalampy.webp'), 1515, 757);
  console.log('done');
})();
