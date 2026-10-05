// Generated Scene 1 only; scripts/extract-mop-free-scene.py --check.
// Mop & Galaxy — pixel art for every room, drawn with canvas rects in the 16-colour EGA palette (320x180).
// Each room exports { bg(ctx, state), props(ctx, state, frame) -> [{ y, d }] } where props are depth-sorted with the player.
import { R, disc, sparse, text, fig } from './pixels.js';

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
function room(c, wall, floor, { trim = 7, base = 118, lines = true, dark = false } = {}) {
  R(c, 0, 0, 320, base, wall); R(c, 0, base, 320, 180 - base, floor); R(c, 0, base - 3, 320, 3, trim);
  if (lines) for (let i = 0; i < 9; i++) R(c, 0, base + 6 + i * 7, 320, 1, dark ? 0 : 8);
  R(c, 0, 0, 320, 10, dark ? 0 : 8);
}
function panel(c, x, y, w, h, k = 7, k2 = 8) { R(c, x, y, w, h, k2); R(c, x + 1, y + 1, w - 2, h - 2, k); R(c, x + 2, y + 2, w - 4, 1, 15); }
function door(c, x, y, w, h, k = 8, light = 12) { R(c, x, y, w, h, k); R(c, x + 2, y + 2, w - 4, h - 4, DARKSTEEL); R(c, x + w / 2 - 1, y + 4, 2, h - 8, k); R(c, x + w / 2 - 3, y - 4, 6, 3, light); }
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
export const ART = {closet:{bg:closetBg,props:closetProps},deck9:{bg:deck9Bg,props:deck9Props}};
