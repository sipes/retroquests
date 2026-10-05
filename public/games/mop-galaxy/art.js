// Mop & Galaxy — pixel art for every room, drawn with canvas rects in the 16-colour EGA palette (320x180).
// Each room exports { bg(ctx, state), props(ctx, state, frame) -> [{ y, d }] } where props are depth-sorted with the player.
import { R, disc, sparse, text, fig } from '../_shared/pixels.js';

const SKIN = '#FFAA77', STEEL = '#8A96A8', DARKSTEEL = '#3A4250', HULL = '#5A6472', GLASS = '#7fd7ff', NAVY = '#0a1a3a', FOAM = '#eef4ff';

// ---------- People & creatures ----------
export function drawPlayer(c, x, y, dir, step) { // Wim: brown coverall, yellow trim, black hair, contractor badge
  const lift = step ? 1 : 0;
  R(c, x - 6 + (step ? -1 : 0), y - 2, 5, 2, 0); R(c, x + 1 + (step ? 1 : 0), y - 2, 5, 2, 0);
  R(c, x - 5 + (step ? -1 : 0), y - 11, 3, 9 - lift, 6); R(c, x + 2 + (step ? 1 : 0), y - 11, 3, 9, 6);
  R(c, x - 7, y - 26, 14, 15, 6); R(c, x - 7, y - 20, 14, 1, 14); R(c, x - 1, y - 26, 2, 14, 14);
  R(c, x - 9, y - 25, 2, 9, 6); R(c, x + 7, y - 25, 2, 9, 6); R(c, x - 9, y - 16, 2, 2, SKIN); R(c, x + 7, y - 16, 2, 2, SKIN);
  R(c, x + (dir > 0 ? 2 : -5), y - 24, 3, 2, 14);
  R(c, x - 1, y - 28, 3, 2, SKIN);
  R(c, x - 4, y - 36, 8, 8, SKIN); R(c, x - 4, y - 38, 8, 3, 0); R(c, x + (dir > 0 ? -4 : 3), y - 36, 1, 4, 0); R(c, x - 5, y - 37, 1, 3, 0); R(c, x + 4, y - 37, 1, 3, 0);
  R(c, x + (dir > 0 ? 0 : -2), y - 33, 2, 1, 0); R(c, x + (dir > 0 ? 3 : 1), y - 33, 1, 1, 0);
  R(c, x + (dir > 0 ? 0 : -2), y - 30, 3, 1, 4);
}
export function drawMop(c, x, y, t) { // MOP-7: ~22 wide, 26 tall, (x,y) = bottom centre
  const b = Math.floor(t / 40) % 7 === 0;
  R(c, x - 11, y - 6, 22, 6, 8); R(c, x - 10, y - 2, 20, 2, 0); R(c, x - 9, y - 8, 18, 2, 7);
  R(c, x - 8, y - 18, 16, 10, 11); R(c, x - 8, y - 18, 16, 1, 15); R(c, x - 6, y - 24, 12, 6, 11); R(c, x - 4, y - 26, 8, 2, 11);
  R(c, x - 5, y - 16, 3, b ? 1 : 3, 0); R(c, x + 2, y - 16, 3, b ? 1 : 3, 0); R(c, x - 4, y - 15, 1, 1, 15); R(c, x + 3, y - 15, 1, 1, 15);
  R(c, x - 3, y - 11, 6, 1, 0);
  R(c, x + 8, y - 20, 2, 10, 7); R(c, x + 8, y - 11, 4, 4, 7); R(c, x + 9, y - 10, 2, 2, 14); // stamp arm
  R(c, x - 1, y - 28, 2, 2, 12);
}
export function drawGumbo(c, x, y, size, t) { // green blob, size 1..3, (x,y) bottom centre
  const w = 6 + size * 4, h = 4 + size * 3, j = Math.floor(t / 15) % 2;
  disc(c, x, y - h / 2, Math.floor(w / 2), 10); R(c, x - w / 2 + 1, y - h, w - 2, 1, 15);
  R(c, x - 2, y - h + 2 + j, 1, 1, 0); R(c, x + 1, y - h + 2 + j, 1, 1, 0); if (size > 1) R(c, x - 1, y - h / 2 + 1, 3, 1, 2);
}
function thistle(c, x, y, t) { // gardening bot hanging from rail, (x,y) top centre
  R(c, x - 1, y, 2, 10, 7); R(c, x - 12, y + 10, 24, 18, 2); R(c, x - 12, y + 10, 24, 1, 10); R(c, x - 10, y + 14, 20, 8, 0);
  const g = Math.floor(t / 30) % 2; R(c, x - 6, y + 16, 5, 4, g ? 14 : 12); R(c, x + 2, y + 16, 5, 4, 14);
  R(c, x + 12, y + 20, 10, 2, 7); R(c, x + 20, y + 14, 2, 14, 7); R(c, x + 18, y + 26, 6, 2, 15); R(c, x + 21, y + 28, 2, 6, 15);
  R(c, x - 20, y + 22, 8, 2, 7); R(c, x - 22, y + 18, 2, 10, 7);
}
function cat(c, x, y) { R(c, x, y - 8, 16, 7, 8); R(c, x + 14, y - 13, 7, 7, 8); R(c, x + 14, y - 15, 2, 2, 8); R(c, x + 19, y - 15, 2, 2, 8); R(c, x + 16, y - 11, 1, 1, 14); R(c, x + 19, y - 11, 1, 1, 14); R(c, x - 6, y - 10, 7, 2, 8); R(c, x - 7, y - 13, 2, 4, 8); R(c, x + 1, y - 1, 2, 1, 0); R(c, x + 12, y - 1, 2, 1, 0); }
function brack(c, x, y, dir, sitting) {
  if (sitting) { R(c, x - 9, y - 12, 18, 12, 8); R(c, x - 10, y - 30, 20, 18, 4); R(c, x - 5, y - 40, 10, 10, SKIN); R(c, x - 5, y - 41, 10, 2, 6); R(c, x - 3, y - 36, 2, 1, 0); R(c, x + 2, y - 36, 2, 1, 0); R(c, x - 14, y - 26, 4, 12, 4); R(c, x + 10, y - 26, 4, 12, 4); R(c, x - 12, y - 14, 3, 2, 14); return; }
  R(c, x - 6, y - 13, 5, 13, 8); R(c, x + 1, y - 13, 5, 13, 8); R(c, x - 7, y - 1, 6, 1, 0); R(c, x + 1, y - 1, 6, 1, 0);
  R(c, x - 10, y - 32, 20, 19, 4); R(c, x - 13, y - 31, 3, 13, 4); R(c, x + 10, y - 31, 3, 13, 4); R(c, x - 13, y - 18, 3, 3, SKIN); R(c, x + 10, y - 18, 3, 3, SKIN);
  R(c, x - 2, y - 34, 4, 2, SKIN); R(c, x - 5, y - 44, 10, 10, SKIN); R(c, x - 5, y - 45, 10, 2, 6); R(c, x + (dir > 0 ? 0 : -3), y - 40, 2, 1, 0); R(c, x + (dir > 0 ? 3 : 1), y - 40, 1, 1, 0);
  R(c, x + (dir > 0 ? 11 : -16), y - 20, 5, 3, 14); R(c, x + (dir > 0 ? 11 : -16), y - 19, 5, 1, 6); // sandwich
}
function dorrit(c, x, y, dir, sitting) { fig(c, x, y - (sitting ? 8 : 0), { shirt: 8, pants: 0, hair: 6, glasses: true, dir }); R(c, x + (dir > 0 ? 4 : -10), y - 24, 6, 8, 15); R(c, x + (dir > 0 ? 5 : -9), y - 23, 4, 6, 11); R(c, x - 1, y - 27, 1, 8, 14); if (sitting) { R(c, x - 8, y - 8, 16, 2, 8); R(c, x - 6, y - 6, 2, 6, 8); R(c, x + 4, y - 6, 2, 6, 8); } }
function vane(c, x, y, dir) { fig(c, x, y, { shirt: 15, pants: 0, hair: 0, dir, long: true }); R(c, x - 7, y - 27, 14, 1, 14); R(c, x - 6, y - 25, 2, 2, 14); R(c, x + 4, y - 25, 2, 2, 14); R(c, x + (dir > 0 ? 2 : -4), y - 22, 2, 1, 14); }
function okonjo(c, x, y, dir) { fig(c, x, y, { shirt: 3, pants: 0, hair: 0, skin: '#7a4a2a', dir }); R(c, x - 7, y - 27, 14, 1, 14); R(c, x - 6, y - 25, 1, 3, 14); R(c, x + 5, y - 25, 1, 3, 14); R(c, x - 2, y - 24, 4, 1, 14); }
function ilse(c, x, y, dir) { fig(c, x, y, { shirt: 8, pants: 8, hair: 12, dir }); R(c, x - 5, y - 39, 10, 2, 0); R(c, x - 6, y - 37, 2, 5, 0); R(c, x + 4, y - 37, 2, 5, 0); R(c, x + (dir > 0 ? 8 : -12), y - 16, 4, 12, 7); }

