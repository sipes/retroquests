// Last Night in Port Lucky — static game data: items, rooms, hotspots, puzzles, chapters.
// No platform access here. Hint TEXT is never in this file (server-only, see src/games/port-lucky-hints.js).

export const GAME_ID = 'port-lucky';
export const SKU_GAME = 'port-lucky';
export const SKU_WALK = 'port-lucky-walkthrough';
export const MAX_SCORE = 250;
export const SAVE_VERSION = 2;

// EGA palette indices used by art + item chips
export const PAL = ['#000000','#0000AA','#00AA00','#00AAAA','#AA0000','#AA00AA','#AA5500','#AAAAAA','#555555','#5555FF','#55FF55','#55FFFF','#FF5555','#FF55FF','#FFFF55','#FFFFFF'];

// ---------- Items ----------
// words: parser nouns. look: Look text. color: PAL index for the inventory chip.
export const ITEMS = {
  crackers: { name: 'Crackers of Regret', color: 14, words: ['crackers','cracker','box','snack','snacks'], look: 'Crackers of Regret. $38 a box. Dry as a hotel towel.' },
  keycard:  { name: 'Room keycard', color: 9, words: ['keycard','card','key'], look: 'The keycard for Suite 702. Slightly chewed. Definitely damp.' },
  ticket:   { name: 'Valet ticket', color: 15, words: ['ticket','stub','valet ticket'], look: 'PALMETTO ROYALE VALET. No. 42. 3:12 AM. On the back, in your handwriting: "NEVER AGAIN."' },
  keys:     { name: 'Truck keys', color: 13, words: ['keys','keyring','car keys','truck keys'], look: 'A set of keys on a plastic ice-cream-cone key ring. It squeaks when squeezed.' },
  shoe:     { name: "Benny's left shoe", color: 8, words: ['shoe','left shoe','tuxedo shoe'], look: "One black tuxedo shoe, size 11, left foot. Benny's. The other one is presumably still on Benny." },
  receipt:  { name: 'Pawn receipt', color: 7, words: ['receipt','slip'], look: "BIG EARL'S PAWN & KARAOKE. 4:02 AM. 1 x wedding ring (pawned). 6 x karaoke tokens. Oh no, Benny." },
  // Chapter 3
  token:    { name: 'Karaoke token', color: 14, words: ['token','tokens','coin'], look: "Good for one song at Big Earl's. Benny bought six of these with a wedding ring." },
  trophy:   { name: 'Karaoke trophy', color: 14, words: ['trophy','cup'], look: 'SECOND PLACE — BIG EARL\'S ALL-NIGHT SING-OFF. Engraved: DUANE. Duane did not win.' },
  polaroid: { name: 'Polaroid', color: 15, words: ['polaroid','photo','picture','photograph'], look: 'Benny on stage at 5:31 AM, holding a goat\'s lead and a microphone, mid-note. Underneath, in Earl\'s handwriting: WINNER.' },
  feather:  { name: 'Lilac feather', color: 13, words: ['feather','lilac feather','plume'], look: 'A single lilac feather, the kind that falls off a very serious hat.' },
  page:     { name: 'Ledger page', color: 7, words: ['page','ledger','ledger page'], look: '9:04 AM. Ring, gold, three stones. SOLD. Buyer: "D. H., lilac hat, paid cash, did not haggle, looked at me like I\'d stolen it."' },
  leads:    { name: 'Jump leads', color: 12, words: ['leads','jump leads','cables','jumper cables'], look: 'Earl\'s jump leads. One clamp is held on with tape and optimism.' },
  // Chapter 4
  wallet:   { name: 'Your wallet', color: 6, words: ['wallet','money','cash','dollars','billfold'], look: 'Your wallet. A library card, a photo of you and Benny aged nine, both missing teeth, and whatever cash is left.' },
  phone:    { name: 'Your phone', color: 0, words: ['phone','mobile','cell','cellphone'], look: '41 texts from Lucy. The most recent: "Dex. Where. Is. He." Battery: 4%.' },
  churro:   { name: 'Churro', color: 6, words: ['churro','pastry','churros'], look: 'A churro the length of your forearm. Nadia says you owe her for nine of these.' },
  quarters: { name: 'Roll of quarters', color: 7, words: ['quarters','quarter','change','coins'], look: 'A roll of quarters from the change machine. The change machine is more generous than Tyler.' },
  plush:    { name: 'Plush dolphin', color: 11, words: ['dolphin','plush','toy','flipper','plush dolphin'], look: 'A plush dolphin named, according to the tag, "Flipper 2".' },
  fortune:  { name: 'Fortune card', color: 13, words: ['fortune','card','fortune card'], look: 'MADAME ZORA SAYS: THE ONE YOU SEEK IS ON THE WATER. ALSO, YOU WILL NEED A TUBA. (Zora saw you last night.)' },
  // Chapter 5
  rope:     { name: 'Coil of rope', color: 6, words: ['rope','line','coil'], look: 'Thirty feet of marina rope. Smells of diesel and regret.' },
  oars:     { name: 'Oars', color: 6, words: ['oars','oar','paddles'], look: 'A pair of oars Oscar was keeping as "security" on a tab you don\'t remember opening.' },
  shoe2:    { name: "Benny's right shoe", color: 8, words: ['right shoe','other shoe','shoe2'], look: 'The right shoe. Now you have a pair. Now you have a groom.' },
  icewater: { name: 'Cooler of ice water', color: 11, words: ['cooler','ice','water','ice water','icewater'], look: 'Melted ice. Very cold. Very wake-uppy.' },
  logpage:  { name: 'Logbook page', color: 15, words: ['log','logbook','log page','logpage'], look: '1:10 AM: Picked up two gentlemen and one tuba from the Royale dock. Gentleman #2 paid in karaoke tokens. 6:05 AM: Returned them with one goat. 9:25 AM: Gentleman #1 came back alone, crying, requested "somewhere to think". Anchored off breakwater. 10:40 AM: Anchor dragged. Pontoon gone. Captain furious.' },
  // Chapter 6
  cloche:   { name: 'Room-service cloche', color: 7, words: ['cloche','dome','lid','cover'], look: 'A silver dome. Underneath was a bowl of soup. The soup is now in the corridor.' },
  tea:      { name: 'Cup of tea', color: 15, words: ['tea','cup','cup of tea'], look: 'Earl Grey, strong, no sugar. Dolores makes it the way the Hartwells have always made it.' },
  ring:     { name: 'The ring', color: 14, words: ['ring','wedding ring'], look: 'Lucy\'s grandmother\'s ring. Three stones. It has had a longer night than you have.' },
  // Chapter 7
  tux:      { name: 'Tuxedo', color: 0, words: ['tux','tuxedo','suit','jacket'], look: 'Benny\'s tuxedo. Pressed. Unaware of what it\'s about to be put on.' },
  polish:   { name: 'Shoe polish', color: 0, words: ['polish','shoe polish','tin'], look: 'Black. For a pair of shoes that have each had very different mornings.' },
  bowtie:   { name: 'Goat bow tie', color: 4, words: ['bow tie','bowtie','tie','bow'], look: 'The bow tie from the suite. It fits exactly one guest.' },
  water:    { name: 'Bottle of water', color: 11, words: ['bottle','water','water bottle'], look: 'Still water. Benny needs about four of these.' },
  program:  { name: 'Order of service', color: 15, words: ['program','programme','order of service','order'], look: 'Ceremony 4:00. Rings: Dex Morrow. Speech: Dex Morrow. Both of these are news to you.' },
  napkin:   { name: 'Speech on a napkin', color: 15, words: ['napkin','speech','notes'], look: 'Your speech, assembled from a ledger page, a fortune card, a logbook and an order of service. It is honest. It is short. It will do.' },
  watch:    { name: 'Your watch', color: 7, words: ['watch','wristwatch','grandfather\'s watch'], look: 'Your grandfather\'s watch. Sal has been wearing it since 3 AM. Behind the face, folded very small, a photo of two nine-year-olds.' }
};

