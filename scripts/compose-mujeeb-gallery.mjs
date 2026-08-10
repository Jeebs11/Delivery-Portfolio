// One-off asset builder: composites Mujeeb's project screenshots (downloaded to
// /tmp/mujeeb-shots) onto portrait paper cards matching the gallery texture size.
import sharp from 'sharp';

const W = 1024, H = 2048, MARGIN = 60;
const slugs = ['pm-dashboard', 'risk-radar', 'exec-dashboard', 'energy-benchmark', 'portfolio', 'ecommerce'];
const outDir = 'public/textures/gallery/mujeeb';

const bg = await sharp('public/textures/paper-texture.webp').resize(W, H, { fit: 'cover' }).toBuffer();

for (const slug of slugs) {
    const src = `/tmp/mujeeb-shots/${slug}.png`;
    const innerW = W - MARGIN * 2;
    const shot = await sharp(src).resize({ width: innerW }).toBuffer();
    // white mount + thin dark border
    const framedShot = await sharp(shot)
        .extend({ top: 10, bottom: 10, left: 10, right: 10, background: '#ffffff' })
        .extend({ top: 3, bottom: 3, left: 3, right: 3, background: '#1a1a1a' })
        .toBuffer();
    const fm = await sharp(framedShot).metadata();
    const top = Math.round((H - fm.height) / 2);
    const left = Math.round((W - fm.width) / 2);
    await sharp(bg).composite([{ input: framedShot, top, left }]).webp({ quality: 82 }).toFile(`${outDir}/${slug}.webp`);
    console.log(slug, '->', `${fm.width}x${fm.height} @ ${left},${top}`);
}
console.log('done');
