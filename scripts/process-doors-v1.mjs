// Process the realistic v1 doors (closed/open) + brass nameplates into WebP.
// Run: node scripts/process-doors-v1.mjs
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'design', 'corridor-elements', '02-doors.v1');
const OUT = path.join(ROOT, 'public', 'textures', 'corridor', 'doors', 'v1');
fs.mkdirSync(OUT, { recursive: true });

const files = fs.readdirSync(SRC).filter((f) => /\.png$/i.test(f));
const byIndex = (n) => files.find((f) => new RegExp(`\\(${n}\\)\\.png$`).test(f));
// the 4 wide nameplates have no (N) — ordered by timestamp
const plates = files.filter((f) => !/\(\d+\)/.test(f)).sort();

const doorMap = [
  [1, 'door_career_closed'], [2, 'door_career_open'],
  [3, 'door_portfolio_closed'], [4, 'door_portfolio_open'],
  [5, 'door_about_closed'], [6, 'door_about_open'],
  [7, 'door_contact_closed'], [8, 'door_contact_open'],
];
const plateNames = ['plate_career', 'plate_portfolio', 'plate_about', 'plate_contact'];

(async () => {
  for (const [n, name] of doorMap) {
    const src = byIndex(n);
    if (!src) { console.log('MISSING door', n); continue; }
    await sharp(path.join(SRC, src)).resize({ width: 768, height: 1152, fit: 'inside' })
      .webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(OUT, name + '.webp'));
    console.log(src, '->', name);
  }
  plates.forEach(async (src, i) => {
    await sharp(path.join(SRC, src)).resize({ width: 1200, fit: 'inside' })
      .webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(OUT, plateNames[i] + '.webp'));
    console.log(src, '->', plateNames[i]);
  });
})();
