// Gathers every LIVE corridor element into design/corridor-elements/ with clean
// names + a MANIFEST, so each can be redesigned one-by-one and swapped back.
// Run: node scripts/gather-corridor-elements.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PUB = path.join(ROOT, 'public');
const OUT = path.join(ROOT, 'design', 'corridor-elements');

// [category, niceName, sourcePathUnderPublic, description, usage]
const MAP = [
  // ---- 01 surfaces (tileable, opaque) ----
  ['01-surfaces', 'wall', 'textures/corridor/nc_wall.webp', 'Corridor walls — cream plaster', 'CorridorWalls, DoorSection, SegmentDoors (repeats — keep seamless)'],
  ['01-surfaces', 'ceiling', 'textures/corridor/nc_ceiling.webp', 'Ceiling', 'CorridorWalls (repeats — keep seamless)'],
  ['01-surfaces', 'floor', 'textures/corridor/nc_floor.webp', 'Floor — wood planks', 'CorridorWalls (tiled down the corridor)'],
  ['01-surfaces', 'skirting-rail', 'textures/corridor/nc_rail.webp', 'Skirting board / baseboard rail (long thin strip)', 'CorridorWalls, DoorSection, SegmentDoors'],
  ['01-surfaces', 'wood-panel-vertical', 'textures/corridor/nc_wood_v.webp', 'Vertical wood grain — table legs; ALSO the wood the doors are built on', 'CorridorDecorations table; door compositing base'],
  ['01-surfaces', 'wood-panel-horizontal', 'textures/corridor/nc_wood_h.webp', 'Horizontal wood grain — table top', 'CorridorDecorations table top'],

  // ---- 02 doors (base = normal, hover = colour reveal on mouseover; TRANSPARENT edges) ----
  ['02-doors', 'portfolio-door', 'textures/corridor/doors/portfolio_door_wood.webp', 'Portfolio door face (normal)', 'DoorSection THE STUDIO'],
  ['02-doors', 'portfolio-door-hover', 'textures/corridor/doors/portfolio_door_painted_wood.webp', 'Portfolio door face (hover — word-art in colour)', 'DoorSection reveal'],
  ['02-doors', 'career-door', 'textures/corridor/doors/career_door_wood.webp', 'Career door face (normal)', 'DoorSection THE GALLERY'],
  ['02-doors', 'career-door-hover', 'textures/corridor/doors/career_door_painted_wood.webp', 'Career door face (hover)', 'DoorSection reveal'],
  ['02-doors', 'about-door', 'textures/corridor/doors/drzwiabout_wood.webp', 'About door face (normal)', 'DoorSection THE ABOUT'],
  ['02-doors', 'about-door-hover', 'textures/corridor/doors/drzwiabout_painted_wood.webp', 'About door face (hover — full colour)', 'DoorSection reveal'],
  ['02-doors', 'contact-door', 'textures/corridor/doors/drzwikontakt_wood.webp', 'Contact door face (normal)', "DoorSection LET'S CONNECT"],
  ['02-doors', 'contact-door-hover', 'textures/corridor/doors/drzwikontakt_painted_wood.webp', 'Contact door face (hover)', 'DoorSection reveal'],
  ['02-doors', 'door-frame', 'textures/corridor/doors/ramkasingledoors_wood.webp', 'Door casing/frame (TRANSPARENT centre)', 'DoorSection — around every room door'],
  ['02-doors', 'door-handle', 'textures/corridor/doors/klamkadodrzwi.webp', 'Door handle (normal)', 'DoorSection'],
  ['02-doors', 'door-handle-hover', 'textures/corridor/doors/klamkadodrzwi_painted.webp', 'Door handle (hover)', 'DoorSection reveal'],
  ['02-doors', 'door-back', 'textures/corridor/doors/backsingledoors_wood.webp', 'Door back / inside face', 'DoorSection + exit doors'],
  ['02-doors', 'door-arrow', 'textures/corridor/strzalka_wood.webp', 'Pointing arrows beside each door (TRANSPARENT)', 'DoorSection'],
  ['02-doors', 'door-plaque-sign', 'textures/corridor/pustatabliczka_wood.webp', 'Wooden sign board above each door — TEXT (ABOUT/PORTFOLIO...) is rendered in 3D on top, not in this image', 'DoorSection'],

  // ---- 03 exit wall ----
  ['03-exit-wall', 'exit-doors-frame', 'textures/corridor/doors/frame_sketch_wood.webp', 'Exit double-door frame (TRANSPARENT centre)', 'SegmentDoors isExit'],
  ['03-exit-wall', 'exit-door-back', 'textures/corridor/doors/door_back_wood.webp', 'Exit door back', 'SegmentDoors'],
  ['03-exit-wall', 'exit-door-edge', 'textures/corridor/doors/pien_wood.webp', 'Exit door edge trim', 'SegmentDoors'],
  ['03-exit-wall', 'exit-handle-left', 'textures/corridor/doors/handle_left_sketch.webp', 'Exit handle (left)', 'SegmentDoors'],
  ['03-exit-wall', 'exit-handle-right', 'textures/corridor/doors/handle_right_sketch.webp', 'Exit handle (right)', 'SegmentDoors'],
  ['03-exit-wall', 'exit-thankyou', 'textures/exit/exit_thankyou.webp', '"Thank you for visiting" header (TRANSPARENT)', 'SegmentDoors exit'],
  ['03-exit-wall', 'exit-plan-it', 'textures/exit/exit_plan.webp', 'PLAN IT framed poster', 'SegmentDoors exit left wall'],
  ['03-exit-wall', 'exit-enhance-it', 'textures/exit/exit_enhance.webp', 'ENHANCE IT framed poster', 'SegmentDoors exit left wall'],
  ['03-exit-wall', 'exit-lead-it', 'textures/exit/exit_lead.webp', 'LEAD IT framed poster', 'SegmentDoors exit left wall'],
  ['03-exit-wall', 'exit-lets-talk', 'textures/exit/exit_talk.webp', '"Let\'s talk" panel revealed through open doorway', 'SegmentDoors exit'],
  ['03-exit-wall', 'exit-good-work-sign', 'textures/exit/exit_sign.webp', '"Good work..." hanging sign', 'SegmentDoors exit right wall'],
  ['03-exit-wall', 'exit-plant', 'textures/exit/exit_plant.webp', 'Exit-wall potted plant (still B&W)', 'SegmentDoors exit right wall'],

  // ---- 04 furniture & plants (TRANSPARENT cutouts / box materials) ----
  ['04-furniture-plants', 'plant-tree', 'textures/corridor/nc_tree.webp', 'Potted fiddle-leaf tree (billboard, TRANSPARENT)', 'CorridorDecorations + CorridorLife (sways)'],
  ['04-furniture-plants', 'plant-seedling', 'textures/corridor/nc_seedling.webp', 'Small desk seedling (billboard, TRANSPARENT)', 'CorridorDecorations table + CorridorLife'],
  ['04-furniture-plants', 'chest-of-drawers', 'textures/corridor/nc_dresser.webp', 'Chest of drawers (billboard, TRANSPARENT)', 'CorridorLife scatter'],
  ['04-furniture-plants', 'cabinet-front', 'textures/corridor/szafkaprzod_wood.webp', 'Console cabinet FRONT (3D box) — holds a framed photo', 'CorridorDecorations'],
  ['04-furniture-plants', 'cabinet-top-sides', 'textures/corridor/szafkaprzodgora_wood.webp', 'Console cabinet top/sides (3D box)', 'CorridorDecorations'],

  // ---- 05 frames & fixtures ----
  ['05-frames-fixtures', 'picture-frame-large', 'textures/corridor/ramkanazdjecieduza.webp', 'Large wall picture frame (normal, TRANSPARENT)', 'CorridorDecorations — holds achievement photos'],
  ['05-frames-fixtures', 'picture-frame-large-hover', 'textures/corridor/ramkanazdjecieduza_painted.webp', 'Large picture frame (hover)', 'CorridorDecorations reveal'],
  ['05-frames-fixtures', 'picture-frame-small', 'textures/corridor/ramkanazdjeciemala.webp', 'Small standing frame (TRANSPARENT)', 'CorridorDecorations'],
  ['05-frames-fixtures', 'vent-grille', 'textures/corridor/kratkawentylacyjna.webp', 'Wall vent grille (TRANSPARENT)', 'CorridorDecorations'],
  ['05-frames-fixtures', 'ceiling-lamp-grille', 'textures/corridor/kratanalampy.webp', 'Ceiling lamp diffuser grille (TRANSPARENT)', 'CorridorDecorations'],
  ['05-frames-fixtures', 'ceiling-lamp-sides', 'textures/corridor/bokilampy.webp', 'Ceiling lamp housing sides', 'CorridorDecorations'],

  // ---- 06 hero wordmark ----
  ['06-hero', 'mujeeb-wordmark', 'textures/corridor/avatar_src/wordmark.png', 'MUJEEB wordmark at corridor start (TRANSPARENT)', 'HeroText'],
  ['06-hero', 'role-subtitle', 'textures/corridor/avatar_src/subtitle.png', 'Role subtitle under the wordmark (TRANSPARENT)', 'HeroText'],
];

