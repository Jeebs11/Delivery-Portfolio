// Wood-treat the exit-wall double doors (frame, back, edge trim).
// Run: node scripts/wood-exit.mjs
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const C = path.join(__dirname, '..', 'public', 'textures', 'corridor');
const WOOD = path.join(C, 'nc_wood_v.webp');
const woodBuf = (w, h) => sharp(WOOD).resize(w, h, { fit: 'cover', position: 'centre' }).toBuffer();

async function woodMultiply(srcRel, outRel) {
  const src = path.join(C, srcRel);
  const { width, height } = await sharp(src).metadata();
  const wood = await woodBuf(width, height);
  await sharp(src).composite([{ input: wood, blend: 'multiply' }]).webp({ quality: 88 }).toFile(path.join(C, outRel));
  console.log('wood ->', outRel);
}
async function woodFrame(srcRel, outRel) {
  const src = path.join(C, srcRel);
  const { width, height } = await sharp(src).metadata();
  const wood = await woodBuf(width, height);
  const multiplied = await sharp(wood).composite([{ input: src, blend: 'multiply' }]).png().toBuffer();
  await sharp(multiplied).composite([{ input: src, blend: 'dest-in' }]).webp({ quality: 90 }).toFile(path.join(C, outRel));
  console.log('frame->', outRel);
}

(async () => {
  await woodFrame('doors/frame_sketch.webp', 'doors/frame_sketch_wood.webp');
  await woodMultiply('doors/door_back.webp', 'doors/door_back_wood.webp');
  await woodMultiply('doors/pien.webp', 'doors/pien_wood.webp');
  console.log('done');
})();