// ---------- Generic ship interiors ----------
function room(c, wall, floor, { trim = 7, base = 118, lines = true, dark = false } = {}) {
  R(c, 0, 0, 320, base, wall); R(c, 0, base, 320, 180 - base, floor); R(c, 0, base - 3, 320, 3, trim);
  if (lines) for (let i = 0; i < 9; i++) R(c, 0, base + 6 + i * 7, 320, 1, dark ? 0 : 8);
  R(c, 0, 0, 320, 10, dark ? 0 : 8);
}
function panel(c, x, y, w, h, k = 7, k2 = 8) { R(c, x, y, w, h, k2); R(c, x + 1, y + 1, w - 2, h - 2, k); R(c, x + 2, y + 2, w - 4, 1, 15); }
function door(c, x, y, w, h, k = 8, light = 12) { R(c, x, y, w, h, k); R(c, x + 2, y + 2, w - 4, h - 4, DARKSTEEL); R(c, x + w / 2 - 1, y + 4, 2, h - 8, k); R(c, x + w / 2 - 3, y - 4, 6, 3, light); }
function pod(c, x, y, w, h, open, lit = 9) { R(c, x, y, w, h, 7); R(c, x + 2, y + 2, w - 4, h - 4, open ? 0 : lit); if (!open) { sparse(c, x + 3, y + 3, w - 6, h - 6, 15, 6); R(c, x + 4, y + h / 2 - 2, w - 8, 4, 11); } else R(c, x + w - 3, y - 6, 3, h, 7); R(c, x + 2, y + h - 3, w - 4, 1, 8); }
function stars(c, h = 180, seed = 7) { R(c, 0, 0, 320, h, 0); for (let i = 0; i < 90; i++) { const x = (i * 97 + seed * 31) % 320, y = (i * 53 + seed * 17) % h; R(c, x, y, 1, 1, i % 7 === 0 ? 15 : i % 3 === 0 ? 7 : 8); } }
function hullDeck(c) { R(c, 0, 100, 320, 80, HULL); for (let i = 0; i < 6; i++) R(c, 0, 108 + i * 12, 320, 1, DARKSTEEL); for (let i = 0; i < 9; i++) R(c, i * 40 + 6, 100, 1, 80, DARKSTEEL); R(c, 0, 100, 320, 2, STEEL); }

// ---------- Chapter 1 ----------
function closetBg(c, s) {
  room(c, 8, 7, { trim: 0 });
  R(c, 20, 20, 100, 90, DARKSTEEL); [36, 62, 88].forEach((y, i) => { R(c, 20, y, 100, 3, 7); for (let k = 0; k < 7; k++) R(c, 24 + k * 13, y - 12, 8, 12, [14, 11, 13, 10, 12, 7, 15][(k + i) % 7]); });
  R(c, 20, 104, 100, 3, 7); if (!s.flags.gotWrench) { R(c, 68, 94, 26, 4, 7); R(c, 66, 92, 8, 8, 7); } else { R(c, 70, 100, 22, 3, 13); R(c, 20, 102, 100, 1, 8); }
  if (s.flags.shelfWedged && !s.flags.gotWrench) R(c, 74, 98, 14, 5, 13);
  R(c, 20, 24, 42, 38, 0); for (let i = 0; i < 6; i++) R(c, 20 + i * 8, 24, 1, 38, 7); for (let i = 0; i < 5; i++) R(c, 20, 24 + i * 9, 42, 1, 7); R(c, 26, 46, 6, 12, 14); R(c, 36, 44, 6, 14, 12); R(c, 48, 48, 6, 10, 15); R(c, 40, 40, 10, 6, 7); R(c, 44, 42, 2, 2, 12);
  R(c, 130, 86, 40, 30, 6); R(c, 134, 90, 32, 10, 14); text(c, 136, 92, 'GRIT', 0); R(c, 138, 102, 24, 2, 0);
  R(c, 178, 90, 24, 26, 7); R(c, 180, 92, 20, 4, 8); R(c, 176, 100, 28, 2, 8); R(c, 184, 88, 12, 2, 8);
  if (!s.flags.tookMymop) { R(c, 208, 38, 3, 70, 6); R(c, 202, 104, 14, 12, 7); sparse(c, 202, 106, 14, 10, 15, 2); }
  panel(c, 228, 18, 34, 28, 7, 8); R(c, 232, 22, 26, 10, 0); text(c, 234, 25, '14M', 10); R(c, 232, 36, 26, 6, 15);
  R(c, 270, 22, 14, 14, 8); R(c, 276, 24, 2, 8, 7);
  if (!s.flags.gotBadge) { R(c, 264, 36, 28, 60, 6); R(c, 262, 34, 32, 6, 6); R(c, 272, 40, 2, 50, 14); R(c, 266, 48, 6, 6, 14); R(c, 267, 49, 4, 4, 15); }
  R(c, 290, 48, 26, 42, 8); R(c, 293, 51, 20, 36, 0); R(c, 293, 51, 20, 8, DARKSTEEL); text(c, 294, 92, 'CHUTE', 15);
  R(c, 140, 148, 40, 16, 8); for (let i = 0; i < 7; i++) R(c, 142 + i * 5, 150, 2, 12, 0); R(c, 140, 148, 40, 1, 15);
  door(c, 0, 28, 16, 88, 8, 10);
}
function closetProps(c, s, t) { const out = []; if (s.inv.includes('mop')) out.push({ y: 141, d: () => drawMop(c, 114, 141, t) }); return out; }

