# Crown of Thistlemere — puzzle & item map, chapters 1–8

Design spec for implementation on the shared engine (`public/games/_shared/engine.js`). Companion to `docs/thistlemere-story.md`. Conventions as for Mop & Galaxy: rooms have `title`, `walk` box, `describe`, `spots` (`id`, `name`, `rect`, `at`, `words`, optional `when`); items have `name`, `color` (EGA index), `words`, `look`; points are awarded once per `scored` key; hints are `[nudge, clue, full solution]` per puzzle id, served from `src/games/thistlemere-hints.js` only to walkthrough owners. Game id `thistlemere`. Chapter 1 is the free scene; the paywall triggers at the end of it.

## Scoring budget (250 total)

| Chapter | Points | Running total |
| --- | --- | --- |
| 1 The Heralds' Garret (free) | 20 | 20 |
| 2 The Great Hall | 30 | 50 |
| 3 Buttery & Kitchens | 35 | 85 |
| 4 Chapel & Crypt | 30 | 115 |
| 5 The Queen's Tower | 35 | 150 |
| 6 Postern Gate & Moat | 30 | 180 |
| 7 The Chamberlain's Study | 40 | 220 |
| 8 Dawn | 30 | 250 |

Verbs as the other games: Walk, Look, Take, Use, Talk (plus parser-only Give/Eat/Drink/Open/Search/Climb/Hit/Read/Sit).

## Running jokes and rules
- **"Wonderful realism."** Any attempt to tell a courtier the Game is real gets a compliment. Talking to a masked courtier in any room returns one of twelve lines and never a clue.
- **The envelopes.** Otti carries `envelopes` (the Game's six sealed clues). Vosk has resealed them with his own text. Reading them (Use envelope N) gives the Game's riddle for that stage, which is also the real route, because Vosk wrote both. Six envelopes, opened in order; the player cannot open N+1 before N.
- **Companion.** Chancellor the ferret (`ferret`) joins in chapter 3 as an inventory item, like Gumbo. He follows anyone holding `sausage`. He fits through grilles, fetches small things and bites the Duke once.
- **Sister meter.** `flags.perp` counts 0–3 across chapters 2, 4 and 5 (kind choices toward Perpetua). At 3 the chapter-6 rescue has an extra hand and chapter 8 has a cleaner ending line. No points attached; flavour only, so the paid hints stay the only real help.
- **Timers.** Action-counted soft timers in chapters 4 (crypt torch) and 6 (ice). The only real clock is chapter 8: 12 game-minutes at 3 game-seconds per real second (4 real minutes), pausing on messages, choices, hints, modals and backgrounding. Same mechanics as Port Lucky chapter 7.

---

## Chapter 1 — The Heralds' Garret (free scene) — 20 pts

**Premise.** Dusk on Midwinter's Eve. Otti wakes at her desk in the Heralds' Garret with a quill stuck to her face; she fell asleep sewing the fourth kidnapper's mask. The first bell is in an hour. Her master key is not on its hook. Her six clue envelopes are on the desk, sealed, with wax that is the wrong colour. Through the dormer window, four men in her costumes are unloading a covered cart in the snow, and the cart should not have anything in it to unload.

### Rooms

**1a. The garret** — `garret`
A sloping room under the roof: Otti's desk (ink, quill, blotter, the six envelopes), a sewing basket (needles, thread, the fourth mask half-finished), a wardrobe of tabards, the key hook (empty), a wax jack and the Heralds' seal (not Otti's to use), a dormer window onto the courtyard, a cold brazier, a ladder down to the gallery, a trapdoor to the roof (frozen), a cat-sized hole in the skirting.
Hotspots: `desk`, `envelopes`, `quill`, `ink`, `basket`, `mask`, `wardrobe`, `hook`, `seal`, `waxjack`, `window`, `brazier`, `ladder`, `trapdoor`, `hole`, `me`.

**1b. The heralds' gallery** — `gallery1`
A corridor of banners above the Great Hall. A locked door at the end (to the hall stair; the master key opened it), a musicians' balcony overlooking the hall (the court is gathering below), a suit of armour, a tapestry of the first Usurper's Game, a rope for the first bell, a sleeping page (Tam) with a ring of keys that are all wrong.
Hotspots: `stairdoor`, `balcony`, `armour`, `halberd`, `tapestry`, `bellrope`, `tam`, `tamkeys`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `envelopes` | Clue envelopes | 15 | "Six sealed envelopes, I to VI, for the six stages of the Game. You sealed them in green. These are sealed in black." |
| `quill` | Quill | 15 | "Goose. Sharp. Writes, and in a pinch, picks." |
| `thread` | Embroidery thread | 12 | "Perpetua's red silk, borrowed without asking. Strong enough to hang a mask on." |
| `needle` | Needle | 7 | "A bodkin. The kind for leather and, Dame Ursel says, skin." |
| `tabard` | Herald's tabard | 14 | "Thistlemere green and gold. Puts you in the Game officially. Does not make anyone listen." |
| `seal` | Heralds' seal | 6 | "The brass seal of the Heralds' Office. Juniors may carry it. Juniors may not use it. You are about to." |
| `wax` | Green wax | 10 | "A stick of herald's green. Your colour, not whoever resealed your envelopes." |

### Puzzles

**P1.1 `wake-up` — Get presentable (3 pts: `look-face` 1, `tabard` 2)**
Look at self: ink on the cheek, quill stuck to it (Take quill → `quill`). Use wardrobe → `tabard`; Use tabard on self → worn. Talk to nobody: the garret is empty; Otti talks to the mask.
- Nudge: "You're the Master of the Game in an hour. Look the part first."
- Clue: "There's a tabard in the wardrobe and a quill on your face."
- Full: "Look at yourself and take the quill. Open the wardrobe, take the tabard and put it on."

**P1.2 `black-wax` — Notice the envelopes (5 pts: `envelope-look` 2, `window` 3)**
Look at envelopes: black wax, not green. Look at window: four men in Otti's costumes unloading a cart; one of them limps, which none of her actors do. Sets `flags.sawCart`. Use seal on envelopes: Otti reseals envelope I in green over the black so she will know later which ones she has checked (`flags.resealed`, needed in ch. 7 to prove the tampering).
- Nudge: "Something on your desk is the wrong colour. Something outside is the wrong shape."
- Clue: "Look at the wax on the envelopes, then look out of the window."
- Full: "Look at the envelopes (black wax). Look out of the dormer window at the cart. Use the Heralds' seal on the envelopes to re-mark them in green."

**P1.3 `no-key` — The locked gallery door (7 pts: `hook` 1, `tam` 2, `pick` 4)**
The master key is gone from the hook. Down the ladder, the gallery stair door is locked. Tam the page has a ring of keys, none of which fit (Talk/Use tamkeys: "pantry, pantry, pantry, wine, pantry"). Solution: Use quill on stairdoor → the lock is a herald's lock, meant to be opened by a herald's quill in an emergency (the tapestry shows it, if looked at: `tapestry-look` is flavour). The quill breaks; Otti keeps the nib.
- Nudge: "Your key is gone. Who else has keys, and are they any good?"
- Clue: "Tam's keys are all for pantries. The tapestry shows how heralds opened doors before keys."
- Full: "Talk to Tam (his keys are useless). Look at the tapestry. Use the quill on the stair door."

**P1.4 `first-bell` — Start the Game you can't stop (5 pts: `balcony` 2, `bell` 3)**
Look over the balcony: the court below, masked; the King on the dais; Vosk at his shoulder; the four "kidnappers" already in position by the screens passage. Otti can't warn anyone from here (Talk → "Wonderful realism!" shouted up). Use bellrope → the first bell. Otti goes down to run the Game, because if she doesn't, Vosk will.
- Nudge: "The Game starts when the Master rings the bell. Nobody else is going to believe a word until you're down there."
- Clue: "Look over the balcony first. Then the rope."
- Full: "Look from the musicians' balcony, then use the bell rope. Go down the stair."

### Deaths
- **Trapdoor**: Use trapdoor → "You force the roof hatch. The roof, which has been waiting all winter for someone to stand on it, lets go of its snow and most of its slates. Perpetua, below, says 'Oh, Otti,' which is the nicest thing she has said all year."
- **Brazier**: Use wax on brazier three times / Use thread on brazier → "You light the brazier for warmth. The garret's thatch has been waiting for exactly this since the reign of Berengar's grandfather."
- **Halberd**: Take halberd twice → "The suit of armour was holding the halberd for a reason. The reason was the halberd."
- **Balcony**: Climb balcony → "You climb onto the balcony rail to shout down. The court applauds the Master's entrance. The court then applauds the Master's exit."

### Exit condition
Tabard on, `envelopes`, `seal`, `wax`, `thread`, `needle` in inventory, `flags.sawCart`, bell rung; Use stairdoor → end of free scene. Paywall. If owned, continue to Chapter 2.

---

## Chapter 2 — The Great Hall (30 pts)

**Premise.** The Game begins. Otti reads the opening from the dais; Vosk watches with a small smile. On cue, four masked men come through the screens passage, seize the King with real rope, and carry him out, and the court cheers. Perpetua, in a silver mask, says "Realistic. Slightly long." Otti has to establish, with evidence, that the men were not hers, while a hundred courtiers in masks hand her her own clues.

### Rooms

**2a. The Great Hall** — `hall`
The dais (King's chair, empty; the Queen's chair, occupied), the high table (Vosk's place, with his own goblet), long tables of masked courtiers, the screens passage (where the Masks went), a dropped mask on the floor (one of Otti's: the stitching is hers), a wine fountain, a fool's stool, the hearth, a dog (Lord Protector, the King's hound, who did not bark), the door to the buttery stair.
Hotspots: `dais`, `kingschair`, `queen`, `vosk`, `perpetua`, `courtiers`, `screens`, `droppedmask`, `fountain`, `stool`, `hearth`, `hound`, `butterydoor`, `me`.

**2b. The screens passage** — `screens`
A dark passage behind the hall's wooden screen: scuffed snow, a rope end cut with a knife (actors' rope is tied, not cut), a torch sconce, a boot print with a nail pattern, a door to the courtyard (barred from outside), the buttery stair.
Hotspots: `snow`, `ropeend`, `sconce`, `bootprint`, `courtdoor`, `stair`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `droppedmask` | Kidnapper's mask | 0 | "One of the four masks you sewed. Your stitching, Perpetua's thread, and a smell of horse that none of your actors could afford." |
| `ropeend` | Cut rope | 6 | "Hemp, cut clean. Your actors were issued silk cord, tied in a bow, because the King is seventy." |
| `goblet` | Vosk's goblet | 14 | "The Chamberlain's goblet. Full. He did not drink the toast. He never does, but tonight it is a clue." |
| `torch` | Torch | 6 | "A hall torch. Burns about as long as a chapter." |

