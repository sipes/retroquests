# Nine Miles to Nowhere — puzzle & item map, chapters 1–8

Design spec for implementation on the shared engine (`public/games/_shared/engine.js`). Companion to `docs/nine-miles-story.md`. Conventions as for Mop & Galaxy and Thistlemere: rooms have `title`, `walk` box, `describe`, `spots`; items have `name`, `color` (EGA index), `words`, `look`; points are awarded once per `scored` key; hints are `[nudge, clue, full solution]` per puzzle id, served from `src/games/nine-miles-hints.js` only to walkthrough owners. Game id `nine-miles`. Chapter 1 is the free scene; the paywall triggers at the end of it.

## Scoring budget (250 total)

| Chapter | Points | Running total |
| --- | --- | --- |
| 1 The Starlite Diner (free) | 20 | 20 |
| 2 The Riverside Motel | 30 | 50 |
| 3 The County Fair | 35 | 85 |
| 4 The Greyline Depot | 30 | 115 |
| 5 The Keel & Anchor | 35 | 150 |
| 6 The River | 30 | 180 |
| 7 The Impound Lot | 40 | 220 |
| 8 Courtroom B | 30 | 250 |

Verbs as the other games: Walk, Look, Take, Use, Talk (plus parser-only Give/Eat/Drink/Open/Search/Climb/Hit/Read/Sit/Call).

