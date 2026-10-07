// Generated Scene 1 only; scripts/extract-mop-free-scene.py --check.
// Mop & Galaxy — static game data: items, chapters, puzzle lists, points. No platform access, no hint text.
export const GAME_ID = 'mop-galaxy';
export const SKU_GAME = 'mop-galaxy';
export const SKU_WALK = 'mop-galaxy-walkthrough';
export const MAX_SCORE = 250;
export const SAVE_VERSION = 2;
export const PAL = ['#000000','#0000AA','#00AA00','#00AAAA','#AA0000','#AA00AA','#AA5500','#AAAAAA','#555555','#5555FF','#55FF55','#55FFFF','#FF5555','#FF55FF','#FFFF55','#FFFFFF'];

export const ITEMS = {
  mop:      { name: 'Mop (robot)', color: 11, words: ['mop','mop-7','robot','mop robot','mop7'], look: 'MOP-7. Floor-polishing robot, maintenance sub-mind, cheerful voice, no sense of consequence. It signed for the boarding party. It is very proud of its signature.' },
  mymop:    { name: 'Your mop', color: 7, words: ['my mop','own mop','your mop','handle','mop handle','broom'], look: 'Your mop. Third Class issue. You\'ve named it, but not out loud.' },
  badge:    { name: 'Contractor badge', color: 14, words: ['badge','id','contractor badge','pass'], look: 'TARRAGON, W. — CUSTODIAL (CONTRACT). Opens closets. Does not open anything that matters.' },
  coin:     { name: 'Lucky coin', color: 14, words: ['coin','lucky coin','credit','credits','money'], look: 'A ten-credit coin taped inside the coverall pocket with a note: "FOR EMERGENCIES — W." Past-you had a plan.' },
  snakpak:  { name: 'SnakPak', color: 13, words: ['snakpak','snack','bar','protein bar','snak pak','snack bar'], look: 'A protein bar in a plastic wrapper. The wrapper is the structural part.' },
  wrapper:  { name: 'SnakPak wrapper', color: 13, words: ['wrapper','plastic wrapper','empty wrapper'], look: 'An empty SnakPak wrapper. Pure plastic. Something on this ship would eat that.' },
  wrench:   { name: 'Adjustable wrench', color: 7, words: ['wrench','spanner','tool'], look: 'The closet\'s one real tool. It was holding the shelf up.' },
  granules: { name: 'Absorbent granules', color: 14, words: ['granules','grit','absorbent','sand'], look: 'A handful of the stuff you pour on spills. Turns liquid into something you can sweep.' },
};
export const CHAPTERS = [{n:1,title:'Deck 9, Custodial'}];
export const ROOM_CHAPTER = {closet:1, deck9:1};
export const PUZZLES = {
  closet: [
    { id: 'wake-up', title: 'Get your bearings', solved: s => !!s.flags.gotBadge },
    { id: 'vent-peek', title: 'The delivery', solved: s => !!s.flags.sawBoarders },
    { id: 'snack-tool', title: 'The wrench under the shelf', solved: s => !!s.flags.gotWrench },
    { id: 'up-and-out', title: 'Off Deck 9', solved: s => !!s.flags.leftDeck9 }
  ],
};
PUZZLES.deck9 = PUZZLES.closet;
export const POINTS = {
  'look-arm': 1, badge: 2, vent: 3, 'shelf-look': 1, 'coin-vend': 2, wrench: 3, bolts: 3, 'mop-chute': 3, climb: 2
};
