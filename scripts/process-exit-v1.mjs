// Swap the exit-wall textures for the realistic v1 art (no code change — SegmentDoors
// references these filenames). Posters/sign/talk are contained (no distortion);
// door leaf + casing matched to aspect; talk panel's black bg knocked out.
// Run: node scripts/process-exit-v1.mjs
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'design', 'corridor-elements', '03-exit-wall.v1');
const T = path.join(ROOT, 'public', 'textures');
const files = fs.readdirSync(SRC).filter((f) => /\.png/i.test(f));
const find = (...frags) => {
  const f = files.find((x) => frags.every((g) => x.includes(g)));
  if (!f) throw new Error('missing ' + frags.join('+'));
  return path.join(SRC, f);
};

// erode partial-alpha edges (kills red/yellow matte fringe)
async function defringe(buf, erode = 2) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const idx = (x, y) => (y * W + x) * C;
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
  return sharp(data, { raw: { width: W, height: H, channels: C } }).png().toBuffer();
}

// flood-fill knock out a near-black background from the borders
async function knockBlack(src) {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const idx = (x, y) => (y * W + x) * C; const vis = new Uint8Array(W * H); const s = [];
  const black = (i) => data[i] < 40 && data[i + 1] < 40 && data[i + 2] < 40;
  const push = (x, y) => { if (x < 0 || y < 0 || x >= W || y >= H) return; const p = y * W + x; if (vis[p]) return; vis[p] = 1; const i = idx(x, y); if (black(i)) { data[i + 3] = 0; s.push(x, y); } };
  for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); } for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }
  while (s.length) { const y = s.pop(), x = s.pop(); push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1); }
  return sharp(data, { raw: { width: W, height: H, channels: C } }).png().toBuffer();
}

// contain the (defringed) art into WxH with transparent padding (no distortion)
async function contain(buf, out, W, H) {
  await sharp(buf).resize(W, H, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 90, alphaQuality: 100 }).toFile(out);
  console.log('->', path.basename(out));
}

(async () => {
  // Exit double-door leaf + casing
  await sharp(find('09_50_29', '(1)')).resize(512, 1024, { fit: 'inside' })
    .webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(T, 'corridor/doors/backsingledoors_wood.webp'));
  console.log('-> backsingledoors_wood');
  await contain(await defringe(find('09_50_29', '(5)')), path.join(T, 'corridor/doors/frame_sketch_wood.webp'), 512, 512);

  // Framed posters + sign
  await contain(await defringe(find('11_40_14')), path.join(T, 'exit/exit_plan.webp'), 900, 608);
  await contain(await defringe(find('11_40_07')), path.join(T, 'exit/exit_enhance.webp'), 900, 590);
  await contain(await defringe(find('11_40_12')), path.join(T, 'exit/exit_lead.webp'), 900, 608);
  await contain(await defringe(find('11_40_08')), path.join(T, 'exit/exit_sign.webp'), 734, 800);

  // Let's talk panel (black bg -> transparent)
  await contain(await knockBlack(find('11_40_25')), path.join(T, 'exit/exit_talk.webp'), 884, 875);
  console.log('done');
})();
