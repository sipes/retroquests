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
  },
  // ---------- Chapter 2 ----------
  cryo: {
    title: 'Cryo Bay, colonist rows', walk: W(16, 296, 122, 176),
    describe: 'Two thousand colonist pods in long rows under blue light. One pod stands open and empty. A notice is pinned to the main door. Flashlights move along the far row.',
    spots: [
      ME(),
      { id: 'notice', name: 'notice on the door', rect: [148,20,24,22], at: [160,130], words: ['notice','paper','declaration','claim','sign'], when: s => !s.flags.gotNotice },
      { id: 'maindoor', name: 'main door', rect: [134,8,52,52], at: [160,130], words: ['main door','door','big door','exit'] },
      { id: 'nameplate', name: 'nameplate', rect: [46,106,28,10], at: [60,132], words: ['nameplate','plate','name','label','tag'] },
      { id: 'emptypod', name: 'empty pod', rect: [38,56,44,52], at: [60,132], words: ['empty pod','open pod','my pod','pod 1205','reserved pod','pod','1205'] },
      { id: 'drawing', name: 'child\'s drawing', rect: [212,62,22,20], at: [222,130], words: ['drawing','picture','crayon','gumbo'], when: s => !s.flags.gotDrawing },
      { id: 'hose', name: 'coolant hose', rect: [252,70,36,14], at: [270,130], words: ['hose','coolant hose','pipe'], when: s => !s.flags.gotHose },
      { id: 'cart', name: 'maintenance cart', rect: [248,82,44,34], at: [270,130], words: ['cart','maintenance cart','trolley'] },
      { id: 'terminal', name: 'pod terminal', rect: [284,40,26,30], at: [290,130], words: ['terminal','console','screen','computer','monitor'] },
      { id: 'pods', name: 'pods', rect: [20,30,280,78], at: [160,130], words: ['pods','pod','colonists','sleepers','people'] },
      { id: 'drain', name: 'floor drain', rect: [150,148,20,12], at: [160,146], words: ['drain','floor drain','grate'] },
      { id: 'flashlights', name: 'flashlights', rect: [200,120,80,50], words: ['flashlights','flashlight','search party','searchers','guards','boarders','them'], when: s => !s.flags.hidden },
      { id: 'gallery', name: 'stairs to the gallery', rect: [300,56,20,120], at: [296,150], words: ['stairs','gallery','up','crew gallery','steps'] }
    ]
  },
  gallery: {
    title: 'Cryo Bay, crew gallery', walk: W(16, 300, 122, 176),
    describe: 'The raised crew gallery: thirty crew pods, the captain\'s pod with a brass plaque, a thaw console, a wall roster, a crew locker with a note from Thistle, a fire blanket on a hook, and a loose grille into a duct that smells of soup.',
    spots: [
      ME(),
      { id: 'locker', name: 'crew locker', rect: [20,40,30,76], at: [34,132], words: ['locker','crew locker','cabinet','note'] },
      { id: 'roster', name: 'wall roster', rect: [70,20,40,30], at: [90,130], words: ['roster','crew roster','list','board','names'], when: s => !s.flags.gotRoster },
      { id: 'blanket', name: 'fire blanket', rect: [120,40,14,20], at: [126,130], words: ['blanket','fire blanket','pouch'], when: s => !s.flags.gotBlanket },
      { id: 'duct2', name: 'duct grille', rect: [150,2,40,16], at: [170,130], words: ['duct','grille','duct grille','vent','ceiling','up','galley duct'] },
      { id: 'crewpods', name: 'crew pods', rect: [20,56,180,52], at: [110,132], words: ['crew pods','crew','pods','officers'] },
      { id: 'plaque', name: 'brass plaque', rect: [218,106,34,10], at: [234,132], words: ['plaque','brass plaque','sign'] },
      { id: 'okonjo', name: 'the captain\'s pod', rect: [208,26,54,80], at: [234,132], words: ['captain','okonjo','captain\'s pod','captains pod','adaeze'] },
      { id: 'thawconsole', name: 'thaw console', rect: [266,60,30,56], at: [280,132], words: ['thaw console','console','thaw','keypad','terminal'] },
      { id: 'stairs', name: 'stairs down', rect: [0,56,14,120], at: [20,150], words: ['stairs','down','rows','back'] }
    ]
  },
  // ---------- Chapter 3 ----------
  galley: {
    title: 'The galley', walk: W(16, 300, 122, 176),
    describe: 'The galley. A serving counter with a badge reader, a stack of plastic trays, a replicator that says OFFLINE, a dishwasher the size of a car, a tool locker, and a compost unit whose lid is rattling by itself.',
    spots: [
      ME(), MOPBOT([60,120,32,32], [76,138]),
      { id: 'trays', name: 'plastic trays', rect: [30,64,30,18], at: [44,130], words: ['trays','tray','plastic trays','stack'] },
      { id: 'reader', name: 'badge reader', rect: [100,68,14,14], at: [106,130], words: ['reader','badge reader','scanner','counter reader'] },
      { id: 'counter', name: 'serving counter', rect: [20,80,100,36], at: [70,130], words: ['counter','serving counter','servery','cage','drawers','drawer','cutlery'] },
      { id: 'wheel', name: 'door wheel', rect: [138,68,16,16], at: [146,130], words: ['wheel','door wheel','dog','handle','ratchet'] },
      { id: 'corridoor', name: 'corridor door', rect: [122,36,48,80], at: [146,130], words: ['corridor door','door','corridor','hatch door'] },
      { id: 'replicator', name: 'replicator', rect: [180,20,36,50], at: [198,130], words: ['replicator','food machine','offline'] },
      { id: 'dishwasher', name: 'dishwasher', rect: [218,40,38,76], at: [236,130], words: ['dishwasher','washer','machine'] },
      { id: 'lockerreader', name: 'locker reader', rect: [286,40,10,10], at: [276,130], words: ['locker reader','reader'] },
      { id: 'locker', name: 'tool locker', rect: [258,20,40,52], at: [276,130], words: ['locker','tool locker','tools','cabinet'] },
      { id: 'compost', name: 'compost unit', rect: [260,80,40,36], at: [280,130], words: ['compost','compost unit','bin','rattling','lid'] },
      { id: 'hatch', name: 'hatch to hydroponics', rect: [0,36,16,80], at: [20,134], words: ['hatch','hydroponics','hydro','garden','greenhouse'] }
    ]
  },
  hydro: {
    title: 'Hydroponics', walk: W(16, 300, 122, 176),
    describe: 'Hydroponics. Rows of tomatoes under UV lamps, a nutrient tank with a gauge, a sealed seed vault, a bin of plant ties, and Thistle on its rail, pruning something that didn\'t deserve it.',
    spots: [
      ME(), MOPBOT([30,120,32,32], [46,138]),
      { id: 'board', name: 'rule board', rect: [20,20,50,30], at: [44,130], words: ['board','rule board','rules','sign','notice'] },
      { id: 'uv', name: 'UV lamps', rect: [20,4,280,12], words: ['uv','lamps','lamp','lights','uv lamps'] },
      { id: 'tomatoes', name: 'tomatoes', rect: [20,60,90,52], at: [64,130], words: ['tomatoes','tomato','plants','vines','crop'] },
      { id: 'arm', name: 'pruning arm', rect: [148,34,24,28], at: [160,130], words: ['arm','pruning arm','shears','blade','pruner'] },
      { id: 'thistle', name: 'Thistle', rect: [118,30,42,52], at: [140,130], words: ['thistle','bot','gardening bot','gardener','robot gardener'] },
      { id: 'rail', name: 'rail', rect: [20,26,280,6], words: ['rail','track'] },
      { id: 'tank', name: 'nutrient tank', rect: [172,50,38,66], at: [190,130], words: ['tank','nutrient tank','gauge','nitrogen','nutrients'] },
      { id: 'vault', name: 'seed vault', rect: [220,20,50,96], at: [244,130], words: ['vault','seed vault','seed stock','seeds','vault door'] },
      { id: 'ties', name: 'plant ties', rect: [280,90,30,26], at: [292,130], words: ['ties','plant ties','bin','twist ties'], when: s => !s.flags.gotTies },
      { id: 'duct', name: 'service duct', rect: [272,128,30,22], at: [286,150], words: ['duct','service duct','floor grate','grate','engineering','down'] },
      { id: 'back', name: 'hatch to the galley', rect: [306,36,14,80], at: [296,134], words: ['galley','hatch','back','kitchen'] }
    ]
  },
  // ---------- Chapter 4 ----------
  drive: {
    title: 'Engineering, drive hall', walk: W(26, 296, 122, 176),
    describe: 'The drive hall: a cathedral of pipes around the jump drive. Ilse, Vane\'s engineer, has the nav core open with her back to you and headphones on. The coolant intake, a purity gauge, a fire-suppression panel, a catwalk, Airlock A and the red door to the reactor anteroom.',
    spots: [
      ME(), MOPBOT([40,120,32,32], [56,138]),
      { id: 'airlockA', name: 'Airlock A', rect: [0,30,22,86], at: [30,134], words: ['airlock','airlock a','lock','hull access','outer door','inner door','sensor'] },
      { id: 'suppression', name: 'fire-suppression panel', rect: [24,70,18,30], at: [40,130], words: ['suppression','panel','fire panel','fire suppression','test button','button'] },
      { id: 'gauge', name: 'purity gauge', rect: [40,40,22,22], at: [50,130], words: ['gauge','purity gauge','dial','meter'] },
      { id: 'filter', name: 'coolant filter', rect: [70,80,20,16], at: [80,130], words: ['filter','coolant filter','cartridge'], when: s => !s.flags.filterOut },
      { id: 'intake', name: 'coolant intake', rect: [60,68,40,48], at: [80,130], words: ['intake','coolant intake','coolant','loop','coolant loop','housing','quick release','quick-release'] },
      { id: 'drive', name: 'jump drive', rect: [100,10,120,100], at: [160,130], words: ['drive','jump drive','engine','pipes','reactor core'] },
      { id: 'catwalk', name: 'catwalk', rect: [20,18,280,12], at: [160,130], words: ['catwalk','walkway','gantry','railing'] },
      { id: 'navcore', name: 'nav core', rect: [230,50,26,66], at: [230,134], words: ['nav core','core','navigation','computer','console'] },
      { id: 'ilse', name: 'Ilse', rect: [256,48,24,68], at: [240,134], words: ['ilse','engineer','woman','headphones','her'] },
      { id: 'chest', name: 'tool chest', rect: [282,90,26,26], at: [292,134], words: ['chest','tool chest','toolbox','ilse\'s chest'] },
      { id: 'reactordoor', name: 'red door', rect: [298,20,22,96], at: [294,134], words: ['red door','anteroom','reactor door','reactor','door'] }
    ]
  },
  reactor: {
    title: 'Reactor anteroom', walk: W(16, 300, 122, 176),
    describe: 'The reactor anteroom. Lead glass onto something you should not look at for long. A dosimeter on a hook, one EVA suit in a locker, a helmet on the shelf, a tether reel, an O2 bottle rack with one bottle in it, and a suit-check terminal.',
    spots: [
      ME(),
      { id: 'glass', name: 'lead glass', rect: [100,20,120,80], at: [160,130], words: ['glass','lead glass','reactor','window','core','inside'] },
      { id: 'dosimeter', name: 'dosimeter', rect: [40,40,14,22], at: [46,130], words: ['dosimeter','meter','badge','rad meter'], when: s => !s.flags.gotDosimeter },
      { id: 'o2', name: 'O2 bottle', rect: [20,80,30,36], at: [34,132], words: ['o2','oxygen','bottle','rack','air','tank'], when: s => !s.flags.gotO2 },
      { id: 'tether', name: 'tether reel', rect: [60,80,30,36], at: [74,132], words: ['tether','reel','tether reel','line','clip'], when: s => !s.flags.gotTether },
      { id: 'helmet', name: 'helmet', rect: [244,24,40,20], at: [264,132], words: ['helmet','visor'], when: s => !s.flags.gotHelmet },
      { id: 'suit', name: 'EVA suit', rect: [244,46,40,70], at: [264,132], words: ['suit','eva suit','spacesuit','space suit'], when: s => !s.flags.gotSuit },
      { id: 'suitlocker', name: 'suit locker', rect: [240,20,50,96], at: [264,132], words: ['locker','suit locker'] },
      { id: 'suitcheck', name: 'suit-check terminal', rect: [296,40,22,76], at: [296,134], words: ['suit check','suit-check','terminal','check','checker','console'] },
      { id: 'back', name: 'door to the drive hall', rect: [0,20,14,96], at: [20,134], words: ['door','back','drive hall','out','drive'] }
    ]
  },
  // ---------- Chapter 5 ----------
  hull1: {
    title: 'Hull, forward', walk: W(30, 300, 124, 176),
    describe: 'Outside. The Hyacinth\'s spine runs aft under more stars than you have ever seen. A handrail with a two-metre gap. A row of tether cleats by the airlock. A loose shield plate. In the distance, the Lien, clamped to the hull like a tick.',
    spots: [
      ME(),
      { id: 'airlockout', name: 'Airlock A (outer)', rect: [20,40,40,76], at: [40,134], words: ['airlock','lock','door','inside','back'] },
      { id: 'cleats', name: 'tether cleats', rect: [70,110,60,14], at: [100,134], words: ['cleats','cleat','anchor','anchor point','anchor points','ring'] },
      { id: 'plate', name: 'shield plate', rect: [120,58,30,22], at: [134,134], words: ['plate','shield plate','panel','loose plate','meteorite plate'], when: s => !s.flags.gotPlate },
      { id: 'gap', name: 'gap in the handrail', rect: [180,94,50,20], at: [204,134], words: ['gap','missing rail','missing section','break'] },
      { id: 'handrail', name: 'handrail', rect: [60,98,240,10], at: [160,134], words: ['handrail','rail','railing'] },
      { id: 'collar', name: 'the Lien\'s docking collar', rect: [250,18,60,44], words: ['collar','lien','docking collar','ship','tick','their ship'] },
      { id: 'camera', name: 'hull camera', rect: [34,14,16,16], words: ['camera','hull camera','cctv'] },
      { id: 'stars', name: 'stars', rect: [0,0,320,40], words: ['stars','space','sky','void','nothing'] },
      { id: 'o2gauge', name: 'wrist gauge', rect: [0,0,1,1], words: ['gauge','wrist','wrist gauge','o2 gauge','oxygen','air'] },
      { id: 'aft', name: 'aft, toward the dish', rect: [300,86,20,90], at: [296,150], words: ['aft','dish','comms','onward','forward','along'] }
    ]
  },
  hull2: {
    title: 'Hull, comms dish', walk: W(20, 300, 124, 176),
    describe: 'The comms dish on its gimbal, locked toward Vellacourt\'s beacon. A frozen manual crank, a lock pin through the gimbal, a junction box with a Vellacourt padlock on it, a relay indicator panel, and Airlock C back inside.',
    spots: [
      ME(),
      { id: 'junction', name: 'junction box', rect: [40,60,40,56], at: [60,134], words: ['junction','junction box','box','mic','microphone','transmitter','radio'] },
      { id: 'padlock', name: 'padlock', rect: [52,88,16,18], at: [60,134], words: ['padlock','lock','vellacourt padlock'], when: s => !s.flags.padlockCut },
      { id: 'dish', name: 'the dish', rect: [120,10,100,80], at: [170,134], words: ['dish','antenna','comms dish','gimbal'] },
      { id: 'pin', name: 'gimbal pin', rect: [140,80,16,16], at: [150,134], words: ['pin','gimbal pin','lock pin'], when: s => !s.flags.gotPin },
      { id: 'crank', name: 'manual crank', rect: [190,88,24,28], at: [200,134], words: ['crank','handle','manual crank','winder'] },
      { id: 'panel', name: 'relay panel', rect: [250,40,40,60], at: [270,134], words: ['panel','relay panel','indicator','display','readout','relay'] },
      { id: 'o2gauge', name: 'wrist gauge', rect: [0,0,1,1], words: ['gauge','wrist','wrist gauge','o2 gauge','oxygen','air'] },
      { id: 'airlockC', name: 'Airlock C', rect: [296,40,24,76], at: [296,134], words: ['airlock','airlock c','lock','inside','door','bridge'] },
      { id: 'back', name: 'forward, toward Airlock A', rect: [0,86,20,90], at: [24,150], words: ['forward','back','airlock a'] }
    ]
  },
  // ---------- Chapter 6 ----------
  ready: {
    title: 'Bridge ready room', walk: W(16, 300, 122, 176),
    describe: 'The captain\'s ready room. A suit rack, a coffee machine that works, the captain\'s desk with a locked drawer, your own contract framed on the wall for reasons nobody explained, an open empty safe, and the door to the bridge, with Brack in it.',
    spots: [
      ME(), MOPBOT([60,138,32,32], [76,150]),
      { id: 'rack', name: 'suit rack', rect: [20,30,30,86], at: [36,132], words: ['rack','suit rack','hanger'] },
      { id: 'coffee', name: 'coffee machine', rect: [70,50,40,50], at: [90,132], words: ['coffee','coffee machine','machine','espresso'] },
      { id: 'contract', name: 'framed contract', rect: [150,24,60,36], at: [180,132], words: ['contract','frame','framed contract','agreement','wall'] },
      { id: 'drawer', name: 'desk drawer', rect: [150,96,30,12], at: [165,132], words: ['drawer','desk drawer'] },
      { id: 'desk', name: 'captain\'s desk', rect: [130,80,100,36], at: [180,132], words: ['desk','captain\'s desk','table'] },
      { id: 'safe', name: 'wall safe', rect: [240,30,30,40], at: [254,132], words: ['safe','wall safe'] },
      { id: 'brack', name: 'Brack', rect: [284,50,30,66], at: [270,134], words: ['brack','big man','guard','man','door guard','him'], when: s => !s.flags.pastBrack },
      { id: 'bridgedoor', name: 'bridge door', rect: [280,20,38,96], at: [292,134], words: ['bridge door','door','bridge','through'] },
      { id: 'lifthatch', name: 'service lift hatch', rect: [60,140,40,20], at: [80,146], words: ['hatch','lift hatch','service lift','lift','floor hatch'] }
    ]
  },
  bridge: {
    title: 'The bridge', walk: W(16, 300, 122, 176),
    describe: 'The bridge of the Luminous Hyacinth. Captain Thessaly Vane stands beside the captain\'s chair, not in it. Dorrit reads regulations at comms. The main screen shows the Vellacourt yards and a blinking Lane Authority hail. A holo of the salvage filing turns slowly, with a smiling mop stamped on it.',
    spots: [
      ME(), MOPBOT([150,120,32,32], [166,138]),
      { id: 'filing', name: 'salvage filing holo', rect: [20,20,34,34], at: [36,130], words: ['filing','holo','hologram','salvage filing','claim','stamp'] },
      { id: 'dorrit', name: 'Dorrit', rect: [40,50,30,66], at: [60,134], words: ['dorrit','comms officer','reader','regulations'] },
      { id: 'log', name: 'ship\'s log console', rect: [80,70,30,46], at: [94,134], words: ['log','ship\'s log','ships log','log console','console','record'] },
      { id: 'hail', name: 'Lane Authority hail', rect: [198,18,20,14], words: ['hail','lane authority','authority','blinking','message'] },
      { id: 'screen', name: 'main screen', rect: [100,10,120,60], at: [160,130], words: ['screen','main screen','display','yards','vellacourt yards','eta'] },
      { id: 'helm', name: 'helm', rect: [130,80,60,36], at: [160,134], words: ['helm','controls','wheel','steering','pilot'] },
      { id: 'chair', name: 'captain\'s chair', rect: [200,60,30,56], at: [214,134], words: ['chair','captain\'s chair','seat'] },
      { id: 'pocket', name: 'Vane\'s breast pocket', rect: [244,64,10,12], at: [230,134], words: ['pocket','breast pocket','her pocket','thaw code','code'], when: s => s.flags.sawCode },
      { id: 'vane', name: 'Captain Vane', rect: [230,48,30,68], at: [230,134], words: ['vane','captain vane','thessaly','captain','her','salvager'] },
      { id: 'brack', name: 'Brack', rect: [290,50,26,66], at: [276,134], words: ['brack','big man','guard'] },
      { id: 'readydoor', name: 'ready room door', rect: [0,20,14,96], at: [20,134], words: ['ready room','door','back','out'] }
    ]
  },
  // ---------- Chapter 7 ----------
  collar: {
    title: 'The docking collar', walk: W(16, 300, 122, 176),
    describe: 'The docking collar between the Hyacinth and the Lien. A Vellacourt pressure door with a keypad. The crate the "delivery" came in. Brack\'s abandoned sandwich. A tool rack. Through the hull window, once a minute, your mop drifts past.',
    spots: [
      ME(), MOPBOT([230,124,32,32], [246,140]),
      { id: 'window', name: 'hull window', rect: [20,14,50,40], at: [44,130], words: ['window','hull window','porthole','outside','space'] },
      { id: 'mymop-out', name: 'your mop, drifting', rect: [30,24,30,12], words: ['my mop','drifting mop','old mop','mop outside'], when: s => (s.flags.tick || 0) % 2 === 0 },
      { id: 'crate', name: 'Vellacourt crate', rect: [30,70,60,46], at: [60,134], words: ['crate','box','delivery crate','vellacourt crate','delivery'] },
      { id: 'sandwich', name: 'Brack\'s sandwich', rect: [96,104,16,12], at: [104,134], words: ['sandwich','food','lunch'], when: s => !s.flags.gotSandwich },
      { id: 'pressdoor', name: 'pressure door', rect: [120,20,80,96], at: [160,134], words: ['pressure door','door','lien door','hatch','airlock'] },
      { id: 'keypad', name: 'keypad', rect: [204,60,16,20], at: [196,134], words: ['keypad','pad','code pad','buttons','lock'] },
      { id: 'rack', name: 'tool rack', rect: [240,30,50,80], at: [264,134], words: ['rack','tool rack','tools'] },
      { id: 'back', name: 'back to the Hyacinth', rect: [0,30,14,86], at: [20,134], words: ['back','hyacinth','home','our side'] }
    ]
  },
  hold: {
    title: 'The Lien, salvage hold', walk: W(16, 300, 122, 176),
    describe: 'The Lien\'s salvage hold: shelves of other ships\' property. Nameplates, ship\'s bells, a child\'s bicycle, a row of empty cryo pods. A cargo drone sleeps on a rail. A manifest terminal. Corridors to the crew quarters and to the clamp room. A light switch.',
    spots: [
      ME(), MOPBOT([120,130,32,32], [136,146]),
      { id: 'nameplates', name: 'nameplates', rect: [30,20,50,20], at: [54,130], words: ['nameplates','nameplate','plates','names','ships'] },
      { id: 'bike', name: 'child\'s bicycle', rect: [118,40,44,30], at: [140,130], words: ['bike','bicycle','child\'s bicycle','childs bicycle'] },
      { id: 'bells', name: 'ship\'s bells', rect: [200,18,40,32], at: [220,130], words: ['bells','bell','ship\'s bell','ships bells'] },
      { id: 'shelves', name: 'salvage shelves', rect: [20,10,230,62], at: [130,130], words: ['shelves','shelf','salvage','loot','stuff','property'] },
      { id: 'emptypods', name: 'empty pods', rect: [250,40,60,76], at: [270,134], words: ['pods','empty pods','pod','cryo pods'] },
      { id: 'manifest', name: 'manifest terminal', rect: [20,80,30,36], at: [34,132], words: ['manifest','terminal','console','screen','computer'] },
      { id: 'lights', name: 'light switch', rect: [60,84,10,16], at: [66,132], words: ['lights','light switch','switch','light'] },
      { id: 'drone', name: 'cargo drone', rect: [90,70,40,18], at: [110,132], words: ['drone','cargo drone','rail','robot arm'] },
      { id: 'qcorridor', name: 'corridor to crew quarters', rect: [150,84,40,32], at: [170,134], words: ['quarters','crew quarters','corridor','vane\'s quarters','cabin','left corridor'] },
      { id: 'ccorridor', name: 'corridor to the clamp room', rect: [200,84,40,32], at: [220,134], words: ['clamp room','clamps','right corridor','corridor to clamps','dorrit'] },
      { id: 'collardoor', name: 'back to the collar', rect: [0,30,14,86], at: [20,134], words: ['collar','back','pressure door','out'] }
    ]
  },
  quarters: {
    title: 'Vane\'s quarters', walk: W(16, 300, 122, 176),
    describe: 'Captain Vane\'s cabin, neat as a filing cabinet. A bunk, a desk with a lockbox, a reading lamp, a uniform jacket on a hook, and a cat named Precedent sitting directly beneath the jacket.',
    spots: [
      ME(),
      { id: 'bunk', name: 'bunk', rect: [20,70,90,46], at: [64,134], words: ['bunk','bed','cot'] },
      { id: 'lockbox', name: 'lockbox', rect: [150,66,30,16], at: [165,134], words: ['lockbox','box','strongbox','lock box'] },
      { id: 'desk', name: 'desk', rect: [130,80,70,36], at: [165,134], words: ['desk','table'] },
      { id: 'lamp', name: 'reading lamp', rect: [204,48,12,34], at: [210,134], words: ['lamp','reading lamp','light','lampshade','shade'] },
      { id: 'jpocket', name: 'breast pocket', rect: [226,54,14,12], at: [234,134], words: ['pocket','breast pocket','jacket pocket'], when: s => s.flags.catMoved && !s.flags.gotCode },
      { id: 'jacket', name: 'uniform jacket', rect: [218,30,34,64], at: [234,134], words: ['jacket','uniform','uniform jacket','coat','hook'] },
      { id: 'cat', name: 'Precedent the cat', rect: [216,94,36,22], at: [234,134], words: ['cat','precedent','kitty','ship\'s cat','animal'], when: s => !s.flags.catMoved },
      { id: 'qvent', name: 'bulkhead vent', rect: [270,128,30,22], at: [286,150], words: ['vent','bulkhead vent','grille','duct'] },
      { id: 'qdoor', name: 'cabin door', rect: [300,30,20,86], at: [296,134], words: ['door','cabin door','out','hold','back'] }
    ]
  },
  clamps: {
    title: 'The Lien, clamp room', walk: W(16, 300, 122, 176),
    describe: 'The clamp room: hydraulics the size of tree trunks, a release lever behind a two-key panel with the keyholes a metre apart, a pressure gauge, a loudspeaker, and Dorrit, reading.',
    spots: [
      ME(), MOPBOT([30,124,32,32], [46,140]),
      { id: 'hydraulics', name: 'clamp hydraulics', rect: [20,20,100,96], at: [70,132], words: ['hydraulics','clamps','docking clamps','rams','pistons','machinery'] },
      { id: 'keyA', name: 'keyhole A', rect: [156,60,14,16], at: [164,134], words: ['keyhole a','slot a','left keyhole','keyhole','left slot'] },
      { id: 'keyB', name: 'keyhole B', rect: [190,60,14,16], at: [196,134], words: ['keyhole b','slot b','right keyhole','right slot','other keyhole'] },
      { id: 'panel', name: 'two-key panel', rect: [150,50,60,50], at: [180,134], words: ['panel','two-key panel','key panel','keyholes','two keys'] },
      { id: 'lever', name: 'release lever', rect: [220,60,20,50], at: [230,134], words: ['lever','release lever','release','handle'] },
      { id: 'pgauge', name: 'pressure gauge', rect: [250,30,30,30], at: [264,132], words: ['gauge','pressure gauge','dial','pressure'] },
      { id: 'dorrit', name: 'Dorrit', rect: [258,66,32,50], at: [250,134], words: ['dorrit','guard','reader','regulations','him'], when: s => !s.flags.dorritSlid },
      { id: 'speaker', name: 'loudspeaker', rect: [290,20,22,20], at: [296,132], words: ['speaker','loudspeaker','tannoy','pa','intercom','announce'] },
      { id: 'corridor', name: 'corridor to the hold', rect: [0,30,14,86], at: [20,134], words: ['corridor','hold','back','out','polished corridor','floor'] }
    ]
  },
  // ---------- Chapter 8 ----------
  lift: {
    title: 'Service lift', walk: W(40, 280, 126, 176),
    describe: 'Mop\'s service lift, built for a floor-polishing robot and nothing taller. Deck buttons, an emergency stop, and a hatch in the roof you could fold yourself through if you really wanted to.',
    spots: [
      ME(), MOPBOT([130,120,36,36], [148,140]),
      { id: 'buttons', name: 'deck buttons', rect: [200,40,40,60], at: [220,134], words: ['buttons','button','deck buttons','cryo button','panel','controls'] },
      { id: 'estop', name: 'emergency stop', rect: [200,104,20,12], at: [220,134], words: ['emergency stop','estop','e-stop','stop','red button'] },
      { id: 'hatch', name: 'roof hatch', rect: [60,20,60,40], at: [90,134], words: ['hatch','roof hatch','top','roof','opening','in'] },
      { id: 'liftdoor', name: 'lift door', rect: [0,30,14,86], at: [20,134], words: ['door','lift door','out'] }
    ]
  },
  gallery2: {
    title: 'Cryo Bay, crew gallery', walk: W(16, 300, 122, 176),
    describe: 'The crew gallery again, six decks down and four minutes from the jurisdiction line. The thaw console waits for eight digits. Footsteps on the stairs that are too heavy to be anyone but Brack.',
    spots: [
      ME(), MOPBOT([60,124,32,32], [76,140]),
      { id: 'brack2', name: 'Brack', rect: [10,50,30,66], at: [40,134], words: ['brack','big man','guard','him'], when: s => s.flags.brackArrived && !s.flags.brackStalled },
      { id: 'crewpods', name: 'crew pods', rect: [50,56,150,52], at: [110,132], words: ['crew pods','crew','pods','officers'] },
      { id: 'okonjo', name: 'the captain\'s pod', rect: [208,26,54,80], at: [234,132], words: ['captain','okonjo','captain\'s pod','captains pod','adaeze','pod'] },
      { id: 'thawconsole', name: 'thaw console', rect: [266,60,30,56], at: [280,132], words: ['thaw console','console','thaw','keypad','terminal'] },
      { id: 'stairs', name: 'stairs', rect: [0,56,14,120], at: [20,150], words: ['stairs','down','up','bridge'] }
    ]
  },
  bridge2: {
    title: 'The bridge', walk: W(16, 300, 122, 176),
    describe: 'The bridge, with a Lane Authority cutter filling the main screen, Captain Vane standing very still, Dorrit\'s voice coming out of the intercom from inside a pod, and Captain Okonjo in her own chair for the first time in fourteen months.',
    spots: [
      ME(), MOPBOT([150,120,32,32], [166,138]),
      { id: 'screen2', name: 'main screen', rect: [100,10,120,60], at: [160,130], words: ['screen','main screen','cutter','lane authority','authority'] },
      { id: 'okonjo2', name: 'Captain Okonjo', rect: [196,54,34,62], at: [200,134], words: ['okonjo','captain','captain okonjo','adaeze','her'] },
      { id: 'vane2', name: 'Captain Vane', rect: [250,48,30,68], at: [236,134], words: ['vane','thessaly','salvager','prisoner'] },
      { id: 'intercom', name: 'intercom', rect: [40,30,30,20], at: [54,132], words: ['intercom','dorrit','voice','speaker'] },
      { id: 'helm', name: 'helm', rect: [130,80,60,36], at: [160,134], words: ['helm','controls'] }
    ]
  }
};
