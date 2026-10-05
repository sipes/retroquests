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
  notice:   { name: 'Salvage declaration', color: 15, words: ['notice','declaration','salvage declaration','paper','claim','papers'], look: 'NOTICE OF SALVAGE. Vessel LUMINOUS HYACINTH, found derelict (no conscious crew aboard). Claimed under Lane Code 44.7 by Vellacourt Reclamation Fleet, Capt. T. Vane. Ship\'s representative: [a wax stamp of a smiling mop]. "No conscious crew aboard." You are, technically, conscious.' },
  roster:   { name: 'Crew roster', color: 15, words: ['roster','crew roster','list','crew list'], look: 'Thirty names, ranks and pod numbers. The last line is handwritten: "Tarragon, W. — not crew, do not freeze, someone has to do the floors. — A.O."' },
  hose:     { name: 'Coolant hose', color: 11, words: ['hose','coolant hose','pipe'], look: 'A length of cryo coolant hose. Very cold. Don\'t put your tongue on it.' },
  drawing:  { name: 'Gumbo drawing', color: 13, words: ['drawing','picture','crayon','gumbo drawing'], look: 'A child\'s drawing of a smiling blob labelled GUMBO, with "FEED HIM PLASTIK" underneath. Taped to pod 1,204.' },
  blanket:  { name: 'Fire blanket', color: 12, words: ['blanket','fire blanket'], look: 'A fire blanket in a red pouch. For wrapping things that are too hot to touch.' },
  tray:     { name: 'Plastic tray', color: 13, words: ['tray','plastic tray','galley tray'], look: 'A galley tray. Dishwasher-safe, Gumbo-edible.' },
  ties:     { name: 'Plant ties', color: 10, words: ['ties','plant ties','tie','twist ties'], look: 'A fistful of plastic plant ties. Thistle counts them.' },
  tomato:   { name: 'Tomato', color: 12, words: ['tomato','vegetable','fruit'], look: 'A real tomato. Fourteen months in space and it\'s the best thing you\'ve seen.' },
  gumbo1:   { name: 'Gumbo (small)', color: 10, words: ['gumbo','blob','pet','stowaway'], look: 'A fist-sized blob. It purrs when it eats plastic. It is looking at your badge.' },
  gumbo2:   { name: 'Gumbo (medium)', color: 10, words: ['gumbo','blob','pet','stowaway'], look: 'Gumbo, now the size of a loaf. It can grip things. It would like more plastic.' },
  gumbo3:   { name: 'Gumbo (large)', color: 10, words: ['gumbo','blob','pet','stowaway'], look: 'Gumbo is now the size of a cat and has opinions. It can hold a key.' },
  toolkit:  { name: 'Toolkit', color: 7, words: ['toolkit','tools','kit','driver','cutters','tape','multimeter'], look: 'Crew toolkit: driver set, cutters, tape, a multimeter and a laminated card that says DO NOT GIVE TO CONTRACTORS.' },
  rations:  { name: 'Ration packs', color: 14, words: ['rations','ration','food','ration packs','meal'], look: 'Three days of crew rations. Flavour: "Food".' },
  oven:     { name: 'Oven cleaner', color: 14, words: ['oven cleaner','cleaner','oven','caustic','chemical'], look: 'Galley oven cleaner. Sodium hydroxide. The label has a skull that looks worried.' },
  crewcard: { name: 'Temporary crew card', color: 14, words: ['crew card','crewcard','card','temporary card'], look: 'TARRAGON, W. — ACTING CREW (per roster, A. Okonjo). Issued by: THISTLE. Expires: when Thistle says so.' },
  polish:   { name: 'Floor polish', color: 15, words: ['polish','floor polish','canister','wax'], look: 'A canister of MOP-7 floor polish. "Lasting shine. Not for consumption. Not for coolant loops."' },
  canister: { name: 'Propellant canister', color: 15, words: ['canister','propellant','empty canister','can'], look: 'Mop\'s canister, now empty of polish and full of pressurised propellant. In zero-g this is a very small, very stupid rocket.' },
  filter:   { name: 'Coolant filter', color: 7, words: ['filter','coolant filter','cartridge'], look: 'The intake filter. Clean. Expensive. Currently the only thing between the loop and whatever you put in it.' },
  suit:     { name: 'EVA suit', color: 15, words: ['suit','eva suit','spacesuit','space suit'], look: 'One EVA suit, size L. You are an M. The suit has opinions about this.' },
  helmet:   { name: 'Helmet', color: 15, words: ['helmet','visor'], look: 'Visor cracked at the edge. Tape will do. Tape always does.' },
  tether:   { name: 'Tether reel', color: 7, words: ['tether','line','reel','clip','tether reel','safety line'], look: 'Thirty metres of tether and a clip. The clip is the important part.' },
  o2:       { name: 'O2 bottle', color: 11, words: ['o2','oxygen','bottle','air','tank'], look: 'Half full. Enough for a short walk. Don\'t take a long one.' },
  dosimeter:{ name: 'Dosimeter', color: 10, words: ['dosimeter','meter','rad meter','geiger'], look: 'Reads green. Keep it that way.' },
  plate:    { name: 'Shield plate', color: 7, words: ['plate','shield plate','panel','shield'], look: 'A loose micro-meteorite plate. Square, light, and exactly the size of the gap in the handrail.' },
  pin:      { name: 'Gimbal pin', color: 7, words: ['pin','gimbal pin','lock pin'], look: 'The gimbal lock pin. Heavier than it looks, like most things that stop things moving.' },
  coffee:   { name: 'Coffee', color: 6, words: ['coffee','cup','mug','drink'], look: 'Real coffee. The bridge gets real coffee. You get a lot of information about rank from this cup.' },
  contract: { name: 'Your contract', color: 15, words: ['contract','agreement','my contract'], look: 'CUSTODIAL SERVICES AGREEMENT. Party of the second part: W. Tarragon, CONTRACTOR. Clause 9: "Contractor is not a member of the crew for any purpose." Clause 9 has been a problem all day.' },
  logslip:  { name: 'Log printout', color: 15, words: ['log','printout','log printout','ship\'s log','logslip'], look: 'Ship\'s log, 03:14, fourteen months ago: "Pod 1,205 (custodial) left unassigned per captain\'s order. Note: Tarragon to remain awake and is hereby assigned duties of Deck Officer (Custodial) for the duration. — A.O." Deck Officer. Officer.' },
  sandwich: { name: "Brack's sandwich", color: 6, words: ['sandwich','food','brack\'s sandwich','lunch'], look: 'Brack\'s sandwich. He\'ll want it back. Precedent the cat wants it more.' },
  crateslip:{ name: 'Delivery slip', color: 15, words: ['slip','delivery slip','docket','manifest slip'], look: 'DELIVERY: 1 x boarding party. Signed for by: [smiling mop stamp]. Keypad code for return: 4471.' },
  codecard: { name: 'Thaw code card', color: 14, words: ['code','code card','thaw code','card','codecard'], look: 'An eight-digit code on Vellacourt stock. Someone has written "OKONJO" on the back in Vane\'s handwriting.' },
  keyA:     { name: 'Clamp key A', color: 7, words: ['key a','key','keya','clamp key','lanyard key'], look: 'Half of a two-key release. Dorrit had it on a lanyard.' },
  keyB:     { name: 'Clamp key B', color: 8, words: ['key b','keyb','other key','second key','clamp key b'], look: 'The other half. It was in Vane\'s lockbox, which is a compliment to Dorrit.' }
};