// ---------- Chapters ----------
// Each chapter: rooms it owns, status label, opening time. Presets are built by script.js (CHAPTER_START) so restart works.
export const CHAPTERS = [
  { n: 1, id: 'suite',   title: 'The Honeymoon Suite',     time: '9:47 AM',  rooms: ['suite'] },
  { n: 2, id: 'garage',  title: 'Level P2',                time: '10:15 AM', rooms: ['garage'] },
  { n: 3, id: 'earl',    title: "Big Earl's Pawn & Karaoke", time: '11:00 AM', rooms: ['bar','cage','alley'] },
  { n: 4, id: 'pier',    title: 'The Boardwalk',           time: '12:15 PM', rooms: ['pier','arcade'] },
  { n: 5, id: 'marina',  title: 'The Marina',              time: '1:30 PM',  rooms: ['dock','pontoon'] },
  { n: 6, id: 'hartwell',title: 'The Hartwell Suite',      time: '2:40 PM',  rooms: ['corridor','hartwell'] },
  { n: 7, id: 'pavilion',title: 'The Seaside Pavilion',    time: '3:48 PM',  rooms: ['lawn','groomtent','altar'] },
  { n: 8, id: 'reception', title: '"To the Happy Couple"', time: '4:00 PM',  rooms: ['reception'] }
];
export const ROOM_CHAPTER = {};
CHAPTERS.forEach(ch => ch.rooms.forEach(r => ROOM_CHAPTER[r] = ch.n));

