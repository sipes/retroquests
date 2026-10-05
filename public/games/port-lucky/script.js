// Last Night in Port Lucky — game script: puzzle logic, chapter flow, presets, save migration.
// Runs entirely client-side with no platform access; the engine (E) owns UI, saves and the adapter.
import { ITEMS, CHAPTERS, ROOM_CHAPTER, POINTS, SAVE_VERSION } from './data.js';

// ---------- Chapter start presets (fallback checkpoints; real checkpoints are snapshotted at chapter start) ----------
const CH_KEYS = {
  1: ['feed','arm','minibar','crackers','ticket','tuba','desk','door'],
  2: ['valet','truck','shoe','receipt'],
  3: ['earl-regular','earl-receipt','duane-wake','duane-story','ledger','feather-pick','jingle'],
  4: ['sal-talk','sal-deal','nadia-debt','phone-back-dolphin','nadia-dolphin','quarters','claw-fail','claw-win','zora','kevin-call'],
  5: ['telescope','oscar-talk','oscar-bait','oars','rope-tie','row','shoe-pair','wake','haul'],
  6: ['cloche','knock','feather-match','photo','truth','tea'],
  7: ['water','tux','shoes','earl-stall','earl-settle','sal-goat','watch-back','bowtie-gus','cushion','program','napkin']
};
const CH_FLAGS = {
  1: {},
  2: { minibarOpen: 1, gotCrackers: 1, goatFed: 1, gotTicket: 1, leftSuite: 1, calledDesk: 1 },
  3: { truckOpen: 1, gotKeys: 1, gotShoe: 1, gotReceipt: 1 },
  4: { sawCoinReturn: 1, isRegular: 1, duaneAwake: 1, cageOpen: 1, gotPolaroid: 1, duaneTold: 1, sawShelf: 1, gotFeather: 1, earlDistracted: 1, gotPage: 1, gotLeads: 1, truckStarted: 1, tokens: 1 },
  5: { salTalked: 1, salDeal: 1, nadiaTalked: 1, gotChurro: 1, gotQuarters: 1, clawTried: 1, hammerTip: 1, bellRung: 1, gotWallet: 1, gotPlush: 1, gotPhone: 1, gotFortune: 1, calledKevin: 1 },
  6: { sawPontoon: 1, oscarTalked: 1, gullsGone: 1, gotOars: 1, gotRope: 1, ropeOnDinghy: 1, ropeTied: 1, oarsIn: 1, rowedOut: 1, gotShoe2: 1, gotIcewater: 1, bennyAwake: 1, bennyInBoat: 1, gotLog: 1, knowsLucinda: 1, hauledIn: 1 },
  7: { gotCloche: 1, inHartwell: 1, hatNoticed: 1, featherGiven: 1, sawPhoto: 1, photoAsked: 1, gotRing: 1, bennyUp: 1 },
  8: { bennyWatered: 1, bennyTux: 1, shoePolished: 1, bennyDressed: 1, earlArrived: 1, earlSettled: 1, salArrived: 1, salSettled: 1, gusTied: 1, ringOnCushion: 1, ringOnGus: 1, gotProgram: 1, speechParts: ['page','fortune','logpage'], hasSpeech: 1, ceremonyReady: 1, margin: 300 }
};
const CH_INV = {
  1: [], 2: ['keycard','ticket'], 3: ['keycard','keys','shoe','receipt'],
  4: ['keycard','keys','shoe','token','polaroid','feather','page'],
  5: ['keycard','shoe','token','polaroid','feather','page','wallet','phone','quarters','fortune','churro'],
  6: ['keycard','shoe','token','polaroid','feather','page','wallet','phone','quarters','fortune','logpage'],
  7: ['keycard','shoe','token','page','wallet','phone','quarters','fortune','logpage','ring'],
  8: ['keycard','token','page','wallet','phone','quarters','fortune','logpage','program','napkin','watch']
};
const CH_POS = { 1: ['suite',150,160,1], 2: ['garage',290,168,-1], 3: ['bar',24,150,1], 4: ['pier',300,150,-1], 5: ['dock',30,150,1], 6: ['corridor',290,150,-1], 7: ['lawn',160,150,1], 8: ['reception',300,150,-1] };
const CH_MONEY = { 1: [0,0], 2: [0,0], 3: [0,0], 4: [0,0], 5: [2100,35], 6: [2100,33], 7: [2100,33], 8: [2100,33] };

export function CHAPTER_START(n) {
  n = Math.max(1, Math.min(8, n | 0));
  const flags = {}, scored = {}; let score = 0;
  for (let i = 1; i < n; i++) { Object.assign(flags, CH_FLAGS[i + 1] || {}); CH_KEYS[i].forEach(k => { scored[k] = true; score += POINTS[k]; }); }
  if (n === 1) Object.assign(flags, CH_FLAGS[1]);
  const [room, px, py, dir] = CH_POS[n];
  return { v: SAVE_VERSION, chapter: n, room, inv: CH_INV[n].slice(), flags: JSON.parse(JSON.stringify(flags)), scored, score, hintsUsed: 0, revealed: {}, px, py, dir, started: true, money: CH_MONEY[n][0], quarters: CH_MONEY[n][1], clock: n === 7 ? 720 : null, checkpoint: null, done: false };
}

// v1 saves (demo) had no version, no chapter, no money/quarters/clock/checkpoint. Keep everything we can.
export function migrateSave(sv) {
  const g = JSON.parse(JSON.stringify(sv));
  if (!g.v) {
    g.v = SAVE_VERSION;
    g.chapter = ROOM_CHAPTER[g.room] || 1;
    if (g.flags && g.flags.demoDone) { g.flags.demoDone = false; } // the demo "ending" is now the start of chapter 3
    g.money = 0; g.quarters = 0; g.clock = null; g.done = false;
    g.checkpoint = CHAPTER_START(g.chapter);
    g.checkpoint.hintsUsed = g.hintsUsed || 0;
  }
  if (!g.flags) g.flags = {}; if (!g.scored) g.scored = {}; if (!g.inv) g.inv = []; if (!g.revealed) g.revealed = {};
  if (typeof g.money !== 'number') g.money = 0; if (typeof g.quarters !== 'number') g.quarters = 0;
  if (!g.chapter) g.chapter = ROOM_CHAPTER[g.room] || 1;
  if (!g.checkpoint) g.checkpoint = CHAPTER_START(g.chapter);
  if (g.chapter === 7 && (g.clock == null)) g.clock = 720;
  return g;
}

