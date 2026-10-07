// Generated Scene 1 only; scripts/extract-mop-free-scene.py --check.
import {ITEMS, POINTS, SAVE_VERSION} from './data.js';
import {demoSave} from './save.js';
const CH_POS = {1:['closet',150,160,1]};
export function CHAPTER_START(n) { if (n !== 1) throw new Error('Scene boundary'); return {v:SAVE_VERSION,chapter:1,room:'closet',inv:['mop'],flags:{},scored:{},score:0,hintsUsed:0,revealed:{},px:150,py:160,dir:1,started:true,clock:null,checkpoint:null,done:false}; }
export function migrateSave(s) { return demoSave(s); }
export function createScript(E) {
  const say = (t, then) => E.say(t, then);
  const pts = k => E.points(k);
  const G = () => E.game, F = () => E.game.flags;
  const has = id => E.has(id), give = id => E.give(id), drop = id => E.drop(id);
  const name = id => E.spotName(id);
  const rejoin = (it, o) => say(o === 'me' ? `You can't use the ${ITEMS[it].name.toLowerCase()} on yourself. Use it on something in the room.` : `Using the ${ITEMS[it].name.toLowerCase()} on the ${name(o)} does nothing useful.`);
  function startChapter(n, opts = {}) {
    if (n !== 1) throw new Error('Scene boundary');
    const g = G(); const [room, px, py, dir] = CH_POS[n];
    g.chapter = n; g.room = room; g.px = px; g.py = py; g.dir = dir; g.started = true; g.clock = null;
    if (opts.fresh) give('mop');
    E.clearTransient(); E.clearOverlays(); E.view = 'game'; E.$('gate').hidden = true; E.$('stage').hidden = false;
    E.setCheckpoint(); E.renderInv(); E.updateHud(); E.updateClockUI(); E.persist();
    if (n === 1) {
      if (opts.fresh) { say('The Luminous Hyacinth, fourteen months out. You wake up on a sack of absorbent granules in the Deck 9 supply closet because you are not crew and crew get bunks.'); say('Something has changed. The engine note is wrong, the corridor door is sealed, and Mop, the floor-polishing robot, is standing over you saying "Wim! Wim! I signed for a delivery!"'); say('Click a verb, then click something in the room. Or type commands like LOOK AT MOP. Save often. This is that kind of ship.'); }
      return;
    }
  }
  function onRestart() { say('You wake up on the sack of granules. Again. Mop is still very excited about the delivery.'); }
  const WALK_USE = {closet:['door','chute'],deck9:['closetdoor','ladder','grille']};
  const walkAction = id => (WALK_USE[G().room] || []).includes(id);
  const itemLook = id => ITEMS[id].look;
  const itemLabel = () => null;
  const HANDLERS = {};
  function act(v, o, it) {
    const g = G();
    if (v === 'look' && o === 'me' && !it) return lookMe();
    if (o === 'mopbot' && mopAct(v, it)) return;
    const h = HANDLERS[g.room]; if (!h) return say('Nothing happens.');
    return h(v, o, it);
  }
  function lookMe() {
    const g = G(), f = F();
    if (g.room === 'closet' && !f.lookedArm) { f.lookedArm = true; pts('look-arm'); return say('You are Wim Tarragon, custodial contractor, fourteen months into a nine-month contract. There is a strip of tape on your forearm with your own handwriting on it: NOT CREW. DO NOT FREEZE. SOMEONE HAS TO DO THE FLOORS.'); }
    const lines = { closet: 'Wim Tarragon. Coveralls off, undershirt on, hair like a mop that lost an argument.', deck9: 'Your reflection in the vending machine glass: a man who has been asleep on a sack and knows it.' };
    return say(lines[g.room] || 'Still you.');
  }
  function mopAct(v, it) {
    const g = G(), f = F();
    if (it) return say(`Mop looks at the ${ITEMS[it].name.toLowerCase()}. "Is that for the floors?"`), true;
    if (v === 'take') return say('Mop weighs forty kilos and has its own opinions about where it goes.'), true;
    if (v === 'hit') return say('You would never. Mop would forgive you, which is worse.'), true;
    if (v !== 'talk' && v !== 'look' && v !== 'use' && v !== 'search') return false;
    if (v === 'look') return say(itemLook('mop')), true;
    const R = {
      closet: f.mopChuted ? null : ['"A delivery came, Wim! Big crate. Four people. I signed!" Mop shows you the stamp on its arm: a smiling mop. "The form said REPRESENTATIVE OF VESSEL and I am the only one awake who is allowed to sign for cleaning supplies, so."', '"Where did they go?" "Up. Deck 8. They sealed the big door so the delivery would not escape. I think that is what they said."'],
      deck9: ['"I cannot climb ladders," says Mop. "I have wheels. I am very good at chutes, though. Have you seen the chute? It is Mop-sized."'],
    };
    const lines = R[g.room];
    if (lines) { lines.forEach(t => say(t)); return true; }
    say('"Wim!" says Mop, happily. It does not have anything else to add.'); return true;
  }
  function combine(a, b) {
    const f = F(); const pair = [a, b].sort().join('+');
    if (pair === 'mymop+wrench') return say('You could, but that mop has been through enough.');
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
      say('You climb the ladder, haul yourself through the grille with your mop handle first, and crawl along a duct that smells of fourteen months of other people\'s dust. At the end of it, blue light. The cryo bay.', () => { E.persist(); E.showPaywall(); });
    }
  };
  return {act,combine,walkAction,itemLook,itemLabel,startChapter,onRestart};
}