function deck9Bg(c, s) {
  room(c, 1, 8, { trim: 9 }); for (let i = 0; i < 4; i++) panel(c, 20 + i * 76, 14, 60, 20, 1, 9);
  R(c, 20, 40, 40, 76, 5); R(c, 24, 44, 32, 40, 0); for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) { if (s.flags.vended && r === 2 && k === 2) continue; R(c, 27 + k * 10, 48 + r * 12, 7, 8, [13, 14, 11][(r + k) % 3]); } R(c, 24, 88, 32, 8, 15); text(c, 25, 90, 'SNAKPAK', 5); R(c, 50, 68, 10, 12, 0); R(c, 52, 70, 6, 8, 14); R(c, 24, 100, 32, 12, 8);
  R(c, 60, 96, 30, 20, 7); R(c, 62, 98, 26, 4, 10); R(c, 64, 104, 22, 8, 8); text(c, 66, 106, 'MOP7', 15);
  panel(c, 90, 40, 20, 20, 8, 7); R(c, 94, 44, 12, 8, 0); R(c, 96, 54, 8, 2, 14); R(c, 98, 46, 2, 2, 12);
  R(c, 130, 20, 60, 96, 8); R(c, 134, 24, 52, 88, 7); R(c, 158, 24, 4, 88, 8); R(c, 140, 30, 40, 10, 4); text(c, 143, 32, 'SEALED', 15); disc(c, 160, 60, 5, 12); disc(c, 160, 60, 2, 15); for (let i = 0; i < 4; i++) { R(c, 138, 76 + i * 8, 44, 1, 8); }
  R(c, 200, 70, 20, 46, 7); R(c, 202, 72, 16, 10, 15); R(c, 206, 76, 8, 4, 11); R(c, 209, 70, 2, 4, 11);
  R(c, 232, 2, 34, 16, 8); for (let i = 0; i < 7; i++) R(c, 234 + i * 5, 4, 2, 12, s.flags.grilleOpen ? 1 : 0); if (!s.flags.grilleOpen) [234, 243, 252, 261].forEach(x => R(c, x, 3, 3, 3, 15)); else { R(c, 234, 14, 30, 6, 7); R(c, 232, 2, 34, 12, 1); }
  R(c, 240, 18, 2, 98, 7); R(c, 254, 18, 2, 98, 7); for (let i = 0; i < 10; i++) R(c, 240, 24 + i * 10, 16, 2, 7);
  R(c, 280, 36, 30, 60, 4); R(c, 283, 39, 24, 54, '#3a0000'); R(c, 285, 44, 4, 44, 7); R(c, 283, 44, 12, 10, 8); text(c, 284, 88, 'FIRE', 15);
  door(c, 0, 28, 16, 88, 8, 10);
}
function deck9Props(c, s, t) { const out = []; if (s.inv.includes('mop')) out.push({ y: 139, d: () => drawMop(c, 80, 139, t) }); return out; }

// ---------- Chapter 2 ----------
function podRow(c, x0, y, n, w, h, empty, open) { for (let i = 0; i < n; i++) pod(c, x0 + i * (w + 4), y, w, h, empty === i && open); }
function cryoBg(c, s) {
  room(c, NAVY, '#1a2a4a', { trim: 1, lines: true, dark: true }); R(c, 0, 0, 320, 10, 1);
  podRow(c, 20, 30, 7, 36, 24, -1); podRow(c, 20, 60, 7, 36, 24, -1); podRow(c, 20, 90, 1, 36, 18, -1);
  R(c, 36, 54, 48, 56, DARKSTEEL); pod(c, 38, 56, 44, 52, true); R(c, 40, 58, 40, 48, '#0a3a5a'); R(c, 42, 60, 36, 44, NAVY); R(c, 46, 106, 28, 10, 7); text(c, 48, 108, '1205', 0);
  R(c, 134, 8, 52, 52, 8); R(c, 138, 12, 44, 44, 7); R(c, 158, 12, 4, 44, 8); if (!s.flags.gotNotice) { R(c, 148, 20, 24, 22, 15); R(c, 151, 24, 18, 1, 0); R(c, 151, 27, 18, 1, 0); R(c, 151, 30, 12, 1, 0); disc(c, 160, 37, 2, 12); }
  R(c, 92, 90, 36, 18, 7); R(c, 94, 92, 32, 14, 9); text(c, 96, 96, '1204', 15); if (!s.flags.gotDrawing) { R(c, 212, 62, 22, 20, 15); disc(c, 223, 72, 5, 10); R(c, 216, 78, 14, 1, 12); }
  R(c, 248, 82, 44, 34, 7); R(c, 250, 84, 40, 6, 8); R(c, 252, 110, 6, 6, 0); R(c, 282, 110, 6, 6, 0); R(c, 254, 92, 14, 10, 15); if (!s.flags.gotHose) { R(c, 252, 70, 36, 6, 11); R(c, 254, 72, 32, 2, 3); R(c, 250, 68, 6, 10, 7); }
  panel(c, 284, 40, 26, 30, 7, 8); R(c, 288, 44, 18, 14, 0); text(c, 290, 47, '2029', 10); R(c, 288, 60, 18, 6, 8);
  R(c, 150, 148, 20, 12, 8); for (let i = 0; i < 4; i++) R(c, 152 + i * 5, 150, 2, 8, 0);
  R(c, 300, 56, 20, 120, 8); for (let i = 0; i < 8; i++) R(c, 300, 60 + i * 14, 20, 2, 7);
  if (s.flags.fogged) sparse(c, 0, 120, 320, 60, 15, 3);
}
function cryoProps(c, s, t) {
  const out = [];
  if (!s.flags.hidden) { const sw = Math.floor(t / 4) % 60; const x = 200 + (sw < 30 ? sw : 60 - sw) * 2; out.push({ y: 1, d: () => { for (let i = 0; i < 3; i++) { const fx = x + i * 26; R(c, fx, 120, 14, 50, '#2a2a10'); sparse(c, fx - 4, 110, 22, 60, 14, 3); fig(c, fx + 6, 116, { shirt: 8, pants: 8, hair: 0, dir: -1 }); R(c, fx - 3, 96, 4, 3, 14); } } }); }
  return out;
}
function galleryBg(c, s, late) {
  room(c, NAVY, '#1a2a4a', { trim: 1, dark: true }); R(c, 0, 0, 320, 10, 1);
  R(c, 20, 40, 30, 76, 7); R(c, 22, 42, 26, 72, 8); R(c, 44, 76, 3, 6, 14); R(c, 24, 60, 22, 10, 15); R(c, 26, 62, 18, 1, 0); R(c, 26, 65, 14, 1, 0);
  if (!s.flags.gotRoster && !late) { R(c, 70, 20, 40, 30, 15); for (let i = 0; i < 6; i++) R(c, 73, 23 + i * 4, 30 - (i % 3) * 6, 1, 0); R(c, 73, 46, 20, 1, 4); } else { R(c, 70, 20, 40, 30, DARKSTEEL); R(c, 72, 22, 36, 26, 8); }
  if (!s.flags.gotBlanket && !late) { R(c, 120, 40, 14, 20, 4); R(c, 122, 42, 10, 16, 12); R(c, 126, 36, 2, 4, 7); }
  R(c, 150, 2, 40, 16, 8); for (let i = 0; i < 8; i++) R(c, 152 + i * 5, 4, 2, 12, s.flags.ductWrapped && !late ? 4 : 0); if (s.flags.ductWrapped && !late) R(c, 148, 0, 44, 20, 12);
  podRow(c, 20, 60, 6, 26, 20, -1); podRow(c, 20, 84, 6, 26, 20, -1);
  R(c, 206, 24, 58, 84, 7); pod(c, 208, 26, 54, 80, late && s.flags.okonjoAwake, late && s.flags.codeEntered ? 11 : 9); R(c, 218, 106, 34, 10, 14); text(c, 220, 108, 'OKONJO', 0);
  panel(c, 266, 60, 30, 56, 7, 8); R(c, 270, 64, 22, 14, 0); text(c, 271, 67, late && s.flags.codeEntered ? 'THAW' : 'LOCK', late && s.flags.codeEntered ? 10 : 12); for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) R(c, 271 + k * 7, 82 + r * 8, 5, 5, 15);
  R(c, 0, 56, 14, 120, 8); for (let i = 0; i < 8; i++) R(c, 0, 60 + i * 14, 14, 2, 7);
}
function galleryProps(c, s, t) { return []; }

