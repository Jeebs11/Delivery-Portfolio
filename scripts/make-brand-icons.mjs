// Generates the ML monogram favicon + the Open Graph share image.
// Run: node scripts/make-brand-icons.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUB = path.join(__dirname, '..', 'public');

// --- 1) Favicon: gold rounded square + cream serif "ML" ---
const GOLD = '#a8814a';
const CREAM = '#f2ede1';
const S = 512;
const R = 78; // corner radius

const faviconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#b28c53"/>
      <stop offset="1" stop-color="#9c7640"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${S}" height="${S}" rx="${R}" ry="${R}" fill="url(#g)"/>
  <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle"
    font-family="Georgia, 'Times New Roman', Times, serif" font-weight="700"
    font-size="248" letter-spacing="2" fill="${CREAM}">ML</text>
</svg>`;

async function run() {
  // Favicon PNG (512) — crisp at any tab size, doubles as apple-touch-icon.
  await sharp(Buffer.from(faviconSvg)).png().toFile(path.join(PUB, 'favicon-ml.png'));

  // --- 2) OG share image: MUJEEB HQ scene, fitted to 1200x630 ---
  await sharp(path.join(PUB, 'textures', 'entrance', 'home_bg.webp'))
    .resize(1200, 630, { fit: 'contain', background: '#f4f0e7' })
    .flatten({ background: '#f4f0e7' })
    .webp({ quality: 88 })
    .toFile(path.join(PUB, 'og-mujeeb.webp'));

  console.log('Wrote public/favicon-ml.png and public/og-mujeeb.webp');
}
run();
