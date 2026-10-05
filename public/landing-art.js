/* ---------- Palette + pixel helpers ---------- */
const PAL = ['#000000','#0000AA','#00AA00','#00AAAA','#AA0000','#AA00AA','#AA5500','#AAAAAA','#555555','#5555FF','#55FF55','#55FFFF','#FF5555','#FF55FF','#FFFF55','#FFFFFF'];
const SKIN = '#FFAA77', DARKWOOD = '#7A3C00', PLUM = '#331133';
const col = c => typeof c === 'number' ? PAL[c] : c;
function R(c, x, y, w, h, k) { c.fillStyle = col(k); c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function disc(c, cx, cy, r, k) { for (let dy = -r; dy <= r; dy++) { const dx = Math.floor(Math.sqrt(r * r - dy * dy)); R(c, cx - dx, cy + dy, dx * 2 + 1, 1, k); } }
function sparse(c, x, y, w, h, k, step = 4) { c.fillStyle = col(k); for (let j = 0; j < h; j += 2) for (let i = ((j / 2) % 2) * (step / 2); i < w; i += step) c.fillRect(x + i, y + j, 1, 1); }

/* ---------- Drawing: Suite ---------- */
function drawSuiteBg(c, s) {
  R(c, 0, 0, 320, 112, 5);
  for (let y = 10, row = 0; y < 106; y += 10, row++) for (let x = (row % 2) * 8 + 4; x < 320; x += 16) { R(c, x, y, 2, 2, 13); }
  R(c, 0, 0, 320, 6, 13); R(c, 0, 6, 320, 1, 0);
  R(c, 0, 108, 320, 4, 6); R(c, 0, 108, 320, 1, 14);
  R(c, 0, 112, 320, 68, 4); sparse(c, 0, 112, 320, 68, 12, 6);
  // curtains + balcony door
  R(c, 6, 12, 10, 98, 12); R(c, 82, 12, 10, 98, 12);
  for (let i = 0; i < 3; i++) { R(c, 8 + i * 3, 14, 1, 94, 4); R(c, 84 + i * 3, 14, 1, 94, 4); }
  R(c, 14, 16, 70, 92, 15); R(c, 18, 20, 62, 84, 11);
  disc(c, 64, 34, 7, 14);
  R(c, 18, 62, 62, 16, 1); sparse(c, 18, 62, 62, 16, 9, 6);
  R(c, 18, 78, 62, 26, 14); sparse(c, 18, 78, 62, 26, 6, 8);
  R(c, 30, 44, 3, 36, 6);
  R(c, 22, 42, 14, 3, 2); R(c, 28, 38, 12, 3, 10); R(c, 32, 44, 10, 3, 2); R(c, 20, 46, 6, 2, 10);
  R(c, 18, 82, 62, 2, 15); for (let x = 20; x < 80; x += 6) R(c, x, 82, 1, 22, 15);
  R(c, 48, 20, 2, 84, 15);
  // painting
  R(c, 126, 18, 62, 36, 14); R(c, 129, 21, 56, 30, 3); sparse(c, 129, 21, 56, 30, 11, 6);
  disc(c, 154, 38, 6, 13); R(c, 159, 26, 2, 12, 13); R(c, 158, 24, 5, 3, 13); R(c, 162, 25, 3, 1, 0);
  R(c, 158, 27, 5, 1, 4); R(c, 153, 44, 1, 7, 12); R(c, 156, 44, 1, 7, 12);
  // disco ball
  R(c, 240, 6, 1, 10, 7); disc(c, 240, 22, 6, 7);
  for (let i = 0; i < 6; i++) R(c, 236 + (i % 3) * 3, 18 + Math.floor(i / 3) * 4, 1, 1, 15);
  R(c, 238, 26, 4, 1, 8);
  // door
  R(c, 266, 26, 40, 86, DARKWOOD); R(c, 270, 30, 32, 80, 6);
  R(c, 274, 36, 24, 28, DARKWOOD); R(c, 275, 37, 22, 26, 6); R(c, 274, 70, 24, 34, DARKWOOD); R(c, 275, 71, 22, 32, 6);
  R(c, 292, 60, 6, 10, 0); R(c, 294, 62, 2, 2, s.flags.leftSuite ? 10 : 12); disc(c, 297, 76, 1, 14);
  R(c, 278, 16, 16, 6, 2); R(c, 280, 18, 12, 2, 10);
  // minibar
  if (s.flags.minibarOpen) {
    R(c, 216, 80, 34, 30, 7); R(c, 218, 82, 30, 26, 0); R(c, 218, 95, 30, 1, 8);
    if (!s.flags.gotCrackers) { R(c, 224, 86, 11, 9, 14); R(c, 226, 89, 7, 1, 4); R(c, 226, 91, 5, 1, 4); }
    R(c, 250, 82, 8, 26, 15); R(c, 251, 84, 1, 22, 7);
  } else {
    R(c, 216, 80, 34, 30, 7); R(c, 218, 82, 30, 26, 15); R(c, 244, 90, 2, 8, 8); R(c, 222, 85, 12, 4, 7);
  }
  // side table + phone
  R(c, 86, 96, 20, 4, 6); R(c, 86, 96, 20, 1, 14); R(c, 89, 100, 2, 12, 6); R(c, 101, 100, 2, 12, 6);
  R(c, 90, 90, 13, 6, 12); R(c, 89, 87, 15, 3, 4); R(c, 94, 91, 5, 3, 15);
  // sofa
  R(c, 112, 76, 92, 22, 2); sparse(c, 112, 76, 92, 22, 10, 6);
  R(c, 157, 78, 1, 18, 0);
  R(c, 106, 96, 104, 14, 2); R(c, 108, 96, 100, 2, 10);
  R(c, 104, 84, 10, 26, 2); R(c, 104, 84, 10, 2, 10); R(c, 202, 84, 10, 26, 2); R(c, 202, 84, 10, 2, 10);
  R(c, 110, 110, 3, 3, 0); R(c, 203, 110, 3, 3, 0);
}
function drawGoat(c, s, t) {
  const j = (Math.floor(t / 18) % 2);
  R(c, 135, 66, 4, 3, 15);
  R(c, 138, 64, 34, 16, 15); R(c, 138, 78, 34, 2, 7); sparse(c, 140, 66, 30, 10, 7, 8);
  [140, 147, 162, 168].forEach(x => { R(c, x, 80, 3, 14, 7); R(c, x, 94, 3, 2, 0); });
  R(c, 168, 56, 8, 12, 15);
  R(c, 172, 50, 14, 11, 15); R(c, 182, 54, 6, 7, 15);
  R(c, 169, 51, 4, 3, 7); R(c, 174, 45, 2, 5, 8); R(c, 178, 45, 2, 5, 8); R(c, 173, 44, 2, 2, 8); R(c, 179, 44, 2, 2, 8);
  R(c, 178, 53, 3, 2, 14); R(c, 179, 54, 2, 1, 0);
  R(c, 167, 64, 3, 4, 12); R(c, 172, 64, 3, 4, 12); R(c, 170, 65, 2, 2, 4);
  R(c, 183, 61, 3, 5, 7);
  R(c, 184, 59 + j, 4, 1, 0);
  if (!s.flags.goatFed) { R(c, 186, 57 + j, 8, 5, 14); R(c, 187, 58 + j, 6, 1, 1); }
  else if (j) { R(c, 187, 60, 2, 1, 14); }
}
function drawTable(c, t) {
  R(c, 122, 132, 70, 6, 6); R(c, 122, 132, 70, 1, 14); R(c, 126, 138, 3, 8, 6); R(c, 185, 138, 3, 8, 6);
  R(c, 149, 122, 9, 4, 9); R(c, 150, 123, 7, 2, 11); R(c, 152, 126, 3, 5, 15); R(c, 150, 131, 7, 1, 15);
  R(c, 156, 117, 1, 6, 15); R(c, 153, 116, 7, 2, 13);
  const b = Math.floor(t / 10) % 4; R(c, 151 + (b % 2) * 3, 121 - b, 1, 1, 15);
}
function drawTuba(c, s) {
  R(c, 36, 150, 28, 6, 14); R(c, 36, 150, 28, 1, 15);
  R(c, 36, 136, 6, 20, 14); R(c, 38, 154, 24, 8, 6); R(c, 38, 154, 24, 1, 14);
  R(c, 47, 140, 3, 10, 7); R(c, 52, 140, 3, 10, 7); R(c, 57, 140, 3, 10, 7);
  R(c, 34, 132, 5, 4, 7);
  disc(c, 70, 145, 13, 14); disc(c, 70, 145, 10, 6); disc(c, 70, 145, 6, '#552200');
  if (!s.flags.gotTicket) { R(c, 69, 139, 4, 5, 15); R(c, 70, 140, 2, 1, 8); }
}
function drawPlayer(c, x, y, dir, step) {
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

/* ---------- Covers for the home page ---------- */
function drawSuiteCover(c, ox = 0, oy = 0, withPlayer = true) {
  c.save(); c.translate(ox, oy);
  const s = { flags: {} };
  drawSuiteBg(c, s); drawGoat(c, s, 0); drawTable(c, 0); drawTuba(c, s);
  if (withPlayer) drawPlayer(c, 236, 160, -1, 0);
  c.restore();
}
function drawStarCover(c) {
  R(c, 0, 0, 320, 140, 0);
  for (let i = 0; i < 90; i++) { const x = (i * 97) % 320, y = (i * 53) % 140; R(c, x, y, 1, 1, i % 7 ? 15 : 11); }
  disc(c, 250, 40, 18, 5); sparse(c, 232, 22, 36, 36, 13, 4);
  R(c, 60, 70, 120, 26, 7); R(c, 50, 78, 14, 10, 8); R(c, 176, 76, 22, 14, 9); R(c, 70, 74, 90, 3, 15); for (let x = 74; x < 170; x += 12) R(c, x, 82, 6, 5, 11);
  R(c, 40, 82, 10, 3, 12); R(c, 34, 83, 6, 1, 14);
  R(c, 200, 96, 2, 34, 6); R(c, 194, 128, 14, 6, 14);
}
function drawCastleCover(c) {
  R(c, 0, 0, 320, 140, 1); sparse(c, 0, 0, 320, 70, 9, 6);
  disc(c, 260, 30, 12, 15);
  R(c, 0, 100, 320, 40, 2); sparse(c, 0, 100, 320, 40, 10, 6);
  R(c, 110, 50, 100, 52, 8); for (let x = 110; x < 210; x += 10) R(c, x, 44, 6, 6, 8);
  R(c, 96, 30, 24, 72, 7); R(c, 200, 30, 24, 72, 7); R(c, 96, 24, 24, 6, 4); R(c, 200, 24, 24, 6, 4);
  R(c, 150, 74, 20, 28, 0); R(c, 104, 50, 6, 10, 14); R(c, 210, 50, 6, 10, 14);
  R(c, 158, 20, 2, 30, 7); R(c, 160, 20, 12, 7, 12);
}


export function drawLandingArt(){drawSuiteCover(document.getElementById('heroCanvas').getContext('2d'));drawSuiteCover(document.getElementById('cover1').getContext('2d'),-20,-30,true);drawStarCover(document.getElementById('cover2').getContext('2d'));drawCastleCover(document.getElementById('cover3').getContext('2d'));}