// ---------- Chapter 3 ----------
function galleyBg(c, s) {
  room(c, 7, '#b0b0b0', { trim: 8 }); for (let i = 0; i < 10; i++) for (let j = 0; j < 4; j++) R(c, 20 + i * 30, 14 + j * 24, 28, 22, j % 2 === i % 2 ? 15 : 11);
  R(c, 20, 80, 100, 36, 8); R(c, 20, 80, 100, 4, 15); R(c, 24, 90, 92, 2, 7); R(c, 24, 100, 92, 2, 7); R(c, 100, 68, 14, 14, 0); R(c, 103, 71, 8, 8, s.flags.counterOpen ? 10 : 12);
  if (!s.flags.gotTray) { for (let i = 0; i < 6; i++) R(c, 30, 80 - i * 3, 30, 2, 13); } else for (let i = 0; i < 4; i++) R(c, 30, 80 - i * 3, 30, 2, 13);
  R(c, 122, 36, 48, 80, 8); R(c, 126, 40, 40, 72, 7); R(c, 134, 44, 24, 20, s.flags.doorHeld ? 0 : 11); disc(c, 146, 76, 8, 8); disc(c, 146, 76, 6, 15); R(c, 145, 68, 2, 16, 8); R(c, 138, 75, 16, 2, 8);
  R(c, 180, 20, 36, 50, 8); R(c, 184, 24, 28, 20, 0); text(c, 185, 30, 'OFFLINE', 12); R(c, 184, 48, 28, 18, 7);
  R(c, 218, 40, 38, 76, 15); R(c, 222, 44, 30, 30, 0); R(c, 226, 48, 22, 22, s.flags.dishRun ? 11 : 8); R(c, 222, 80, 30, 6, 7); R(c, 224, 92, 26, 20, 7);
  R(c, 258, 20, 40, 52, 8); R(c, 262, 24, 32, 44, s.flags.lockerOpen ? 0 : 7); if (s.flags.lockerOpen) { if (!s.flags.gotToolkit) R(c, 266, 50, 12, 8, 4); if (!s.flags.gotRations) R(c, 280, 50, 10, 8, 14); if (!s.flags.gotOven) R(c, 270, 30, 6, 12, 14); } R(c, 286, 40, 10, 10, 0); R(c, 288, 42, 6, 6, s.flags.lockerOpen ? 10 : 12);
  R(c, 260, 80, 40, 36, 2); R(c, 262, 82, 36, 32, '#1e5e1e'); text(c, 264, 100, 'COMPOST', 10);
  door(c, 0, 36, 16, 80, 8, 10);
}
function galleyProps(c, s, t) {
  const out = []; const r = Math.floor(t / 6) % 3;
  out.push({ y: 1, d: () => { if (!s.flags.gumboOut) { R(c, 258, 76 - (r === 1 ? 3 : 0), 44, 6, 10); if (r === 2) drawGumbo(c, 280, 80, 1, t); } else R(c, 258, 70, 44, 6, 10); } });
  if (s.inv.includes('mop')) out.push({ y: 139, d: () => drawMop(c, 76, 139, t) });
  if (s.flags.doorHeld && !s.inv.includes('gumbo2') && !s.flags.leftGalley) out.push({ y: 2, d: () => drawGumbo(c, 146, 84, 2, t) });
  return out;
}
function hydroBg(c, s) {
  room(c, '#0e2e1a', '#2a3a2a', { trim: 2, dark: true }); R(c, 20, 4, 280, 12, 5); for (let i = 0; i < 14; i++) R(c, 24 + i * 20, 8, 12, 4, 13); R(c, 20, 26, 280, 6, 7); R(c, 20, 28, 280, 2, 8);
  panel(c, 20, 20, 50, 30, 15, 8); text(c, 23, 24, 'RULES', 0); for (let i = 0; i < 4; i++) R(c, 23, 32 + i * 4, 40 - i * 4, 1, 0);
  for (let i = 0; i < 4; i++) { R(c, 24 + i * 22, 70, 4, 42, 6); for (let k = 0; k < 4; k++) { R(c, 18 + i * 22 + (k % 2) * 8, 66 + k * 10, 10, 6, 2); if (!(s.flags.gotTomato && i === 3 && k === 1)) disc(c, 22 + i * 22 + (k % 2) * 8 + 4, 70 + k * 10, 2, 12); } } R(c, 20, 110, 90, 6, 8);
  R(c, 172, 50, 38, 66, 8); R(c, 176, 54, 30, 50, 11); R(c, 176, 54, 30, 22, 3); disc(c, 191, 92, 6, 15); R(c, 190, 88, 2, 5, 0); R(c, 172, 110, 38, 6, 7);
  R(c, 220, 20, 50, 96, 7); R(c, 224, 24, 42, 88, 8); disc(c, 245, 68, 12, 7); disc(c, 245, 68, 8, 8); R(c, 244, 60, 2, 8, 15); R(c, 228, 28, 34, 8, 15); text(c, 229, 30, 'SEED', 0); R(c, 230, 100, 30, 6, 12);
  if (!s.flags.gotTies) { R(c, 280, 90, 30, 26, 7); for (let i = 0; i < 8; i++) R(c, 283 + (i * 7) % 24, 92 + (i * 5) % 10, 5, 1, 10); } else { R(c, 280, 90, 30, 26, 7); R(c, 284, 94, 22, 18, 8); }
  R(c, 272, 128, 30, 22, 8); for (let i = 0; i < 6; i++) R(c, 274 + i * 5, 130, 2, 18, 0);
  door(c, 306, 36, 14, 80, 8, 10);
}
function hydroProps(c, s, t) { const out = [{ y: 1, d: () => thistle(c, 140, 30, t) }]; if (s.inv.includes('mop')) out.push({ y: 139, d: () => drawMop(c, 46, 139, t) }); return out; }

