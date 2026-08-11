// Split the character into body (no forearm) + arm (forearm+hand) so the arm
// can pivot for a wave. Coordinates are fractions of the character image and
// MUST match Avatar.jsx (ARM_BOX / ELBOW).
import sharp from 'sharp';

const SRC = 'public/textures/corridor/avatar_src/character.png';

// arm bounding box as fractions of the image (left, top, width, height)
export const ARM_BOX = { l: 0.66, t: 0.135, w: 0.34, h: 0.26 };

const meta = await sharp(SRC).metadata();
const W = meta.width, H = meta.height;
const box = {
    left: Math.round(ARM_BOX.l * W),
    top: Math.round(ARM_BOX.t * H),
    width: Math.round(ARM_BOX.w * W),
    height: Math.round(ARM_BOX.h * H),
};
// clamp
box.width = Math.min(box.width, W - box.left);
box.height = Math.min(box.height, H - box.top);

// arm = crop of the box
await sharp(SRC).extract(box).png().toFile('public/textures/corridor/avatar_src/arm.png');

// body = character with the box erased to transparent (dest-out)
const eraser = await sharp({ create: { width: box.width, height: box.height, channels: 4, background: '#000000ff' } }).png().toBuffer();
await sharp(SRC).composite([{ input: eraser, left: box.left, top: box.top, blend: 'dest-out' }]).png()
    .toFile('public/textures/corridor/avatar_src/body.png');

// preview: body and arm on grey, side by side
const g = '#8a8a8a';
const bodyT = await sharp('public/textures/corridor/avatar_src/body.png').resize({ height: 700, fit: 'inside' }).flatten({ background: g }).png().toBuffer();
const armT = await sharp('public/textures/corridor/avatar_src/arm.png').resize({ height: 300, fit: 'inside' }).flatten({ background: g }).png().toBuffer();
const bm = await sharp(bodyT).metadata(); const am = await sharp(armT).metadata();
await sharp({ create: { width: bm.width + am.width + 60, height: 720, channels: 3, background: '#cccccc' } })
    .composite([{ input: bodyT, left: 10, top: 10 }, { input: armT, left: bm.width + 40, top: 10 }])
    .png().toFile('/private/tmp/claude-502/-Users-tenilawal-Downloads-Spreadbet-Agent-Refactor-2/fe3ad2f3-e052-474d-aaac-d7a50865cfba/scratchpad/avatar_split.png');

console.log('W,H', W, H, 'box', box);
console.log('done');
