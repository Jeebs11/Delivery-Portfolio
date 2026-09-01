// Process realistic furniture/plants: knock out white bg for billboards, crop the
// cabinet front, resize the cabinet wood. Prints new aspect ratios for code.
// Run: node scripts/process-furniture-v1.mjs
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'design', 'corridor-elements', '04-furniture-plants.v1');
const OUT = path.join(ROOT, 'public', 'textures', 'corridor');
const files = fs.readdirSync(SRC).filter((f) => /\.png$/i.test(f));
const byIndex = (n) => path.join(SRC, files.find((f) => new RegExp(`\\(${n}\\)\\.png$`).test(f)));

// Flood-fill knock out a near-white background from the borders; trim; report aspect.
async function knockoutWhite(src, out, { erode = 2 } = {}) {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const idx = (x, y) => (y * W + x) * C;
  const vis = new Uint8Array(W * H); const st = [];
  const isWhite = (i) => data[i] > 238 && data[i + 1] > 238 && data[i + 2] > 234;
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const p = y * W + x; if (vis[p]) return; vis[p] = 1;
    const i = idx(x, y); if (isWhite(i)) { data[i + 3] = 0; st.push(x, y); }
  };
  for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
  for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }
  while (st.length) { const y = st.pop(), x = st.pop(); push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1); }
  for (let e = 0; e < erode; e++) {
    const clr = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = idx(x, y); if (data[i + 3] === 0) continue;
      const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx < 0 || ny < 0 || nx >= W || ny >= H || data[idx(nx, ny) + 3] === 0; });
      if (nb) clr.push(i);
    }
    for (const i of clr) data[i + 3] = 0;
  }
  const info2 = await sharp(data, { raw: { width: W, height: H, channels: C } }).trim({ threshold: 1 })
    .webp({ quality: 90, alphaQuality: 100 }).toFile(out).then(() => sharp(out).metadata());
  console.log(path.basename(out), info2.width + 'x' + info2.height, 'aspect(w/h)=', (info2.width / info2.height).toFixed(3));
}

async function cropWhite(src, out) {
  // crop away near-white margins (for a solid front face)
  const trimmed = await sharp(src).trim({ threshold: 10 }).toBuffer();
  await sharp(trimmed).resize({ width: 900, fit: 'inside' }).webp({ quality: 88 }).toFile(out);
  const m = await sharp(out).metadata();
  console.log(path.basename(out), m.width + 'x' + m.height);
}

async function flat(src, out, w) {
  await sharp(src).resize({ width: w, fit: 'inside' }).webp({ quality: 88 }).toFile(out);
  console.log(path.basename(out));
}

(async () => {
  await knockoutWhite(byIndex(5), path.join(OUT, 'nc_tree.webp'));
  await knockoutWhite(byIndex(4), path.join(OUT, 'nc_seedling.webp'));
  await knockoutWhite(byIndex(3), path.join(OUT, 'nc_dresser.webp'));
  await cropWhite(byIndex(1), path.join(OUT, 'szafkaprzod_wood.webp'));
  await flat(byIndex(2), path.join(OUT, 'szafkaprzodgora_wood.webp'), 1000);
})();