// ---------- Puzzle list per room (for the hint drawer; text comes from the platform) ----------
export const PUZZLES = {
  suite: [
    { id: 'goat', title: 'The hungry roommate', solved: s => !!s.flags.goatFed },
    { id: 'clue', title: 'Souvenirs of last night', solved: s => !!s.flags.gotTicket },
    { id: 'door', title: 'Checking out', solved: s => !!s.flags.leftSuite }
  ],
  garage: [
    { id: 'valet', title: 'The nervous valet', solved: s => !!s.flags.gotKeys },
    { id: 'truck', title: 'Mr. Sprinkles', solved: s => !!(s.flags.gotShoe && s.flags.gotReceipt) }
  ],
  bar: [
    { id: 'earl-talk', title: 'Get Earl to talk', solved: s => !!s.flags.cageOpen },
    { id: 'duane-trophy', title: 'The sore loser', solved: s => !!s.flags.duaneTold },
    { id: 'lilac-lead', title: 'The lady in the lilac hat', solved: s => !!(s.flags.gotPage && s.flags.gotFeather) },
    { id: 'alley-truck', title: 'Mr. Sprinkles won\'t start', solved: s => !!s.flags.truckStarted }
  ],
  pier: [
    { id: 'sal-standoff', title: 'Sal and the deckchair', solved: s => !!s.flags.salDeal },
    { id: 'phone-churro', title: 'Nadia has your phone', solved: s => !!s.flags.gotPhone },
    { id: 'claw-wallet', title: 'The claw machine', solved: s => !!s.flags.gotWallet },
    { id: 'zora', title: 'Madame Zora', solved: s => !!s.flags.gotFortune },
    { id: 'call-kevin', title: 'One phone call', solved: s => !!s.flags.calledKevin }
  ],
  dock: [
    { id: 'spot-benny', title: 'Where is Benny?', solved: s => !!s.flags.sawPontoon },
    { id: 'get-oars', title: 'Oscar and the oars', solved: s => !!s.flags.gotOars },
    { id: 'row-out', title: 'Against the current', solved: s => !!s.flags.rowedOut },
    { id: 'wake-benny', title: 'Wake the groom', solved: s => !!s.flags.hauledIn }
  ],
  corridor: [
    { id: 'get-in', title: 'Room 701', solved: s => !!s.flags.inHartwell }
  ],
  hartwell: [
    { id: 'get-in', title: 'Room 701', solved: s => !!s.flags.inHartwell },
    { id: 'the-truth', title: 'Dolores and the ring', solved: s => !!s.flags.gotRing },
    { id: 'benny-up', title: 'Benny in the bathroom', solved: s => !!s.flags.bennyUp }
  ],
  lawn: [
    { id: 'dress-benny', title: 'Make Benny presentable', solved: s => !!s.flags.bennyDressed },
    { id: 'earl-problem', title: 'Big Earl wants his goat', solved: s => !!s.flags.earlSettled },
    { id: 'sal-problem', title: 'Sal wants a goat too', solved: s => !!s.flags.salSettled },
    { id: 'ring-bearer', title: 'Who carries the ring?', solved: s => !!s.flags.ringOnGus },
    { id: 'speech', title: 'The speech you never wrote', solved: s => !!s.flags.hasSpeech }
  ],
  reception: [
    { id: 'the-speech', title: 'To the happy couple', solved: s => !!s.flags.speechGiven },
    { id: 'loose-ends', title: 'Four small kindnesses', solved: s => ['kevinTip','margLog','earlToken','watchBenny'].every(k => s.flags[k]) }
  ]
};
PUZZLES.alley = PUZZLES.bar; PUZZLES.cage = PUZZLES.bar; PUZZLES.arcade = PUZZLES.pier; PUZZLES.pontoon = PUZZLES.dock;
PUZZLES.groomtent = PUZZLES.lawn; PUZZLES.altar = PUZZLES.lawn;