export function createScript(E) {
  const say = (t, then) => E.say(t, then);
  const pts = k => E.points(k);
  const G = () => E.game, F = () => E.game.flags;
  const has = id => E.has(id), give = id => E.give(id), drop = id => E.drop(id);
  const name = id => E.spotName(id);
  const rejoin = (it, o) => say(o === 'me' ? `You can't use the ${ITEMS[it].name.toLowerCase()} on yourself. Use it on something in the room.` : `Using the ${ITEMS[it].name.toLowerCase()} on the ${name(o)} does nothing useful.`);

  // ---------- Chapter flow ----------
  const OPEN = {
    2: ['Parking garage, level P2. The valet stand is here. And so, somehow, is a pink ice-cream truck.'],
    3: ["11:00 AM. Big Earl's Pawn & Karaoke. The sign says OPEN 24 HOURS and it looks like it means every one of them.", "A karaoke machine sparks on the stage. A man is asleep on a trophy. Earl, behind the bar, is very carefully not looking at you."],
    4: ['12:15 PM. Sunny Side Pier. Somewhere along this boardwalk is your wallet, your phone and your watch, traded away between one and three in the morning.', 'Sal is in a deckchair under the ICE CREAM sign. He has a tyre iron and the expression of a man who has been waiting since dawn.'],
    5: ['1:30 PM. The marina. An empty mooring, a furious captain, and a boy with a luggage trolley is on his way.', 'Somewhere out past the breakwater, according to a woman who charges a quarter, is Benny.'],
    6: ['2:40 PM. Seventh floor. Marguerite drops you at the lobby with a wet groom and a look that says never again. Kevin takes Benny up the service lift.', 'Dolores Hartwell is in 701. The lady in the lilac hat. The ring. You.'],
    7: ['3:48 PM. Twelve minutes. Benny is in the groom\'s tent in one shoe, a goat is tied to a palm, and the order of service says the best man does the rings and the speech.', 'The clock in the corner is real. It stops for nobody, except when you\'re reading.'],
    8: ['Four o\'clock. The quartet plays. Gus walks the aisle with the ring cushion tied to his harness and does not eat a single flower.', 'The reverend holds out her hand for the rings.']
  };
  function startChapter(n, opts = {}) {
    const g = G(); const [room, px, py, dir] = CH_POS[n];
    g.chapter = n; g.room = room; g.px = px; g.py = py; g.dir = dir; g.started = true; g.clock = n === 7 ? 720 : null;
    if (n === 7) delete g.flags.ceremonyReady;
    E.clearTransient(); E.clearOverlays(); E.view = 'game'; E.$('gate').hidden = true; E.$('stage').hidden = false;
    E.setCheckpoint(); E.renderInv(); E.updateHud(); E.updateClockUI(); E.persist();
    if (n === 1) {
      if (opts.fresh) { g.started = true; say('Port Lucky. 9:47 AM. You wake up face-down on the carpet of the Honeymoon Suite at the Palmetto Royale.'); say('Your head is pounding. The wedding is at four. The groom, your best mate Benny, is nowhere to be seen. There is a goat.'); say('Click a verb, then click something in the room. Or type commands like LOOK AT GOAT. Save often. This is that kind of game.'); }
      return;
    }
    (OPEN[n] || []).forEach(t => say(t));
    if (n === 8) say('Use Gus to take the rings from the cushion. Then it\'s the speech. You have a napkin.');
  }
  function onRestart(n) {
    const lines = { 1: 'You wake up face-down on the carpet. Again. The goat watches you with mild interest.', 2: 'Parking garage, level P2. Let\'s try that again.', 3: 'Back at the bar door. Earl still isn\'t looking at you.', 4: 'Back at the top of the pier. Sal hasn\'t moved. Sal may never move.', 5: 'Back on the dock. The pontoon is still out there. So is Benny.', 6: 'Seventh floor, again. Room 701 is still not opening by itself.', 7: 'Twelve minutes, again. The clock resets. Nothing else is forgiven.', 8: 'The reverend holds out her hand again. Patiently.' };
    say(lines[n] || 'Let\'s try that again.');
  }

  // ---------- Walk-mode shortcuts: clicking these with Walk selected acts as Use ----------
  const WALK_USE = { suite: ['door'], garage: ['ramp'], bar: ['cage','alley','exit'], cage: ['cagedoor'], alley: ['bardoor','street'], pier: ['arcade','marina'], arcade: ['out'], dock: ['dinghy'], pontoon: ['dinghy'], corridor: ['door701','door702'], hartwell: ['exitdoor','bathroom'], lawn: ['arch','groomtent','bridaltent'], groomtent: ['flap'], altar: ['back'], reception: [] };
  const walkAction = id => (WALK_USE[G().room] || []).includes(id);

  function itemLook(id) {
    const g = G();
    if (id === 'wallet') return g.money > 0 ? `Your wallet. A library card, a photo of you and Benny aged nine, and $${(g.money / 100).toFixed(0)} in cash.` : 'Your wallet. A library card, a photo of you and Benny aged nine, and no cash at all.';
    if (id === 'quarters') return `${g.quarters} quarters left. The change machine was generous. The pier is not.`;
    if (id === 'token') return `Karaoke token${(g.flags.tokens || 1) > 1 ? 's (' + g.flags.tokens + ')' : ''}. Good for one song at Big Earl's each. Benny bought six with a wedding ring.`;
    return ITEMS[id].look;
  }

  // ---------- Dispatcher ----------
  const HANDLERS = {};
  function act(v, o, it) {
    const h = HANDLERS[G().room]; if (!h) return say('Nothing happens.');
    if (v === 'look' && o === 'me' && !it) return lookMe();
    return h(v, o, it);
  }
  function lookMe() {
    const g = G();
    const lines = { suite: null, garage: 'You check your reflection in the truck window. Hawaiian shirt. Sunglasses with one lens. A best man in his prime.', bar: 'In the bar mirror: a man in a Hawaiian shirt who has been awake since a time he can\'t name. Earl has seen worse. Earl has seen you, last night.', pier: 'Sunburn is starting on the arm with the writing on it. DON\'T LET BENNY NEAR THE GOAT is now tanned on.', dock: 'You smell of churro and diesel. Marguerite can tell.', pontoon: 'Wet to the knees, in a dinghy, holding a shoe. Best man.', corridor: 'A hotel mirror. You straighten the Hawaiian shirt. It does not help.', hartwell: 'Dolores is looking at you the way she looked at the ring in Earl\'s window.', lawn: 'A best man with eleven minutes, mud to the knees and a goat on a lead. It will have to do.', groomtent: 'The mirror shows a man who has never written a speech in his life.', altar: 'The reverend looks at you. You look at the lectern. The lectern looks empty.', reception: 'Sunset makes everyone look forgiven. Even you.' };
    if (g.room === 'suite') { pts('arm'); return say('You are Dex Morrow, best man. You are wearing a Hawaiian shirt you have never seen before. On your arm, in marker: "DON\'T LET BENNY NEAR THE GOAT." Too late for that.'); }
    return say(lines[g.room] || 'Still you.');
  }
  function combine(a, b) {
    const pair = [a, b].sort().join('+');
    if (pair === 'polish+shoe') { F().shoePolished = true; return say('You polish Benny\'s left shoe until you can see your sunburn in it. Now it just needs a groom.'); }
    if (pair === 'napkin+program' || pair === 'page+program') return say('You\'ve already written on the napkin. Don\'t write on the program. People keep those.');
    return say(`The ${ITEMS[a].name.toLowerCase()} and the ${ITEMS[b].name.toLowerCase()} don\'t go together. Yet.`);
  }

  // ---------- Chapter 1: suite ----------
  HANDLERS.suite = (v, o, it) => {
    const f = F();
    if (it) {
      if (it === 'crackers' && (o === 'goat' || o === 'keycard')) { drop('crackers'); f.goatFed = true; give('keycard'); pts('feed'); return say('You hold out the Crackers of Regret. The goat drops your keycard, inhales the whole box, and gives you a look of grudging respect. You pick up the keycard. It is warm. Don\'t think about it.'); }
      if (it === 'keycard' && o === 'door') return useDoor();
      if (it === 'ticket' && o === 'goat') return say('The goat leans toward the ticket with interest. You snatch it back. That ticket is your only lead.');
      if (it === 'crackers' && o === 'cocktail') return say('Dunking crackers in a glowing drink is how villains are born. No.');
      if (it === 'crackers' && o === 'me' && v === 'eat') return say('$38 crackers? You would rather frame them. Besides, someone else in this room looks hungrier.');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('You pat yourself down. Wallet: gone. Phone: gone. Dignity: also gone.');
      case 'goat':
        if (v === 'look') return say(f.goatFed ? 'The goat chews thoughtfully on the last of your crackers. It seems to have forgiven you for whatever happened last night.' : 'A goat. Wearing a tiny bow tie. It is standing on the sofa, chewing on your room keycard, and staring at you as if YOU are the one who doesn\'t belong here.');
        if (v === 'talk') return say(f.goatFed ? '"Meh," says the goat. It sounds friendlier now.' : '"Meh," says the goat. You feel judged.');
        if (v === 'take') return say('You try to pick up the goat. The goat headbutts your hangover. You decide to give it some space.');
        if (v === 'drink' || v === 'eat') return say('Absolutely not.');
        return say('The goat ignores you and keeps chewing.');
      case 'keycard':
        if (v === 'look') return say('Your room keycard, sticking out of the goat\'s mouth like a cigar.');
        return say('You reach for the keycard. The goat bites down harder. It is not giving up its breakfast without a trade.');
      case 'minibar':
        if (v === 'look') return say(f.minibarOpen ? (f.gotCrackers ? 'An empty minibar. Someone drank everything. That someone may have been you.' : 'The minibar is empty except for one box of Crackers of Regret, priced at $38.') : 'A minibar. Its little door is closed. Its little price list is terrifying.');
        if (!f.minibarOpen) { f.minibarOpen = true; pts('minibar'); return say('You open the minibar. Every bottle is gone. Only a box of Crackers of Regret ($38) survived the night.'); }
        if (!f.gotCrackers && v === 'take') return takeCrackers();
        return say('The minibar is already open. It hums at you sadly.');
      case 'crackers': if (v === 'look') return say('Crackers of Regret. $38 a box. The tagline reads: "Because you deserve it?"'); return takeCrackers();
      case 'cocktail':
        if (v === 'look') return say('A glowing blue cocktail with a tiny umbrella. It is bubbling. Drinks shouldn\'t bubble.');
        if (v === 'take') return say('You reach for it, then stop. Your hand is shaking. So is the drink.');
        if (v === 'use' || v === 'drink' || v === 'eat') return E.die('You take a sip of the blue cocktail. Your vision turns blue. Then your hearing turns blue. Then everything turns blue.\n\nYou have died of an unidentified cocktail. The wedding goes ahead without a best man.');
        return say('The cocktail fizzes menacingly.');
      case 'ticket': if (v === 'look') return say('Something papery is stuck deep inside the bell of the tuba.'); return takeTicket();
      case 'tuba':
        if (v === 'look') return say(f.gotTicket ? 'A full-size tuba. You don\'t play the tuba. Your lips say otherwise.' : 'A full-size tuba. You don\'t play the tuba. Your lips say otherwise. Something papery is stuck deep inside the bell.');
        if (v === 'take' || v === 'search') return takeTicket();
        if (v === 'use' || v === 'play') { pts('tuba'); return say('You blow into the tuba. A noise like a lovesick whale fills the suite. The goat applauds with one hoof. Someone next door bangs on the wall.'); }
        return say('The tuba gleams at you accusingly.');
      case 'phone':
        if (v === 'look') return say('A hotel phone. Someone has written "DO NOT CALL MOM" on the handset.');
        if (v === 'use' || v === 'talk' || v === 'take') { f.calledDesk = true; pts('desk'); return say('You call the front desk. "Good morning, Mr. Morrow. Your friend Benny asked us to tell you he \'took the car.\' He seemed very proud of it. Also, the goat is not included in your room rate."'); }
        return say('The phone sits there, ready to deliver bad news.');
      case 'door': if (v === 'look') return say('The door to the hallway. It has a keycard lock with an angry red light.'); return useDoor();
      case 'window': if (v === 'look') return say('Morning sun, a glittering ocean and palm trees. It is 9:47 AM. The wedding is at four.'); return say('You open the balcony door. The sunlight hits you like a frying pan. You close it again.');
      case 'painting': if (v === 'look') return say('A painting of a flamingo. Someone has drawn a mustache on it in lipstick. The handwriting looks suspiciously like yours.'); return say('It is bolted to the wall. Smart hotel.');
      case 'disco': if (v === 'look') return say('Hotel suites don\'t come with disco balls. You checked the brochure. Twice.'); return say('Out of reach. Like your dignity.');
      case 'sofa': if (v === 'look') return say('A green velvet sofa with a goat on it. There is a hoof-shaped dent in every cushion.'); if (v === 'sit' || v === 'use') return say('You sit down. The goat sits on you. You stand up.'); return say('The goat has claimed the sofa. You are not going to win this one.');
      case 'table': if (v === 'look') return say('A glass coffee table. Mostly intact. It holds a suspicious blue cocktail.'); return say('The table is fine where it is. It is the only thing in this room that is.');
      default: return say("You can't do that here.");
    }
    function takeCrackers() { if (!f.minibarOpen) return say('What crackers? The minibar is closed.'); if (f.gotCrackers) return say('You already took them. They cost $38. You will be thinking about that for years.'); f.gotCrackers = true; give('crackers'); pts('crackers'); say('You take the Crackers of Regret. $38 goes straight onto your room bill.'); }
    function takeTicket() { if (f.gotTicket) return say('The tuba has nothing left to give.'); f.gotTicket = true; give('ticket'); pts('ticket'); say('The tuba is too heavy to lift, but you fish around inside the bell. You pull out a valet ticket: PALMETTO ROYALE VALET, No. 42, 3:12 AM.'); }
    function useDoor() {
      if (!has('keycard')) return say('The lock blinks red. It wants a keycard. Your keycard is somewhere in this room. Inside a goat, specifically.');
      if (!has('ticket')) return say('You hold the keycard to the lock, then stop. Where would you even start looking for Benny? Search this room for clues about last night first.');
      f.leftSuite = true; pts('door');
      say('The light turns green. You take one last look at the goat. It nods. You step into the hallway, take the lift down, and avoid eye contact with everyone.', () => { if (E.ent.game) startChapter(2); else { E.persist(); E.showPaywall(); } });
    }
  };

  // ---------- Chapter 2: garage ----------
  HANDLERS.garage = (v, o, it) => {
    const f = F();
    if (it) {
      if (it === 'ticket' && (o === 'kevin' || o === 'booth')) { drop('ticket'); give('keys'); f.gotKeys = true; pts('valet'); return say('Kevin takes the ticket with trembling hands, sprints off, and returns with a set of keys. He points at the ice-cream truck. "You arrived in that at 3 AM, sir. You played the jingle for an hour. Please just take it."'); }
      if (it === 'keys' && o === 'truck') return openTruck();
      if (it === 'keys' && o === 'kevin') return say('Kevin backs away. "No returns, sir."');
      if (o === 'kevin') return say('Kevin looks at it, then at you. "I only take valet tickets, sir."');
      return rejoin(it, o);
    }
    switch (o) {
      case 'kevin':
        if (v === 'look') return say('A teenage valet. His name tag reads KEVIN. He is staring at you with open fear.');
        if (v === 'talk') return say(f.gotKeys ? '"Please just take the truck, sir," says Kevin. "And the goat. Is the goat with you?"' : '"Oh no. It\'s you," says Kevin. "Sir, do you have your ticket?"');
        return say('Kevin takes a big step back.');
      case 'booth': return say('A tiny valet booth with a board of keys. One hook is labelled 42. It is empty.');
      case 'truck':
        if (v === 'look') return say(f.truckOpen ? 'Mr. Sprinkles, an ice-cream truck. The serving window is open. Melted ice cream everywhere.' : 'A pink ice-cream truck. "MR. SPRINKLES" is painted on the side. There is a goat-shaped dent in the bumper. The serving window is shut.');
        if (v === 'use' || v === 'take') return openTruck();
        if (v === 'talk') return say('You whisper "Mr. Sprinkles?" Nothing. Thank goodness.');
        return say('The truck is very pink and very shut.');
      case 'shoe': if (v === 'look') return say("A black tuxedo shoe, size 11, left foot. Benny's."); f.gotShoe = true; give('shoe'); pts('shoe'); say("You take Benny's left shoe. At least you know he was here."); return checkGarage();
      case 'receipt': if (v === 'look') return say('A crumpled receipt, sticky with melted ice cream.'); f.gotReceipt = true; give('receipt'); pts('receipt'); say('You take the receipt and smooth it out. BIG EARL\'S PAWN & KARAOKE, 4:02 AM. One wedding ring, pawned. Six karaoke tokens, purchased.'); return checkGarage();
      case 'sign': return say('EXIT. If only it were that easy.');
      case 'stain': return say('An oil stain shaped exactly like a goat. A coincidence. Probably.');
      case 'pillar': return say('A concrete pillar with a fresh scrape at bumper height. Pink paint.');
      case 'ramp':
        if (v === 'look') return say('The exit ramp. Daylight at the top of it. Big Earl\'s is on Tarpon Street, four blocks away, according to the receipt.');
        return say('You climb into Mr. Sprinkles. The jingle starts by itself. You do not turn it off, because you cannot find the switch, because you never could.', () => startChapter(3));
      default: return say("You can't do that here.");
    }
    function openTruck() { if (f.truckOpen) return say('The serving window is already open.'); if (!has('keys')) return say('The truck is locked. Somebody has the keys. Somebody nervous.'); f.truckOpen = true; pts('truck'); say('You unlock the truck and the serving window rolls up with a cheerful jingle. Inside: melted ice cream, one tuxedo shoe and a crumpled receipt.'); }
    function checkGarage() { if (f.gotShoe && f.gotReceipt && !f.garageDone) { f.garageDone = true; say('It is 10:31 AM. Benny pawned the wedding ring to pay for karaoke. The wedding is at four. Big Earl\'s is four blocks away and you have an ice-cream truck. Take the exit ramp.'); } }
  };

  // ---------- Chapter 3: Big Earl's ----------
  HANDLERS.bar = (v, o, it) => {
    const f = F(); const g = G();
    if (it) {
      if (it === 'token' && (o === 'tokens' || o === 'karaoke')) {
        if (f.tokenIn) return say('There\'s already a token in the machine. It\'s waiting for a singer.');
        f.tokens = (f.tokens || 1) - 1; f.tokenIn = true; if (f.tokens <= 0) drop('token'); E.renderInv();
        return say('The token drops. The karaoke machine wakes up with a noise like a cat in a dryer and shows you a song list from 1994.');
      }
      if (it === 'token' && o === 'jukebox') return say('The jukebox wants quarters. The karaoke machine wants tokens. This bar has a currency problem.');
      if (it === 'receipt' && o === 'earl') {
        if (!f.isRegular) return say('Earl doesn\'t look at paper from people who haven\'t sung.');
        drop('receipt'); f.cageOpen = true; pts('earl-receipt');
        return say('Earl reads the receipt and nods slowly. "Four-oh-two. Your friend. Pawned a ring for the tab and six tokens, won my sing-off at half five, took my goat. Ring\'s gone, sold this morning." He unbars the cage. "Go look at the ledger if you don\'t believe me. Hands off."');
      }
      if (it === 'polaroid' && o === 'duane') {
        if (!f.duaneAwake) return say('Duane is asleep. Show him later.');
        if (f.duaneTold) return say('"I\'ve seen it," says Duane. "I\'ve seen it."');
        f.duaneTold = true; pts('duane-story');
        return say('Duane squints at the Polaroid. Benny, 5:31 AM, goat and microphone. "He had a GOAT," says Duane. "Nobody told me there\'d be a goat." He sags. "Your boy left about twenty past nine with the lady boat captain. Marguerite. One shoe. Crying. Said he had to think."');
      }
      if (it === 'polaroid' && o === 'earl') return say('Earl glances at it. "Yeah. That\'s my goat." He goes back to his glass. In the cage he\'d be more interested.');
      if (it === 'shoe' && o === 'duane') return say('You show Duane the shoe. He sings a line of a song about shoes. It is not good.');
      if (o === 'earl') return say('Earl doesn\'t want it. Earl wants a song.');
      if (o === 'jukebox') return say('The jukebox is not interested.');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('You are a man in a Hawaiian shirt in a karaoke bar at eleven in the morning. Nobody here finds that strange.');
      case 'jukebox':
        if (v === 'look') { f.sawCoinReturn = true; return say('A jukebox that has not been fed since the Clinton administration. Something glints in the coin return.'); }
        if (v === 'take' || v === 'search' || v === 'use') {
          if (f.gotTokens) return say('The coin return is empty now. The jukebox hums, pleased with itself.');
          f.gotTokens = true; f.tokens = 2; give('token');
          return say('You fish two karaoke tokens out of the coin return. Someone meant to play the jukebox and fed it the wrong currency. Someone was probably you.');
        }
        return say('The jukebox glows. It will not be played today.');
      case 'karaoke':
        if (v === 'look') return say(f.tokenIn ? 'The karaoke machine is lit up and waiting. The song list offers "Islands in the Stream" or regret.' : 'A karaoke machine with a token slot, a screen and a reputation. It sparks occasionally, as if remembering something.');
        if (v === 'use') return say('It needs a token first. Then a singer. Then, ideally, an exit.');
        return say('The machine sparks. You take a step back.');
      case 'tokens': if (v === 'look') return say('A token slot. Not a coin slot. Earl has strong views.'); return say('It wants a token.');
      case 'mic':
        if (v === 'look') return say('A microphone that has been dropped more times than it has been sung into. The cable runs straight into the sparking machine.');
        if (v === 'take' || v === 'use' || v === 'play' || v === 'talk') {
          if (!f.tokenIn) return E.die('You grab the live microphone without a token in the machine. The machine, which has been sparking since 1997, finally finds a use for you.\n\nYou are the last song of the night.');
          f.tokenIn = false; f.sang = true;
          if (!f.isRegular) { f.isRegular = true; pts('earl-regular'); }
          if (!f.duaneAwake) { f.duaneAwake = true; pts('duane-wake'); }
          return say('You sing. You sing "Islands in the Stream", both parts, with your eyes closed. The regulars groan. Duane sits bolt upright and shouts "I WAS ROBBED." Earl puts down his glass. "All right," he says. "You\'re a regular."');
        }
        return say('The microphone waits.');
      case 'stage': if (v === 'look') return say('A stage the size of a bath mat. Last night, according to the Polaroids, Benny stood on it with a goat.'); return say('You stand on the stage. Nothing happens. The stage is used to that.');
      case 'trophy':
        if (v === 'look') return say('A plastic trophy under Duane\'s arm. SECOND PLACE. Engraved: DUANE. He is holding it the way a child holds a blanket.');
        if (!f.duaneAwake) return E.die('You slide the trophy out from under Duane\'s arm. Duane, still asleep, defends his second place with a right hook that would have won the sing-off.\n\nEverything goes dark.');
        return say('Duane clutches the trophy. "Second place is still a place," he says. You leave it.');
      case 'duane':
        if (v === 'look') return say(f.duaneAwake ? 'Duane, awake, red-eyed, holding second place like a grudge.' : 'A regular, asleep on a table with his arm around a trophy. He snores on the beat.');
        if (v === 'talk') {
          if (!f.duaneAwake) return say('Duane snores. Something about being robbed.');
          if (f.duaneTold) return say('"Twenty past nine. Marguerite. One shoe," says Duane. "Now let me grieve."');
          return say('"Robbed," says Duane. "ROBBED. Some guy comes in at four with a sack of tokens and a VOICE and takes my goat. My goat! Who was he? Show me who he was."');
        }
        return say('Duane is not in a touching mood.');
      case 'polaroids':
        if (v === 'look') return say('A wall of Polaroids: every winner of the all-night sing-off since 2009. The newest shows Benny, 5:31 AM, holding a goat on a lead and a microphone, mid-note. Earl has written WINNER on it.');
        if (v === 'take' || v === 'use' || v === 'search') { if (f.gotPolaroid) return say('You already have Benny\'s Polaroid. The others are strangers with goats.'); f.gotPolaroid = true; give('polaroid'); return say('You peel Benny\'s Polaroid off the wall. Nobody stops you. Earl notices. Earl notices everything.'); }
        return say('Winners, all of them. Not one of them looks happy about it.');
      case 'earl':
        if (v === 'look') return say('Big Earl. Six foot four, apron, reading glasses on a chain. He has the face of a man who has heard every story and the ledger to prove it.');
        if (v === 'talk') {
          if (!f.isRegular) return say('Earl doesn\'t look up. "I talk to regulars." You are not, apparently, a regular.');
          if (!f.cageOpen) return say('"You sang," Earl concedes. "Didn\'t say you sang well. What do you want?" You open your mouth. He raises a hand. "Show me paper or buy a drink."');
          if (!f.gotLeads) { f.gotLeads = true; give('leads'); return say('"Anything else?" You mention the truck. Earl sighs, reaches under the bar and hands you a pair of jump leads. "Your pink truck\'s been blocking my alley since three. Flat battery, from the jingle. Bring these back never."'); }
          return say('"Ledger\'s in the cage," says Earl. "Goat was fair and square. Ring was sold at four past nine to a lady who looked at me like I\'d stolen it. That\'s all I know and more than I usually say."');
        }
        return say('Earl does not do that. Earl does words, and only some of them.');
      case 'counter': if (v === 'look') return say('A bar polished by elbows. There is a ring-shaped stain near the end that you choose not to think about.'); return say('You lean on the bar. It holds.');
      case 'cage':
        if (v === 'look') return say(f.cageOpen ? 'The pawn cage, unbarred. Earl\'s ledger is on the counter inside.' : 'The pawn cage, barred. Behind the bars: a shelf of other people\'s bad nights.');
        if (!f.cageOpen) return say('Barred. Earl keeps the only key on a chain with his glasses.');
        E.gotoRoom('cage', 24, 150, 1); return;
      case 'alley': if (v === 'look') return say('The back door. Through the little window: a pink truck, parked with conviction.'); E.gotoRoom('alley', 200, 150, -1); return;
      case 'exit': if (v === 'look') return say('The front door to Tarpon Street. Mr. Sprinkles is round the back, in the alley.'); return say('You step out front. Blinding sun, no truck. Mr. Sprinkles is in the alley. You step back in.');
      default: return say("You can't do that here.");
    }
  };
  HANDLERS.cage = (v, o, it) => {
    const f = F();
    if (it) {
      if (it === 'polaroid' && o === 'earl2') { f.earlDistracted = true; return say('You hold the Polaroid up to the window. "Is that—" Earl leans in. "Is that my goat on MY stage? Give me that." He studies it closely. His thumb has left the ledger.'); }
      if (o === 'earl2') return say('Earl shakes his head through the window. "Keep it."');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('You are standing in a pawn cage with a man\'s thumb on the information you need.');
      case 'ledger':
        if (v === 'look') return say(f.gotPage ? 'The ledger, one page lighter.' : f.earlDistracted ? 'The ledger lies open. This morning\'s page: a ring, three stones, SOLD, 9:04 AM.' : 'Earl\'s ledger. His thumb is on today\'s page. "Customers\' business is private," he says, without looking.');
        if (f.gotPage) return say('You have the page. Earl will notice eventually. Eventually is fine.');
        if (!f.earlDistracted) return say('You reach for the ledger. The thumb does not move. "Private," says Earl.');
        f.gotPage = true; give('page'); pts('ledger');
        return say('While Earl squints at his own goat, you tear this morning\'s page out of the ledger. 9:04 AM. Ring, gold, three stones. SOLD. Buyer: "D. H., lilac hat, paid cash, did not haggle, looked at me like I\'d stolen it."');
      case 'receiptbook': if (v === 'look') return say('Earl\'s receipt book. The carbon of 4:02 AM: one ring in, one tab cleared, six tokens out. Benny\'s signature is mostly enthusiasm.'); return say('The carbons stay. You have your copy.');
      case 'shelf':
        if (v === 'look') { f.sawShelf = true; return say('Other people\'s bad nights, priced to move: a tuba mouthpiece, a single sunglasses lens that is unmistakably yours, and a lilac feather caught on a nail, the kind that falls off a very serious hat.'); }
        return say('Look first. There\'s a lot here.');
      case 'feather': if (v === 'look') return say('A lilac feather. Dyed, expensive, caught on a nail at hat height. Somebody leaned in close to look at a ring.'); f.gotFeather = true; give('feather'); pts('feather-pick'); return say('You take the lilac feather. D. H. was here, and she was wearing a hat with opinions.');
      case 'lens': if (v === 'look') return say('The missing lens from your sunglasses. Earl has priced it at $4.'); if (f.gotLens) return say('Both lenses in. The world is 100% clearer and no better.'); f.gotLens = true; return say('You take your lens and click it back into your sunglasses. The world is 50% clearer. Earl says nothing. You owe him $4.');
      case 'earl2': if (v === 'look') return say('Earl through the cage window, thumb on the ledger, eyes on you.'); if (v === 'talk') return say(f.earlDistracted ? '"Nice goat," says Earl, to the photo.' : '"Private," says Earl, before you ask.'); return say('There are bars between you and Earl. Earl likes it that way.');
      case 'counter2': return say('A glass counter full of watches that stopped at bad moments.');
      case 'cagedoor': E.gotoRoom('bar', 268, 150, -1); return;
      default: return say("You can't do that here.");
    }
  };
  HANDLERS.alley = (v, o, it) => {
    const f = F();
    if (it) {
      if (it === 'leads' && (o === 'hood' || o === 'truck')) { if (f.truckStarted) return say('It\'s running. Leave it.'); f.truckStarted = true; drop('leads'); pts('jingle'); return say('You clip Earl\'s leads to the terminals and to a car that isn\'t yours. Mr. Sprinkles coughs, catches, and the jingle starts by itself. Of course it does.'); }
      if (it === 'keys' && (o === 'hood' || o === 'truck')) return say(f.truckStarted ? 'Running. Jingling. Ready.' : 'Click. Click. Nothing. The battery gave everything it had to the jingle.');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('You, in an alley, at eleven in the morning. Progress.');
      case 'hood': if (v === 'look') return say(f.truckStarted ? 'The engine runs. The hood is warm.' : 'Under the hood: a battery as flat as the beer in the bins. An hour of jingle will do that.'); return say(f.truckStarted ? 'Leave it running.' : 'It needs a jump. Earl might have leads, if Earl were speaking to you.');
      case 'truck':
        if (v === 'look') return say(f.truckStarted ? 'Mr. Sprinkles, running, jingling, pink.' : 'Mr. Sprinkles, parked across the alley at an angle only you could have achieved. The battery is dead.');
        if (v === 'use') return say(f.truckStarted ? 'The truck is ready. Where to?' : 'Click. Click. Nothing. The battery gave everything it had to the jingle.');
        return say('Pink. Very pink.');
      case 'bins': if (v === 'look') return say('Bins. Oyster shells, bottles, a bow tie that is not the goat\'s.'); if (v === 'search') return say('You search the bins. Nothing but regret and a quantity of oyster shells.'); return say('No.');
      case 'bottle': if (v === 'look') return say('A bottle with no label and a liquid with no colour. It is sweating.'); if (v === 'drink' || v === 'use' || v === 'take' || v === 'eat') return E.die('You take a swig from the mystery bottle, because last night taught you nothing.\n\nIt was not a drink.'); return say('Leave it.');
      case 'bardoor': E.gotoRoom('bar', 296, 150, -1); return;
      case 'street':
        if (v === 'look') return say('Tarpon Street, and beyond it the boardwalk and the sea. You can smell churros from here.');
        if (!f.truckStarted) return say('You could walk, but Benny took the car and you took the truck, and the truck is the only thing in Port Lucky you\'re sure is yours.');
        if (!f.duaneTold) return say('You don\'t know where Benny went yet. Somebody in that bar does.');
        if (!f.gotPage || !f.gotFeather) return say('You know the ring was sold. You don\'t know to whom. The cage knows.');
        return say('You drive Mr. Sprinkles out of the alley with the jingle playing and the whole street turning to look. Next stop: Sunny Side Pier, where, according to Earl, "most of your stuff ended up".', () => startChapter(4));
      default: return say("You can't do that here.");
    }
  };

  // ---------- Chapter 4: Boardwalk ----------
  HANDLERS.pier = (v, o, it) => {
    const f = F(); const g = G();
    if (it) {
      if (it === 'keys' && (o === 'sal' || o === 'deckchair')) { if (f.salDeal) return say('Sal already has his truck back.'); drop('keys'); f.salDeal = true; pts('sal-deal'); return say('You hand Sal his keys. He weighs them in his hand, looks at the watch on his wrist, and does not take it off. "Truck\'s a start. The watch stays with me till I see a goat. You said goat. I remember goat."'); }
      if (it === 'wallet' && o === 'sal') return say('"I don\'t want your eleven dollars," says Sal. "I want my truck and the goat you promised me at three in the morning."');
      if (it === 'wallet' && (o === 'nadia' || o === 'stand')) {
        if (f.gotPhone) return say('"We\'re square, honey," says Nadia.');
        if (g.money < 1100) return say('Nadia counts what\'s in it. "That\'s not eleven dollars. That\'s a photo of two kids."');
        g.money -= 1100; f.gotPhone = true; give('phone'); E.renderInv(); pts('phone-back');
        return say('You pay Nadia eleven dollars for nine churros you don\'t remember. She hands over your phone. "Forty-one texts, honey. I didn\'t read them. I read some of them."');
      }
      if (it === 'plush' && (o === 'nadia' || o === 'stand')) {
        if (f.gotPhone) return say('"Keep it," says Nadia. "You look like you need a friend."');
        drop('plush'); f.gotPhone = true; give('phone'); pts('phone-back-dolphin'); pts('nadia-dolphin');
        return say('Nadia looks at the plush dolphin. "Flipper 2? My daughter has Flipper 1 and 3." The tab is forgotten. She hands you your phone and keeps the dolphin. "Forty-one texts, honey."');
      }
      if (it === 'quarters' && (o === 'nadia' || o === 'stand')) return say('"I don\'t take quarters," says Nadia. "This is a churro stand, not a laundromat."');
      if (it === 'quarters' && (o === 'zora' || o === 'booth')) {
        if (f.gotFortune) return say('"One fortune per customer," says Zora. "Two would be greedy."');
        if (g.quarters < 1) return say('No quarters left.');
        g.quarters -= 1; f.gotFortune = true; give('fortune'); E.renderInv(); pts('zora');
        return say('Zora takes the quarter without looking at it. "You again. You tipped me a tuba." She turns a card. "The one you seek is on the water. Also, you will need the tuba." She hands you the card. "I saw you last night. I\'m not psychic about that part."');
      }
      if (it === 'churro' && o === 'gulls') return say('You hold up the churro. Forty gulls hold their breath. You lower the churro. Not here.');
      if (it === 'churro' && o === 'me' && v === 'eat') return E.die('You bite the churro. Forty gulls bite you.\n\nPort Lucky\'s gulls have been waiting all morning for a man who smells like a minibar.');
      if (it === 'churro' && (o === 'sal' || o === 'nadia' || o === 'zora')) return say('Nobody on this pier wants a churro from you. The gulls would like a word.');
      if (it === 'phone' && o) return usePhone();
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('You check yourself in the churro stand\'s steel. One lens or two, the shirt is still the shirt.');
      case 'sal':
        if (v === 'look') return say('Sal. Sixty, sunburnt, in a deckchair with a tyre iron across his knees. He is wearing your grandfather\'s watch. He has been waiting since dawn to discuss it.');
        if (v === 'talk') {
          if (!f.salTalked) { f.salTalked = true; pts('sal-talk'); return say('"Three AM," says Sal. "You give me a watch for my truck, you say \'I\'ll bring you a GOAT,\' you drive off playing the jingle. No truck. No goat. I keep the watch." He taps it. "Nice watch."'); }
          if (!f.salDeal) return say('"Truck first," says Sal. "Then the goat. Then we talk about the watch."');
          return say('"Goat," says Sal, patiently. "You said goat."');
        }
        return say('Sal lifts the tyre iron one inch. You reconsider.');
      case 'deckchair': return say('A deckchair with Sal in it. The two have become one.');
      case 'tyreiron': if (v === 'look') return say('A tyre iron. Sal\'s. Sal\'s grip on it tightens whenever you look at it.'); return say('Sal tightens his grip. You un-reach.');
      case 'sign': return say('ICE CREAM, in pink. Below it, an empty parking space with a sign that says RESERVED: MR. SPRINKLES.');
      case 'nadia':
        if (v === 'look') return say('Nadia runs the churro stand. She has your phone in her apron pocket and the patience of a woman who has met you before.');
        if (v === 'talk') {
          if (!f.nadiaTalked) { f.nadiaTalked = true; pts('nadia-debt'); return say('"Nine churros," says Nadia. "Eleven dollars. You left your phone as security and told me your friend was \'at the goat place\'." She pats her apron. "Pay the tab, get the phone." She nods at the arcade. "My daughter\'s in there. She collects those dolphins."'); }
          if (!f.gotPhone) return say('"Eleven dollars, honey. Or make my daughter\'s day."');
          return say('"Call your friend\'s fiancée," says Nadia. "She sounds nice. She sounds furious, but nice."');
        }
        return say('Nadia raises an eyebrow. The eyebrow has seen things.');
      case 'stand': return say('A churro stand with a sign: NO TABS. Under it, in marker: EXCEPT DEX. Under that: NEVER AGAIN.');
      case 'churros':
        if (v === 'look') return say('Churros the length of your forearm, dusted with sugar. The gulls on the rail are watching them, and you.');
        if (v === 'take' || v === 'use') { if (f.gotChurro) return say('"That\'s ten," says Nadia. You put it back. You keep the one you have.'); f.gotChurro = true; give('churro'); return say('You take a churro. "That\'s ten," says Nadia, without turning round. The gulls shift on the rail.'); }
        if (v === 'eat') return say('Not in front of the gulls.');
        return say('Sugar, dough, danger.');
      case 'zora': if (v === 'look') return say('Madame Zora, in a booth of velvet and incense. Her sign says SEES ALL. Her eyes say SAW YOU.'); if (v === 'talk') return say(f.gotFortune ? '"The water," says Zora. "Go."' : '"A quarter, dear," says Zora. "Even the future has overheads."'); return say('Zora watches you. She charges for that too, normally.');
      case 'booth': if (v === 'look') return say('MADAME ZORA. FORTUNES 25¢. A coin slot in the counter, worn smooth by the hopeful.'); return say('The slot wants a quarter.');
      case 'arcade': if (v === 'look') return say('The arcade. Through the door: a claw machine with something in it that looks a lot like your wallet.'); E.gotoRoom('arcade', 296, 150, -1); return;
      case 'gulls': if (v === 'look') return say('Forty gulls on the rail, shoulder to shoulder, staring at the churro stand like a jury.'); return say('The gulls do not move. The gulls have numbers.');
      case 'bench': if (v === 'sit' || v === 'use') return say('You sit. For four seconds you feel like a person on holiday. Then you remember.'); return say('A bench with a plaque: IN MEMORY OF A VERY GOOD DOG.');
      case 'bin': if (v === 'search') return say('You search the bin. Churro paper. So much churro paper.'); return say('A bin. Fuller than it was last night.');
      case 'marina':
        if (v === 'look') return say('The path to the marina at the end of the pier. Boats, a bait shop, and the water Zora mentioned.');
        if (!f.salDeal) return say('Sal would follow you. Sal has a tyre iron. Settle with Sal.');
        if (!f.gotWallet || !f.gotPhone) return say('You\'re not walking away from your own wallet and phone. They\'re on this pier somewhere.');
        if (!f.gotFortune) return say('You have no idea where Benny went. The only person on this pier who claims to know charges a quarter.');
        if (!f.calledKevin) return say('Zora said you\'d need the tuba. The tuba is at the Royale. You have a phone with 4% battery and one person who\'s scared enough of you to deliver.');
        return say('You walk to the end of the pier with a churro in your pocket, a fortune in your hand and four percent battery. The marina smells of diesel and hope.', () => startChapter(5));
      default: return say("You can't do that here.");
    }
    function usePhone() {
      if (!has('phone')) return;
      if (f.calledKevin) return say('1% battery. Enough for one more emergency, and you know this day has one in it.');
      E.choose('4% battery. One call. Who?', [
        { label: 'Kevin (DO NOT)', value: 'kevin' }, { label: 'Lucy (41 texts)', value: 'lucy' }, { label: 'Mom', value: 'mom' }, { label: 'Nobody yet', value: 'no' }
      ]).then(c => {
        if (c === 'kevin') { f.calledKevin = true; pts('kevin-call'); return say('Kevin picks up on the first ring. "Sir? Sir, no." You explain about the tuba. There is a long silence. "The marina. Twenty minutes. Please stop calling this number." The battery drops to 1%.'); }
        if (c === 'lucy') { f.calledLucy = true; return say('You call Lucy. It rings once. You hang up. You cannot do this to her over the phone, and you cannot do it with 3% battery either. The screen says 2%.'); }
        if (c === 'mom') return E.die('You call Mom. She asks about Benny. You tell her. She drives down from Jacksonville, arrives at the wedding, and the ceremony is replaced by a two-hour conversation.\n\nBenny marries Lucy next spring. You are not invited.');
        say('You put the phone away. 4% is a resource now.');
      });
    }
  };
  HANDLERS.arcade = (v, o, it) => {
    const f = F(); const g = G();
    if (it) {
      if (it === 'quarters' && (o === 'claw' || o === 'clawglass' || o === 'walletglass')) {
        if (f.walletInChute || f.gotWallet) return say('The claw machine is empty now. It feels smug about it.');
        if (g.quarters < 4) return say('The claw wants four quarters. You don\'t have four quarters.');
        g.quarters -= 4; E.renderInv(); if (!f.clawTried) { f.clawTried = true; pts('claw-fail'); }
        return say('Four quarters. The claw descends, closes around your wallet with real confidence, lifts it two inches, and lets go. It has been trained to do that. Tyler watches, unmoved.');
      }
      if (it === 'wallet' && o === 'change') return say('The change machine wants a bill. The wallet wants to keep its bills. You side with the wallet.');
      return rejoin(it, o);
    }
    if (o === 'walletglass' && f.walletInChute) o = 'chute';
    if (v === 'hit' && (o === 'claw' || o === 'clawglass' || o === 'walletglass')) return E.die('You take the strength-test hammer to the claw machine. The glass holds. Tyler does not. Tyler\'s dad owns the pier.\n\nYou are escorted off it, and out of the story.');
    switch (o) {
      case 'me': return say('In the claw machine glass: a man who has lost his wallet to a crane.');
      case 'walletglass': if (v === 'look') return say('Your wallet, on top of a pile of plush dolphins, inside a claw machine. You can see the photo of you and Benny through the glass. Both of you look disappointed.'); return say('The glass is in the way. The glass is always in the way.');
      case 'clawglass': if (v === 'look') return say('Thick glass. A sticker: DO NOT HIT GLASS. Underneath, smaller: THIS MEANS YOU.'); if (v === 'use' || v === 'take') return say('You push on the glass. It pushes back.'); return say('Glass.');
      case 'claw':
        if (v === 'look') return say(f.walletInChute ? 'The claw machine, shaken empty. The wallet and a dolphin are in the chute.' : 'A claw machine, rigged like all claw machines. It takes four quarters and gives back lessons. It shares a wall with the test-your-strength tower.');
        if (v === 'use' || v === 'take') return say(f.walletInChute ? 'Check the chute.' : 'Four quarters a go. Or think about what else shakes this wall.');
        return say('The claw hangs there, innocent.');
      case 'chute':
        if (v === 'look') return say(f.walletInChute && !f.gotWallet ? 'Your wallet and a plush dolphin, delivered.' : f.gotWallet ? 'Empty.' : 'An empty prize chute. It has been empty for years.');
        if (!f.walletInChute) return say('Nothing in the chute. Nothing ever is.');
        if (f.gotWallet) return say('Empty now.');
        f.gotWallet = true; f.gotPlush = true; g.money = 2100; give('wallet'); give('plush'); E.renderInv(); pts('claw-win');
        return say('You take your wallet out of the chute: library card, the photo, and twenty-one dollars, which is more than you expected and less than you need. A plush dolphin comes with it. Its tag says FLIPPER 2.');
      case 'bell': if (v === 'look') return say('The bell at the top of the strength tower. It is bolted to the same wall as the claw machine. Ring it and the whole wall hums.'); return say('You can\'t reach the bell. That\'s what the hammer is for.');
      case 'strength': if (v === 'look') return say('TEST YOUR STRENGTH. The scale runs from "Churro" to "Hero". The claw machine is bolted to the same wall.'); return say('Use the hammer.');
      case 'hammer':
        if (v === 'look') { f.hammerTip = true; return say('A padded hammer on a chain. Someone has scratched into the handle: HIT THE BACK EDGE. The front edge is where everyone hits it, which is why nobody rings the bell.'); }
        if (v === 'take' || v === 'use' || v === 'play') {
          if (f.bellRung) return say('You ring the bell again, for the crowd. There is no crowd.');
          f.hammerSwings = (f.hammerSwings || 0) + 1;
          if (!f.hammerTip) return say(f.hammerSwings === 1 ? 'You swing. The puck rises to "Churro" and falls. Tyler does not look up.' : 'You swing. "Churro" again. There must be a trick to it.');
          if (f.hammerSwings < 3) return say(f.hammerSwings === 1 ? 'Back edge. The puck rises to "Decent". Closer.' : 'Back edge, harder. The puck kisses "Hero" and drops. One more.');
          f.bellRung = true; f.walletInChute = true;
          return say('You hit the back edge with everything the day has left in you. The puck flies, the bell rings, the wall hums, and inside the claw machine the plush pile shifts. Your wallet slides down into the chute. A dolphin follows it. Tyler looks up.');
        }
        return say('The hammer waits on its chain.');
      case 'change':
        if (v === 'look') return say('A change machine. A dollar bill is stuck halfway into the slot, abandoned by someone with less patience than you. There is a COIN RETURN button.');
        if (v === 'use' || v === 'take' || v === 'search') { if (f.gotQuarters) return say('The change machine has given all it is going to give.'); f.gotQuarters = true; g.quarters = 40; give('quarters'); E.renderInv(); pts('quarters'); return say('You press COIN RETURN. The machine thinks about it, swallows the stuck dollar, and pays out a full roll of quarters. Someone\'s dollar, someone\'s problem, your quarters.'); }
        return say('It hums.');
      case 'tyler': if (v === 'look') return say('Tyler, seventeen, behind the prize counter, has achieved a level of boredom that borders on enlightenment.'); if (v === 'talk') return say('"I can\'t open the claw," says Tyler, before you ask. "I can\'t give refunds. I can\'t call anyone. My dad owns the pier." He goes back to his phone.'); return say('Tyler does not react. Tyler may not be able to.');
      case 'prizes': return say('A shelf of prizes nobody has ever won: a lava lamp, a keyboard with no E, a framed photo of the arcade.');
      case 'pcounter': return say('The prize counter. Tickets in, disappointment out.');
      case 'out': E.gotoRoom('pier', 280, 150, -1); return;
      default: return say("You can't do that here.");
    }
  };

  // ---------- Chapter 5: Marina ----------
  HANDLERS.dock = (v, o, it) => {
    const f = F(); const g = G();
    if (it) {
      if (it === 'quarters' && o === 'telescope') return useTelescope();
      if (it === 'churro' && (o === 'oscar' || o === 'baitshop')) {
        if (f.gullsGone) return say('The gulls are gone. Oscar is fine. Eat it yourself, somewhere with a roof.');
        drop('churro'); f.gullsGone = true; pts('oscar-bait');
        if (!f.gotOars) { f.gotOars = true; give('oars'); pts('oars'); }
        return say('Oscar takes the churro, looks at the gulls on his bait tanks, and throws it the length of the far jetty. Forty gulls go after it like a verdict. "First quiet minute since dawn," says Oscar, and hands you the oars.');
      }
      if (it === 'wallet' && (o === 'oscar' || o === 'baitshop')) return say(g.money >= 4000 ? 'Oscar takes forty dollars and gives you the oars.' : `"Forty," says Oscar. "That's ${g.money ? '$' + (g.money / 100).toFixed(0) : 'nothing'}. Try again, or do something about my gulls."`);
      if (it === 'quarters' && (o === 'oscar' || o === 'baitshop')) return say('"I\'m not a parking meter," says Oscar.');
      if (it === 'rope' && o === 'dinghy') { f.ropeOnDinghy = true; return say('You tie the rope to the dinghy\'s bow ring with a knot you learned at nine and have not used since.'); }
      if (it === 'rope' && (o === 'cleat' || o === 'marguerite')) {
        if (!f.ropeOnDinghy) return say('Tie the other end to something first. The dinghy, say.');
        f.ropeTied = true; drop('rope'); pts('rope-tie'); return say(o === 'marguerite' ? 'Marguerite takes the rope, loops it twice round the cleat and ties it off without looking. "Thirty feet," she says. "Don\'t go thirty-one."' : 'You tie the rope off on the cleat. Marguerite checks the knot, retie it, and nods. "Thirty feet. Don\'t go thirty-one."');
      }
      if (it === 'oars' && o === 'dinghy') { f.oarsIn = true; drop('oars'); return say('You drop the oars into the oarlocks. The dinghy now has everything a dinghy needs except a reason to trust you.'); }
      if (it === 'phone' && o) return usePhoneDock();
      if (it === 'fortune' && o === 'marguerite') return say('Marguerite reads the card. "On the water. Well. She\'s not wrong."');
      if (it === 'churro' && o === 'gus') return say('Gus eats half the churro before you can stop him. You stop him. You will need the other half.');
      if (o === 'gus') return say('Gus sniffs it and loses interest. Gus is a goat of specific tastes.');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('You smell of churro and diesel. Marguerite can tell.');
      case 'marguerite':
        if (v === 'look') return say('Captain Marguerite, in a cap that has seen weather, standing beside an empty mooring with her arms crossed hard enough to hurt.');
        if (v === 'talk') {
          if (!f.sawPontoon) return say('"The Lady Lucinda," says Marguerite, "is a forty-foot party pontoon, and she is GONE, and the last man aboard her was crying and wearing one shoe. Friend of yours?" You admit it. "Then find my boat."');
          if (!f.hauledIn) return say('"That\'s her, past the breakwater," says Marguerite. "That current will put a rowing boat on the rocks in under a minute. If you go, go on a line."');
          return say('"Pickup\'s this way," says Marguerite.');
        }
        return say('Marguerite does not do hugs.');
      case 'cleat': if (v === 'look') return say('A dock cleat, big enough to tie a pontoon to. The pontoon in question is not here.'); return say('A cleat is for rope.');
      case 'kevin': if (v === 'look') return say('Kevin, with a luggage trolley, a tuba and a goat, in that order of distress.'); if (v === 'talk') return say(f.hauledIn ? '"Please can I go now, sir."' : '"I brought the tuba, sir. The goat followed me. It was in the back of the truck the whole time. I didn\'t know. I don\'t want to know."'); return say('Kevin flinches.');
      case 'tuba':
        if (v === 'look') return say('The tuba, on a luggage trolley, gleaming. Gus has positioned himself as far from it as his lead allows.');
        if (v === 'use' || v === 'play' || v === 'take') {
          if (!f.gullsGone) { f.gullsGone = true; if (!f.gotOars) { f.gotOars = true; give('oars'); pts('oars'); } return say('You blow into the tuba. The gulls on Oscar\'s bait tanks leave in one movement, like a decision. Gus bolts to the end of his lead. Oscar leans out of his hatch. "Whatever that was, do it again tomorrow," he says, and hands you the oars.'); }
          return say('You play the tuba. Gus strains at his lead toward the far end of the dock. Interesting.');
        }
        return say('It is too heavy to carry anywhere useful.');
      case 'trolley': return say('A Palmetto Royale luggage trolley. Kevin will be in trouble for this. Kevin knows.');
      case 'gus':
        if (v === 'look') return say('Gus, tied to a bollard, chewing Kevin\'s name tag. He keeps one eye on the tuba.');
        if (v === 'talk') return say('"Meh." It is the friendly one.');
        if (v === 'take' || v === 'use') return say('Gus will not get in a dinghy. Gus has made this clear with his whole body.');
        return say('Gus chews.');
      case 'oscar':
        if (v === 'look') return say('Oscar, in the hatch of the bait shop, surrounded by gulls and bitterness.');
        if (v === 'talk') {
          if (!f.oscarTalked) { f.oscarTalked = true; pts('oscar-talk'); return say('"Oars?" says Oscar. "I\'m holding them against your tab. Forty dollars." You don\'t remember a tab. "Two in the morning, you bought every man on this dock a bucket of shrimp." He waves at the gulls on his tanks. "And look what it brought."'); }
          if (!f.gotOars) return say('"Forty dollars," says Oscar, "or get these gulls off my bait and we\'ll call it square."');
          return say('"Quiet," says Oscar, happily. "Listen to that."');
        }
        return say('Oscar is busy hating gulls.');
      case 'baitshop': if (v === 'look') return say('OSCAR\'S BAIT. Shrimp, squid, ice, and a pair of oars behind the counter with a tag that says DEX.'); return say('Oscar runs the shop. Talk to Oscar.');
      case 'telescope': if (v === 'look') return say('A coin-operated telescope pointed at the horizon. 25¢ for ninety seconds of looking at water.'); return useTelescope();
      case 'flarebox': if (v === 'look') return say('A flare box, padlocked. A sign: NOT FOR CELEBRATIONS. Someone has underlined it twice.'); return say('Padlocked. Marguerite has the key and no sense of humour about it.');
      case 'pump': if (v === 'look') return say('A diesel pump. The handle is sticky.'); if (v === 'drink' || v === 'eat') return E.die('You were thirsty. It was diesel.\n\nMarguerite puts the fire out, eventually.'); if (v === 'use') return say('You do not need diesel. You need a boat.'); return say('A pump.');
      case 'rope': if (v === 'look') return say('A coil of marina rope, thirty feet or so, left where someone stopped caring about it.'); f.gotRope = true; give('rope'); return say('You take the rope. It is heavier than it looks and smells of every boat it has ever touched.');
      case 'dinghy':
        if (v === 'look') return say(f.oarsIn ? 'A dinghy with oars, a line to the dock and a bad feeling about the current.' : 'A dinghy tied to the dock. Two oarlocks, no oars. A sticker on the transom: OSCAR\'S. ASK.');
        if (!f.sawPontoon) return say('You could row out. Where to? The sea is large and Benny is small.');
        if (!f.oarsIn) return say('No oars. The oarlocks are very clear about this.');
        if (!f.ropeTied) return E.die('You row out hard. The current takes the dinghy the moment you clear the dock and introduces you to the breakwater. Repeatedly.\n\nMarguerite says she warned you. She did.');
        if (f.hauledIn) return say('You\'ve done enough rowing for one wedding.');
        if (!f.rowedOut) { f.rowedOut = true; pts('row'); }
        E.gotoRoom('pontoon', 40, 158, 1); say('You row out on the line. The current pulls, the rope holds, and the Lady Lucinda drifts into reach with a tuxedo shoe on her rail.'); return;
      case 'sign': return say('NO HORNS AFTER 10 PM. Underneath, in marker: THAT MEANS TUBAS.');
      case 'water': if (v === 'look') return say(f.sawPontoon ? 'The pontoon is out there past the breakwater, drifting, one shoe on the rail.' : 'Water. A lot of it. Zora said he was on it, which narrows it down to the ocean.'); return say('Cold, deep, uninterested.');
      case 'breakwater': if (v === 'look') return say('The breakwater: wet black rocks and a current that bends around them like it has somewhere to be.'); return E.die('You climb onto the breakwater for a better look. The rocks are wet. The current knows this coastline better than you do.\n\nIt introduces you to the rocks, repeatedly.');
      default: return say("You can't do that here.");
    }
    function useTelescope() {
      if (f.sawPontoon) return say('You look again. Still there. Still drifting. Still Benny.');
      if (!has('quarters') || g.quarters < 1) return say('It wants a quarter.');
      if (!f.gotFortune) { g.quarters -= 1; E.renderInv(); return say('A quarter. You look at the horizon. It is a horizon. Without a reason to look somewhere in particular, you look everywhere and see nothing.'); }
      g.quarters -= 1; f.sawPontoon = true; E.renderInv(); pts('telescope');
      return say('A quarter. "On the water," said Zora, so you sweep the water. Past the breakwater, drifting broadside, a party pontoon with a disco light on a pole and one tuxedo shoe hanging off the rail. Benny.');
    }
    function usePhoneDock() { return say(f.hauledIn ? 'No battery left. It gave its last percent to a tuba.' : '1% battery. Save it for an emergency. You are not in the emergency yet.'); }
  };
  HANDLERS.pontoon = (v, o, it) => {
    const f = F();
    if (it) {
      if (it === 'icewater' && o === 'benny') { if (f.bennyAwake) return say('Benny is awake. Mostly. Don\'t.'); drop('icewater'); f.bennyAwake = true; pts('wake'); return say('You pour a cooler of ice water over the groom. Benny comes up out of the lifejackets like a man surfacing from a lake. "DEX. Dex. I pawned the ring. I pawned LUCY\'S RING." You know. You tell him you know. He lies back down, but his eyes stay open.'); }
      if (it === 'shoe2' && o === 'benny') { if (!f.bennyAwake) return say('You put the shoe near his foot. He sleeps on. The shoe waits.'); drop('shoe2'); f.bennyInBoat = true; return say('You hand Benny his right shoe. He puts it on, looks at the dinghy, looks at you, and gets in. "We\'re going to be late," he says. "We\'re going to be the right amount of late," you say, with no evidence.'); }
      if (it === 'shoe' && o === 'benny') return say('The left one you\'ll deal with later. He needs the right one. It\'s on the rail.');
      if (it === 'phone' && o) return usePhonePontoon();
      if (it === 'fortune' && o === 'benny') return say('"The one you seek is on the water," Benny reads. "That\'s me. I\'m the one." He is quite pleased.');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('Wet to the knees, in a dinghy, holding a shoe. Best man.');
      case 'benny':
        if (v === 'look') return say(f.bennyAwake ? 'Benny, awake, soaked, in one shoe, a groom in the loosest sense.' : 'Benny, asleep under a pile of lifejackets, sunburnt on one side, wearing one tuxedo shoe and the expression of a man who has solved nothing.');
        if (v === 'talk') {
          if (!f.bennyAwake) return say('"Mmf," says Benny. "Lucy\'s mum. The goat. Mmf." He rolls over. He will need more than words.');
          if (!f.bennyInBoat) return say('"I can\'t go back with one shoe," says Benny. "She\'ll know. Her mother will KNOW."');
          return say('"Dex," says Benny, in the dinghy. "Is the goat okay?"');
        }
        if (v === 'take' || v === 'use') return say(f.bennyAwake ? 'He\'ll walk. Give him a reason, and a shoe.' : 'He is eleven stone of asleep. Try waking him.');
        return say('Benny does not respond.');
      case 'lifejackets': if (v === 'look') return say('Eight lifejackets, one groom.'); if (v === 'take' || v === 'search') return say('You pull the lifejackets off him. Benny, underneath, is wearing a sign that says GROOM and one shoe.'); return say('Orange. Buoyant. Not helping.');
      case 'cooler': if (v === 'look') return say('A cooler of melted ice. Very cold. Very wake-uppy.'); f.gotIcewater = true; give('icewater'); return say('You take the cooler. It sloshes. It is ambitious cold.');
      case 'logbook': if (v === 'look') return say('Marguerite\'s logbook, open at last night. The handwriting is furious.'); f.gotLog = true; f.knowsLucinda = true; give('logpage'); return say('You tear out last night\'s page. 1:10 AM: two gentlemen, one tuba. 6:05 AM: returned with one goat. 9:25 AM: gentleman #1 came back alone, crying, "somewhere to think". 10:40 AM: anchor dragged. So he didn\'t run. He came out here to think, and the boat left without asking.');
      case 'crate': return say('A crate of party supplies. Streamers, a horn, no answers.');
      case 'winch': if (v === 'look') return say('The anchor winch, jammed, with the chain pulled tight and humming.'); if (v === 'use' || v === 'take') return E.die('The jammed anchor winch un-jams. It takes your sleeve, your arm, and your afternoon.'); return say('Leave it.');
      case 'shoe2': if (v === 'look') return say('Benny\'s right shoe, hooked over the rail by its heel, as if he took it off to think better.'); f.gotShoe2 = true; give('shoe2'); pts('shoe-pair'); return say('You take the right shoe. Now you have a pair. Now you nearly have a groom.');
      case 'rail': return say('A rail with a shoe on it, or with a shoe recently removed from it.');
      case 'discolight': if (v === 'use') return say('The disco light turns. For a second the pontoon is a party again. Then it isn\'t.'); return say('A disco light on a pole. The Lady Lucinda was a party before she was a problem.');
      case 'dinghy':
        if (!f.bennyInBoat) return say('You are not leaving without him. He is the whole point.');
        if (f.hauledIn) return;
        return say('You row. The current rows back. Marguerite can\'t haul two men hand over hand, and the rope goes tight as a guitar string. You are stuck thirty feet from the dock with a groom and 1% battery.');
      default: return say("You can't do that here.");
    }
    function usePhonePontoon() {
      if (!f.bennyInBoat) return say('1% battery. Not yet. Get Benny in the boat first.');
      f.hauledIn = true; pts('haul');
      if (!f.gotLog) { f.gotLog = true; f.knowsLucinda = true; give('logpage'); say('Benny grabs a page out of Marguerite\'s logbook and stuffs it in your pocket. "Proof," he says. "For her mother. That I didn\'t run."'); }
      E.gotoRoom('dock', 60, 150, 1);
      say('1%. You call Kevin. "Play the tuba," you say. "Sir—" "PLAY IT." Across the water, a sound like a lovesick whale. Gus bolts to the end of his lead, the lead is tied to the same cleat as your rope, and the dinghy comes in like it\'s on a winch.');
      say('Benny steps onto the dock in two shoes. Marguerite looks at her pontoon, still out there, and at you. "Pickup," she says. "Royale. Then you owe me a boat."', () => startChapter(6));
    }
  };

  // ---------- Chapter 6: Hartwell suite ----------
  HANDLERS.corridor = (v, o, it) => {
    const f = F();
    if (it) {
      if (it === 'cloche' && o === 'door701') { f.inHartwell = true; drop('cloche'); pts('knock'); E.gotoRoom('hartwell', 290, 150, -1); return say('You hold the cloche in front of you like a shield and knock. "Room service." A pause. The door opens. Dolores Hartwell looks at the cloche, at the Hawaiian shirt, at you. "Dexter." She sighs and steps aside. "Come in. Wipe your feet."'); }
      if (it === 'keycard' && o === 'door702') return say('You are not going back in there. The goat is at the pavilion and the cocktail is still fizzing.');
      if (o === 'door701') return say('You hold it up to the door. The door remains a door.');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('A hotel mirror. You straighten the Hawaiian shirt. It does not help.');
      case 'door701':
        if (v === 'look') return say('Room 701. The Hartwell suite. Through the door, very faintly, the sound of a groom being unwell.');
        if (f.inHartwell) { E.gotoRoom('hartwell', 290, 150, -1); return; }
        return say('You knock. "Go away, Dexter," says Dolores Hartwell, through the door, without raising her voice.');
      case 'door702': if (v === 'look') return say('Room 702. Your suite. The DO NOT DISTURB sign has a hoofprint on it.'); return say('You are not going back in there.');
      case 'cloche': if (v === 'look') return say('A silver room-service cloche over a bowl of soup. Hotel soup. Nobody has missed it.'); f.gotCloche = true; give('cloche'); pts('cloche'); return say('You lift the cloche. The soup is cold. You leave the soup and keep the lid.');
      case 'tray': return say(f.gotCloche ? 'A bowl of cold soup with no lid. The corridor smells of leek.' : 'A room-service tray with a cloche on it. Outside nobody\'s door.');
      case 'cart': return say('A room-service cart. One wheel squeaks. Benny went up in the service lift with Kevin and left a damp trail.');
      case 'window': return say('Through the window, the Seaside Pavilion: an arch, rows of chairs, a string quartet unpacking. The clock on the pavilion says 2:40.');
      default: return say("You can't do that here.");
    }
  };
  HANDLERS.hartwell = (v, o, it) => {
    const f = F();
    if (it) {
      if (it === 'feather' && (o === 'dolores' || o === 'hat')) { drop('feather'); f.featherGiven = true; pts('feather-match'); return say('You hold out the lilac feather. Dolores takes it, turns it over, and fits it back into the hat on the stand without a word. Then: "So you\'ve been to Earl\'s. Good. Sit down."'); }
      if (it === 'page' && o === 'dolores') { f.pageShown = true; return say('She reads the ledger page. "D. H. Lilac hat. Did not haggle." A very small smile. "Of course I bought it. It was my mother\'s. What I want to know is what you were going to tell me about it."'); }
      if (it === 'tea' && (o === 'bathroom' || o === 'benny')) { if (f.bennyUp) return say('Benny has had his tea.'); drop('tea'); f.bennyUp = true; pts('tea'); return say('You pass the cup round the bathroom door. A pause. A sip. A long breath. Benny comes out, grey but upright. Dolores: "He takes it the Hartwell way. Good."'); }
      if (it === 'tea' && o === 'dolores') return say('"That one\'s for him," says Dolores. "I\'ve had mine."');
      if (it === 'logpage' && o === 'dolores') { f.knowsLucinda = true; return say('She reads Marguerite\'s log. "Somewhere to think." She hands it back. "He didn\'t run, then. That matters more than you\'d expect."'); }
      if (it === 'polaroid' && o === 'dolores') return say('"That," says Dolores, looking at the Polaroid, "is my goat." A beat. "On a stage." Another beat. "Winning."');
      if (it === 'ring' && o === 'dolores') return say('"Keep hold of it this time," says Dolores.');
      if (o === 'dolores') return say('Dolores looks at it, then at you. "No, thank you, Dexter."');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('Dolores is looking at you the way she looked at the ring in Earl\'s window.');
      case 'dolores':
        if (v === 'look') return say('Dolores Hartwell, mother of the bride, in an armchair with her handbag on her lap. She has been awake as long as you have and looks considerably better on it.');
        if (v === 'talk') return talkDolores();
        return say('"Dexter," says Dolores. "No."');
      case 'hat': if (v === 'look') return say(f.featherGiven ? 'The lilac hat, complete again.' : 'A lilac hat on the stand. One feather short. You know where the other one is.'); if (v === 'take') return say('You do not take Dolores Hartwell\'s hat.'); return say('A very serious hat.');
      case 'hatstand': return say('A hat stand holding one hat and a great deal of authority.');
      case 'photo': if (v === 'look') { f.sawPhoto = true; return say('A framed photo: a much younger Dolores on a pier with a goat in a bow tie. Underneath: HARTWELL INN, 1994, DOLORES & GUS.'); } return say('It\'s hers. Ask her.');
      case 'teaservice': if (v === 'look') return say('A tea service. One cup poured and untouched. Earl Grey, strong, no sugar. Not for you.'); if (f.gotTea || f.bennyUp) return say('The pot is empty now.'); f.gotTea = true; give('tea'); return say('You take the cup. "That\'s for him," says Dolores, without looking up. You knew that.');
      case 'handbag': if (v === 'look') return say('A handbag on a lap. Whatever is in it is staying in it until she decides otherwise.'); return say('You reach for the handbag. Dolores does not move. You stop reaching. Nobody dies in this suite.');
      case 'bathroom': if (v === 'look') return say('The bathroom door, closed, and behind it the sound of Benny being more honest than he\'s been all day.'); if (v === 'talk') return say('"Dex," says Benny, through the door. "Is she still out there?" Yes. "Is the goat?" No. "Okay."'); return say('Benny needs a minute. And a cup of tea.');
      case 'balcony': if (v === 'look') return say('The balcony over the lawn. The arch is up, the chairs are out, and the clock on the pavilion says 2:52.'); if (v === 'use') return say('You step onto the balcony and lean on the rail. The rail leans back. You step inside. "Nobody dies in my suite, Dexter," says Dolores. "We have a wedding."'); return say('A balcony.');
      case 'exitdoor':
        if (!f.gotRing) return say('You are not leaving this room without the ring. She knows it. You know it.');
        if (!f.bennyUp) return say('You are not leaving the groom in the bathroom either.');
        return say('Dolores stands, straightens Benny\'s collar with two fingers and looks at the clock on the pavilion. "Twelve minutes," she says. "Go."', () => startChapter(7));
      default: return say("You can't do that here.");
    }
    function talkDolores() {
      const opts = [];
      if (!f.coverTried) opts.push({ label: 'Benny\'s at the barber. The ring\'s being cleaned.', value: 'cover' });
      if (!f.hatNoticed) opts.push({ label: 'That\'s a beautiful hat.', value: 'hat' });
      if (f.sawPhoto && !f.photoAsked) opts.push({ label: 'Is that Gus in the photo?', value: 'photo' });
      if (f.featherGiven && f.photoAsked && f.knowsLucinda && !f.gotRing) opts.push({ label: 'Tell her everything.', value: 'truth' });
      opts.push({ label: 'Say nothing yet.', value: 'no' });
      if (f.gotRing) return say('"Twelve minutes, Dexter," says Dolores. "Fewer, now."');
      E.choose('Dolores waits. She is good at it.', opts).then(c => {
        if (c === 'cover') { f.coverTried = true; return say('"The barber," says Dolores. She opens the handbag, takes out a ring with three stones, holds it up to the light, and puts it back. "This ring?" The handbag closes. "Try again when you\'ve something true to say."'); }
        if (c === 'hat') { f.hatNoticed = true; return say('"It is," says Dolores. "It\'s missing a feather. I lost it somewhere this morning, leaning over a pawnbroker\'s counter." She looks at you steadily. "You wouldn\'t know anything about that."'); }
        if (c === 'photo') { f.photoAsked = true; pts('photo'); return say('"That\'s Gus. He was the inn\'s. Earl won him off me in a card game in \'09 and I have not spoken to Earl since." She folds her hands. "Lucy was fourteen. She cried for a week. Benny knows that story. I wondered what he\'d do with it."'); }
        if (c === 'truth') { f.gotRing = true; give('ring'); pts('truth'); return say('So you tell her. The goat, the tuba, the truck, the crackers. Earl\'s, the sing-off, the ring pawned for tokens so Benny could win back a goat for a girl who cried when she was fourteen. The pontoon. The shoe. Everything that makes you look bad, which is most of it.', () => say('Dolores opens the handbag and puts the ring in your hand. "That," she says, "is the first thing anyone\'s told me today that I believed."')); }
        say('You say nothing. Dolores says nothing better.');
      });
    }
  };

  // ---------- Chapter 7: Seaside Pavilion (timed) ----------
  function checkCeremony() {
    const f = F(); const g = G();
    if (f.ceremonyReady) return;
    if (f.bennyDressed && f.earlSettled && f.salSettled && f.ringOnGus && f.hasSpeech) {
      f.ceremonyReady = true; f.margin = Math.ceil(g.clock || 0); E.updateClockUI();
      say(`The quartet lifts their bows. Priya looks at you. You nod. ${Math.floor(f.margin / 60)} minute${Math.floor(f.margin / 60) === 1 ? '' : 's'} and ${f.margin % 60} seconds to spare, which is, as you told Benny, the right amount of late.`, () => startChapter(8));
    }
  }
  function clockTick(sec) {
    const f = F(); if (!f || G().chapter !== 7 || f.ceremonyReady) return;
    if (!f.earlArrived && sec <= 480) { f.earlArrived = true; say('A pickup with PAWN & KARAOKE on the door stops on the lawn. Big Earl gets out and looks around for his goat.'); }
    if (!f.salArrived && sec <= 300) { f.salArrived = true; say('Mr. Sprinkles pulls up beside Earl\'s pickup, jingle playing. Sal gets out. He has come for his goat.'); }
  }
  function clockExpired() {
    E.lastSnap = Object.assign(E.snapshot(), { clock: 120 });
    E.die('Four o\'clock. The quartet plays. Lucy walks out to an arch, a reverend, a goat, and no groom.\n\nPort Lucky talks about it for years. You move to Jacksonville.');
  }
  HANDLERS.lawn = (v, o, it) => {
    const f = F(); const g = G();
    if (it) {
      if (it === 'bowtie' && o === 'gus') { drop('bowtie'); f.gusTied = true; pts('bowtie-gus'); return say('You tie the bow tie on Gus. He stands a little straighter. He knows what a bow tie means. He has worn one before, at a worse party.'); }
      if (it === 'ring' && o === 'gus') return say('Not loose. He\'ll eat it. The altar has a cushion for exactly this.');
      if (it === 'polaroid' && o === 'earl') { if (!f.earlArrived || f.earlSettled) return say('Earl\'s not asking.'); drop('polaroid'); f.earlSettled = true; pts('earl-settle'); { say('You hand Earl the Polaroid. Benny, 5:31 AM, goat, microphone, WINNER in Earl\'s own writing. Earl looks at it for a long time. "Fair and square," he says finally, and puts it in his shirt pocket. "Tell the groom he sings flat." He gets back in the pickup.'); return checkCeremony(); } }
      if (it === 'token' && o === 'earl') return say('"Not now," says Earl. "I\'m here for a goat."');
      if (o === 'sal' && f.salArrived && !f.salSettled) return say('"Goat," says Sal. "You said goat." He does not want ' + ITEMS[it].name.toLowerCase() + '.');
      if (it === 'water' && o === 'benny') return say('Benny\'s in the tent.');
      if (o === 'kevin') return say('Kevin takes a step back from it. Kevin takes a step back from most things.');
      if (o === 'dolores') return say('"Not now, Dexter."');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('A best man with minutes, mud to the knees and a goat on a lead. It will have to do.');
      case 'gus': if (v === 'look') return say(f.ringOnGus ? 'Gus, in a bow tie, with the ring cushion tied to his harness, standing like a soldier.' : f.gusTied ? 'Gus in a bow tie, ready for something.' : 'Gus, tied to a palm, eating a programme.'); if (v === 'talk') return say('"Meh." Formal.'); return say('Gus chews.');
      case 'palm': return say('A palm tree with a goat tied to it. The palm is coping.');
      case 'quartet': if (v === 'talk') return say('"Strings only," says the cellist, when you ask. "No brass. We had a note from the bride\'s mother." Good.'); return say('A string quartet tuning, two violins, a viola and a cello, and not a tuba among them.');
      case 'arch': if (v === 'look') return say('An arch of white flowers at the top of the aisle. The altar is beyond it.'); E.gotoRoom('altar', 20, 150, 1); return;
      case 'chart': return say('Priya\'s seating chart. Under CEREMONY ROLES: Rings — TBD (ask Dex). Speech — Dex. Ring bearer — TBD (ask Dex). Everything that is TBD is you.');
      case 'priya': if (v === 'talk') return say(f.ringOnGus ? '"The goat is the ring bearer," says Priya, writing it down. "The goat is the ring bearer. Fine. FINE."' : '"Dex! Rings? Ring bearer? Speech? You said you had it handled." You said that at 3 AM. "I need a ring bearer in the next ten minutes."'); return say('Priya, the wedding planner, holding a clipboard like a weapon.');
      case 'bridaltent':
        if (v === 'look') return say('The bridal tent, flap closed. Laughter inside, then a silence, then Lucy\'s voice: "Is he here yet?"');
        if (f.bennyDressed) return E.die('You walk Benny to the bridal tent to show Lucy he\'s fine. Lucy sees Benny\'s sunburn before the ceremony. Dolores sees everything.\n\nIt\'s not bad luck, exactly. It\'s just the end.');
        return say('You are not going in there. Not without a groom, and not with one either.');
      case 'groomtent': E.gotoRoom('groomtent', 290, 150, -1); return;
      case 'kevin': if (v === 'talk') return say('"I parked the truck, sir. Sal\'s truck. Is Sal going to—" Kevin looks at the lawn. "Oh no, that\'s Sal."'); return say('Kevin, with the trolley, which now has nothing on it but Kevin\'s dignity.');
      case 'dolores':
        if (v === 'look') return say('Dolores, on the lawn in the lilac hat, watching everything and helping with nothing until asked.');
        if (v === 'talk') {
          if (f.salArrived && !f.salSettled) { f.salSettled = true; f.gotWatch = true; give('watch'); pts('sal-goat'); pts('watch-back'); { say('You explain Sal. Dolores walks over to him, says four sentences, and comes back. "He has the ice-cream concession on the Hartwell pier for the summer. It\'s worth more than a goat." Sal, behind her, is taking off your watch. He hands it to you without a word.'); return checkCeremony(); } }
          if (f.salSettled) return say('"The goat," says Dolores, "stays in the family."');
          return say('"Go," says Dolores. "Dress him. I\'ll stand here and look like I expected this."');
        }
        return say('Dolores is not for using.');
      case 'earl':
        if (v === 'look') return say('Big Earl, on the lawn, looking at Gus the way a man looks at a mascot he won fair and square and lost unfair and square.');
        if (v === 'talk') { if (!f.earlStalled) { f.earlStalled = true; pts('earl-stall'); } return say('"I\'m here for my goat," says Earl. "Fair\'s fair." You tell him it was won fair. "Prove it," says Earl. He is a man of rules. He would accept proof.'); }
        return say('Earl folds his arms.');
      case 'sal': if (v === 'look') return say('Sal, with the tyre iron, which he has brought to a wedding.'); if (v === 'talk') { pts('sal-goat'); return say('"Goat," says Sal. "You said goat." You can\'t give him this goat. This goat is the ring bearer and a Hartwell. "Then find me someone who CAN," says Sal, and looks at Dolores.'); } return say('Sal taps the tyre iron.');
      case 'clock': return say('The clock. It is real. It is the only real clock in this game.');
      default: return say("You can't do that here.");
    }
  };
  HANDLERS.groomtent = (v, o, it) => {
    const f = F();
    if (it) {
      if (it === 'water' && o === 'benny') { drop('water'); f.bennyWatered = true; pts('water'); checkDressed(); return say('Benny drinks the whole bottle without breathing. "Better," he says, and it is nearly true.'); }
      if (it === 'tux' && o === 'benny') { if (!f.bennyWatered) return say('He can\'t stand up yet. Water first.'); drop('tux'); f.bennyTux = true; pts('tux'); checkDressed(); return say('You get the tuxedo on him one limb at a time, like dressing a deckchair. It fits. The sunburn clashes. Nobody will look at the sunburn.'); }
      if (it === 'shoe' && o === 'benny') {
        if (!f.shoePolished) return say('A dirty shoe on a clean groom? Polish it first.');
        drop('shoe'); f.shoesDone = true; pts('shoes'); checkDressed(); return say('Benny puts on the left shoe you have carried since the garage. Two shoes, polished. He stands up. He looks, from a distance, like a groom.');
      }
      if (it === 'polish' && (o === 'benny')) { if (!has('shoe')) return say('You polish the shoe he\'s wearing. The other one is still in your pocket.'); f.shoePolished = true; return say('You polish the left shoe in your hand and the right shoe on Benny\'s foot until both agree about what morning it is. Now give him the left one.'); }
      if (it === 'flask' || (o === 'flask')) return say('No.');
      if (o === 'benny' && (it === 'tea' || it === 'churro')) return say('Not now.');
      if (o === 'mirror') return say('The mirror reflects it back, unhelpfully.');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('The mirror shows a man who has never written a speech in his life.');
      case 'bag': if (v === 'look') return say('A garment bag on the tent pole, zipped, with BENNY on a tag in Lucy\'s handwriting.'); f.gotTux = true; give('tux'); return say('You unzip the bag and take out the tuxedo. Pressed. Unaware.');
      case 'mirror': return say(f.bennyDressed ? 'In the mirror: a groom. Behind him: you.' : 'In the mirror: a man in a Hawaiian shirt and a groom in one shoe. Neither is ready.');
      case 'flask': if (v === 'look') return say('A hip flask on the table. A gift from the ushers, engraved HAIR OF THE DOG.'); if (v === 'take' || v === 'use' || v === 'drink') return E.die('Hair of the dog. The dog was a wolf.\n\nThe ceremony goes ahead with the best man and the groom asleep in the groom\'s tent, which is at least symmetrical.'); return say('Leave the flask.');
      case 'water': if (v === 'look') return say('A bottle of still water. Benny needs about four of these.'); f.gotWater = true; give('water'); return say('You take the water.');
      case 'polish': if (v === 'look') return say('A tin of black shoe polish and a brush.'); f.gotPolish = true; give('polish'); return say('You take the polish.');
      case 'bowtie': if (v === 'look') return say('A small bow tie, goat-sized. Someone brought it from the suite. Someone was Kevin.'); f.gotBowtie = true; give('bowtie'); return say('You take the goat\'s bow tie. It is the only bow tie in this tent that is ready.');
      case 'table': return say('A folding table with a hip flask, a bottle of water, shoe polish and a goat\'s bow tie. A still life called Best Man.');
      case 'benny':
        if (v === 'look') return say(f.bennyDressed ? 'Benny, dressed, upright, pale, a groom.' : f.bennyTux ? 'Benny in a tuxedo and one shoe. The left foot is a sock with opinions.' : f.bennyWatered ? 'Benny, hydrated, in a damp shirt and one shoe.' : 'Benny on a stool with his head between his knees, in one shoe, breathing like it\'s a job.');
        if (v === 'talk') return say(f.bennyDressed ? '"Dex. The ring." You have it. "The speech." You\'re working on it. "The goat." The goat is fine. "Okay. Okay."' : '"Dex," says Benny, to the floor. "I think I\'m going to be sick again." You tell him he\'s already done that. "Okay. Water?"');
        return say('He needs things, in order. Water. Tuxedo. Shoes.');
      case 'flap': E.gotoRoom('lawn', 296, 150, -1); return;
      default: return say("You can't do that here.");
    }
    function checkDressed() { if (f.bennyWatered && f.bennyTux && f.shoesDone && !f.bennyDressed) { f.bennyDressed = true; say('Benny stands in the mirror, dressed, and for the first time since the carpet you recognise him. "Right," he says. "Right." You leave him with the mirror and go and deal with the goat.'); checkCeremony(); } }
  };
  HANDLERS.altar = (v, o, it) => {
    const f = F();
    const SPEECH_SOURCES = ['page','fortune','logpage','program'];
    if (it) {
      if (it === 'ring' && (o === 'cushion' || o === 'cstand')) {
        if (!f.gusTied) return say('The cushion\'s for the ring bearer, and the ring bearer isn\'t dressed. Gus needs his bow tie first, or Priya won\'t sign off on it.');
        drop('ring'); f.ringOnCushion = true; f.ringOnGus = true; pts('cushion'); say('You set the ring on the cushion. Priya appears, takes the cushion, marches it down the aisle and ties it to Gus\'s harness with the air of a woman who will never forget this wedding. Gus accepts it. Ring bearer: handled.'); return checkCeremony();
      }
      if (SPEECH_SOURCES.includes(it) && o === 'lectern') {
        f.speechParts = f.speechParts || [];
        if (f.hasSpeech) return say('The speech is written. On a napkin. Leave it.');
        if (f.speechParts.includes(it)) return say('You\'ve used that already.');
        f.speechParts.push(it);
        const lines = { page: 'From the ledger page: "He pawned a ring for a goat. That\'s not the worst reason anyone\'s pawned a ring."', fortune: 'From Zora\'s card: "The one you seek is on the water. Sometimes the one you seek is just somewhere, thinking, and you have to row."', logpage: 'From Marguerite\'s log: "He didn\'t run. He went somewhere to think. Then the boat left without him, which is the most Benny thing that has ever happened."', program: 'From the order of service: "Rings: Dex. Speech: Dex. Everything he\'s ever asked me to hold, I\'ve held, including, this morning, a goat."' };
        say(lines[it]);
        if (f.speechParts.length >= 3) { f.hasSpeech = true; give('napkin'); pts('napkin'); say('You write it on a napkin from the reception table. It is the truest thing you\'ve written all year. It is four sentences long. It will do.'); checkCeremony(); }
        return;
      }
      if (it === 'napkin' && o === 'lectern') return say('Not yet. That\'s for the reception.');
      if (o === 'officiant') return say('"After the ceremony, Mr. Morrow," says the reverend.');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('The reverend looks at you. You look at the lectern. The lectern looks empty.');
      case 'officiant': if (v === 'talk') return say(f.ringOnGus ? '"The goat is holding the rings," says Reverend Okonkwo, evenly. "I have married people on horseback. I can work with a goat."' : '"Mr. Morrow. You have the rings?" You have A ring. "Then find me the ring bearer, whoever that is, and we\'ll begin at four exactly."'); return say('Reverend Okonkwo, a kind face and a watch she keeps checking.');
      case 'lectern': if (v === 'look') return say(f.hasSpeech ? 'A lectern with your napkin on it. Four sentences. Enough.' : `A lectern with no speech on it. You have a pocket full of paper from today: ${(f.speechParts || []).length ? 'some of it already on the lectern' : 'a ledger page, a fortune card, a logbook page'}. Use them.`); return say('Put something on it. Something true.');
      case 'cushion': if (v === 'look') return say(f.ringOnCushion ? 'The cushion is on Gus now.' : 'A ring cushion on a stand. White satin. Empty.'); if (v === 'take') return say('Priya would notice. Priya notices everything today.'); return say('It wants a ring.');
      case 'cstand': return say('A stand for a cushion. The cushion is doing fine.');
      case 'program': if (v === 'look') return say('An order of service on every chair. Ceremony 4:00. Rings: Dex Morrow. Speech: Dex Morrow.'); f.gotProgram = true; give('program'); pts('program'); return say('You take one. Rings: Dex Morrow. Speech: Dex Morrow. Both of these are news to you.');
      case 'chairs': return say('Rows of white chairs filling up with people who all know Benny and will all remember today.');
      case 'clock': return say('The clock on the pole. Real.');
      case 'sea': return say('The sea behind the altar, doing what it did this morning, which is nothing, beautifully.');
      case 'back': E.gotoRoom('lawn', 160, 130, 1); return;
      default: return say("You can't do that here.");
    }
  };

  // ---------- Chapter 8: reception (epilogue) ----------
  HANDLERS.reception = (v, o, it) => {
    const f = F(); const g = G();
    if (it) {
      if (it === 'napkin' && o === 'mic') return giveSpeech();
      if ((it === 'wallet' || it === 'quarters') && o === 'kevin') {
        if (f.kevinTip) return say('Kevin has been tipped. Kevin may never recover.');
        if (it === 'wallet' && g.money <= 0) return say('The wallet is empty. Kevin deserves better than a photo of two nine-year-olds. Try the quarters.');
        if (it === 'quarters' && g.quarters <= 0) return say('No quarters left.');
        if (it === 'wallet') g.money = 0; else g.quarters = 0; E.renderInv(); f.kevinTip = true; pts('kevin-tip'); checkDone();
        return say(it === 'wallet' ? 'You give Kevin everything in the wallet. "Sir, I can\'t—" He can. He does. "Please never come back," he says, warmly.' : 'You pour the rest of the quarters into Kevin\'s hands. "Is this... for the telescope, sir?" It\'s for everything, Kevin.');
      }
      if (it === 'logpage' && o === 'marguerite') { drop('logpage'); f.margLog = true; pts('marg-log'); checkDone(); return say('You give Marguerite back the page from her log. She reads it, snorts, and tucks it in her cap. "Somewhere to think," she says. "I\'ll put that on the brochure."'); }
      if (it === 'token' && o === 'earl') { if ((f.tokens || 0) < 1) return say('No tokens left.'); f.tokens -= 1; if (f.tokens <= 0) drop('token'); f.earlToken = true; pts('earl-token'); checkDone(); return say('You hand Earl the last karaoke token. He turns it over. "One song," he says. "Bring the groom. He sings flat. I want to hear it."'); }
      if (it === 'watch' && o === 'benny') { f.watchBenny = true; pts('watch-benny'); checkDone(); return say('You show Benny the watch, and the photo folded behind the face: two nine-year-olds, both missing teeth. He looks at it for a long time. "You kept that." You kept it. "Dex," says Benny, "I\'d have married her without the goat." You know. He didn\'t.'); }
      if (o === 'gus' && it === 'program') return say('Gus eats the programme. Priya, from across the terrace, sees it, and lets it go.');
      if (o === 'lucy') return say('"Later, Dex," says Lucy, smiling. "Speech first."');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('Sunset makes everyone look forgiven. Even you.');
      case 'gus':
        if (v === 'look') return say(f.ringsHanded ? 'Gus, asleep under the cake table, bow tie askew, duty done.' : 'Gus, at your feet, with the ring cushion still tied to his harness and the reverend\'s hand still out.');
        if (f.ringsHanded) return say('He\'s earned the sleep.');
        f.ringsHanded = true; pts('rings-handoff'); return say('You untie the cushion from Gus and hand the ring to the reverend. The ceremony happens the way ceremonies do, which is quickly and forever. Lucy says yes. Benny says yes. Gus says "meh", and the reverend decides to allow it.', () => say('Reception. Sunset. One long table and a microphone with your name on it. Use the napkin.'));
      case 'cake': return say('A three-tier cake with a goat asleep underneath it. Nobody has told the cake.');
      case 'mic': if (v === 'look') return say('A microphone on a stand with a card taped to it: BEST MAN. That is still you.'); return giveSpeech();
      case 'dolores': if (v === 'talk') return say(f.speechGiven ? '"You\'ll do, Dexter," says Dolores. From her, that is a parade.' : '"Speech," says Dolores. "Then we\'ll talk."'); return say('Dolores, in the lilac hat, complete.');
      case 'lucy': if (v === 'talk') return f.speechGiven ? askFinish() : say('"Dex!" Lucy hugs you. "Speech first. Then you can tell me about the goat. I know about the goat."'); return say('Lucy, married, radiant, and, you suspect, fully informed.');
      case 'benny': if (v === 'talk') return say(f.speechGiven ? '"Best speech I ever heard," says Benny. "Shortest, too." He means both.' : '"Dex," says Benny, married. "The speech. You\'ve got it?" You have a napkin.'); return say('Benny, married, in two polished shoes.');
      case 'marguerite': if (v === 'talk') return say(f.margLog ? '"Brochure," says Marguerite. "Somewhere to think. Forty dollars an hour."' : '"My boat\'s still out there," says Marguerite. "Coastguard\'s towing her in. You still owe me a page of my log."'); return say('Marguerite, in a clean cap, eating cake with a knife.');
      case 'kevin': if (v === 'talk') return say(f.kevinTip ? '"Thank you, sir. Please never come back, sir."' : '"I\'m off shift, sir," says Kevin. "I came as a guest. Dolores invited me. I don\'t know why."'); return say('Kevin, invited, bewildered, in a borrowed tie.');
      case 'sal': if (v === 'talk') return say('"Hartwell pier, all summer," says Sal, serving Mr. Sprinkles cones to the guests. "Better than a goat." He looks at Gus. "Marginally."'); return say('Sal, serving ice cream from Mr. Sprinkles, which is parked on the lawn with the jingle, finally, off.');
      case 'earl': if (v === 'talk') return say(f.earlToken ? '"One song," says Earl. "Flat."' : '"Fair and square," says Earl, at the bar, to nobody.'); return say('Big Earl, at the bar, invited, grudging, enjoying himself against his will.');
      case 'table': return say('One long table, everyone from today on it. From this end it looks like a jury that voted to acquit.');
      case 'sunset': return say('The sun goes down over Port Lucky like it\'s done every day of your life and never once like this.');
      default: return say("You can't do that here.");
    }
    function giveSpeech() {
      if (!f.ringsHanded) return say('The reverend is still holding out her hand. Rings first. The goat has them.');
      if (f.speechGiven) return say('You\'ve given the speech. Nobody has asked for an encore. Nobody ever does.');
      if (!has('napkin')) return say('You have no speech. You had a napkin.');
      E.choose('You tap the microphone. Everyone turns. How does this go?', [
        { label: 'Tell them the truth: the goat was Benny\'s idea, and Dolores was testing me.', value: 'honest' },
        { label: 'Take the credit. You did find everything.', value: 'credit' },
        { label: 'Blame Benny. Lightly. For laughs.', value: 'blame' }
      ]).then(c => {
        drop('napkin'); f.speechGiven = true;
        if (c === 'honest') {
          pts('speech-honest');
          say('You read the napkin. The ledger page, the fortune, the log, the order of service. Then you put it down and tell them the rest: that the goat was Benny\'s idea, that he pawned a ring to win back something Lucy cried about when she was fourteen, and that her mother spent the whole day watching to see whether the best man would own up.', () =>
            say('Lucy stands up. "I knew," she says. "He asked my mother\'s permission the only way a Hartwell respects. By doing something stupid and brave for the family goat." Dolores, in the lilac hat, does not deny it. Gus, under the cake, says "meh".', checkDone));
        } else {
          pts('speech-ok');
          say(c === 'credit' ? 'You read the napkin and then, for reasons you\'ll think about later, you add a bit about how you found everything, which is true, and how it was mostly you, which isn\'t. Polite applause. Lucy\'s smile cools by a degree only you notice.' : 'You read the napkin and then, for laughs, you blame Benny. Lightly. The table laughs. Benny laughs. Dolores does not, and Lucy looks at her mother, and you understand you have missed the point of the day by about a goat\'s width.', checkDone);
        }
      });
    }
    function askFinish() {
      E.choose('Lucy squeezes your arm. "Stay for cake? Or have you had enough of today?"', [{ label: 'Stay a while. There are people to thank.', value: 'stay' }, { label: 'Call it a day. The best kind.', value: 'end' }]).then(c => { if (c === 'end') finish(); else say('You stay. The sun takes its time. So do you.'); });
    }
    function checkDone() { if (f.speechGiven && f.kevinTip && f.margLog && f.earlToken && f.watchBenny) finish(); }
    function finish() { if (g.done) return; g.done = true; E.persist(); say('Later, Benny and Lucy drive off in Mr. Sprinkles, because of course they do, with the jingle playing and Gus in the back. You stand on the terrace with a watch, a wallet and no napkin, and for the first time since 9:47 this morning, nobody is missing.', () => E.showFinal()); }
  };

  function itemLabel(id) { const g = G(); if (!g) return null; if (id === 'wallet') return g.money > 0 ? `Wallet ($${(g.money / 100).toFixed(0)})` : 'Wallet (empty)'; if (id === 'quarters') return `Quarters (${g.quarters})`; return null; }
  return { act, combine, walkAction, itemLook, itemLabel, startChapter, onRestart, clockExpired, clockTick };
}