// ---------- Chapter 4 ----------
function driveBg(c, s) {
  room(c, DARKSTEEL, 8, { trim: 7, dark: true }); for (let i = 0; i < 5; i++) { R(c, 0, 20 + i * 18, 320, 4, [7, 3, 7, 11, 7][i]); } R(c, 20, 18, 280, 12, 7); for (let i = 0; i < 14; i++) R(c, 22 + i * 20, 20, 2, 8, 8);
  R(c, 100, 10, 120, 100, 8); R(c, 108, 18, 104, 84, 7); disc(c, 160, 60, 30, 3); disc(c, 160, 60, 22, 11); disc(c, 160, 60, 12, 15); for (let i = 0; i < 4; i++) R(c, 110 + i * 26, 100, 20, 10, 8);
  R(c, 0, 30, 22, 86, 7); R(c, 3, 33, 16, 80, 8); R(c, 8, 44, 6, 10, s.flags.airlockClear ? 10 : 11); R(c, 4, 100, 14, 10, 0); R(c, 7, 24, 8, 4, 14);
  panel(c, 24, 70, 18, 30, 4, 8); disc(c, 33, 84, 4, 12); text(c, 26, 92, 'TST', 15);
  R(c, 40, 40, 22, 22, 7); disc(c, 51, 51, 8, 15); R(c, 50, 44, 2, 7, s.flags.filterOut ? 12 : 0);
  R(c, 60, 68, 40, 48, 8); R(c, 64, 72, 32, 40, 7); if (!s.flags.filterOut) { R(c, 70, 80, 20, 16, 15); for (let i = 0; i < 4; i++) R(c, 72, 82 + i * 4, 16, 1, 8); } else R(c, 70, 80, 20, 16, 0); R(c, 60, 60, 6, 8, 3); R(c, 94, 60, 6, 8, 3);
  R(c, 230, 50, 26, 66, 7); R(c, 233, 53, 20, 40, 0); for (let i = 0; i < 5; i++) R(c, 235, 56 + i * 7, 16 - (i % 2) * 6, 2, 10); R(c, 233, 96, 20, 16, 8);
  R(c, 282, 90, 26, 26, 4); R(c, 284, 92, 22, 4, 7); R(c, 288, 98, 14, 2, 14);
  door(c, 298, 20, 22, 96, 4, 12);
  if (s.flags.ilseDistracted) sparse(c, 24, 24, 60, 40, FOAM, 2);
}
function driveProps(c, s, t) {
  const out = [];
  if (s.flags.ilseDistracted) out.push({ y: 1, d: () => { ilse(c, 60, 56, -1); sparse(c, 40, 20, 50, 36, 15, 2); } });
  else out.push({ y: 116, d: () => ilse(c, 268, 116, 1) });
  if (s.inv.includes('mop')) out.push({ y: 139, d: () => drawMop(c, 56, 139, t) });
  return out;
}
function reactorBg(c, s) {
  room(c, DARKSTEEL, 8, { trim: 7, dark: true });
  R(c, 100, 20, 120, 80, 7); R(c, 106, 26, 108, 68, '#0a2a2a'); sparse(c, 110, 30, 100, 60, 11, 3); disc(c, 160, 60, 18, 3); disc(c, 160, 60, 10, 11); disc(c, 160, 60, 4, 15);
  R(c, 38, 36, 18, 4, 7); if (!s.flags.gotDosimeter) { R(c, 40, 40, 14, 22, 15); R(c, 43, 44, 8, 8, 10); R(c, 43, 54, 8, 4, 0); }
  R(c, 20, 80, 30, 36, 7); if (!s.flags.gotO2) { R(c, 28, 82, 14, 32, 11); R(c, 32, 78, 6, 4, 7); } R(c, 60, 80, 30, 36, 7); if (!s.flags.gotTether) { disc(c, 75, 98, 12, 8); disc(c, 75, 98, 8, 7); disc(c, 75, 98, 3, 0); R(c, 84, 90, 6, 4, 14); }
  R(c, 240, 20, 50, 96, 7); R(c, 244, 24, 42, 88, 8); if (!s.flags.gotHelmet) { disc(c, 264, 34, 9, 15); R(c, 258, 30, 12, 8, GLASS); } if (!s.flags.gotSuit) { R(c, 250, 50, 28, 46, 15); R(c, 246, 52, 6, 30, 15); R(c, 276, 52, 6, 30, 15); R(c, 254, 96, 8, 16, 15); R(c, 266, 96, 8, 16, 15); R(c, 258, 60, 12, 6, 11); }
  panel(c, 296, 40, 22, 76, 7, 8); R(c, 300, 44, 14, 20, 0); text(c, 301, 48, s.flags.suitChecked ? 'OK' : '?', s.flags.suitChecked ? 10 : 14); for (let i = 0; i < 4; i++) R(c, 300, 70 + i * 8, 14, 4, 8);
  door(c, 0, 20, 14, 96, 4, 12);
}