// Avatar frames (10)
for (let i = 1; i <= 10; i++) {
  MAP.push(['07-avatar', `avatar-wave-${String(i).padStart(2, '0')}`, `textures/corridor/avatar_new/${i}.webp`, `Waving avatar frame ${i}/10 (TRANSPARENT)`, 'Avatar.jsx — ping-pong wave; all 10 must stay aligned + same colour']);
}

// Wall achievement photos (real photos — already realistic)
for (const p of ['medal', 'bridge', 'cycling', 'eiffel', 'football', 'cntower', 'golf', 'social', 'shooting']) {
  MAP.push(['08-wall-photos', p, `textures/wall/${p}.webp`, `Achievement photo: ${p} (real photo — likely keep)`, 'CorridorDecorations wall frames']);
}

let copied = 0, missing = [];
const byCat = {};
for (const [cat, name, src, desc, usage] of MAP) {
  const srcAbs = path.join(PUB, src);
  const ext = path.extname(src);
  const outName = name + ext;
  const outDir = path.join(OUT, cat);
  fs.mkdirSync(outDir, { recursive: true });
  if (!fs.existsSync(srcAbs)) { missing.push(src); continue; }
  fs.copyFileSync(srcAbs, path.join(outDir, outName));
  copied++;
  (byCat[cat] ||= []).push({ outName, src, desc, usage });
}

