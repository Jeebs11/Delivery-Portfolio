// Rasterise the original Ghibli-inspired spirits to transparent webp textures
// so they can be placed as little companions on the 3D career-card pegs.
import sharp from 'sharp';

const S = 2.6, INK = '#2b2b28';
const wrap = (inner) => `<svg viewBox="0 0 120 132" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

const moss = wrap(`
  <ellipse cx="60" cy="78" rx="30" ry="30" fill="#fbf8ef" stroke="${INK}" stroke-width="${S}"/>
  <path d="M32 60c4-14 15-24 28-24s24 10 28 24c-8-6-18-9-28-9s-20 3-28 9z" fill="#fbf8ef" stroke="${INK}" stroke-width="${S}" stroke-linejoin="round"/>
  <path d="M60 34c1-9 7-15 15-16-2 9-7 15-15 16z" fill="#fbf8ef" stroke="${INK}" stroke-width="${S}" stroke-linejoin="round"/>
  <circle cx="50" cy="76" r="4.2" fill="${INK}"/><circle cx="70" cy="76" r="4.2" fill="${INK}"/>
  <path d="M55 88q5 5 10 0" fill="none" stroke="${INK}" stroke-width="${S}" stroke-linecap="round"/>
`);

const lantern = wrap(`
  <ellipse cx="60" cy="86" rx="22" ry="24" fill="#fbf8ef" stroke="${INK}" stroke-width="${S}"/>
  <circle cx="60" cy="54" r="16" fill="#fbf8ef" stroke="${INK}" stroke-width="${S}"/>
  <path d="M54 42l-6-10M66 42l6-10" fill="none" stroke="${INK}" stroke-width="${S}" stroke-linecap="round"/>
  <circle cx="48" cy="32" r="2.6" fill="${INK}"/><circle cx="72" cy="32" r="2.6" fill="${INK}"/>
  <circle cx="54" cy="54" r="3.4" fill="${INK}"/><circle cx="66" cy="54" r="3.4" fill="${INK}"/>
  <path d="M56 62q4 4 8 0" fill="none" stroke="${INK}" stroke-width="${S}" stroke-linecap="round"/>
`);

const pebble = wrap(`
  <path d="M28 84c0-20 14-34 32-34s32 14 32 34c0 10-6 16-16 16H44c-10 0-16-6-16-16z" fill="#fbf8ef" stroke="${INK}" stroke-width="${S}" stroke-linejoin="round"/>
  <path d="M60 50c0-10 5-17 13-18-1 10-6 16-13 18z" fill="#fbf8ef" stroke="${INK}" stroke-width="${S}" stroke-linejoin="round"/>
  <circle cx="50" cy="80" r="4" fill="${INK}"/><circle cx="70" cy="80" r="4" fill="${INK}"/>
  <path d="M55 90q5 4 10 0" fill="none" stroke="${INK}" stroke-width="${S}" stroke-linecap="round"/>
`);

const out = 'public/textures/gallery/spirits';
const map = { moss, lantern, pebble };
for (const [name, svg] of Object.entries(map)) {
    await sharp(Buffer.from(svg)).resize(320, 352).webp({ quality: 92 }).toFile(`${out}/${name}.webp`);
    console.log('spirit ->', name);
}
console.log('done');
