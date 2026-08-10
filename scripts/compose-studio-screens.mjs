// Builds 2:1 landscape "screen" textures for the Studio monitors (portfolio),
// letterboxing each project screenshot onto a paper background with a thin frame.
import sharp from 'sharp';

const W = 2048, H = 1024, PAD = 70;
const slugs = ['pm-dashboard', 'risk-radar', 'exec-dashboard', 'energy-benchmark', 'portfolio', 'ecommerce'];

const bg = await sharp({ create: { width: W, height: H, channels: 3, background: '#f3efe4' } }).png().toBuffer();

for (const slug of slugs) {
    const shot = await sharp(`/tmp/mujeeb-shots/${slug}.png`)
        .resize({ width: W - PAD * 2, height: H - PAD * 2, fit: 'contain', background: '#f3efe4' })
        .extend({ top: 6, bottom: 6, left: 6, right: 6, background: '#1a1a1a' })
        .toBuffer();
    const m = await sharp(shot).metadata();
    await sharp(bg)
        .composite([{ input: shot, top: Math.round((H - m.height) / 2), left: Math.round((W - m.width) / 2) }])
        .webp({ quality: 84 })
        .toFile(`public/textures/studio/mujeeb/${slug}.webp`);
    console.log('screen ->', slug);
}
console.log('done');
