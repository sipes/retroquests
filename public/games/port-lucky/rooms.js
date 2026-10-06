// Rooms and hotspots for all eight chapters. Coordinates are in the 320x180 game space.
// spot: { id, name, rect:[x,y,w,h], at:[x,y] (walk-to point), words:[nouns], when:(s)=>bool, dyn:true (player) }
const W = (x0, x1, y0, y1) => ({ x0, x1, y0, y1 });
const ME = (extra = []) => ({ id: 'me', name: 'yourself', words: ['me','self','myself','dex','arm','arms','hand','shirt','yourself','reflection', ...extra], dyn: true });

export const ROOMS = {
  // ---------- Chapter 1 ----------
  suite: {
    title: 'The Honeymoon Suite', walk: W(10, 310, 122, 176),
    describe: 'The Honeymoon Suite at the Palmetto Royale. Somebody had a wonderful time here. A goat in a bow tie stands on the sofa. A tuba lies on the carpet. A blue cocktail fizzes on the coffee table.',
    spots: [
      ME(),
      { id: 'cocktail', name: 'cocktail', rect: [146,114,16,20], at: [158,150], words: ['cocktail','drink','glass','umbrella','beverage'] },
      { id: 'keycard', name: 'keycard', rect: [184,56,12,10], at: [190,124], words: ['keycard','card','key'], when: s => !s.flags.goatFed },
      { id: 'goat', name: 'goat', rect: [132,44,60,54], at: [190,124], words: ['goat','billy','gus'] },
      { id: 'phone', name: 'telephone', rect: [86,84,22,30], at: [100,124], words: ['phone','telephone','desk','reception','front desk','handset'] },
      { id: 'crackers', name: 'crackers', rect: [222,84,14,12], at: [232,124], words: ['crackers','cracker','box','snack'], when: s => s.flags.minibarOpen && !s.flags.gotCrackers },
      { id: 'minibar', name: 'minibar', rect: [214,78,46,34], at: [232,124], words: ['minibar','fridge','bar','mini-bar','mini bar'] },
      { id: 'painting', name: 'painting', rect: [126,16,64,40], words: ['painting','picture','flamingo','art','frame'] },
      { id: 'disco', name: 'disco ball', rect: [230,2,20,30], words: ['disco','ball','disco ball','discoball'] },
      { id: 'door', name: 'door', rect: [264,24,44,88], at: [284,124], words: ['door','lock','hallway','exit','out'] },
      { id: 'ticket', name: 'paper in the tuba', rect: [66,136,10,10], at: [92,160], words: ['ticket','paper','valet ticket'], when: s => !s.flags.gotTicket },
      { id: 'tuba', name: 'tuba', rect: [30,128,56,36], at: [92,160], words: ['tuba','horn','instrument','bell','brass'] },
      { id: 'table', name: 'coffee table', rect: [118,128,78,20], at: [158,152], words: ['table','coffee table'] },
      { id: 'window', name: 'balcony door', rect: [6,14,88,96], at: [50,124], words: ['window','balcony','view','sea','ocean','curtain','curtains','sun'] },
      { id: 'sofa', name: 'sofa', rect: [102,74,112,40], at: [158,124], words: ['sofa','couch'] }
    ]
  },
  // ---------- Chapter 2 ----------
  garage: {
    title: 'Parking garage, level P2', walk: W(10, 310, 128, 176),
    describe: 'The Palmetto Royale parking garage. It smells of petrol and bad decisions. A pink ice-cream truck is parked crooked across two bays. A nervous valet watches you from his booth.',
    spots: [
      ME(),
      { id: 'shoe', name: 'shoe', rect: [44,92,14,10], at: [66,146], words: ['shoe','tuxedo shoe'], when: s => s.flags.truckOpen && !s.flags.gotShoe },
      { id: 'receipt', name: 'receipt', rect: [66,86,12,14], at: [66,146], words: ['receipt','slip','paper'], when: s => s.flags.truckOpen && !s.flags.gotReceipt },
      { id: 'kevin', name: 'valet', rect: [226,72,22,26], at: [240,132], words: ['valet','kevin','attendant','boy','man','guy'] },
      { id: 'booth', name: 'valet booth', rect: [208,58,66,62], at: [240,132], words: ['booth','stand','window'] },
      { id: 'truck', name: 'ice-cream truck', rect: [20,46,132,88], at: [100,146], words: ['truck','van','ice cream','ice-cream','icecream','vehicle','car','mr sprinkles','sprinkles'] },
      { id: 'sign', name: 'exit sign', rect: [146,24,28,14], words: ['sign','exit','exit sign'] },
      { id: 'stain', name: 'oil stain', rect: [224,154,28,10], at: [238,166], words: ['stain','oil','puddle'] },
      { id: 'pillar', name: 'pillar', rect: [98,20,20,94], words: ['pillar','column','post'] },
      { id: 'ramp', name: 'exit ramp', rect: [288,112,32,40], at: [300,140], words: ['ramp','exit ramp','road','street','drive','leave'], when: s => s.flags.gotShoe && s.flags.gotReceipt }
    ]
  },
  // ---------- Chapter 3 ----------
  bar: {
    title: "Big Earl's Pawn & Karaoke", walk: W(16, 300, 128, 176),
    describe: "Big Earl's Pawn & Karaoke never closed. A karaoke machine sparks on a tiny stage. A regular is asleep on a plastic trophy. Earl polishes a glass behind the bar and does not look at you. A barred pawn cage glows at the back.",
    spots: [
      ME(),
      { id: 'mic', name: 'microphone', rect: [58,56,14,46], at: [66,132], words: ['mic','microphone','sing','song'] },
      { id: 'tokens', name: 'token slot', rect: [22,70,10,10], at: [40,132], words: ['slot','token slot','coin slot'] },
      { id: 'karaoke', name: 'karaoke machine', rect: [16,56,40,48], at: [40,132], words: ['karaoke','machine','karaoke machine','screen'] },
      { id: 'stage', name: 'stage', rect: [10,104,86,12], at: [50,132], words: ['stage','platform'] },
      { id: 'trophy', name: 'trophy', rect: [138,94,14,16], at: [146,134], words: ['trophy','cup','award'], when: s => !s.flags.gotTrophy },
      { id: 'duane', name: 'Duane', rect: [110,80,34,32], at: [128,134], words: ['duane','regular','sleeper','drunk','man','guy','loser'] },
      { id: 'polaroids', name: 'wall of Polaroids', rect: [104,20,66,42], at: [136,132], words: ['polaroids','polaroid','wall','photos','pictures','photo'] },
      { id: 'jukebox', name: 'jukebox', rect: [172,62,22,52], at: [182,132], words: ['jukebox','juke','box','coin return','return'] },
      { id: 'earl', name: 'Earl', rect: [228,54,26,40], at: [240,132], words: ['earl','big earl','barman','bartender','owner'] },
      { id: 'counter', name: 'bar', rect: [196,92,110,24], at: [250,132], words: ['bar','counter','barcounter'] },
      { id: 'cage', name: 'pawn cage', rect: [258,28,34,62], at: [274,132], words: ['cage','pawn cage','bars','pawn','window'] },
      { id: 'alley', name: 'alley door', rect: [300,40,18,76], at: [300,134], words: ['alley','alley door','back door','back'] },
      { id: 'exit', name: 'front door', rect: [0,44,14,72], at: [18,134], words: ['front door','exit','out','street','door'] }
    ]
  },
  cage: {
    title: 'The pawn cage', walk: W(16, 240, 128, 176),
    describe: "Inside the cage. A glass counter, a ledger under Earl's thumb, and a shelf of things people regretted. Earl watches through the window like a man who has heard every story.",
    spots: [
      ME(),
      { id: 'ledger', name: 'ledger', rect: [118,82,44,14], at: [140,132], words: ['ledger','book','record','records','page'] },
      { id: 'receiptbook', name: 'receipt book', rect: [60,84,36,12], at: [80,132], words: ['receipt book','receipts','pad'] },
      { id: 'feather', name: 'lilac feather', rect: [198,38,16,16], at: [206,132], words: ['feather','plume','lilac'], when: s => s.flags.sawShelf && !s.flags.gotFeather },
      { id: 'lens', name: 'sunglasses lens', rect: [228,42,20,12], at: [236,132], words: ['lens','sunglasses','glasses'], when: s => s.flags.sawShelf },
      { id: 'shelf', name: 'shelf', rect: [20,26,232,46], at: [136,132], words: ['shelf','shelves','junk','stuff','things'] },
      { id: 'earl2', name: 'Earl', rect: [262,38,36,54], at: [230,132], words: ['earl','big earl','window'] },
      { id: 'counter2', name: 'counter', rect: [40,96,240,22], at: [160,132], words: ['counter','glass','case'] },
      { id: 'cagedoor', name: 'door to the bar', rect: [0,40,16,76], at: [18,134], words: ['door','bar','out','exit','back'] }
    ]
  },
  alley: {
    title: 'The alley behind Big Earl\'s', walk: W(10, 310, 132, 176),
    describe: 'An alley that smells of last night. Mr. Sprinkles is parked at an angle only you could have achieved. Bins. A bottle. A door back into the bar.',
    spots: [
      ME(),
      { id: 'hood', name: 'truck hood', rect: [118,68,34,24], at: [136,140], words: ['hood','bonnet','engine','battery','terminal'] },
      { id: 'truck', name: 'Mr. Sprinkles', rect: [10,46,142,88], at: [100,140], words: ['truck','van','ice cream','ice-cream','mr sprinkles','sprinkles','vehicle'] },
      { id: 'bins', name: 'bins', rect: [220,78,42,44], at: [240,140], words: ['bins','bin','trash','garbage','dumpster'] },
      { id: 'bottle', name: 'mystery bottle', rect: [262,106,10,16], at: [262,140], words: ['bottle','mystery bottle','drink'] },
      { id: 'bardoor', name: 'bar door', rect: [176,40,34,76], at: [192,140], words: ['door','bar','bar door','inside','back'] },
      { id: 'street', name: 'street', rect: [296,60,24,80], at: [306,150], words: ['street','road','out','boardwalk','pier','leave','drive'] }
    ]
  },
  // ---------- Chapter 4 ----------
  pier: {
    title: 'Sunny Side Pier', walk: W(10, 310, 128, 176),
    describe: 'Sunny Side Pier at noon. Gulls, churros, a fortune booth, an arcade. Sal sits in a deckchair under the ICE CREAM sign, guarding an empty parking space with a tyre iron.',
    spots: [
      ME(),
      { id: 'tyreiron', name: 'tyre iron', rect: [70,106,12,16], at: [66,136], words: ['tyre iron','tire iron','iron','bar','crowbar'] },
      { id: 'sal', name: 'Sal', rect: [26,80,44,44], at: [60,136], words: ['sal','man','deckchair man','owner','vendor'] },
      { id: 'deckchair', name: 'deckchair', rect: [20,90,52,36], at: [60,136], words: ['deckchair','chair','deck chair'] },
      { id: 'sign', name: 'ICE CREAM sign', rect: [10,20,72,30], words: ['sign','ice cream sign','ice cream'] },
      { id: 'churros', name: 'churros', rect: [104,84,22,12], at: [126,136], words: ['churros','churro','pastry','tray'] },
      { id: 'nadia', name: 'Nadia', rect: [124,60,24,34], at: [136,136], words: ['nadia','churro lady','woman','vendor','stand lady'] },
      { id: 'stand', name: 'churro stand', rect: [98,52,74,62], at: [136,136], words: ['stand','churro stand','grill','counter'] },
      { id: 'zora', name: 'Madame Zora', rect: [204,58,32,40], at: [220,136], words: ['zora','madame zora','fortune teller','psychic','woman'] },
      { id: 'booth', name: 'fortune booth', rect: [190,36,62,80], at: [220,136], words: ['booth','fortune booth','tent','curtain'] },
      { id: 'arcade', name: 'arcade', rect: [260,34,52,82], at: [286,136], words: ['arcade','arcade door','door','games','inside'] },
      { id: 'gulls', name: 'gulls', rect: [160,6,120,24], words: ['gulls','gull','seagulls','seagull','birds','bird'] },
      { id: 'bench', name: 'bench', rect: [150,128,52,18], at: [176,150], words: ['bench','seat'] },
      { id: 'bin', name: 'bin', rect: [288,124,20,20], at: [284,150], words: ['bin','trash','garbage'] },
      { id: 'marina', name: 'path to the marina', rect: [310,128,10,48], at: [308,160], words: ['marina','path','end of pier','harbour','harbor','boats','docks'] }
    ]
  },
  arcade: {
    title: 'The arcade', walk: W(10, 310, 128, 176),
    describe: 'Pinball noises, old carpet and the smell of hot electronics. Your wallet is sitting on top of a pile of plush dolphins inside the claw machine, as if it climbed in there itself.',
    spots: [
      ME(),
      { id: 'walletglass', name: 'your wallet', rect: [36,56,16,10], at: [46,136], words: ['wallet','my wallet','billfold'], when: s => !s.flags.gotWallet },
      { id: 'clawglass', name: 'claw machine glass', rect: [22,46,46,44], at: [46,136], words: ['glass','window','claw glass'] },
      { id: 'chute', name: 'prize chute', rect: [26,96,22,14], at: [46,136], words: ['chute','prize chute','flap','tray'] },
      { id: 'claw', name: 'claw machine', rect: [18,38,56,76], at: [46,136], words: ['claw','claw machine','crane','machine','grabber'] },
      { id: 'bell', name: 'bell', rect: [92,18,26,16], at: [104,136], words: ['bell','top','gong'] },
      { id: 'hammer', name: 'strength hammer', rect: [84,98,22,22], at: [104,136], words: ['hammer','mallet','strength test','strength','test your strength'] },
      { id: 'strength', name: 'test-your-strength tower', rect: [90,34,24,66], at: [104,136], words: ['tower','pole','strongman'] },
      { id: 'change', name: 'change machine', rect: [138,58,34,56], at: [154,136], words: ['change','change machine','changer','bills','dollar'] },
      { id: 'tyler', name: 'Tyler', rect: [228,46,26,38], at: [240,136], words: ['tyler','teen','teenager','attendant','kid','clerk','boy'] },
      { id: 'prizes', name: 'prize shelf', rect: [190,28,100,44], at: [240,136], words: ['prizes','prize','shelf','prize shelf'] },
      { id: 'pcounter', name: 'prize counter', rect: [188,84,104,30], at: [240,136], words: ['counter','prize counter','desk'] },
      { id: 'out', name: 'door to the pier', rect: [300,40,20,76], at: [306,140], words: ['door','out','pier','exit','outside','leave'] }
    ]
  },
  // ---------- Chapter 5 ----------
  dock: {
    title: 'The marina', walk: W(10, 236, 130, 176),
    describe: 'The Palmetto Royale marina. An empty mooring, a furious captain, a dinghy with no oars, a bait shop, a telescope that eats quarters, and, beyond the breakwater, a lot of water.',
    spots: [
      ME(),
      { id: 'marguerite', name: 'Captain Marguerite', rect: [34,84,28,44], at: [48,138], words: ['marguerite','captain','captain marguerite','woman','skipper'] },
      { id: 'cleat', name: 'dock cleat', rect: [60,120,20,10], at: [70,136], words: ['cleat','mooring','bollard','post'] },
      { id: 'kevin', name: 'Kevin', rect: [98,84,22,44], at: [110,140], words: ['kevin','valet'], when: s => s.flags.calledKevin },
      { id: 'tuba', name: 'tuba', rect: [120,90,34,22], at: [136,140], words: ['tuba','horn','brass','instrument'], when: s => s.flags.calledKevin },
      { id: 'trolley', name: 'luggage trolley', rect: [116,112,48,22], at: [136,140], words: ['trolley','cart','luggage cart'], when: s => s.flags.calledKevin },
      { id: 'gus', name: 'Gus the goat', rect: [162,100,36,38], at: [180,142], words: ['gus','goat','billy'] },
      { id: 'oscar', name: 'Oscar', rect: [234,48,28,34], at: [230,138], words: ['oscar','bait man','shopkeeper','man'] },
      { id: 'baitshop', name: 'bait shop', rect: [208,30,74,82], at: [230,138], words: ['bait shop','shop','bait','shack','hut'] },
      { id: 'telescope', name: 'telescope', rect: [288,58,18,56], at: [236,140], words: ['telescope','scope','binoculars','viewer'] },
      { id: 'flarebox', name: 'flare box', rect: [282,38,18,16], at: [236,140], words: ['flare','flares','flare box'] },
      { id: 'pump', name: 'fuel pump', rect: [198,66,14,46], at: [204,138], words: ['pump','fuel','fuel pump','diesel','petrol','gas'] },
      { id: 'rope', name: 'coil of rope', rect: [84,126,22,16], at: [94,146], words: ['rope','coil','line'], when: s => !s.flags.gotRope },
      { id: 'dinghy', name: 'dinghy', rect: [18,136,64,26], at: [60,150], words: ['dinghy','boat','rowboat','row boat','oarlocks','oarlock'] },
      { id: 'sign', name: 'sign', rect: [150,18,52,18], words: ['sign','notice'] },
      { id: 'water', name: 'the water', rect: [100,150,130,30], at: [120,166], words: ['water','sea','bay','ocean','harbour','harbor'] },
      { id: 'breakwater', name: 'breakwater', rect: [240,130,80,50], at: [236,160], words: ['breakwater','rocks','jetty','wall'] }
    ]
  },
  pontoon: {
    title: 'The Lady Lucinda', walk: W(30, 300, 128, 170),
    describe: 'The Lady Lucinda, a party pontoon with no party left on it. Benny is asleep under a pile of lifejackets. A cooler sweats. A tuxedo shoe hangs off the rail. The breakwater is closer than it should be.',
    spots: [
      ME(),
      { id: 'benny', name: 'Benny', rect: [56,92,96,44], at: [104,146], words: ['benny','groom','friend','mate','sleeper'] },
      { id: 'lifejackets', name: 'lifejackets', rect: [76,92,72,24], at: [104,146], words: ['lifejackets','lifejacket','jackets','vests','pile'] },
      { id: 'cooler', name: 'cooler', rect: [178,108,34,28], at: [196,146], words: ['cooler','cool box','ice box','ice','water'], when: s => !s.flags.gotIcewater },
      { id: 'logbook', name: 'logbook', rect: [148,94,28,14], at: [162,146], words: ['logbook','log','book'], when: s => !s.flags.gotLog },
      { id: 'crate', name: 'crate', rect: [144,106,36,22], at: [162,146], words: ['crate','box'] },
      { id: 'winch', name: 'anchor winch', rect: [228,78,44,44], at: [250,146], words: ['winch','anchor','anchor winch','crank','handle'] },
      { id: 'shoe2', name: 'shoe on the rail', rect: [278,74,18,24], at: [284,146], words: ['shoe','right shoe','other shoe','tuxedo shoe'], when: s => !s.flags.gotShoe2 },
      { id: 'rail', name: 'rail', rect: [30,80,270,12], at: [160,146], words: ['rail','railing'] },
      { id: 'discolight', name: 'disco light', rect: [18,18,24,70], at: [44,146], words: ['disco','light','disco light','lamp'] },
      { id: 'dinghy', name: 'dinghy', rect: [0,138,32,38], at: [36,158], words: ['dinghy','boat','rowboat','row','leave','back'] }
    ]
  },
  // ---------- Chapter 6 ----------
  corridor: {
    title: 'Seventh floor corridor', walk: W(10, 310, 124, 176),
    describe: 'The seventh-floor corridor of the Palmetto Royale. Room 701, the Hartwell suite. Room 702, yours, which you are not going back into. A room-service cart waits outside nobody\'s door.',
    spots: [
      ME(),
      { id: 'door701', name: 'door 701', rect: [60,30,50,84], at: [84,130], words: ['701','door 701','hartwell','hartwell suite','door','dolores'] },
      { id: 'door702', name: 'door 702', rect: [200,30,50,84], at: [224,130], words: ['702','door 702','my room','suite','honeymoon suite'] },
      { id: 'cloche', name: 'cloche', rect: [144,50,24,18], at: [156,130], words: ['cloche','dome','lid','cover'], when: s => !s.flags.gotCloche },
      { id: 'tray', name: 'room-service tray', rect: [132,64,46,10], at: [156,130], words: ['tray','room service','soup','food'] },
      { id: 'cart', name: 'room-service cart', rect: [128,72,52,48], at: [156,130], words: ['cart','trolley'] },
      { id: 'window', name: 'window', rect: [262,18,48,74], at: [286,130], words: ['window','pavilion','view','clock','lawn','outside'] }
    ]
  },
  hartwell: {
    title: 'The Hartwell Suite', walk: W(10, 296, 126, 176),
    describe: 'Suite 701. Dolores Hartwell sits in an armchair with her handbag on her lap, as composed as a woman can be while her future son-in-law is audibly sick in the bathroom. A lilac hat rests on the stand.',
    spots: [
      ME(),
      { id: 'bathroom', name: 'bathroom door', rect: [8,30,34,84], at: [30,132], words: ['bathroom','door','benny','loo','toilet'] },
      { id: 'hat', name: 'lilac hat', rect: [48,24,32,26], at: [66,132], words: ['hat','lilac hat','hatstand','hat stand'] },
      { id: 'hatstand', name: 'hat stand', rect: [56,50,16,64], at: [66,132], words: ['stand'] },
      { id: 'photo', name: 'framed photo', rect: [100,24,42,34], at: [120,132], words: ['photo','photograph','picture','frame','painting'] },
      { id: 'teaservice', name: 'tea service', rect: [92,88,56,26], at: [120,132], words: ['tea','tea service','teapot','pot','cups','tray'] },
      { id: 'dolores', name: 'Dolores', rect: [160,54,54,66], at: [186,134], words: ['dolores','mrs hartwell','mother','mother of the bride','woman','lady','her'] },
      { id: 'handbag', name: 'handbag', rect: [214,98,24,22], at: [220,134], words: ['handbag','bag','purse'] },
      { id: 'balcony', name: 'balcony', rect: [246,14,46,98], at: [268,132], words: ['balcony','railing','view','window','glass door'] },
      { id: 'exitdoor', name: 'door to the corridor', rect: [296,30,22,84], at: [296,134], words: ['door','corridor','out','exit','leave','pavilion'] }
    ]
  },
  // ---------- Chapter 7 ----------
  lawn: {
    title: 'The Seaside Pavilion', walk: W(10, 310, 118, 176),
    describe: 'The lawn of the Seaside Pavilion. Guests, a string quartet, an arch of white flowers, two tents and a goat tied to a palm. The clock says you have twelve minutes.',
    spots: [
      ME(),
      { id: 'gus', name: 'Gus', rect: [22,106,30,34], at: [50,138], words: ['gus','goat'] },
      { id: 'palm', name: 'palm tree', rect: [8,8,24,100], at: [40,138], words: ['palm','tree'] },
      { id: 'quartet', name: 'string quartet', rect: [44,58,46,54], at: [66,134], words: ['quartet','band','musicians','music','strings','violin'] },
      { id: 'arch', name: 'flower arch', rect: [120,20,80,96], at: [160,130], words: ['arch','altar','aisle','flowers','ceremony','front'] },
      { id: 'chart', name: 'seating chart', rect: [226,78,14,18], at: [214,134], words: ['chart','seating chart','clipboard','list','plan'] },
      { id: 'priya', name: 'Priya', rect: [204,58,22,50], at: [214,134], words: ['priya','usher','planner','coordinator','woman'] },
      { id: 'bridaltent', name: 'bridal tent', rect: [230,30,46,86], at: [252,132], words: ['bridal tent','bride','lucy','tent'] },
      { id: 'groomtent', name: "groom's tent", rect: [278,40,40,76], at: [298,132], words: ['groom tent','groom\'s tent','grooms tent','tent','benny'] },
      { id: 'kevin', name: 'Kevin', rect: [60,118,20,40], at: [84,150], words: ['kevin','valet'] },
      { id: 'dolores', name: 'Dolores', rect: [100,120,22,42], at: [124,152], words: ['dolores','mrs hartwell','mother'] },
      { id: 'earl', name: 'Big Earl', rect: [140,118,26,44], at: [166,152], words: ['earl','big earl','pawnbroker'], when: s => s.flags.earlArrived && !s.flags.earlSettled },
      { id: 'sal', name: 'Sal', rect: [180,122,22,40], at: [204,152], words: ['sal'], when: s => s.flags.salArrived && !s.flags.salSettled },
      { id: 'clock', name: 'clock', rect: [100,6,24,16], words: ['clock','time'] }
    ]
  },
  groomtent: {
    title: "The groom's tent", walk: W(10, 296, 122, 176),
    describe: 'Canvas, a mirror, and a groom on a stool with his head between his knees. A garment bag hangs from the pole. A table holds everything a best man might need and one thing he mustn\'t.',
    spots: [
      ME(),
      { id: 'bag', name: 'garment bag', rect: [22,28,38,84], at: [40,132], words: ['bag','garment bag','tuxedo','tux','suit','hanger'], when: s => !s.flags.gotTux },
      { id: 'mirror', name: 'mirror', rect: [80,30,40,60], at: [100,132], words: ['mirror','reflection'] },
      { id: 'flask', name: 'hip flask', rect: [146,74,12,20], at: [152,134], words: ['flask','hip flask','whisky','whiskey','booze','drink'] },
      { id: 'water', name: 'bottle of water', rect: [166,70,10,24], at: [170,134], words: ['water','bottle'], when: s => !s.flags.gotWater },
      { id: 'polish', name: 'shoe polish', rect: [186,80,14,12], at: [192,134], words: ['polish','shoe polish','tin'], when: s => !s.flags.gotPolish },
      { id: 'bowtie', name: 'small bow tie', rect: [206,80,16,10], at: [212,134], words: ['bow tie','bowtie','tie','bow'], when: s => !s.flags.gotBowtie },
      { id: 'table', name: 'table', rect: [138,92,90,22], at: [182,134], words: ['table'] },
      { id: 'benny', name: 'Benny', rect: [246,56,38,66], at: [262,134], words: ['benny','groom','friend','mate'] },
      { id: 'flap', name: 'tent flap', rect: [298,30,22,86], at: [298,136], words: ['flap','out','lawn','exit','door','leave','outside'] }
    ]
  },
  altar: {
    title: 'The altar', walk: W(10, 310, 118, 176),
    describe: 'The altar under the arch, with the sea behind it. A reverend with a kind face and a watch she keeps checking. A lectern with nothing on it. A ring cushion with nothing on it. Rows of chairs with programs on them.',
    spots: [
      ME(),
      { id: 'officiant', name: 'Reverend Okonkwo', rect: [148,56,26,56], at: [160,130], words: ['reverend','officiant','minister','priest','okonkwo','celebrant'] },
      { id: 'lectern', name: 'lectern', rect: [60,66,32,48], at: [76,130], words: ['lectern','podium','stand','speech'] },
      { id: 'cushion', name: 'ring cushion', rect: [218,84,24,14], at: [230,130], words: ['cushion','pillow','ring cushion','ring pillow'] },
      { id: 'cstand', name: 'cushion stand', rect: [222,98,16,16], at: [230,130], words: ['cushion stand'] },
      { id: 'program', name: 'order of service', rect: [40,124,16,12], at: [48,146], words: ['program','programme','order of service','paper','leaflet'], when: s => !s.flags.gotProgram },
      { id: 'chairs', name: 'chairs', rect: [20,120,280,40], at: [160,150], words: ['chairs','chair','seats','rows'] },
      { id: 'clock', name: 'clock', rect: [288,18,24,40], words: ['clock','time'] },
      { id: 'sea', name: 'the sea', rect: [0,0,320,50], words: ['sea','ocean','water','view','horizon'] },
      { id: 'back', name: 'path to the lawn', rect: [0,118,10,58], at: [12,150], words: ['lawn','back','path','out','tents','leave'] }
    ]
  },
  // ---------- Chapter 8 ----------
  reception: {
    title: 'The reception terrace', walk: W(10, 310, 132, 176),
    describe: 'The reception terrace at sunset. One long table, everyone you met today, an ice-cream truck serving dessert, and a goat asleep under the cake. There is a microphone with your name on it.',
    spots: [
      ME(),
      { id: 'mic', name: 'microphone', rect: [40,66,16,48], at: [48,140], words: ['mic','microphone','speech','toast'] },
      { id: 'cake', name: 'cake', rect: [10,94,44,30], at: [30,140], words: ['cake','wedding cake'] },
      { id: 'gus', name: 'Gus', rect: [18,128,36,30], at: [56,150], words: ['gus','goat'] },
      { id: 'dolores', name: 'Dolores', rect: [84,60,24,44], at: [96,140], words: ['dolores','mrs hartwell','mother'] },
      { id: 'lucy', name: 'Lucy', rect: [126,54,26,50], at: [140,140], words: ['lucy','bride','wife'] },
      { id: 'benny', name: 'Benny', rect: [154,56,24,48], at: [166,140], words: ['benny','groom','husband','friend','mate'] },
      { id: 'marguerite', name: 'Marguerite', rect: [196,58,24,46], at: [208,140], words: ['marguerite','captain'] },
      { id: 'kevin', name: 'Kevin', rect: [228,60,20,44], at: [238,140], words: ['kevin','valet'] },
      { id: 'sal', name: 'Sal', rect: [256,58,22,46], at: [266,140], words: ['sal'] },
      { id: 'earl', name: 'Big Earl', rect: [282,48,28,56], at: [294,140], words: ['earl','big earl'] },
      { id: 'table', name: 'long table', rect: [60,104,250,22], at: [180,140], words: ['table','long table','dinner'] },
      { id: 'sunset', name: 'sunset', rect: [0,0,320,44], words: ['sunset','sun','sky','sea','view'] }
    ]
  }
};

