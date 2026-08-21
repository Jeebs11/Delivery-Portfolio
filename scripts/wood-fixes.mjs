// Follow-up wood fixes:
//  - door frame: proper wood (multiply over wood, re-mask original alpha)
//  - career/portfolio painted: boost the faint colour halo so the hover reveal
//    is as vivid as the About/Contact doors
//  - chest of drawers (szafka): wood-multiply like the doors
// Run: node scripts/wood-fixes.mjs
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const C = path.join(__dirname, '..', 'public', 'textures', 'corridor');
const WOOD = path.join(C, 'nc_wood_v.webp');

async function woodBuf(w, h) {
  return sharp(WOOD).resize(w, h, { fit: 'cover', position: 'centre' }).toBuffer();
}

// Opaque line-art -> wood (white becomes wood, ink stays).
async function woodMultiply(srcRel, outRel, { saturation = 1 } = {}) {
  const src = path.join(C, srcRel);
  const { width, height } = await sharp(src).metadata();
  const wood = await woodBuf(width, height);
  let art = sharp(src);
  if (saturation !== 1) art = art.modulate({ saturation });
  const artBuf = await art.toBuffer();
  await sharp(artBuf)
    .composite([{ input: wood, blend: 'multiply' }])
    .webp({ quality: 88 })
    .toFile(path.join(C, outRel));
  console.log('wood ->', outRel);
}

// Transparent line-art (door frame) -> wood, keep the original alpha.
async function woodFrame(srcRel, outRel) {
  const src = path.join(C, srcRel);
  const { width, height } = await sharp(src).metadata();
  const wood = await woodBuf(width, height);
  const multiplied = await sharp(wood)
    .composite([{ input: src, blend: 'multiply' }])
    .png()
    .toBuffer();
  await sharp(multiplied)
    .composite([{ input: src, blend: 'dest-in' }]) // re-apply frame alpha
    .webp({ quality: 90 })
    .toFile(path.join(C, outRel));
  console.log('frame->', outRel);
}

(async () => {
  await woodFrame('doors/ramkasingledoors.webp', 'doors/ramkasingledoors_wood.webp');

  // Boost the colour so the reveal actually shows (halos are very faint).
  await woodMultiply('doors/career_door_painted.webp', 'doors/career_door_painted_wood.webp', { saturation: 4 });
  await woodMultiply('doors/portfolio_door_painted.webp', 'doors/portfolio_door_painted_wood.webp', { saturation: 4 });

  // Chest of drawers
  await woodMultiply('szafkaprzod.webp', 'szafkaprzod_wood.webp');
  await woodMultiply('szafkaprzodgora.webp', 'szafkaprzodgora_wood.webp');

  console.log('done');
})();