export const CHAPTERS = [
  { n: 1, id: 'deck9',  title: 'Deck 9, Custodial',     rooms: ['closet','deck9'] },
  { n: 2, id: 'cryo',   title: 'The Cryo Bay',          rooms: ['cryo','gallery'] },
  { n: 3, id: 'galley', title: 'Galley & Hydroponics',  rooms: ['galley','hydro'] },
  { n: 4, id: 'eng',    title: 'Engineering',           rooms: ['drive','reactor'] },
  { n: 5, id: 'hull',   title: 'The Hull',              rooms: ['hull1','hull2'] },
  { n: 6, id: 'bridge', title: 'The Bridge',            rooms: ['ready','bridge'] },
  { n: 7, id: 'lien',   title: 'The Lien',              rooms: ['collar','hold','quarters','clamps'] },
  { n: 8, id: 'thaw',   title: 'Thaw',                  rooms: ['lift','gallery2','bridge2'] }
];
export const ROOM_CHAPTER = {}; CHAPTERS.forEach(ch => ch.rooms.forEach(r => ROOM_CHAPTER[r] = ch.n));

export const PUZZLES = {
  closet: [
    { id: 'wake-up', title: 'Get your bearings', solved: s => !!s.flags.gotBadge },
    { id: 'vent-peek', title: 'The delivery', solved: s => !!s.flags.sawBoarders },
    { id: 'snack-tool', title: 'The wrench under the shelf', solved: s => !!s.flags.gotWrench },
    { id: 'up-and-out', title: 'Off Deck 9', solved: s => !!s.flags.leftDeck9 }
  ],
  cryo: [
    { id: 'read-the-room', title: 'The claim', solved: s => !!s.flags.knowsLoophole },
    { id: 'hide', title: 'The sweep', solved: s => !!s.flags.hidden },
    { id: 'roster', title: 'Who counts as crew', solved: s => !!(s.flags.gotRoster && s.flags.needsCode) },
    { id: 'duct-two', title: 'The hot duct', solved: s => !!s.flags.leftCryo }
  ],
  galley: [
    { id: 'feed-gumbo', title: 'The compost unit', solved: s => !!s.flags.gotGumbo },
    { id: 'thistle-crew', title: 'Thistle\'s rules', solved: s => !!s.flags.gotCrewcard },
    { id: 'locker', title: 'Tools, rations, chemicals', solved: s => !!(s.flags.gotToolkit && s.flags.gotOven) },
    { id: 'dog-the-door', title: 'Lock the galley', solved: s => !!s.flags.doorHeld },
    { id: 'vault-tease', title: 'The seed vault', solved: s => !!s.flags.vaultMatters }
  ],
  drive: [
    { id: 'distract-ilse', title: 'The engineer', solved: s => !!s.flags.ilseDistracted },
    { id: 'foul-the-loop', title: 'The coolant loop', solved: s => !!s.flags.jumpInhibited },
    { id: 'lose-the-mop', title: 'Airlock A', solved: s => !!s.flags.airlockClear },
    { id: 'suit-up', title: 'A suit that fits', solved: s => !!s.flags.suitChecked }
  ],
  hull1: [
    { id: 'clip-on', title: 'First rule', solved: s => !!s.flags.clipped },
    { id: 'bridge-the-gap', title: 'The handrail gap', solved: s => !!s.flags.gapBridged },
    { id: 'aim-the-dish', title: 'The dish', solved: s => !!s.flags.dishLocked },
    { id: 'broadcast', title: 'Say the words', solved: s => !!s.flags.broadcast }
  ],
  ready: [
    { id: 'coffee-brack', title: 'The door', solved: s => !!s.flags.pastBrack },
    { id: 'the-argument', title: 'Arguing the claim', solved: s => !!s.flags.sawCode },
    { id: 'mop-arrives', title: 'Mop and the filing', solved: s => !!s.flags.filingVoid },
    { id: 'vault-truth', title: 'Why the vault', solved: s => !!s.flags.knowsPrize }
  ],
  collar: [
    { id: 'get-in', title: 'The pressure door', solved: s => !!s.flags.inLien },
    { id: 'the-code', title: 'Vane\'s quarters', solved: s => !!s.flags.gotCode },
    { id: 'skating-rink', title: 'Dorrit', solved: s => !!s.flags.gotKeyA },
    { id: 'two-keys', title: 'The clamps', solved: s => !!s.flags.clampsBlown },
    { id: 'get-out', title: 'The closing door', solved: s => !!s.flags.leftLien }
  ],
  lift: [
    { id: 'ride-the-lift', title: 'Six decks down', solved: s => !!s.flags.rodeLift },
    { id: 'thaw', title: 'Wake the captain', solved: s => !!s.flags.okonjoAwake },
    { id: 'who-are-you', title: 'Answer the captain', solved: s => !!s.flags.answered }
  ]
};
PUZZLES.deck9 = PUZZLES.closet; PUZZLES.gallery = PUZZLES.cryo; PUZZLES.hydro = PUZZLES.galley; PUZZLES.reactor = PUZZLES.drive; PUZZLES.hull2 = PUZZLES.hull1;
PUZZLES.bridge = PUZZLES.ready; PUZZLES.hold = PUZZLES.collar; PUZZLES.quarters = PUZZLES.collar; PUZZLES.clamps = PUZZLES.collar; PUZZLES.gallery2 = PUZZLES.lift; PUZZLES.bridge2 = PUZZLES.lift;

