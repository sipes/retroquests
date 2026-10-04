// Last Night in Port Lucky — pixel art. 320x180, 16-colour EGA palette, drawn with rectangles on canvas.
// Each room exports { bg(ctx, state), props(ctx, state, frame) -> [{ y, d }] } where props are depth-sorted with the player.
import { PAL } from './data.js';

const SKIN = '#FFAA77', DARKWOOD = '#7A3C00', PLUM = '#331133', SAND = '#E8D7A8', SEA = '#1a6fa8', NAVY = '#0a2a48', GRASS = '#2d9a3a', GRASS2 = '#1f7a2c', CANVAS = '#f4efe0';
const col = c => typeof c === 'number' ? PAL[c] : c;
export function R(c, x, y, w, h, k) { c.fillStyle = col(k); c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
export function disc(c, cx, cy, r, k) { for (let dy = -r; dy <= r; dy++) { const dx = Math.floor(Math.sqrt(r * r - dy * dy)); R(c, cx - dx, cy + dy, dx * 2 + 1, 1, k); } }
export function sparse(c, x, y, w, h, k, step = 4) { c.fillStyle = col(k); for (let j = 0; j < h; j += 2) for (let i = ((j / 2) % 2) * (step / 2); i < w; i += step) c.fillRect(x + i, y + j, 1, 1); }
function text(c, x, y, s, k, scale = 1) { // tiny 3x5 font for signs (caps, digits, few symbols)
  const F = { A:'111101111101101',B:'110101110101110',C:'111100100100111',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'111100101101111',H:'101101111101101',I:'111010010010111',J:'001001001101111',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'111101101101111',P:'111101111100100',Q:'111101101111001',R:'111101110101101',S:'111100111001111',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111','0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001001001001','8':'111101111101111','9':'111101111001111',' ':'000000000000000','&':'010101010101011','\'':'010010000000000','.':'000000000000010','-':'000000111000000','!':'010010010000010' };
  let cx = x; for (const ch of s.toUpperCase()) { const m = F[ch] || F[' ']; for (let i = 0; i < 15; i++) if (m[i] === '1') R(c, cx + (i % 3) * scale, y + Math.floor(i / 3) * scale, scale, scale, k); cx += 4 * scale; }
}

// ---------- People ----------
export function drawPlayer(c, x, y, dir, step) {
  const lift = step ? 1 : 0;
  R(c, x - 6 + (step ? -1 : 0), y - 2, 5, 2, 15); R(c, x + 1 + (step ? 1 : 0), y - 2, 5, 2, 15);
  R(c, x - 5 + (step ? -1 : 0), y - 10, 3, 8 - lift, SKIN); R(c, x + 2 + (step ? 1 : 0), y - 10, 3, 8, SKIN);
  R(c, x - 6, y - 15, 12, 6, 1);
  R(c, x - 7, y - 26, 14, 12, 11); R(c, x - 4, y - 23, 2, 2, 13); R(c, x + 2, y - 20, 2, 2, 13); R(c, x - 2, y - 17, 2, 2, 13); R(c, x + 3, y - 25, 2, 1, 13);
  R(c, x - 9, y - 25, 2, 9, 11); R(c, x + 7, y - 25, 2, 9, 11); R(c, x - 9, y - 16, 2, 2, SKIN); R(c, x + 7, y - 16, 2, 2, SKIN);
  R(c, x - 1, y - 28, 3, 2, SKIN);
  R(c, x - 4, y - 36, 8, 8, SKIN); R(c, x - 4, y - 37, 8, 2, 6); R(c, x + (dir > 0 ? -4 : 3), y - 36, 1, 4, 6);
  R(c, x + (dir > 0 ? -2 : -4), y - 33, 6, 2, 0); R(c, x + (dir > 0 ? 1 : -3), y - 33, 1, 1, 8);
  R(c, x + (dir > 0 ? 4 : -5), y - 31, 1, 1, SKIN); R(c, x + (dir > 0 ? 0 : -2), y - 30, 3, 1, 4);
}
// Generic NPC. o: { shirt, pants, skin, hair, hat, hatK, dir, dress, apron, cap, h (height scale 1) , glasses, beard, long (long hair) }
export function fig(c, x, y, o = {}) {
  const sk = o.skin || SKIN, dir = o.dir || 1, hair = o.hair ?? 0, shirt = o.shirt ?? 7, pants = o.pants ?? 8;
  if (o.dress) { R(c, x - 7, y - 16, 14, 16, o.dress); R(c, x - 5, y - 1, 4, 1, 0); R(c, x + 1, y - 1, 4, 1, 0); }
  else { R(c, x - 5, y - 11, 4, 11, pants); R(c, x + 1, y - 11, 4, 11, pants); R(c, x - 6, y - 1, 5, 1, 0); R(c, x + 1, y - 1, 5, 1, 0); }
  R(c, x - 7, y - 27, 14, (o.dress ? 11 : 16), shirt);
  if (o.apron) R(c, x - 5, y - 20, 10, 16, o.apron);
  R(c, x - 9, y - 26, 2, 10, shirt); R(c, x + 7, y - 26, 2, 10, shirt); R(c, x - 9, y - 16, 2, 2, sk); R(c, x + 7, y - 16, 2, 2, sk);
  R(c, x - 1, y - 29, 3, 2, sk);
  R(c, x - 4, y - 37, 8, 8, sk); R(c, x - 4, y - 38, 8, 2, hair); R(c, x + (dir > 0 ? -4 : 3), y - 37, 1, 4, hair);
  if (o.long) { R(c, x - 5, y - 36, 1, 10, hair); R(c, x + 4, y - 36, 1, 10, hair); }
  if (o.beard) R(c, x - 3, y - 31, 6, 2, hair);
  R(c, x + (dir > 0 ? 0 : -2), y - 34, 2, 1, 0); R(c, x + (dir > 0 ? 3 : 1), y - 34, 1, 1, 0);
  if (o.glasses) { R(c, x - 4, y - 34, 3, 1, 0); R(c, x + 1, y - 34, 3, 1, 0); }
  if (o.hat) { R(c, x - 6, y - 40, 12, 3, o.hatK ?? 0); R(c, x - 4, y - 43, 8, 3, o.hatK ?? 0); }
  if (o.cap) { R(c, x - 5, y - 40, 10, 3, o.cap); R(c, x + (dir > 0 ? 3 : -8), y - 38, 5, 1, o.cap); }
}
export function drawGoat(c, s, t, ox = 0, oy = 0, bowtie = true) {
  const j = (Math.floor(t / 18) % 2); const X = x => x + ox, Y = y => y + oy;
  R(c, X(135), Y(66), 4, 3, 15);
  R(c, X(138), Y(64), 34, 16, 15); R(c, X(138), Y(78), 34, 2, 7); sparse(c, X(140), Y(66), 30, 10, 7, 8);
  [140, 147, 162, 168].forEach(x => { R(c, X(x), Y(80), 3, 14, 7); R(c, X(x), Y(94), 3, 2, 0); });
  R(c, X(168), Y(56), 8, 12, 15);
  R(c, X(172), Y(50), 14, 11, 15); R(c, X(182), Y(54), 6, 7, 15);
  R(c, X(169), Y(51), 4, 3, 7); R(c, X(174), Y(45), 2, 5, 8); R(c, X(178), Y(45), 2, 5, 8); R(c, X(173), Y(44), 2, 2, 8); R(c, X(179), Y(44), 2, 2, 8);
  R(c, X(178), Y(53), 3, 2, 14); R(c, X(179), Y(54), 2, 1, 0);
  if (bowtie) { R(c, X(167), Y(64), 3, 4, 12); R(c, X(172), Y(64), 3, 4, 12); R(c, X(170), Y(65), 2, 2, 4); }
  R(c, X(183), Y(61), 3, 5, 7); R(c, X(184), Y(59 + j), 4, 1, 0);
  if (s && s.flags && !s.flags.goatFed && !ox) { R(c, X(186), Y(57 + j), 8, 5, 14); R(c, X(187), Y(58 + j), 6, 1, 1); } else if (j) R(c, X(187), Y(60), 2, 1, 14);
}
function smallGoat(c, x, y, t, bowtie) { // standing goat, head right, ~30x30 at (x,y)=bottom-left
  const j = Math.floor(t / 20) % 2;
  R(c, x + 2, y - 20, 22, 10, 15); sparse(c, x + 3, y - 19, 20, 7, 7, 8);
  [3, 8, 16, 21].forEach(d => { R(c, x + d, y - 10, 2, 9, 7); R(c, x + d, y - 1, 2, 1, 0); });
  R(c, x + 22, y - 26, 5, 8, 15); R(c, x + 24, y - 30, 9, 7, 15); R(c, x + 31, y - 28, 4, 4, 15);
  R(c, x + 25, y - 33, 1, 3, 8); R(c, x + 28, y - 33, 1, 3, 8); R(c, x + 29, y - 28, 1, 1, 0); R(c, x + 33, y - 25 + j, 2, 1, 0);
  if (bowtie) { R(c, x + 21, y - 19, 2, 3, 12); R(c, x + 24, y - 19, 2, 3, 12); R(c, x + 23, y - 18, 1, 1, 4); }
  R(c, x, y - 18, 2, 3, 15);
}
function tuba(c, x, y) { // small tuba ~30x26, bottom-left (x,y)
  R(c, x + 6, y - 6, 20, 5, 14); R(c, x + 6, y - 6, 20, 1, 15); R(c, x + 6, y - 20, 5, 16, 14);
  R(c, x + 14, y - 16, 2, 8, 7); R(c, x + 18, y - 16, 2, 8, 7); R(c, x + 4, y - 24, 4, 4, 7);
  disc(c, x + 26, y - 12, 9, 14); disc(c, x + 26, y - 12, 6, 6); disc(c, x + 26, y - 12, 3, '#552200');
}
function palm(c, x, y, h) { R(c, x, y - h, 5, h, 6); R(c, x + 1, y - h, 1, h, 14); for (let i = 0; i < 6; i++) { const a = i * 1.05; const dx = Math.cos(a) * 18, dy = Math.sin(a) * 8 - 6; for (let k = 0; k < 10; k++) R(c, x + 2 + dx * k / 10, y - h + dy * k / 10 + k * k * .15, 3, 2, k % 2 ? 2 : 10); } }
function cloudSky(c, top, bottom, h = 60, clouds = true) { R(c, 0, 0, 320, h, top); R(c, 0, h, 320, 180 - h, bottom); if (clouds) [[30, 14], [150, 22], [250, 10]].forEach(([x, y]) => { R(c, x, y, 26, 6, 15); R(c, x + 6, y - 4, 14, 4, 15); R(c, x + 10, y + 6, 10, 2, 15); }); }
function chair(c, x, y, k = 15) { R(c, x, y - 14, 10, 2, k); R(c, x, y - 12, 2, 12, k); R(c, x + 8, y - 12, 2, 12, k); R(c, x, y - 6, 10, 2, k); }
function table(c, x, y, w, k = 15, leg = 7) { R(c, x, y, w, 4, k); R(c, x + 2, y + 4, 2, 10, leg); R(c, x + w - 4, y + 4, 2, 10, leg); }

// ---------- Chapter 1: suite (ported from the demo) ----------
function suiteBg(c, s) {
  R(c, 0, 0, 320, 112, 5);
  for (let y = 10, row = 0; y < 106; y += 10, row++) for (let x = (row % 2) * 8 + 4; x < 320; x += 16) R(c, x, y, 2, 2, 13);
  R(c, 0, 0, 320, 6, 13); R(c, 0, 6, 320, 1, 0); R(c, 0, 108, 320, 4, 6); R(c, 0, 108, 320, 1, 14);
  R(c, 0, 112, 320, 68, 4); sparse(c, 0, 112, 320, 68, 12, 6);
  R(c, 6, 12, 10, 98, 12); R(c, 82, 12, 10, 98, 12);
  for (let i = 0; i < 3; i++) { R(c, 8 + i * 3, 14, 1, 94, 4); R(c, 84 + i * 3, 14, 1, 94, 4); }
  R(c, 14, 16, 70, 92, 15); R(c, 18, 20, 62, 84, 11); disc(c, 64, 34, 7, 14);
  R(c, 18, 62, 62, 16, 1); sparse(c, 18, 62, 62, 16, 9, 6); R(c, 18, 78, 62, 26, 14); sparse(c, 18, 78, 62, 26, 6, 8);
  R(c, 30, 44, 3, 36, 6); R(c, 22, 42, 14, 3, 2); R(c, 28, 38, 12, 3, 10); R(c, 32, 44, 10, 3, 2); R(c, 20, 46, 6, 2, 10);
  R(c, 18, 82, 62, 2, 15); for (let x = 20; x < 80; x += 6) R(c, x, 82, 1, 22, 15); R(c, 48, 20, 2, 84, 15);
  R(c, 126, 18, 62, 36, 14); R(c, 129, 21, 56, 30, 3); sparse(c, 129, 21, 56, 30, 11, 6);
  disc(c, 154, 38, 6, 13); R(c, 159, 26, 2, 12, 13); R(c, 158, 24, 5, 3, 13); R(c, 162, 25, 3, 1, 0); R(c, 158, 27, 5, 1, 4); R(c, 153, 44, 1, 7, 12); R(c, 156, 44, 1, 7, 12);
  R(c, 240, 6, 1, 10, 7); disc(c, 240, 22, 6, 7); for (let i = 0; i < 6; i++) R(c, 236 + (i % 3) * 3, 18 + Math.floor(i / 3) * 4, 1, 1, 15); R(c, 238, 26, 4, 1, 8);
  R(c, 266, 26, 40, 86, DARKWOOD); R(c, 270, 30, 32, 80, 6); R(c, 274, 36, 24, 28, DARKWOOD); R(c, 275, 37, 22, 26, 6); R(c, 274, 70, 24, 34, DARKWOOD); R(c, 275, 71, 22, 32, 6);
  R(c, 292, 60, 6, 10, 0); R(c, 294, 62, 2, 2, s.flags.leftSuite ? 10 : 12); disc(c, 297, 76, 1, 14); R(c, 278, 16, 16, 6, 2); R(c, 280, 18, 12, 2, 10);
  if (s.flags.minibarOpen) { R(c, 216, 80, 34, 30, 7); R(c, 218, 82, 30, 26, 0); R(c, 218, 95, 30, 1, 8); if (!s.flags.gotCrackers) { R(c, 224, 86, 11, 9, 14); R(c, 226, 89, 7, 1, 4); R(c, 226, 91, 5, 1, 4); } R(c, 250, 82, 8, 26, 15); R(c, 251, 84, 1, 22, 7); }
  else { R(c, 216, 80, 34, 30, 7); R(c, 218, 82, 30, 26, 15); R(c, 244, 90, 2, 8, 8); R(c, 222, 85, 12, 4, 7); }
  R(c, 86, 96, 20, 4, 6); R(c, 86, 96, 20, 1, 14); R(c, 89, 100, 2, 12, 6); R(c, 101, 100, 2, 12, 6); R(c, 90, 90, 13, 6, 12); R(c, 89, 87, 15, 3, 4); R(c, 94, 91, 5, 3, 15);
  R(c, 112, 76, 92, 22, 2); sparse(c, 112, 76, 92, 22, 10, 6); R(c, 157, 78, 1, 18, 0); R(c, 106, 96, 104, 14, 2); R(c, 108, 96, 100, 2, 10);
  R(c, 104, 84, 10, 26, 2); R(c, 104, 84, 10, 2, 10); R(c, 202, 84, 10, 26, 2); R(c, 202, 84, 10, 2, 10); R(c, 110, 110, 3, 3, 0); R(c, 203, 110, 3, 3, 0);
}
function suiteTable(c, t) { R(c, 122, 132, 70, 6, 6); R(c, 122, 132, 70, 1, 14); R(c, 126, 138, 3, 8, 6); R(c, 185, 138, 3, 8, 6); R(c, 149, 122, 9, 4, 9); R(c, 150, 123, 7, 2, 11); R(c, 152, 126, 3, 5, 15); R(c, 150, 131, 7, 1, 15); R(c, 156, 117, 1, 6, 15); R(c, 153, 116, 7, 2, 13); const b = Math.floor(t / 10) % 4; R(c, 151 + (b % 2) * 3, 121 - b, 1, 1, 15); }
function suiteTuba(c, s) { R(c, 36, 150, 28, 6, 14); R(c, 36, 150, 28, 1, 15); R(c, 36, 136, 6, 20, 14); R(c, 38, 154, 24, 8, 6); R(c, 38, 154, 24, 1, 14); R(c, 47, 140, 3, 10, 7); R(c, 52, 140, 3, 10, 7); R(c, 57, 140, 3, 10, 7); R(c, 34, 132, 5, 4, 7); disc(c, 70, 145, 13, 14); disc(c, 70, 145, 10, 6); disc(c, 70, 145, 6, '#552200'); if (!s.flags.gotTicket) { R(c, 69, 139, 4, 5, 15); R(c, 70, 140, 2, 1, 8); } }

// ---------- Chapter 2: garage (ported) ----------
function garageBg(c, s) {
  R(c, 0, 0, 320, 20, 8); R(c, 0, 8, 320, 3, 7); R(c, 0, 14, 320, 1, 0); R(c, 40, 18, 30, 2, 14); R(c, 190, 18, 30, 2, 14);
  R(c, 0, 20, 320, 92, 7); sparse(c, 0, 20, 320, 92, 8, 6);
  [100, 288].forEach(x => { R(c, x, 20, 16, 92, 8); R(c, x, 96, 16, 16, 14); for (let i = 0; i < 16; i += 6) R(c, x + i, 96, 3, 16, 0); });
  R(c, 148, 26, 24, 10, 2); R(c, 150, 28, 20, 6, 10); R(c, 154, 30, 12, 2, 2);
  R(c, 0, 112, 320, 68, 8); sparse(c, 0, 112, 320, 68, 7, 8); R(c, 0, 112, 320, 1, 0); [24, 172, 312].forEach(x => R(c, x, 140, 2, 40, 14));
  R(c, 226, 158, 24, 4, 0); R(c, 230, 157, 12, 1, 0); R(c, 232, 162, 10, 1, 0);
  R(c, 208, 58, 66, 8, 4); R(c, 208, 58, 66, 1, 12); R(c, 212, 66, 58, 52, 15); R(c, 218, 72, 46, 22, 3); R(c, 212, 96, 58, 4, 6);
  R(c, 252, 76, 9, 12, 6); for (let i = 0; i < 4; i++) R(c, 254 + (i % 2) * 4, 78 + Math.floor(i / 2) * 5, 1, 2, 14);
  R(c, 232, 78, 9, 9, SKIN); R(c, 231, 76, 11, 3, 0); R(c, 234, 81, 1, 1, 0); R(c, 238, 81, 1, 1, 0); R(c, 235, 84, 3, 2, 0); R(c, 229, 87, 15, 9, 4); R(c, 235, 88, 3, 1, 0); R(c, 236, 89, 1, 6, 15);
  if (s.flags.gotShoe && s.flags.gotReceipt) { R(c, 290, 112, 30, 40, 14); sparse(c, 290, 112, 30, 40, 6, 4); R(c, 288, 108, 34, 4, 10); }
}
export function drawTruck(c, s, ox = 0, oy = 0, open) {
  const X = x => x + ox, Y = y => y + oy; const isOpen = open != null ? open : (s && s.flags && s.flags.truckOpen);
  R(c, X(30), Y(64), 108, 10, 15); R(c, X(30), Y(64), 108, 1, 7);
  R(c, X(80), Y(52), 6, 12, 6); disc(c, X(83), Y(50), 6, 15); R(c, X(80), Y(48), 1, 1, 12); R(c, X(84), Y(46), 1, 1, 11); R(c, X(86), Y(50), 1, 1, 9); R(c, X(81), Y(52), 1, 1, 13);
  R(c, X(24), Y(74), 120, 48, 13); sparse(c, X(24), Y(74), 120, 48, 15, 8);
  R(c, X(118), Y(80), 24, 20, 11); R(c, X(118), Y(80), 24, 1, 15); R(c, X(128), Y(80), 1, 20, 13);
  if (isOpen) { R(c, X(40), Y(82), 50, 22, PLUM); R(c, X(40), Y(82), 50, 2, 15); if (s && !s.flags.gotShoe && !ox) { R(c, X(46), Y(95), 11, 5, 0); R(c, X(46), Y(95), 11, 1, 8); R(c, X(55), Y(93), 2, 3, 0); } if (s && !s.flags.gotReceipt && !ox) { R(c, X(68), Y(88), 7, 10, 15); R(c, X(69), Y(90), 5, 1, 8); R(c, X(69), Y(92), 4, 1, 8); R(c, X(69), Y(94), 5, 1, 8); } R(c, X(40), Y(76), 50, 6, 15); for (let x = 42; x < 90; x += 6) R(c, X(x), Y(76), 3, 6, 12); }
  else { R(c, X(40), Y(82), 50, 22, 15); for (let y = 85; y < 104; y += 3) R(c, X(40), Y(y), 50, 1, 7); }
  R(c, X(24), Y(106), 120, 4, 15); R(c, X(24), Y(110), 120, 2, 12); R(c, X(140), Y(110), 8, 8, 7); R(c, X(143), Y(111), 3, 3, '#AA3388'); R(c, X(20), Y(110), 6, 8, 7);
  [48, 120].forEach(x => { disc(c, X(x), Y(124), 8, 0); disc(c, X(x), Y(124), 3, 7); });
  R(c, X(94), Y(88), 18, 12, 15); R(c, X(96), Y(90), 14, 1, 4); R(c, X(96), Y(93), 10, 1, 4); R(c, X(96), Y(96), 12, 1, 4);
}

// ---------- Chapter 3: Big Earl's ----------
function barBg(c, s) {
  R(c, 0, 0, 320, 112, '#2a1a10'); for (let y = 0; y < 112; y += 8) R(c, 0, y, 320, 1, '#1a0e08'); // wood panelling
  R(c, 0, 0, 320, 8, 4); text(c, 100, 2, "BIG EARL'S", 14); text(c, 150, 2, 'PAWN & KARAOKE', 14);
  R(c, 0, 112, 320, 68, '#3a2418'); sparse(c, 0, 112, 320, 68, '#2a1a10', 6); // floor
  // stage
  R(c, 10, 104, 86, 12, 6); R(c, 10, 104, 86, 1, 14); R(c, 8, 20, 90, 84, 4); sparse(c, 8, 20, 90, 84, 12, 6); // red curtain
  R(c, 16, 56, 40, 48, 7); R(c, 20, 60, 32, 20, s.flags.tokenIn ? 11 : 1); R(c, 22, 70, 12, 1, 15); R(c, 22, 74, 20, 1, 15); R(c, 22, 86, 10, 10, 0); R(c, 24, 88, 6, 6, 14); // karaoke machine + slot
  R(c, 36, 86, 16, 12, 8); for (let i = 0; i < 6; i++) R(c, 38 + (i % 3) * 5, 88 + Math.floor(i / 3) * 5, 3, 3, i % 2 ? 12 : 10);
  R(c, 64, 60, 2, 44, 7); R(c, 60, 56, 10, 8, 8); R(c, 58, 100, 14, 4, 7); R(c, 62, 54, 6, 2, 0); // mic stand
  // polaroid wall
  R(c, 104, 20, 66, 42, 6); for (let i = 0; i < 12; i++) { const px = 108 + (i % 6) * 10, py = 24 + Math.floor(i / 6) * 18; R(c, px, py, 8, 10, 15); R(c, px + 1, py + 1, 6, 6, i === 11 ? 15 : [3, 5, 1, 2][i % 4]); if (i === 11 && !s.flags.gotPolaroid) { R(c, px + 2, py + 2, 2, 3, 11); R(c, px + 5, py + 3, 2, 2, 15); } else if (i === 11) R(c, px, py, 8, 10, 6); }
  // jukebox
  R(c, 172, 62, 22, 52, 6); R(c, 174, 64, 18, 20, 13); R(c, 176, 66, 14, 16, 1); R(c, 178, 86, 10, 14, 14); R(c, 176, 102, 14, 6, 0); R(c, 180, 104, 6, 2, 14);
  // bar counter
  R(c, 196, 92, 110, 24, DARKWOOD); R(c, 196, 92, 110, 3, 6); R(c, 196, 116, 110, 2, 0); R(c, 200, 20, 100, 70, '#1a0e08'); for (let i = 0; i < 8; i++) R(c, 204 + i * 12, 30, 6, 16, [10, 14, 12, 11][i % 4]); R(c, 200, 46, 100, 2, 7); // bottles
  // cage
  R(c, 258, 28, 34, 62, 8); R(c, 260, 30, 30, 58, s.flags.cageOpen ? 14 : 6); for (let x = 262; x < 290; x += 5) R(c, x, 30, 1, 58, s.flags.cageOpen ? 6 : 0); text(c, 262, 20, 'PAWN', 14);
  // doors
  R(c, 0, 44, 14, 72, DARKWOOD); R(c, 2, 46, 10, 68, 6); R(c, 10, 76, 2, 4, 14);
  R(c, 300, 40, 18, 76, DARKWOOD); R(c, 302, 42, 14, 72, 8); text(c, 303, 50, 'OUT', 12); R(c, 304, 78, 2, 4, 14);
  // duane's table
  R(c, 108, 108, 50, 6, 6); R(c, 108, 108, 50, 1, 14); R(c, 112, 114, 3, 14, 6); R(c, 151, 114, 3, 14, 6);
}
function barProps(c, s, t) {
  const out = [];
  out.push({ y: 93, d: () => { fig(c, 241, 94, { shirt: 15, pants: 8, hair: 8, apron: 0, beard: true, glasses: true, dir: -1 }); } }); // Earl
  out.push({ y: 112, d: () => { // Duane slumped or awake
    if (s.flags.duaneAwake) { fig(c, 127, 128, { shirt: 2, pants: 1, hair: 6, dir: 1 }); R(c, 138, 96, 14, 16, 14); R(c, 142, 92, 6, 4, 14); R(c, 136, 110, 18, 3, 6); }
    else { R(c, 112, 96, 32, 12, 2); R(c, 116, 90, 10, 10, SKIN); R(c, 116, 88, 10, 3, 6); R(c, 124, 96, 20, 6, 2); R(c, 138, 96, 14, 16, 14); R(c, 142, 92, 6, 4, 14); R(c, 136, 110, 18, 3, 6); R(c, 120, 112, 6, 16, 1); R(c, 130, 112, 6, 16, 1); if (Math.floor(t / 30) % 2) text(c, 126, 80, 'Z', 15); }
  } });
  if (!s.flags.cageOpen && Math.floor(t / 15) % 5 === 0) out.push({ y: 1, d: () => R(c, 18 + (t % 7), 58 + (t % 5), 1, 1, 15) }); // karaoke sparks
  return out;
}
function cageBg(c, s) {
  R(c, 0, 0, 320, 112, '#2a1a10'); for (let y = 0; y < 112; y += 8) R(c, 0, y, 320, 1, '#1a0e08');
  R(c, 0, 112, 320, 68, '#3a2418'); sparse(c, 0, 112, 320, 68, '#2a1a10', 6);
  R(c, 20, 26, 232, 46, DARKWOOD); R(c, 20, 26, 232, 2, 6); R(c, 20, 48, 232, 2, 6); // shelf
  // junk on shelves
  [[30, 32, 14, 7], [52, 30, 10, 11], [70, 34, 18, 5], [96, 30, 12, 9], [116, 28, 8, 14], [130, 32, 20, 6], [160, 30, 14, 10], [182, 34, 10, 3]].forEach(([x, y, w, k]) => R(c, x, y, w, 46 - y + 2, k));
  if (!s.flags.gotFeather && s.flags.sawShelf) { R(c, 204, 40, 2, 12, 13); R(c, 202, 38, 6, 6, 13); R(c, 206, 42, 4, 4, 13); } // feather
  if (s.flags.sawShelf && !s.flags.gotLens) { R(c, 230, 44, 14, 8, 0); R(c, 232, 46, 10, 4, 3); } // lens
  R(c, 30, 52, 40, 18, 7); R(c, 80, 56, 14, 14, 14); R(c, 110, 54, 30, 16, 8); R(c, 150, 52, 22, 18, 1); R(c, 190, 58, 40, 12, 6); // second shelf junk
  R(c, 262, 38, 36, 54, 0); for (let x = 266; x < 298; x += 6) R(c, x, 38, 1, 54, 8); // window bars
  R(c, 40, 96, 240, 22, DARKWOOD); R(c, 44, 92, 232, 6, 3); R(c, 44, 92, 232, 1, 11); // glass counter
  if (!s.flags.gotPage || true) { R(c, 118, 84, 44, 12, 15); R(c, 120, 86, 40, 1, 8); R(c, 120, 89, 30, 1, 8); R(c, 120, 92, 36, 1, 8); if (!s.flags.earlDistracted && !s.flags.gotPage) R(c, 150, 82, 8, 10, SKIN); } // ledger + thumb
  R(c, 60, 86, 36, 10, 14); R(c, 62, 88, 30, 1, 8); R(c, 62, 91, 24, 1, 8); // receipt book
  R(c, 0, 40, 16, 76, DARKWOOD); R(c, 2, 42, 12, 72, 6);
}
function cageProps(c, s, t) { return [{ y: 1, d: () => { fig(c, 280, 92, { shirt: 15, pants: 8, hair: 8, apron: 0, beard: true, glasses: true, dir: -1 }); if (s.flags.earlDistracted) R(c, 268, 70, 8, 10, 15); } }]; }
function alleyBg(c, s) {
  cloudSky(c, 11, 11, 40, false); R(c, 0, 0, 320, 40, '#4aa8d8');
  R(c, 0, 40, 320, 92, 8); for (let y = 44; y < 132; y += 8) for (let x = (y / 8 % 2) * 8; x < 320; x += 16) R(c, x, y, 15, 7, '#7a2a1a'); // brick
  R(c, 0, 132, 320, 48, 7); sparse(c, 0, 132, 320, 48, 8, 6); R(c, 0, 132, 320, 1, 0);
  R(c, 176, 40, 34, 76, DARKWOOD); R(c, 180, 44, 26, 68, 6); R(c, 198, 76, 2, 4, 14); text(c, 182, 48, 'BAR', 14);
  R(c, 220, 78, 42, 44, 8); R(c, 222, 76, 38, 4, 7); R(c, 224, 90, 10, 20, 0); R(c, 248, 90, 10, 20, 0); R(c, 262, 106, 10, 16, s.flags ? 10 : 10); R(c, 264, 102, 6, 6, 10); // bins + bottle
  R(c, 296, 60, 24, 80, '#4aa8d8'); R(c, 296, 60, 2, 80, 0); R(c, 300, 120, 20, 20, SAND); // gap to street
}
function alleyProps(c, s, t) { return [{ y: 131, d: () => { drawTruck(c, null, -10, 0, false); if (s.flags.truckStarted && Math.floor(t / 8) % 2) R(c, 118 - 10 + 20, 46, 3, 3, 14); } }]; }

// ---------- Chapter 4: Boardwalk ----------
function pierBg(c, s) {
  cloudSky(c, '#4aa8d8', SEA, 60); R(c, 0, 60, 320, 30, SEA); for (let x = 0; x < 320; x += 12) R(c, x + (x / 12 % 2) * 4, 70 + (x / 12 % 3), 6, 1, 11);
  R(c, 0, 90, 320, 90, '#b08048'); for (let y = 94; y < 180; y += 6) R(c, 0, y, 320, 1, '#7a5428'); R(c, 0, 90, 320, 2, 15); // boards
  for (let x = 0; x < 320; x += 20) R(c, x, 84, 2, 8, 8); R(c, 0, 82, 320, 2, 8); // rail
  for (let i = 0; i < 9; i++) { const x = 164 + i * 13; R(c, x, 78, 6, 4, 15); R(c, x + 5, 77, 3, 2, 14); R(c, x + 2, 76, 2, 1, 8); } // gulls
  // ICE CREAM sign + reserved space
  R(c, 10, 20, 72, 30, 13); R(c, 12, 22, 68, 26, 15); text(c, 16, 26, 'ICE CREAM', 13, 1); text(c, 20, 38, 'RESERVED', 4, 1); R(c, 46, 50, 2, 40, 8);
  R(c, 20, 90, 52, 36, 11); R(c, 22, 92, 48, 1, 15); R(c, 22, 100, 48, 1, 15); R(c, 20, 118, 4, 8, 15); R(c, 68, 118, 4, 8, 15); // deckchair
  R(c, 70, 106, 12, 16, 8); R(c, 70, 106, 3, 3, 0); // tyre iron
  // churro stand
  R(c, 98, 52, 74, 8, 12); R(c, 98, 60, 74, 4, 15); for (let x = 98; x < 172; x += 10) R(c, x, 52, 5, 8, 15); R(c, 100, 64, 70, 50, 14); R(c, 104, 96, 62, 18, 6); text(c, 108, 68, 'CHURROS', 4); R(c, 104, 84, 22, 12, 6); for (let i = 0; i < 4; i++) R(c, 106 + i * 5, 86, 3, 9, 14);
  // zora booth
  R(c, 190, 36, 62, 80, 5); R(c, 190, 36, 62, 6, 14); text(c, 196, 44, 'MADAME', 14); text(c, 200, 52, 'ZORA', 14); R(c, 196, 60, 50, 40, PLUM); R(c, 196, 100, 50, 16, 6); R(c, 216, 104, 10, 4, 14);
  // arcade
  R(c, 260, 34, 52, 82, 1); R(c, 264, 38, 44, 10, 14); text(c, 268, 40, 'ARCADE', 1); R(c, 266, 50, 40, 66, 0); for (let i = 0; i < 6; i++) R(c, 270 + (i % 3) * 12, 56 + Math.floor(i / 3) * 24, 8, 16, [13, 11, 12][i % 3]);
  R(c, 150, 128, 52, 4, 6); R(c, 150, 136, 52, 3, 6); R(c, 152, 132, 3, 14, 6); R(c, 197, 132, 3, 14, 6); R(c, 288, 124, 20, 20, 2); R(c, 290, 126, 16, 2, 0); // bench, bin
}
function pierProps(c, s, t) {
  const out = [];
  out.push({ y: 126, d: () => { fig(c, 48, 124, { shirt: 12, pants: 15, hair: 7, skin: '#d08050', hat: true, hatK: 14, dir: 1 }); R(c, 56, 108, 3, 2, 7); } }); // Sal (watch on wrist)
  out.push({ y: 95, d: () => fig(c, 136, 94, { shirt: 15, pants: 6, hair: 0, apron: 12, long: true, dir: 1 }) }); // Nadia
  out.push({ y: 99, d: () => { fig(c, 220, 98, { shirt: 5, pants: 5, hair: 0, long: true, dress: 5, dir: -1 }); R(c, 212, 62, 16, 4, 14); } }); // Zora
  return out;
}
function arcadeBg(c, s) {
  R(c, 0, 0, 320, 112, 0); for (let i = 0; i < 40; i++) R(c, (i * 53) % 320, (i * 31) % 112, 2, 2, [1, 5, 2][i % 3]); R(c, 0, 112, 320, 68, '#3a1a4a'); for (let i = 0; i < 60; i++) R(c, (i * 37) % 320, 112 + (i * 17) % 68, 2, 2, [13, 11, 14][i % 3]); // carpet
  // claw machine
  R(c, 18, 38, 56, 76, 12); R(c, 22, 46, 46, 44, 11); R(c, 24, 48, 42, 40, 3); for (let i = 0; i < 6; i++) { const x = 26 + (i % 3) * 13, y = 70 + Math.floor(i / 3) * 10; R(c, x, y, 12, 8, 11); R(c, x + 10, y + 2, 4, 3, 11); R(c, x + 2, y + 2, 1, 1, 0); } // dolphins
  if (!s.flags.walletInChute && !s.flags.gotWallet) { R(c, 36, 56, 16, 10, 6); R(c, 38, 58, 12, 1, 14); }
  R(c, 42, 48, 4, 12, 7); R(c, 38, 60, 12, 4, 7); R(c, 26, 96, 22, 14, 8); if (s.flags.walletInChute && !s.flags.gotWallet) { R(c, 30, 100, 12, 6, 6); R(c, 44, 98, 6, 6, 11); }
  // strength tower
  R(c, 90, 34, 24, 66, 4); R(c, 92, 36, 20, 60, 14); for (let i = 0; i < 6; i++) R(c, 94, 40 + i * 9, 16, 2, i < 2 ? 12 : i < 4 ? 14 : 10); R(c, 92, 18, 26, 16, 7); disc(c, 104, 26, 6, 14); R(c, 84, 98, 22, 22, 8); R(c, 86, 100, 18, 8, 4); R(c, 94, 108, 4, 12, 6); // hammer
  // change machine
  R(c, 138, 58, 34, 56, 7); R(c, 142, 62, 26, 14, 1); text(c, 144, 66, 'CHANGE', 14); R(c, 146, 80, 18, 4, 0); if (!s.flags.gotQuarters) R(c, 150, 78, 10, 3, 10); R(c, 146, 92, 18, 10, 0); R(c, 150, 104, 10, 4, 12);
  // prize counter + shelf
  R(c, 190, 28, 100, 44, 6); for (let i = 0; i < 8; i++) R(c, 194 + i * 12, 36 + (i % 2) * 14, 8, 12, [13, 11, 14, 12, 10][i % 5]); R(c, 188, 84, 104, 30, 5); R(c, 188, 84, 104, 3, 13);
  R(c, 300, 40, 20, 76, 4); R(c, 302, 42, 16, 72, '#4aa8d8'); text(c, 303, 50, 'OUT', 15);
}
function arcadeProps(c, s, t) { return [{ y: 86, d: () => { fig(c, 241, 86, { shirt: 1, pants: 0, hair: 6, dir: -1 }); R(c, 232, 70, 6, 4, 0); } }]; }

// ---------- Chapter 5: Marina ----------
function dockBg(c, s) {
  cloudSky(c, '#4aa8d8', SEA, 50); R(c, 0, 50, 320, 130, SEA); for (let y = 54; y < 180; y += 7) for (let x = (y % 14) ? 6 : 0; x < 320; x += 14) R(c, x, y, 5, 1, 11);
  // pontoon far out (after spotted)
  if (s.flags.sawPontoon && !s.flags.hauledIn) { R(c, 270, 58, 26, 4, 15); R(c, 272, 54, 22, 4, 13); R(c, 290, 48, 1, 8, 7); R(c, 288, 46, 4, 3, 13); }
  // breakwater rocks
  for (let i = 0; i < 14; i++) { const x = 238 + i * 6, y = 128 + (i * 7) % 16; disc(c, x, y + 10, 7, 0); disc(c, x, y + 9, 5, 8); }
  // dock planks
  R(c, 0, 112, 236, 68, '#8a6a3a'); for (let y = 116; y < 180; y += 6) R(c, 0, y, 236, 1, '#5a4020'); R(c, 0, 112, 236, 2, 15); R(c, 236, 112, 4, 68, '#5a4020');
  R(c, 60, 120, 20, 10, 8); R(c, 64, 118, 12, 4, 7); // cleat
  if (!s.flags.gotRope) { disc(c, 95, 134, 8, 6); disc(c, 95, 134, 4, '#8a6a3a'); }
  // dinghy
  R(c, 20, 140, 60, 18, 15); R(c, 22, 142, 56, 14, 6); R(c, 18, 146, 4, 8, 15); R(c, 78, 146, 4, 8, 15); if (s.flags.oarsIn) { R(c, 30, 136, 2, 26, 6); R(c, 66, 136, 2, 26, 6); } if (s.flags.ropeOnDinghy) { R(c, 60, 124, 1, 20, 14); R(c, 50, 128, 10, 1, 14); }
  // bait shop
  R(c, 208, 30, 74, 82, 8); R(c, 210, 32, 70, 78, '#6a8aa0'); R(c, 206, 24, 78, 8, 4); text(c, 214, 25, "OSCAR'S BAIT", 14); R(c, 230, 46, 36, 38, 0); R(c, 232, 48, 32, 34, '#2a3a4a'); R(c, 214, 90, 62, 22, 7);
  R(c, 282, 38, 18, 16, 4); text(c, 284, 42, 'FL', 14); // flare box
  R(c, 198, 66, 14, 46, 12); R(c, 200, 70, 10, 10, 15); R(c, 202, 84, 6, 20, 0); // pump
  R(c, 288, 58, 18, 56, 7); R(c, 292, 62, 10, 10, 0); R(c, 294, 72, 6, 42, 8); // telescope
  R(c, 150, 18, 52, 18, 15); text(c, 152, 22, 'NO HORNS', 4); text(c, 154, 29, 'AFTER 10', 4);
  if (!s.flags.gullsGone) for (let i = 0; i < 7; i++) { R(c, 214 + i * 9, 86 + (i % 2) * 2, 6, 4, 15); R(c, 219 + i * 9, 85 + (i % 2) * 2, 3, 2, 14); }
}
function dockProps(c, s, t) {
  const out = [];
  out.push({ y: 127, d: () => fig(c, 48, 126, { shirt: 9, pants: 0, hair: 8, cap: 15, dir: 1 }) }); // Marguerite
  out.push({ y: 83, d: () => fig(c, 248, 82, { shirt: 2, pants: 6, hair: 7, beard: true, dir: -1 }) }); // Oscar in hatch
  if (s.flags.calledKevin) {
    out.push({ y: 127, d: () => { fig(c, 110, 126, { shirt: 4, pants: 0, hair: 0, dir: 1 }); R(c, 118, 110, 44, 22, 7); R(c, 120, 112, 40, 2, 15); R(c, 122, 132, 4, 4, 0); R(c, 154, 132, 4, 4, 0); tuba(c, 122, 116); } }); // Kevin + trolley + tuba
  }
  out.push({ y: 137, d: () => { smallGoat(c, 164, 136, t, true); R(c, 80, 124, 84, 1, 14); } }); // Gus, lead tied to the cleat
  return out;
}
function pontoonBg(c, s) {
  cloudSky(c, '#4aa8d8', SEA, 50); R(c, 0, 50, 320, 130, SEA); for (let y = 54; y < 92; y += 7) for (let x = 0; x < 320; x += 14) R(c, x + (y % 14 ? 6 : 0), y, 5, 1, 11);
  for (let i = 0; i < 10; i++) { disc(c, 250 + i * 8, 62 + (i * 5) % 10, 6, 0); disc(c, 250 + i * 8, 61 + (i * 5) % 10, 4, 8); } // breakwater close
  R(c, 30, 92, 270, 78, 15); for (let y = 96; y < 170; y += 6) R(c, 30, y, 270, 1, 7); R(c, 26, 88, 278, 6, 13); R(c, 26, 170, 278, 8, 13); R(c, 26, 174, 278, 2, 5); text(c, 200, 172, 'LADY LUCINDA', 15); // deck + hull
  R(c, 30, 80, 270, 3, 7); for (let x = 36; x < 300; x += 24) R(c, x, 80, 2, 12, 7); // rail
  R(c, 18, 20, 4, 70, 7); disc(c, 20, 18, 8, 8); for (let i = 0; i < 8; i++) R(c, 14 + (i % 4) * 3, 14 + Math.floor(i / 4) * 5, 1, 1, [13, 11, 14, 12][i % 4]); // disco light
  R(c, 228, 78, 44, 44, 8); R(c, 232, 82, 36, 30, 7); R(c, 240, 86, 20, 20, 0); R(c, 262, 90, 10, 4, 14); for (let i = 0; i < 6; i++) R(c, 246, 100 + i * 4, 10, 1, 8); // winch + chain
  R(c, 144, 106, 36, 22, 6); R(c, 144, 106, 36, 2, 14); if (!s.flags.gotLog) { R(c, 148, 94, 28, 14, 1); R(c, 150, 96, 24, 1, 15); R(c, 150, 100, 20, 1, 15); } // crate + logbook
  if (!s.flags.gotIcewater) { R(c, 178, 108, 34, 28, 1); R(c, 180, 106, 30, 6, 15); R(c, 184, 112, 6, 2, 11); } // cooler
  if (!s.flags.gotShoe2) { R(c, 280, 76, 10, 6, 0); R(c, 284, 82, 10, 14, 0); R(c, 285, 83, 8, 2, 8); } // shoe on rail
  R(c, 0, 138, 32, 38, 15); R(c, 2, 140, 28, 34, 6); R(c, 0, 150, 1, 20, 14); // dinghy edge + rope
  for (let i = 0; i < 6; i++) R(c, 40 + i * 20, 94, 10, 3, 2); // streamers
}
function pontoonProps(c, s, t) {
  return [{ y: 140, d: () => {
    if (!s.flags.bennyInBoat) {
      if (!s.flags.bennyAwake) { // Benny flat on his back under a heap of orange lifejackets: head left, one shoe right, one sock
        R(c, 72, 122, 68, 10, 0); R(c, 70, 120, 72, 3, 15); R(c, 58, 114, 16, 14, SKIN); R(c, 58, 112, 16, 4, 0); R(c, 62, 118, 2, 2, 0); R(c, 68, 118, 2, 2, 0); R(c, 63, 124, 6, 1, 4);
        R(c, 78, 100, 60, 20, 12); R(c, 84, 96, 22, 8, 12); R(c, 110, 94, 26, 8, 12); R(c, 128, 104, 20, 10, 12); R(c, 92, 106, 4, 2, 15); R(c, 118, 104, 4, 2, 15);
        R(c, 140, 124, 10, 6, 15); R(c, 140, 130, 12, 4, 0); R(c, 136, 118, 8, 10, 15); if (Math.floor(t / 30) % 2) text(c, 60, 100, 'Z', 15); if (Math.floor(t / 30) % 2 === 0) text(c, 66, 94, 'Z', 15); } // asleep, one shoe
      else { fig(c, 104, 138, { shirt: 15, pants: 0, hair: 0, dir: -1 }); R(c, 100, 130, 10, 6, 11); R(c, 106, 136, 3, 2, 15); }
    } else { fig(c, 14, 160, { shirt: 15, pants: 0, hair: 0, dir: 1 }); }
  } }];
}

// ---------- Chapter 6: Hartwell suite ----------
function corridorBg(c, s) {
  R(c, 0, 0, 320, 112, '#c8b890'); for (let y = 10; y < 106; y += 10) for (let x = (y / 10 % 2) * 8 + 4; x < 320; x += 16) R(c, x, y, 2, 2, '#9a8a60'); R(c, 0, 0, 320, 6, 6); R(c, 0, 106, 320, 6, 6);
  R(c, 0, 112, 320, 68, 1); sparse(c, 0, 112, 320, 68, 9, 4); R(c, 0, 112, 320, 1, 0);
  [[60, '701'], [200, '702']].forEach(([x, n]) => { R(c, x, 30, 50, 84, DARKWOOD); R(c, x + 4, 34, 42, 78, 6); R(c, x + 8, 40, 34, 28, DARKWOOD); R(c, x + 9, 41, 32, 26, 6); R(c, x + 8, 74, 34, 34, DARKWOOD); R(c, x + 9, 75, 32, 32, 6); R(c, x + 38, 76, 4, 6, 14); R(c, x + 14, 20, 22, 8, 15); text(c, x + 18, 22, n, 0); });
  if (s.flags.inHartwell) R(c, 64, 34, 42, 78, 8); // 701 open
  R(c, 212, 44, 24, 10, 15); text(c, 214, 46, 'DND', 4); R(c, 230, 48, 3, 3, 8); // hoof on sign
  R(c, 128, 72, 52, 48, 15); R(c, 128, 72, 52, 3, 7); R(c, 130, 116, 6, 6, 0); R(c, 172, 116, 6, 6, 0); R(c, 132, 64, 46, 10, 7); R(c, 140, 66, 30, 4, 14); if (!s.flags.gotCloche) { R(c, 144, 54, 24, 14, 7); R(c, 146, 52, 20, 4, 15); R(c, 154, 50, 4, 3, 7); } else { R(c, 146, 60, 18, 6, 14); R(c, 150, 62, 10, 2, 6); }
  R(c, 262, 18, 48, 74, 15); R(c, 266, 22, 40, 66, '#4aa8d8'); R(c, 266, 60, 40, 28, GRASS); R(c, 280, 44, 10, 16, 15); R(c, 284, 46, 2, 14, 15); for (let i = 0; i < 4; i++) R(c, 270 + i * 9, 68, 6, 2, 15); R(c, 294, 30, 10, 10, 15); R(c, 296, 32, 6, 6, 0); R(c, 298, 34, 1, 2, 15); // window: pavilion + clock
}
function hartwellBg(c, s) {
  R(c, 0, 0, 320, 112, '#d8c8e8'); for (let y = 8; y < 108; y += 12) for (let x = (y / 12 % 2) * 10; x < 320; x += 20) R(c, x, y, 3, 3, 13); R(c, 0, 0, 320, 6, 5); R(c, 0, 106, 320, 6, 5);
  R(c, 0, 112, 320, 68, 5); sparse(c, 0, 112, 320, 68, 13, 6);
  R(c, 8, 30, 34, 84, DARKWOOD); R(c, 12, 34, 26, 76, 15); R(c, 32, 72, 3, 6, 14); // bathroom door
  R(c, 62, 50, 4, 64, 6); R(c, 56, 110, 16, 4, 6); R(c, 48, 36, 32, 8, 13); R(c, 54, 26, 20, 12, 13); if (s.flags.featherGiven) { R(c, 72, 18, 2, 10, 13); R(c, 70, 16, 6, 4, 13); } // hat (+feather)
  R(c, 100, 24, 42, 34, 14); R(c, 103, 27, 36, 28, 11); R(c, 106, 40, 30, 15, SAND); smallGoat(c, 112, 52, 0, true); // photo (goat on pier)
  R(c, 92, 94, 56, 6, DARKWOOD); R(c, 96, 100, 3, 14, DARKWOOD); R(c, 141, 100, 3, 14, DARKWOOD); R(c, 100, 86, 20, 10, 15); R(c, 118, 88, 4, 4, 15); if (!s.flags.gotTea && !s.flags.bennyUp) { R(c, 126, 88, 10, 6, 15); R(c, 136, 90, 2, 2, 15); } // tea service
  R(c, 160, 54, 54, 66, 2); R(c, 164, 58, 46, 40, 10); sparse(c, 164, 58, 46, 40, 2, 6); R(c, 160, 96, 54, 24, 2); R(c, 158, 70, 6, 50, 10); R(c, 210, 70, 6, 50, 10); // armchair (green velvet, like the suite's sofa)
  R(c, 246, 14, 46, 98, 15); R(c, 250, 18, 38, 90, '#4aa8d8'); R(c, 250, 70, 38, 38, GRASS); R(c, 268, 18, 2, 90, 15); // balcony door
  R(c, 296, 30, 22, 84, DARKWOOD); R(c, 300, 34, 14, 76, 6); R(c, 300, 72, 3, 6, 14);
}
function hartwellProps(c, s, t) {
  return [{ y: 110, d: () => { fig(c, 187, 112, { shirt: 13, pants: 13, hair: 7, dress: 13, glasses: true, dir: -1 }); R(c, 216, 100, 22, 18, 6); R(c, 222, 96, 10, 6, 6); } }, // Dolores + handbag
    { y: 1, d: () => { if (s.flags.bennyUp) fig(c, 44, 112, { shirt: 15, pants: 0, hair: 0, dir: 1 }); } }];
}

// ---------- Chapter 7: Pavilion ----------
function lawnBg(c, s) {
  cloudSky(c, '#4aa8d8', SEA, 56); R(c, 0, 56, 320, 20, SEA); R(c, 0, 76, 320, 104, GRASS); sparse(c, 0, 76, 320, 104, GRASS2, 6);
  palm(c, 14, 108, 90); R(c, 20, 98, 2, 12, 14);
  // arch
  R(c, 120, 20, 8, 96, 15); R(c, 192, 20, 8, 96, 15); R(c, 120, 20, 80, 8, 15); for (let i = 0; i < 20; i++) R(c, 118 + (i * 17) % 84, 16 + (i * 7) % 20, 4, 4, [13, 15, 14][i % 3]);
  R(c, 128, 112, 64, 68, SAND); for (let y = 118; y < 180; y += 8) R(c, 128, y, 64, 1, '#c8b080'); // aisle
  // tents
  R(c, 230, 30, 46, 86, CANVAS); R(c, 230, 30, 46, 4, 13); R(c, 248, 70, 10, 46, '#d8d0b8'); text(c, 236, 40, 'BRIDE', 13);
  R(c, 278, 40, 40, 76, CANVAS); R(c, 278, 40, 40, 4, 1); R(c, 292, 76, 12, 40, 8); text(c, 282, 50, 'GROOM', 1);
  R(c, 100, 6, 24, 16, 15); R(c, 102, 8, 20, 12, 0); text(c, 104, 11, '3 48', 14); // clock
  for (let i = 0; i < 10; i++) chair(c, 20 + (i % 5) * 18, 150 + Math.floor(i / 5) * 14, 15);
  for (let i = 0; i < 8; i++) chair(c, 200 + (i % 4) * 20, 150 + Math.floor(i / 4) * 14, 15);
}
function lawnProps(c, s, t) {
  const out = [];
  out.push({ y: 112, d: () => { R(c, 44, 100, 46, 12, DARKWOOD); fig(c, 54, 100, { shirt: 0, pants: 0, hair: 7, dir: 1 }); fig(c, 68, 100, { shirt: 0, pants: 0, hair: 6, long: true, dir: 1 }); fig(c, 82, 100, { shirt: 0, pants: 0, hair: 0, dir: -1 }); R(c, 48, 84, 2, 14, 6); R(c, 76, 84, 2, 14, 6); } }); // quartet
  out.push({ y: 108, d: () => { fig(c, 214, 108, { shirt: 11, pants: 0, hair: 0, long: true, dir: -1 }); R(c, 226, 80, 14, 18, 15); R(c, 228, 84, 10, 1, 0); R(c, 228, 88, 8, 1, 0); } }); // Priya + chart
  out.push({ y: 140, d: () => { smallGoat(c, 22, 140, t, s.flags.gusTied); if (s.flags.ringOnGus) { R(c, 30, 122, 10, 4, 15); R(c, 34, 121, 2, 2, 14); } } });
  out.push({ y: 158, d: () => { fig(c, 70, 158, { shirt: 4, pants: 0, hair: 0, dir: 1 }); } }); // Kevin
  out.push({ y: 162, d: () => fig(c, 111, 162, { shirt: 13, pants: 13, hair: 7, dress: 13, hat: true, hatK: 13, glasses: true, dir: 1 }) }); // Dolores
  if (s.flags.earlArrived && !s.flags.earlSettled) out.push({ y: 162, d: () => fig(c, 153, 162, { shirt: 15, pants: 8, hair: 8, beard: true, glasses: true, dir: -1 }) });
  if (s.flags.salArrived && !s.flags.salSettled) out.push({ y: 162, d: () => { fig(c, 191, 162, { shirt: 12, pants: 15, hair: 7, skin: '#d08050', hat: true, hatK: 14, dir: -1 }); R(c, 200, 140, 3, 20, 8); } });
  return out;
}
function groomtentBg(c, s) {
  R(c, 0, 0, 320, 112, CANVAS); for (let x = 0; x < 320; x += 40) R(c, x, 0, 2, 112, '#d8d0b8'); R(c, 0, 0, 320, 10, '#d8d0b8'); R(c, 0, 112, 320, 68, GRASS); sparse(c, 0, 112, 320, 68, GRASS2, 6);
  R(c, 40, 10, 4, 100, 6); if (!s.flags.gotTux) { R(c, 22, 28, 38, 84, 0); R(c, 24, 30, 34, 80, 8); R(c, 38, 24, 6, 6, 7); } // garment bag on pole
  R(c, 80, 30, 40, 60, 6); R(c, 84, 34, 32, 52, 3); R(c, 86, 36, 28, 48, 11); // mirror
  R(c, 138, 92, 90, 22, 15); R(c, 140, 94, 86, 2, 7); R(c, 142, 114, 4, 14, 8); R(c, 220, 114, 4, 14, 8);
  R(c, 146, 74, 12, 20, 7); R(c, 148, 72, 8, 4, 8); // flask
  if (!s.flags.gotWater) { R(c, 166, 72, 10, 22, 11); R(c, 168, 70, 6, 4, 15); }
  if (!s.flags.gotPolish) { R(c, 186, 82, 14, 10, 0); R(c, 188, 80, 10, 3, 7); }
  if (!s.flags.gotBowtie) { R(c, 206, 82, 6, 6, 4); R(c, 214, 82, 6, 6, 4); R(c, 211, 83, 4, 4, 0); }
  R(c, 250, 100, 30, 22, 7); R(c, 252, 102, 26, 2, 15); // stool
  R(c, 298, 30, 22, 86, '#d8d0b8'); R(c, 304, 36, 12, 76, '#4aa8d8'); R(c, 304, 80, 12, 32, GRASS);
}
function groomtentProps(c, s, t) {
  return [{ y: 122, d: () => {
    const f = s.flags;
    if (f.bennyDressed) fig(c, 262, 120, { shirt: 0, pants: 0, hair: 0, dir: -1 });
    else { fig(c, 262, 120, { shirt: f.bennyTux ? 0 : 15, pants: 0, hair: 0, dir: -1 }); if (!f.bennyWatered) { R(c, 256, 96, 12, 8, SKIN); } if (!f.shoesDone) R(c, 258, 118, 5, 2, 15); }
  } }];
}
function altarBg(c, s) {
  cloudSky(c, '#4aa8d8', SEA, 50); R(c, 0, 50, 320, 26, SEA); for (let x = 0; x < 320; x += 14) R(c, x + (x / 14 % 2) * 6, 60, 5, 1, 11); R(c, 0, 76, 320, 104, GRASS); sparse(c, 0, 76, 320, 104, GRASS2, 6);
  R(c, 120, 20, 8, 96, 15); R(c, 192, 20, 8, 96, 15); R(c, 120, 20, 80, 8, 15); for (let i = 0; i < 24; i++) R(c, 118 + (i * 17) % 84, 14 + (i * 7) % 22, 4, 4, [13, 15, 14][i % 3]);
  R(c, 100, 108, 120, 10, SAND); // dais
  R(c, 60, 66, 32, 8, DARKWOOD); R(c, 72, 74, 8, 40, DARKWOOD); R(c, 56, 112, 40, 4, DARKWOOD); if (s.flags.hasSpeech) { R(c, 66, 62, 20, 6, 15); R(c, 68, 64, 14, 1, 8); } // lectern
  R(c, 222, 98, 16, 16, 7); R(c, 218, 84, 24, 14, 15); R(c, 220, 86, 20, 10, 13); if (s.flags.ringOnCushion) {} else R(c, 228, 90, 4, 2, 15); // cushion stand
  R(c, 288, 18, 24, 40, 7); R(c, 290, 20, 20, 16, 0); text(c, 292, 24, '3 50', 14); R(c, 298, 36, 4, 22, 7); // clock pole
  for (let i = 0; i < 14; i++) { const x = 20 + (i % 7) * 40, y = 136 + Math.floor(i / 7) * 22; chair(c, x, y, 15); chair(c, x + 14, y, 15); if (i !== 0 || s.flags.gotProgram) R(c, x + 2, y - 11, 6, 4, 15); }
  if (!s.flags.gotProgram) { R(c, 40, 124, 16, 12, 15); R(c, 42, 126, 12, 1, 8); R(c, 42, 129, 10, 1, 8); }
  R(c, 0, 118, 10, 58, SAND);
}
function altarProps(c, s, t) { return [{ y: 112, d: () => { fig(c, 161, 112, { shirt: 0, pants: 0, hair: 0, dress: 0, dir: -1 }); R(c, 158, 94, 6, 2, 15); } }]; }

// ---------- Chapter 8: reception ----------
function receptionBg(c, s) {
  R(c, 0, 0, 320, 44, '#e86a30'); R(c, 0, 10, 320, 12, '#f0a040'); R(c, 0, 24, 320, 10, '#d84a60'); disc(c, 160, 40, 16, 14); R(c, 0, 44, 320, 16, '#6a2a60'); for (let x = 0; x < 320; x += 10) R(c, x, 48, 5, 1, '#f0a040');
  R(c, 0, 60, 320, 120, '#5a3a4a'); for (let y = 64; y < 180; y += 8) R(c, 0, y, 320, 1, '#4a2a3a'); // terrace
  R(c, 60, 104, 250, 22, 15); R(c, 60, 104, 250, 2, 7); for (let x = 70; x < 310; x += 28) { R(c, x, 108, 10, 6, 14); R(c, x + 12, 106, 4, 8, 11); } R(c, 64, 126, 4, 20, 8); R(c, 302, 126, 4, 20, 8);
  R(c, 10, 94, 44, 30, 15); R(c, 16, 84, 32, 10, 15); R(c, 22, 76, 20, 8, 15); R(c, 10, 94, 44, 2, 13); R(c, 16, 84, 32, 2, 13); R(c, 22, 76, 20, 2, 13); R(c, 30, 70, 4, 6, 14); R(c, 6, 124, 52, 6, 7); // cake
  R(c, 44, 66, 8, 8, 8); R(c, 47, 74, 2, 40, 7); R(c, 40, 112, 16, 3, 7); R(c, 36, 116, 24, 8, 15); text(c, 37, 118, 'BEST', 0); // mic
  R(c, 240, 50, 80, 10, 13); R(c, 250, 44, 60, 8, 15); R(c, 280, 46, 20, 4, 13); // Mr Sprinkles roof peeking
  for (let i = 0; i < 8; i++) R(c, 70 + i * 32, 60, 1, 44, 14);
}
function receptionProps(c, s, t) {
  const out = [];
  out.push({ y: 104, d: () => {
    fig(c, 96, 104, { shirt: 13, pants: 13, hair: 7, dress: 13, hat: true, hatK: 13, glasses: true, dir: 1 });
    fig(c, 139, 104, { shirt: 15, pants: 15, hair: 6, dress: 15, long: true, dir: 1 });
    fig(c, 166, 104, { shirt: 0, pants: 0, hair: 0, dir: -1 });
    fig(c, 208, 104, { shirt: 9, pants: 0, hair: 8, cap: 15, dir: -1 });
    fig(c, 238, 104, { shirt: 4, pants: 0, hair: 0, dir: -1 });
    fig(c, 267, 104, { shirt: 12, pants: 15, hair: 7, skin: '#d08050', hat: true, hatK: 14, dir: -1 });
    fig(c, 296, 104, { shirt: 15, pants: 8, hair: 8, beard: true, glasses: true, dir: -1 });
  } });
  out.push({ y: 158, d: () => { R(c, 18, 140, 36, 16, 15); R(c, 22, 136, 10, 6, 15); R(c, 50, 138, 6, 4, 15); R(c, 20, 146, 30, 2, 7); R(c, 24, 136, 1, 1, 0); if (Math.floor(t / 30) % 2) text(c, 36, 128, 'Z', 15); } }); // Gus asleep
  return out;
}

export const ART = {
  suite: { bg: suiteBg, props: (c, s, t) => [{ y: 1, d: () => drawGoat(c, s, t) }, { y: 146, d: () => suiteTable(c, t) }, { y: 162, d: () => suiteTuba(c, s) }] },
  garage: { bg: garageBg, props: (c, s, t) => { const o = [{ y: 132, d: () => drawTruck(c, s) }]; if (!s.flags.gotKeys && Math.floor(t / 40) % 3 === 0) o.push({ y: 1, d: () => R(c, 242, 79 + (t % 40) / 8, 1, 2, 11) }); return o; } },
  bar: { bg: barBg, props: barProps }, cage: { bg: cageBg, props: cageProps }, alley: { bg: alleyBg, props: alleyProps },
  pier: { bg: pierBg, props: pierProps }, arcade: { bg: arcadeBg, props: arcadeProps },
  dock: { bg: dockBg, props: dockProps }, pontoon: { bg: pontoonBg, props: pontoonProps },
  corridor: { bg: corridorBg, props: () => [] }, hartwell: { bg: hartwellBg, props: hartwellProps },
  lawn: { bg: lawnBg, props: lawnProps }, groomtent: { bg: groomtentBg, props: groomtentProps }, altar: { bg: altarBg, props: altarProps },
  reception: { bg: receptionBg, props: receptionProps }
};
export const COVER = { suite: (c) => { suiteBg(c, { flags: {} }); drawGoat(c, { flags: {} }, 0); suiteTable(c, 0); suiteTuba(c, { flags: {} }); drawPlayer(c, 236, 160, -1, 0); } };
