// Generated Scene 1 only; scripts/extract-mop-free-scene.py --check.
// Mop & Galaxy — rooms and hotspots (320x180 game space).
const W = (x0, x1, y0, y1) => ({ x0, x1, y0, y1 });
const ME = () => ({ id: 'me', name: 'yourself', words: ['me','self','myself','wim','face','overalls','overall','yourself','reflection'], dyn: true });
const MOPBOT = (rect, at) => ({ id: 'mopbot', name: 'Mop', rect, at, words: ['mop','mop-7','robot','mop robot','mop7','companion'], when: s => s.inv.includes('mop') });

export const ROOMS = {
  // ---------- Chapter 1 ----------
  closet: {
    title: 'Deck 9 supply closet', walk: W(16, 300, 122, 176),
    describe: 'The Deck 9 supply closet. Shelves of chemicals, a cage for the strong stuff, a sack of absorbent granules with your face printed in it, a bucket, your mop, a time clock, and a laundry chute that is Mop-sized and not Wim-sized.',
    spots: [
      ME(), MOPBOT([96,104,36,36], [120,140]),
      { id: 'cage', name: 'chemical cage', rect: [20,24,42,38], at: [40,130], words: ['cage','chemical cage','strong stuff','chemicals','degreaser'] },
      { id: 'wrench', name: 'wrench', rect: [68,94,14,12], at: [76,130], words: ['wrench','spanner','tool'], when: s => s.flags.sawWrench && !s.flags.gotWrench },
      { id: 'shelves', name: 'shelves', rect: [20,20,100,86], at: [70,130], words: ['shelves','shelf','shelving','bottles','rack'] },
      { id: 'granules', name: 'sack of granules', rect: [130,86,40,30], at: [150,130], words: ['granules','sack','bag','pillow','grit','absorbent'] },
      { id: 'bucket', name: 'mop bucket', rect: [178,90,24,26], at: [190,130], words: ['bucket','mop bucket','pail'] },
      { id: 'mymop', name: 'your mop', rect: [204,38,10,78], at: [208,130], words: ['my mop','own mop','your mop','mop handle','broom','handle'], when: s => !s.flags.tookMymop },
      { id: 'timeclock', name: 'time clock', rect: [228,18,34,28], at: [244,130], words: ['time clock','clock','punch clock','timeclock'] },
      { id: 'coverall', name: 'coverall', rect: [262,34,32,64], at: [278,130], words: ['coverall','coveralls','overalls','uniform','jacket','pocket','pockets','badge','coin'], when: s => !s.flags.gotBadge },
      { id: 'hook', name: 'coat hook', rect: [270,22,14,14], at: [278,130], words: ['hook','coat hook','peg'] },
      { id: 'vent', name: 'floor vent', rect: [140,148,40,16], at: [160,146], words: ['vent','floor vent','grille','grate','floor'] },
      { id: 'chute', name: 'laundry chute', rect: [290,48,26,42], at: [296,130], words: ['chute','laundry chute','laundry','hatch'] },
      { id: 'door', name: 'closet door', rect: [0,28,16,88], at: [20,134], words: ['door','closet door','out','corridor','deck'] }
    ]
  },
  deck9: {
    title: 'Deck 9 corridor', walk: W(16, 300, 122, 176),
    describe: 'The Deck 9 corridor, sealed at the far end by a blast door with a red light. A SnakPak-9000 vending machine, a dead intercom, a fire cabinet, a water fountain, Mop\'s charging dock, and a maintenance ladder up to a bolted ceiling grille.',
    spots: [
      ME(), MOPBOT([64,96,32,32], [80,138]),
      { id: 'coinslot', name: 'coin slot', rect: [50,68,10,12], at: [40,134], words: ['slot','coin slot'] },
      { id: 'vending', name: 'vending machine', rect: [20,40,40,76], at: [40,134], words: ['vending','vending machine','machine','snakpak','snack machine','snakpak-9000'] },
      { id: 'dock', name: 'charging dock', rect: [60,96,30,20], at: [76,134], words: ['dock','charging dock','charger'] },
      { id: 'intercom', name: 'intercom', rect: [90,40,20,20], at: [100,134], words: ['intercom','speaker','comm','call button'] },
      { id: 'blastdoor', name: 'blast door', rect: [130,20,60,96], at: [160,134], words: ['blast door','door','big door','red light','light'] },
      { id: 'fountain', name: 'water fountain', rect: [200,70,20,46], at: [210,134], words: ['fountain','water fountain','water','tap'] },
      { id: 'bolts', name: 'bolts', rect: [232,2,34,8], words: ['bolts','bolt','screws'], when: s => !s.flags.grilleOpen },
      { id: 'grille', name: 'ceiling grille', rect: [232,2,34,16], at: [248,134], words: ['grille','ceiling grille','duct','ceiling','vent','opening'] },
      { id: 'ladder', name: 'ladder', rect: [240,18,16,98], at: [248,134], words: ['ladder','rungs','climb'] },
      { id: 'axe', name: 'fire axe', rect: [286,44,18,46], at: [296,134], words: ['axe','fire axe','hatchet'] },
      { id: 'firecab', name: 'fire cabinet', rect: [280,36,30,60], at: [296,134], words: ['cabinet','fire cabinet','glass','polycarbonate','case'] },
      { id: 'closetdoor', name: 'closet door', rect: [0,28,16,88], at: [20,134], words: ['closet','closet door','back','supply closet'] }
    ]
  }
};
