// Process realistic floating elements: whiteboards (knock out the grey wall bg,
// keep the board) + doodles (already cut, just defringe/convert).
// Run: node scripts/process-floating-v1.mjs
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'design', 'corridor-elements', '09-floating.v1');
const C = path.join(ROOT, 'public', 'textures', 'corridor');
const files = fs.readdirSync(SRC).filter((f) => /\.png$/i.test(f));
const find = (...frags) => {
  const f = files.find((x) => frags.every((g) => x.includes(g)));
  if (!f) throw new Error('missing ' + frags.join('+'));
  return path.join(SRC, f);
};

// Knock out the wall background: flood-fill from borders removing pixels that are
// transparent OR low-saturation and darker than the white board. Stops at the
// bright board (>lumKeep). Then erode to clean the edge.
async function board(src, out, { lumKeep = 233, erode = 2 } = {}) {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const idx = (x, y) => (y * W + x) * C;
  const isBg = (i) => {
    if (data[i + 3] < 40) return true;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const sat = mx === 0 ? 0 : (mx - mn) / mx;
    return sat < 0.16 && lum < lumKeep; // grey wall + metal frame, not the white board
  };
  const vis = new Uint8Array(W * H); const st = [];
  const push = (x, y) => { if (x < 0 || y < 0 || x >= W || y >= H) return; const p = y * W + x; if (vis[p]) return; vis[p] = 1; const i = idx(x, y); if (isBg(i)) { data[i + 3] = 0; st.push(x, y); } };
  for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); } for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }
  while (st.length) { const y = st.pop(), x = st.pop(); push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1); }
  for (let e = 0; e < erode; e++) {
    const clr = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = idx(x, y); if (data[i + 3] === 0) continue; const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx < 0 || ny < 0 || nx >= W || ny >= H || data[idx(nx, ny) + 3] === 0; }); if (nb) clr.push(i); }
    for (const i of clr) data[i + 3] = 0;
  }
  await sharp(data, { raw: { width: W, height: H, channels: C } }).trim({ threshold: 1 })
    .webp({ quality: 90, alphaQuality: 100 }).toFile(out);
  console.log('board->', path.basename(out));
}

// Doodle: already alpha-cut, just erode a hair + resize + convert.
async function doodle(src, out, size = 512) {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const idx = (x, y) => (y * W + x) * C;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = idx(x, y); if (data[i + 3] < 60) data[i + 3] = 0; }
  await sharp(data, { raw: { width: W, height: H, channels: C } }).trim({ threshold: 1 })
    .resize({ width: size, height: size, fit: 'inside' }).webp({ quality: 90, alphaQuality: 100 }).toFile(out);
  console.log('doodle->', path.basename(out));
}

(async () => {
  // whiteboards -> hud/ (HudPanels auto-sizes to aspect)
  await board(find('04_45_58', '(9)'), path.join(C, 'hud/roadmap.webp'));
  await board(find('04_46_23'), path.join(C, 'hud/stakeholder.webp'));
  await board(find('04_46_24'), path.join(C, 'hud/framework.webp'));
  await board(find('04_45_53', '(6)'), path.join(C, 'hud/gantt.webp'));
  await board(find('04_45_57', '(7)'), path.join(C, 'hud/kanban.webp'));
  await board(find('04_45_57', '(8)'), path.join(C, 'hud/raid.webp'));
  await board(find('04_45_51', '(5)'), path.join(C, 'hud/workflow.webp'));

  // doodles -> decorations/ (Doodles auto-sizes to aspect)
  await doodle(find('04_45_47', '(1)'), path.join(C, 'decorations/coffee_cup.webp'));
  await doodle(find('04_45_48', '(2)'), path.join(C, 'decorations/paper_ball.webp'));
  await doodle(find('04_45_50', '(3)'), path.join(C, 'decorations/paper_airplane.webp'));
  await doodle(find('04_45_50', '(4)'), path.join(C, 'decorations/pencil.webp'));
  console.log('done');
})();