// ---------- Chapter 5 ----------
function hull1Bg(c, s) {
  stars(c, 100, 3); hullDeck(c);
  R(c, 20, 40, 40, 76, 7); R(c, 24, 44, 32, 68, 8); R(c, 36, 60, 8, 8, 10); R(c, 30, 100, 20, 8, 0);
  R(c, 34, 14, 16, 16, 8); R(c, 38, 18, 8, 8, 0); R(c, 40, 20, 3, 3, 12); R(c, 40, 30, 4, 10, 7);
  for (let i = 0; i < 5; i++) { R(c, 72 + i * 12, 110, 6, 10, 8); R(c, 73 + i * 12, 112, 4, 4, 0); }
  if (!s.flags.gotPlate) { R(c, 120, 58, 30, 22, STEEL); R(c, 122, 60, 26, 18, 7); R(c, 124, 62, 2, 2, 0); R(c, 144, 74, 2, 2, 0); }
  R(c, 60, 98, 120, 4, 15); R(c, 230, 98, 70, 4, 15); for (let x = 60; x < 300; x += 24) if (x < 180 || x >= 230) { R(c, x, 100, 2, 8, 7); }
  if (s.flags.gapBridged) { R(c, 180, 96, 50, 6, STEEL); R(c, 182, 98, 46, 2, 7); }
  R(c, 250, 18, 60, 44, 8); R(c, 256, 24, 48, 32, 7); R(c, 270, 30, 20, 20, DARKSTEEL); R(c, 276, 36, 8, 8, 12); R(c, 250, 56, 60, 6, 8); R(c, 262, 62, 8, 38, 8); R(c, 292, 62, 8, 38, 8); text(c, 258, 14, 'LIEN', 7);
  if (s.flags.clipped) { for (let i = 0; i < 20; i++) R(c, 84 + i * 2, 112 + Math.floor(Math.sin(i) * 2), 2, 1, 14); }
}
function hull2Bg(c, s) {
  stars(c, 100, 11); hullDeck(c);
  R(c, 40, 60, 40, 56, 7); R(c, 44, 64, 32, 48, s.flags.padlockCut ? 0 : 8); if (s.flags.padlockCut) { R(c, 48, 70, 24, 6, 8); R(c, 50, 80, 6, 6, 12); R(c, 60, 80, 8, 8, 15); R(c, 50, 92, 20, 2, 10); } if (!s.flags.padlockCut) { R(c, 52, 88, 16, 18, 14); R(c, 56, 84, 8, 6, 7); R(c, 58, 94, 4, 6, 0); }
  disc(c, 170, 50, 40, 7); disc(c, 170, 50, 34, 8); disc(c, 170, 50, 26, 7); R(c, 168, 20, 4, 60, 15); R(c, 150, 48, 40, 4, 15); R(c, 160, 80, 20, 20, 8); R(c, 164, 100, 12, 16, 7);
  if (!s.flags.gotPin) { R(c, 140, 80, 16, 6, 15); R(c, 152, 78, 4, 10, 15); } else if (s.flags.dishLocked) { R(c, 140, 84, 16, 4, 15); }
  R(c, 190, 88, 24, 28, 8); disc(c, 202, 96, 7, 7); R(c, 201, 89, 2, 7, s.flags.crankFree ? 15 : 11); R(c, 196, 104, 12, 12, 7); if (!s.flags.crankFree) sparse(c, 190, 86, 24, 30, 15, 2);
  panel(c, 250, 40, 40, 60, 7, 8); R(c, 254, 44, 32, 24, 0); text(c, 256, 47, s.flags.dishLocked ? 'LANE' : 'VELL', s.flags.dishLocked ? 10 : 12); text(c, 256, 55, s.flags.dishLocked ? 'BCN 7' : 'PRIV', 15); for (let i = 0; i < 5; i++) R(c, 256 + i * 6, 76, 4, 4, s.flags.dishLocked ? 10 : 12);
  R(c, 296, 40, 24, 76, 7); R(c, 300, 44, 16, 68, 8); R(c, 304, 60, 8, 8, 10); text(c, 298, 30, 'C', 15);
  if (s.flags.dishLocked) { for (let i = 0; i < 12; i++) R(c, 10 + i * 4, 30 - i, 2, 1, 10); }
}
function hullProps(c, s, t) { return []; }

// ---------- Chapter 6 ----------
function readyBg(c, s) {
  room(c, 1, '#6a4a2a', { trim: 6 }); for (let i = 0; i < 3; i++) panel(c, 20 + i * 100, 12, 80, 8, 1, 9);
  R(c, 20, 30, 30, 86, 8); for (let i = 0; i < 3; i++) { R(c, 24 + i * 8, 34, 6, 50, 15); R(c, 25 + i * 8, 40, 4, 4, 11); } R(c, 46, 34, 2, 50, 7);
  R(c, 70, 50, 40, 50, 7); R(c, 74, 54, 32, 20, 0); R(c, 78, 58, 24, 12, 6); R(c, 84, 80, 12, 10, 15); R(c, 86, 90, 8, 6, 6); R(c, 74, 96, 32, 4, 8); text(c, 76, 60, 'CAFE', 14);
  R(c, 150, 24, 60, 36, 6); if (!s.flags.gotContract) { R(c, 154, 28, 52, 28, 15); for (let i = 0; i < 6; i++) R(c, 158, 32 + i * 4, 40 - (i % 2) * 10, 1, 0); R(c, 158, 48, 20, 2, 14); } else R(c, 154, 28, 52, 28, 1);
  R(c, 130, 80, 100, 36, 6); R(c, 130, 80, 100, 4, '#9a6a3a'); R(c, 150, 96, 30, 12, s.flags.drawerOpen ? 0 : '#5a3a1a'); R(c, 162, 100, 6, 3, 14); R(c, 200, 70, 14, 10, 8); R(c, 134, 110, 4, 10, 6); R(c, 222, 110, 4, 10, 6);
  R(c, 240, 30, 30, 40, 8); R(c, 244, 34, 22, 32, 0); R(c, 262, 36, 10, 36, 7);
  door(c, 280, 20, 38, 96, 8, s.flags.pastBrack ? 10 : 12);
  R(c, 60, 140, 40, 20, 8); R(c, 62, 142, 36, 16, 7); R(c, 76, 146, 8, 8, 0); text(c, 64, 162, 'MOP LIFT', 0);
}
function readyProps(c, s, t) {
  const out = [];
  if (!s.flags.pastBrack) out.push({ y: 116, d: () => brack(c, 299, 116, -1) }); else out.push({ y: 1, d: () => brack(c, 312, 116, -1) });
  if (s.inv.includes('mop')) out.push({ y: 151, d: () => drawMop(c, 76, 151, t) });
  return out;
}
function bridgeBg(c, s, late) {
  room(c, DARKSTEEL, 8, { trim: 7, dark: true });
  R(c, 100, 10, 120, 60, 7); R(c, 104, 14, 112, 52, 0); sparse(c, 106, 16, 108, 48, 8, 5);
  if (late) { R(c, 130, 30, 60, 16, 7); R(c, 140, 26, 40, 4, 7); R(c, 150, 34, 20, 8, 14); text(c, 108, 58, 'LANE AUTHORITY', 10); }
  else { disc(c, 190, 40, 14, 6); R(c, 110, 50, 40, 10, 8); R(c, 112, 44, 10, 6, 8); R(c, 126, 46, 14, 4, 8); text(c, 108, 60, 'ETA 38M', 12); }
  R(c, 20, 20, 34, 34, 8); R(c, 22, 22, 30, 30, late ? 0 : '#102a3a');
  panel(c, 80, 70, 30, 46, 7, 8); R(c, 84, 74, 22, 14, 0); text(c, 86, 78, 'LOG', 10); for (let i = 0; i < 3; i++) R(c, 84, 92 + i * 6, 22, 3, 8);
  R(c, 130, 80, 60, 36, 7); R(c, 134, 84, 52, 10, 0); for (let i = 0; i < 6; i++) R(c, 136 + i * 8, 86, 5, 5, [10, 12, 14, 11, 10, 12][i]); disc(c, 160, 104, 8, 8); disc(c, 160, 104, 5, 7);
  R(c, 200, 60, 30, 56, 1); R(c, 204, 64, 22, 30, 9); R(c, 200, 94, 30, 6, 1); R(c, 204, 100, 4, 16, 8); R(c, 222, 100, 4, 16, 8);
  door(c, 0, 20, 14, 96, 8, 10);
}
function bridgeProps(c, s, t) {
  const out = [];
  out.push({ y: 1, d: () => { const a = (t / 20) % 6.28; const w = Math.abs(Math.cos(a)) * 12 + 2; R(c, 37 - w / 2, 26, w, 22, s.flags.filingVoid ? 4 : 11); R(c, 37 - w / 4, 30, w / 2, 1, 15); R(c, 37 - w / 4, 34, w / 2, 1, 15); if (s.flags.filingVoid) R(c, 24, 36, 26, 2, 12); if (Math.floor(t / 15) % 2 && !s.flags.filingVoid) R(c, 198, 18, 20, 14, 14); } });
  out.push({ y: 116, d: () => dorrit(c, 55, 116, 1) });
  out.push({ y: 117, d: () => vane(c, 245, 116, -1) });
  out.push({ y: 118, d: () => brack(c, 303, 116, -1) });
  if (s.inv.includes('mop')) out.push({ y: 139, d: () => drawMop(c, 166, 139, t) });
  return out;
}

