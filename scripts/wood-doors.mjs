// Make the corridor doors/frame/plaque warm wood while keeping the line-art
// (panels + graffiti word-art) inked on top. Multiply blend: white -> wood,
// black -> black. Base + painted are both produced so the hover reveal still works.
// Run: node scripts/wood-doors.mjs
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const C = path.join(__dirname, '..', 'public', 'textures', 'corridor');
const D = path.join(C, 'doors');
const WOOD = path.join(C, 'nc_wood_v.webp');

// Multiply a line-art (opaque, dark-on-white) over the wood texture.
async function woodMultiply(srcRel, outRel) {
  const src = path.join(C, srcRel);
  const { width, height } = await sharp(src).metadata();
  const wood = await sharp(WOOD)
    .resize(width, height, { fit: 'cover', position: 'centre' })
    .toBuffer();
  await sharp(src)
    .composite([{ input: wood, blend: 'multiply' }])
    .webp({ quality: 88 })
    .toFile(path.join(C, outRel));
  console.log('wood ->', outRel);
}

// Tint transparent line-art (the door frame) to a warm brown, keep alpha.
async function tintWarm(srcRel, outRel) {
  await sharp(path.join(C, srcRel))
    .tint({ r: 150, g: 108, b: 66 })
    .webp({ quality: 90 })
    .toFile(path.join(C, outRel));
  console.log('tint ->', outRel);
}

(async () => {
  const doors = [
    'doors/career_door', 'doors/career_door_painted',
    'doors/portfolio_door', 'doors/portfolio_door_painted',
    'doors/drzwiabout', 'doors/drzwiabout_painted',
    'doors/drzwikontakt', 'doors/drzwikontakt_painted',
    'doors/backsingledoors',
  ];
  for (const d of doors) await woodMultiply(`${d}.webp`, `${d}_wood.webp`);

  await woodMultiply('pustatabliczka.webp', 'pustatabliczka_wood.webp');
  await tintWarm('doors/ramkasingledoors.webp', 'doors/ramkasingledoors_wood.webp');
  await tintWarm('strzalka.webp', 'strzalka_wood.webp');
  console.log('done');
})();
