// Shared EGA pixel primitives for Retro Quests adventure art (320x180, 16-colour palette indices or CSS colours).
export const PAL = ['#000000','#0000AA','#00AA00','#00AAAA','#AA0000','#AA00AA','#AA5500','#AAAAAA','#555555','#5555FF','#55FF55','#55FFFF','#FF5555','#FF55FF','#FFFF55','#FFFFFF'];
const SKIN = '#FFAA77';
const col = c => typeof c === 'number' ? PAL[c] : c;
export function R(c, x, y, w, h, k) { c.fillStyle = col(k); c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
export function disc(c, cx, cy, r, k) { for (let dy = -r; dy <= r; dy++) { const dx = Math.floor(Math.sqrt(r * r - dy * dy)); R(c, cx - dx, cy + dy, dx * 2 + 1, 1, k); } }
export function sparse(c, x, y, w, h, k, step = 4) { c.fillStyle = col(k); for (let j = 0; j < h; j += 2) for (let i = ((j / 2) % 2) * (step / 2); i < w; i += step) c.fillRect(x + i, y + j, 1, 1); }
export function text(c, x, y, s, k, scale = 1) { // tiny 3x5 font for signs (caps, digits, few symbols)
  const F = { A:'111101111101101',B:'110101110101110',C:'111100100100111',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'111100101101111',H:'101101111101101',I:'111010010010111',J:'001001001101111',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'111101101101111',P:'111101111100100',Q:'111101101111001',R:'111101110101101',S:'111100111001111',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111','0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001001001001','8':'111101111101111','9':'111101111001111',' ':'000000000000000','&':'010101010101011','\'':'010010000000000','.':'000000000000010','-':'000000111000000','!':'010010010000010' };
  let cx = x; for (const ch of s.toUpperCase()) { const m = F[ch] || F[' ']; for (let i = 0; i < 15; i++) if (m[i] === '1') R(c, cx + (i % 3) * scale, y + Math.floor(i / 3) * scale, scale, scale, k); cx += 4 * scale; }
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