// ---------- Chapter 7 ----------
function collarBg(c, s) {
  room(c, 8, DARKSTEEL, { trim: 7, dark: true }); for (let i = 0; i < 5; i++) R(c, 0, 14 + i * 20, 320, 2, 7);
  R(c, 20, 14, 50, 40, 7); R(c, 24, 18, 42, 32, 0); for (let i = 0; i < 12; i++) R(c, 26 + (i * 37) % 38, 20 + (i * 13) % 28, 1, 1, 15);
  R(c, 30, 70, 60, 46, 6); R(c, 30, 70, 60, 4, '#c08040'); R(c, 34, 78, 52, 34, '#7a4a1a'); text(c, 36, 82, 'VELLACOURT', 14); if (!s.flags.gotSlip) { R(c, 40, 92, 16, 12, 15); R(c, 42, 95, 12, 1, 0); R(c, 42, 98, 8, 1, 0); }
  if (!s.flags.gotSandwich) { R(c, 96, 104, 16, 6, 14); R(c, 96, 106, 16, 2, 6); R(c, 97, 108, 14, 2, 10); }
  R(c, 120, 20, 80, 96, 7); R(c, 124, 24, 72, 88, s.flags.inLien ? 0 : 8); if (!s.flags.inLien) { R(c, 158, 24, 4, 88, 7); R(c, 140, 40, 16, 16, 11); R(c, 164, 40, 16, 16, 11); } R(c, 204, 60, 16, 20, 0); for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) R(c, 206 + k * 4, 62 + r * 4, 3, 3, 15); R(c, 206, 74, 12, 3, s.flags.inLien ? 10 : 12);
  R(c, 240, 30, 50, 80, 8); for (let i = 0; i < 4; i++) R(c, 244, 36 + i * 18, 42, 3, 7); for (let i = 0; i < 6; i++) R(c, 248 + i * 7, 40, 3, 10, 0);
  door(c, 0, 30, 14, 86, 8, s.flags.clampsBlown ? 10 : 12);
}
function collarProps(c, s, t) {
  const out = [];
  if ((s.flags.tick || 0) % 2 === 0) { const x = 26 + (Math.floor(t / 3) % 46); out.push({ y: 1, d: () => { if (x > 24 && x < 64) { R(c, x, 28 + Math.floor(Math.sin(t / 20) * 4), 2, 14, 6); R(c, x - 1, 40 + Math.floor(Math.sin(t / 20) * 4), 4, 4, 7); } } }); }
  if (s.flags.mopHeld) out.push({ y: 2, d: () => drawMop(c, 160, 114, t) }); else if (s.inv.includes('mop')) out.push({ y: 141, d: () => drawMop(c, 246, 141, t) });
  return out;
}
function holdBg(c, s) {
  room(c, DARKSTEEL, 8, { trim: 7, dark: true });
  R(c, 20, 10, 230, 62, 8); [20, 40, 60].forEach(y => R(c, 20, y + 10, 230, 3, 7));
  for (let i = 0; i < 4; i++) { R(c, 32 + i * 12, 20, 10, 8, 14); R(c, 34 + i * 12, 22, 6, 1, 0); }
  R(c, 118, 40, 44, 30, 0); disc(c, 128, 62, 7, 7); disc(c, 152, 62, 7, 7); R(c, 128, 46, 24, 2, 12); R(c, 140, 48, 2, 14, 12); R(c, 126, 44, 8, 2, 12);
  for (let i = 0; i < 4; i++) { R(c, 204 + i * 10, 20, 6, 10, 14); R(c, 206 + i * 10, 30, 2, 2, 6); }
  for (let i = 0; i < 3; i++) pod(c, 252 + i * 18, 44, 16, 70, true);
  panel(c, 20, 80, 30, 36, 7, 8); R(c, 24, 84, 22, 14, 0); text(c, 26, 88, 'SOLD', 12);
  R(c, 60, 84, 10, 16, 7); R(c, 63, s.flags.lightsOff ? 92 : 86, 4, 6, 0);
  R(c, 90, 70, 40, 18, 7); R(c, 94, 74, 32, 10, 8); for (let i = 0; i < 6; i++) R(c, 92 + i * 7, 88, 2, 10, 7); R(c, 86, 68, 50, 2, 15);
  R(c, 150, 84, 40, 32, 0); R(c, 200, 84, 40, 32, 0); text(c, 152, 76, 'CREW', 7); text(c, 202, 76, 'CLAMP', 7);
  if (s.flags.polished) R(c, 202, 104, 36, 12, '#5a6a8a');
  door(c, 0, 30, 14, 86, 8, 10);
  if (s.flags.lightsOff) { sparse(c, 0, 0, 320, 180, 0, 2); R(c, 24, 84, 22, 14, 0); text(c, 26, 88, 'SOLD', 12); }
}
function holdProps(c, s, t) { const out = []; if (s.inv.includes('mop')) out.push({ y: 147, d: () => drawMop(c, 136, 147, t) }); if (s.flags.dorritSlid) out.push({ y: 117, d: () => { fig(c, 224, 112, { shirt: 8, pants: 0, hair: 6, glasses: true, dir: -1 }); } }); return out; }
function quartersBg(c, s) {
  room(c, '#2a2a3a', '#4a3a3a', { trim: 8, dark: true });
  R(c, 20, 70, 90, 46, 8); R(c, 22, 72, 86, 30, 7); R(c, 24, 74, 82, 8, 15); R(c, 26, 76, 20, 4, 11); R(c, 20, 108, 90, 8, DARKSTEEL);
  R(c, 130, 80, 70, 36, 6); R(c, 130, 80, 70, 4, '#9a6a3a'); R(c, 134, 110, 4, 10, 6); R(c, 192, 110, 4, 10, 6); R(c, 150, 66, 30, 16, s.flags.lockboxOpen ? 0 : 8); R(c, 152, 68, 26, 12, s.flags.lockboxOpen ? 8 : 7); if (!s.flags.lockboxOpen) R(c, 163, 72, 4, 4, 14);
  R(c, 204, 48, 12, 34, 14); R(c, 208, 56, 4, 26, 6); R(c, 200, 44, 20, 6, 14);
  R(c, 232, 24, 6, 6, 7); R(c, 218, 30, 34, 64, 15); R(c, 220, 32, 30, 60, 1); R(c, 234, 34, 2, 56, 14); R(c, 222, 36, 8, 4, 14); if (!s.flags.gotCode) R(c, 226, 54, 14, 12, 9);
  R(c, 270, 128, 30, 22, 8); for (let i = 0; i < 6; i++) R(c, 272 + i * 5, 130, 2, 18, s.flags.gumboLarge ? 8 : 13);
  door(c, 300, 30, 20, 86, 8, 10);
}
function quartersProps(c, s, t) { const out = []; if (!s.flags.catMoved) out.push({ y: 116, d: () => cat(c, 222, 116) }); else out.push({ y: 1, d: () => cat(c, 90, 102) }); return out; }
function clampsBg(c, s) {
  room(c, DARKSTEEL, 8, { trim: 7, dark: true });
  R(c, 20, 20, 100, 96, 8); for (let i = 0; i < 3; i++) { R(c, 26 + i * 32, 24, 24, 88, 7); R(c, 30 + i * 32, 24, 16, s.flags.clampsBlown ? 20 : 60, 15); R(c, 26 + i * 32, 84, 24, 6, 3); }
  panel(c, 150, 50, 60, 50, 7, 8); R(c, 156, 60, 14, 16, 0); R(c, 190, 60, 14, 16, 0); R(c, 162, 66, 2, 6, s.flags.keyAIn ? 14 : 8); R(c, 196, 66, 2, 6, s.flags.gumboOnB ? 14 : 8); R(c, 160, 84, 40, 8, s.flags.keysTurned ? 10 : s.flags.keyAIn ? 14 : 12);
  R(c, 220, 60, 20, 50, 8); R(c, 228, s.flags.clampsBlown ? 90 : 62, 4, 20, 12); disc(c, 230, s.flags.clampsBlown ? 110 : 62, 4, 12);
  disc(c, 265, 45, 14, 7); disc(c, 265, 45, 11, 15); R(c, 264, 38, 2, 7, s.flags.clampsBlown ? 12 : 0); text(c, 254, 62, s.flags.clampsBlown ? '0' : 'NOM', 15);
  R(c, 290, 20, 22, 20, 8); R(c, 294, 24, 14, 12, 0); for (let i = 0; i < 3; i++) R(c, 296 + i * 4, 26, 2, 8, 7);
  door(c, 0, 30, 14, 86, 8, 10); if (s.flags.polished) { R(c, 0, 118, 14, 62, '#5a6a8a'); R(c, 2, 124, 10, 1, 15); }
}
function clampsProps(c, s, t) { const out = []; if (!s.flags.dorritSlid) out.push({ y: 116, d: () => dorrit(c, 274, 116, -1, true) }); if (s.inv.includes('mop')) out.push({ y: 141, d: () => drawMop(c, 46, 141, t) }); if (s.flags.gumboOnB && !s.flags.keysTurned) out.push({ y: 2, d: () => drawGumbo(c, 197, 78, 3, t) }); return out; }

