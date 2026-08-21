// Processes the "New Decor" corridor assets:
//  - flat textures (wall/ceiling/floor/wood) -> resized WebP
//  - cut-out props (tree/seedling/dresser/rail) -> background knockout + de-fringe -> trimmed WebP
// Run: node scripts/process-new-decor.mjs
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', 'public', 'textures', 'corridor', 'New Decor');
const OUT = path.join(__dirname, '..', 'public', 'textures', 'corridor');
const f = (n) => path.join(SRC, `ChatGPT Image Aug 21, 2026, ${n}.png`);

// Map the (n) suffixes to their source files.
const FILES = {
  wall:     f('11_38_11 AM (1)'),
  ceiling:  f('11_38_12 AM (2)'),
  tree:     f('11_38_12 AM (3)'),
  seedling: f('11_38_13 AM (4)'),
  dresser:  f('11_38_13 AM (5)'),
  woodV:    f('11_38_14 AM (6)'),
  rail:     f('11_38_14 AM (7)'),
  woodH:    f('11_38_14 AM (8)'),
  floor:    f('11_38_15 AM (9)'),
};

// --- flat texture: resize longest side, webp ---
async function flat(src, out, maxSide = 1200, quality = 84) {
  await sharp(src)
    .resize({ width: maxSide, height: maxSide, fit: 'inside', withoutEnlargement: true })
    .webp({ quality })
    .toFile(path.join(OUT, out));
  console.log('flat  ->', out);
}

// --- knock out a near-uniform background by flood-filling from the borders ---
// bgTest(r,g,b,a) -> true if pixel looks like background. Fill connected border region to alpha 0.
async function knockout(src, out, bgTest, { erode = 1, trim = true } = {}) {
  const img = sharp(src).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const idx = (x, y) => (y * W + x) * C;
  const visited = new Uint8Array(W * H);
  const stack = [];
  const pushIf = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const p = y * W + x;
    if (visited[p]) return;
    visited[p] = 1;
    const i = idx(x, y);
    if (bgTest(data[i], data[i + 1], data[i + 2], data[i + 3])) {
      data[i + 3] = 0; // transparent
      stack.push(x, y);
    }
  };
  for (let x = 0; x < W; x++) { pushIf(x, 0); pushIf(x, H - 1); }
  for (let y = 0; y < H; y++) { pushIf(0, y); pushIf(W - 1, y); }
  while (stack.length) {
    const y = stack.pop(), x = stack.pop();
    pushIf(x + 1, y); pushIf(x - 1, y); pushIf(x, y + 1); pushIf(x, y - 1);
  }

  // Erode the alpha edge a little to eat coloured fringe left by the matte.
  if (erode > 0) {
    for (let e = 0; e < erode; e++) {
      const clear = [];
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = idx(x, y);
        if (data[i + 3] === 0) continue;
        // if any 4-neighbour is transparent, mark this edge pixel for clearing
        const n = [[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy]) => {
          const nx = x+dx, ny = y+dy;
          return nx<0||ny<0||nx>=W||ny>=H || data[idx(nx,ny)+3] === 0;
        });
        if (n) clear.push(i);
      }
      for (const i of clear) data[i + 3] = 0;
    }
  }

  let pipe = sharp(data, { raw: { width: W, height: H, channels: C } });
  if (trim) pipe = pipe.trim({ threshold: 1 }); // crop transparent margins
  await pipe.webp({ quality: 90 }).toFile(path.join(OUT, out));
  console.log('cutout->', out);
}

(async () => {
  // Flat textures
  await flat(FILES.wall, 'nc_wall.webp');
  await flat(FILES.ceiling, 'nc_ceiling.webp');
  await flat(FILES.floor, 'nc_floor.webp');
  await flat(FILES.woodV, 'nc_wood_v.webp', 1400);
  await flat(FILES.woodH, 'nc_wood_h.webp', 1600);

  // Rail: cream background -> knock out (cream is bright & low-saturation)
  await knockout(FILES.rail, 'nc_rail.webp',
    (r, g, b) => r > 232 && g > 226 && b > 214 && Math.max(r,g,b) - Math.min(r,g,b) < 22,
    { erode: 1 });

  // Tree & dresser: already alpha; bg is (near) transparent — just de-fringe via erode.
  await knockout(FILES.tree, 'nc_tree.webp',
    (r, g, b, a) => a < 12, { erode: 2 });
  await knockout(FILES.dresser, 'nc_dresser.webp',
    (r, g, b, a) => a < 12, { erode: 2 });

  // Seedling: opaque black glow background -> knock out near-black pixels.
  await knockout(FILES.seedling, 'nc_seedling.webp',
    (r, g, b) => r < 60 && g < 60 && b < 55, { erode: 2 });

  console.log('done');
})();
