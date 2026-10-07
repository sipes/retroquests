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


/* Original concept screens. Illustration only: no engine, input or game state. */
const GLYPHS = {
  A:['010','101','111','101','101'], B:['110','101','110','101','110'], C:['011','100','100','100','011'], D:['110','101','101','101','110'], E:['111','100','110','100','111'], F:['111','100','110','100','100'], G:['011','100','101','101','011'], H:['101','101','111','101','101'], I:['111','010','010','010','111'], J:['001','001','001','101','010'], K:['101','101','110','101','101'], L:['100','100','100','100','111'], M:['101','111','111','101','101'], N:['101','111','111','111','101'], O:['010','101','101','101','010'], P:['110','101','110','100','100'], Q:['010','101','101','111','011'], R:['110','101','110','101','101'], S:['011','100','010','001','110'], T:['111','010','010','010','010'], U:['101','101','101','101','111'], V:['101','101','101','101','010'], W:['101','101','111','111','101'], X:['101','101','010','101','101'], Y:['101','101','010','010','010'], Z:['111','001','010','100','111'], '1':['010','110','010','010','111'], '9':['111','101','111','001','111'], ':':['000','010','000','010','000'], '.':['000','000','000','000','010'], '-':['000','000','111','000','000']
};
function pixelText(c,text,x,y,k=15,scale=1){for(const ch of text.toUpperCase()){const glyph=GLYPHS[ch];if(glyph)glyph.forEach((row,j)=>[...row].forEach((bit,i)=>{if(bit==='1')R(c,x+i*scale,y+j*scale,scale,scale,k);}));x+=4*scale;}}
function conceptFrame(c,room,item,listen=false){
  R(c,0,0,320,11,7);R(c,0,10,320,1,15);pixelText(c,room,5,3,0);pixelText(c,'CONCEPT',287,3,0);
  R(c,0,151,320,29,0);R(c,0,151,320,1,7);
  ['WALK','LOOK','TAKE','USE',listen?'LISTEN':'TALK'].forEach((v,i)=>{R(c,4+i*40,155,37,12,1);R(c,4+i*40,155,37,1,9);pixelText(c,v,8+i*40,159,15);});
  R(c,211,155,105,12,7);pixelText(c,item,215,159,0);pixelText(c,'SCREEN STUDY - COMING SOON',6,172,7);
}
function person(c,x,y,coat,hair=6,skin=SKIN,seated=false){
  R(c,x-6,y-3,5,3,0);R(c,x+2,y-3,5,3,0);R(c,x-5,y-15,4,12,8);R(c,x+2,y-15,4,12,8);
  R(c,x-7,y-29,15,16,coat);R(c,x-5,y-29,11,2,15);R(c,x-9,y-27,3,13,coat);R(c,x+8,y-27,3,13,coat);R(c,x-9,y-14,3,3,skin);R(c,x+8,y-14,3,3,skin);
  R(c,x-2,y-32,4,3,skin);R(c,x-5,y-42,10,10,skin);R(c,x-5,y-44,10,4,hair);R(c,x-6,y-41,2,7,hair);R(c,x+1,y-38,1,1,0);R(c,x+5,y-37,2,2,skin);R(c,x+1,y-34,3,1,4);
  if(seated){R(c,x-8,y-15,18,4,coat);R(c,x-11,y-2,23,2,6);}
}
function candle(c,x,y){R(c,x-4,y,9,2,14);R(c,x,y-15,1,15,14);R(c,x-1,y-17,3,4,15);R(c,x,y-20,1,3,14);R(c,x,y-21,1,1,12);}
function envelope(c,x,y){R(c,x,y,13,8,15);R(c,x,y+7,13,1,7);for(let i=0;i<6;i++){R(c,x+i,y+i,1,1,7);R(c,x+12-i,y+i,1,1,7);}R(c,x+5,y+3,3,3,4);}
function drawThistlemereConcept(c){
  R(c,0,0,320,180,0);
  R(c,0,11,320,94,6);sparse(c,0,11,320,94,8,8);
  // Sloping timber roof, pegged beams and plaster panels.
  for(let x=0;x<100;x++){R(c,x,11,1,Math.max(0,65-x/2),0);R(c,319-x,11,1,Math.max(0,65-x/2),0);R(c,x,73-x/2,1,5,DARKWOOD);R(c,319-x,73-x/2,1,5,DARKWOOD);}
  [90,160,240].forEach(x=>{R(c,x,11,5,94,DARKWOOD);R(c,x,11,1,94,14);});R(c,0,101,320,5,DARKWOOD);
  R(c,0,106,320,45,DARKWOOD);for(let y=109;y<151;y+=9){R(c,0,y,320,1,6);for(let x=(y%2)*19;x<320;x+=47)R(c,x,y,1,9,0);}sparse(c,0,107,320,44,6,12);
  // Dormer: moonlit snowy castle and falling snow.
  R(c,193,22,71,74,0);R(c,196,25,65,68,9);R(c,200,29,57,60,1);disc(c,244,40,6,15);
  R(c,200,65,57,24,7);R(c,216,53,20,25,8);R(c,207,49,9,29,8);R(c,236,47,9,31,8);R(c,206,48,11,2,15);R(c,235,46,11,2,15);R(c,222,63,5,6,14);R(c,200,78,57,11,15);sparse(c,200,79,57,10,9,8);
  for(let i=0;i<28;i++)R(c,202+(i*19)%53,31+(i*11)%44,1,1,15);R(c,226,29,3,60,6);R(c,200,57,57,3,6);R(c,191,95,76,4,14);
  // Tabard wardrobe, spare mask, sewing basket, bell rope and ladder.
  R(c,15,61,48,46,0);R(c,18,64,42,40,6);R(c,21,67,36,2,14);[28,43].forEach(x=>{R(c,x,71,12,28,2);R(c,x+4,71,3,28,14);R(c,x-2,75,16,5,2);});
  R(c,276,44,2,56,14);disc(c,277,101,3,6);R(c,288,83,3,68,6);R(c,308,83,3,68,6);for(let y=86;y<150;y+=9)R(c,290,y,20,2,14);
  R(c,66,121,28,15,6);sparse(c,66,121,28,15,14,4);R(c,72,115,15,8,13);R(c,73,115,13,2,15);R(c,76,119,2,1,0);R(c,82,119,2,1,0);
  // Herald's writing desk, six sealed envelopes, brass seal and quill.
  R(c,108,91,73,6,6);R(c,108,91,73,1,14);R(c,111,97,5,35,6);R(c,173,97,5,35,6);R(c,117,98,51,13,DARKWOOD);R(c,139,103,6,2,14);
  for(let i=0;i<6;i++)envelope(c,114+(i%3)*17,77+Math.floor(i/3)*9);
  R(c,163,81,6,8,0);R(c,164,81,4,1,11);for(let i=0;i<10;i++)R(c,168+i,80-i,2,1,15);disc(c,158,87,3,14);R(c,157,82,2,4,6);candle(c,105,90);
  person(c,218,143,2,6);R(c,215,114,4,16,14);R(c,212,121,10,2,14);R(c,211,112,12,1,14);R(c,217,117,2,2,4);R(c,212,137,13,2,6);R(c,222,110,3,8,6);
  conceptFrame(c,'THE HERALDS GARRET','ENVELOPES');
}
function drawNineMilesConcept(c){
  R(c,0,0,320,180,0);
  R(c,0,11,320,92,3);R(c,0,11,320,5,7);R(c,0,18,320,2,11);
  // Panoramic night windows, county fair wheel and road lamps.
  R(c,13,24,205,57,7);R(c,16,27,199,51,0);R(c,16,57,199,21,1);
  for(let i=0;i<30;i++)R(c,20+(i*47)%191,31+(i*17)%22,1,1,7);
  disc(c,169,47,18,9);disc(c,169,47,16,0);for(let i=0;i<12;i++){const a=i*Math.PI/6,x=Math.round(169+17*Math.cos(a)),y=Math.round(47+17*Math.sin(a));disc(c,x,y,1,i%2?13:14);for(let j=0;j<16;j+=3)R(c,169+Math.cos(a)*j,47+Math.sin(a)*j,1,1,3);}R(c,165,48,2,25,8);R(c,177,48,2,25,8);
  for(let x=23;x<145;x+=16){R(c,x,64,13,7,5);R(c,x,63,13,1,14);}R(c,16,74,199,4,8);for(let x=20;x<210;x+=12)R(c,x,75,5,1,15);
  R(c,40,30,98,17,5);R(c,41,31,96,1,13);R(c,41,45,96,1,13);pixelText(c,'STARLITE',47,34,11,2);[79,145].forEach(x=>R(c,x,26,3,53,7));
  // Tiled floor and chrome counter.
  R(c,0,104,320,47,7);for(let y=105;y<151;y+=9)for(let x=0;x<320;x+=18)R(c,x+((y-105)/9%2)*9,y,9,9,0);
  R(c,9,82,113,17,4);R(c,9,82,113,2,12);R(c,13,102,108,6,4);R(c,13,102,108,2,12);R(c,66,100,36,3,7);R(c,82,103,3,22,8);
  person(c,43,109,6,7,SKIN,true);sparse(c,37,81,14,15,7,3);R(c,36,68,14,2,7);R(c,44,73,1,1,0);R(c,47,73,3,1,0);R(c,42,97,18,5,15);sparse(c,44,98,14,3,8,4);
  // Earlene and the pie case.
  person(c,241,108,13,6);R(c,236,80,11,16,15);R(c,236,65,12,2,15);
  R(c,181,98,139,5,15);R(c,181,103,139,25,3);R(c,184,105,136,2,11);R(c,189,112,131,1,7);R(c,189,126,131,2,8);
  R(c,269,72,43,26,7);R(c,271,74,39,22,1);R(c,272,87,37,1,7);for(let x=276;x<306;x+=16){disc(c,x,84,5,6);R(c,x-5,83,11,1,14);disc(c,x,94,5,6);R(c,x-5,93,11,1,14);}R(c,291,74,1,22,11);
  // Coffee pot, cups and a plated slice.
  R(c,197,84,10,13,8);R(c,197,85,10,2,15);R(c,201,81,4,3,0);R(c,207,88,3,6,7);R(c,215,93,6,5,15);R(c,220,94,3,3,15);R(c,226,98,21,1,7);R(c,230,94,12,4,14);R(c,230,93,8,1,6);R(c,233,91,6,2,6);
  // Dale, tie askew, authority on a clipboard.
  person(c,152,145,9,6);R(c,150,116,3,12,4);R(c,158,119,14,20,6);R(c,160,121,10,15,15);R(c,162,119,6,3,7);for(let y=125;y<134;y+=3)R(c,162,y,6,1,8);
  // Jukebox with lit chrome arch.
  R(c,285,119,25,32,6);disc(c,297,120,12,13);disc(c,297,120,9,1);R(c,288,121,19,27,1);R(c,291,126,13,6,11);for(let y=137;y<147;y+=3)R(c,291,y,13,1,7);
  conceptFrame(c,'THE STARLITE DINER','CLIPBOARD');
}
function drawHarrowgateConcept(c){
  R(c,0,0,320,180,0);
  R(c,0,11,320,100,5);sparse(c,0,11,320,100,8,6);R(c,0,11,320,4,6);R(c,0,107,320,4,6);
  // Storm windows, leaded panes, lightning and whitecaps.
  [20,234].forEach(x=>{R(c,x,23,64,68,6);R(c,x+3,26,58,62,7);R(c,x+6,29,52,56,1);for(let i=0;i<24;i++){let xx=x+8+(i*13)%46,yy=30+(i*17)%49;R(c,xx,yy,1,3,9);}R(c,x+6,67,52,18,3);for(let i=0;i<9;i++)R(c,x+7+(i*17)%45,70+(i*7)%13,7,1,11);R(c,x+30,29,3,56,6);R(c,x+6,54,52,3,6);R(c,x-4,20,6,78,4);R(c,x+62,20,6,78,4);});
  for(let i=0;i<13;i++)R(c,273-(i%5),32+i,2,1,15);
  // Panelling, portrait and chandelier.
  R(c,99,28,40,38,14);R(c,102,31,34,32,0);R(c,109,48,21,15,4);disc(c,119,44,6,7);R(c,112,36,13,4,8);R(c,126,44,1,2,0);
  R(c,171,11,2,17,14);R(c,150,28,43,2,14);[151,160,181,190].forEach(x=>candle(c,x,29));
  R(c,0,111,320,40,DARKWOOD);for(let y=112;y<151;y+=8)R(c,0,y,320,1,6);for(let x=0;x<320;x+=25)R(c,x,111,1,40,0);
  // Guests in evening dress: nobody is singled out as a suspect.
  [96,132,175,209].forEach((x,i)=>{R(c,x-10,73,22,40,6);R(c,x-8,76,18,18,4);person(c,x,114,[0,5,8,1][i],[7,0,6,8][i],SKIN,true);});
  person(c,57,124,0,7,SKIN,true);R(c,54,95,5,5,15);R(c,55,98,3,2,4);
  // Linen table with perspective, silver, candles and a covered fish course.
  for(let y=101;y<129;y++){const inset=Math.floor((128-y)/3);R(c,57+inset,y,191-inset*2,1,15);}R(c,58,128,190,8,7);R(c,63,136,5,14,6);R(c,238,136,5,14,6);sparse(c,60,130,184,6,15,4);
  [83,119,185,223].forEach(x=>{disc(c,x,112,7,7);disc(c,x,111,5,15);R(c,x-11,107,1,10,7);R(c,x+10,108,1,9,7);R(c,x+7,101,4,4,11);R(c,x+8,105,1,5,15);R(c,x+6,110,5,1,7);});
  candle(c,143,109);candle(c,166,110);R(c,141,119,32,2,7);disc(c,157,117,11,8);R(c,146,118,23,2,7);R(c,155,104,4,3,14);
  // Foreground guests and Edie's unobtrusive side table.
  person(c,95,149,4,6,SKIN,true);person(c,203,148,0,8,SKIN,true);
  person(c,279,139,3,6,SKIN,true);R(c,273,110,13,2,15);R(c,269,105,4,10,6);
  R(c,251,124,64,4,6);R(c,252,124,62,1,14);R(c,254,128,3,21,6);R(c,308,128,3,21,6);R(c,267,117,22,7,15);R(c,277,117,1,7,8);for(let y=119;y<123;y+=2){R(c,269,y,6,1,8);R(c,280,y,6,1,8);}R(c,287,114,8,1,14);R(c,284,113,4,3,SKIN);
  conceptFrame(c,'HARROWGATE HOUSE','NOTEBOOK',true);
}
export function drawLandingArt(){const draw=(id,fn)=>{const canvas=document.getElementById(id);if(canvas)fn(canvas.getContext('2d'));};draw('heroCanvas',drawSuiteCover);draw('cover1',c=>drawSuiteCover(c,-20,-30,true));draw('cover2',drawStarCover);draw('cover3',drawThistlemereConcept);draw('cover4',drawNineMilesConcept);draw('cover5',drawHarrowgateConcept);}