// ---------- Chapter 8 ----------
function liftBg(c, s) {
  room(c, 8, 7, { trim: 0 }); R(c, 40, 10, 240, 108, DARKSTEEL); for (let i = 0; i < 6; i++) R(c, 40, 20 + i * 18, 240, 1, 8);
  R(c, 60, 20, 60, 40, s.flags.folded ? 0 : 8); R(c, 64, 24, 52, 32, s.flags.folded ? 0 : 7); if (!s.flags.folded) R(c, 86, 36, 8, 8, 0);
  panel(c, 200, 40, 40, 60, 7, 8); ['8', '7', '6', 'CRYO'].forEach((l, i) => { R(c, 206, 46 + i * 12, 28, 9, i === 3 ? 10 : 8); text(c, 208, 48 + i * 12, l, 0); }); R(c, 200, 104, 20, 12, 4); disc(c, 210, 110, 4, 12);
  door(c, 0, 30, 14, 86, 8, 10);
}
function liftProps(c, s, t) { const out = []; if (s.inv.includes('mop')) out.push({ y: 141, d: () => drawMop(c, 148, 141, t) }); return out; }
function gallery2Props(c, s, t) { const out = []; if (s.flags.brackArrived) out.push({ y: 116, d: () => brack(c, 24, 116, 1, s.flags.brackStalled) }); if (s.inv.includes('mop')) out.push({ y: 141, d: () => drawMop(c, 76, 141, t) }); return out; }
function bridge2Props(c, s, t) { const out = []; out.push({ y: 116, d: () => okonjo(c, 212, 116, -1) }); out.push({ y: 117, d: () => vane(c, 265, 116, -1) }); if (s.inv.includes('mop')) out.push({ y: 139, d: () => drawMop(c, 166, 139, t) }); return out; }

export const ART = {
  closet: { bg: closetBg, props: closetProps }, deck9: { bg: deck9Bg, props: deck9Props },
  cryo: { bg: cryoBg, props: cryoProps }, gallery: { bg: (c, s) => galleryBg(c, s, false), props: galleryProps },
  galley: { bg: galleyBg, props: galleyProps }, hydro: { bg: hydroBg, props: hydroProps },
  drive: { bg: driveBg, props: driveProps }, reactor: { bg: reactorBg, props: () => [] },
  hull1: { bg: hull1Bg, props: hullProps }, hull2: { bg: hull2Bg, props: hullProps },
  ready: { bg: readyBg, props: readyProps }, bridge: { bg: (c, s) => bridgeBg(c, s, false), props: bridgeProps },
  collar: { bg: collarBg, props: collarProps }, hold: { bg: holdBg, props: holdProps }, quarters: { bg: quartersBg, props: quartersProps }, clamps: { bg: clampsBg, props: clampsProps },
  lift: { bg: liftBg, props: liftProps }, gallery2: { bg: (c, s) => galleryBg(c, s, true), props: gallery2Props }, bridge2: { bg: (c, s) => bridgeBg(c, s, true), props: bridge2Props }
};
export const COVER = { closet: (c) => { closetBg(c, { flags: {}, inv: ['mop'] }); drawMop(c, 114, 141, 0); drawPlayer(c, 170, 160, -1, 0); } };
