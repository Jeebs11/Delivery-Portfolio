// Builds text-only career cards (job title / company / industry) composited onto
// the paper texture, sized to match the gallery card textures (1024x2048).
import sharp from 'sharp';
import { readFileSync } from 'fs';

// Pull CAREER straight from the app's content source of truth.
const content = readFileSync('src/config/content.js', 'utf8');
const m = content.match(/export const CAREER = (\[[\s\S]*?\n\]);/);
// eslint-disable-next-line no-eval
const CAREER = eval(m[1]);

const W = 1024, H = 2048;
const INK = '#2b2b28', SUB = '#4a4a44', MUTE = '#7a746a';

function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// crude word-wrap to a max char count per line
function wrap(text, max) {
    const words = text.split(' ');
    const lines = []; let cur = '';
    for (const w of words) {
        if ((cur + ' ' + w).trim().length > max) { if (cur) lines.push(cur); cur = w; }
        else cur = (cur + ' ' + w).trim();
    }
    if (cur) lines.push(cur);
    return lines;
}

function slug(r, i) {
    return `${String(i).padStart(2, '0')}-` + r.company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const bg = await sharp('public/textures/paper-texture.webp').resize(W, H, { fit: 'cover' }).toBuffer();

for (let i = 0; i < CAREER.length; i++) {
    const r = CAREER[i];
    const titleLines = wrap(r.role, 20);
    let y = 560;
    let svgParts = [];
    // period (small, top)
    svgParts.push(`<text x="${W / 2}" y="${y}" font-family="Georgia, serif" font-size="42" font-style="italic" fill="${MUTE}" text-anchor="middle">${esc(r.period)}</text>`);
    y += 40;
    // divider
    svgParts.push(`<line x1="${W / 2 - 120}" y1="${y}" x2="${W / 2 + 120}" y2="${y}" stroke="${INK}" stroke-width="2"/>`);
    y += 120;
    // job title (bold, wrapped)
    for (const line of titleLines) {
        svgParts.push(`<text x="${W / 2}" y="${y}" font-family="Georgia, serif" font-size="78" font-weight="bold" fill="${INK}" text-anchor="middle">${esc(line)}</text>`);
        y += 92;
    }
    y += 40;
    // company
    for (const line of wrap(r.company, 24)) {
        svgParts.push(`<text x="${W / 2}" y="${y}" font-family="Georgia, serif" font-size="56" fill="${SUB}" text-anchor="middle">${esc(line)}</text>`);
        y += 66;
    }
    y += 30;
    // industry (muted, uppercase, tracked)
    svgParts.push(`<text x="${W / 2}" y="${y}" font-family="Georgia, serif" font-size="40" letter-spacing="4" fill="${MUTE}" text-anchor="middle">${esc(r.industry.toUpperCase())}</text>`);

    const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${svgParts.join('')}</svg>`;
    const out = `public/textures/gallery/career/${slug(r, i)}.webp`;
    await sharp(bg).composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).webp({ quality: 88 }).toFile(out);
    console.log('card', i, '->', out.split('/').pop(), '|', r.role.slice(0, 28));
}
console.log('done', CAREER.length, 'cards');