## Running jokes and rules
- **Vin is an inventory item** (`vin`), like Mop and Chancellor: a hotspot in any room where he is in the inventory, Talk gives a chapter-specific line, and "Use Vin on X" is how he picks locks, charms people and intimidates goons. He has a **wander rule**: in chapters 3, 4 and 5 there is one hotspot per room that he drifts to if the player performs four actions without talking to him or using him; he is then not in the inventory until the player finds him there (a short, free puzzle each time, no points lost, two points gained the first time).
- **Gus on the phone.** Dale's phone (`phone`) rings at chapter starts and twice mid-chapter; answering is optional and never required, but each call gives one true thing in a pile of panic. The phone's battery is a countdown of calls, not time: it dies in chapter 6 unless charged at the fair (Pip's charger), which gates one bonus puzzle in chapter 7.
- **The clipboard.** `clipboard` holds the bond form, Dale's authority. It is examined by three people in the game; each time Dale can present it straight (truthful) or doctored (one forged initial). The forged route is faster and costs the "honest" ending line; both routes score the same.
- **Marla.** `flags.marla` runs 0–3 across chapters 1, 4 and 6: hostile, bargaining, ally. It changes who throws the punch in chapter 8, not the score.
- **Timers.** Action-counted soft timers in chapters 2 (the goons' cigarette), 4 (the bus) and 6 (the current). The only real clock is chapter 8: 12 game-minutes at 3 game-seconds per real second (4 real minutes), pausing on messages, choices, hints, modals and backgrounding.

---

## Chapter 1 — The Starlite Diner (free scene) — 20 pts

**Premise.** 9:50 p.m. Dale parks the office wagon outside the Starlite, a chrome diner on the river road with the fair's lights behind it. Gus's instructions, from a hospital bed: "Grey hair, nice coat, eats like a bird, do not let him talk you into anything." The diner has eleven customers. Three have grey hair. One of them is Marla Deacon, who should not be here. Dale has a bond form with a photocopied photo on it, handcuffs, a phone, and no idea how to do this.

### Rooms

**1a. The diner** — `diner`
Counter with Earlene behind it, a pie case, booths (a trucker, two teenagers, an old man in a tweed coat doing a crossword, a couple arguing, Marla in the far booth facing the door), a jukebox, a payphone, a restroom door, a rack of free county maps, the kitchen pass, the front door.
Hotspots: `earlene`, `counter`, `piecase`, `trucker`, `teens`, `tweed` (Vin), `couple`, `marla`, `jukebox`, `payphone`, `restroom`, `maps`, `pass`, `door`, `me`.

**1b. The lot** — `lot`
Dale's station wagon (hood up by the end), Marla's black pickup, the trucker's rig, a dumpster, the river road sign (COURTHOUSE 9), a pay-and-display machine that has never worked, the diner's back door, the dark edge of the fairground.
Hotspots: `wagon`, `hood`, `wagondoor`, `pickup`, `rig`, `dumpster`, `roadsign`, `machine`, `backdoor`, `fairedge`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `clipboard` | Clipboard | 6 | "Bail bond 22-0419, Carrow, V. Surety: Marchetti Bail Bonds. Appearance: 9:00 a.m., Courtroom B. The photo is a photocopy of a photocopy. He could be anyone with hair." |
| `cuffs` | Handcuffs | 7 | "Office handcuffs. The key is on Gus's key ring. Gus is in hospital. You decide not to think about that yet." |
| `phone` | Phone | 0 | "Your phone. 41%. Gus has called four times. Gus will call again." |
| `wagonkeys` | Wagon keys | 14 | "Keys to the office wagon, a 1991 estate the colour of weak tea." |
| `pie` | Slice of pie | 6 | "Starlite pecan. Vin says it is the best in the county. Vin has strong opinions on pie." |
| `map` | County map | 15 | "A free county map. Someone has drawn the river road in pen and written '9 mi' at the courthouse, which is either helpful or a threat." |
| `tip` | Twenty dollars | 10 | "Your last twenty. Earlene's, if you want her memory to work in your favour." |

### Puzzles

**P1.1 `which-one` — Find Vin (6 pts: `look-form` 1, `earlene` 2, `tweed` 3)**
Look at clipboard. Talk to Earlene: "Grey hair? Honey, it's Friday." Look at trucker (wrong), teens (wrong), tweed: a man doing the crossword in pen, a good coat, a plate with one bite of pie left that he has been not-eating for twenty minutes, binoculars on the seat. Talk to tweed → "Mr Pruitt. Sit down. The pie is excellent and you look terrible." `flags.foundVin`.
- Nudge: "Three people here have grey hair. One of them has been waiting for you."
- Clue: "Look at what each of them is doing. One of them is doing nothing, very carefully."
- Full: "Look at the clipboard, talk to Earlene, then look at the man in the tweed coat and talk to him."

**P1.2 `the-pie` — Get him to leave (6 pts: `vin-talk` 2, `pie` 2, `tip` 2)**
Talk to Vin: he will leave when he has finished the pie, and he has decided not to finish the pie until Dale has had some. Use piecase / Talk to Earlene → Dale buys a slice (`pie`). Eat pie → Vin finishes his. Give tip to Earlene → she will remember a trucker and nobody else when the sheriff asks. Without the tip, chapter 2 opens with the goons already at the motel door (harder timer). `flags.earleneQuiet`.
- Nudge: "He won't leave until the pie is done, and he won't finish it alone."
- Clue: "Buy a slice. Eat it. Tip the waitress for her forgetfulness."
- Full: "Buy pie at the counter and eat it. Give your twenty to Earlene."

**P1.3 `marla` — The woman in the far booth (4 pts: `marla-look` 1, `marla-talk` 3)**
Look at Marla: Dale's ex-wife, a bounty hunter's licence on her belt, coffee untouched, watching the door. Talk: she is here for the same man and the same fee, and she would rather Dale went home. Choice: snipe / be civil / offer to split. Civil or split sets `marla` 1. She lets them walk out because she thinks the wagon will not start, and she is right.
- Nudge: "Someone else in this diner is working tonight."
- Clue: "Talk to the woman watching the door. Be nicer than you want to be."
- Full: "Look at Marla and talk to her; choose the civil or the split option."

**P1.4 `nine-miles` — The lot (4 pts: `wagon` 1, `map` 1, `walk` 2)**
Use wagonkeys on wagon → it turns over and dies; Use hood → the battery is gone, not dead: the terminals are clean and the clamps are loose. Someone wants them walking. Take map from the diner rack. Look at roadsign: COURTHOUSE 9. Vin: "I know a motel on the way. My things are in it." Use fairedge / Walk river road → Chapter 2 (paywall).
- Nudge: "The car is the plan. Check the plan."
- Clue: "Try the car, then look under the hood. Take a map."
- Full: "Use the keys on the wagon, look under the hood, take a county map from the diner, and walk the river road."

### Deaths
- **Pie**: Eat pie three times → "You have a third slice to be sociable. Starlite pecan is 60% sugar and 40% a dare. Vin calls the ambulance and tips Earlene for you."
- **Marla's pickup**: Use pickup / search pickup → "You look in your ex-wife's truck. Your ex-wife looks at you looking in her truck. The marriage counsellor said this would happen."
- **Dumpster**: Climb dumpster → "You check the dumpster for your battery. The Starlite's grease trap drains into it. You are found in the morning, preserved."
- **Rig**: Use rig / climb the trucker's cab → "The trucker has a dog in the cab. The dog has a policy about the cab."

### Exit condition
`flags.foundVin`, `vin` in inventory, `map`, `clipboard`, `cuffs`, `phone`; walk the river road → end of free scene. Paywall. If owned, continue to Chapter 2.

---

## Chapter 2 — The Riverside Motel (30 pts)

**Premise.** 10:30. The Riverside: twelve units, a flickering VACANCY, Vin's room at the end (11) with the light off and two men in a sedan watching it: Dutch and Mouse, who smoke in shifts. Inside the room are Vin's binoculars, his heart pills ("not urgent, Dale; I'd like them"), and the first piece of insurance, a locker key. The office is run by a night clerk asleep under a television. Soft timer: Dutch's cigarette lasts twelve actions; when it is out he walks the row.

### Rooms

**2a. The motel row** — `motel`
Units 7–12, the sedan with Dutch and Mouse, an ice machine, a vending machine (sold out except for mints), the pool (drained, a shopping trolley in it), a maid's cart (chained), the office door, the back path to the river.
Hotspots: `units`, `unit11`, `window11`, `sedan`, `dutch`, `mouse`, `icemachine`, `vending`, `pool`, `trolley`, `maidcart`, `officedoor`, `riverpath`, `vinbot`, `me`.

**2b. The office** — `office`
The night clerk (Royce Jr, asleep), a key board (11's spare is missing; 12's is there), a television, a register, a bell, a coffee pot, a back door into the laundry, the laundry (a connecting door to unit 12's bathroom).
Hotspots: `clerk`, `keyboard`, `key12`, `tv`, `register`, `bell`, `coffee`, `laundrydoor`, `laundry`, `connecting`, `me`.

**2c. Unit 12 / Unit 11** — `rooms`
Two units with a bathroom wall between them and a vent above the shared duct. Unit 12: empty, a Bible, a chair. Unit 11 (reached through the vent): Vin's case, binoculars on the dresser, pills in the bathroom, the locker key taped under the drawer, a window onto the sedan.
Hotspots: `bible`, `chair`, `vent`, `case`, `binoculars`, `pills`, `drawer`, `lockerkey`, `window`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `key12` | Key to 12 | 14 | "Unit 12. The unit next to Vin's. The clerk sleeps, the key board does not." |
| `mints` | Mints | 15 | "A roll of motel mints. Vin takes one and says 'Thank you, Dale,' as if you had done something." |
| `binoculars` | Vin's binoculars | 0 | "Good German glass. Vin says a man who can see three hundred yards does not need to run three hundred yards." |
| `pills` | Vin's pills | 15 | "Heart pills. Twice a day. He is overdue. He does not mention it again, which is how you know." |
| `lockerkey` | Locker key | 7 | "Greyline Depot, locker 41. The first piece of insurance." |
| `register` | Motel register | 15 | "Tonight's entries: 'J. Smith', 'J. Smith', and 'R. Tubbs Jr (staff)'. The night clerk is the sheriff's boy." |

### Puzzles

**P2.1 `the-watchers` — Read the sedan (5 pts: `sedan-look` 2, `vin-glass` 3)**
Look at sedan: two men, one cigarette. Use Vin on sedan (Talk to Vin about them) → he names them, Dutch and Mouse, says Dutch smokes a cigarette in twelve minutes and walks the row when it is out, and that Mouse is frightened of dogs, "which will be useful later or not." Starts the timer visibly ("Dutch lights up").
- Nudge: "Two men in a car outside your witness's room. Your witness knows them."
- Clue: "Ask Vin about the sedan."
- Full: "Look at the sedan, then talk to Vin about it. You have the length of a cigarette."

**P2.2 `next-door` — Get the key to 12 (8 pts: `bell` 1, `register` 3, `key12` 4)**
Office: the clerk is asleep. Use bell → he wakes, says "Full", sleeps. Look at register: the clerk is Tubbs's son, which is why 11's spare key is gone. Take key12 from the board while he sleeps (Use bell first wakes him; the trick is to Use coffee pot → the smell of fresh coffee puts him deeper asleep, which is a joke Vin finds funny). Alternative: Use Vin on clerk → Vin asks for 12 in a voice the clerk's father uses and gets it (`key12` either way).
- Nudge: "Eleven is watched. Twelve isn't, and twelve shares a wall."
- Clue: "The key board behind the sleeping clerk. Or let Vin ask."
- Full: "Go into the office, look at the register, and take the key to unit 12 from the board (or have Vin ask for it)."

**P2.3 `through-the-wall` — Vin's things (12 pts: `vent` 3, `binoculars` 3, `pills` 3, `lockerkey` 3)**
Use key12 on unit 12's door (from the laundry connecting door, so the sedan never sees them cross the row). Use chair on vent → Dale climbs; Vin says he will "mind the room" and sits on the bed. In 11: Take binoculars, pills; Search drawer → `lockerkey`. Look out of window at the sedan from the other side: Dutch's cigarette is nearly out.
- Nudge: "Twelve and eleven share a bathroom wall and a duct."
- Clue: "Stand on the chair, go through the vent, and search everything in eleven, including under the drawer."
- Full: "Use the key on unit 12, use the chair on the vent, and in unit 11 take the binoculars and the pills and search the drawer for the locker key."

**P2.4 `out-the-back` — Leave before Dutch walks (5 pts: `trolley` 2, `riverpath` 3)**
Back in 12, Vin has gone (first wander: he is at the ice machine, "a man gets thirsty"). Dutch's cigarette is out. Use trolley (from the drained pool; Vin pushed it there while "minding the room") on the sedan → it rolls down the slope into the sedan's bumper; Dutch and Mouse get out to look; Dale and Vin take the river path. `flags.leftMotel`.
- Nudge: "Dutch is about to walk. Give him something to walk to that isn't you."
- Clue: "There's a shopping trolley in the empty pool and the lot slopes toward the sedan."
- Full: "Collect Vin from the ice machine, use the trolley on the sedan, and take the river path."

### Deaths
- **Dutch walks**: twelve actions after the cigarette with Dale in the row → "Dutch finishes his cigarette and walks the row. You are in the row. Dutch does not like surprises and expresses this with the car."
- **Front door of 11**: Use unit11 door → "You try Vin's door. It is unlocked, which Vin would have told you is the problem. Mouse is inside. Mouse is frightened of dogs, not of you."
- **Vending**: Hit vending three times → "The machine gives up its mints. It also gives up its footing. Vin, from the sedan's point of view, has just watched a man killed by a vending machine, and says so."
- **Pool**: Use pool / dive → "The pool is drained. You know it is drained. You checked. Your body does not read reports."

### Exit condition
`binoculars`, `pills`, `lockerkey`, Vin collected, `flags.leftMotel`; the river path → Chapter 3 (the fair's back fence).

---

## Chapter 3 — The County Fair (35 pts)

**Premise.** 11:15. The fairground is between the motel and the depot, and it is the only place in Loomis Creek with transport: Pip's golf-cart shuttle. Deputies at the main gate have Dale's name (Tubbs has called Gus's office and got the answering machine, which Dale set to read out the bond number). Vin wanders here more than anywhere: the shooting gallery, the bird exhibit, the pie tent. Dale has to charge his phone, get a cart, keep a hitman from winning a stuffed heron, and get out through the livestock gate.

### Rooms

**3a. The midway** — `midway`
The shooting gallery, a ring-toss, the Ferris wheel, a dunk tank (DUNK THE DEPUTY; the deputy is on break), the pie tent, a lemonade stand, the poultry barn door, Pip's cart stand (a sign: SHUTTLE — $2 — BACK IN 5), the main gate (two deputies), speakers.
Hotspots: `gallery`, `galleryman`, `ringtoss`, `wheel`, `dunktank`, `dunkseat`, `pietent`, `lemonade`, `barndoor`, `cartstand`, `pipsign`, `maingate`, `deputies`, `speakers`, `vinbot`, `me`.

**3b. The poultry barn** — `barn`
Cages of show birds (a prize heron in a pen, the owner asleep), straw bales, a feed bin, a generator with a power strip, Pip asleep on a bale with a dead phone, the livestock gate (padlocked; the key is on the sleeping owner), a tractor.
Hotspots: `cages`, `heron`, `owner`, `ownerkey`, `bales`, `feedbin`, `generator`, `powerstrip`, `pip`, `pipphone`, `livestockgate`, `padlock`, `tractor`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `tickets` | Ride tickets | 12 | "Six fair tickets. Vin found them. You did not ask where." |
| `charger` | Phone charger | 15 | "Pip's charger. Pip wants it back with a phone attached and 100% on it." |
| `heronprize` | Stuffed heron | 15 | "A three-foot plush heron from the shooting gallery. Vin is very pleased. It will not fit in a locker." |
| `lemonade` | Lemonade | 14 | "Fair lemonade: a cup of sugar with an opinion about lemons." |
| `gatekey` | Livestock gate key | 7 | "The key to the back gate, lifted from a man asleep beside his prize-winning heron. The heron watched you do it." |
| `cartkey` | Golf-cart key | 14 | "Pip's cart. Top speed: a brisk walk. Nine miles at a brisk walk is still better than nine miles." |

### Puzzles

**P3.1 `gate-watch` — Don't use the front (4 pts: `deputies` 2, `speakers` 2)**
Look at deputies: they have a fax of the bond form; one of them is reading Dale's name off it. Look at speakers / Talk to Vin → Vin: "Never go in the front of anywhere. Especially a fair." `flags.sawDeputies`.
- Nudge: "There are two uniforms at the gate and they're reading something with your name on it."
- Clue: "Look at the deputies. Ask Vin."
- Full: "Look at the deputies at the main gate and talk to Vin about them."

**P3.2 `find-vin-one` — The gallery (7 pts: `wander1` 2, `gallery` 3, `heron` 2)**
Vin wanders to the shooting gallery after four actions. Find him there (`wander1`). The gallery man will not let Vin shoot ("you'll clear me out, old man"); Use tickets on gallery → Dale shoots, badly; Use Vin on gallery (Vin "adjusts your elbow") → three ducks, the top prize: the stuffed heron (`heron` 2). The heron matters later (dunk tank).
- Nudge: "You've lost him again. Where would a man with good eyes go at a fair?"
- Clue: "The shooting gallery. Let him help you shoot, since they won't let him."
- Full: "Find Vin at the shooting gallery, use the tickets on it, and use Vin on the gallery to win the heron."

**P3.3 `pip` — Transport (10 pts: `pip-find` 2, `generator` 3, `charge` 3, `cart` 2)**
The cart stand is empty; the sign says BACK IN 5 and has for an hour. In the barn: Pip asleep with a dead phone. Use generator → power to the strip. Use charger (Pip's, on the bale) on powerstrip, Use phone on charger → Dale's phone charges to 100% (gates a chapter-7 bonus). Talk to Pip → he will lend the cart to anyone who gets his phone charged; Give charger/phone to Pip → he plugs his own in; Take cartkey. `flags.phoneFull`.
- Nudge: "The shuttle driver is a kid. Kids are asleep somewhere with a dead phone."
- Clue: "The poultry barn has a generator and Pip. Charge things."
- Full: "In the barn, use the generator, use the charger on the power strip and your phone on the charger, then talk to Pip and take the cart key."

**P3.4 `dunk` — Hide a hitman (8 pts: `dunkseat` 2, `heron-dunk` 3, `lemonade` 3)**
Deputies start walking the midway (after `flags.phoneFull`). Vin is in the open. Use heronprize on dunkseat → the heron sits in the DUNK THE DEPUTY seat in Vin's coat; Use lemonade on Vin → he sits behind the lemonade stand with the owner's apron, selling. The deputies dunk the heron, applaud, move on. (Take lemonade from the stand first; Vin: "Nobody looks at the man selling lemonade.")
- Nudge: "Uniforms on the midway. Your witness needs to be something else for a minute."
- Clue: "Put the heron in the dunk tank wearing Vin's coat. Put Vin behind a counter."
- Full: "Take a lemonade. Use the stuffed heron on the dunk-tank seat and use the lemonade on Vin so he works the stand while the deputies pass."

**P3.5 `back-gate` — Out through the livestock gate (6 pts: `ownerkey` 3, `gate` 3)**
The owner of the prize heron is asleep by his pen with the gate key on his belt. Take ownerkey (first attempt: the heron hisses; Give feed from feedbin to heron first, then take). Use gatekey on padlock; Use cartkey on cart → Dale, Vin and the heron's cousin drive out at a brisk walk.
- Nudge: "The back gate is locked and the man with the key is asleep next to a bird that isn't."
- Clue: "Feed the heron, then take the key."
- Full: "Take feed from the bin and give it to the heron, take the owner's key, unlock the livestock gate and use the cart key on the cart."

### Deaths
- **Ferris wheel**: Use wheel / ride with tickets twice → "You ride the wheel to look for Vin. The deputies look for you. From the top of a Ferris wheel you are the easiest thing in the county to find and the slowest to arrive."
- **Dunk tank**: Sit in dunkseat yourself → "You take the deputy's seat to test it. A deputy, returning from break, tests you. The tank is four feet deep. You are six."
- **Tractor**: Use tractor → "The tractor starts. The tractor's brakes do not. The poultry barn is lighter than it looks."
- **Main gate**: Use maingate / Talk to deputies with clipboard → "You show the deputies the bond form, because you are an honest man. They read it, because they are not. Tubbs's car arrives before Vin can finish his lemonade."

### Exit condition
`cartkey`, Vin collected, `flags.phoneFull` (optional), out the livestock gate → Chapter 4.

---

## Chapter 4 — The Greyline Depot (30 pts)

**Premise.** Midnight. The bus depot: lockers, a ticket window, a waiting room with a sleeping drunk and a vending machine, the last bus (12:20 to the city) idling. Locker 41 has the ledger. Marla is waiting by the lockers because she has read the same motel register. Vin wanders onto the bus. Dale has to get the ledger, get the cuffs back (Marla takes them off his belt while saying hello), and keep the witness off a bus that leaves in a soft-timer's worth of actions.

### Rooms

**4a. The waiting room** — `depot`
Lockers (41 among them), the ticket window (Agnes), benches, a drunk asleep under a newspaper, a departures board (12:20 CITY — BOARDING), a payphone, a lost-property box, the doors to the bays, Marla by the lockers.
Hotspots: `lockers`, `locker41`, `window`, `agnes`, `benches`, `drunk`, `newspaper`, `board`, `payphone`, `lostprop`, `baydoor`, `marla2`, `vinbot`, `me`.

**4b. The bays** — `bays`
The 12:20 bus (door open, driver smoking), a baggage hold, a luggage trolley, a bench where Vin is sitting with a ticket, the yard gate to the river road.
Hotspots: `bus`, `busdoor`, `driver`, `hold`, `luggagetrolley`, `vinbench`, `yardgate`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `ledger` | The ledger | 0 | "A pocket ledger in Vin's hand, columns of initials and numbers. Insurance, he calls it. It is in a code, and the code is a woman's name." |
| `busticket` | Bus ticket | 15 | "12:20 to the city, one adult. Vin bought it 'in case you turned out to be useless, Dale. You didn't.'" |
| `newspaper` | Newspaper | 15 | "Friday's Loomis Clarion. Page 3: SHERIFF TUBBS OPENS IMPOUND EXPANSION. The photo shows a fence, a dog and a smile." |
| `umbrella` | Lost umbrella | 1 | "A lost-property umbrella. Everyone leaves one somewhere." |

### Puzzles

**P4.1 `locker-41` — The ledger (6 pts: `locker` 4, `ledger-look` 2)**
Use lockerkey on locker41 → `ledger`. Look at ledger: coded. Marla watches Dale do it and says, "Nice. Now give me the cuffs." They are already in her hand.
- Nudge: "You have a key with a number on it and a wall of numbers."
- Clue: "Locker 41."
- Full: "Use the locker key on locker 41 and look at the ledger."

**P4.2 `marla-two` — The cuffs (10 pts: `marla-talk2` 3, `cuffs-back` 4, `split` 3)**
Talk to Marla: she will take Vin to the courthouse herself and collect; Dale can go home. Choice: threaten (nothing), plead (nothing), or point out that Gus's bond names Marchetti as surety, so the fee is Gus's whichever of them walks him in, and the only money in play is the Bellamys', "and you're not that." `marla` 2. She throws the cuffs back. Use newspaper on Marla (show the impound story) → she says one true thing: Tubbs towed a 1991 wagon from the Starlite lot at eleven. `flags.wagonImpounded`.
- Nudge: "She has your handcuffs and a point. You have a better point."
- Clue: "Who actually gets paid for this bond? Say it."
- Full: "Talk to Marla and choose the line about the surety. Show her the newspaper for news of your car."

**P4.3 `find-vin-two` — The bus (9 pts: `wander2` 2, `busticket` 3, `driver` 4)**
Vin is on the bench in the bays with a ticket, watching the door, deciding. Talk to Vin: he asks, seriously, whether Dale wants to do this. Choice: "No" (Vin boards; death-equivalent: see deaths), "Yes" → he tears up the ticket. Take busticket (the pieces; flavour). Then the driver, who has been paid by Dutch to report a man in a tweed coat, reaches for his radio: Use umbrella on driver → the oldest trick, a sharp knock on the elbow, the radio in a puddle; or Use Vin on driver → Vin tells him about his own uncle in Dutch's position and the driver decides he is tired. Soft timer: the bus leaves after ten actions in the bays; if Vin is still deciding, he is on it.
- Nudge: "He's not lost this time. He's deciding."
- Clue: "Talk to him and mean it. Then deal with the driver's radio."
- Full: "Find Vin on the bench and tell him yes. Use the umbrella on the driver (or use Vin on him) before the bus leaves."

**P4.4 `yard-gate` — Back to the river road (5 pts: `agnes` 2, `yardgate` 3)**
Talk to Agnes at the window → the yard gate code is the year the depot opened, on the plaque (1961). Use yardgate → code; the cart is where they left it.
- Nudge: "The front of the depot is watched. The yard has a gate with a code."
- Clue: "Ask the ticket clerk. Read the plaque."
- Full: "Talk to Agnes, then use the yard gate and enter 1961."

### Deaths
- **The bus**: Vin boards → "The 12:20 pulls out with Vin in the third row, waving. He testifies in the city on Monday, perfectly well. The bond forfeits at nine. Gus, from his hospital bed, explains what two hundred thousand dollars means in a voice you will hear for the rest of your life."
- **Drunk**: Take newspaper from drunk twice → "The man under the newspaper is not drunk. He is Big Teddy, and he was waiting for someone to lift the paper."
- **Hold**: Climb into the baggage hold → "You hide in the hold. The driver, who checks the hold, closes it. The city is two hours away and the hold is airtight for one."
- **Payphone**: Call Gus from the payphone → "You call Gus collect. Gus, on morphine, tells you where the office safe key is, loudly, on a line the sheriff's son is listening to. Everyone arrives at once."

### Exit condition
`ledger`, `cuffs` back, Vin collected and committed (`flags.vinStays`), `flags.wagonImpounded`; yard gate → Chapter 5.

---

## Chapter 5 — The Keel & Anchor (35 pts)

**Premise.** 1 a.m. Lorraine Keel's bar on the river, closing. Vin has been walking here all night without saying so. The ledger's code is Lorraine's name, letter for digit, and Lorraine has not spoken to Vin since 2006. Her bloodhound Duchess loves him. Dale needs the ledger decoded enough to know what it says, Lorraine's johnboat key for the river, and twenty years of silence dealt with before the Bellamys' second car finds the bar. Duchess joins as a second companion item for chapters 5–6.

### Rooms

**5a. The bar** — `bar`
Lorraine behind the bar, the last two drinkers (regulars), a jukebox (Lorraine's songs only), a dartboard, a photo wall (one photo turned to the wall), a till, a hatch to the cellar, the back door to the dock, Duchess asleep on the floor, the phone behind the bar.
Hotspots: `lorraine`, `regulars`, `jukebox2`, `darts`, `photowall`, `turnedphoto`, `till`, `cellarhatch`, `dockdoor`, `duchess`, `barphone`, `vinbot`, `me`.

**5b. The dock** — `dock`
Lorraine's johnboat (chained), an outboard (no fuel), a fuel can (locked in a box), a bait fridge (the icebox), a bench, the river, the lights of the railway bridge downstream, a second sedan arriving on the road above (after the code is broken).
Hotspots: `johnboat`, `chain`, `outboard`, `fuelbox`, `baitfridge`, `bench2`, `river`, `bridgelights`, `sedan2`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `photo` | The turned photo | 15 | "Vin and Lorraine, 1998, on this dock, with a bloodhound puppy. Someone wrote 'Duchess, 8 wks' on the back and someone else wrote nothing." |
| `cipher` | Decoded page | 15 | "One page of the ledger in Lorraine's hand: dates, amounts, and the words TUBBS and IMPOUND. The sheriff launders through the lot. The rest is still code." |
| `boatkey` | Johnboat key | 7 | "The key to the chain on Lorraine's boat. She says if you sink it she will know." |
| `fuelcan` | Fuel can | 4 | "Two gallons. Enough for the crossing, not the river." |
| `duchess` | Duchess | 6 | "Lorraine's bloodhound. Old, patient, and the only one in the county who has never lost Vin." |
| `biscuits` | Dog biscuits | 14 | "Duchess's biscuits. Also, it turns out, Mouse's worst fear in a box." |

### Puzzles

**P5.1 `lorraine` — Closing time (6 pts: `lorraine-talk` 2, `regulars` 2, `photo` 2)**
Talk to Lorraine: she serves Dale, ignores Vin. Talk to regulars (they know Vin; they leave when he asks). Take turnedphoto → `photo`. Vin will not talk to her first.
- Nudge: "She won't look at him. Find out why before you ask her for anything."
- Clue: "Clear the bar. Turn the photo round."
- Full: "Talk to Lorraine, talk to the regulars so they leave, and take the photo that's turned to the wall."

**P5.2 `the-conversation` — Twenty years (12 pts: `referee` 4, `vin-says` 4, `lorraine-says` 4)**
Give photo to Vin → he talks. Give photo to Lorraine → she talks. Dale referees a three-round choice dialogue between them (each round: let Vin speak / let Lorraine speak / say something himself). The scoring route is the one where Dale speaks least: `referee` for letting each of them go first once, `vin-says` when Vin says what he left to protect her from, `lorraine-says` when Lorraine says she knew. Ends with Lorraine taking the ledger and a pencil. Any route reaches the end; the "Dale talks" route takes a round longer and sets `flags.daleTalked` (no penalty; different epilogue line).
- Nudge: "You are not in this conversation. Your job is to make it happen and then shut up."
- Clue: "Give each of them the photo. When they talk, let them."
- Full: "Give the photo to Vin, then to Lorraine, and in the dialogue choose to let them speak rather than speaking yourself."

**P5.3 `the-code` — Lorraine decodes a page (6 pts: `cipher` 4, `tubbs` 2)**
Lorraine: letters of her name for digits, "which is the kind of thing he does." She decodes one page (`cipher`) and stops: the rest she will do "when he's alive on Monday." Look at cipher: Tubbs, the impound lot, the money. `flags.knowsTubbs`.
- Nudge: "The code is a name. The name is behind the bar."
- Clue: "Lorraine has the key. She will use it once."
- Full: "After the conversation, give the ledger to Lorraine. Read the decoded page."

**P5.4 `the-boat` — Fuel, key, dog (11 pts: `boatkey` 3, `fuel` 3, `biscuits` 2, `duchess` 3)**
Lorraine gives `boatkey` for the asking now; the fuel box is locked and she has lost the key years ago: Use Vin on fuelbox → opened. Take fuelcan; Use fuelcan on outboard. Take biscuits from behind the bar; Give biscuit to Duchess → she gets up for the first time in a year and follows Vin to the dock (`duchess`). A second sedan arrives above the bar as the outboard starts. `flags.boatReady`.
- Nudge: "Boat, fuel, and the one thing in this bar that can track your witness when you lose him."
- Clue: "Ask Lorraine for the key, let Vin open the fuel box, and bribe the dog."
- Full: "Talk to Lorraine for the boat key, use Vin on the fuel box, use the fuel can on the outboard, take the biscuits and give one to Duchess."

### Deaths
- **Jukebox**: Use jukebox three times → "You play a song that isn't Lorraine's. Lorraine's policy on this has been explained to you by the dartboard."
- **Cellar**: Use cellarhatch / climb down → "The cellar floods at high water. It is high water. Lorraine mentions this to your remains."
- **River**: Swim / Use river → "The river in October is nine degrees and in a hurry. You are neither."
- **Sedan**: Walk up to the road → "You go up to see who it is. It is Dutch. Dutch has not forgotten the trolley."

### Exit condition
`cipher`, `boatkey`, `duchess`, Vin aboard, `flags.boatReady`, `flags.knowsTubbs`; push off → Chapter 6.

---

## Chapter 6 — The River (30 pts)

**Premise.** 2 a.m. The ferry is chained for the night; the railway bridge is the only crossing and the Bellamys have a car at each end. Marla is on the bridge in the middle, with the lights off, because she followed the second sedan and did not like what she heard on their radio: the fee is off the table and the Bellamys are paying for a body. The johnboat has two gallons, a current, a hitman who cannot swim, a bloodhound, and a bail clerk at the tiller. Soft timer: the current; twelve actions on the open water before the boat is below the bridge and past the dock.

### Rooms

**6a. The open river** — `river`
The johnboat (tiller, outboard, bow), the current, a buoy, the chained ferry, the railway bridge ahead (a pier with a ladder), the two cars' headlights on the banks, a drifting log, the city side's boat ramp.
Hotspots: `tiller`, `outboard2`, `bow`, `current`, `buoy`, `ferry`, `pier`, `ladder`, `headlightsL`, `headlightsR`, `log`, `ramp`, `vinbot`, `duchessbot`, `me`.

**6b. The bridge pier** — `pier`
A maintenance platform under the span, a ladder up to the track, Marla sitting on the platform with her boots off, a signal box, a rope, the river below.
Hotspots: `platform`, `trackladder`, `marla3`, `boots`, `signalbox`, `rope`, `riverbelow`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `rope` | Bridge rope | 6 | "Maintenance rope from the pier. Thirty feet. Marla ties better knots than you. She always did." |
| `flare` | Flare | 12 | "A railway flare from the signal box. Red light, three minutes, visible from both banks. That is the point." |
| `marlakeys` | Marla's pickup keys | 14 | "Keys to Marla's truck, which is parked on the city side, which she tells you after she decides. Not before." |

### Puzzles

**P6.1 `steer` — Make the pier (8 pts: `tiller` 2, `log` 3, `buoy` 3)**
Use tiller → head for the pier. Use binoculars on the river → the log ahead and the buoy's chain. Use Vin on bow → he fends the log off with an oar. Use buoy → Dale loops the painter round the buoy chain to kill speed; without it they overshoot (timer penalty of four). Make the pier ladder.
- Nudge: "The current wants you past the bridge. The bridge is where you need to be."
- Clue: "Look ahead with the binoculars. Let Vin fend off; use the buoy as a brake."
- Full: "Use the tiller, use the binoculars on the river, use Vin on the bow for the log, and use the buoy before the pier ladder."

**P6.2 `marla-three` — The bridge (12 pts: `marla-talk3` 4, `boots` 2, `rope` 3, `ally` 3)**
Climb the ladder: Marla, boots off, has been listening to the Bellamys' channel on a scanner. Talk → she tells Dale what the fee has become. Choice: gloat / ask her to walk away / ask her to help. "Help" → `marla` 3. Give pills to Vin in front of her (he is overdue, grey, and sitting down on the platform) → she looks at him and decides. Take rope (she ties it off). Take boots? No: Give boots to Marla, which is the joke. `flags.marlaAlly`.
- Nudge: "She's not here for the fee any more. Find out what she is here for."
- Clue: "Talk to her. Let her see Vin take his pills. Ask, don't tell."
- Full: "Climb to the platform, talk to Marla and ask for help, give Vin his pills while she watches, and take the rope."

**P6.3 `the-flare` — Clear a bank (6 pts: `signalbox` 2, `flare` 4)**
Both banks have a car. Use signalbox → open; Take flare. Use flare on riverbelow (drop it in the boat, set adrift) → the empty johnboat burns red down the river and both cars drive downstream after it. Duchess and Vin are already on the platform. Lorraine will know.
- Nudge: "Two cars, two banks, one boat you no longer need."
- Clue: "The signal box has a flare. Boats that burn get followed."
- Full: "Open the signal box, take the flare, and use it on the river to send the boat downstream burning."

**P6.4 `across` — The track (4 pts: `track` 4)**
Use trackladder → up to the rails; Use rope on Duchess (a sling; Marla and Dale lower-haul her; Vin walks the sleepers with a hand on each of them). Across to the city side and Marla's truck. `flags.crossed`.
- Nudge: "Up and over. The dog can't do the ladder; the rope can."
- Clue: "Use the rope on Duchess, then climb to the track."
- Full: "Use the rope on Duchess and climb the track ladder. Walk the bridge to Marla's truck."

### Deaths
- **Current**: twelve actions on the water → "You go under the bridge and past it, and the river keeps going, and there is a weir two miles down that the county has been meaning to signpost."
- **Ferry**: Use ferry / climb on → "The ferry is chained to the far bank by a cable at neck height. You learn this at speed."
- **Headlights**: Steer for a bank → "You land. Dutch is on this bank. Dutch has had a long night and a short temper and a car."
- **Track**: Use track without the flare sent / dawdle on the rails → "The 2:40 freight does not stop at Loomis Creek and does not know you are on the bridge. Marla, who does, says a word she learned from you."

### Exit condition
`flags.crossed`, `flags.marlaAlly` (or at least `marla` 2), Vin and Duchess over; into Marla's truck → Chapter 7.

---

## Chapter 7 — The Impound Lot (40 pts)

**Premise.** 3:30 a.m. The county impound lot, Tubbs's private bank: a chain-link fence, floodlights, a guard dog (Rufus), a Portakabin office with the sheriff's son awake this time, Dale's wagon in row C with the bond paperwork in the glovebox and, Vin finally admits, the real ledger under the spare wheel; the depot one was "a copy, Dale, with Tubbs's pages left out, in case somebody took it off you. Somebody did. You." Marla stays with the truck as the getaway. Dale has to get in, get the papers and the ledger, and get out past a dog, a son and a camera, and Tubbs himself arrives at four.

### Rooms

**7a. The fence** — `fence`
Chain-link, a gate (padlock and chain), the camera on a pole, the floodlights' breaker box, Rufus's run, a drainage culvert under the fence, Marla's truck, a hedge.
Hotspots: `chainlink`, `gate2`, `gatelock`, `camera`, `breaker`, `rufus`, `run`, `culvert`, `truck`, `hedge`, `vinbot`, `duchessbot`, `me`.

**7b. The lot** — `lotyard`
Rows of cars, Dale's wagon (row C), a tow truck, the Portakabin (lit; Royce Jr at a desk with a scanner), a cash box visible through the window, a board of tow tickets, a fuel pump, Tubbs's own cruiser (arrives after the ledger is found).
Hotspots: `rows`, `wagon2`, `glovebox`, `sparewheel`, `towtruck`, `cabin`, `royce`, `cashbox`, `ticketboard`, `pump`, `cruiser`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `bondpapers` | Bond paperwork | 15 | "The original bond, the surety receipt and the appearance notice. Without these, Courtroom B is a room you are visiting." |
| `realledger` | The real ledger | 0 | "Under the spare wheel of a 1991 estate the colour of weak tea, where it has been since 9:55 last night. Every page. Tubbs's included." |
| `towticket` | Tow ticket | 15 | "C-14, 1991 wagon, towed 23:05 from the Starlite, authorised R. TUBBS. Reason: 'suspicious'. It was parked." |
| `cashboxkey` | Cash box key | 14 | "Royce Jr's key to his father's cash box. You do not take the cash. You take the receipt book." |
| `receiptbook` | Receipt book | 15 | "Impound receipts. Half of them to companies that do not exist, in the sheriff's hand. Lorraine's page, in ink." |

### Puzzles

**P7.1 `rufus` — The dog (8 pts: `camera` 2, `breaker` 3, `rufus` 3)**
Look at camera: it pans; Use breaker → the floodlights die and the camera with them (Royce Jr assumes the usual outage). Rufus: Use biscuits on run → he eats; Use Duchess on run → Duchess, who outranks every dog in the county, lies down at the fence and Rufus lies down with her. `flags.dogDown`.
- Nudge: "Lights, camera, dog. In that order."
- Clue: "The breaker box kills the lights and the camera. Duchess handles the dog."
- Full: "Use the breaker box, use the biscuits on the dog run, then use Duchess on the run."

**P7.2 `under-the-wire` — Get in (6 pts: `culvert` 3, `vin-gate` 3)**
Use culvert → Dale fits (just); Vin does not and will not. Use Vin on gatelock from outside → he opens the padlock in the dark by feel while describing it. Both in. (Either route alone works; both score.)
- Nudge: "There's a way under for a thin man and a way through for a patient one."
- Clue: "The culvert for you, the padlock for Vin."
- Full: "Use the culvert, and use Vin on the gate padlock."

**P7.3 `row-c` — The wagon (10 pts: `ticketboard` 2, `glovebox` 3, `sparewheel` 5)**
Look at ticketboard → C-14; Take towticket. Use wagonkeys on wagon2 → Search glovebox → `bondpapers`. Vin: "Dale. The spare." Use sparewheel → `realledger`. Vin's explanation; Dale's reaction is a choice (angry / relieved / "You could have told me." → Vin: "You'd have driven differently.").
- Nudge: "Your car is here somewhere. So is everything you need."
- Clue: "The tow board gives the row. The glovebox has the papers. Ask Vin about the spare."
- Full: "Read the tow ticket board, open the wagon, search the glovebox, then use the spare wheel."

**P7.4 `royce-jr` — The cabin (10 pts: `scanner` 2, `cashboxkey` 4, `receiptbook` 4)**
Royce Jr is awake with a scanner. If `flags.phoneFull`: Use phone → Dale calls the cabin's landline from outside and reads Royce the bond number in Gus's voice; Royce goes to the gate to "check a delivery", and Dale takes `cashboxkey` from the desk, opens the box, takes only the `receiptbook` (bonus route: `scanner` 2 is for Using Vin on the scanner to change its channel first). If the phone is dead: Use Vin on cabin → Vin walks in, sits down, and talks to Royce about his father for four minutes while Dale works behind him. Both score `cashboxkey` and `receiptbook`.
- Nudge: "The sheriff's son has the cash box. The cash box has the only honest paper in the county."
- Clue: "Get him out of the cabin: a phone call, or Vin. Take the receipt book, not the cash."
- Full: "If your phone has charge, call the cabin and send Royce to the gate; otherwise use Vin on the cabin. Take the cash box key, open the box, take the receipt book."

**P7.5 `tubbs` — Out before four (6 pts: `cruiser` 2, `towtruck` 4)**
Tubbs's cruiser pulls in at the gate (after `realledger`). The gate is blocked. Use towtruck → Dale starts it (keys in it; it is a county vehicle) and Vin drives it through the back fence at a brisk walk, with the wagon on the hook, because Dale is not leaving the wagon twice. Marla follows. Tubbs, at the gate, makes a phone call: "They've got the book. Courthouse. Bring Lyle." `flags.tubbsKnows`.
- Nudge: "The sheriff is at the gate. The lot has its own truck and a back fence."
- Clue: "The tow truck. Hook your wagon. Let Vin drive."
- Full: "Use the tow truck; Vin drives it, with the wagon on the hook, through the back fence."

### Deaths
- **Rufus**: Use culvert before the dog is down → "Rufus meets you in the culvert. The culvert is eighteen inches wide. Rufus is the better fit."
- **Camera**: Climb the fence under the camera → "The camera sees you. Royce Jr sees the camera. Tubbs sees Royce Jr's text. You see all three, in that order, from the back of the cruiser."
- **Pump**: Use pump / smoke → "The impound lot's fuel pump has not passed an inspection since the sheriff became the inspector."
- **Cash**: Take cash from cashbox → "You take the money, because it is right there. Marla, who knows you, looks at you in the truck mirror, and the thing that breaks is not the law."

### Exit condition
`bondpapers`, `realledger`, `receiptbook`, `towticket`, Vin, Marla, Duchess; through the back fence → Chapter 8.

---

## Chapter 8 — Courtroom B (30 pts)

**Premise.** 8:48 a.m. The courthouse steps, twelve game-minutes to nine (four real). Tubbs at the metal detector with two deputies. The Bellamy brothers, Lyle and Curtis, in the gallery of Courtroom B in good suits. Investigator Okafor in the clerk's office on the second floor, who does not know Vin is in the building. Dale has the bond papers, the real ledger, the receipt book, a hitman, a bounty hunter, a bloodhound and a tow truck double-parked. The clerk's window closes at nine; the bond is logged when the clerk stamps the appearance notice, not when Vin sits down.

### Rooms

**8a. The steps and lobby** — `steps`
The steps, the tow truck, the metal detector (Tubbs, two deputies), a side door (staff, badge-locked), the clerk's window inside, a stairwell, a notice board, a flagpole, the press (one reporter from the Clarion, waiting for the Bellamy verdict).
Hotspots: `detector`, `tubbs2`, `deputies2`, `sidedoor`, `clerkwindow`, `stairwell`, `noticeboard`, `flagpole`, `reporter`, `vinbot`, `marlabot`, `duchessbot`, `me`.

**8b. The clerk's office** — `clerk`
The clerk (Mrs Abernathy, who has stamped things for thirty years), the stamp, the appearance log, Okafor at a side desk with coffee, a door to Courtroom B's judge's corridor, a wall clock (the real one).
Hotspots: `abernathy`, `stamp`, `log`, `okafor`, `judgedoor`, `wallclock`, `me`.

### Puzzles

**P8.1 `the-detector` — Tubbs (8 pts: `reporter` 3, `receipt-show` 5)**
Tubbs will not let Vin through: "No ID, no entry." Talk to reporter → she is here for the Bellamys and bored. Give receiptbook to reporter (or Show towticket) → she asks Tubbs, loudly, on the steps, about impound receipts made out to companies that do not exist. Tubbs leaves the detector to deal with her. `flags.tubbsBusy`.
- Nudge: "The sheriff is a wall. Walls fall to the press."
- Clue: "The Clarion reporter would love the receipt book."
- Full: "Talk to the reporter and give her the receipt book. Tubbs leaves the detector."

**P8.2 `the-side-door` — Split the party (8 pts: `marla-door` 4, `duchess-door` 4)**
The deputies still hold the detector. Use Marla on deputies → she walks up, licence out, with a prisoner (Dale, in his own cuffs) and the deputies process a bounty hunter's paperwork for four minutes. Use Duchess on sidedoor → the staff door opens for a bloodhound that a deputy's wife walks on Sundays; Vin goes in behind the dog. `flags.inside`.
- Nudge: "Three of you, two routes. Nobody is looking at the dog."
- Clue: "Let Marla arrest you at the detector. Send Vin in behind Duchess at the staff door."
- Full: "Use Marla on the deputies, then use Duchess on the side door so Vin can go in."

**P8.3 `the-stamp` — Mrs Abernathy (10 pts: `papers` 3, `stamp` 4, `okafor` 3)**
Upstairs: Give bondpapers to Abernathy → she reads every line, as she has for thirty years, and asks where the defendant is. Vin: "Here, ma'am." Use stamp → she stamps the appearance log at 8:57 (`flags.stamped`; the bond is safe; the clock keeps running for the ledger). Give realledger to Okafor → she reads two pages, stands up, and asks who Dale is. "The clerk." "Whose?" "Marchetti Bail Bonds." "Not any more, I think." `flags.okafor`.
- Nudge: "The bond is saved by a stamp, not a seat. Find the woman with the stamp."
- Clue: "The clerk's office. Papers first. Then the ledger to the investigator at the side desk."
- Full: "Give the bond papers to Mrs Abernathy and use the stamp. Give the real ledger to Investigator Okafor."

**P8.4 `the-gallery` — Nine o'clock (4 pts: `choice` 4)**
Use judgedoor → Courtroom B. The Bellamys in the gallery; Tubbs in the doorway, finished with the press; Vin on the stand. The clock stops. Choice when Lyle Bellamy, on the way out in cuffs, asks Dale who he is: "The clerk" / "Nobody" / "Vincent's ride." Any answer ends the game; "Vincent's ride" scores 4, the others 2 and 1. Marla throws the punch at Tubbs (if `marla` 3) or Vin does, slowly, which is somehow worse. Final.
- Nudge: "He asked who you are. You've had nine miles to think about it."
- Clue: "You weren't nobody. You were the ride."
- Full: "Go through the judge's door and, when Bellamy asks, say 'Vincent's ride.'"

### Deaths
- **Clock**: 9:00 before `flags.stamped` → "Nine o'clock. Mrs Abernathy closes the log. Vin testifies at 9:04, beautifully, and the Bellamys are finished, and the bond is forfeit, and Gus Marchetti, discharged, drives straight to the courthouse to explain to you in person what you have cost him, and does, for an hour, on the steps, to applause."
- **Detector**: Walk Vin through the detector with Tubbs on it → "Tubbs pats Vin down, finds nothing, finds the ledger on you, and says 'Evidence,' and puts it in his jacket, and that is the end of the ledger and, in about a week, of Vin."
- **Flagpole**: Climb flagpole → "You climb the flagpole to see over the crowd. The crowd sees you. So does the Clarion. The photograph runs above the fold, which Gus frames."
- **Bellamys**: Talk to the Bellamys in the gallery before the stamp → "You introduce yourself to Lyle Bellamy, because you are polite. Lyle is polite too. Curtis is not, in the car park, at 9:15."

### Final screen
"Score: N of 250. Hints used: H. Margin at the stamp: M:SS." Ranks: 250 "Vincent's Ride", 200+ "Field Agent", 150+ "Recovery Clerk", 100+ "Clerk", below "Passenger".
Epilogue card: Vin on the courthouse steps at noon with his binoculars round Dale's neck, pointing out a heron on the river. Marla's truck, with Dale's wagon still on the tow hook behind it. Duchess asleep on the steps. Dale's phone, at 100%, showing a text to Gus: "I quit. The bond's fine. Feel better." Gus, discharged, has not read it; he is at the Starlite having pie.

---

## Complete item list (for `ITEMS`)

| id | name | color | first seen | leaves inventory |
| --- | --- | --- | --- | --- |
| clipboard | Clipboard | 6 | ch1 | kept |
| cuffs | Handcuffs | 7 | ch1 | taken ch4, back ch4; used ch8 |
| phone | Phone | 0 | ch1 | kept (charge state in `flags.phoneFull`) |
| wagonkeys | Wagon keys | 14 | ch1 | kept |
| pie | Slice of pie | 6 | ch1 | ch1 |
| map | County map | 15 | ch1 | kept |
| tip | Twenty dollars | 10 | ch1 | ch1 (Earlene) |
| vin | Vin | 7 | ch1 | companion item; wanders ch2–5 |
| key12 | Key to 12 | 14 | ch2 | ch2 |
| mints | Mints | 15 | ch2 | kept (flavour) |
| binoculars | Vin's binoculars | 0 | ch2 | kept |
| pills | Vin's pills | 15 | ch2 | ch6 (Vin) |
| lockerkey | Locker key | 7 | ch2 | ch4 |
| tickets | Ride tickets | 12 | ch3 | ch3 |
| charger | Phone charger | 15 | ch3 | ch3 (Pip) |
| heronprize | Stuffed heron | 15 | ch3 | ch3 (dunk tank) |
| lemonade | Lemonade | 14 | ch3 | ch3 |
| gatekey | Livestock gate key | 7 | ch3 | ch3 |
| cartkey | Golf-cart key | 14 | ch3 | kept |
| ledger | The ledger (copy) | 0 | ch4 | ch5 (Lorraine) |
| busticket | Bus ticket | 15 | ch4 | kept (torn) |
| newspaper | Newspaper | 15 | ch4 | kept |
| umbrella | Lost umbrella | 1 | ch4 | ch4 or kept |
| photo | The turned photo | 15 | ch5 | ch5 |
| cipher | Decoded page | 15 | ch5 | kept |
| boatkey | Johnboat key | 7 | ch5 | ch5 |
| fuelcan | Fuel can | 4 | ch5 | ch5 |
| duchess | Duchess | 6 | ch5 | companion item ch5–8 |
| biscuits | Dog biscuits | 14 | ch5 | ch7 |
| rope | Bridge rope | 6 | ch6 | ch6 |
| flare | Flare | 12 | ch6 | ch6 |
| marlakeys | Marla's keys | 14 | ch6 | kept (flavour) |
| bondpapers | Bond paperwork | 15 | ch7 | ch8 (Abernathy) |
| realledger | The real ledger | 0 | ch7 | ch8 (Okafor) |
| towticket | Tow ticket | 15 | ch7 | kept |
| cashboxkey | Cash box key | 14 | ch7 | ch7 |
| receiptbook | Receipt book | 15 | ch7 | ch8 (reporter) |

## Puzzle ids for `GAMES['nine-miles'].puzzles`
ch1 `[which-one, the-pie, marla, nine-miles]`; ch2 `[the-watchers, next-door, through-the-wall, out-the-back]`; ch3 `[gate-watch, find-vin-one, pip, dunk, back-gate]`; ch4 `[locker-41, marla-two, find-vin-two, yard-gate]`; ch5 `[lorraine, the-conversation, the-code, the-boat]`; ch6 `[steer, marla-three, the-flare, across]`; ch7 `[rufus, under-the-wire, row-c, royce-jr, tubbs]`; ch8 `[the-detector, the-side-door, the-stamp, the-gallery]`.
Each entry's three strings are the Nudge / Clue / Full lines above, verbatim.

## Implementation notes
- Add `'nine-miles'` and `'nine-miles-walkthrough'` to `CATALOG` ($7.99 / $1.99) and `GAMES['nine-miles']`; hints in `src/games/nine-miles-hints.js`, never under `public/`.
- Same module shape as Mop & Galaxy on the shared engine: `public/games/nine-miles/{game,data,rooms,art,script}.js`; `DEFINITION.clock = { chapter: 8, start: 720, rate: 3, stopFlag: 'stamped', lateAt: 120 }`, label "Nine at m:ss"; `chapter1DoneFlag: 'leftDiner'`; `startRoom: 'diner'`.
- Companions: `vin` always, `duchess` from chapter 5; both are inventory items with hotspots per room, like Mop. Vin's wander rule is a per-room `wanderTo` spot and a four-action counter reset by Talk/Use on Vin; the engine needs nothing new.
- Flags that cross chapters: `foundVin`, `earleneQuiet`, `marla` (0–3), `leftMotel`, `phoneFull`, `wagonImpounded`, `vinStays`, `knowsTubbs`, `daleTalked`, `marlaAlly`, `crossed`, `dogDown`, `tubbsKnows`, `tubbsBusy`, `inside`, `stamped`, `okafor`.
- Soft timers count actions: Dutch's cigarette (12), the bus (10 in the bays), the current (12, +4 penalty if the buoy is skipped). Only chapter 8 uses the real clock.
- Art: 16 rooms (diner, lot, motel, office, rooms, midway, barn, depot, bays, bar, dock, river, pier, fence, lotyard, steps, clerk = 17; merge `office` into `motel` and `clerk` into `steps` to make 15). Night palette throughout: EGA blues and blacks with neon and sodium accents; the only daylight is the epilogue. Cast: Dale, Vin, Marla, Earlene, Dutch and Mouse, Royce Jr, Pip, Agnes, the driver, Lorraine, Tubbs, Rufus, Duchess, Mrs Abernathy, Okafor, the reporter, the Bellamys.
- Point check: 20 + 30 + 35 + 30 + 35 + 30 + 40 + 30 = 250. Within chapters: ch1 6+6+4+4; ch2 5+8+12+5; ch3 4+7+10+8+6; ch4 6+10+9+5; ch5 6+12+6+11; ch6 8+12+6+4; ch7 8+6+10+10+6; ch8 8+8+10+4.