// Approved presentation-only contextual actions (mobile-context-v1).
const CONTEXT_PRESENTATION = {"suite":{"me":{"kind":"self","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"goat":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"keycard":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"minibar":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Open","verb":"use"},{"label":"Walk to","verb":"walk"}]},"crackers":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"cocktail":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"ticket":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"tuba":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"phone":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"door":{"kind":"exit","actions":[{"label":"Look","verb":"look"},{"label":"Go","verb":"use"},{"label":"Walk to","verb":"walk"}]},"window":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Open","verb":"use"},{"label":"Walk to","verb":"walk"}]},"painting":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"disco":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"sofa":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"table":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]}},"garage":{"kevin":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"booth":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"truck":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Take","verb":"take"},{"label":"Open","verb":"use"},{"label":"Walk to","verb":"walk"}]},"shoe":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"receipt":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"sign":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"stain":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"pillar":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"ramp":{"kind":"exit","actions":[{"label":"Look","verb":"look"},{"label":"Go","verb":"use"},{"label":"Walk to","verb":"walk"}]},"me":{"kind":"self","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]}},"bar":{"me":{"kind":"self","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"jukebox":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"karaoke":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"tokens":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"mic":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"stage":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"trophy":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"duane":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"polaroids":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"earl":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"counter":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"cage":{"kind":"exit","actions":[{"label":"Look","verb":"look"},{"label":"Go","verb":"use"},{"label":"Walk to","verb":"walk"}]},"alley":{"kind":"exit","actions":[{"label":"Look","verb":"look"},{"label":"Go","verb":"use"},{"label":"Walk to","verb":"walk"}]},"exit":{"kind":"exit","actions":[{"label":"Look","verb":"look"},{"label":"Go","verb":"use"},{"label":"Walk to","verb":"walk"}]}},"cage":{"me":{"kind":"self","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"ledger":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"receiptbook":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"shelf":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"feather":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"lens":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"earl2":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"counter2":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"cagedoor":{"kind":"exit","actions":[{"label":"Look","verb":"look"},{"label":"Go","verb":"use"},{"label":"Walk to","verb":"walk"}]}},"alley":{"me":{"kind":"self","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"hood":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"truck":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"bins":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"bottle":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"bardoor":{"kind":"exit","actions":[{"label":"Look","verb":"look"},{"label":"Go","verb":"use"},{"label":"Walk to","verb":"walk"}]},"street":{"kind":"exit","actions":[{"label":"Look","verb":"look"},{"label":"Go","verb":"use"},{"label":"Walk to","verb":"walk"}]}},"pier":{"me":{"kind":"self","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"sal":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"deckchair":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"tyreiron":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"sign":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"nadia":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"stand":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"churros":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"zora":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"booth":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"arcade":{"kind":"exit","actions":[{"label":"Look","verb":"look"},{"label":"Go","verb":"use"},{"label":"Walk to","verb":"walk"}]},"gulls":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"bench":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"bin":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"marina":{"kind":"exit","actions":[{"label":"Look","verb":"look"},{"label":"Go","verb":"use"},{"label":"Walk to","verb":"walk"}]}},"arcade":{"me":{"kind":"self","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"walletglass":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"clawglass":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"claw":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"chute":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"bell":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"strength":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"hammer":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"change":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"tyler":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"prizes":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"pcounter":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"out":{"kind":"exit","actions":[{"label":"Look","verb":"look"},{"label":"Go","verb":"use"},{"label":"Walk to","verb":"walk"}]}},"dock":{"me":{"kind":"self","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"marguerite":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"cleat":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"kevin":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"tuba":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"trolley":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"gus":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"oscar":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"baitshop":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"telescope":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"flarebox":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"pump":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"rope":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"dinghy":{"kind":"exit","actions":[{"label":"Look","verb":"look"},{"label":"Go","verb":"use"},{"label":"Walk to","verb":"walk"}]},"sign":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"water":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"breakwater":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]}},"pontoon":{"me":{"kind":"self","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"benny":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"lifejackets":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"cooler":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"logbook":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"crate":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"winch":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"shoe2":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"rail":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"discolight":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"dinghy":{"kind":"exit","actions":[{"label":"Look","verb":"look"},{"label":"Go","verb":"use"},{"label":"Walk to","verb":"walk"}]}},"corridor":{"me":{"kind":"self","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"door701":{"kind":"exit","actions":[{"label":"Look","verb":"look"},{"label":"Go","verb":"use"},{"label":"Walk to","verb":"walk"}]},"door702":{"kind":"exit","actions":[{"label":"Look","verb":"look"},{"label":"Go","verb":"use"},{"label":"Walk to","verb":"walk"}]},"cloche":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"tray":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"cart":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"window":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]}},"hartwell":{"me":{"kind":"self","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"dolores":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"hat":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"hatstand":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"photo":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"teaservice":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"handbag":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"bathroom":{"kind":"exit","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Go","verb":"use"},{"label":"Walk to","verb":"walk"}]},"balcony":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"exitdoor":{"kind":"exit","actions":[{"label":"Look","verb":"look"},{"label":"Go","verb":"use"},{"label":"Walk to","verb":"walk"}]}},"lawn":{"me":{"kind":"self","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"gus":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"palm":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"quartet":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"arch":{"kind":"exit","actions":[{"label":"Look","verb":"look"},{"label":"Go","verb":"use"},{"label":"Walk to","verb":"walk"}]},"chart":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"priya":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"bridaltent":{"kind":"exit","actions":[{"label":"Look","verb":"look"},{"label":"Go","verb":"use"},{"label":"Walk to","verb":"walk"}]},"groomtent":{"kind":"exit","actions":[{"label":"Look","verb":"look"},{"label":"Go","verb":"use"},{"label":"Walk to","verb":"walk"}]},"kevin":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"dolores":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"earl":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"sal":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"clock":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]}},"groomtent":{"me":{"kind":"self","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"bag":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"mirror":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"flask":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"water":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"polish":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"bowtie":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"table":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"benny":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"flap":{"kind":"exit","actions":[{"label":"Look","verb":"look"},{"label":"Go","verb":"use"},{"label":"Walk to","verb":"walk"}]}},"altar":{"me":{"kind":"self","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"officiant":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"lectern":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"cushion":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"cstand":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"program":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"chairs":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"clock":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"sea":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"back":{"kind":"exit","actions":[{"label":"Look","verb":"look"},{"label":"Go","verb":"use"},{"label":"Walk to","verb":"walk"}]}},"reception":{"me":{"kind":"self","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"gus":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"cake":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"mic":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"dolores":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"lucy":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"benny":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"marguerite":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"kevin":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"sal":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"earl":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"table":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"sunset":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]}}};
for (const [id, room] of Object.entries(ROOMS)) for (const spot of room.spots) Object.assign(spot, CONTEXT_PRESENTATION[id][spot.id]);
// Take means an ordinary portable target, not every script branch accepting
// the typed synonym. E.g. a truck/minibar/jukebox is not portable. These are
// static presentation classifications, never inferred from puzzle flags.
const CONTEXT_PORTABLE = {
  suite: ['cocktail', 'crackers', 'ticket'], garage: ['shoe', 'receipt'],
  bar: ['polaroids'], cage: ['feather'], alley: ['bottle'], pier: ['churros'],
  dock: ['rope'], pontoon: ['lifejackets', 'cooler', 'shoe2'],
  corridor: ['cloche'], hartwell: ['hat', 'teaservice'],
  groomtent: ['bag', 'flask', 'water', 'polish', 'bowtie'], altar: ['cushion', 'program']
};
for (const [id, room] of Object.entries(ROOMS)) for (const spot of room.spots) {
  const portable = CONTEXT_PORTABLE[id]?.includes(spot.id);
  spot.actions = spot.actions.filter(a => a.verb !== 'take');
  if (portable) spot.actions.splice(1, 0, { label: 'Take', verb: 'take' });
  if (spot.kind === 'portable') spot.kind = portable ? 'portable' : 'object';
}
// Original scripts use these as devices, not people (even where TALK is a
// typed synonym for calling/singing). Item-giving menus must not suggest NPCs.
for (const [room, id] of [['suite', 'phone'], ['garage', 'truck'], ['bar', 'mic']]) {
  const spot = ROOMS[room].spots.find(s => s.id === id);
  spot.kind = 'object'; spot.actions = spot.actions.filter(a => a.verb !== 'talk');
}
// Searching attached containers/instruments remains the original TAKE branch,
// with an ordinary non-spoiler label rather than suggesting portability.
for (const [room, id] of [['suite', 'tuba'], ['cage', 'ledger'], ['pontoon', 'logbook']]) {
  ROOMS[room].spots.find(s => s.id === id).actions.splice(1, 0, { label: 'Search', verb: 'take' });
}