export const LEVEL_NAMES = ['Nudge', 'Clue', 'Full solution'];

// Points table (single source of truth for the 250). Key -> points.
export const POINTS = {
  // ch1 (25)
  feed: 5, arm: 1, minibar: 2, crackers: 2, ticket: 5, tuba: 2, desk: 3, door: 5,
  // ch2 (25)
  valet: 10, truck: 10, shoe: 3, receipt: 2,
  // ch3 (35)
  'earl-regular': 5, 'earl-receipt': 5, 'duane-wake': 4, 'duane-story': 6, ledger: 6, 'feather-pick': 4, jingle: 5,
  // ch4 (35)
  'sal-talk': 3, 'sal-deal': 5, 'nadia-debt': 3, 'phone-back': 4, 'phone-back-dolphin': 2, 'nadia-dolphin': 2,
  'quarters': 2, 'claw-fail': 2, 'claw-win': 6, zora: 5, 'kevin-call': 5,
  // ch5 (35)
  telescope: 5, 'oscar-talk': 2, 'oscar-bait': 3, oars: 5, 'rope-tie': 4, row: 6, 'shoe-pair': 2, wake: 5, haul: 3,
  // ch6 (30)
  cloche: 2, knock: 3, 'feather-match': 5, photo: 5, truth: 10, tea: 5,
  // ch7 (45)
  water: 2, tux: 4, shoes: 4, 'earl-stall': 4, 'earl-settle': 6, 'sal-goat': 3, 'watch-back': 5, 'bowtie-gus': 3, cushion: 4, program: 2, napkin: 8,
  // ch8 (20)
  'rings-handoff': 2, 'speech-honest': 10, 'speech-ok': 4, 'kevin-tip': 2, 'marg-log': 2, 'earl-token': 2, 'watch-benny': 2
};
// Keys that are alternatives (only one of the set can be scored): used by the max-score check.
export const POINT_ALTERNATIVES = [['phone-back', 'phone-back-dolphin'], ['speech-honest', 'speech-ok']];

// Rank titles for the final screen
export function rankFor(score) {
  if (score >= 250) return 'Best Man';
  if (score >= 200) return 'Good Man';
  if (score >= 150) return 'Man';
  if (score >= 100) return 'Plus-One';
  return 'Goat';
}