// MANIFEST
let md = `# Corridor Elements — redesign kit\n\n`;
md += `Every live element in the corridor, copied here so you can redesign each one.\n`;
md += `When a file is ready, tell me and I'll process it (resize/convert) and swap it back into \`public/${''}\`.\n\n`;
md += `## How the swap works\n`;
md += `- **Keep the same shape/role.** \`base\` + \`hover\` come in pairs (hover shows on mouseover). Plaque **text** is drawn in 3D, not in the image.\n`;
md += `- **Transparency:** anything marked TRANSPARENT must keep an alpha cut-out (PNG/WebP). Surfaces (wall/ceiling/floor/rail/wood) should be **seamless/tileable**.\n`;
md += `- **Avatar:** all 10 frames must stay the same size/alignment and same colour, or the wave will jump/flicker.\n`;
md += `- Any format is fine (PNG/JPG/WebP) — I convert. Keep roughly the same aspect ratio unless we agree to change it.\n\n`;
md += `> For true realism I'll also upgrade the 3D side (PBR materials + lighting + shadows) — that's engine work on my end, separate from these textures.\n\n`;
for (const cat of Object.keys(byCat).sort()) {
  md += `## ${cat}\n\n| file | what it is | used by |\n|---|---|---|\n`;
  for (const r of byCat[cat]) md += `| \`${r.outName}\` | ${r.desc} | ${r.usage} |\n`;
  md += `\n`;
}
if (missing.length) md += `## Not found (skipped)\n${missing.map((m) => `- ${m}`).join('\n')}\n`;
fs.writeFileSync(path.join(OUT, 'MANIFEST.md'), md);

console.log(`Copied ${copied} elements into design/corridor-elements/`);
if (missing.length) console.log('Missing:', missing.join(', '));
