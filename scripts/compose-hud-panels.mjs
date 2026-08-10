// Extract the PM-tool diagram panels from the welcome composition and knock the
// white background out to transparency (they're dark ink on white, so this is clean).
// Also builds a contact sheet for quick visual verification.
import sharp from 'sharp';

const SRC = 'public/textures/corridor/avatar_src/New welcome.png';
const OUT = 'public/textures/corridor/hud';

// crop boxes in source px (1448 x 1086)
const PANELS = [
    { name: 'roadmap', left: 56, top: 112, width: 392, height: 214 },
    { name: 'stakeholder', left: 62, top: 336, width: 300, height: 196 },
    { name: 'framework', left: 62, top: 556, width: 410, height: 190 },
    { name: 'gantt', left: 1006, top: 104, width: 440, height: 256 },
    { name: 'kanban', left: 1028, top: 362, width: 418, height: 210 },
    { name: 'raid', left: 1028, top: 586, width: 418, height: 206 },
    { name: 'workflow', left: 428, top: 818, width: 596, height: 190 },
];

// turn near-white into transparency, keep the ink (with soft edges)
async function knockout(cropBuf) {
    const alpha = await sharp(cropBuf).grayscale().negate().linear(2.6, -150).toColourspace('b-w').toBuffer();
    return sharp(cropBuf).removeAlpha().joinChannel(alpha);
}

const thumbs = [];
for (const p of PANELS) {
    const crop = await sharp(SRC).extract({ left: p.left, top: p.top, width: p.width, height: p.height }).toBuffer();
    await (await knockout(crop)).webp({ quality: 90 }).toFile(`${OUT}/${p.name}.webp`);
    // thumb on light bg for the contact sheet
    const t = await sharp(`${OUT}/${p.name}.webp`).resize({ width: 300, height: 200, fit: 'contain', background: '#eeeeee' }).flatten({ background: '#eeeeee' }).png().toBuffer();
    thumbs.push({ name: p.name, buf: t });
    console.log('panel ->', p.name, `${p.width}x${p.height}`);
}

// contact sheet: 3 cols
const COLS = 3, TW = 300, TH = 200, PAD = 8;
const rows = Math.ceil(thumbs.length / COLS);
const sheet = sharp({ create: { width: COLS * (TW + PAD) + PAD, height: rows * (TH + PAD) + PAD, channels: 3, background: '#cccccc' } });
const comps = thumbs.map((t, i) => ({ input: t.buf, left: PAD + (i % COLS) * (TW + PAD), top: PAD + Math.floor(i / COLS) * (TH + PAD) }));
await sheet.composite(comps).png().toFile('/private/tmp/claude-502/-Users-tenilawal-Downloads-Spreadbet-Agent-Refactor-2/fe3ad2f3-e052-474d-aaac-d7a50865cfba/scratchpad/hud_contact.png');
console.log('contact sheet written');
