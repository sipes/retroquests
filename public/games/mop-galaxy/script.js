// Mop & Galaxy — game script: puzzle logic, chapter flow, presets, save migration.
// Runs entirely client-side with no platform access; the engine (E) owns UI, saves and the adapter.
import { ITEMS, ROOM_CHAPTER, POINTS, SAVE_VERSION } from './data.js';

export const CLOCK_START = 240; // chapter 8: four real minutes to the jurisdiction line

// ---------- Chapter start presets (fallback checkpoints; real checkpoints are snapshotted at chapter start) ----------
const CH_KEYS = {
  1: ['look-arm','badge','vent','shelf-look','coin-vend','wrench','bolts','mop-chute','climb'],
  2: ['notice','nameplate','hide','drain','roster','okonjo-look','blanket','duct2'],
  3: ['compost-look','tray-feed','gumbo','board','thistle-talk','roster-show','tomato','locker','oven','rations','gumbo-ties','wheel','dish','vault'],
  4: ['headphones','suppression','filter-out','polish-in','oven-in','gauge','airlock','suit','helmet-tape','o2','tether','suitcheck'],
  5: ['clip','plate','gap','pin','padlock','crank','panel','broadcast'],
  6: ['coffee','brack','notice-show','roster-show2','contract-loss','log','code-seen','mop-stamp','filing','seed'],
  7: ['crate','slip','keypad','gumbo-vent','cat','jacket','lockbox','lights','mop-polish','keyA','gumbo-key','turn','lever','run']
};
const CH_FLAGS = {
  1: {},
  2: { lookedArm: 1, gotBadge: 1, sawBoarders: 1, sawWrench: 1, shelfWedged: 1, gotWrench: 1, vended: 1, grilleOpen: 1, mopChuted: 1, tookMymop: 1, leftDeck9: 1, sweepOn: 1 },
  3: { gotNotice: 1, readPlate: 1, knowsLoophole: 1, gotHose: 1, fogged: 1, hidden: 1, sweptPast: 1, gotDrawing: 1, gotRoster: 1, needsCode: 1, gotBlanket: 1, ductWrapped: 1, leftCryo: 1, mopBack: 1 },
  4: { sawCompost: 1, gumboOut: 1, gotGumbo: 1, gotTray: 1, readBoard: 1, thistleTalked: 1, gotCrewcard: 1, gotTomato: 1, lockerOpen: 1, gotToolkit: 1, gotOven: 1, gotRations: 1, gotTies: 1, gumboMedium: 1, doorHeld: 1, dishRun: 1, vaultMatters: 1 },
  5: { sawHeadphones: 1, suppressed: 1, ilseDistracted: 0, filterOut: 0, filterBack: 1, gotPolish: 1, polishIn: 1, ovenIn: 1, jumpInhibited: 1, gaugeRead: 1, gotDosimeter: 1, gotSuit: 1, gotHelmet: 1, helmetTaped: 1, gotO2: 1, gotTether: 1, suitChecked: 1, airlockClear: 1, mopLost: 1, mopLeft: 1, o2: 30 },
  6: { clipped: 1, gotPlate: 1, gapBridged: 1, gotPin: 1, padlockCut: 1, crankFree: 1, dishLocked: 1, panelRead: 1, broadcast: 1, inside: 1 },
  7: { gotCoffee: 1, pastBrack: 1, gotContract: 1, shownNotice: 1, shownRoster: 1, shownContract: 1, gotLog: 1, sawCode: 1, mopArrived: 1, mopProud: 1, filingVoid: 1, knowsPrize: 1, escorted: 1, tick: 0 },
  8: { sawCrate: 1, gotSlip: 1, inLien: 1, gotSandwich: 1, catMoved: 1, gotCode: 1, lockboxOpen: 1, gotKeyB: 1, gumboLarge: 1, lightsOff: 1, polished: 1, dorritSlid: 1, gotKeyA: 1, gumboHasKey: 1, keyAIn: 1, gumboOnB: 1, keysTurned: 1, clampsBlown: 1, leftLien: 1, mopHeld: 1 }
};
const CH_INV = {
  1: ['mop'],
  2: ['mymop','badge','wrapper','wrench'],
  3: ['mop','mymop','badge','wrapper','wrench','notice','roster','drawing'],
  4: ['mop','mymop','badge','wrench','notice','roster','drawing','crewcard','tomato','gumbo2','toolkit','rations','oven'],
  5: ['badge','wrench','notice','roster','drawing','crewcard','tomato','gumbo2','toolkit','rations','canister','dosimeter','suit','helmet','tether','o2'],
  6: ['badge','wrench','notice','roster','drawing','crewcard','tomato','gumbo2','toolkit','rations','dosimeter','pin'],
  7: ['mop','badge','wrench','notice','roster','drawing','crewcard','tomato','gumbo2','toolkit','rations','dosimeter','pin','contract','logslip'],
  8: ['mop','badge','wrench','notice','roster','drawing','crewcard','tomato','gumbo3','toolkit','rations','dosimeter','pin','contract','logslip','crateslip','codecard']
};
const CH_POS = { 1: ['closet',150,160,1], 2: ['cryo',160,150,1], 3: ['galley',150,160,1], 4: ['drive',60,160,1], 5: ['hull1',44,160,1], 6: ['ready',40,160,1], 7: ['collar',40,160,1], 8: ['lift',100,160,1] };

export function CHAPTER_START(n) {
  n = Math.max(1, Math.min(8, n | 0));
  const flags = {}, scored = {}; let score = 0;
  for (let i = 1; i < n; i++) { Object.assign(flags, CH_FLAGS[i + 1] || {}); CH_KEYS[i].forEach(k => { scored[k] = true; score += POINTS[k]; }); }
  if (n === 1) Object.assign(flags, CH_FLAGS[1]);
  const [room, px, py, dir] = CH_POS[n];
  return { v: SAVE_VERSION, chapter: n, room, inv: CH_INV[n].slice(), flags: JSON.parse(JSON.stringify(flags)), scored, score, hintsUsed: 0, revealed: {}, px, py, dir, started: true, clock: n === 8 ? CLOCK_START : null, checkpoint: null, done: false };
}

export function migrateSave(sv) {
  const g = JSON.parse(JSON.stringify(sv));
  if (!g.v) g.v = SAVE_VERSION;
  if (!g.flags) g.flags = {}; if (!g.scored) g.scored = {}; if (!g.inv) g.inv = []; if (!g.revealed) g.revealed = {};
  if (!g.chapter) g.chapter = ROOM_CHAPTER[g.room] || 1;
  if (!g.room || !ROOM_CHAPTER[g.room]) { const cp = CHAPTER_START(g.chapter); g.room = cp.room; g.px = cp.px; g.py = cp.py; }

  if (g.chapter === 8 && g.clock == null && !g.flags.okonjoAwake) g.clock = CLOCK_START;
  if (typeof g.done !== 'boolean') g.done = false;
  return g;
}