export const POINTS = {
  // ch1 (20)
  'look-arm': 1, badge: 2, vent: 3, 'shelf-look': 1, 'coin-vend': 2, wrench: 3, bolts: 3, 'mop-chute': 3, climb: 2,
  // ch2 (25)
  notice: 3, nameplate: 2, hide: 5, drain: 3, roster: 3, 'okonjo-look': 3, blanket: 2, duct2: 4,
  // ch3 (35)
  'compost-look': 1, 'tray-feed': 3, gumbo: 3, board: 1, 'thistle-talk': 2, 'roster-show': 4, tomato: 3, locker: 4, oven: 2, rations: 2, 'gumbo-ties': 2, wheel: 2, dish: 2, vault: 4,
  // ch4 (35)
  headphones: 2, suppression: 4, 'filter-out': 3, 'polish-in': 4, 'oven-in': 4, gauge: 3, airlock: 5, suit: 2, 'helmet-tape': 3, o2: 2, tether: 1, suitcheck: 2,
  // ch5 (30)
  clip: 4, plate: 2, gap: 4, pin: 3, padlock: 4, crank: 4, panel: 3, broadcast: 6,
  // ch6 (30)
  coffee: 2, brack: 2, 'notice-show': 2, 'roster-show2': 3, 'contract-loss': 2, log: 6, 'code-seen': 3, 'mop-stamp': 3, filing: 3, seed: 4,
  // ch7 (45)
  crate: 2, slip: 1, keypad: 3, 'gumbo-vent': 3, cat: 3, jacket: 4, lockbox: 4, lights: 2, 'mop-polish': 5, keyA: 3, 'gumbo-key': 4, turn: 4, lever: 2, run: 5,
  // ch8 (30)
  lift: 6, code: 6, 'brack-stall': 4, thaw: 4, answer: 6, 'answer-ok': 3, 'answer-weak': 1, seal: 4
};
export const POINT_ALTERNATIVES = [['answer', 'answer-ok', 'answer-weak']];

export function rankFor(score) {
  if (score >= 250) return 'Deck Officer';
  if (score >= 200) return 'Second Class';
  if (score >= 150) return 'Third Class';
  if (score >= 100) return 'Contractor';
  return 'Delivery';
}