### Puzzles

**P2.1 `run-the-game` — Open the Game (5 pts: `opening` 2, `envelope1` 3)**
Use dais → Otti reads the opening. Use envelopes (I) → the first riddle: "Where the King's cup is empty and the Chamberlain's is full, the road begins." Sets `flags.env1`. The riddle points to the goblet and, through it, to the screens passage.
- Nudge: "You are the Master of the Game. Masters open envelopes."
- Clue: "Read envelope I from the dais."
- Full: "Use the dais to read the opening, then use the envelopes to read riddle I."

**P2.2 `wrong-men` — Prove the kidnap is real to yourself (12 pts: `mask` 3, `rope` 3, `hound` 3, `goblet` 3)**
Take droppedmask (horse smell, real stitching). In the screens passage: Take ropeend (cut, not tied). Look at hound: Lord Protector did not bark, so he knew at least one of the men. Take goblet from the high table (Vosk didn't drink). Four pieces of evidence set `flags.evidence` = 4. Showing any of it to a courtier: "Wonderful props!"
- Nudge: "Your actors have a budget of nothing. Whoever took the King did not."
- Clue: "The dropped mask, the rope, the dog that didn't bark, and the cup nobody drank from."
- Full: "Take the dropped mask in the hall. Go behind the screens and take the cut rope. Look at the hound. Take Vosk's goblet from the high table."

**P2.3 `sister-one` — Perpetua (6 pts: `perp-talk` 2, `perp-mask` 4)**
Talk to Perpetua: she is enjoying herself; she assumes Otti is nervous. Choice: snap at her ("You never listen") / ask for help ("Perpetua, look at the mask") / say nothing. Give droppedmask to Perpetua → she recognises her own thread, pauses, and says "If this is part of the Game, it's very good," which is as far as she goes tonight (`perp` +1 if asked kindly).
- Nudge: "There's one person in this hall who knows your stitching."
- Clue: "Show your sister the mask."
- Full: "Talk to Perpetua and ask for help, then give her the kidnapper's mask."

**P2.4 `the-road` — Follow the route (7 pts: `bootprint` 2, `snow` 2, `torch` 1, `courtdoor` 2)**
In the screens passage: Look at bootprint (hobnails in a cross: Ashvale livery, red herring planted by Vosk). Look at snow: scuffs go down the buttery stair, not out of the courtyard door. Use courtdoor → barred from outside (someone wanted it to look like they left). Take torch from sconce. Use stair → chapter 3.
- Nudge: "They came in through the screens. Which way did they go out?"
- Clue: "The courtyard door is barred from the other side. Read the snow on the floor."
- Full: "Look at the boot print and the snow in the screens passage, try the courtyard door, take the torch, and go down the buttery stair."

### Deaths
- **Fountain**: Drink from fountain three times → "The wine fountain is for show. The wine in it is from the Game of eleven years ago. So, shortly, are you."
- **Hearth**: Use torch on hearth / climb hearth → "You check the chimney for kidnappers. The chimney checks you for flammability."
- **Vosk**: Hit Vosk → "You strike the Lord Chamberlain in front of the court. Sir Dunstan, delighted that something has finally happened, arrests you until spring."
- **Hound**: Take hound's bone → "Lord Protector did not bark at the kidnappers. He barks at you. Then he stops barking and starts something else."

### Exit condition
`flags.env1`, four evidence items, torch; down the buttery stair → Chapter 3.

---

## Chapter 3 — The Buttery and Kitchens (35 pts)

**Premise.** The buttery is where the Game's props live and where Otti's four actors were supposed to wait. They are here, drunk, tied with their own silk cord, inside a cask with the lid on. The kitchens are in full Midwinter chaos under Master Cook Gudrun, who has lost a goose and a ferret. Chancellor, the King's ferret, is in the sausages and has been following the one person in the castle who smells of the King: he knows where they took him.

### Rooms

**3a. The buttery** — `buttery`
Casks (one with the lid on and knocking from inside), the props chest (Game props: a wooden crown, a stage dagger, a false beard, a ladder of rope), the actors' costumes (gone), a tally board, a hatch to the kitchens, a trap to the cellar (padlocked), the stair up.
Hotspots: `casks`, `knockcask`, `propschest`, `woodencrown`, `stagedagger`, `beard`, `ropeladder`, `tally`, `kitchhatch`, `cellartrap`, `padlock`, `stair`, `me`.

**3b. The kitchens** — `kitchen`
Gudrun at the range, a goose on a spit (overdone), the sausage rack (moving), the spice shelf, a pantry door, a well in the floor (the castle's old well, grated), a dumbwaiter to the Queen's Tower, the scullery boys, a cleaver, the cellar door (locked; Gudrun has the key on her belt).
Hotspots: `gudrun`, `goose`, `spit`, `sausages`, `spices`, `pantry`, `well`, `grate`, `dumbwaiter`, `boys`, `cleaver`, `cellardoor`, `gudrunkey`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `woodencrown` | Wooden crown | 6 | "The Game's crown. Painted gold, weighs nothing, has fooled nobody for thirty years." |
| `stagedagger` | Stage dagger | 7 | "Blade retracts into the hilt. Terrifying from forty feet." |
| `ropeladder` | Rope ladder | 6 | "The actors' escape ladder. Ten feet. Surprisingly real." |
| `beard` | False beard | 7 | "The Usurper's beard. Grey, itchy, and worn by a different courtier every year, which is why it smells like that." |
| `cord` | Silk cord | 13 | "Your actors' silk cord, in a bow. They were tied up with their own prop by someone who found that funny." |
| `sausage` | Sausage | 4 | "Midwinter sausage. The ferret has already had one end of it." |
| `ferret` | Chancellor | 6 | "The King's ferret, Chancellor. Smells of the King. Follows sausages. Knows the castle better than the Chamberlain." |
| `pepper` | Pepper | 8 | "A twist of pepper from Gudrun's shelf. Enough to make a Duke sneeze." |
| `cellarkey` | Cellar key | 7 | "Gudrun's cellar key. She wants it back with interest." |

### Puzzles

**P3.1 `the-cask` — Find your actors (8 pts: `knock` 1, `cask-open` 3, `cord` 2, `actors-talk` 2)**
Look at knockcask. Use stagedagger (from props chest) on the cask lid → prise it. Four actors, drunk, tied with silk cord in bows. Take cord. Talk to actors: a man "with the Chamberlain's voice" told them the Game was cancelled and left a cask open. Sets `flags.actorsFound` (the first thing that would convince anyone, if anyone would come and look).
- Nudge: "Something in the buttery is knocking to be let out."
- Clue: "The cask with the lid on. The props chest has something that can prise it."
- Full: "Take the stage dagger from the props chest and use it on the knocking cask. Take the silk cord and talk to your actors."

**P3.2 `props` — Arm yourself with nonsense (4 pts: `crown` 1, `ladder` 2, `beard` 1)**
Take woodencrown, ropeladder, beard from the props chest. All three are used later (ch. 6, ch. 6, ch. 7).
- Nudge: "The Game has props. Props are the only equipment you have."
- Clue: "Empty the props chest."
- Full: "Take the wooden crown, the rope ladder and the false beard from the props chest."

**P3.3 `chancellor` — Recruit the ferret (10 pts: `sausage` 2, `ferret` 4, `goose` 2, `gudrun` 2)**
In the kitchen: Take sausage from the rack (Chancellor is in it: he comes with the sausage). Use sausage on ferret / Give sausage → Chancellor rides in Otti's satchel (`ferret`). Talk to Gudrun: she has lost a goose to the spit and a ferret to the sausages and will give the cellar key to whoever fixes either. Use spit (turn it) → the goose is saved from charcoal (`goose` 2); Gudrun gives `cellarkey` (`gudrun` 2). Take pepper from the spice shelf while she is pleased.
- Nudge: "The King's ferret is somewhere it shouldn't be, and it knows exactly where the King is."
- Clue: "The sausage rack is moving. Gudrun wants her goose turned."
- Full: "Take a sausage (Chancellor comes with it) and give it to the ferret. Turn the spit, talk to Gudrun, take the cellar key, and take some pepper."

**P3.4 `down-not-out` — The cellar (8 pts: `tally` 2, `envelope2` 3, `cellar` 3)**
Look at tally board: six casks went to the cellar tonight; the cellar takes four. Use envelopes (II): "Below the cup, above the dead, the road runs under those who sleep." Use cellarkey on the kitchen cellar door (the buttery trap is padlocked with a Vellacourt… no: with a new padlock nobody owns). Use ferret on cellardoor → Chancellor goes first and squeaks at the far wall. Chapter 4.
- Nudge: "Riddle II says down. Two doors go down. One of them has a lock nobody can explain."
- Clue: "Gudrun's key opens the kitchen cellar. Let the ferret lead."
- Full: "Read envelope II, look at the tally board, use the cellar key on the kitchen cellar door and follow Chancellor down."

**P3.5 `dumbwaiter-tease` — The Queen's Tower (5 pts: `dumb` 2, `note` 3)**
Look at dumbwaiter: it goes to the Queen's Tower. Inside: a note in Perpetua's hand to the cook: "Her Majesty will take the Game's second course in the tower; she is not amused by the first." Take note (`note` 3; flavour and a pointer for ch. 5). Using the dumbwaiter now: Otti does not fit with the satchel; later (ch. 5) she sends something up it.
- Nudge: "The kitchens talk to the tower. See what they're saying."
- Clue: "Look in the dumbwaiter."
- Full: "Look at the dumbwaiter and take the note inside it."

### Deaths
- **Goose**: Eat goose / Use spit while standing in the hearth → "You lean in to smell the goose. The goose, overdone, catches. So does the Master of the Game."
- **Well**: Use grate / climb well → "The old well is dry, Gudrun says. Gudrun is wrong by about forty feet."
- **Cleaver**: Take cleaver twice → "Gudrun does not let anyone touch the cleaver. Gudrun demonstrates why."
- **Cask**: Drink from the open cask → "The King's wine. The actors have been in it for two hours, which is not what the vintner intended."

### Exit condition
`cord`, props, `ferret`, `cellarkey`, `pepper`, `flags.env2`; through the kitchen cellar door → Chapter 4.

---

## Chapter 4 — The Chapel and the Crypt (30 pts)

**Premise.** The cellar passage comes up under the chapel through a tomb lid that was built to open. In the chapel, the Duke of Ashvale is kneeling in a very loud way, running his own strategy for the Game (he has decided the Usurper is the Queen). Below, in the crypt, the Four Masks have a camp: the King's cloak, a crossbow, and a map of the postern route. Hobb the Warden has been following Otti since the hall. When the Masks come back, Hobb takes the bolt meant for her. The torch burns down: twelve actions in the crypt before it gutters.

### Rooms

**4a. The chapel** — `chapel`
An altar (candles), the Duke praying loudly, the Founder's tomb (lid ajar: Otti came up through it), a font, pews, a rood screen, a confessional, a locked vestry, the crypt stair, Hobb in the shadows (visible only after `flags.hobbSeen`).
Hotspots: `altar`, `candles`, `duke`, `tomb`, `font`, `pews`, `rood`, `confessional`, `vestry`, `cryptstair`, `hobb`, `me`.

**4b. The crypt** — `crypt`
Coffins on shelves, the Masks' camp (a lantern, the King's cloak, a crossbow with one bolt, a map), a drain, a bricked arch with new mortar, the passage onward (to the postern), the stair up.
Hotspots: `coffins`, `camp`, `lantern`, `cloak`, `crossbow`, `map`, `drain`, `arch`, `mortar`, `passage`, `stairup`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `cloak` | The King's cloak | 4 | "Berengar's Midwinter cloak, ermine and all. He will want it back. He will also want to know who had it." |
| `map` | Kidnappers' map | 15 | "A plan of the castle's underways in a neat clerk's hand, with the route marked to the postern gate and a time: 'Gate, fifth bell.' The hand is Vosk's. You have read thirty years of his riddles." |
| `bolt` | Crossbow bolt | 7 | "Steel head. Not a prop. It was in Hobb's arm until a minute ago." |
| `lantern` | Lantern | 14 | "The Masks' lantern. Burns longer than a torch and doesn't drip on ferrets." |
| `candle` | Altar candle | 15 | "A chapel candle, beeswax. Dame Ursel would call it a poor man's cautery." |

### Puzzles

**P4.1 `the-duke` — Get past Ashvale (7 pts: `duke-talk` 2, `pepper` 3, `confess` 2)**
The Duke blocks the crypt stair; he has decided the crypt is "his lead". Talk: he accuses Otti of favouring the Queen's team. Give beard to Duke → he is flattered to be the Usurper and goes off to accuse the Queen in person (`duke-talk`). If he will not move (`flags.dukeStubborn` on a rude dialogue choice): Use pepper on Duke → a sneezing fit, the ferret bites his ankle, he withdraws to the confessional. Either route works; both score `pepper` or `duke-talk`, and `confess` for sending him to the confessional (Use confessional after).
- Nudge: "The Duke thinks the crypt is his. Give him a better idea of what he is."
- Clue: "He'd love to be the Usurper. There's a beard for that. Failing that, pepper."
- Full: "Talk to the Duke, then give him the false beard (or use the pepper on him). Use the confessional to shut him in."

**P4.2 `tomb-and-torch` — Light for the crypt (5 pts: `candle` 2, `lantern` 3)**
The torch from chapter 2 is nearly out. Take candle from altar. In the crypt, Take lantern from the camp and Use candle on lantern → lit. The crypt timer (12 actions) only runs while the player holds a lit torch and no lantern.
- Nudge: "Your torch is guttering. The chapel is full of light; the crypt has something better."
- Clue: "Take an altar candle. The Masks left a lantern."
- Full: "Take a candle from the altar. Take the lantern from the camp in the crypt and use the candle on it."

**P4.3 `the-camp` — Read the plan (8 pts: `cloak` 2, `map` 4, `envelope3` 2)**
Take cloak. Take map: route to the postern, "fifth bell", Vosk's hand. Use envelopes (III): "Where the wall was mended tonight, the dead will show you a door." Look at mortar: new. Sets `flags.knowsPostern`, `flags.knowsHand` (Otti now suspects Vosk; she cannot prove it).
- Nudge: "They left in a hurry. Read what they left."
- Clue: "The map is in a hand you know from thirty years of riddles."
- Full: "Take the King's cloak and the map from the camp, read envelope III, and look at the new mortar on the arch."

**P4.4 `hobb` — The Warden takes a bolt (10 pts: `hobb-seen` 2, `stitch` 5, `hobb-talk` 3)**
When Otti takes the map, two Masks come down the stair. A bolt is fired; Hobb, who has been behind her since the hall, steps into it. The Masks flee through the passage (they are not fighters). Hobb sits down heavily. Take bolt (pull it; Hobb says a word the chapel has not heard). Use needle on Hobb → "I'll need thread." Use thread on needle (combine) → Use needle on Hobb → Otti stitches the Warden with her sister's red silk by lantern light while he explains, through his teeth, that he has watched twenty Games from the gate and this is the first one that is any good. Candle on the wound first (`Use candle on hobb`) adds nothing but a scream. Talk to Hobb after: he has a key to every door in the castle and has never been asked for one. `flags.hobbAlly`.
- Nudge: "Someone has been following you all night. Tonight that saves your life, and now he needs yours."
- Clue: "You have a bodkin and your sister's silk. Dame Ursel is asleep."
- Full: "Take the bolt out of Hobb's arm. Use the thread on the needle, then use the needle on Hobb. Talk to him."

### Deaths
- **Torch out**: twelve actions in the crypt with only the torch → "The torch goes out. The crypt is a very simple place in the dark: it has a stair you came down and about forty you didn't. You find one of the forty."
- **Crossbow**: Use crossbow → "You test the Masks' crossbow. It is loaded. It is also facing you, which you knew, and had not thought about."
- **Font**: Drink from font → "Holy water, three hundred years old, with something in it that has been holy for most of them."
- **Duke**: Hit Duke / Take Duke's sword → "The Duke of Ashvale has been waiting his whole life for the Game to turn violent. He is very good at it."
- **Tomb**: Climb into a coffin → "The coffin was empty. The coffin is no longer empty. The lid, which was designed by people who knew their business, agrees."

### Exit condition
`cloak`, `map`, `lantern` lit, `flags.hobbAlly`, `flags.env3`; the passage onward is barred by the Masks from the far side. Hobb: "The tower, then. If anyone's going to believe you it's the one person who's been bored all night." Use stairup → Chapter 5 (Hobb goes to his gate to wait).

---

## Chapter 5 — The Queen's Tower (35 pts)

**Premise.** The Queen has withdrawn from the Game to her tower with Perpetua and her ladies. The tower door has a guard (Sir Dunstan, who has been told the Game is on and therefore lets nobody in, including heralds, "for realism"). Otti has to reach the Queen, convince one Fenwick, and leave with the only thing that can beat a forged abdication: the Queen's copy of the Great Seal.

### Rooms

**5a. The tower stair** — `towerstair`
A spiral stair with Sir Dunstan on the landing, an arrow slit, a dumbwaiter hatch (the kitchen's other end), a tapestry of Queen Alaric's wedding, a bell for the ladies, a window seat with Perpetua's cloak on it.
Hotspots: `dunstan`, `slit`, `dumbhatch`, `wtapestry`, `ladybell`, `windowseat`, `perpcloak`, `towerdoor`, `me`.

**5b. The Queen's solar** — `solar`
The Queen at a chessboard (playing herself), Perpetua at the window, three ladies at embroidery, a writing desk with the Queen's seal box, a fire, a parrot (Archbishop), a loom, the Queen's wine, a door to the roof.
Hotspots: `queenA`, `chessboard`, `perpetua2`, `ladies`, `seallbox`, `writingdesk`, `fire`, `parrot`, `loom`, `wine`, `roofdoor`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `perpcloak` | Perpetua's cloak | 13 | "Your sister's cloak, silver fox. In the dark, at a distance, you are the same height." |
| `greatseal` | The Queen's Great Seal | 14 | "The second Great Seal of Thistlemere, kept by the Queen so that no single person can bind the crown. Including, it turns out, the Lord Chamberlain." |
| `queensletter` | The Queen's warrant | 15 | "'The bearer, O. Fenwick, Herald, acts for the Crown tonight. Dunstan, this means you. — A.R.' The Queen writes like she plays chess." |
| `chesspiece` | Black king | 0 | "The black king from Her Majesty's board. She gave it to you. She did not say why. You suspect she knows exactly why." |

### Puzzles

**P5.1 `dunstan` — Past the Captain (8 pts: `dunstan-talk` 2, `dumbwaiter` 4, `ladybell` 2)**
Talk to Dunstan: Game's on, nobody in. Show tabard, envelopes, cloak: "Wonderful realism, Herald." Solution: Use ladybell → a lady comes to the door; Dunstan turns to argue with her; Use dumbhatch → Otti sends the King's cloak up the dumbwaiter with the Masks' map inside it, wrapped, to the solar. The Queen reads the map. Thirty seconds later the tower door opens from inside and Perpetua says, "Her Majesty will see the Herald. Dunstan, go and guard something else." (`flags.queenKnows`.)
- Nudge: "Dunstan won't let you in. The Queen can let you in, if she knows to."
- Clue: "The kitchens send things up to the tower. So can you."
- Full: "Ring the ladies' bell, then use the dumbwaiter hatch to send the King's cloak (with the map in it) up to the solar."

**P5.2 `sister-two` — The fight (10 pts: `perp-fight` 3, `perp-truce` 4, `perp-cloak` 3)**
In the solar, Perpetua: "You could have sent a note." The sisters' argument is a three-step dialogue; the kind path (`perp` +1 each) ends with Perpetua admitting she entered the Game six years running because Otti wrote the best riddles and never got the credit. The unkind path ends the same place with fewer lines. Either way: `perp-truce`. Give thread back to Perpetua (what's left of it; most is in Hobb) → she laughs, which nobody has heard since their mother died (`perp-cloak`: she gives Otti her cloak, "you'll need to look like someone they're not expecting").
- Nudge: "You have been not-talking to your sister for a year. Tonight is not the night to keep it up."
- Clue: "Talk to Perpetua until she stops being clever. Give her back her thread."
- Full: "Talk to Perpetua through the argument, then give her the embroidery thread. She gives you her cloak."

**P5.3 `the-queen` — Alaric (12 pts: `queen-talk` 2, `chess` 4, `warrant` 3, `seal` 3)**
Talk to the Queen: she has suspected Vosk for a decade, "but one does not accuse the Chamberlain of anything on a night he wrote." Use chessboard → the Queen asks Otti to finish her position in one move (a mate in one; the parser accepts "move bishop", "use bishop" or clicking the square; wrong moves are commented on, not punished). Correct → she gives Otti the black king (`chesspiece`, a token Vosk will recognise in ch. 8) and writes the warrant (`queensletter`). Use seallbox → she opens it herself and gives Otti the Great Seal: "If he has a paper, he needs this. If you have this, he has a paper."
- Nudge: "The Queen has been waiting all night for someone to say it out loud."
- Clue: "Talk to her. Finish her chess problem. Ask for the seal."
- Full: "Talk to the Queen, solve the mate in one on the chessboard, take the warrant and the black king, and use the seal box for the Great Seal."

**P5.4 `envelope-four` — Where the King will be (5 pts: `envelope4` 3, `roof` 2)**
Use envelopes (IV): "At the fifth bell the smallest gate will hold the largest guest." Use roofdoor → from the tower roof, Otti sees lanterns moving on the frozen moat toward the postern. `flags.env4`.
- Nudge: "Riddle IV is a time and a place. You have both halves already."
- Clue: "Read it, then look from the roof."
- Full: "Read envelope IV and go out onto the tower roof."

### Deaths
- **Roof**: Climb the roof parapet → "The tower roof is iced. You discover this in the way the castle's architects did not intend, though they did put a moat there for it."
- **Parrot**: Take parrot / Feed sausage to parrot → "The Archbishop bites. The Archbishop has been biting since the old King's reign and has never once been wrong about who deserved it."
- **Queen's wine**: Drink wine → "You drink Her Majesty's wine without being offered it. Her Majesty, mildly, has you removed. By the window."
- **Dunstan**: Hit Dunstan → "Sir Dunstan has been hoping for a real fight all evening. You are not a real fight. You are, briefly, a demonstration."

### Exit condition
`greatseal`, `queensletter`, `chesspiece`, `perpcloak`, `flags.env4`, `flags.queenKnows`; down the stair → Chapter 6. Perpetua comes too.

---

## Chapter 6 — The Postern Gate and the Moat (30 pts)

**Premise.** The fifth bell. The Masks are bringing the King across the frozen moat to the postern, where a sledge waits beyond the wall. Hobb holds the gate; the Duke, bearded and offended, has followed Perpetua. Otti has a rope ladder, a wooden crown, a sister in her own cloak and a Duke who wants a fight. The plan: swap the King for a decoy on the ice, and let the Masks deliver a Duke of Ashvale to their sledge. The ice is a timer: fifteen actions out there before it complains.

### Rooms

**6a. The postern gate** — `postern`
Hobb's gatehouse: his scrapbook of twenty Games, a brazier, the postern door (two bars), a murder hole above the passage, a winch for the water gate, a rack of lanterns, Perpetua, the Duke, the gate's outer arch onto the moat.
Hotspots: `hobb2`, `scrapbook`, `brazier2`, `posterndoor`, `bars`, `murderhole`, `winch`, `lanterns`, `perpetua3`, `duke2`, `archout`, `me`.

**6b. The frozen moat** — `moat`
Ice, a boathouse half-sunk, the sledge beyond the far bank, the Masks' lanterns approaching, the King (tied, cheerful) on a sled, a reed bed, the water gate (iron grille into the moat under the wall), the castle wall with a drain.
Hotspots: `ice`, `boathouse`, `sledge`, `masks`, `king`, `kingsled`, `reeds`, `watergate`, `drainout`, `wallback`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `scrapbook` | Hobb's scrapbook | 6 | "Twenty years of Games, cut from the heralds' notices and pasted in. Every year's winner. Every year, in the margin: 'V. did not drink.'" |
| `lantern2` | Gate lantern | 14 | "A second lantern. Two lanterns on the ice look like four Masks." |
| `kingcord` | The King's bonds | 6 | "Real rope, cut. His Majesty asks that you keep it as a souvenir." |

### Puzzles

**P6.1 `hobb-gate` — Hobb's plan (6 pts: `scrapbook` 3, `winch` 3)**
Talk to Hobb: he will not open the postern for the Masks; they will come to the water gate instead, under the wall, where the ice is thinnest. Take scrapbook (`V. did not drink` every year: the evidence pattern for ch. 8). Use winch → raise the water gate a foot, so the Masks think the way is open.
- Nudge: "The Warden has been thinking about this gate for twenty years. Ask him."
- Clue: "Raise the water gate; make them come the way you want."
- Full: "Talk to Hobb, take his scrapbook, and use the winch to raise the water gate."

**P6.2 `the-decoy` — Dress a Duke (9 pts: `duke-beard` 2, `crown-duke` 3, `cloak-duke` 4)**
The Duke wants to charge. Talk to Duke: charging gets the King killed; being carried off in triumph gets the Duke a story. Give woodencrown to Duke, Use cloak (the King's) on Duke → in the dark, on the ice, a bearded man in ermine and a crown is a King. He agrees on condition the song calls him "the Lion of Ashvale".
- Nudge: "The Masks are looking for a King. Give them one who can look after himself."
- Clue: "The Duke has a beard, you have a crown and a cloak."
- Full: "Talk to the Duke, give him the wooden crown and use the King's cloak on him."

**P6.3 `the-swap` — On the ice (12 pts: `ladder-ice` 3, `lanterns` 3, `swap` 6)**
On the moat: Use ropeladder on ice → laid flat across the thin stretch by the water gate it spreads the weight (Hobb's idea; the timer is lengthened by eight actions). Use lantern2 / Give lantern to Perpetua → two lanterns bob toward the Masks from the reeds, in Perpetua's cloak: the Masks think their own reinforcements are coming and stop. Use chesspiece? No. Use cord (silk) on kingsled → Otti ties the sled to the ladder; Perpetua and the Duke pull. The Duke takes the King's place on the sled (Use duke2 on kingsled, or simply "swap" → `swap` 6). The Masks take the Duke toward the sledge; by the time they notice, Hobb has dropped the water gate behind Otti and the King.
- Nudge: "Weight spreads on a ladder. Lanterns look like friends. A Duke looks like a King."
- Clue: "Lay the rope ladder on the thin ice, send Perpetua out with a lantern, tie the King's sled with the silk cord and put the Duke in his place."
- Full: "Use the rope ladder on the ice. Give the gate lantern to Perpetua. Use the silk cord on the King's sled, then use the Duke on the sled to swap him for the King. Go back through the water gate."

**P6.4 `the-king` — Berengar (3 pts: `king-talk` 3)**
Talk to the King, untied, in the gatehouse: he thought the whole thing was the best Game yet, "until the cold bit", and he is quite clear that the men were Vosk's: "Severin always writes the fifth bell. He thinks I don't read them." Use envelopes (V) with the King: "The crown that is not a crown goes to the one who did not drink." The King: "That's rather on the nose for Severin." Sets `flags.kingSafe`, `flags.env5`. The King will not go to the hall yet: "If I walk in now, he burns the paper and we never see it. Find the paper."
- Nudge: "You have the King. He has opinions."
- Clue: "Talk to him. Read him riddle V."
- Full: "Talk to the King in the gatehouse and read envelope V with him."

### Deaths
- **Ice**: fifteen actions on the moat without the ladder → "The moat was frozen. The moat is now mostly frozen. The part that isn't is the part you are standing on, and then under."
- **Masks**: Walk to masks / Hit masks → "You walk up to four men with a crossbow and explain that the Game is cancelled. They agree. They cancel you."
- **Murder hole**: Use murderhole while someone is below → "Hobb keeps the murder hole stocked. You find out with what."
- **Water gate**: Use winch while standing under the gate → "The water gate weighs what a water gate weighs. Hobb says sorry. Hobb means it."

### Exit condition
King in the gatehouse, Duke on a sledge heading for the Ashvale road with four confused Masks, `scrapbook`, `flags.env5`, `flags.kingSafe`; Hobb gives Otti the key to the Chamberlain's study. Chapter 7.

---

## Chapter 7 — The Chamberlain's Study (40 pts)

**Premise.** Vosk is in the hall, running the end of the Game himself, "since the Master has wandered off." His study is empty for an hour. Thirty years of Games are in it, and somewhere a forged abdication that needs only the Great Seal, which Vosk expects to collect from the Queen's box when the court cheers him as winner. Otti has Hobb's key, the Queen's Seal, the King's blessing and no evidence that anyone but she will accept. She has to leave with the paper, and leave the room looking untouched.

### Rooms

**7a. The study** — `study`
A desk (locked drawer), thirty years of Game ledgers on a shelf, a hearth with a fresh fire, a strongbox (the Chamberlain's own seal inside), a globe, a wax jack with black wax, a wall of masks (every Usurper's mask, thirty of them), a cabinet of curiosities, a window to the courtyard, a secret door behind the ledgers (the ferret finds it).
Hotspots: `sdesk`, `drawer`, `ledgers`, `shearth`, `strongbox`, `globe`, `blackwax`, `maskwall`, `cabinet`, `swindow`, `shelfdoor`, `me`.

**7b. The hidden closet** — `closet`
A copyist's closet: a slanted desk, a copy of the King's hand practised a hundred times, the abdication itself (unsealed), a second copy, a candle, a mouse-hole to the hall's wall (the hall is audible), a stool.
Hotspots: `copydesk`, `practice`, `abdication`, `copy2`, `ccandle`, `mousehole`, `cstool`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `ledger` | Game ledger, year one | 15 | "The first Usurper's Game, in Vosk's hand. Last page: 'The King laughed. Next year I shall write one he cannot laugh at.' Twenty-nine years later." |
| `blackwaxstick` | Black wax | 0 | "The Chamberlain's black wax. The colour on your envelopes." |
| `voskseal` | Vosk's seal | 8 | "The Chamberlain's seal. A thistle with a crown on it, which is the problem in one picture." |
| `abdication` | The abdication | 15 | "'I, Berengar, being old and fond and tired of games, do this Midwinter give the crown of Thistlemere into the keeping of my Chamberlain Severin Vosk until my heir's majority…' Unsigned. Unsealed. Waiting for both." |
| `practice` | Practice sheet | 15 | "The King's signature, practised a hundred times. The hundredth is very good. The first is not, and it is dated." |

### Puzzles

**P7.1 `in-and-quiet` — Enter the study unseen (6 pts: `hobbkey` 2, `window` 2, `fire` 2)**
Use hobbkey on study door. Look at window: the courtyard, the Duke's sledge tracks, and Dunstan below, who must not see a light. Use shearth → damp the fire (Use pepper? no; Use cloak? gone; Use perpcloak on the window → curtain it). `flags.studyDark`.
- Nudge: "You're in his rooms. Don't let the courtyard know."
- Clue: "Curtain the window with something, and keep the fire low."
- Full: "Use Hobb's key on the study door, use Perpetua's cloak on the window, and use the hearth to damp the fire."

**P7.2 `thirty-years` — The pattern (8 pts: `ledger` 3, `maskwall` 2, `envelope6` 3)**
Take ledger (year one). Look at maskwall: thirty masks, and a thirty-first hook, empty, with tonight's date on a card. Use envelopes (VI): "The Game is won by the one who writes it." Vosk has written himself the winner. `flags.env6`.
- Nudge: "He has kept every year. Read the first and count the masks."
- Clue: "Ledger one, the mask wall, and your last envelope."
- Full: "Take the first ledger from the shelf, look at the wall of masks, and read envelope VI."

**P7.3 `black-wax-proof` — Tie the wax to the man (6 pts: `wax-match` 3, `voskseal` 3)**
Take blackwaxstick from the wax jack. Use blackwaxstick on envelopes (combine) → it matches the seals exactly. Use hobbkey on strongbox? No: Use ferret on strongbox → Chancellor goes in through the back (it is a very old strongbox) and comes out with `voskseal`.
- Nudge: "You re-marked your envelopes in green so you'd know his black when you saw it. You see it."
- Clue: "The wax jack. And the ferret can get into things you can't."
- Full: "Take the black wax and compare it with your envelopes. Use Chancellor on the strongbox to fetch Vosk's seal."

**P7.4 `the-closet` — Find the paper (12 pts: `drawer` 2, `shelfdoor` 4, `abdication` 4, `practice` 2)**
Use quill nib (from ch. 1; `quill` is now `nib`) on drawer → a key to nothing and a draft of tonight's closing speech ("…and so, by His Majesty's own hand, which I hold here…"). Use ferret on ledgers → Chancellor disappears behind year twelve; Use shelfdoor → the closet. Take abdication, take practice (the dated first attempt). Leave copy2 (Otti substitutes it: Use envelopes on copy2? Better: Use abdication on copydesk swaps the real one for the second copy, which Otti has marked with green wax on the back: `flags.swapped`). Vosk will carry the wrong one into the hall.
- Nudge: "The desk is locked, the shelves are full, and the ferret is bored."
- Clue: "Pick the drawer with your nib. Let Chancellor into the shelves; he'll find the door."
- Full: "Use the nib on the desk drawer. Use Chancellor on the ledgers and open the shelf door. Take the abdication and the practice sheet, and leave the second copy in its place."

**P7.5 `out-the-mousehole` — Hear the hall (8 pts: `mousehole` 3, `speech` 5)**
Use mousehole → Otti hears the hall: Vosk announcing that the Master has abandoned the Game and that, by the ancient rule, the Game's author adjudicates; the sixth riddle will be read at the dawn bell and the crown awarded. The dawn bell is in twelve minutes. `flags.heardSpeech`. Leave the way she came; Hobb relocks. Chapter 8.
- Nudge: "The hall is on the other side of that wall. Listen before you walk into it."
- Clue: "The mouse-hole."
- Full: "Use the mouse-hole to listen to Vosk's speech, then leave the study and go to the hall."

### Deaths
- **Fire**: Use ledger on hearth / Use abdication on hearth → "You burn the evidence to be safe. Vosk, at dawn, produces the second copy, and you have burned the only thing that said it was a copy."
- **Cabinet**: Open cabinet of curiosities → "The Chamberlain collects. The Chamberlain's collection includes a mantrap from the reign of Osric, in working order."
- **Globe**: Use globe three times → "The globe is also a decanter. The decanter is also thirty years old. So, briefly, is the inside of your mouth."
- **Window**: Climb window → "Sir Dunstan, in the courtyard, sees a figure in the Chamberlain's window and does, for once, exactly what a Captain of the Guard should do."

### Exit condition
`abdication`, `practice`, `ledger`, `voskseal`, `blackwaxstick`, `scrapbook`, `greatseal`, `queensletter`, `chesspiece`, `flags.swapped`, `flags.heardSpeech`; back to the hall → Chapter 8.

---

## Chapter 8 — Dawn (30 pts)

**Premise.** The Great Hall, full. Vosk on the dais with the second copy under his hand. The dawn bell in twelve game-minutes (four real). Otti, by the ancient rule, is still Master of the Game until the bell, and the Master reads the last riddle. She has to run the sixth stage of the Game live, in front of the court, so that the court, not Otti, names the Usurper, and she has to do it before Vosk reads the paper and the court, cheering, makes it true.

### Rooms

**8a. The Great Hall, dawn** — `hall2`
As the hall, plus: Vosk on the dais (`vosk2`), the Queen in her chair, Perpetua beside her, Hobb at the screens with the King (hidden until called), the court, the Game's holly crown on a cushion, the dawn bell rope (now behind Dunstan), the sixth envelope's stand, the empty King's chair, the Duke's empty place.
Hotspots: `vosk2`, `queen2`, `perpetua4`, `hobb3`, `court`, `hollycrown`, `cushion`, `dawnrope`, `dunstan2`, `stand`, `kingschair2`, `me`.

### Puzzles

**P8.1 `the-master` — Take the Game back (6 pts: `warrant` 3, `stand` 3)**
Vosk: "The Master has returned. Late." Give queensletter to Dunstan → Dunstan, reading, decides the Queen outranks realism and steps aside from the stand and the rope. Use stand → Otti is Master again; Vosk cannot stop her reading without stopping the Game, which he has never done.
- Nudge: "You're still the Master until the bell. Make the guard remember it."
- Clue: "The Queen's warrant. Then the riddle stand."
- Full: "Give the Queen's warrant to Sir Dunstan, then use the riddle stand."

**P8.2 `the-sixth-riddle` — Make the court solve it (14 pts: `read-six` 2, `goblet-show` 3, `scrapbook-show` 3, `wax-show` 3, `king-enters` 3)**
Use envelopes (VI) at the stand → Otti reads it aloud: "The Game is won by the one who writes it." Then she runs the stage the way the Game is always run: evidence, and the court guesses. Give goblet to court (Vosk did not drink). Give scrapbook to court (twenty years: "V. did not drink"). Give blackwaxstick + envelopes (the resealed clues). Each item moves the court; after three, Perpetua stands and says the name first, because that is what Perpetua does. Then Use hobb3 → Hobb brings the King in through the screens in the Duke's borrowed cloak. The court, for once, does not applaud. Vosk reaches for his paper.
- Nudge: "It's the last stage of the Game. Run it like one: evidence, then the court names the Usurper."
- Clue: "The goblet, Hobb's scrapbook, the black wax. Then bring in the King."
- Full: "Read envelope VI from the stand. Give the goblet, the scrapbook and the black wax to the court. Use Hobb to bring in the King."

**P8.3 `the-paper` — The abdication (6 pts: `copy-reveal` 3, `seal-show` 3)**
Vosk reads the abdication aloud, beautifully. Use abdication (the real one) → Otti holds up the original; Use greatseal → "And this is the only thing that could have made either of them true, and the Queen gave it to a herald." Give practice to Queen → the dated first forgery. Vosk, precisely, puts the paper down. Give chesspiece to Vosk → "Her Majesty's black king. She said you would know what it meant." He does (`flags.voskDone`). Dunstan, enormously pleased, arrests him.
- Nudge: "He has a paper. You have the one it was copied from, and the thing it needed."
- Clue: "Show the original, show the seal, give the Queen the practice sheet. The chess piece is for Vosk."
- Full: "Use the abdication, use the Great Seal, give the practice sheet to the Queen and give the black king to Vosk."

**P8.4 `the-crown` — Dawn bell (4 pts: `crown` 4)**
The King, untied, takes the holly crown from the cushion. Choice when he asks who won: "Perpetua named him" / "Hobb took the bolt" / "The Master of the Game." All three end the Game; the King crowns Otti regardless ("You wrote the ending, Herald; Severin only wrote the rest") and the choice colours the last line: the kind answers earn `crown` 4 and Perpetua or Hobb gets the first dance; naming herself scores 1 and the King says "Honest, at least." Use dawnrope → the bell. `flags.gameWon`, clock stops; margin recorded.
- Nudge: "He asked who won. You have all night to think about it and about ten seconds."
- Clue: "Give the credit away. The King is going to ignore you anyway."
- Full: "Tell the King that Perpetua (or Hobb) won, then ring the dawn bell."

### Deaths
- **Clock**: 0:00 before `flags.voskDone` → "The dawn bell. Vosk reads the abdication in his beautiful voice, the court cheers, and by the ancient rule the Game's winner is crowned. The crown is the real one. Thistlemere is governed well and coldly for eleven years, and the Games stop."
- **Vosk**: Hit Vosk / Use stagedagger on Vosk → "You draw a dagger on the Chamberlain on the dais. The blade retracts. The court howls. Dunstan, not knowing it is a prop, does his duty. Thoroughly."
- **Bell early**: Use dawnrope before the riddle is run → "You ring the dawn bell to stop him. The bell ends the Game. The Game's author adjudicates. He adjudicates you out of the room and the paper into law."

### Final screen
"Score: N of 250. Hints used: H. Margin at the bell: M:SS." Ranks: 250 "Master of the Game", 200+ "Herald", 150+ "Pursuivant", 100+ "Page", below "Courtier".
Epilogue card: Otti in the holly crown at the King's right hand; Perpetua at his left, by her own arrangement; Hobb, invited for the first time in twenty years, asleep in the Chamberlain's chair; the Duke of Ashvale returning across the moat at noon with four Masks tied with silk cord, demanding to know who won. Chancellor has the goose.

---

## Complete item list (for `ITEMS`)

| id | name | color | first seen | leaves inventory |
| --- | --- | --- | --- | --- |
| envelopes | Clue envelopes | 15 | ch1 | kept (shown ch8) |
| quill → nib | Quill / nib | 15 | ch1 | quill breaks ch1; nib used ch7 |
| thread | Embroidery thread | 12 | ch1 | ch4 (Hobb), remainder ch5 (Perpetua) |
| needle | Needle | 7 | ch1 | kept |
| tabard | Herald's tabard | 14 | ch1 | worn |
| seal | Heralds' seal | 6 | ch1 | kept |
| wax | Green wax | 10 | ch1 | kept |
| droppedmask | Kidnapper's mask | 0 | ch2 | ch2 (Perpetua) |
| ropeend | Cut rope | 6 | ch2 | kept |
| goblet | Vosk's goblet | 14 | ch2 | ch8 (court) |
| torch | Torch | 6 | ch2 | ch4 (burns out) |
| woodencrown | Wooden crown | 6 | ch3 | ch6 (Duke) |
| stagedagger | Stage dagger | 7 | ch3 | kept |
| ropeladder | Rope ladder | 6 | ch3 | ch6 (ice) |
| beard | False beard | 7 | ch3 | ch4 (Duke) |
| cord | Silk cord | 13 | ch3 | ch6 (sled) |
| sausage | Sausage | 4 | ch3 | ch3 (ferret) |
| ferret | Chancellor | 6 | ch3 | companion item; kept |
| pepper | Pepper | 8 | ch3 | ch4 (Duke) or kept |
| cellarkey | Cellar key | 7 | ch3 | ch3 |
| note | Perpetua's note | 15 | ch3 | kept |
| cloak | The King's cloak | 4 | ch4 | ch5 (dumbwaiter) → returned ch6 → ch6 (Duke) |
| map | Kidnappers' map | 15 | ch4 | ch5 (with cloak) |
| bolt | Crossbow bolt | 7 | ch4 | kept |
| lantern | Lantern | 14 | ch4 | kept |
| candle | Altar candle | 15 | ch4 | ch4 |
| perpcloak | Perpetua's cloak | 13 | ch5 | ch7 (window) |
| greatseal | The Queen's Great Seal | 14 | ch5 | ch8 |
| queensletter | The Queen's warrant | 15 | ch5 | ch8 (Dunstan) |
| chesspiece | Black king | 0 | ch5 | ch8 (Vosk) |
| scrapbook | Hobb's scrapbook | 6 | ch6 | ch8 (court) |
| lantern2 | Gate lantern | 14 | ch6 | ch6 (Perpetua) |
| kingcord | The King's bonds | 6 | ch6 | kept |
| hobbkey | Hobb's study key | 7 | ch6 | kept |
| ledger | Game ledger, year one | 15 | ch7 | kept |
| blackwaxstick | Black wax | 0 | ch7 | ch8 (court) |
| voskseal | Vosk's seal | 8 | ch7 | kept |
| abdication | The abdication | 15 | ch7 | ch8 |
| practice | Practice sheet | 15 | ch7 | ch8 (Queen) |

## Puzzle ids for `GAMES['thistlemere'].puzzles`
ch1 `[wake-up, black-wax, no-key, first-bell]`; ch2 `[run-the-game, wrong-men, sister-one, the-road]`; ch3 `[the-cask, props, chancellor, down-not-out, dumbwaiter-tease]`; ch4 `[the-duke, tomb-and-torch, the-camp, hobb]`; ch5 `[dunstan, sister-two, the-queen, envelope-four]`; ch6 `[hobb-gate, the-decoy, the-swap, the-king]`; ch7 `[in-and-quiet, thirty-years, black-wax-proof, the-closet, out-the-mousehole]`; ch8 `[the-master, the-sixth-riddle, the-paper, the-crown]`.
Each entry's three strings are the Nudge / Clue / Full lines above, verbatim.

## Implementation notes
- Add `'thistlemere'` and `'thistlemere-walkthrough'` to `CATALOG` ($7.99 / $1.99) and `GAMES['thistlemere']` with `walkthroughSku` and the puzzles above; hints in `src/games/thistlemere-hints.js`, never under `public/`.
- Same module shape as Mop & Galaxy: `public/games/thistlemere/{game,data,rooms,art,script}.js` on the shared engine; `DEFINITION.clock = { chapter: 8, start: 720, rate: 3, stopFlag: 'voskDone', lateAt: 120 }`, label "Bell in m:ss"; `chapter1DoneFlag: 'leftGarret'`; `startRoom: 'garret'`.
- Flags that cross chapters: `sawCart`, `resealed`, `env1..env6`, `evidence`, `perp` (0–3), `actorsFound`, `knowsPostern`, `knowsHand`, `hobbAlly`, `queenKnows`, `kingSafe`, `studyDark`, `swapped`, `heardSpeech`, `voskDone`, `gameWon`.
- The envelopes are one inventory item with a counter (`flags.envOpen`); "use envelopes" opens the next one, "read envelope III" re-reads an opened one.
- Chess puzzle: a fixed position; accept "move bishop to f7", "use bishop", or a click on the board hotspot; two wrong moves get the Queen's commentary and a stronger hint, never a death.
- Soft timers count actions: crypt torch (12, suspended when the lantern is lit), moat ice (15, +8 with the ladder). Only chapter 8 uses the real clock.
- Art: 17 rooms (garret, gallery1, hall, screens, buttery, kitchen, chapel, crypt, towerstair, solar, postern, moat, study, closet, hall2 reuses hall with dawn light). To cut scope merge `screens` into `hall` and `closet` into `study`: 15 backgrounds. Cast: Otti, Perpetua, Vosk, the Duke, Hobb, Dunstan, Gudrun, the Queen, the King, Tam, the Masks, Chancellor, Lord Protector, the Archbishop (parrot).
- Point check: 20 + 30 + 35 + 30 + 35 + 30 + 40 + 30 = 250. Within chapters: ch1 3+5+7+5; ch2 5+12+6+7; ch3 8+4+10+8+5; ch4 7+5+8+10; ch5 8+10+12+5; ch6 6+9+12+3; ch7 6+8+6+12+8; ch8 6+14+6+4.