export function createScript(E) {
  const say = (t, then) => E.say(t, then);
  const pts = k => E.points(k);
  const G = () => E.game, F = () => E.game.flags;
  const has = id => E.has(id), give = id => E.give(id), drop = id => E.drop(id);
  const name = id => E.spotName(id);
  const rejoin = (it, o) => say(o === 'me' ? `You can't use the ${ITEMS[it].name.toLowerCase()} on yourself. Use it on something in the room.` : `Using the ${ITEMS[it].name.toLowerCase()} on the ${name(o)} does nothing useful.`);
  const LIEN = ['collar','hold','quarters','clamps'];

  // ---------- Chapter flow ----------
  const OPEN = {
    2: ['The cryo bay. Two thousand colonists asleep under blue light, and one pod standing open with your name on it.', 'Flashlights are working their way along the far row. Whoever they are, they are counting.'],
    3: ['The galley duct drops you onto a serving counter. Something in the compost unit is rattling its lid, and a familiar cheerful voice says "Wim! I came up the laundry chute. I am clean now."', 'Mop is back. Mop is very proud.'],
    4: ['Engineering. A cathedral of pipes around the jump drive, and a woman in headphones with the nav core open and her back to you.', 'Ilse, Vane\'s engineer. If she finishes the jump plot, this ship goes to the Vellacourt yards, and so do two thousand people who did not sign for it.'],
    5: ['Outside. The Hyacinth\'s spine runs aft under more stars than you have ever seen, and the Lien sits on the hull like a tick.', 'Your wrist gauge says the bottle is half full. Your tether says nothing, because it is not clipped to anything yet.'],
    6: ['Airlock C opens onto the captain\'s ready room. Real coffee. A locked drawer. Your own contract, framed, for reasons nobody has explained.', 'Through the bridge door, a very large man called Brack is eating a sandwich in the way of everything.'],
    7: ['Brack puts you through the pressure door onto the collar and tells you to wait in the crate you came in. The door locks behind him.', 'Through the hull window, once a minute, your own mop drifts past. Mop watches it go, respectfully.'],
    8: ['Mop\'s service lift. Built for a floor-polishing robot and nothing taller. Four minutes to the jurisdiction line, and six decks between you and a captain who is asleep.', 'The clock in the corner is the Lane Authority\'s, not yours. It stops for nobody, except while you are reading.']
  };
  function startChapter(n, opts = {}) {
    const g = G(); const [room, px, py, dir] = CH_POS[n];
    g.chapter = n; g.room = room; g.px = px; g.py = py; g.dir = dir; g.started = true; g.clock = n === 8 ? CLOCK_START : null;
    if (n === 8) delete g.flags.okonjoAwake;
    if (n === 2) g.flags.sweepOn = 1;
    if (n === 3 && !g.inv.includes('mop')) g.inv.push('mop'); // Mop rejoins via the laundry chute
    if (n === 5 && g.flags.o2 == null) g.flags.o2 = 30;
    if (n === 1 && opts.fresh) give('mop');
    E.clearTransient(); E.clearOverlays(); E.view = 'game'; E.$('gate').hidden = true; E.$('stage').hidden = false;
    E.setCheckpoint(); E.renderInv(); E.updateHud(); E.updateClockUI(); E.persist();
    if (n === 1) {
      if (opts.fresh) { say('The Luminous Hyacinth, fourteen months out. You wake up on a sack of absorbent granules in the Deck 9 supply closet because you are not crew and crew get bunks.'); say('Something has changed. The engine note is wrong, the corridor door is sealed, and Mop, the floor-polishing robot, is standing over you saying "Wim! Wim! I signed for a delivery!"'); say('Click a verb, then click something in the room. Or type commands like LOOK AT MOP. Save often. This is that kind of ship.'); }
      return;
    }
    (OPEN[n] || []).forEach(t => say(t));
  }
  function onRestart(n) {
    const lines = { 1: 'You wake up on the sack of granules. Again. Mop is still very excited about the delivery.', 2: 'Back at the cryo bay door. The flashlights start their sweep again.', 3: 'Back on the serving counter. The compost lid rattles. Mop is still proud.', 4: 'Back at the engineering hatch. Ilse has not turned around. Yet.', 5: 'Back outside Airlock A, half a bottle, unclipped.', 6: 'The ready room again. Brack is still in the door with the same sandwich.', 7: 'The collar, again. Your mop drifts past as if nothing happened.', 8: 'Four minutes, again. The lift resets. Nothing else is forgiven.' };
    say(lines[n] || 'Let\'s try that again.');
  }

  // ---------- Walk-mode shortcuts: clicking these with Walk selected acts as Use ----------
  const WALK_USE = { closet: ['door','chute'], deck9: ['closetdoor','ladder','grille'], cryo: ['gallery','maindoor'], gallery: ['stairs','duct2'], galley: ['hatch','corridoor'], hydro: ['back','duct'], drive: ['reactordoor','airlockA'], reactor: ['back'], hull1: ['aft','airlockout'], hull2: ['back','airlockC'], ready: ['bridgedoor','lifthatch'], bridge: ['readydoor'], collar: ['pressdoor','back'], hold: ['qcorridor','ccorridor','collardoor'], quarters: ['qdoor'], clamps: ['corridor'], lift: ['hatch','liftdoor'], gallery2: ['stairs'], bridge2: [] };
  const walkAction = id => (WALK_USE[G().room] || []).includes(id);

  function itemLook(id) {
    const g = G(), f = g.flags;
    if (id === 'mop') { if (g.chapter >= 7) return 'MOP-7. It withdrew its signature from a salvage filing, held a pressure door against a ship, and still wants to know if the floors are all right.'; if (g.chapter >= 3) return 'MOP-7, back from the laundry chute and shinier for it. It has not stopped talking about the chute.'; return ITEMS.mop.look; }
    if (id === 'tether') return f.clipped ? 'Thirty metres of tether, clipped to a cleat by Airlock A. The clip is the important part. It is doing its job.' : ITEMS.tether.look;
    if (id === 'o2' && (g.room === 'hull1' || g.room === 'hull2')) return `The bottle. The wrist gauge says roughly ${Math.max(0, f.o2 || 0)} careful movements left. Don't waste them looking at the bottle.`;
    return ITEMS[id].look;
  }
  function itemLabel(id) { const g = G(); if (!g) return null; if (id === 'o2' && (g.room === 'hull1' || g.room === 'hull2')) return `O2 bottle (${Math.max(0, g.flags.o2 || 0)})`; return null; }

  // ---------- Timers that count actions, not seconds ----------
  // Returns true if the action killed you before it happened.
  // Roll the "try again" snapshot back a few actions so a timer death does not repeat on the next action.
  function snapWith(patch) { const sn = E.snapshot(); Object.assign(sn.flags, patch); E.lastSnap = sn; }
  function tickTimers() {
    const g = G(), f = F(), r = g.room;
    if (r === 'cryo' && f.sweepOn && !f.hidden) {
      f.sweep = (f.sweep || 0) + 1; const limit = f.fogged ? 14 : 7;
      if (f.sweep >= limit) { snapWith({ sweep: limit - 4 }); E.die('A flashlight finds you between pod 1,204 and the drain. "Got a live one," says a voice. "Conscious crew?" says another. "Nah. Contractor. Bag him."\n\nYou wake up in a Vellacourt holding cell with a label on your foot. The label says CHATTEL.'); return true; }
      if (f.sweep === limit - 2) say(f.fogged ? 'The fog is thinning. The flashlights are close enough to read by.' : 'The flashlights are one row away. You can hear them counting pods.');
    }
    if (r === 'drive' && f.ilseDistracted) {
      f.ilseT = (f.ilseT || 0) - 1;
      if (f.ilseT <= 0) { f.ilseDistracted = false; if (f.filterOut) { snapWith({ ilseDistracted: true, ilseT: 4 }); E.die('Ilse comes back from the suppression nozzle, wiping foam off her headphones, and stops. The intake housing is open. The filter is in your hand.\n\nShe has a wrench too. Hers is bigger.'); return true; } say('Ilse comes back from the suppression nozzle, wiping foam off her headphones, glances at the intake, sees a closed housing, and goes back to the nav core.'); }
      else if (f.ilseT === 2) say('Ilse is coming back along the catwalk. Finish what you are doing or close the housing.');
    }
    if (r === 'reactor' && !has('dosimeter')) {
      f.rads = (f.rads || 0) + 1;
      if (f.rads === 4) say('The anteroom feels warm. Not air warm. Bone warm. There is a dosimeter on a hook for exactly this reason.');
      if (f.rads >= 7) { snapWith({ rads: 3 }); E.die('You feel fine. You feel fine for another forty minutes, and then you do not feel anything.\n\nThe dosimeter on the hook would have told you. It is still on the hook.'); return true; }
    }
    if ((r === 'hull1' || r === 'hull2') && !f.inside) {
      f.o2 = (f.o2 == null ? 30 : f.o2) - 1; E.renderInv();
      if (f.o2 === 8) say('The wrist gauge goes amber. Eight careful movements. Make them count.');
      if (f.o2 <= 0) { snapWith({ o2: 6 }); E.die('The bottle gives its last breath to the visor, which fogs, which is the last thing you see.\n\nThe tether holds. That is something. Vellacourt files you as debris.'); return true; }
    }
    if (LIEN.includes(r) && f.clampsBlown && !f.leftLien) {
      f.doorT = (f.doorT == null ? 7 : f.doorT) - 1;
      if (f.doorT === 3) say('The collar groans. The pressure door is cycling closed. Run.');
      if (f.doorT <= 0) { snapWith({ doorT: 4 }); E.die('The pressure door seals with you on the wrong side of it. The Lien drifts off the Hyacinth with its loot, its captain\'s cat, and one contractor.\n\nVellacourt Reclamation\'s HR department will be in touch.'); return true; }
    }
    return false;
  }

  // ---------- Dispatcher ----------
  const HANDLERS = {};
  function act(v, o, it) {
    const g = G();
    if (v === 'look' && o === 'me' && !it) return lookMe();
    if (v !== 'look' && tickTimers()) return;
    if (g.room === 'collar' && v !== 'look') F().tick = (F().tick || 0) + 1;
    if (o === 'mopbot' && mopAct(v, it)) return;
    const h = HANDLERS[g.room]; if (!h) return say('Nothing happens.');
    return h(v, o, it);
  }
  function lookMe() {
    const g = G(), f = F();
    if (g.room === 'closet' && !f.lookedArm) { f.lookedArm = true; pts('look-arm'); return say('You are Wim Tarragon, custodial contractor, fourteen months into a nine-month contract. There is a strip of tape on your forearm with your own handwriting on it: NOT CREW. DO NOT FREEZE. SOMEONE HAS TO DO THE FLOORS.'); }
    const lines = { closet: 'Wim Tarragon. Coveralls off, undershirt on, hair like a mop that lost an argument.', deck9: 'Your reflection in the vending machine glass: a man who has been asleep on a sack and knows it.', cryo: 'In the pod glass: someone who is, technically, conscious.', gallery: 'In the thaw console\'s dark screen you look like a crew member. Almost.', galley: 'In the dishwasher door: a contractor with a wrench and a plan. Half a plan.', hydro: 'The UV makes your teeth glow. Thistle is not impressed by teeth.', drive: 'Oil on your face already. Engineering does that to you.', reactor: 'Your reflection in the lead glass is slightly green. That is the glass. Probably.', hull1: 'There is no mirror in space. The visor shows you the stars and, faintly, a man who should be doing floors.', hull2: 'A size M in a size L, holding on.', ready: 'In the coffee machine\'s chrome: a janitor in the captain\'s ready room, which is the most crew you have ever looked.', bridge: 'On the main screen, in the corner, the bridge camera shows a small man arguing with a tall one. Keep arguing.', collar: 'In the hull window: you, and behind you, your mop, going past.', hold: 'Among other ships\' property, you fit right in.', quarters: 'In Vane\'s mirror you look like something she would catalogue.', clamps: 'Your reflection in the pressure gauge: round, worried, correct.', lift: 'Folded into a lift built for a robot. Deck Officer.', gallery2: 'The thaw console screen: eight empty digits and your face behind them.', bridge2: 'A man on the bridge who kept the floors and the ship.' };
    return say(lines[g.room] || 'Still you.');
  }
  function mopAct(v, it) {
    const g = G(), f = F();
    if (it === 'tomato') return say('"Thank you," says Mop. "I do not eat. I will treasure it." It balances the tomato on its dome for a moment and gives it back.'), true;
    if (it === 'gumbo1' || it === 'gumbo2' || it === 'gumbo3') return say('Gumbo eyes Mop\'s plastic bumper. Mop eyes Gumbo. "No," says Mop, firmly, for the first time in its life.'), true;
    if (it) return say(`Mop looks at the ${ITEMS[it].name.toLowerCase()}. "Is that for the floors?"`), true;
    if (v === 'take') return say('Mop weighs forty kilos and has its own opinions about where it goes.'), true;
    if (v === 'hit') return say('You would never. Mop would forgive you, which is worse.'), true;
    if (v !== 'talk' && v !== 'look' && v !== 'use' && v !== 'search') return false;
    if (v === 'look') return say(itemLook('mop')), true;
    if (g.room === 'drive' && !f.gotPolish) { f.gotPolish = true; give('polish'); say('"Mop," you say, "have you got any polish?" Mop\'s dome lights up. It has never once been asked. A hatch opens and a canister of MOP-7 floor polish slides out. "Lasting shine," says Mop. "Not for consumption. Not for coolant loops. It says so. Why?" You do not answer.'); return true; }
    const R = {
      closet: f.mopChuted ? null : ['"A delivery came, Wim! Big crate. Four people. I signed!" Mop shows you the stamp on its arm: a smiling mop. "The form said REPRESENTATIVE OF VESSEL and I am the only one awake who is allowed to sign for cleaning supplies, so."', '"Where did they go?" "Up. Deck 8. They sealed the big door so the delivery would not escape. I think that is what they said."'],
      deck9: ['"I cannot climb ladders," says Mop. "I have wheels. I am very good at chutes, though. Have you seen the chute? It is Mop-sized."'],
      galley: ['"The compost unit has been rattling since the colonists went to sleep. I do not clean inside it. It is not a floor."'],
      hydro: ['"Thistle and I do not speak," says Mop. "Thistle says floors are not a real job."'],
      drive: f.gotPolish ? ['"Did the polish work? On the floor? Oh. On the loop. Well. It is very lasting."'] : null,
      ready: ['"I came up through the service lift," says Mop. "It is my lift. Nobody else fits. You could fold."'],
      bridge: f.filingVoid ? ['"I withdrew it," says Mop. "Captain Okonjo said sub-minds do not sign for the ship. I remembered late. I am sorry, Wim."'] : f.mopProud ? ['"That is my stamp!" says Mop, looking at the holo. "On a real document!"'] : null,
      collar: f.inLien ? ['"I will come with you," says Mop. "I have never been on another ship. Do they have floors?"'] : ['"That is my stamp on their door too," says Mop quietly. "I am sorry about the delivery, Wim."'],
      hold: ['"These floors are terrible," says Mop. "I could do them. In the dark, even. I have sensors."'],
      clamps: f.polished ? ['"The corridor is done," says Mop. "It is the best floor I have ever made. Nobody should walk on it."'] : ['"Dorrit is reading," whispers Mop. "People who read do not look at floors."'],
      lift: ['"Cryo is six decks down," says Mop. "I can take you. You will have to fold. Through the roof."'],
      gallery2: ['"I will stand by the stairs," says Mop. "Brack is large. I am heavy. We will see."'],
      bridge2: ['"The captain is awake," says Mop. "She asked about the floors first. Then the ship."']
    };
    const lines = R[g.room];
    if (lines) { lines.forEach(t => say(t)); return true; }
    say('"Wim!" says Mop, happily. It does not have anything else to add.'); return true;
  }
  function combine(a, b) {
    const f = F(); const pair = [a, b].sort().join('+');
    if (pair === 'helmet+toolkit') { if (f.helmetTaped) return say('The visor is already taped. Twice would be showing off.'); f.helmetTaped = true; pts('helmet-tape'); return say('You run the toolkit\'s tape around the cracked edge of the visor, twice, the way the laminated card says not to. It holds. Tape always does.'); }
    if (pair === 'gumbo1+ties' || pair === 'gumbo2+ties' || pair === 'gumbo3+ties') { if (!has('gumbo1')) return say('Gumbo has had the ties. Gumbo would like something else.'); drop('ties'); drop('gumbo1'); give('gumbo2'); f.gumboMedium = true; pts('gumbo-ties'); return say('Gumbo takes the plant ties one at a time, like sweets, and swells to the size of a loaf. It flexes something that is now, arguably, a hand.'); }
    if (pair === 'gumbo3+keyB') { if (f.gumboHasKey) return say('Gumbo already has the key. Gumbo is not giving it back.'); drop('keyB'); f.gumboHasKey = true; pts('gumbo-key'); return say('You hand Gumbo clamp key B. It closes around it like a fist. "Hold," you say. Gumbo holds. Gumbo has been waiting all day to be asked.'); }
    if (pair === 'gumbo2+keyB') return say('Gumbo tries to grip the key and sort of wears it. It needs to be bigger. There was ducting insulation in Vane\'s cabin that looked edible.');
    if (pair === 'gumbo1+wrapper' || pair === 'gumbo1+tray') return say('Gumbo sniffs it and looks at your badge instead. Not hungry. Choosy.');
    if (pair === 'mymop+wrench') return say('You could, but that mop has been through enough.');
    if (pair === 'oven+polish') return say('Not in your hands. In the loop, separately, where the filter can pretend everything is fine.');
    if (pair === 'badge+crewcard') return say('Two cards. One says CONTRACTOR, the other says ACTING CREW, and the ship\'s computer believes the one Thistle signed.');
    if (pair === 'coffee+tomato') return say('Breakfast. Later.');
    if (pair === 'codecard+logslip') return say('An eight-digit code and a log entry that makes you an officer. Together they wake a captain. Separately they are paper.');
    if (pair === 'keyA+keyB') return say('They do not fit each other. They fit two keyholes a metre apart, which is the entire problem.');
    if (pair === 'canister+toolkit') return say('You could puncture it. You would also be the last thing it saw.');
    if (a === 'mop' || b === 'mop') return mopAct('use', a === 'mop' ? b : a) && undefined;
    return say(`The ${ITEMS[a].name.toLowerCase()} and the ${ITEMS[b].name.toLowerCase()} don't go together. Yet.`);
  }

  // ---------- Chapter 1: closet ----------
  HANDLERS.closet = (v, o, it) => {
    const f = F();
    if (it) {
      if (it === 'snakpak' && o === 'shelves') { if (f.shelfWedged) return say('Already wedged.'); drop('snakpak'); f.shelfWedged = true; return say('You wedge the SnakPak under the shelf bracket where the wrench is doing the work. The bar takes the load. The wrapper creaks. It is the structural part.'); }
      if (it === 'wrench' && o === 'shelves') return say('The wrench is out. Putting it back would be a kind of surrender.');
      if (it === 'mop' && o === 'chute') return mopChute();
      if (it === 'mymop' && o === 'chute') return say('Your mop would fit, but it is not going anywhere without you.');
      if (it === 'coin' && (o === 'timeclock' || o === 'cage')) return say('Keep the coin. Past-you taped it there for a reason, and the reason is probably on Deck 9 with a coin slot.');
      if (it === 'badge' && o === 'cage') return say('The cage reader thinks about the badge and says CONTRACTOR, in the tone the whole ship uses.');
      if (it === 'badge' && o === 'door') return say('The closet door opens for the badge. It always has. That is the one thing the badge does.');
      if (it === 'wrench' && o === 'vent') return say('The vent is not bolted. It is just a vent. You can see through it fine.');
      if (it === 'snakpak' && o === 'me' && v === 'eat') return say('You unwrap a corner and smell it. "Food," says the label, confidently. You decide the bar is more useful as a structural member than as breakfast.');
      if (it === 'granules' && o === 'vent') return say('You pour granules into the vent. Deck 8 does not notice. You have fewer granules.');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('You pat yourself down. Undershirt, work trousers, no badge. Your badge is in your coverall. Your coverall is on the hook.');
      case 'coverall':
        if (v === 'look') return say('Your coverall, on the hook, with CUSTODIAL (CONTRACT) across the back and something heavy in the breast pocket.');
        f.gotBadge = true; give('badge'); give('coin'); pts('badge'); return say('You pull on the coverall. In the breast pocket: your contractor badge and a ten-credit coin taped to a note: "FOR EMERGENCIES — W." You do not remember taping it. You trust past-you more than present-you.');
      case 'hook': if (f.gotBadge) return say('An empty hook. You are wearing what was on it.'); return say('A coat hook with your coverall on it.');
      case 'vent':
        if (v === 'look' || v === 'use' || v === 'search') {
          if (!f.sawBoarders) { f.sawBoarders = true; pts('vent'); return say('You lie on the floor and look down through the vent into the Deck 8 corridor. Four people in grey Vellacourt coveralls walk past under you with a crate on a trolley, a clipboard, and a list. "Two thousand and thirty pods," says one. "No conscious crew. Clean claim." The clipboard has a smiling mop stamped on it.'); }
          return say('Deck 8 is empty now. The boarders have gone up toward the cryo bay with their clipboard.');
        }
        if (v === 'take') return say('The vent is set into the floor and is about four centimetres wide. You are not.');
        return say('It is a vent.');
      case 'shelves':
        if (v === 'look' || v === 'search') { if (!f.sawWrench) { f.sawWrench = true; pts('shelf-look'); } return say(f.gotWrench ? 'Shelves of chemicals, sagging where the wrench used to be, resting on the crushed remains of a SnakPak.' : 'Shelves of degreaser, descaler and something called SURFACE JOY. The bottom bracket has sheared, and the whole stack is being held up by an adjustable wrench jammed under it. The closet\'s only real tool, doing the closet\'s only real job.'); }
        if (v === 'take') return f.sawWrench ? takeWrench() : say('Take what? Look at the shelves first.');
        return say('The shelves creak. Leave them alone unless you have a plan.');
      case 'wrench': if (v === 'look') return say('An adjustable wrench, jammed under the shelf bracket, holding up forty litres of chemicals.'); return takeWrench();
      case 'cage':
        if (v === 'look') return say('A locked cage of the strong stuff: industrial degreaser, drain acid, a bottle of something with no label and a skull drawn on in marker. Your badge does not open it.');
        if (v === 'drink' || v === 'eat') return E.die('You reach through the cage and take a swig from the unlabelled bottle, because a man who sleeps on granules has nothing to lose.\n\nYou had a little. Now you have less. Mop puts a WET FLOOR sign next to you, which is kind.');
        return say('Locked. CREW ONLY, the reader says, in the voice of a ship that has never once called you crew.');
      case 'granules':
        if (v === 'look') return say('A sack of absorbent granules with a Wim-shaped dent in it. Your bed, for fourteen months. It has been fine.');
        if (v === 'sit') return say('You lie down on the granules for a moment. It is still, somehow, comfortable. Then you remember the four people with a clipboard and get up.');
        if (v === 'take') return say('You take a handful of granules, think about it, and put them back. You have had enough grit for one lifetime.');
        return say('The sack sits there, being a bed.');
      case 'bucket': if (v === 'look') return say('Your mop bucket. The wringer squeaks. You have asked Mop to oil it. Mop says buckets are not floors.'); if (v === 'take') return say('You are not taking a bucket on a rescue.'); return say('The bucket sloshes.');
      case 'mymop':
        if (v === 'look') return say('Your mop. Third Class issue. It has a name. You have never said it out loud.');
        f.tookMymop = true; give('mymop'); return say('You take your mop. It would be strange to leave without it.');
      case 'timeclock':
        if (v === 'look') return say('The time clock. Your card is in it. According to the clock you have been on shift for fourteen months without a break, which is both true and not something anyone is going to pay for.');
        return say('You punch out. The clock prints a card that says OVERTIME PENDING REVIEW. You punch back in. Somebody has to.');
      case 'chute':
        if (v === 'look') return say('The laundry chute. Mop-sized, not Wim-sized. It goes down to the laundry on Deck 10, and from the laundry there are service ducts to everywhere Mop has ever cleaned, which is everywhere.');
        if (v === 'use' || v === 'walk') return has('mop') ? mopChute() : say('You could not fit through it as a child. You cannot fit through it now.');
        return say('A chute. Hungry-looking.');
      case 'door':
        if (v === 'look') return say('The closet door. It opens onto the Deck 9 corridor, which is sealed at the far end.');
        E.gotoRoom('deck9', 30, 150, 1); return;
      default: return say("You can't do that here.");
    }
    function takeWrench() {
      if (f.gotWrench) return say('You have the wrench. The shelves have the SnakPak.');
      if (!f.shelfWedged) return E.die('You pull the wrench out. The shelf comes down. Forty litres of degreaser, descaler and SURFACE JOY come down with it.\n\nYou are very clean. Mop is impressed. You are also very dead.');
      f.gotWrench = true; give('wrench'); give('wrapper'); pts('wrench');
      say('You ease the wrench out. The shelf settles onto the SnakPak with a crunch. The bar is paste. The wrapper survives, as wrappers do, and you pocket it, because fourteen months on a ship teaches you that everything is something.');
    }
    function mopChute() {
      if (f.mopChuted) return say('Mop has gone down the chute. You can hear it somewhere below, singing.');
      if (!f.sawBoarders) return say('"Where am I going?" says Mop. Good question. Find out what is happening first. There is a vent in the floor.');
      f.mopChuted = true; drop('mop'); pts('mop-chute');
      say('"The chute!" says Mop. "I love the chute." You explain that it should go down to the laundry and work its way up through the ducts to wherever the crew pods are, and meet you there. "I will meet you there," says Mop, and goes down the chute head first, which it does not have.', () => say('Somewhere below, a happy whirring. Mop is in the chute. You are in a closet with a wrench and a ladder to find.'));
    }
  };

  // ---------- Chapter 1: deck 9 corridor ----------
  HANDLERS.deck9 = (v, o, it) => {
    const f = F();
    if (it) {
      if (it === 'coin' && (o === 'vending' || o === 'coinslot')) return vend();
      if (it === 'wrench' && (o === 'bolts' || o === 'grille')) return bolts();
      if (it === 'wrench' && o === 'blastdoor') return say('The blast door is held by hydraulics the size of your leg. The wrench is the size of your forearm.');
      if (it === 'wrench' && (o === 'firecab' || o === 'axe')) return say('You could crack the cabinet with the wrench. The alarm wired to the cabinet would then explain to four people with a clipboard exactly where you are.');
      if (it === 'badge' && o === 'vending') return say('The machine reads the badge. CONTRACTOR DISCOUNT: NONE, it says.');
      if (it === 'badge' && o === 'blastdoor') return say('The blast door does not have a badge reader. It has a red light and a point of view.');
      if (it === 'wrapper' && o === 'vending') return say('The machine does not do returns.');
      if (it === 'mop' && o === 'ladder') return say('"I cannot climb ladders," says Mop, patiently, as if to a child. "Wheels."');
      if (it === 'mop' && o === 'dock') return say('"I am full," says Mop. "I charged during the delivery. I was very excited."');
      if (it === 'mymop' && o === 'grille') return say('You poke at the grille with the mop handle. It is bolted. Four bolts. You have a wrench for bolts.');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('You pat yourself down. Coverall, badge, a coin for emergencies. This is an emergency.');
      case 'vending': case 'coinslot':
        if (v === 'look') return say(f.vended ? 'The SnakPak-9000. Empty now, or at least it says so, which is what it always said.' : 'The SnakPak-9000. One SnakPak left, behind the glass, at ten credits. A fortune. Also the only food on Deck 9.');
        if (v === 'hit') return say('You hit the machine. The machine has been hit by better. The SnakPak does not move.');
        return has('coin') ? vend() : say('Ten credits. You have a badge and a wrapper.');
      case 'dock': if (v === 'look') return say('Mop\'s charging dock. A little plaque says MOP-7 — DO NOT UNPLUG — A.O. The captain labelled it herself.'); return say('It hums. It is not for you.');
      case 'intercom':
        if (v === 'look') return say('The corridor intercom. Dead since the boarders cut the deck comms, except for a little light that blinks CALL WAITING, forever.');
        return say('You press the call button. Nothing. Then, faintly, a recording: "Thank you for contacting Vellacourt Reclamation. Your vessel is important to us."');
      case 'blastdoor':
        if (v === 'look') return say('The Deck 9 blast door, sealed from the other side with a red light that means it. The boarders shut it behind them so the delivery, meaning you, could not get out.');
        if (v === 'hit') return say('You kick the blast door. The blast door wins.');
        return say('Sealed. The red light looks at you. You look at the ceiling grille instead.');
      case 'fountain': if (v === 'drink' || v === 'use') return say('You drink. Recycled, flat, fourteen months old, and the best water you have ever had because it is yours.'); return say('A water fountain. It works. It is the only thing on this deck that does what it says.');
      case 'bolts': if (v === 'look') return say('Four bolts, hex head, holding the ceiling grille in. A wrench job.'); return has('wrench') ? bolts() : say('Finger-tight they are not. You need a wrench.');
      case 'grille':
        if (v === 'look') return say(f.grilleOpen ? 'The grille hangs open on one bolt. Above it, a duct that goes up to Deck 8 and, if Mop\'s maps are right, the cryo bay beyond.' : 'A ceiling grille at the top of the maintenance ladder, held in by four bolts. On the other side of it is a way off Deck 9.');
        if (v === 'use' || v === 'take' || v === 'walk') return f.grilleOpen ? climb() : (has('wrench') ? bolts() : say('Bolted. Four bolts. You have a badge and a coin and no wrench.'));
        return say('The grille rattles encouragingly.');
      case 'ladder':
        if (v === 'look') return say('A maintenance ladder up to the ceiling grille. Rungs. Nothing fancy. Mop cannot use it.');
        return climb();
      case 'axe': case 'firecab':
        if (v === 'look') return say('A fire cabinet. Polycarbonate front, a fire axe inside, and a sticker that says BREAK GLASS — ALARM WILL SOUND. It means it.');
        if (v === 'hit' || v === 'use' || v === 'take') return E.die('You put your elbow through the cabinet front. The axe is yours. So is the alarm, which sounds on every deck, and so, two minutes later, are four people in grey coveralls with a clipboard.\n\n"Conscious crew?" "Contractor with an axe." "Bag him."');
        return say('The cabinet waits for a worse day than this one.');
      case 'closetdoor': E.gotoRoom('closet', 24, 150, 1); return;
      default: return say("You can't do that here.");
    }
    function vend() {
      if (f.vended) return say('The machine is empty. You have had your emergency.');
      if (!has('coin')) return say('Ten credits. The coin is in your coverall pocket, which is on the hook, which is in the closet.');
      drop('coin'); give('snakpak'); f.vended = true; pts('coin-vend');
      say('The coin drops. The machine thinks about it for a long, long time, then surrenders the last SnakPak on Deck 9. Protein bar. The wrapper is the structural part.');
    }
    function bolts() {
      if (f.grilleOpen) return say('The grille is open. Three bolts are in your pocket and one is holding it on, which is one more than you need.');
      f.grilleOpen = true; pts('bolts');
      say('You climb the ladder with the wrench in your teeth, like a pirate, and take out three of the four bolts. The grille swings down on the fourth. Above it, a duct, and above that, a way up.');
    }
    function climb() {
      if (!f.grilleOpen) return say('You climb to the top of the ladder and push the grille. Bolted. Four bolts.');
      if (has('mop')) return say('You put a foot on the ladder. Mop looks up at you. "I cannot climb," it says. You are not leaving Mop on a sealed deck with four people and a clipboard. There is a chute in the closet it keeps mentioning.');
      if (!f.mopChuted) return say('Mop is still in the closet, waiting to be told where to go. Send it down the chute first.');
      if (!has('mymop')) return say('You put a foot on the ladder, then stop. Your mop is in the closet. You are not leaving your mop.');
      f.leftDeck9 = true; pts('climb');
      say('You climb the ladder, haul yourself through the grille with your mop handle first, and crawl along a duct that smells of fourteen months of other people\'s dust. At the end of it, blue light. The cryo bay.', () => { if (E.ent.game) startChapter(2); else { E.persist(); E.showPaywall(); } });
    }
  };

  // ---------- Chapter 2: cryo bay ----------
  HANDLERS.cryo = (v, o, it) => {
    const f = F();
    if (it) {
      if (it === 'hose' && o === 'drain') { if (f.fogged) return say('The drain is already fogging the floor. Any more and you would not see your own feet.'); drop('hose'); f.fogged = true; pts('drain'); return say('You jam the coolant hose into the floor drain and crack the valve. Liquid nitrogen hits the warm drain and the whole floor fills with knee-high fog. The flashlights slow down. Nobody counts pods they cannot see.'); }
      if (it === 'hose' && o === 'flashlights') return say('You could spray them. It would make four very cold, very angry people who know exactly where the hose is.');
      if (it === 'badge' && o === 'terminal') return say('CONTRACTOR, says the terminal. NO POD ASSIGNED. Which is wrong, because you are looking at it.');
      if (it === 'wrench' && o === 'maindoor') return say('The main door is where the flashlights came in. You do not want it open.');
      if (it === 'wrapper' && o === 'drawing') return say('The drawing says FEED HIM PLASTIK. The drawing does not say where he is.');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('You pat yourself down. You are the only conscious person in a room of two thousand, and you are the one hiding.');
      case 'notice':
        if (v === 'look') return say('A sheet of Vellacourt stock pinned to the main door. NOTICE OF SALVAGE. Take it. It is about you.');
        f.gotNotice = true; give('notice'); pts('notice'); checkLoophole(); return say('You unpin the notice. "Found derelict (no conscious crew aboard). Claimed under Lane Code 44.7." Ship\'s representative: a wax stamp of a smiling mop. You are, technically, conscious. You are, technically, not crew. Both of those are going to matter.');
      case 'maindoor':
        if (v === 'look') return say('The cryo bay main door, propped open. The boarders came in this way. Their trolley is still in the corridor.');
        return E.die('You slip out through the main door into the corridor, straight into the fifth boarder, who was minding the trolley.\n\n"Conscious crew?" she says into her radio. "No. Contractor." She has a label ready.');
      case 'nameplate':
        if (v === 'look' || v === 'use') { if (!f.readPlate) { f.readPlate = true; pts('nameplate'); } checkLoophole(); return say('POD 1,205 — RESERVED: TARRAGON, W. (CUSTODIAL) — DO NOT FREEZE — BY ORDER, CAPT. A. OKONJO. The captain reserved you a pod and then ordered nobody to put you in it. Somebody had to do the floors.'); }
        return say('It is screwed to the pod. It is the most official thing anyone has ever said about you.');
      case 'emptypod':
        if (v === 'look') return say(f.hidden ? 'Your pod. Lid open. You have lain in it once and that was plenty.' : 'Pod 1,205. Open, empty, reserved, with your name on a plate and no frost on the glass. A Wim-sized hiding place, if you were desperate. You are desperate.');
        if (v === 'sit' || v === 'use' || v === 'walk' || v === 'search') return hide();
        return say('The pod hums, waiting for the one person it was never allowed to hold.');
      case 'drawing':
        if (v === 'look') return say('A child\'s drawing taped to pod 1,204: a smiling green blob labelled GUMBO, and under it, FEED HIM PLASTIK. Pod 1,204 is a colonist called Ada Pryce, aged eight. Her stowaway is not on the manifest.');
        f.gotDrawing = true; give('drawing'); return say('You take the drawing. Ada will want it back. You will want to know what a Gumbo is before you meet one.');
      case 'hose':
        if (v === 'look') return say('A spare cryo coolant hose on the maintenance cart, valve end up. Very cold. Don\'t put your tongue on it.');
        if (v === 'eat' || v === 'drink') return E.die('You put your tongue on it.\n\nIt said not to.');
        f.gotHose = true; give('hose'); return say('You take the coolant hose. The valve end is frosted. Your fingers tell you about it.');
      case 'cart': if (v === 'look') return say('The maintenance cart. Spare hoses, a box of pod seals, and a thermos that says OKONJO in marker. You do not touch the thermos.'); if (v === 'search' || v === 'take') return f.gotHose ? say('Pod seals and a thermos. The thermos is the captain\'s. You are not that kind of contractor.') : say('Pod seals, a thermos, and a coolant hose with a valve on it. The hose is the useful one.'); return say('The cart rolls an inch and stops.');
      case 'terminal':
        if (v === 'look') return say('The pod terminal. 2,030 pods. 2,029 occupied. One reserved, unoccupied. It wants a crew card to do anything, and it does not think you have one.');
        return say('You tap the terminal. CREW CARD REQUIRED. You show it your face. It is unmoved.');
      case 'pods':
        if (v === 'look') return say('Two thousand colonists asleep. Farmers, mostly. A girl of eight in 1,204 with a stowaway nobody knows about. They are not going to wake up in Vellacourt\'s yards if you can help it.');
        if (v === 'hit') return say('You tap the glass of 1,204. Ada Pryce sleeps on. Behind the pod, something small and green moves in a vent and is gone.');
        return say('You do not open other people\'s pods. That is a rule even contractors keep.');
      case 'drain': if (v === 'look') return say('A floor drain under the main aisle. Warm air comes up from the galley below. Something cold poured into it would make a lot of fog.'); return say('A drain. It drains.');
      case 'flashlights':
        if (v === 'look') return say('Four flashlights, moving pod to pod along the far row. Counting. "One thousand, nine hundred and six," says someone, and a clipboard ticks.');
        if (v === 'talk') return E.die('"Excuse me," you say. "I\'m conscious."\n\nThey are very pleased to hear it. They write it down. They bag you.');
        return say('They are coming this way, slowly, one pod at a time. You need to not be here when they arrive.');
      case 'gallery':
        if (v === 'look') return say('Stairs up to the crew gallery, thirty pods on a mezzanine, where the people who were allowed to call themselves crew are sleeping.');
        if (!f.hidden) return say('The stairs are in the flashlights\' line of sight. Climb them now and you are a silhouette with a mop. Wait for the sweep to pass.');
        E.gotoRoom('gallery', 24, 150, 1); return;
      default: return say("You can't do that here.");
    }
    function checkLoophole() { if (f.gotNotice && f.readPlate && !f.knowsLoophole) { f.knowsLoophole = true; say('"No conscious crew aboard." Reserved, custodial, do not freeze. You are conscious. The question is whether you are crew, and the answer is written down somewhere on this ship by someone who outranks a wax stamp.'); } }
    function hide() {
      if (f.hidden) return say('You have hidden once. The sweep has passed. Lying in the pod again would be a nap, and there is no time for a nap.');
      f.hidden = true; pts('hide'); E.clearOverlays();
      say('You climb into pod 1,205 and pull the lid to a finger\'s width. Blue light. Your own breath. Footsteps.', () =>
        say('A flashlight plays over the glass, over the nameplate, over you, lying very still in a pod with no frost on it. "One thousand, two hundred and five," says a voice. "Reserved. Empty." The clipboard ticks. "Two thousand and twenty-nine. No conscious crew. Log it."', () =>
          say('The flashlights move off toward the main door, counting. You wait a long minute, then climb out. The sweep has passed. Upstairs, the crew gallery.')));
    }
  };

  HANDLERS.gallery = (v, o, it) => {
    const f = F();
    if (it) {
      if (it === 'blanket' && o === 'duct2') { if (f.ductWrapped) return say('The grille is wrapped. It is ready when you are.'); drop('blanket'); f.ductWrapped = true; return say('You wrap the fire blanket around the duct grille and your hands. The heat comes through, slowly, as a suggestion rather than a fact. Good enough.'); }
      if (it === 'badge' && o === 'thawconsole') return say('The thaw console reads the badge and says CONTRACTOR. Then it says NO, in case that was unclear.');
      if (it === 'badge' && o === 'locker') return say('CREW CARD HOLDERS ONLY, says the locker. Thistle\'s note underneath says it twice.');
      if (it === 'wrench' && o === 'okonjo') return say('You are not prying open the captain. Even to save the ship. Especially to save the ship.');
      if (it === 'wrench' && o === 'duct2') return say('The grille is loose already. The problem is not the bolts, it is the temperature.');
      if (it === 'roster' && o === 'okonjo') return say('You hold the roster up to the captain\'s pod. She wrote the last line. She is not going to read it back to you asleep.');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('You pat yourself down. A notice that says you do not exist, a roster that says you almost do.');
      case 'locker':
        if (v === 'look') return say('The crew locker, with a note taped on in neat robot capitals: "CREW CARD HOLDERS ONLY. Contractor Tarragon, this means you. The galley locker is the same. — THISTLE." Thistle, the hydroponics bot, has never liked you.');
        return say('Locked to crew cards. You have a badge. Thistle has made its position clear.');
      case 'roster':
        if (v === 'look') return say('The wall roster. Thirty crew, ranks, pod numbers. At the bottom, in handwriting that is not the printer\'s, one more line.');
        f.gotRoster = true; give('roster'); pts('roster'); checkCode(); return say('You unclip the roster. The last line is handwritten: "Tarragon, W. — not crew, do not freeze, someone has to do the floors. — A.O." Not crew. In the captain\'s hand. On the crew roster. You will think about that for a while.');
      case 'blanket':
        if (v === 'look') return say('A fire blanket in a red pouch on a hook. For things too hot to touch.');
        f.gotBlanket = true; give('blanket'); pts('blanket'); return say('You take the fire blanket. The pouch says DO NOT USE AS BLANKET, which raises questions.');
      case 'duct2':
        if (v === 'look') return say(f.ductWrapped ? 'The duct grille, wrapped in a fire blanket, going up to the galley.' : 'A loose grille in the ceiling into a duct that smells of soup. It comes down from the galley. Heat shimmers off the metal. You can feel it from here.');
        if (v === 'use' || v === 'take' || v === 'walk') return duct();
        return say('The duct breathes out warm air and the smell of fourteen months of reconstituted soup.');
      case 'crewpods': if (v === 'look') return say('Thirty crew pods, frosted. First officer, engineer, medic, cook, the lot. The people who were allowed to call themselves crew. They would want you to do this. Some of them.'); return say('You leave the crew asleep. One captain at a time.');
      case 'plaque':
        if (v === 'look' || v === 'use') return say('A brass plaque under the captain\'s pod: CAPT. ADAEZE OKONJO, LUMINOUS HYACINTH. "She who keeps the ship keeps the people." Somebody polished it recently. It was Mop.');
        return say('Brass. Polished. Mop\'s work.');
      case 'okonjo':
        if (v === 'look' || v === 'talk') { if (!f.okonjoLooked) { f.okonjoLooked = true; pts('okonjo-look'); } checkCode(); return say('Captain Adaeze Okonjo, asleep, hands folded, looking exactly like someone who reserved a pod for a contractor and then ordered him kept awake. The pod display reads: THAW LOCKED — CAPTAIN\'S CODE (8 DIGITS) REQUIRED. You do not have eight digits. You have a mop.'); }
        if (v === 'hit') return say('You tap the glass. "Captain," you say. "There\'s a problem with the floors." She does not stir. It was worth a try.');
        return say('She sleeps on. Someone on this ship has the code. It is not you.');
      case 'thawconsole':
        if (v === 'look') return say('The thaw console. A keypad, eight digits, and a screen that says CAPTAIN\'S THAW: LOCKED. Enter the code wrong three times and it tells everyone.');
        return say('You put your finger over the keypad. Eight digits. You know zero of them. You take your finger back.');
      case 'stairs': E.gotoRoom('cryo', 290, 150, -1); return;
      default: return say("You can't do that here.");
    }
    function checkCode() { if (f.gotRoster && f.okonjoLooked && !f.needsCode) { f.needsCode = true; say('So: the captain wrote you onto the roster as not-crew, and the captain is the only person who can say otherwise, and the captain is locked behind eight digits that somebody on this ship took off her when they found her asleep. Get the code. Wake the captain. Argue later.'); } }
    function duct() {
      if (!f.ductWrapped) return E.die('You grab the duct grille with both hands.\n\nIt is at soup temperature. You let go, eventually, from the floor of the cryo bay, and the flashlights come back to see what the screaming was.');
      if (!f.needsCode) return say('You have a hand on the grille, then stop. You still do not know what you are going up there for. Look at the captain. Read the roster. Then climb.');
      f.leftCryo = true; pts('duct2');
      say('You go up the duct in the fire blanket like a dumpling, follow the smell of soup past two junctions, and drop out of a ceiling vent onto the galley serving counter.', () => startChapter(3));
    }
  };

  // ---------- Chapter 3: galley ----------
  HANDLERS.galley = (v, o, it) => {
    const f = F();
    if (it) {
      if ((it === 'wrapper' || it === 'tray') && o === 'compost') return feedCompost(it);
      if (it === 'badge' && (o === 'reader' || o === 'lockerreader' || o === 'locker' || o === 'counter')) return say('The reader blinks at the badge. CONTRACTOR. It does not even bother with NO.');
      if (it === 'crewcard' && (o === 'lockerreader' || o === 'locker')) return openLocker();
      if (it === 'crewcard' && (o === 'reader' || o === 'counter')) { f.counterOpen = true; return say('The counter reader accepts the crew card with a little chime that nobody has played for you in fourteen months. The cutlery drawers unlock. Spoons. Thistle has not thought of everything.'); }
      if (it === 'gumbo2' && o === 'wheel') return dogDoor();
      if (it === 'gumbo1' && o === 'wheel') return say('Gumbo is the size of your fist. The wheel is the size of your head. Gumbo would need to be bigger to hold it. Thistle has a bin of plant ties next door.');
      if (it === 'gumbo3' && o === 'wheel') return say('The door is dogged already.');
      if ((it === 'wrench' || it === 'mymop') && o === 'wheel') return say(f.doorHeld ? 'Already held.' : 'You wedge it in the wheel. The first person to lean on the door from outside will shear it. You need something that holds on back.');
      if (it === 'tray' && o === 'dishwasher') return runDish();
      if (it === 'oven' && o === 'dishwasher') return say('Not in there. The dishwasher is innocent.');
      if (it === 'tomato' && o === 'compost') return say('Gumbo does not want the tomato. Gumbo wants plastic. Keep the tomato for someone who has not eaten a vegetable in two years.');
      if (it === 'gumbo1' && o === 'compost') return say('Gumbo would rather stay in your pocket, thanks. It has had enough compost.');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('You pat yourself down. Mop is back. Gumbo may be about to happen.');
      case 'trays':
        if (v === 'look') return say('A stack of galley trays. Plastic. The sort of thing a Gumbo might find delicious, according to an eight-year-old.');
        f.gotTray = true; give('tray'); return say('You take a tray. Dishwasher-safe. Gumbo-edible, according to a crayon.');
      case 'reader': case 'counter':
        if (v === 'look') return say('The serving counter, with a badge reader for the crew-only drawers. Fourteen months of CONTRACTOR from this reader. It has a tone.');
        if (v === 'search') return say(f.counterOpen ? 'Spoons. Many spoons.' : 'Locked drawers. Crew card holders only, says a Thistle note.');
        return say('The reader waits for a card better than yours.');
      case 'wheel':
        if (v === 'look') return say(f.doorHeld ? 'The door wheel, held fast by a loaf-sized blob with excellent grip.' : 'The corridor door\'s dog wheel. Spin it and the door locks from this side, but the ratchet is worn: it needs something holding it while the dogs seat, and the boarders will be leaning on it from the other side before that happens.');
        if (v === 'use' || v === 'take') return say(f.doorHeld ? 'Held. Gumbo is not letting go.' : 'You spin the wheel. The dogs start to seat, then the ratchet slips and the wheel spins back. It needs holding. For longer than you can hold it with the boarders about to arrive.');
        return say('The wheel is cold and a little loose.');
      case 'corridoor':
        if (v === 'look') return say(f.doorHeld ? 'The corridor door, dogged shut. Someone has tried it from outside twice and gone away.' : 'The corridor door. Through the port, boots at the far end of the corridor, coming this way with a clipboard.');
        if (f.doorHeld) return say('Dogged. Nobody is coming through, and you are not going out that way either. The hydroponics hatch and the service duct are your roads now.');
        return E.die('You open the corridor door to see how far away the boots are.\n\nThe boots are right there. "Conscious crew?" "Kitchen staff." "Bag him."');
      case 'replicator': if (v === 'look') return say('The replicator. OFFLINE for eleven months, since the night the cook asked it for a birthday cake and it produced something that is still in the freezer.'); return say('OFFLINE, it says, hopefully.');
      case 'dishwasher':
        if (v === 'look') return say('A dishwasher the size of a car. Fourteen months since it ran. The cycle is loud enough to be heard on Deck 8, which, now you think about it, is a feature.');
        if (v === 'use' || v === 'search') return runDish();
        return say('It waits for a load.');
      case 'lockerreader': case 'locker':
        if (v === 'look') return say(f.lockerOpen ? 'The tool locker, open. Toolkit, rations and the oven cleaner nobody uses because nobody uses the oven.' : 'The tool locker. Crew card reader, Thistle note. "Tools, rations, chemicals. Crew only. Contractor Tarragon, use your own mop. — THISTLE."');
        if (v === 'search' || v === 'take' || v === 'use') { if (!f.lockerOpen) return has('crewcard') ? openLocker() : say('Locked. Crew card. Thistle issues crew cards, Thistle has said so twice, and Thistle is in hydroponics.'); return takeFromLocker(); }
        return say('The locker hums.');
      case 'compost':
        if (v === 'look') { if (!f.sawCompost) { f.sawCompost = true; pts('compost-look'); } return say(f.gumboOut ? 'The compost unit, lid off, Gumbo-free.' : 'The compost unit. The lid is rattling by itself. Through the gap, something small, green and interested is looking at your badge. The badge is plastic.'); }
        if (v === 'search' || v === 'use' || v === 'take') return f.gumboOut ? say('Compost. Just compost now.') : (has('gumbo1') ? say('Empty, apart from compost. Gumbo is in your pocket, eating a corner of your badge.') : say('You lift the lid. The green thing retreats into the compost and purrs. It wants something. The drawing in your pocket says what.'));
        return say('The lid rattles.');
      case 'hatch': E.gotoRoom('hydro', 290, 150, -1); return;
      default: return say("You can't do that here.");
    }
    function feedCompost(itm) {
      if (f.gumboOut) return say('Gumbo is out. Gumbo is in your pocket. Gumbo does not need more compost.');
      drop(itm); f.gumboOut = true; pts('tray-feed');
      say(`You drop the ${ITEMS[itm].name.toLowerCase()} into the compost unit. There is a sound like a cat eating crisps. Then a fist-sized green blob climbs out onto the rim, burps a tiny plastic burp, and purrs at you. Gumbo.`, () => { f.gotGumbo = true; give('gumbo1'); pts('gumbo'); say('Gumbo climbs onto your badge, considers it, and settles into your coverall pocket instead, purring. You have a stowaway. The stowaway has a stowaway. Ada Pryce, aged eight, is going to want a full report.'); });
    }
    function openLocker() { if (f.lockerOpen) return takeFromLocker(); f.lockerOpen = true; pts('locker'); say('The locker reader takes the crew card, pauses as if to consult Thistle, and clicks open. Toolkit. Three days of rations. A bottle of oven cleaner with a worried skull on it.', takeFromLocker); }
    function takeFromLocker() {
      let got = [];
      if (!f.gotToolkit) { f.gotToolkit = true; give('toolkit'); got.push('the toolkit'); }
      if (!f.gotRations) { f.gotRations = true; give('rations'); pts('rations'); got.push('the rations'); }
      if (!f.gotOven) { f.gotOven = true; give('oven'); pts('oven'); got.push('the oven cleaner'); }
      if (!got.length) return say('The locker is empty now. Thistle will be furious, correctly.');
      say(`You take ${got.join(', ').replace(/, ([^,]*)$/, ' and $1')}. The laminated card in the toolkit says DO NOT GIVE TO CONTRACTORS. Nobody gave it to you.`);
    }
    function dogDoor() {
      if (f.doorHeld) return say('Already held.');
      if (!has('gumbo2')) return say('Gumbo needs to be bigger first.');
      drop('gumbo2'); f.doorHeld = true; pts('wheel');
      say('You spin the wheel and set Gumbo on it. Gumbo grips. The ratchet tries to slip and finds a loaf of determined green blob in the way. The dogs seat, one, two, three, four. Something leans on the door from outside, then leans harder, then goes away.', () => say('Gumbo stays on the wheel, purring, holding a door against four people. You will collect it on the way out. It has earned the rest.'));
    }
    function runDish() {
      if (f.dishRun) return say('The dishwasher is already thundering through a cycle. The whole deck sounds like machinery. Nobody is going to hear a contractor.');
      f.dishRun = true; pts('dish');
      say('You slam the dishwasher and start a cycle. It sounds like a drive test. Out in the corridor someone says "automated systems, leave it," and the boots move off. Noise is a kind of door.');
    }
  };

  HANDLERS.hydro = (v, o, it) => {
    const f = F();
    if (it) {
      if (it === 'roster' && o === 'thistle') return showRoster();
      if (it === 'badge' && o === 'thistle') return say('"CONTRACTOR," says Thistle, as if it were the badge\'s fault. "I can read, Tarragon."');
      if (it === 'notice' && o === 'thistle') return say('Thistle reads the salvage notice with its lamp. "No conscious crew. Technically accurate. I am not crew either. I am equipment. Like you."');
      if (it === 'drawing' && o === 'thistle') return say('"Ada Pryce," says Thistle. "Pod 1,204. She fed my seedlings crayons. The blob I have no record of. I prefer it that way."');
      if (it === 'crewcard' && o === 'thistle') return say('"I issued it," says Thistle. "Do not make me regret it. I will know."');
      if (it === 'crewcard' && o === 'vault') return say('The vault reader looks at an acting crew card and says CAPTAIN\'S SEAL REQUIRED. Nothing on this ship opens for you all the way.');
      if ((it === 'gumbo1' || it === 'gumbo2') && o === 'ties') return takeTies();
      if ((it === 'gumbo1' || it === 'gumbo2' || it === 'gumbo3') && o === 'thistle') return say('Thistle\'s lamp swivels onto Gumbo. Gumbo swivels onto Thistle. "No," says Thistle. "Not in my garden. Pocket."');
      if (it === 'tomato' && o === 'thistle') return say('"That is mine," says Thistle. "It was always mine. Take it before I count the others."');
      if (it === 'wrench' && o === 'vault') return say('The vault door is forty centimetres of alloy. The wrench is not.');
      if (it === 'toolkit' && o === 'tank') return say('The tank is fine. The gauge is fine. Leave the only honest machine on the ship alone.');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('You pat yourself down. Thistle watches you do it, counting.');
      case 'board':
        if (!f.readBoard) { f.readBoard = true; pts('board'); }
        return say('RULES OF HYDROPONICS. 1. CREW ONLY. 2. CREW IS WHO THE ROSTER SAYS. 3. THISTLE DECIDES. 4. CONTRACTORS: SEE RULE 1. Signed, THISTLE, in a font it chose itself.');
      case 'uv': if (v === 'look') return say('UV lamps on a slow cycle. The tomatoes love them. Your eyes do not.'); return say('Out of reach, and Thistle would notice.');
      case 'tomatoes':
        if (v === 'look') return say('Rows of real tomatoes, red, under lamps. Fourteen months in space and this is the best thing you have ever seen. Thistle\'s pruning arm hovers over the ripe one at the end.');
        if (v === 'take' || v === 'eat' || v === 'use' || v === 'search') return takeTomato();
        return say('They smell like a planet.');
      case 'arm': if (v === 'look') return say('Thistle\'s pruning arm. Ceramic shears. It can take a sucker off a vine without the vine noticing. It could take a finger off a contractor the same way.'); return say('You keep your hands away from the arm. The arm appreciates it.');
      case 'thistle':
        if (v === 'look') return say('Thistle. A gardening bot on a ceiling rail, all lamp and shears and opinion. It has run hydroponics for fourteen months without a single crew member to rule over, which has not mellowed it.');
        if (v === 'talk') return talkThistle();
        if (v === 'hit') return E.die('You swing at Thistle. Thistle prunes you.\n\n"Rule 4," it says, over what is left.');
        return say('Thistle watches. Thistle counts.');
      case 'rail': return say('Thistle\'s rail runs the length of the room. Thistle can be anywhere in it in two seconds. Thistle has demonstrated.');
      case 'tank':
        if (v === 'look') return say('The nutrient tank. Nitrogen at 31%, pH 6.1, a gauge that has never once lied, and a drain valve Thistle keeps a lamp on.');
        return say('Thistle\'s lamp swings onto your hand. You take your hand back.');
      case 'vault':
        if (v === 'look') { if (f.gotCrewcard && !f.vaultMatters) return vaultTalk(); return say('The seed vault. SEED STOCK — HYACINTH COLONY — 40,000 CULTIVARS — SEALED, CAPTAIN\'S CODE. The colony\'s entire future, in a cupboard, behind the same eight digits as the captain.'); }
        return say('Sealed with the captain\'s code. Everything that matters on this ship is behind the same eight digits.');
      case 'ties':
        if (v === 'look') return say('A bin of plastic plant ties. Hundreds. Thistle knows exactly how many. Gumbo is looking at them the way you looked at the tomato.');
        return takeTies();
      case 'duct':
        if (v === 'look') return say('A floor grate over the service duct down to engineering. Mop-sized, and, if you breathe out, Wim-sized.');
        if (!f.doorHeld) return say('You lift the grate, then stop. The galley door is still open behind you. Go down now and four people with a clipboard follow you into engineering. Dog the galley door first.');
        if (!f.gotToolkit) return say('You lift the grate, then stop. Whatever is wrong in engineering, a wrench and good intentions will not fix it. Thistle\'s locker had a toolkit in it.');
        if (!f.vaultMatters) return say('You lift the grate, then stop. Thistle said something about the vault that is bothering you. Ask it before you go.');
        f.leftGalley = true;
        say('You collect Gumbo from the door wheel on the way past. The dogs stay seated; Gumbo has made its point. Then you and Mop go down the service duct toward the sound of a jump drive being plotted by someone who should not be plotting it.', () => { give('gumbo2'); startChapter(4); });
        return;
      case 'back': E.gotoRoom('galley', 24, 150, 1); return;
      default: return say("You can't do that here.");
    }
    function talkThistle() {
      if (!f.thistleTalked) { f.thistleTalked = true; pts('thistle-talk'); return say('"Tarragon," says Thistle. "You are in my garden. You are a contractor. There is a notice on the cryo door that says there is no conscious crew aboard and I find it, for once, difficult to disagree with a piece of paper." Its lamp swings over your pockets. "Unless you have something that says otherwise. Rule 2."'); }
      if (!f.gotCrewcard) return say('"Rule 2," says Thistle. "Crew is who the roster says. Show me a roster or get out of my garden."');
      if (!f.vaultMatters) return vaultTalk();
      return say('"Acting crew," says Thistle. "Go and act. And bring my tomato back if you do not use it."');
    }
    function showRoster() {
      if (f.gotCrewcard) return say('"I have read it," says Thistle. "I have issued the card. I am not reading it again."');
      if (!f.thistleTalked) { f.thistleTalked = true; pts('thistle-talk'); }
      f.gotCrewcard = true; give('crewcard'); pts('roster-show');
      say('Thistle takes the roster in a manipulator and reads it with its lamp. Thirty names. Then the last line, in the captain\'s hand. "Tarragon, W. — not crew, do not freeze, someone has to do the floors. — A.O."', () =>
        say('"Not crew," says Thistle, slowly. "On the crew roster. By the captain. In ink." Its lamp dims a fraction. "The roster is the roster. Rule 2." A slot in its chassis prints a card. "TEMPORARY CREW. Acting. Pending the captain, who is asleep, which is your problem."', () =>
          say('You take the crew card. Thistle hands back the roster. "Do not make me regret this," it says. "I will know. I have sensors."')));
    }
    function takeTomato() {
      if (f.gotTomato) return say('You have the tomato. Thistle is counting the others.');
      if (!f.gotCrewcard) return E.die('You reach for the ripe tomato at the end of the row.\n\nThistle\'s pruning arm comes down the rail in two seconds flat and takes the sucker off the vine, and, since it is in the way, most of your hand. "Rule 1," it says.');
      f.gotTomato = true; give('tomato'); pts('tomato');
      say('You take the ripe tomato. Thistle watches you do it and does not prune anything. "Crew ration," it says. "One. Do not come back for two."');
    }
    function takeTies() {
      if (f.gotTies) return say('You have a fistful. Thistle has the rest, counted.');
      if (!f.gotCrewcard) return say('You reach for the bin. Thistle\'s lamp comes on over your hand like a sun. "Six hundred and twelve," it says. "I will know."');
      f.gotTies = true; give('ties');
      say('You take a fistful of plant ties. "Thirty-one," says Thistle. "Crew ration. Your blob is drooling."');
    }
    function vaultTalk() {
      f.vaultMatters = true; pts('vault');
      say('"The salvager asked about the vault," says Thistle, unprompted. "Twice. On the ship\'s channel, before they cut it. Where is the seed stock, what is the cultivar count, is it sealed." Its lamp turns to the vault door. "Nobody asks about seeds twice unless they already know what they are worth. Forty thousand cultivars is a colony. Or a very good year for someone else."');
    }
  };

  // ---------- Chapter 4: engineering ----------
  HANDLERS.drive = (v, o, it) => {
    const f = F();
    if (it) {
      if (it === 'toolkit' && (o === 'intake' || o === 'filter')) return pullFilter();
      if (it === 'filter' && o === 'intake') return putFilter();
      if (it === 'polish' && o === 'intake') return pourIn('polish');
      if (it === 'oven' && o === 'intake') return pourIn('oven');
      if ((it === 'polish' || it === 'oven') && o === 'drive') return say('Not on it. In it. There is an intake for exactly this and a filter in the way.');
      if (it === 'mymop' && o === 'airlockA') return airlock();
      if (it === 'mop' && o === 'airlockA') return say('"The lock will not cycle with me inside," says Mop. "I have a transponder. It thinks I am cargo. I have always been cargo to that door."');
      if (it === 'wrench' && o === 'airlockA') return say('You could jam the wrench in the latch. You would then be outside without a wrench. Something you do not mind losing.');
      if (it === 'toolkit' && o === 'navcore') return say('Ilse is standing at it. You would have to reach around her. She has headphones, not a blindfold.');
      if ((it === 'wrench' || it === 'toolkit') && o === 'ilse') return E.die('You raise the tool. Ilse, who has been an engineer on worse ships than this, turns around at exactly the wrong moment with a bigger one.\n\nVane\'s report will say "contractor, resisting."');
      if (it === 'tomato' && o === 'ilse') return say('Later, maybe. Right now she would notice the hand holding it.');
      if (it === 'crewcard' && o === 'suppression') return say('The test button does not need a card. It needs a thumb.');
      if (it === 'wrench' && (o === 'intake' || o === 'filter')) return say('The housing is a quick-release. It wants the driver from the toolkit, not a wrench.');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('You pat yourself down. Oven cleaner, a toolkit you were told not to have, and a plan that would make Thistle proud and Ilse murderous.');
      case 'ilse':
        if (v === 'look') { if (!f.sawHeadphones) { f.sawHeadphones = true; pts('headphones'); } return say(f.ilseDistracted ? 'Ilse is down the far end of the catwalk, swearing at a suppression nozzle and wiping foam off her headphones.' : 'Ilse. Vellacourt\'s engineer, elbow-deep in the nav core, back to you, big over-ear headphones on, plotting a jump to the yards. She cannot hear you. She turns round every minute or so to check the intake gauge, and she has a wrench on her belt that makes yours look like a spoon.'); }
        if (v === 'talk') return f.ilseDistracted ? say('She is forty metres away under a shower of foam. Not now.') : E.die('"Excuse me," you say, loudly, to be heard over the headphones.\n\nShe hears you. She turns around. She has a wrench too. Hers is bigger.');
        return say('Not while she is there. Not while she is anywhere near.');
      case 'navcore': if (v === 'look') return say('The nav core, open, with a jump plot to the Vellacourt yards building on it. ETA to the jump point: not long enough.'); return say('Ilse is in it up to the elbows. You are not getting a hand in.');
      case 'suppression':
        if (v === 'look') return say('The fire-suppression panel. Zone map, a big red TEST button, and a note: TEST DISCHARGES ZONE 4 (AFT CATWALK). WARN PERSONNEL. Ilse is personnel. Zone 4 is where she is not.');
        return suppress();
      case 'gauge':
        if (v === 'look' || v === 'use') { if (f.filterBack && f.polishIn && f.ovenIn && !f.gaugeRead) { f.gaugeRead = true; pts('gauge'); return say('COOLANT PURITY: 99.8%. The gauge reads after the filter, and the filter is catching everything you poured in, which is the point. For now the loop is clean. In about an hour, when they spin the drive up to jump, the filter will clog solid and the inhibitor will trip and nobody will know why. Ilse will check this gauge and see 99.8%.'); } return say(f.filterOut ? 'COOLANT PURITY: — — —. No filter, no reading. Ilse would notice that in a heartbeat.' : 'COOLANT PURITY: 99.9%. The gauge reads downstream of the filter. It only knows what the filter lets through.'); }
        return say('It is a gauge.');
      case 'filter': case 'intake':
        if (v === 'look') return say(f.filterOut ? 'The intake housing, open. The loop runs past it dark and cold. Anything you put in here goes round the whole drive.' : 'The coolant intake. A quick-release housing with the loop\'s filter cartridge in it, and a gauge downstream. Whatever gets past the filter goes round the drive. Whatever does not, clogs it. Either way is bad for a jump.');
        if (!f.ilseDistracted) return ilseTurns();
        if (v === 'take' || v === 'search' || v === 'use') return f.filterOut ? say('The housing is open. The filter is in your hand. The loop is waiting.') : (has('toolkit') ? pullFilter() : say('A quick-release housing. It wants a driver. Thistle\'s toolkit had one.'));
        return say('The loop ticks.');
      case 'drive': if (v === 'look') return say('The jump drive. Pipes, coolant, the hum of something that bends space when fed. If Ilse finishes the plot, it takes two thousand sleepers to a scrapyard.'); if (v === 'hit') return say('You kick the drive. The drive has been kicked by better.'); return say('Not with your hands. With the loop.');
      case 'catwalk': return say('The catwalk runs the length of the hall. At the far end, Zone 4, the suppression nozzles. At this end, Ilse.');
      case 'chest':
        if (v === 'look') return say('Ilse\'s tool chest. Open. Vellacourt stock, well kept. On top, a pair of ear defenders she is not wearing because she is wearing headphones.');
        if (!f.ilseDistracted) return ilseTurns();
        return say('Good tools. You could take one. You would then be a thief as well as a contractor, and you need the toolkit you have.');
      case 'airlockA':
        if (v === 'look') return say(f.airlockClear ? 'Airlock A, cycled once, ready again. Your mop is somewhere outside it, getting further away.' : 'Airlock A. Hull access. The inner door latch has to be held closed by a second hand while the lock cycles, because this ship was built for crews of thirty, not for one man and a robot the door counts as cargo.');
        return airlock();
      case 'reactordoor': E.gotoRoom('reactor', 24, 150, 1); return;
      default: return say("You can't do that here.");
    }
    function ilseTurns() { return E.die('You put a hand on the intake housing. Behind you, a minute early, Ilse turns around to check the gauge.\n\nShe has a wrench too. Hers is bigger.'); }
    function suppress() {
      if (f.ilseDistracted) return say('Zone 4 is already a snowstorm. Ilse is in it. Work.');
      f.suppressed = true; f.ilseDistracted = true; f.ilseT = 9; if (!E.game.scored.suppression) pts('suppression');
      say('You press TEST. At the far end of the hall, Zone 4 goes off like a Christmas card: foam from six nozzles, a klaxon, a flashing light. Ilse tears her headphones off and runs down the catwalk toward it, swearing in two languages.', () => say('You have until she gets it shut off and walks back. Not long. The intake is right there.'));
    }
    function pullFilter() {
      if (f.filterOut) return say('The filter is already out. Pour.');
      if (f.filterBack) return say('The filter is back in and the loop is fouled behind it. Leave it. Let the gauge lie for you.');
      if (!f.ilseDistracted) return ilseTurns();
      f.filterOut = true; give('filter'); pts('filter-out');
      say('The quick-release quick-releases. You lift the filter cartridge out. It is clean, expensive, and the only thing between the loop and whatever you put in next.');
    }
    function pourIn(what) {
      if (!f.filterOut) return say(f.filterBack ? 'The filter is back in. Anything you pour now hits the filter first and the gauge second, and the gauge will tell on you.' : 'The filter is in the way. It would catch it, and the gauge would read the drop. Pull the filter first.');
      if (!f.ilseDistracted) return ilseTurns();
      if (what === 'polish') { if (f.polishIn) return say('The polish is in.'); drop('polish'); give('canister'); f.polishIn = true; pts('polish-in'); return say('Mop\'s floor polish goes into the loop, all of it, lasting shine, not for coolant loops. The canister hisses: empty of polish, full of propellant. In zero-g that is a very small, very stupid rocket. You keep it.'); }
      if (f.ovenIn) return say('The oven cleaner is in.'); drop('oven'); f.ovenIn = true; pts('oven-in'); say('The oven cleaner goes in after it. Sodium hydroxide meets floor polish somewhere in forty metres of pipe and forms, if the worried skull is right, a soap. A soap that will set like candle wax the moment the loop runs hot. Which it does, at jump.');
    }
    function putFilter() {
      if (!f.filterOut) return say('The filter is in.');
      if (!f.ilseDistracted) return ilseTurns();
      drop('filter'); f.filterOut = false; f.filterBack = true;
      if (f.polishIn && f.ovenIn) { f.jumpInhibited = true; say('You seat the filter and snap the housing shut. The gauge thinks about it and settles at 99.8%. Clean, it says. Downstream of a filter that is about to spend the next hour catching soap.'); }
      else say('You seat the filter and close the housing. The gauge reads clean, which it is, mostly, which is not what you came here to achieve. You can open it again if Ilse goes away again.');
    }
    function airlock() {
      if (f.airlockClear) { E.gotoRoom('hull1', 44, 160, 1); return; }
      if (!f.suitChecked) return E.die('You cycle Airlock A without a suit, to see.\n\nYou see. Briefly.');
      if (!f.jumpInhibited) return say('You have a hand on the lock, then stop. If Ilse finishes that plot and they jump while you are on the hull, you will be a smear on the Vellacourt yards. Deal with the loop first.');
      if (!has('mymop')) return say('The inner latch has to be held shut by a second hand while the lock cycles. Mop cannot come in; the door thinks it is cargo. You need something long, stiff, and that you do not mind losing.');
      f.airlockClear = true; f.mopLost = true; f.mopLeft = true; drop('mymop'); drop('mop'); pts('airlock');
      say('You wedge your mop handle across the inner latch and cycle the lock. The inner door holds. The outer door opens. The pressure goes, and your mop goes with it, past your visor, out, turning slowly, end over end, into the dark.', () =>
        say('"I will find another way round," says Mop, through the inner glass. "I know the ducts. All of them." You nod. You cannot speak. You have just watched your mop leave.', () => { f.inside = false; startChapter(5); }));
    }
  };

  HANDLERS.reactor = (v, o, it) => {
    const f = F();
    if (it) {
      if (it === 'toolkit' && o === 'helmet') return f.gotHelmet ? combine('toolkit', 'helmet') : say('Take the helmet down first.');
      if (it === 'badge' && o === 'suitcheck') return say('SUIT CHECK: NO SUIT. Also: CONTRACTOR, in case you forgot.');
      if (it === 'crewcard' && o === 'suitcheck') return suitCheck();
      if ((it === 'suit' || it === 'helmet' || it === 'o2' || it === 'tether') && o === 'suitcheck') return suitCheck();
      if (it === 'dosimeter' && o === 'glass') return say('The dosimeter reads the glass and goes from green to a colour it does not have a word for. You step back.');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('You pat yourself down. Warm. Everything in here is warm.');
      case 'glass':
        f.glassLooks = (f.glassLooks || 0) + 1;
        if (f.glassLooks >= 3) return E.die('You look at the reactor through the lead glass for a third time, because it is beautiful, which it is.\n\nIt is also the last thing you are ever going to look at properly.');
        return say(f.glassLooks === 1 ? 'Lead glass onto the reactor. A blue glow you should not look at for long. You look at it for a moment longer than that, because nobody has ever let you in here.' : 'You look again. The glow is beautiful. The dosimeter on the hook is not here to tell you to stop, so you tell yourself. Stop.');
      case 'dosimeter':
        if (v === 'look') return say('A dosimeter on a hook by the door. Green. It stays green if you wear it. It stays green if you don\'t, too. It just stops being relevant.');
        f.gotDosimeter = true; give('dosimeter'); return say('You clip the dosimeter to your coverall. Green. Keep it that way.');
      case 'o2': if (v === 'look') return say('An O2 bottle rack with one bottle in it. Half full, the gauge says. Enough for a short walk.'); f.gotO2 = true; give('o2'); pts('o2'); return say('You take the bottle. Half full. A short walk, then. Don\'t take a long one.');
      case 'tether': if (v === 'look') return say('A tether reel. Thirty metres and a clip. The clip is the important part.'); f.gotTether = true; give('tether'); pts('tether'); return say('You take the tether reel. The clip is the important part, your induction video said, fourteen months ago, to a room of thirty crew and one contractor who was not supposed to be there.');
      case 'helmet': if (v === 'look') return say('An EVA helmet on the shelf, visor cracked at the edge. Tape would do. Tape always does.'); f.gotHelmet = true; give('helmet'); return say('You take the helmet. The crack in the visor is a finger long. The toolkit has tape.');
      case 'suit': case 'suitlocker':
        if (v === 'look') return say(f.gotSuit ? 'An empty suit locker.' : 'One EVA suit in the locker. Size L. You are an M. Space does not care, much.');
        if (f.gotSuit) return say('The locker is empty. You are wearing it.');
        f.gotSuit = true; give('suit'); pts('suit'); return say('You climb into the suit. It is a size too big and smells of the first officer. You cinch everything that cinches.');
      case 'suitcheck':
        if (v === 'look') return say('The suit-check terminal. Plug in, stand still, get told what is wrong with you.');
        return suitCheck();
      case 'back': E.gotoRoom('drive', 290, 150, -1); return;
      default: return say("You can't do that here.");
    }
    function suitCheck() {
      if (f.suitChecked) return say('SUIT CHECK: PASS. Already. Go.');
      if (!has('suit')) return say('SUIT CHECK: NO SUIT DETECTED. Put one on.');
      if (!has('helmet')) return say('SUIT CHECK: FAIL — NO HELMET.');
      if (!f.helmetTaped) return say('SUIT CHECK: FAIL — VISOR SEAL. The crack. Tape it. The toolkit has tape.');
      if (!has('o2')) return say('SUIT CHECK: FAIL — NO O2.');
      if (!has('tether')) return say('SUIT CHECK: FAIL — NO TETHER. "The clip is the important part."');
      f.suitChecked = true; pts('suitcheck');
      say('SUIT CHECK: PASS. SIZE MISMATCH NOTED. CINCH TETHER AT WAIST. O2: 50%. HAVE A SAFE WALK, CREW MEMBER. It called you crew. It is a terminal. It still counts.');
    }
  };

  // ---------- Chapter 5: the hull ----------
  HANDLERS.hull1 = (v, o, it) => {
    const f = F();
    if (it) {
      if (it === 'tether' && (o === 'cleats' || o === 'handrail')) { if (f.clipped) return say('Clipped. The clip is doing its job.'); f.clipped = true; pts('clip'); return say('You clip the tether to a cleat by the airlock and give it a tug. Thirty metres. The clip is the important part. The clip is important.'); }
      if (it === 'plate' && o === 'gap') { if (f.gapBridged) return say('Bridged.'); drop('plate'); f.gapBridged = true; pts('gap'); return say('You lay the shield plate across the gap in the handrail and seat its corners in the stanchions. It is exactly the size of the gap, because the same bolt sheared both. Something to hold. Enough.'); }
      if (it === 'plate' && o === 'handrail') return say('The rail is fine. The gap is not.');
      if (it === 'canister' && o === 'stars') return say('You could. You would go very fast in the direction you least wanted. Save it for something that is stuck.');
      if (it === 'tether' && o === 'collar') return say('Thirty metres. The Lien is three hundred.');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('Size M in a size L, outside, on a ship called the Luminous Hyacinth, which is yours in every way but one.');
      case 'airlockout': if (v === 'look') return say('Airlock A, outer door. Your mop went that way. Then everywhere.'); return say('You are not going back in. Aft, to the dish. That is the plan. That is the whole plan.');
      case 'cleats': if (v === 'look') return say('A row of tether cleats by the airlock. Anchor points. The induction video was very clear about anchor points.'); return has('tether') ? (f.clipped ? say('Clipped.') : say('Use the tether on them. The clip is the important part.')) : say('You left the tether inside. The tether was the important part.');
      case 'plate': if (v === 'look') return say('A loose micro-meteorite plate, hanging off one bolt. Square, light, and exactly the size of the gap in the handrail further aft.'); f.gotPlate = true; give('plate'); pts('plate'); return say('You work the plate off its last bolt. It weighs nothing out here, which is a trick it will stop doing the moment you take it inside.');
      case 'gap':
        if (v === 'look') return say(f.gapBridged ? 'The gap, bridged with a shield plate. It will hold a man who holds on.' : 'A two-metre gap in the handrail where a plate came off and took a section with it. Two metres of nothing to hold. You can see the dish beyond it.');
        return cross();
      case 'handrail': if (v === 'look') return say('The handrail runs the length of the spine, hand over hand, all the way aft. Except for the gap.'); return say('You hold the handrail. It holds you back. The gap is the problem.');
      case 'collar': return say('The Lien, clamped to the Hyacinth\'s flank by two docking clamps the size of houses. Its docking collar has a Vellacourt pressure door with a keypad. Somebody over there has the captain\'s code.');
      case 'camera': return say('A hull camera, pointing at Airlock A. On the bridge, if anyone is watching, there is a small man in a large suit waving. You stop waving.');
      case 'stars':
        f.starLooks = (f.starLooks || 0) + 1;
        if (f.starLooks >= 2 && !f.clipped) return E.die('You look up. There is no up. There are more stars than you have ever seen, and for one second you forget to hold on, and the ship rolls away from you very gently, and nothing stops it.\n\nThe clip was the important part.');
        return say('More stars than you have ever seen. More than anyone has. You look for a second too long and your hand tightens on the rail by itself.');
      case 'o2gauge': return say(`The wrist gauge. ${Math.max(0, f.o2 || 0)} careful movements, roughly. The gauge is not a suggestion.`);
      case 'aft': return cross();
      default: return say("You can't do that here.");
    }
    function cross() {
      if (!f.clipped) return E.die('You move aft along the handrail, hand over hand, to the gap, and reach across.\n\nYour glove finds nothing. Your other glove, surprised, lets go. The Hyacinth drifts away from you at the speed of a slow walk, and you are not clipped to anything.');
      if (!f.gapBridged) return say('You reach the gap and lean out. Two metres of nothing. The tether stops you a metre short of the far rail, as tethers do. You swing back. Something to bridge it. There was a loose plate by the airlock.');
      E.gotoRoom('hull2', 30, 160, 1);
      say('You cross the plate hand over hand, which is not what plates are for, and reach the dish on its gimbal, locked toward Vellacourt\'s beacon. Behind it, Airlock C. In front of it, a junction box with a padlock.');
    }
  };

  HANDLERS.hull2 = (v, o, it) => {
    const f = F();
    if (it) {
      if (it === 'toolkit' && (o === 'padlock' || o === 'junction')) { if (f.padlockCut) return say('Cut.'); f.padlockCut = true; pts('padlock'); return say('The cutters go through the Vellacourt padlock like it was a plant tie. The junction box swings open: a mic jack, a transmit key, and a label that says FOR AUTHORITY USE. You are about to use it for authority.'); }
      if (it === 'canister' && o === 'crank') { if (f.crankFree) return say('The crank is free.'); drop('canister'); f.crankFree = true; pts('crank'); return say('You jam the propellant canister against the frozen crank and crack it. A jet of warm gas, a noise you feel rather than hear, and the crank\'s frozen bearing thaws and turns a quarter inch. The canister tumbles away, a very small, very stupid rocket, exactly as advertised.'); }
      if (it === 'wrench' && o === 'crank') return say('You put the wrench on the crank and heave. The crank is frozen solid. The wrench is not the problem. The temperature is.');
      if (it === 'wrench' && o === 'pin') return say('The pin is hand-tight. Hands, then.');
      if (it === 'toolkit' && o === 'dish') return say('The dish is not broken. It is pointed at the wrong people.');
      if (it === 'wrench' && o === 'padlock') return say('A Vellacourt padlock. Hardened. The toolkit has cutters; the wrench has ambitions.');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('A man in a suit on a dish, which is not something anyone has ever written on a roster.');
      case 'junction':
        if (v === 'look') return say(f.padlockCut ? 'The junction box, open. A mic jack, a transmit key, a relay indicator. Whatever the dish is pointed at hears what goes in here.' : 'A junction box for the comms relay with a Vellacourt padlock on it that was not there when you were last outside, which was never.');
        return transmit();
      case 'padlock': if (v === 'look') return say('A Vellacourt padlock on the junction box. Hardened. Somebody did not want the ship talking to anyone but them.'); return has('toolkit') ? say('Cutters. The toolkit has them.') : say('Hardened. You need cutters.');
      case 'dish':
        if (v === 'look') return say(f.dishLocked ? 'The dish, turned to the Lane Authority beacon and locked. Pin in. Relay green.' : 'The comms dish on its gimbal, locked toward Vellacourt\'s beacon. A lock pin through the gimbal, a frozen manual crank, and a relay panel that tells you where it is pointed.');
        if (v === 'use' || v === 'take') return turnCrank();
        return say('It points where it is told.');
      case 'pin': if (v === 'look') return say('The gimbal lock pin, holding the dish where Vellacourt wants it.'); f.gotPin = true; give('pin'); pts('pin'); return say('You pull the lock pin. The gimbal is free, in theory. In practice the manual crank is frozen solid and the dish is not going anywhere until it is persuaded.');
      case 'crank':
        if (v === 'look') return say(f.crankFree ? 'The manual crank, thawed, free to turn.' : 'A manual crank for the gimbal, frozen solid. Thirty years of vacuum will do that. It needs heat, or a shove from something with pressure behind it.');
        return turnCrank();
      case 'panel':
        if (v === 'look' || v === 'use') { if (f.dishLocked && !f.panelRead) { f.panelRead = true; pts('panel'); return say('RELAY: LANE AUTHORITY BEACON 7 — LOCK — CHANNEL OPEN. The ship is pointed at the law. The law is listening. What you say now is on the record.'); } return say(f.dishLocked ? 'RELAY: LANE AUTHORITY BEACON 7 — LOCK.' : 'RELAY: VELLACOURT RECLAMATION — PRIVATE — LOCK. The dish is talking to the people who stole it.'); }
        return say('A readout. It reads out.');
      case 'o2gauge': return say(`The wrist gauge. ${Math.max(0, f.o2 || 0)} careful movements, roughly. Say the words and go inside.`);
      case 'airlockC':
        if (v === 'look') return say('Airlock C. Bridge access. The crew\'s way in. From out here it is just a door with a handle, like all the others.');
        if (!f.broadcast) return say('You have a hand on Airlock C, then stop. The dish is right here and the Authority is one transmission away. Go in now and you have walked the hull for nothing.');
        f.inside = true;
        say('You go in through Airlock C with eleven movements to spare, pop the helmet, and take the suit off in the lock. The air smells of coffee. Real coffee. You are on the bridge deck.', () => { drop('suit'); drop('helmet'); drop('o2'); drop('tether'); startChapter(6); });
        return;
      case 'back': return say('Back across the plate? No. Forward is inside now, through Airlock C.');
      default: return say("You can't do that here.");
    }
    function turnCrank() {
      if (f.dishLocked) return say('The dish is locked on the Authority beacon. Leave it.');
      if (!f.gotPin) return say('The crank will not move with the lock pin through the gimbal. Pull the pin.');
      if (!f.crankFree) return say('You lean on the crank. Frozen. It needs heat, or a shove from something with pressure behind it. You have a canister that is, by its own account, a very small rocket.');
      f.dishLocked = true;
      say('You wind the crank. The dish swings, slowly, off Vellacourt\'s beacon, across a lot of nothing, and onto a steady green pulse to port: LANE AUTHORITY BEACON 7. You drop the pin back in. The relay panel changes its mind about who it works for.');
    }
    function transmit() {
      if (f.broadcast) return say('You have said it. It is on the record. Go inside.');
      if (!f.padlockCut) return say('Padlocked. Vellacourt did not want the ship talking.');
      if (!f.dishLocked) return say('The box is open, but the dish is still pointed at Vellacourt. Anything you say goes straight to the people you are saying it about.');
      E.choose('You plug the suit mic into the jack and press transmit. The Authority\'s auto-responder says: "Lane Authority Beacon 7. State vessel and nature of traffic." What do you say?', [
        { label: '"Luminous Hyacinth, colony transport, conscious crew aboard. Contesting salvage filing under Lane Code 44.7. Request a cutter at the jurisdiction line."', value: 'formal' },
        { label: '"Help. Please. I\'m the janitor. There are two thousand people asleep and some men took the ship."', value: 'help' },
        { label: '"Attention Vellacourt Reclamation: give back the ship or I\'ll tell the Authority you took it."', value: 'threat' }
      ]).then(c => {
        if (c === 'formal') { f.broadcast = true; pts('broadcast'); return say('A pause. Then a human voice: "Hyacinth, Beacon 7. Filing noted as contested by conscious crew. Cutter dispatched to the line, ETA forty minutes. Have your captain ready to answer." Your captain is asleep behind eight digits. You have forty minutes. Go inside.'); }
        if (c === 'help') return say('"Beacon 7 to unidentified. Say again. State vessel and claim, over." Auto-responders do not do pleas. They do vessels and claims. Try again, and say it like crew.');
        say('"Beacon 7 to unidentified: this is a Lane Authority channel. Threats are logged. State vessel and claim, over." You have just threatened a salvager on an official channel, which is not nothing, but is not help either. Try again.');
      });
    }
  };

  // ---------- Chapter 6: the bridge ----------
  HANDLERS.ready = (v, o, it) => {
    const f = F();
    if (it) {
      if ((it === 'coffee' || it === 'tomato') && o === 'brack') return passBrack(it);
      if (it === 'toolkit' && o === 'drawer') { if (f.drawerOpen) return say('Open.'); f.drawerOpen = true; return say('The drawer gives to the driver. Inside: a photograph of the crew on the day they shipped, thirty-one people, one of them holding a mop. On the back, in the captain\'s hand: "Wim — keep the floors. Keep the ship. — A.O." You put it back. You know what it says now.'); }
      if (it === 'badge' && o === 'coffee') return say('The coffee machine does not need a card. It is the one thing on this ship that does not ask.');
      if (it === 'coffee' && o === 'me') return say('You drink a mouthful. Real. Then you stop, because the man in the doorway smelled it before you did and you are going to need the rest.');
      if (it === 'rations' && o === 'brack') return say('"Got a sandwich," says Brack, with his mouth full of it. He eyes the rations without love.');
      if (it === 'crewcard' && o === 'brack') return say('"Thistle issue that?" says Brack. "That bot hates everybody." He does not move.');
      if (it === 'mop' && o === 'lifthatch') return say('"Not yet," says Mop. "Nothing to go down for yet. Everything is up here."');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('You pat yourself down. Crew card, a roster, a notice, and the smell of real coffee. The ready room has done more for you than the rest of the ship.');
      case 'rack': return say('A suit rack with twenty-nine suits on it, one empty hook, and one suit on the floor of Airlock C that you are going to be told to pick up.');
      case 'coffee':
        if (v === 'look') return say('The captain\'s coffee machine. It works. It has beans. The bridge gets real coffee; Deck 9 gets a fountain. You have learned a lot about rank today.');
        if (f.gotCoffee && has('coffee')) return say('You have a cup. Brack is looking at it.');
        f.gotCoffee = true; give('coffee'); if (!E.game.scored.coffee) pts('coffee'); return say('You make a coffee. Real. The smell goes through the bridge door. Brack\'s head turns toward it like a flower.');
      case 'contract':
        if (v === 'look') { if (!f.gotContract) return say('Your own custodial contract, framed, on the captain\'s wall. Clause 9 is highlighted. Someone has written in the margin: "Clause 9 is wrong. Fix at next port. — A.O." She never got to the next port.'); return say('An empty frame where your contract was.'); }
        if (f.gotContract) return say('An empty frame.'); f.gotContract = true; give('contract'); return say('You take the contract out of the frame. Clause 9: "Contractor is not a member of the crew for any purpose." A margin note in the captain\'s hand says it is wrong. A margin note is not a log entry.');
      case 'drawer': if (v === 'look') return say('The captain\'s desk drawer. Locked. A good lock. A toolkit lock.'); return has('toolkit') ? say('Locked. The toolkit driver would do it.') : say('Locked.');
      case 'desk': return say('The captain\'s desk. A locked drawer, a photo frame face-down, a pen that says HYACINTH. You do not sit at it.');
      case 'safe': return say('The wall safe, open and empty. Vane emptied it. Whatever she took is in her quarters on the Lien or in her pocket.');
      case 'brack':
        if (v === 'look') return say('Brack. Two metres of Vellacourt in a doorway, eating a sandwich. He does not look unkind. He looks like a man who does what he is told and is told to stand there.');
        if (v === 'talk') return say('"Can\'t come through," says Brack. "Captain\'s orders." Which captain, you do not ask. He sniffs the air. "Is that coffee?"');
        if (v === 'hit') return E.die('You hit Brack.\n\nBrack notices. Brack puts you down gently, the way you would put down a mop, and goes back to his sandwich. Vane\'s report says "contractor, resisting".');
        return say('Brack fills the doorway and is not going to stop filling it for nothing.');
      case 'bridgedoor':
        if (f.pastBrack) { E.gotoRoom('bridge', 24, 150, 1); return; }
        return say('Brack is in it. All of it.');
      case 'lifthatch':
        if (v === 'look') return say('A hatch in the floor to Mop\'s service lift. Mop-sized. Six decks straight down to the cryo bay, if you were a floor-polishing robot or could fold like one.');
        return say(f.filingVoid ? 'Not yet. You need the code, and the code is on the Lien.' : 'You lift the hatch. Mop\'s lift, far below. You could not fold into it and there is no reason to yet. The reasons are on the bridge.');
      default: return say("You can't do that here.");
    }
    function passBrack(itm) {
      if (f.pastBrack) return say('Brack is already on your side, as far as the door goes.');
      drop(itm); f.pastBrack = true; pts('brack');
      say(itm === 'coffee' ? '"Oh," says Brack, taking the coffee in a hand the size of a tray. He drinks. His eyes close. "Haven\'t had real since Delphi." He steps out of the doorway, not all the way, but enough. "You didn\'t get past me. You were never here."' : '"Is that a tomato?" says Brack. He takes it and bites it like an apple. He is quiet for a long moment. "Two years," he says. He steps out of the doorway. "You didn\'t get past me."');
    }
  };

  HANDLERS.bridge = (v, o, it) => {
    const f = F();
    if (it) {
      if (it === 'notice' && o === 'vane') { if (!f.shownNotice) { f.shownNotice = true; pts('notice-show'); } return say('"My notice," says Vane, pleasantly. "No conscious crew aboard. You are conscious. You are a contractor. The notice stands." She hands it back. She has very good manners for a thief.'); }
      if (it === 'roster' && o === 'vane') { if (!f.shownRoster) { f.shownRoster = true; pts('roster-show2'); } return say('Vane reads the roster. "Not crew," she reads aloud. "In the captain\'s hand. Thank you." Dorrit, without looking up: "Handwritten annotations to a roster do not constitute a crew record. Lane Code 44.7, note (c)." Vane: "There you are."'); }
      if (it === 'contract' && o === 'vane') { if (!f.shownContract) { f.shownContract = true; pts('contract-loss'); } return say('Vane reads clause 9 with real pleasure. "Not a member of the crew for any purpose." She taps the margin note. "A note is not an amendment. Your captain knew that. She wrote FIX AT NEXT PORT. There was no next port." You have just lost an argument with your own contract.'); }
      if (it === 'crewcard' && o === 'vane') return say('"Issued by a gardening robot," says Vane, reading it. "Pending the captain. The captain is asleep." Dorrit: "Temporary cards lapse at the jurisdiction line, note (d)." You are losing on points.');
      if (it === 'logslip' && o === 'vane') return showLog();
      if (it === 'crewcard' && o === 'log') return printLog();
      if (it === 'badge' && o === 'log') return say('CONTRACTOR, says the log console. The ship\'s log does not talk to contractors.');
      if ((it === 'logslip' || it === 'roster' || it === 'notice' || it === 'contract') && o === 'dorrit') return say('Dorrit reads it, nods, and cites a sub-clause at you. He is not on your side. He is on the side of the regulations, which is almost worse.');
      if (it === 'mop' && o === 'filing') return mopFiling();
      if (it === 'coffee' && o === 'vane') return say('"Thank you," says Vane, and takes it, and does not move an inch on anything.');
      if (it === 'tomato' && o === 'vane') return say('"A tomato," says Vane. "From the hydroponics bay I now own." She does not take it. Keep it for someone who would.');
      if (it === 'gumbo2' && o === 'vane') return say('Gumbo looks at Vane\'s plastic epaulettes. You put Gumbo away. Not yet.');
      if ((it === 'wrench' || it === 'toolkit') && (o === 'vane' || o === 'brack' || o === 'dorrit')) return E.die('You raise the tool. Brack does not even put down his sandwich.\n\nVane\'s report says "contractor, resisting."');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('You pat yourself down. Everything you have is paper, and the paper is losing.');
      case 'filing':
        if (v === 'look') return say(f.filingVoid ? 'The salvage filing, with a red VOID across the representative\'s signature and a smiling mop beside it, looking at the floor.' : 'A hologram of the salvage filing, turning slowly. Vessel: LUMINOUS HYACINTH. Claimant: T. VANE. Ship\'s representative: a smiling mop stamp. "Signed for," it says, underneath. Mop signed for a boarding party. Mop can read. Mop cannot, it turns out, read small print.');
        return f.mopArrived ? mopFiling() : say('You put a hand through the holo. It is a filing. It is not here. The signature on it is, somewhere, in a floor-polishing robot.');
      case 'dorrit':
        if (v === 'look') return say('Dorrit. Vellacourt\'s comms officer, reading the Lane Code on a tablet with the concentration of a man who has found his religion. A key on a lanyard round his neck. He has not looked up once.');
        if (v === 'talk') return talkDorrit();
        return say('Dorrit reads on.');
      case 'log':
        if (v === 'look') return say('The ship\'s log console. Every order the captain gave is in it, timestamped, signed. It wants a crew card. Vane has not bothered with it; she has the notice, and the notice is enough for her.');
        return printLog();
      case 'hail': case 'screen':
        if (v === 'look') return say(f.broadcast ? 'The Vellacourt yards on the main screen, ETA 38 minutes. Over them, a blinking Lane Authority hail that Vane has not answered, and in the corner, a cutter icon moving toward the jurisdiction line. Your cutter.' : 'The Vellacourt yards on the main screen. ETA 38 minutes.');
        return say('You reach for the hail. Brack says "Nope," from the door, without looking.');
      case 'helm': if (v === 'use' || v === 'take') return E.die('You put your hands on the helm.\n\nBrack lifts you off it and, for form\'s sake, out of the airlock. Vane\'s report says "contractor, attempted piracy."'); return say('The helm. Locked to Ilse\'s plot. Nobody on the bridge is steering, which is the problem in one sentence.');
      case 'chair': if (v === 'sit' || v === 'use') return E.die('You sit in the captain\'s chair, to make a point.\n\nBrack makes a different point. Vane\'s report says "contractor, insubordinate," which, for a contractor, is a promotion.'); return say('The captain\'s chair. Vane stands beside it, not in it. She knows the difference, which tells you something about her.');
      case 'pocket': if (v === 'take' || v === 'use') return E.die('You reach for Vane\'s breast pocket.\n\nBrack reaches for you. It is not close.'); return say('Vane\'s breast pocket. She patted it when she saw the log, found it empty, and relaxed. The code card is in a jacket, and the jacket is not on her. It is on the Lien.');
      case 'vane':
        if (v === 'look') return say('Captain Thessaly Vane of the Vellacourt Reclamation Fleet. Neat, calm, standing beside the captain\'s chair out of courtesy or superstition. She has the look of someone who has never lost an argument because she picks the ones with paperwork.');
        if (v === 'talk') return talkVane();
        if (v === 'hit') return E.die('You swing at Vane. Brack catches your arm before it finishes the thought.\n\n"Contractor, resisting," says Vane, to Dorrit, who writes it down.');
        return say('Vane waits, pleasantly, for you to run out of paper.');
      case 'brack': if (v === 'talk') return say('"Good coffee," says Brack. He is not going to say anything else in front of Vane. He glances at the sandwich he has been saving, on the collar, and sighs.'); return say('Brack, in the doorway, having been got past once and not planning on twice.');
      case 'readydoor': E.gotoRoom('ready', 280, 150, -1); return;
      default: return say("You can't do that here.");
    }
    function talkVane() {
      if (f.filingVoid && f.knowsPrize) return escort();
      if (f.filingVoid) return say('"Your robot has voided its own signature," says Vane. "Charming. I will refile under my own at the yards, where the filing is assessed, in thirty-six minutes. Was there anything else?" There is. Ask Dorrit what the vault is worth.');
      if (f.sawCode) return say('"A log entry," says Vane. "Deck Officer. Custodial." She has recovered. "The filing stands until a Lane officer rules on it, and the only Lane officer in range is at the yards, where we will be in thirty-six minutes, and where I have friends." She smiles. "Unless you have something else." You have a robot coming up through the floor.');
      if (!f.vaneTalked) { f.vaneTalked = true; return say('"Mr Tarragon," says Vane, who has read your contract. "You are conscious, I grant you. You are not crew. The notice is accurate and the filing is lodged. You are welcome to show me anything you think changes that." She means it. She enjoys this part.'); }
      return say('"Show me something," says Vane. "Paper. I like paper."');
    }
    function talkDorrit() {
      if (f.knowsPrize) return say('"Forty thousand cultivars," says Dorrit, not looking up. "It is in the manifest. Everything is in the manifest."');
      if (!f.sawCode) return say('"Lane Code 44.7," says Dorrit, to the tablet. "Derelict: a vessel without conscious crew in effective command. Note (a): equipment is not crew. Note (b): a duly logged officer is." He reads on. He is reading the Code at you. Listen.');
      f.knowsPrize = true; pts('seed');
      say('"What does Vellacourt want with a colony ship?" you ask. "Two thousand farmers?" Dorrit, still reading: "The colonists are a liability line. The vessel is scrap value. The seed vault is forty thousand cultivars, pre-sold to Vellacourt Agri at —" "Dorrit," says Vane. Dorrit stops. You have your answer. The ship is the wrapping. The seeds are the prize.');
    }
    function printLog() {
      if (f.gotLog) return say('The log has printed what you needed. It will not print it twice; paper is rationed.');
      if (!has('crewcard')) return say('CREW CARD REQUIRED. The log does not talk to badges.');
      f.gotLog = true; give('logslip'); pts('log');
      say('The console takes the crew card and, since you are acting crew pending the captain, lets you query the captain. You ask it for every entry with your name in it. There is one. It prints.', () =>
        say('"03:14. Pod 1,205 (custodial) left unassigned per captain\'s order. Note: Tarragon to remain awake and is hereby assigned duties of Deck Officer (Custodial) for the duration. — A.O." Deck Officer. Officer. Logged, timestamped, signed. Not a note in a margin. An order.'));
    }
    function showLog() {
      if (f.sawCode) return say('Vane has read it. She does not want to read it again.');
      if (!f.gotLog) return say('You do not have a log entry to show her. The console behind Dorrit does.');
      f.sawCode = true; pts('code-seen');
      say('Vane reads the log printout. She reads it twice. Dorrit, without being asked: "A duly logged officer is crew for the purposes of 44.7, note (b). Deck Officer is an officer rank. The vessel was not derelict at the time of filing." Vane\'s hand goes to her breast pocket, where she keeps the thaw code. The pocket is empty. She remembers where the jacket is, and relaxes.', () =>
        say('"A filing error," she says. "Corrected at the yards, with my own signature, in thirty-six minutes. Nobody is waking anyone up before then." Behind you, under the deck plates, something begins to whirr.', () => mopArrives()));
    }
    function mopArrives() {
      f.mopArrived = true; f.mopProud = true; give('mop'); pts('mop-stamp');
      say('A floor plate lifts. Mop comes up through it, backwards, humming. "Wim! All the ducts! I did all of them!" It sees the holo. It sees the stamp. "That is MY stamp," it says, with enormous pride. "On a DOCUMENT."');
    }
    function mopFiling() {
      if (f.filingVoid) return say('"I withdrew it," says Mop. "It is withdrawn. I am sorry."');
      if (!f.mopArrived) return say('Mop is not here yet.');
      f.filingVoid = true; pts('filing');
      say('"Mop," you say. "What did Captain Okonjo tell you about signing for things?" Mop\'s hum drops a tone. "Cleaning supplies. Only cleaning supplies. Sub-minds do not sign for the ship." A long pause. "The crate did not say cleaning supplies. I was excited."', () =>
        say('Mop rolls to the holo, extends a manipulator, and presses its stamp against the signature line, backwards. The stamp reads WITHDRAWN. The holo flickers and a red VOID goes across the representative\'s signature. "There," says Mop quietly. "I am not allowed to be the ship."', () =>
          say('Vane watches this with no expression at all. "A void signature," she says. "I will refile under my own at the yards. It changes the paperwork. It does not change the clamps." Brack, from the door: "Unless someone drops them." Vane: "Brack."')));
    }
    function escort() {
      if (f.escorted) return;
      f.escorted = true;
      say('"I think we are done," says Vane. "Brack, Mr Tarragon is chattel under the filing until it is assessed. Chattel travels with the vessel. Put him on the collar with the rest of the delivery, and lock the door." Brack looks at you, and at the coffee cup, and at Vane, and does what he is told.', () => startChapter(7));
    }
  };

  // ---------- Chapter 7: the Lien ----------
  HANDLERS.collar = (v, o, it) => {
    const f = F();
    if (it) {
      if (it === 'crateslip' && o === 'keypad') return keypad();
      if (it === 'mop' && o === 'pressdoor') return f.clampsBlown ? runHome() : say('"I could hold a door," says Mop, thoughtfully. "I have torque. There is no door to hold yet."');
      if (it === 'wrench' && o === 'keypad') return E.die('You lever the keypad off the wall with the wrench. It comes off. It also says, to every speaker on the Lien, INTRUSION, COLLAR.\n\nBrack comes back for his sandwich and finds you.');
      if (it === 'toolkit' && o === 'keypad') return say('You could bypass it. The alarm circuit is the first thing the cutters would hit. The slip in the crate had a code on it. Read the slip.');
      if (it === 'sandwich' && o === 'me' && v === 'eat') return say('It is Brack\'s. He will want it back. Something on the Lien wants it more.');
      if (it === 'toolkit' && o === 'crate') return say('The crate is open already. It was delivered.');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('You pat yourself down. Chattel, apparently. Chattel with a toolkit.');
      case 'window': case 'mymop-out':
        if (o === 'mymop-out' || v === 'look') return say((f.tick || 0) % 2 === 0 ? 'Through the hull window, right on time, your mop drifts past, end over end, catching the light. Mop watches it go. "It is doing very well," Mop says.' : 'Through the hull window: stars, the Hyacinth\'s flank, and no mop. Give it a minute. It comes round.');
        return say('A window. You are not going out of it. You have been outside once today.');
      case 'crate':
        if (v === 'look') { if (!f.sawCrate) { f.sawCrate = true; pts('crate'); } return say(f.gotSlip ? 'The Vellacourt crate, lid off, packing foam shaped like four people. Brack has told you to wait in it. You have decided not to.' : 'The Vellacourt crate the "delivery" came in. Lid off, packing foam shaped like four people, and a delivery slip taped inside the lid.'); }
        if (v === 'search' || v === 'use' || v === 'take') { if (!f.sawCrate) { f.sawCrate = true; pts('crate'); } return takeSlip(); }
        if (v === 'sit') return say('You sit in the crate, as instructed, for one second, to see how it feels. It feels like chattel. You get out.');
        return say('A crate. It has done its job.');
      case 'sandwich':
        if (v === 'look') return say('Brack\'s sandwich, on the crate, saved for later. He mentioned it. He will want it back. Something on the Lien may want it more.');
        f.gotSandwich = true; give('sandwich'); return say('You take Brack\'s sandwich. You feel bad about it, briefly.');
      case 'pressdoor':
        if (v === 'look') return say(f.inLien ? (f.mopHeld ? 'The pressure door, held open by a floor-polishing robot with its wheels locked and its motor screaming.' : 'The pressure door into the Lien, open, waiting for the code to close it again.') : 'A Vellacourt pressure door into the Lien. Keypad. Four digits. Through the port, a hold full of other ships\' things.');
        if (f.clampsBlown) return runHome();
        return f.inLien ? (E.gotoRoom('hold', 24, 150, 1), undefined) : keypad();
      case 'keypad': if (v === 'look') return say('A four-digit keypad. Three tries, says a sticker, then it tells everyone.'); return keypad();
      case 'rack': if (v === 'look') return say('A tool rack with nothing on it that is not bolted down. Vellacourt have done this before.'); return say('Bolted. All of it.');
      case 'back':
        if (f.clampsBlown) return runHome();
        return say('Brack locked the Hyacinth door behind him. The only way off the collar is into the Lien.');
      default: return say("You can't do that here.");
    }
    function takeSlip() {
      if (f.gotSlip) return say('Packing foam, four people deep. The slip is in your pocket.');
      f.gotSlip = true; give('crateslip'); pts('slip'); say('You peel the delivery slip off the crate lid. "DELIVERY: 1 x boarding party. Signed for by: [smiling mop]. Keypad code for return: 4471." They wrote the code on the delivery note. They always do.');
    }
    function keypad() {
      if (f.inLien) { E.gotoRoom('hold', 24, 150, 1); return; }
      if (!f.gotSlip) return say('Four digits. You do not know them. The crate the boarders came in has paperwork in it; Vellacourt love paperwork.');
      E.choose('The keypad waits. Four digits.', [{ label: '4471', value: '4471' }, { label: '1744', value: '1744' }, { label: '7414', value: '7414' }]).then(c => {
        if (c === '4471') { f.inLien = true; pts('keypad'); return say('The keypad goes green. The pressure door grinds open onto the Lien\'s salvage hold: shelves of other ships\' things, and the smell of a cat.', () => { E.gotoRoom('hold', 24, 150, 1); }); }
        f.padTries = (f.padTries || 0) + 1;
        if (f.padTries >= 2) return E.die('The keypad goes red a third time and says, to every speaker on the Lien, INTRUSION, COLLAR.\n\nBrack comes back for his sandwich and finds you holding it.');
        say(`Red. "${3 - f.padTries} ATTEMPTS REMAINING." The slip in your pocket has the code on it. Read it.`);
      });
    }
    function runHome() {
      if (f.leftLien) return;
      if (!has('mop')) return E.die('The pressure door is cycling closed and there is nothing to hold it. You get a shoulder in the gap.\n\nThe door does not care about shoulders.');
      f.leftLien = true; f.mopHeld = true; pts('run');
      say('The pressure door starts to close. Mop gets under it, locks its wheels, and pushes up with every watt a floor polisher has. The door stops, screaming, a Wim\'s width open. "GO," says Mop, in a voice you have never heard it use.', () =>
        say('You go. Through the gap, onto the collar, through the Hyacinth\'s hatch, which Brack did not relock because Brack is on the Hyacinth looking for his sandwich. Mop comes through behind you, bent, smoking slightly, humming.', () =>
          say('Behind you the Lien drifts off the hull with its loot, its cat, its captain\'s jacket and no code card. Ahead, six decks down, a captain, and a clock the Lane Authority is keeping.', () => startChapter(8))));
    }
  };

  HANDLERS.hold = (v, o, it) => {
    const f = F();
    if (it) {
      if (it === 'crewcard' && o === 'manifest') return say('The Lien\'s manifest reads a Hyacinth crew card and says OTHER VESSEL. Then it says INVENTORY? as if you were an item.');
      if (it === 'mop' && o === 'lights') return say('"I can see in the dark," says Mop. "I have sensors. You do not. Decide."');
      if ((it === 'gumbo2' || it === 'gumbo3') && o === 'drone') return say('Gumbo looks at the drone. The drone has a lot of plastic trim. "Later," you say. You mean it.');
      if (it === 'sandwich' && o === 'drone') return say('The drone does not eat. It files.');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('Among other ships\' property, you fit right in. That is the problem with the whole day.');
      case 'nameplates': return say('A shelf of nameplates from other ships. KESTREL. ORMOND VALE. SECOND CHANCE. Vellacourt have done this before, and nobody woke up to argue.');
      case 'bike': if (v === 'take' || v === 'use') return say('A child\'s bicycle, salvaged. You are not taking it. You are going to remember it.'); return say('A child\'s bicycle with stabilisers. From the ORMOND VALE, by the tag. Somebody\'s. Not Vellacourt\'s.');
      case 'bells': if (v === 'use' || v === 'hit') return say('You touch a bell. It rings, once, soft. Down the right-hand corridor, a man says "Hm?" and goes back to reading.'); return say('Ship\'s bells, a dozen, each with a name. The bell is the last thing they take. It is the thing that proves the ship was a ship.');
      case 'shelves': return say('Shelves of salvage. Nameplates, bells, a bicycle, a row of pods that are empty because the people who were in them are in a yard somewhere, legally.');
      case 'emptypods': if (v === 'use' || v === 'sit') return say('You are not getting in a pod on this ship. You have seen where the pods go.'); return say('Six empty cryo pods, Vellacourt stock. For moving people who are, technically, cargo. One of them has a label with your name on it, already printed.');
      case 'manifest':
        if (v === 'look' || v === 'use') return say('The Lien\'s manifest. HYACINTH: 2,030 pods (liability), vessel (scrap), SEED VAULT (40,000 cultivars, buyer: VELLACOURT AGRI, status: SOLD). Sold. Before they even had the code.');
        return say('A terminal. It lists things. It would list you.');
      case 'lights':
        if (v === 'look') return say(f.lightsOff ? 'The light switch, off. The hold is lit by the manifest screen and Mop\'s eyes.' : 'A light switch for the hold and the corridors off it. Industrial. Clunky. Off would be very off.');
        f.lightsOff = !f.lightsOff; if (f.lightsOff && !E.game.scored.lights) pts('lights');
        return say(f.lightsOff ? 'You throw the switch. The hold and both corridors go dark. Down the right-hand corridor, Dorrit\'s tablet glows, and he keeps reading by it, which tells you everything about Dorrit.' : 'You throw the switch back. Lights. Dorrit does not notice either way.');
      case 'drone':
        if (v === 'look') return say('A cargo drone asleep on its rail. Six arms. It picks things up and files them on shelves. It is not fussy about what counts as a thing.');
        return E.die('You poke the cargo drone. It wakes up, assesses you, picks you up with four arms and files you on the top shelf between a bell and a bicycle, with a label.\n\nThe label says MISC.');
      case 'qcorridor':
        if (v === 'look') return say('The left corridor, to the crew quarters. Vane\'s cabin is the neat one.');
        E.gotoRoom('quarters', 290, 150, -1); return;
      case 'ccorridor':
        if (v === 'look') return say(f.polished ? 'The right corridor, to the clamp room. The floor has a shine on it you could shave in. Mop\'s work. Nobody should walk on it quickly.' : 'The right corridor, to the clamp room. Dorrit is at the far end, reading. The floor is scuffed Vellacourt deck plate.');
        E.gotoRoom('clamps', 24, 150, 1); return;
      case 'collardoor': E.gotoRoom('collar', 280, 150, -1); return;
      default: return say("You can't do that here.");
    }
  };

  HANDLERS.quarters = (v, o, it) => {
    const f = F();
    if (it) {
      if (it === 'sandwich' && o === 'cat') { if (f.catMoved) return say('Precedent has eaten. Precedent has gone.'); drop('sandwich'); f.catMoved = true; pts('cat'); return say('You put Brack\'s sandwich down on the far side of the bunk. Precedent looks at you, at the sandwich, at the jacket it is guarding, and decides, with the whole weight of case law, that the sandwich is more binding. It moves. The pocket is yours.'); }
      if ((it === 'rations' || it === 'tomato') && o === 'cat') return say('Precedent sniffs it and looks at you with contempt. Precedent has standards. Precedent wants the sandwich.');
      if (it === 'toolkit' && o === 'lockbox') { if (f.lockboxOpen) return say('Open.'); f.lockboxOpen = true; f.gotKeyB = true; give('keyB'); pts('lockbox'); return say('The lockbox gives to the driver on the third try. Inside: a Vellacourt bond certificate, a photo of a cat, and a clamp key on a tag that says B. Vane keeps one. Dorrit wears the other. A compliment to Dorrit, or an insult.'); }
      if (it === 'wrench' && o === 'lockbox') return say('You could smash it. The cat would tell someone.');
      if ((it === 'gumbo2' || it === 'gumbo1') && o === 'qvent') return eatVent(it);
      if (it === 'gumbo3' && o === 'qvent') return say('Gumbo has eaten the vent. Gumbo is full. Gumbo is a cat now.');
      if ((it === 'gumbo2' || it === 'gumbo3') && o === 'cat') return say('Precedent and Gumbo look at each other across a gap of several evolutionary lines. Neither blinks. You end it.');
      if (it === 'toolkit' && o === 'jacket') return say('You are not cutting a pocket off a jacket while a cat watches.');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('In Vane\'s mirror: a contractor in a captain\'s cabin, which is a kind of promotion.');
      case 'bunk': if (v === 'sit' || v === 'use') return say('You sit on Vane\'s bunk for one second. Precedent watches you do it. You stand.'); return say('A bunk, made with corners you could cut yourself on. A reading lamp. A book of Lane Code with Dorrit\'s notes in it.');
      case 'lockbox': if (v === 'look') return say('A lockbox bolted to the desk. Steel. A good lock. A toolkit lock.'); return has('toolkit') ? say('Locked. The toolkit driver would have it.') : say('Locked.');
      case 'desk': return say('Vane\'s desk. A lockbox, a logbook open to a clean page, and a framed Vellacourt commendation for "efficiency in reclamation".');
      case 'lamp': if (v === 'use') return say('You turn the reading lamp on and off. Precedent does not move. Precedent has seen lamps.'); return say('A reading lamp over the bunk. Warm. The cat prefers the jacket.');
      case 'jacket':
        if (v === 'look') return say(f.catMoved ? 'Vane\'s uniform jacket on its hook, breast pocket buttoned.' : 'Vane\'s uniform jacket on a hook, and directly beneath it, sitting on the deck like a sandbag, a cat.');
        if (f.catMoved) return pocket();
        return catAttack();
      case 'jpocket': return pocket();
      case 'cat':
        if (v === 'look') return say('Precedent. A grey cat the size of a small dog, sitting under Vane\'s jacket with the expression of a judge who has already decided. A collar tag reads PRECEDENT — IF FOUND, YOU HAVE NOT.');
        if (v === 'talk') return say('"Good cat," you say. Precedent does not accept the characterisation.');
        if (v === 'take' || v === 'use' || v === 'hit') return catAttack();
        return say('Precedent watches.');
      case 'qvent':
        if (v === 'look') return say(f.gumboLarge ? 'The bulkhead vent, stripped to bare metal. Gumbo was thorough.' : 'A bulkhead vent lined with Vellacourt plastic insulation, the thick kind. There is enough in there to feed a Gumbo for a week, or to make one a lot bigger in about a minute.');
        return say('A vent. Something in your pocket is very interested in it.');
      case 'qdoor': E.gotoRoom('hold', 180, 150, -1); return;
      default: return say("You can't do that here.");
    }
    function catAttack() {
      f.catTries = (f.catTries || 0) + 1;
      if (f.catTries >= 3) return E.die('You reach for the jacket a third time.\n\nPrecedent files a claim on your face, your throat, and, on appeal, your hands. Vane finds you later and writes "contractor, cat" in the log.');
      return say(f.catTries === 1 ? 'You reach for the jacket. Precedent, without appearing to move, puts four lines down the back of your hand. You withdraw the motion.' : 'You reach again. Precedent puts four more lines next to the first four, neatly, like a ledger. Something else. Food, perhaps. Not rations. Precedent is a cat with a position.');
    }
    function pocket() {
      if (f.gotCode) return say('The pocket is empty. The code is in yours.');
      if (!f.catMoved) return catAttack();
      f.gotCode = true; give('codecard'); pts('jacket');
      say('You unbutton the breast pocket. A card on Vellacourt stock: eight digits, and on the back, in Vane\'s hand, OKONJO. The captain\'s thaw code, lifted off her pod display while she slept, kept in a jacket under a cat. You have it. Now get off this ship.');
    }
    function eatVent(itm) {
      if (itm === 'gumbo1') return say('Gumbo eats a corner and looks dizzy. It needs to work up to this. Thistle\'s ties first.');
      drop('gumbo2'); give('gumbo3'); f.gumboLarge = true; pts('gumbo-vent');
      say('You hold Gumbo up to the vent. It eats the insulation like a child eating candyfloss, lining and all, and swells in your hands to the size of a cat, with something very like shoulders. It burps, politely. It could hold a key now. It looks like it would like to be asked.');
    }
  };

  HANDLERS.clamps = (v, o, it) => {
    const f = F();
    if (it) {
      if (it === 'mop' && (o === 'corridor' || o === 'dorrit')) return polish();
      if (it === 'keyA' && (o === 'keyA' || o === 'panel')) { if (f.keyAIn) return say('Key A is in.'); drop('keyA'); f.keyAIn = true; return say('Key A goes into keyhole A and stops, waiting for its partner a metre away. Two keys, two hands, one metre. The Lien was designed by someone who had been betrayed.'); }
      if (it === 'keyB' && (o === 'keyB' || o === 'panel')) return say('Key B goes in. You hold it. Keyhole A is a metre to the left. You have two hands and they are both here. You need a third, and it should be green.');
      if (it === 'keyA' && o === 'keyB') return say('Wrong hole. A is A.');
      if (it === 'gumbo3' && (o === 'keyB' || o === 'panel')) { if (!f.gumboHasKey) return say('Gumbo would need the key first. Give it key B.'); if (f.gumboOnB) return say('Gumbo is on B, holding.'); f.gumboOnB = true; drop('gumbo3'); return say('You set Gumbo on the panel at keyhole B. It puts the key in with great concentration and looks at you. "On three," you say. Gumbo does not know three. Gumbo knows you.'); }
      if ((it === 'gumbo2' || it === 'gumbo1') && (o === 'keyB' || o === 'panel')) return say('Gumbo is not big enough to turn a key. Gumbo would like to be.');
      if (it === 'wrench' && o === 'lever') return say('The lever is not stuck. It is locked by two keys, and no wrench is two keys.');
      if (it === 'wrench' && o === 'panel') return say('You could smash the panel. The clamps are designed to fail locked. Vellacourt have been betrayed before.');
      if ((it === 'logslip' || it === 'notice') && o === 'dorrit') return say('Dorrit reads it, nods, cites note (d), and does not get up.');
      if (it === 'coffee' && o === 'dorrit') return say('"I don\'t," says Dorrit, reading.');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('Your reflection in the pressure gauge: round, worried, correct.');
      case 'hydraulics': return say('Clamp hydraulics the size of tree trunks. Two docking clamps hold the Lien to the Hyacinth. Drop them and the Lien drifts off with everything on it, including Vane\'s way of refiling before the Authority arrives.');
      case 'keyA': return say(f.keyAIn ? 'Keyhole A, with key A in it, waiting.' : 'Keyhole A. Dorrit\'s key, by the lanyard round his neck.');
      case 'keyB': return say(f.gumboOnB ? 'Keyhole B, with a green cat-sized blob holding key B in it, looking at you.' : 'Keyhole B. Vane\'s key, wherever Vane keeps it.');
      case 'panel':
        if (v === 'look') return say('A two-key release panel. Keyholes a metre apart, to be turned together. Then the lever. It takes two people, or one person and something that can hold a key and take instruction.');
        return turnKeys();
      case 'lever':
        if (v === 'look') return say('The release lever, behind the two-key panel. Red. Satisfying-looking.');
        return pullLever();
      case 'pgauge': return say(f.clampsBlown ? 'CLAMP PRESSURE: 0. The Lien is free. So, shortly, is the pressure door.' : 'CLAMP PRESSURE: NOMINAL. Both clamps locked.');
      case 'dorrit':
        if (v === 'look') return say('Dorrit, on a stool by the speaker, reading the Lane Code by tablet light. Clamp key A on a lanyard round his neck. He has not noticed you. He would not notice a fire.');
        if (v === 'talk') return say('"Note (d)," says Dorrit, not looking up. "Temporary cards lapse at the jurisdiction line." Then, after a moment: "You should not be here. I will mention it. Later." He turns a page.');
        if (v === 'take' || v === 'use') return E.die('You reach for the lanyard.\n\nDorrit, who has read the section on assault, applies it. He is much faster than a man who reads should be. Vane\'s report says "contractor, theft."');
        if (v === 'hit') return E.die('You hit Dorrit. He drops the tablet, which is the first thing that has upset him all day.\n\nHe is very upset. Vane\'s report says "contractor, assault, also broke a tablet."');
        return say('Dorrit reads.');
      case 'speaker':
        if (v === 'look') return say('The clamp room loudspeaker, with a talk key. It carries to the hold and both corridors. Vane uses the comm, not the tannoy; Dorrit would know her voice, but he might not know the difference between an order and a recording.');
        return announce();
      case 'corridor':
        if (v === 'look') return say(f.polished ? 'The corridor back to the hold, polished to a shine you could not stand up on. Mop is very proud. Walk on the edges.' : 'The corridor back to the hold. Scuffed plate. Dorrit walks it four times a day without looking up.');
        E.gotoRoom('hold', 220, 150, -1); return;
      default: return say("You can't do that here.");
    }
    function polish() {
      if (f.polished) return say('"It is done," says Mop. "It is perfect. Please do not walk on it."');
      if (!f.lightsOff) return say('"I could," says Mop, looking at the corridor. "But Dorrit would see the shine. People see shine. Nobody sees a floor in the dark."');
      f.polished = true; pts('mop-polish');
      say('Mop goes down the dark corridor to the hold and back, twice, humming, laying down the best floor polish of its life on Vellacourt deck plate. When it comes back the corridor is a skating rink. "Nobody should walk on it," says Mop. "Quickly."');
    }
    function announce() {
      if (f.dorritSlid) return say('The speaker crackles. Dorrit, from the far end of the corridor, says "Ow."');
      if (!f.polished || !f.lightsOff) { f.annTries = (f.annTries || 0) + 1; return say(f.annTries === 1 ? 'You key the speaker and say, in your best Vane: "Dorrit. Hold. Now." Dorrit looks up, for the first time. "The captain uses the comm," he says, and looks back down. You have one more of those in you, maybe. Make it count.' : 'You key the speaker again. Dorrit does not even look up this time. "Comm," he says. "Not tannoy." If he does get up, he will walk down that corridor. Think about the corridor.'); }
      f.dorritSlid = true; f.gotKeyA = true; give('keyA'); pts('keyA');
      say('You key the speaker and say, in Vane\'s voice, which you have had all day to learn: "Dorrit. Hold. Now. Bring the key." Dorrit sighs, stands, tucks the tablet under his arm, and sets off down the dark corridor at a brisk reading pace.', () =>
        say('There is a sound like a man discovering physics. Dorrit goes the length of the corridor on his back, still holding the tablet, and comes to rest against the hold bulkhead. The lanyard does not come with him. It comes off at the first bend, and the key slides to a stop at your feet. Clamp key A.', () =>
          say('"Note (f)," says Dorrit faintly from the hold. "Floors." He does not get up. Mop, quietly: "That is the best thing a floor has ever done."')));
    }
    function turnKeys() {
      if (f.keysTurned) return say('Both keys are turned. The lever is live.');
      if (!f.keyAIn) return say('Keyhole A is empty. Dorrit has the key.');
      if (!f.gumboOnB) return say('Keyhole B is empty, and you have one hand on A. You need something to hold B and turn when you say.');
      f.keysTurned = true; pts('turn');
      say('"Now," you say. You turn A. Gumbo turns B. The panel goes from red to amber to a green that means the lever is live and the Lien is about to be a free ship. Gumbo lets go of the key and climbs back into your pocket, exhausted and very pleased.', () => { give('gumbo3'); E.renderInv(); });
    }
    function pullLever() {
      if (f.clampsBlown) return say('Pulled. The clamps are gone. The door is closing. Run.');
      if (!f.keysTurned) return say('The lever is locked. Two keys, turned together. Then the lever.');
      f.clampsBlown = true; f.doorT = 7; pts('lever');
      say('You pull the lever. Two sounds like the ends of the world, one after the other, and the Lien is free: drifting off the Hyacinth\'s flank at the speed of a slow walk. A voice says: COLLAR SEPARATION. PRESSURE DOOR CLOSING IN SIXTY SECONDS.', () => say('Sixty seconds. The hold, the collar, the door. Mop is already moving. Run.'));
    }
  };

  // ---------- Chapter 8: thaw ----------
  HANDLERS.lift = (v, o, it) => {
    const f = F();
    if (it) {
      if (it === 'mop' && o === 'buttons') return ride();
      if (it === 'codecard' && o === 'buttons') return say('Wrong keypad. This one has four buttons and they say decks.');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('Folded into a lift built for a robot, with a code in your pocket and a captain six decks down.');
      case 'buttons':
        if (v === 'look') return say('Four deck buttons at Mop height. CRYO is the bottom one. The lift will not move with its door obstructed, and you are the obstruction.');
        return ride();
      case 'estop': if (v === 'look') return say('An emergency stop. Red. Mop has pressed it once, for fun, and was spoken to.'); return say('You press it. Nothing is moving, so nothing stops. Mop looks at you the way the captain looked at Mop.');
      case 'hatch':
        if (v === 'look') return say('A hatch in the lift roof. If you folded yourself through it and sat on top of the car, the door would close and Mop could drive.');
        if (f.folded) return say('You are already on the roof, folded.');
        f.folded = true; return say('You fold yourself up through the roof hatch and sit on top of the lift car in the dark shaft, knees under your chin. Below, Mop says: "Ready?" You are not. "Ready," you say.');
      case 'liftdoor': return say('Out there is the ready room, Vane, Brack, and the long way round, which is Brack. Down is the only way.');
      default: return say("You can't do that here.");
    }
    function ride() {
      if (!f.folded) return say('The lift door will not close with a Wim-shaped obstruction in it. "Roof," says Mop. "Fold."');
      f.rodeLift = true; pts('lift');
      say('Mop presses CRYO. The door closes. The lift drops six decks at a speed designed for a robot that cannot feel its stomach, with you on the roof holding the cable and your lunch.', () =>
        say('The lift stops. You unfold onto the crew gallery, where the thaw console is waiting for eight digits, and from the stairs comes the sound of someone much heavier than you, climbing.', () => { f.brackArrived = true; E.gotoRoom('gallery2', 100, 150, 1); }));
    }
  };

  HANDLERS.gallery2 = (v, o, it) => {
    const f = F(), g = G();
    if (it) {
      if (it === 'codecard' && (o === 'thawconsole' || o === 'okonjo')) return enterCode();
      if ((it === 'rations' || it === 'tomato' || it === 'coffee') && o === 'brack2') return stall(it);
      if ((it === 'gumbo3' || it === 'gumbo2') && o === 'brack2') return say('Brack looks at Gumbo. Gumbo looks at Brack. "No," says Brack, who has seen things in holds. He keeps coming. Slower.');
      if (it === 'logslip' && o === 'brack2') return say('"I don\'t read," says Brack. "Dorrit reads." He keeps coming.');
      if ((it === 'wrench' || it === 'toolkit') && o === 'brack2') return E.die('You raise the tool at Brack.\n\nBrack is sorry about it, you can tell. Vane\'s report says "contractor, resisting," for the last time.');
      if (it === 'badge' && o === 'thawconsole') return say('CONTRACTOR, says the console, out of habit.');
      if (it === 'crewcard' && o === 'thawconsole') return say('The console reads the crew card and asks for eight digits. It does not ask for your opinion.');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('Eight digits in your pocket and a very large man on the stairs.');
      case 'brack2':
        if (v === 'look') return say('Brack, at the top of the stairs, breathing hard, between you and nothing in particular. He does not look like he wants to be here. He looks like a man who was told to be here.');
        if (v === 'talk') return talkBrack();
        if (v === 'hit') return E.die('You hit Brack.\n\nBrack, who has been patient all day, stops being patient. He puts you in a pod. It is not even cold yet.');
        return say('Brack takes a step. Only one.');
      case 'crewpods': return say('Thirty crew, asleep, about to have the strangest first day back of their lives.');
      case 'okonjo':
        if (v === 'look') return say(f.codeEntered ? 'The captain\'s pod, frost clearing, THAW IN PROGRESS, a hand that was folded now flat on the glass.' : 'The captain, asleep, behind eight digits you now have.');
        if (v === 'use' || v === 'talk' || v === 'take') return wake();
        return say('She sleeps. Not for long.');
      case 'thawconsole':
        if (v === 'look') return say(f.codeEntered ? 'THAW IN PROGRESS. The console has stopped asking questions.' : 'The thaw console. Eight digits. You have them.');
        return enterCode();
      case 'stairs': return say('Down is Brack. Up is Brack. Brack is the stairs now.');
      default: return say("You can't do that here.");
    }
    function enterCode() {
      if (f.codeEntered) return say('The code is in. The thaw is running. Brack is the problem now.');
      if (!has('codecard')) return say('Eight digits. You do not have them.');
      f.codeEntered = true; pts('code');
      say('You type the eight digits from the card. The console thinks about it for the longest second of your life, and then the captain\'s pod sighs and begins to warm. THAW IN PROGRESS: 90 SECONDS. Behind you, Brack reaches the top of the stairs.', () => say('"Step away from the console, Wim," says Brack. He knows your name. He has had it all day. He takes one step toward you.'));
    }
    function stall(itm) {
      if (f.brackStalled) return say('Brack is sitting on the stairs, eating. He has stopped.');
      if (!f.brackArrived) return say('Brack is not here yet.');
      drop(itm); f.brackStalled = true; pts('brack-stall');
      say(itm === 'rations' ? 'You hold out three days of crew rations. Brack, who has been living on one sandwich, which you took, looks at them for a long moment. "Flavour: Food," he reads. He takes them. He sits down on the top stair. "I didn\'t see you," he says, opening one. "I was eating."' : itm === 'tomato' ? 'You hold out the tomato. Brack takes it in both hands like something holy. He sits on the top stair and eats it slowly, and he does not stop you, and he does not stop looking at the tomato.' : 'You hold out the coffee. Brack takes it, breathes it, and sits on the top stair. "Thirty seconds," he says. "Then I didn\'t see you."');
    }
    function talkBrack() {
      if (f.brackStalled) return say('"Go on," says Brack, eating. "Wake her. I want to see Vane\'s face."');
      if (!f.brackArrived) return say('Brack is on the stairs. You can hear him.');
      E.choose('"Step away from the console, Wim," says Brack. You have about three sentences before he reaches you.', [
        { label: '"You\'re not crew either, Brack. Read your Vellacourt contract. When this goes wrong, you\'re the one on the collar."', value: 'contract' },
        { label: '"Please. There are two thousand people asleep down there."', value: 'please' },
        { label: '"Take one more step and Gumbo eats your boots."', value: 'threat' }
      ]).then(c => {
        if (c === 'contract') { f.brackStalled = true; pts('brack-stall'); return say('Brack stops. "Clause 9," he says slowly. "Not a member of the crew for any purpose." He has read it. Of course he has read it; it is the only thing he has ever been handed. He sits down on the top stair. "I was never up here," he says. "I was looking for my sandwich."'); }
        f.brackSteps = (f.brackSteps || 0) + 1;
        if (f.brackSteps >= 2) return E.die('Brack reaches you. He is gentle about it, which is the worst part.\n\nHe puts you in a pod, cancels the thaw, and goes to find Vane. The captain sleeps on, forty seconds from waking.');
        say(c === 'please' ? '"I know," says Brack, unhappily. "Vane knows. It\'s a liability line." He takes another step. You have one more sentence.' : 'Brack looks at Gumbo. Gumbo looks at Brack\'s boots. "That\'s a cat," says Brack, "and I\'ve got a cat." He takes another step. One more sentence.');
      });
    }
    function wake() {
      if (f.okonjoAwake) return say('She is awake. She is already giving orders.');
      if (!f.codeEntered) return say('Eight digits first.');
      if (!f.brackStalled) return say('Brack is three metres away and closing. The thaw takes ninety seconds. You do not have ninety seconds of Brack.');
      f.okonjoAwake = true; f.margin = Math.ceil(g.clock || 0); E.updateClockUI(); pts('thaw');
      say('The pod lid lifts. Captain Adaeze Okonjo sits up, fourteen months later, grey with cold, and looks at the gallery, at Brack eating on the stairs, at a floor-polishing robot standing to attention, and at you.', () =>
        say('"Tarragon," she says, and her voice is a dry croak and still the most command you have heard all day. "Report. And then tell me who you are, because the last thing I logged was a question about whether you were crew, and I never got the answer."', () => answer()));
    }
    function answer() {
      E.choose('"Who are you?" says the captain. Who are you?', [
        { label: '"Deck Officer (Custodial), ma\'am. Per your log, 03:14. I kept the floors. I kept the ship."', value: 'officer' },
        { label: '"Wim. The janitor. I did what I could."', value: 'wim' },
        { label: '"A contractor, ma\'am. Clause 9. Not crew for any purpose."', value: 'contractor' }
      ]).then(c => {
        f.answered = true; f.answerQuality = c;
        pts(c === 'officer' ? 'answer' : c === 'wim' ? 'answer-ok' : 'answer-weak');
        say(c === 'officer' ? 'Okonjo looks at you for a long moment. Then she almost smiles. "I remember the log. I did not expect you to." She puts a hand on the pod rim and stands, badly. "Deck Officer. Get me to my bridge."' : c === 'wim' ? '"Wim," she says. "Yes. The floors." She stands, badly. "You did more than you could. Get me to my bridge, and on the way, you can tell me what rank you think you are, because I logged one."' : '"Clause 9 is wrong," says Okonjo. "I wrote that on your contract. I meant to fix it at the next port." She stands, badly. "There was no next port. There is now. Get me to my bridge, contractor, and we will see about the word."',
          () => say('You and Mop get her up the stairs, past Brack, who stands and says "Ma\'am," and does not know what else to do, and onto the bridge of the Luminous Hyacinth four minutes before the jurisdiction line, which is, as it turns out, the right amount of late.', () => E.gotoRoom('bridge2', 100, 150, 1)));
      });
    }
  };

  HANDLERS.bridge2 = (v, o, it) => {
    const f = F(), g = G();
    if (it) {
      if ((it === 'logslip' || it === 'notice' || it === 'contract' || it === 'roster') && o === 'okonjo2') return say('"Later," says Okonjo. "I want all of it. Later." She is watching the cutter.');
      if (it === 'tomato' && o === 'okonjo2') return say('She takes the tomato, looks at it, and puts it in her pocket. "Thistle let you have this?" "Crew ration, ma\'am." "Hm."');
      if (it === 'coffee' && o === 'okonjo2') return say('She takes it with both hands and does not say anything for a while.');
      if (it === 'mop' && o === 'okonjo2') return say('"Mop," says Okonjo. "We will talk about signatures." "Yes, Captain." "After the floors." "Yes, Captain!"');
      return rejoin(it, o);
    }
    switch (o) {
      case 'me': return say('A man on the bridge who kept the floors and the ship. It will do.');
      case 'screen2': return say('A Lane Authority cutter fills the main screen, holding at the jurisdiction line. A voice: "Hyacinth, Beacon 7. Is your captain in command?" Okonjo, hoarse: "She is."');
      case 'vane2':
        if (v === 'talk') return say('"Captain Okonjo," says Vane, very correctly. "A filing error." "A filing error with clamps," says Okonjo. Vane says nothing else. She is thinking about paperwork, and for once it is not helping.');
        return say('Captain Thessaly Vane, standing very still beside the chair she never sat in, watching her ship drift away on the side screen with her cat on it.');
      case 'intercom': return say('Dorrit\'s voice, from the Lien\'s intercom, relayed: "— note (f), I would like it recorded that the floor was — hello? Is anyone — I am in a pod. I would like to lodge —" Okonjo turns it down.');
      case 'helm': return say('Okonjo has the helm. You do not touch the helm. You were never going to.');
      case 'okonjo2':
        if (v === 'talk' || v === 'use') return vault();
        return say('Captain Okonjo, in her own chair, grey and upright, with a mop-shaped robot at her elbow and the Authority on the screen.');
      default: return say("You can't do that here.");
    }
    function vault() {
      if (g.done) return;
      if (!f.vaultSealed) {
        f.vaultSealed = true;
        if (f.knowsPrize) { pts('seal'); say('"Vane says the vault is sold," says Okonjo. "Is it?" "Forty thousand cultivars to Vellacourt Agri, ma\'am. It\'s on their manifest. Sold before they had the code." Okonjo keys eight digits into the arm of her chair without looking. "Vault sealed under captain\'s code. Log the Lien\'s manifest as evidence of intent. Lane Authority, this is Okonjo. I have a fraud to report and a seed vault to deliver." She looks at you. "Deck Officer, that will be all. Go and look at the floors. I\'m told they\'re a disgrace."', finish); }
        else say('"Vane says the vault is sold," says Okonjo. "Is it?" You do not know. Dorrit, from the intercom, helpfully: "— to Vellacourt Agri, forty thousand cultivars, I would like to lodge —" Okonjo seals the vault from the arm of her chair and turns the intercom off. "Thank you, Mr Dorrit." She looks at you. "Go and look at the floors. I\'m told they\'re a disgrace."', finish);
        return;
      }
      finish();
    }
    function finish() { if (g.done) return; g.done = true; E.persist(); say('Later, Ada Pryce, aged eight, is woken second, and is given back a drawing and a stowaway the size of a cat, and is told the stowaway has saved the ship and must never be mentioned to Thistle. Mop does the bridge floor. You do not stop it. Someone has to.', () => E.showFinal()); }
  };

  // ---------- Clock (chapter 8) ----------
  function clockTick(sec) {
    const f = F(); if (!f || G().chapter !== 8 || f.okonjoAwake) return;
    if (!f.warned60 && sec <= 60) { f.warned60 = true; say('The Lane Authority cutter is a minute from the jurisdiction line. If the captain of record when it arrives is Vane, Vane is the captain.'); }
  }
  function clockExpired() {
    E.lastSnap = Object.assign(E.snapshot(), { clock: 90 });
    E.die('The cutter crosses the jurisdiction line. "Hyacinth, Beacon 7. Is your captain in command?" On the bridge, pleasantly, Captain Thessaly Vane says: "She is."\n\nThe Authority rules for the paperwork. Two thousand farmers wake up in a yard. You are listed as chattel, custodial, one.');
  }

  return { act, combine, walkAction, itemLook, itemLabel, startChapter, onRestart, clockExpired, clockTick };
}
