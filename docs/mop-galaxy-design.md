# Mop & Galaxy — puzzle & item map, chapters 1–8

Design spec for implementation. Companion to `docs/mop-galaxy-story.md`. Conventions follow `public/index.html` as built for Port Lucky: rooms have `title`, `walk` box, `describe`, `spots` (`id`, `name`, `rect`, `at`, `words`, optional `when`); items have `name`, `color` (EGA index), `words`, `look`; points are awarded once per `scored` key; hints are `[nudge, clue, full solution]` per puzzle id, served from `src/catalog.js` only to walkthrough owners. Game id `mop-galaxy`. Chapter 1 is the free scene; the paywall triggers at the end of it exactly as Port Lucky's does at the suite door.

## Scoring budget (250 total)

| Chapter | Points | Running total |
| --- | --- | --- |
| 1 Deck 9, Custodial (free) | 20 | 20 |
| 2 Cryo Bay | 25 | 45 |
| 3 Galley & Hydroponics | 35 | 80 |
| 4 Engineering | 35 | 115 |
| 5 Hull | 30 | 145 |
| 6 Bridge | 30 | 175 |
| 7 The Lien | 45 | 220 |
| 8 Thaw | 30 | 250 |

Verbs: Walk, Look, Take, Use, Talk (plus parser-only Give/Eat/Drink/Push/Pull/Open/Search/Climb). "Talk to Mop" is available in every room and gives a chapter-specific hint-flavoured joke that never solves a puzzle (so the paid hints stay the only real help).

## Companion rules
- Mop follows Wim between rooms (drawn behind him, bobbing). Mop is a hotspot (`mop`) everywhere; Talk gives flavour; Use item on Mop is how several puzzles work (Mop has a polish canister, a wax reservoir, a cargo tray and a signature stamp).
- Mop cannot climb ladders or enter ducts. Rooms reached by duct have no Mop hotspot; Wim comments on the silence.
- Gumbo (from ch. 3) rides in Wim's pocket as an item and grows: `gumbo1` → `gumbo2` → `gumbo3` as it eats plastic. Size gates puzzles.

## Time
No real clock except chapter 8 (four-minute countdown, same mechanics as Port Lucky ch. 7). Each chapter's opening message gives the ship time ("Shift hour 3", etc.).

---

## Chapter 1 — Deck 9, Custodial (free scene) — 20 pts

**Premise.** Wim wakes in the Deck 9 supply closet, having fallen asleep on a sack of absorbent granules. Alarms. Mop reports, delighted, that "a delivery arrived at Airlock 4 and I signed for it." The deck's blast doors have been sealed from the corridor side. Through a floor vent Wim sees armed people in grey. He must get off Deck 9 without using the door.

### Rooms

**1a. Supply closet** — `closet`
Shelves of cleaning chemicals (locked cage for the strong stuff), a sack of granules Wim slept on, a mop bucket, Wim's mop, a time clock on the wall, a coverall hook, a floor vent, a laundry chute hatch (too small for a person, Mop points out, "but not for a mop"), the closet door to the deck corridor.
Hotspots: `granules`, `shelves`, `cage`, `bucket`, `mymop` (Wim's mop), `timeclock`, `hook`, `coverall`, `vent`, `chute`, `door`, `mop` (robot), `me`.

**1b. Deck 9 corridor** — `deck9`
Sealed blast door (red light, "LOCKED FROM BRIDGE"), a vending machine (SnakPak-9000), a maintenance ladder up to a ceiling duct (grille bolted), a wall intercom (dead), a fire cabinet (axe behind glass, glass is "polycarbonate, forget it"), a water fountain, Mop's charging dock.
Hotspots: `blastdoor`, `vending`, `coinslot`, `ladder`, `grille`, `bolts`, `intercom`, `firecab`, `axe`, `fountain`, `dock`, `mop`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `mymop` | Mop | 7 | "Your mop. Third Class issue. You've named it, but not out loud." |
| `badge` | Contractor badge | 14 | "TARRAGON, W. — CUSTODIAL (CONTRACT). Opens closets. Does not open anything that matters." |
| `coin` | Lucky coin | 14 | "A ten-credit coin taped inside the coverall pocket with the note 'FOR EMERGENCIES — W.' Past-you had a plan." |
| `snakpak` | SnakPak | 13 | "A protein bar in a plastic wrapper. The wrapper is the structural part." |
| `wrench` | Adjustable wrench | 7 | "The closet's one real tool. It was holding the shelf up." |
| `granules` | Absorbent granules | 14 | "A handful of the stuff you pour on spills. Turns liquid into something you can sweep." |

### Puzzles

**P1.1 `wake-up` — Get your bearings (3 pts: `look-arm` 1, `badge` 2)**
Look at self: Wim has a granule imprint on his face. Take coverall from hook → `badge` (in the pocket) and `coin`. Talk to Mop: the delivery story, sets the premise.
- Nudge: "You've just woken up. Check what you've got on you, and what's on the hook."
- Clue: "Your coverall is on the hook. Things live in pockets."
- Full: "Take the coverall from the hook. You get your contractor badge and a lucky coin. Talk to Mop to find out what happened."

**P1.2 `vent-peek` — See what the delivery was (3 pts: `vent` 3)**
Look at vent / Use vent: Wim lies down and looks through the floor grille into Deck 8: grey uniforms, rifles, a crate stencilled VELLACOURT RECLAMATION. Sets `flags.sawBoarders`. Required before the blast door's "LOCKED FROM BRIDGE" message makes sense (Look at blastdoor before this: "It's locked. Odd."; after: "Locked from the bridge. By them.").
- Nudge: "Alarms, a sealed door, and a 'delivery'. There's a way to look at the deck below."
- Clue: "The floor vent in the closet looks down into Deck 8."
- Full: "Use the floor vent in the closet. You see the boarding party."

**P1.3 `snack-tool` — Get the wrench (6 pts: `shelf-look` 1, `coin-vend` 2, `wrench` 3)**
The ceiling grille in the corridor is bolted; the only wrench is wedged under the closet shelf as a prop. Pulling it drops the shelf (death). Solution: Use coin on vending machine → `snakpak`. Use snakpak (the bar, not the wrapper) under the shelf: "Use snakpak on shelf" wedges the bar in place of the wrench. Take wrench. Keep the wrapper (`snakpak` becomes `wrapper`, color 13, look: "An empty SnakPak wrapper. Pure plastic.").
- Nudge: "You need a tool for bolts. The only one on this deck is doing a job already."
- Clue: "The wrench is holding up the shelf. Replace it with something the same size. The vending machine sells things that size."
- Full: "Use the lucky coin on the vending machine to get a SnakPak. Use the SnakPak on the shelf, then take the wrench."

**P1.4 `up-and-out` — Get off Deck 9 (8 pts: `bolts` 3, `mop-chute` 3, `climb` 2)**
Use wrench on grille → bolts off. Climb ladder → Wim fits, Mop doesn't. Mop can't be left: the search party will "ask it questions" and Mop will answer all of them. Solution: Use Mop on chute (the laundry chute) → Mop drops two decks to the laundry, promising to meet Wim "at the clean end". Then Climb ladder. Without sending Mop first, climbing triggers the paywall end anyway but with a worse epilogue line and `mop-chute` unscored.
- Nudge: "The grille is the way out for you. It isn't a way out for everyone."
- Clue: "Mop can't climb. Mop can fit down a chute. There's a chute in the closet."
- Full: "Use the wrench on the ceiling grille. Use Mop on the laundry chute in the closet so Mop escapes to the laundry. Then climb the ladder."

### Deaths
- **Shelf**: Take wrench before wedging the shelf → "You pull the wrench. The shelf, forty litres of industrial degreaser, and the concept of a quiet shift come down on you together. Mop rates the spill 'a nine'."
- **Axe**: Use wrench/mop on fire cabinet glass repeatedly (third hit) → "The polycarbonate holds. The wrench doesn't. It comes back at roughly the speed it left. Mop would like it noted that you were warned about the polycarbonate."
- **Blast door**: Use badge on blastdoor three times → "The door reads your contractor badge for the third time and files a security report. The security report is read by the people with rifles. They come to discuss it."
- **Fountain + chemicals**: Drink from fountain after Using cage (chemicals leaked into the line) → "The fountain tastes of lemons. Industrial lemons. You are now extremely clean on the inside."

### Exit condition
Grille open, Mop in chute, Wim climbs → end of free scene. Paywall. If owned, continue to Chapter 2.

---

## Chapter 2 — The Cryo Bay (25 pts)

**Premise.** The duct drops Wim into the Cryo Bay: two thousand colonist pods in long rows under blue light, thirty crew pods on a raised gallery, Captain Okonjo's pod at the end with a brass plaque. Vane's salvage declaration is pinned to the main door. A search party is sweeping the rows. Mop is not here (laundry).

### Rooms

**2a. Colonist rows** — `cryo`
Pods (one empty, lid open, nameplate "RESERVED — CUSTODIAL (CONTRACT)" — the pod they never used for him), a pod monitor terminal, a notice on the main door, a children's drawing taped to a pod (a blob with a smile: "GUMBO"), a maintenance cart, a coolant hose, a floor drain, the search party's flashlights (hazard that moves row to row).
Hotspots: `pods`, `emptypod`, `nameplate`, `terminal`, `notice`, `drawing`, `cart`, `hose`, `drain`, `flashlights` (dynamic), `gallery` (stairs up), `maindoor`, `me`.

**2b. Crew gallery** — `gallery`
Thirty crew pods, Okonjo's pod with plaque, a thaw console (needs captain's code), a crew locker (Thistle's note: "FOOD & TOOLS ISSUED TO CREW ONLY — SEE ME"), a wall roster, a duct to the galley level (grille loose), a fire blanket.
Hotspots: `okonjo`, `plaque`, `thawconsole`, `locker`, `roster`, `duct2`, `blanket`, `crewpods`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `notice` | Salvage declaration | 15 | "NOTICE OF SALVAGE. Vessel LUMINOUS HYACINTH, found derelict (no conscious crew aboard). Claimed under Lane Code 44.7 by Vellacourt Reclamation Fleet, Capt. T. Vane. Ship's representative: [a wax stamp of a smiling mop]. 'No conscious crew aboard.' You are, technically, conscious." |
| `roster` | Crew roster | 15 | "Thirty names, ranks and pod numbers. The last line is handwritten: 'Tarragon, W. — not crew, do not freeze, someone has to do the floors. — A.O.'" |
| `hose` | Coolant hose | 11 | "A length of cryo coolant hose. Very cold. Don't put your tongue on it." |
| `drawing` | Gumbo drawing | 13 | "A child's drawing of a smiling blob labelled GUMBO, with 'FEED HIM PLASTIK' underneath. Taped to pod 1,204." |

### Puzzles

**P2.1 `read-the-room` — Understand the claim (5 pts: `notice` 3, `nameplate` 2)**
Take notice from maindoor. Look at emptypod nameplate: the pod reserved for Wim, never used. Together these set `flags.knowsLoophole` and the game's thesis: Wim awake = claim void.
- Nudge: "Someone has pinned paperwork to the door. Paperwork is how this is being done."
- Clue: "Read the notice. Then look at the one empty pod."
- Full: "Take the salvage declaration from the main door and read it. Look at the empty pod's nameplate."

**P2.2 `hide` — Survive the sweep (8 pts: `hide` 5, `drain` 3)**
The flashlights advance one row every few seconds. Being in the same row when they arrive = caught (death). Solution: Use emptypod (climb in, lid closes, pod reads "OCCUPIED — TARRAGON, W." and the searchers walk past reading nameplates: "Contractor. Not crew. Doesn't count."). This is where Wim overhears that they want him asleep. Bonus `drain`: before hiding, Use hose on drain so the coolant mist fogs the row and the sweep slows (3 pts, makes timing easy).
- Nudge: "They're searching row by row. You need to not be in a row."
- Clue: "There is exactly one pod with nobody in it, and it has your name on it."
- Full: "Optionally use the coolant hose on the floor drain to fog the room. Then use the empty pod to climb in and hide until the search passes."

**P2.3 `roster` — Prove you're crew (later) (6 pts: `roster` 3, `okonjo-look` 3)**
On the gallery: Take roster (the handwritten line is the evidence Thistle will accept in ch. 3, and the evidence Vane will dismiss in ch. 6). Look at Okonjo's pod/plaque: "CAPT. ADAEZE OKONJO. THAW CODE HELD BY CAPTAIN." Look at thawconsole: needs an 8-digit code. Sets `flags.needsCode`.
- Nudge: "Up on the gallery is the crew. Somewhere there is a list of who counts."
- Clue: "The wall roster. Read the last line."
- Full: "Go up to the gallery, take the crew roster, and look at the captain's pod and the thaw console."

**P2.4 `duct-two` — Reach the galley level (6 pts: `blanket` 2, `duct2` 4)**
The gallery duct is loose but the duct run passes a hot pipe (death if entered bare). Take blanket (fire blanket). Use blanket on duct2 → Wim wraps the pipe section. Climb duct2.
- Nudge: "There's a way up from the gallery. Something in there is hot."
- Clue: "A fire blanket is for exactly this."
- Full: "Take the fire blanket, use it on the gallery duct, then climb the duct."

### Deaths
- **Caught**: Flashlights reach Wim's row → "Brack finds you behind pod 1,188. 'Found the contractor.' Dorrit reads you Lane Code 44.7 in full. You fall asleep somewhere around subsection (c). They finish the job."
- **Hose**: Use hose on self / Drink hose → "Cryo coolant: minus 140. You are now the best-preserved custodian in the fleet."
- **Hot duct**: Climb duct2 without blanket → "The duct passes the galley steam main. Briefly, so do you."
- **Thaw console**: Use terminal to guess code three times → "Three wrong codes. The console, as designed, wakes the nearest security officer. The nearest security officer is wearing grey."

### Exit condition
`notice`, `roster` in inventory, `flags.knowsLoophole`, `flags.needsCode`; climb duct2 → Chapter 3.

---
## Chapter 3 — Galley & Hydroponics (35 pts)

**Premise.** Wim drops into the galley. Mop is here, freshly laundered ("I went through the hot cycle. I feel wonderful."). Thistle, the hydroponics bot, runs the galley stores and the tool locker and will not issue anything to a contractor. Gumbo, the stowaway blob, lives in the compost unit, starving; the children fed it plastic cutlery for fourteen months and there's none left. The search party will arrive here next; Wim needs food, tools and a way to lock the galley behind him.

### Rooms

**3a. Galley** — `galley`
Serving counter with a badge reader, stacked trays (plastic), a replicator (offline), a dishwasher the size of a car, a wall of drawers (cutlery, all missing), a compost unit (lid rattling), the tool locker (badge reader), a hatch to hydroponics, the corridor door (can be dogged shut with a wheel), Mop's charging point.
Hotspots: `counter`, `reader`, `trays`, `replicator`, `dishwasher`, `drawers`, `compost`, `locker`, `lockerreader`, `hatch`, `corridoor`, `wheel`, `mop`, `me`.

**3b. Hydroponics** — `hydro`
Thistle on a rail among rows of tomatoes, a nutrient tank, a UV lamp bank, a seed vault door (sealed, "COLONY SEED STOCK"), a pruning arm, a bin of plant ties (plastic), Thistle's rule board ("CREW ONLY. CONTRACTORS: NO.").
Hotspots: `thistle`, `tomatoes`, `tank`, `uv`, `vault`, `arm`, `ties`, `board`, `rail`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `tray` | Plastic tray | 13 | "A galley tray. Dishwasher-safe, Gumbo-edible." |
| `ties` | Plant ties | 10 | "A fistful of plastic plant ties. Thistle counts them." |
| `tomato` | Tomato | 12 | "A real tomato. Fourteen months in space and it's the best thing you've seen." |
| `gumbo1` | Gumbo (small) | 10 | "A fist-sized blob. It purrs when it eats plastic. It is looking at your badge." |
| `toolkit` | Toolkit | 7 | "Crew toolkit: driver set, cutters, tape, a multimeter and a laminated card that says DO NOT GIVE TO CONTRACTORS." |
| `rations` | Ration packs | 14 | "Three days of crew rations. Flavour: 'Food'." |
| `oven` | Oven cleaner | 14 | "Galley oven cleaner. Sodium hydroxide. The label has a skull that looks worried." |
| `crewcard` | Temporary crew card | 14 | "TARRAGON, W. — ACTING CREW (per roster, A. Okonjo). Issued by: THISTLE. Expires: when Thistle says so." |

### Puzzles

**P3.1 `feed-gumbo` — Meet Gumbo (7 pts: `compost-look` 1, `tray-feed` 3, `gumbo` 3)**
Look at compost: something inside is rattling the lid and squeaking. Open compost: Gumbo, tiny, hungry. Give tray to compost/Gumbo → it eats the tray, doubles in size, climbs into Wim's pocket (`gumbo1`). The drawing from ch. 2 ("FEED HIM PLASTIK") is the clue. Giving a tomato → Gumbo spits it out, no harm.
- Nudge: "The compost unit is rattling. The children left you instructions about it."
- Clue: "The drawing said feed him plastic. The trays are plastic."
- Full: "Open the compost unit. Give Gumbo a plastic tray. It climbs into your pocket."

**P3.2 `thistle-crew` — Get Thistle to issue a crew card (10 pts: `board` 1, `thistle-talk` 2, `roster-show` 4, `tomato` 3)**
Talk to Thistle: "Contractors: no." Give roster to Thistle: it reads Okonjo's handwritten line, grinds its gears, and rules that "someone has to do the floors" is a duty assignment, which makes Wim acting crew. Issues `crewcard`. Bonus `tomato`: before this, Look at tomatoes and Talk about them — Thistle softens if Wim correctly says they need less nitrogen (Look at tank first reveals the gauge is high). Then Thistle also gives a tomato (needed in ch. 7 for Brack).
- Nudge: "Thistle runs on rules. You need a rule that says you're crew."
- Clue: "The captain wrote something about you on the crew roster. Show it to Thistle."
- Full: "Give the crew roster to Thistle. It issues you a temporary crew card. For a bonus, look at the nutrient tank, then tell Thistle the tomatoes need less nitrogen; it gives you one."

**P3.3 `locker` — Tools, rations, oven cleaner (8 pts: `locker` 4, `oven` 2, `rations` 2)**
Use crewcard on lockerreader → `toolkit`, `rations`. Oven cleaner is in the galley cage, which the crew card also opens (Use crewcard on counter reader → cage unlocks; Take oven). Oven cleaner is needed in ch. 4.
- Nudge: "You're crew now. Crew get tools. Crew also get the dangerous cleaning products."
- Clue: "The crew card opens both badge readers in the galley."
- Full: "Use the crew card on the locker reader for the toolkit and rations, and on the counter reader to unlock the oven cleaner."

**P3.4 `dog-the-door` — Lock the galley (6 pts: `wheel` 2, `gumbo-ties` 2, `dish` 2)**
Footsteps in the corridor. Use wheel on corridoor → dogs it shut, but the wheel spins back (broken ratchet). Solution: Use ties on wheel → Gumbo eats them (wrong: `gumbo-ties` is a *negative* lesson? No; make it positive: Give ties to Gumbo first so Gumbo grows to `gumbo2` and can hold the wheel: Use gumbo2 on wheel → Gumbo wraps the ratchet and holds it.) Alternative: Use toolkit on wheel (tape) also works for `wheel` but without `gumbo-ties`. Then the searchers bang on the door; Use dishwasher → start the giant dishwasher to drown out Wim's exit through the hatch (`dish` 2).
- Nudge: "You can lock the door, but it won't stay locked. You need something to hold it."
- Clue: "Gumbo grips things once it's big enough. Plant ties are plastic."
- Full: "Give the plant ties to Gumbo so it grows. Use Gumbo on the door wheel to hold it shut. Start the dishwasher to cover the noise, then go through the hatch to hydroponics and on to the engineering duct."

**P3.5 `vault-tease` — The seed vault (4 pts: `vault` 4)**
Look at vault; Use crewcard: "ACTING CREW: INSUFFICIENT." Thistle, if asked, explains the vault opens only for the captain and that Vane has asked about it twice. Sets `flags.vaultMatters` (pays off in ch. 6: Vane's real prize is the seed stock, worth more than the colonists; ch. 8 Okonjo seals it).
- Nudge: "Thistle guards a door you can't open. Ask why anyone would want it."
- Clue: "Talk to Thistle about the seed vault."
- Full: "Look at the seed vault, try the crew card, then talk to Thistle about it."

### Deaths
- **Dishwasher**: Climb into dishwasher / Use dishwasher while standing in it → "Industrial cycle: 95 degrees, 40 minutes, sanitise. Mop says you've never looked better."
- **Compost**: Use compost (climb in) after Gumbo leaves → "The compost unit's macerator was waiting for something organic. You qualify."
- **Oven cleaner**: Drink oven cleaner / Use oven on self → "You have cleaned an oven from the inside. The oven is you."
- **Pruning arm**: Use arm / stand in rail path and Talk to Thistle rudely twice → "Thistle prunes what it considers a weed. Thistle considers contractors weeds."

### Exit condition
`crewcard`, `toolkit`, `oven`, `gumbo2` in inventory; door held; through the hatch and the hydroponics service duct (Mop rides the rail lift down with Thistle's permission) → Chapter 4.

---

## Chapter 4 — Engineering (35 pts)

**Premise.** Vane's engineer Ilse has the jump drive's nav core open and is rerouting the ship to the Vellacourt yards; the jump fires in one shift-hour. Wim can't fight an engineer. He can make the drive refuse to fire: the coolant loop monitors purity, and a custodian has exactly two chemicals that will foul it. He also loses his mop here, which matters to him more than it should.

### Rooms

**4a. Drive hall** — `drive`
The jump drive (a cathedral of pipes), Ilse at the nav core (back turned, headphones), the coolant loop intake (a filter housing with a quick-release), a purity gauge, a catwalk, a tool chest (Ilse's), an airlock to the hull access (door A), the reactor door (door B, red), a fire-suppression panel.
Hotspots: `drive`, `ilse`, `navcore`, `intake`, `filter`, `gauge`, `catwalk`, `chest`, `airlockA`, `reactordoor`, `suppression`, `mop`, `me`.

**4b. Reactor anteroom** — `reactor`
Lead glass to the reactor, a dosimeter on a hook, a locker with one EVA suit (size L, Wim is M), a helmet, a tether reel, an O2 bottle rack (one bottle, half full), a suit-check terminal.
Hotspots: `glass`, `dosimeter`, `suitlocker`, `suit`, `helmet`, `tether`, `o2`, `suitcheck`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `polish` | Mop's floor polish | 15 | "A canister of MOP-7 floor polish. 'Lasting shine. Not for consumption. Not for coolant loops.'" (taken from Mop: Use Mop / Take polish from Mop) |
| `filter` | Coolant filter | 7 | "The intake filter. Clean. Expensive. Currently the only thing between the loop and whatever you put in it." |
| `suit` | EVA suit | 15 | "One EVA suit, size L. You are an M. The suit has opinions about this." |
| `helmet` | Helmet | 15 | "Visor cracked at the edge. Tape will do. Tape always does." |
| `tether` | Tether reel | 7 | "Thirty metres of tether and a clip. The clip is the important part." |
| `o2` | O2 bottle | 11 | "Half full. Enough for a short walk. Don't take a long one." |
| `dosimeter` | Dosimeter | 10 | "Reads green. Keep it that way." |

### Puzzles

**P4.1 `distract-ilse` — Get Ilse away from the core (6 pts: `headphones` 2, `suppression` 4)**
Ilse won't notice Wim (headphones) but will notice the intake panel opening (it's in her eyeline). Use suppression panel → a test discharge in the far bay; Ilse jogs over to check it. Window of ~20 seconds (soft timer; if it lapses, she returns, no death, retry).
- Nudge: "Ilse can't hear you. She can see the intake. Give her something else to look at."
- Clue: "The fire-suppression panel has a test button."
- Full: "Use the fire-suppression panel to trigger a test discharge in the far bay, then work on the intake while Ilse is away."

**P4.2 `foul-the-loop` — Make the drive refuse to fire (14 pts: `filter-out` 3, `polish-in` 4, `oven-in` 4, `gauge` 3)**
Use toolkit on intake (quick-release) → Take filter. Use polish on intake, Use oven on intake. The purity gauge goes from green to a colour the designers didn't plan for. The drive logs "COOLANT CONTAMINATED — JUMP INHIBITED 12 H". Putting the filter back (Use filter on intake) hides the sabotage from Ilse: +`gauge` 3 only if filter replaced before she returns. Order: filter out → chemicals → filter in.
- Nudge: "You can't stop the engineer. You can make the engine too fussy to run."
- Clue: "The coolant loop checks its own purity. You're carrying two things it would hate."
- Full: "Use the toolkit on the intake and take the filter. Use the floor polish and the oven cleaner on the intake. Put the filter back before Ilse returns."

**P4.3 `lose-the-mop` — Airlock A (5 pts: `airlock` 5)**
Airlock A to the hull access won't cycle: the inner door's sensor sees "obstruction" (Gumbo in Wim's pocket reads as organic debris). Solution: Use mymop on airlockA → prop the sensor with the mop handle, cycle, and the outer door takes the mop with it. Wim watches it go. ("Third Class issue. You'd named it.") Mop (robot) says something kind.
- Nudge: "The airlock thinks something is in the way. It's right. Fool the sensor with something you can bear to lose."
- Clue: "Your mop is the right length."
- Full: "Use your mop on Airlock A to hold the sensor. The lock cycles and the mop goes out with it."

**P4.4 `suit-up` — Get a suit that fits (10 pts: `suit` 2, `helmet-tape` 3, `o2` 2, `tether` 1, `suitcheck` 2)**
In the reactor anteroom: Take suit (L), helmet (cracked), o2, tether, dosimeter. Use toolkit on helmet (tape the crack). Use suit on self: too big; Use tether on suit → cinch the waist with the tether. Use suitcheck → passes with a warning ("SUIT: ADEQUATE. OCCUPANT: ENTHUSIASTIC."). Skipping suitcheck = death on the hull.
- Nudge: "There's one suit and it isn't your size. Make it your size."
- Clue: "Tape the helmet. Cinch the suit with the tether. Then let the terminal check your work."
- Full: "Take the suit, helmet, O2 bottle, tether and dosimeter. Use the toolkit on the helmet, use the tether on the suit, then use the suit-check terminal."

### Deaths
- **Reactor**: Use reactordoor / Open glass → "You open the reactor. The reactor opens you. The dosimeter goes from green to a colour that isn't on the chart."
- **Ilse**: Talk to Ilse / Use anything on navcore → "You explain to Ilse, politely, that she should stop. Ilse explains, with a torque wrench, that she won't."
- **Catwalk**: Walk off catwalk end → "The catwalk has a railing for twelve of its fourteen metres. You find the other two."
- **Oven cleaner on self**: as ch. 3.
- **Airlock**: Use airlockA with Gumbo still unsolved three times → "The airlock resolves the obstruction. You were the obstruction."

### Exit condition
Drive inhibited, mop gone, suit checked → Chapter 5 begins at Airlock A outer door.

---

## Chapter 5 — The Hull (30 pts)

**Premise.** Outside. The *Hyacinth*'s spine stretches away under the stars; the *Lien* is clamped amidships like a tick. The comms dish is forty metres aft, locked to Vellacourt's beacon. Wim has a tethered walk, half a bottle of O2, Mop on the radio from inside (Mop can see the hull cameras), and the polish canister's propellant. A Lane Authority relay is in range for the next few minutes.

### Rooms

**5a. Hull, forward** — `hull1`
Airlock A outer door, tether anchor points (a row of cleats), a handrail with a gap, a micro-meteorite shield plate (loose), the *Lien*'s docking collar in the distance, the hull camera, the stars.
Hotspots: `airlockout`, `cleats`, `handrail`, `gap`, `plate`, `collar`, `camera`, `stars`, `o2gauge` (on wrist), `me`.

**5b. Comms dish** — `hull2`
The dish on a gimbal, a manual crank (frozen), the gimbal lock pin, a junction box (Vellacourt padlock), a relay indicator panel, the aft airlock (Airlock C, leads to the bridge level).
Hotspots: `dish`, `crank`, `pin`, `junction`, `padlock`, `panel`, `airlockC`, `o2gauge`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `plate` | Shield plate | 7 | "A loose micro-meteorite plate. Square, light, and exactly the size of the gap in the handrail." |
| `canister` | Polish canister (propellant) | 15 | "Mop's canister, now empty of polish and full of pressurised propellant. In zero-g this is a very small, very stupid rocket." (the `polish` item converts to this after ch. 4) |

### Puzzles

**P5.1 `clip-on` — Don't die immediately (4 pts: `clip` 4)**
Use tether on cleats before moving. Walking without clipping = death on first step past the rail gap.
- Nudge: "You're outside. First rule."
- Clue: "Clip the tether to a cleat."
- Full: "Use the tether on the cleats by the airlock before walking anywhere."

**P5.2 `bridge-the-gap` — Cross the handrail gap (6 pts: `plate` 2, `gap` 4)**
The tether reaches the gap but not beyond; the handrail is missing a two-metre section. Take plate (loose shield plate); Use plate on gap → a bridge for the tether clip to slide along. Re-clip beyond (Use tether on handrail).
- Nudge: "Your tether runs out at the gap. Make the gap not a gap."
- Clue: "The loose shield plate is the right size."
- Full: "Take the shield plate, use it on the handrail gap, then clip the tether past it."

**P5.3 `aim-the-dish` — Point the dish at the relay (14 pts: `pin` 3, `padlock` 4, `crank` 4, `panel` 3)**
Crank is frozen and the gimbal is pinned. Pull pin (Take pin). Padlock on the junction box: Use toolkit (cutters) on padlock. Crank: frozen solid; Use canister on crank → the propellant blast thaws/frees it (and the recoil is the death if Wim isn't clipped — he is). Use crank → dish swings. Watch panel: when it reads LANE AUTH RELAY 7, stop (Use panel to lock). Mop on the radio calls out the bearing.
- Nudge: "The dish is held three ways: a pin, a lock and a frozen crank."
- Clue: "Pull the pin, cut the padlock, and the crank needs a blast of something to free it."
- Full: "Take the gimbal pin. Use the toolkit on the padlock. Use the polish canister on the crank to free it, then use the crank until the panel shows LANE AUTH RELAY 7, and use the panel to lock it."

**P5.4 `broadcast` — Say the words (6 pts: `broadcast` 6)**
Use junction (now open): Wim keys the mic. The game shows a short choice: identify as "contractor" (Lane Authority logs it as unverified) or "acting crew per Captain Okonjo's roster" (verified; Thistle's crew card number is on file because Thistle filed it). Only the second scores; the first still ends the chapter but ch. 8's arrival is later (margin tighter).
- Nudge: "Who you say you are matters to the people listening."
- Clue: "You have a crew card now. Use the words on it."
- Full: "Use the junction box and identify yourself as acting crew per Captain Okonjo's roster."

### Deaths
- **Unclipped**: Walk past the gap without tether → "You step over the gap. The gap steps over you. Mop watches on camera three and says, sincerely, that it was a beautiful arc."
- **O2**: Spend too long (Look at every hotspot twice before aiming the dish; soft counter of 20 actions) → "The O2 bottle was half full. Now it's half empty. Then it's a different kind of empty."
- **Canister**: Use canister on self / Use canister before clipping → "You test the canister. It tests you. You are now a satellite of the Luminous Hyacinth with an orbital period of about an hour."
- **Collar**: Walk toward the Lien's collar → "You get close enough to the Lien to read its name. Its crew get close enough to read yours."

### Exit condition
Broadcast sent → Use airlockC → Chapter 6.

---
## Chapter 6 — The Bridge (30 pts)

**Premise.** Airlock C opens into the bridge's ready room. Vane is on the bridge with Dorrit and Brack, re-filing the claim now that the Lane Authority has asked questions. She is not angry; she is interested. This chapter is a conversation with a small inventory puzzle around it. No deaths: Vane is a litigator, not a thug. Mop arrives mid-scene via the service lift and makes everything worse.

### Rooms

**6a. Ready room** — `ready`
Suit rack (hang the EVA suit), a coffee machine (works!), the captain's desk with a locked drawer, a framed contract (Wim's: "CUSTODIAL SERVICES — CONTRACTOR"), a wall safe (open, empty), the bridge door (open), Mop's service lift hatch.
Hotspots: `rack`, `coffee`, `desk`, `drawer`, `contract`, `safe`, `bridgedoor`, `lifthatch`, `me`.

**6b. Bridge** — `bridge`
Vane at the captain's chair (not sitting in it: standing beside it, which tells you something), Dorrit at comms reading regulations, Brack by the door eating, the main screen (Vellacourt yards ETA, Lane Authority hail blinking), the helm (locked), the ship's log, a holo of the salvage filing with Mop's smiling stamp.
Hotspots: `vane`, `dorrit`, `brack`, `screen`, `hail`, `helm`, `log`, `filing`, `pocket` (Vane's breast pocket; visible only after `flags.sawCode`), `mop` (after arrival), `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `coffee` | Coffee | 6 | "Real coffee. The bridge gets real coffee. You get a lot of information about rank from this cup." |
| `contract` | Your contract | 15 | "CUSTODIAL SERVICES AGREEMENT. Party of the second part: W. Tarragon, CONTRACTOR. Clause 9: 'Contractor is not a member of the crew for any purpose.' Clause 9 has been a problem all day." |
| `logslip` | Log printout | 15 | "Ship's log, 03:14, fourteen months ago: 'Pod 1,205 (custodial) left unassigned per captain's order. Note: Tarragon to remain awake and is hereby assigned duties of Deck Officer (Custodial) for the duration. — A.O.' Deck Officer. Officer." |

### Puzzles

**P6.1 `coffee-brack` — Get past the door (4 pts: `coffee` 2, `brack` 2)**
Brack blocks the bridge door, bored and hungry. Use coffee machine → `coffee`. Give coffee to Brack (or the tomato from ch. 3: Brack hasn't seen a vegetable in a year; either works, tomato sets `flags.brackLikesYou` which matters in ch. 7). He lets Wim through: "She wants to talk to you anyway."
- Nudge: "The big one on the door looks bored. Bored people take bribes they can eat or drink."
- Clue: "The ready room has a working coffee machine."
- Full: "Use the coffee machine and give the coffee (or the tomato) to Brack."

**P6.2 `the-argument` — Argue the claim with Vane (16 pts: `notice-show` 2, `roster-show` 3, `contract-loss` 2, `log` 6, `code-seen` 3)**
Talk to Vane: dialogue tree. Show notice → she agrees it's hers. Show roster → "A handwritten note is not a crew assignment." Show crewcard → "Issued by a gardening robot." Then she produces Wim's own contract from the desk drawer (Dorrit reads clause 9 aloud). Wim appears to lose. Solution: the ship's log. Use log (bridge console; it's read-only and not locked because nobody salvages a log) → Take logslip: Okonjo formally assigned Wim as Deck Officer (Custodial) fourteen months ago. Show logslip to Vane. She pauses, then concedes the point and raises the real one: "Then the vessel has an officer aboard, and the officer can't wake the captain, and in eleven hours we're in Vellacourt space where the log is a matter of opinion." She taps her breast pocket: the thaw code card. `flags.sawCode`. Pocket hotspot appears. Any attempt to take it: Brack, kindly, says no.
- Nudge: "Every piece of paper you have says 'not crew' in a different voice. There's one record on this ship nobody bothered to lock."
- Clue: "The ship's log on the bridge console. Fourteen months ago, the night they froze everyone."
- Full: "Talk to Vane and show her the notice, roster and crew card. When she produces your contract, use the ship's log, take the printout, and show it to her. She shows you where the thaw code is."

**P6.3 `mop-arrives` — Mop and the filing (6 pts: `mop-stamp` 3, `filing` 3)**
Mop arrives through the lift hatch and greets Vane as "the delivery lady". Look at filing (holo): the stamp. Talk to Mop about the stamp: Mop explains it signs for all deliveries, "it's in my protocol", and offers to stamp anything Wim likes. Use Mop on filing → Mop stamps a RECEIVED on Vane's refiled claim, which (Dorrit notes, horrified) makes the ship's representative a party acknowledging a conscious officer aboard. Vane, amused, lets it stand: "It won't matter in Vellacourt space." Sets `flags.filingVoid` (shortens ch. 8's authority scene).
- Nudge: "Mop signed the first piece of paper. Mop will sign anything."
- Clue: "Ask Mop about its stamp, then point it at Vane's new filing."
- Full: "Talk to Mop about the stamp, then use Mop on the salvage filing holo."

**P6.4 `vault-truth` — Why the seed vault (4 pts: `seed` 4)**
If `flags.vaultMatters`: ask Vane about the vault. She explains the colonists are worth a ransom; the seed stock is worth a planet. Sets `flags.knowsPrize`. Optional; adds a line to the ending.
- Nudge: "Thistle said Vane asked about the vault twice. Ask her why."
- Clue: "Talk to Vane about the seed vault."
- Full: "Talk to Vane and choose the seed vault topic."

### Deaths
None. Trying to fight Brack: he puts Wim down gently and says "Don't." (no death, no penalty). Using the helm: Dorrit reads a regulation; Wim loses two minutes of life, not a life.

### Exit condition
`logslip` shown, `flags.sawCode` → Vane has Wim escorted off the bridge by Brack, who, if `flags.brackLikesYou`, leaves the docking collar corridor unguarded "by accident". Chapter 7.

---

## Chapter 7 — The *Lien* (45 pts)

**Premise.** The thaw code is on Vane; Vane is on the *Lien* for the next hour filing from her own comms. Wim crosses the docking collar into the salvage ship with Mop and Gumbo. Four tasks, in a sensible order: get in, get the code, blow the clamps, get out. Mop's contribution is the one it was built for.

### Rooms

**7a. Docking collar** — `collar`
The pressure door to the *Lien*, a Vellacourt keypad, a crate stencilled VELLACOURT (the "delivery"), Brack's abandoned sandwich, a tool rack, and the hull window where Wim's mop drifts past once per minute.
Hotspots: `pressdoor`, `keypad`, `crate`, `sandwich`, `rack`, `window`, `mymop-out` (the drifting mop, Look only), `mop`, `me`.

**7b. Salvage hold** — `hold`
Shelves of other ships' property: nameplates, a child's bicycle, ship's bells, pods (empty), a manifest terminal, a cargo drone on a rail, a corridor to crew quarters, a corridor to the clamp room, the hold's main lights (switch).
Hotspots: `shelves`, `nameplates`, `bike`, `bells`, `emptypods`, `manifest`, `drone`, `qcorridor`, `ccorridor`, `lights`, `mop`, `me`.

**7c. Vane's quarters** — `quarters`
A neat cabin: a bunk, a desk with a lockbox, a uniform jacket on a hook (the breast pocket), a reading lamp, a cat (ship's cat, named Precedent), a bulkhead vent, the door.
Hotspots: `bunk`, `desk`, `lockbox`, `jacket`, `jpocket`, `lamp`, `cat`, `qvent`, `qdoor`, `me`.

**7d. Clamp room** — `clamps`
The docking clamp hydraulics, a release lever behind a two-key panel (two keys needed, one metre apart), a pressure gauge, a Vellacourt guard (Dorrit, reading), a loudspeaker, the corridor back to the hold (long, polished floor).
Hotspots: `hydraulics`, `panel`, `keyA`, `keyB`, `lever`, `pgauge`, `dorrit`, `speaker`, `corridor`, `mop`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `sandwich` | Brack's sandwich | 6 | "Brack's sandwich. He'll want it back. Precedent the cat wants it more." |
| `crateslip` | Delivery slip | 15 | "DELIVERY: 1 x boarding party. Signed for by: [smiling mop stamp]. Keypad code for return: 4471." |
| `codecard` | Thaw code card | 14 | "An eight-digit code on Vellacourt stock. Someone has written 'OKONJO' on the back in Vane's handwriting." |
| `keyA` | Clamp key A | 7 | "Half of a two-key release. Dorrit had it on a lanyard." |
| `keyB` | Clamp key B | 7 | "The other half. It was in Vane's lockbox, which is a compliment to Dorrit." |
| `gumbo3` | Gumbo (large) | 10 | "Gumbo is now the size of a cat and has opinions. It can hold a key." |

### Puzzles

**P7.1 `get-in` — Open the pressure door (6 pts: `crate` 2, `slip` 1, `keypad` 3)**
Search crate → `crateslip` with the return code 4471. Use keypad: enter 4471 (the parser accepts "use keypad" then a number prompt; wrong code twice = alarm, see deaths). Take sandwich while here.
- Nudge: "The delivery came in a crate. Deliveries come with paperwork."
- Clue: "Search the crate for the slip. The code's on it."
- Full: "Search the crate, take the delivery slip, and use the keypad with code 4471. Take Brack's sandwich too."

**P7.2 `the-code` — Lift the thaw code (14 pts: `cat` 3, `jacket` 4, `lockbox` 4, `keyB` 3)**
Vane's quarters are locked from the hold side by a simple latch; the vent from the hold (`qvent`) is Gumbo-sized. Use gumbo2 on vent → Gumbo squeezes through and opens the latch from inside (and eats a plastic lamp shade on the way: `gumbo2` → `gumbo3`). Inside: Precedent the cat sits on the jacket and will shred anyone who touches it. Give sandwich to cat → it relocates. Search jacket / Use jpocket → `codecard`. The lockbox: Use toolkit → `keyB` (and Vane's spare reading glasses, flavour). Leave through the door, not the vent (Gumbo is now too big).
- Nudge: "Her jacket is on the hook. Something is guarding it that isn't a person."
- Clue: "Gumbo fits through the vent. The cat wants Brack's sandwich more than it wants the jacket."
- Full: "Use Gumbo on the quarters vent to unlatch the door. Give the sandwich to the cat. Search the jacket pocket for the thaw code. Use the toolkit on the lockbox for clamp key B."

**P7.3 `skating-rink` — Deal with Dorrit (10 pts: `lights` 2, `mop-polish` 5, `keyA` 3)**
Dorrit guards the clamp room with key A on a lanyard and reads regulations to anyone who approaches. Talk → regulations (not deadly, 90 seconds of text, skippable). Solution: Use Mop on corridor (the long polished corridor back to the hold) → Mop applies "the good wax". Use lights (hold switch) → off. Use speaker → Wim calls "Dorrit, hold breach!" Dorrit runs, hits the wax, slides the length of the corridor into the hold's empty pods, and the lid closes. Take keyA (the lanyard snagged on the panel). Brack, arriving, looks at Dorrit in the pod, looks at Wim, and (if `flags.brackLikesYou`) shrugs and walks away; otherwise Brack must also be dealt with: Give tomato? (used). Fallback: Use Mop again on the second corridor; Brack slides too, less elegantly. Score is the same.
- Nudge: "Dorrit will not stop reading. Dorrit will, however, run if there's an emergency. Mop was built to make floors dangerous."
- Clue: "Have Mop polish the corridor, kill the lights, and announce a breach on the speaker."
- Full: "Use Mop on the hold corridor, use the hold lights to switch them off, then use the loudspeaker. Dorrit slides into an empty pod. Take key A."

**P7.4 `two-keys` — Blow the clamps (10 pts: `gumbo-key` 4, `turn` 4, `lever` 2)**
The two keys must turn simultaneously, a metre apart. Mop can't (no hands, "I have a tray"). Solution: Use gumbo3 on keyB (Gumbo holds and turns on command), Use keyA (Wim turns), then Use lever. Pressure gauge drops; the *Lien* shudders loose. Mop remarks the floor is very clean now.
- Nudge: "Two keys, one you. Count your hands, then count your friends' hands."
- Clue: "Gumbo is big enough to hold a key now."
- Full: "Use Gumbo on key B, use key A yourself, then pull the release lever."

**P7.5 `get-out` — Back across before the collar separates (5 pts: `run` 5)**
The collar is depressurising. Walk to collar → the pressure door is closing; Use codecard? No. Use Mop on pressdoor → Mop wedges itself in the door ("I am very sturdy. Go.") and Wim and Gumbo slide through on the wax. Mop makes it through on the final frame, dented. If the player dawdles (10 actions after lever), death.
- Nudge: "The door is closing and you have something sturdy with you."
- Clue: "Mop can hold a door."
- Full: "Go straight to the collar and use Mop on the pressure door to hold it while you get through."

### Deaths
- **Keypad**: Wrong code twice → "The keypad locks and lights the corridor red. Vane, on her comms, says 'Oh, good,' and sends Brack. Brack is apologetic throughout."
- **Cat**: Take jacket with cat on it → "Precedent the cat establishes precedent. There is a lot of you on the walls."
- **Drone**: Use drone / stand on rail → "The cargo drone files you under 'miscellaneous' and puts you on shelf 40."
- **Wax**: Walk the polished corridor yourself after Mop has done it (before Dorrit) → "You test your own trap. It works. The pod lid closes with a sound like applause."
- **Collar**: Dawdle after the clamps → "The collar separates with you halfway across it. Mop, from the Hyacinth side, says it will remember you as a nine."

### Exit condition
`codecard` in inventory, clamps blown, Wim through the collar → Chapter 8.

---

## Chapter 8 — Thaw (30 pts)

**Premise.** Four minutes on an on-screen clock to the Vellacourt jurisdiction line. The *Lien* is loose but Vane is on the *Hyacinth*'s bridge with Brack, and the thaw console is in the Cryo Bay six decks down. The clock pauses on message boxes and modals as in Port Lucky ch. 7.

### Rooms

**8a. Service lift** — `lift`
Mop's service lift (Mop-sized; Wim can ride it folded), deck buttons, an emergency stop, a hatch.
Hotspots: `buttons`, `estop`, `hatch`, `mop`, `me`.

**8b. Crew gallery (return)** — `gallery2`
As ch. 2 gallery, plus: Brack arriving on the stairs at 1:30 remaining, the thaw console, Okonjo's pod, the fire blanket hook (empty).
Hotspots: `thawconsole`, `okonjo`, `brack2` (from 1:30), `stairs`, `me`.

**8c. Bridge (return)** — `bridge2`
Vane, Lane Authority cutter on screen, Dorrit still in a pod (voice only, over intercom, reading regulations), Okonjo arriving, Mop.
Hotspots: `vane2`, `screen2`, `okonjo2`, `mop`, `me`.

### Puzzles

**P8.1 `ride-the-lift` — Get to the Cryo Bay fast (6 pts: `lift` 6)**
Stairs take too long (clock runs out at deck 5). Use Mop on lift → Mop rides; Use lift/hatch → Wim folds in on top. Press button for Cryo. Mop: "This is against my protocol. I've decided I don't mind."
- Nudge: "Six decks, four minutes, and stairs. Mop has a faster way down that was never meant for you."
- Clue: "The service lift. You fold."
- Full: "Use the service lift with Mop and press the Cryo Bay button."

**P8.2 `thaw` — Wake the captain (14 pts: `code` 6, `brack-stall` 4, `thaw` 4)**
Use codecard on thawconsole → thaw begins (90 seconds on the clock). Brack arrives at 1:30. Talk to Brack: if `flags.brackLikesYou` he sits on the stairs and waits ("She'll want to meet you properly."); if not, Give rations to Brack (he has been hungry all game) buys the time; if rations are gone, Use Gumbo on Brack → Gumbo hugs his boot; Brack, delighted, forgets his job. Any route scores `brack-stall`. Okonjo wakes at 0:04 on the clock: "Who are you?"
- Nudge: "You have the code and the console. You also have a very large man coming up the stairs who has been hungry since chapter one."
- Clue: "Use the code card on the thaw console, then keep Brack busy with food, friendship or Gumbo."
- Full: "Use the thaw code card on the thaw console. When Brack arrives, talk to him, give him the rations, or use Gumbo on him. The captain wakes with four seconds to spare."

**P8.3 `who-are-you` — Answer the captain (10 pts: `answer` 6, `seal` 4)**
Dialogue choice: "The contractor" / "Custodial Technician Third Class Wim Tarragon" / "Deck Officer (Custodial), ma'am, per your log." The third scores full (`answer` 6); the second 3; the first 1. Okonjo, still cold, asks what day it is, who's on her bridge, and whether anyone fed the cat (there is no cat; she's confused; this is Mop's favourite line). If `flags.knowsPrize`: Wim tells her about the seed vault; she seals it from the console on the way up (`seal` 4). On the bridge: Lane Authority cutter alongside; Vane surrenders the way she did everything, precisely, with a comment about the quality of the log-keeping. Dorrit, over the intercom, finishes subsection (f).
- Nudge: "She asked who you are. You've spent the whole game finding out."
- Clue: "The log called you something. Say it."
- Full: "Tell Captain Okonjo you're Deck Officer (Custodial) per her log. If you know about the seed vault, tell her so she can seal it."

### Deaths
- **Clock**: 0:00 before thaw completes → "The Hyacinth crosses into Vellacourt space with its captain three seconds from waking. In Vellacourt space the log is a matter of opinion. Vane's opinion is recorded first."
- **E-stop**: Use estop in the lift → "The emergency stop is very effective. You are now stopped, between decks, for the four minutes that mattered."
- **Brack (fight)**: Use toolkit/wrench on Brack → "Brack takes the wrench, bends it, hands it back, and sits on you until the clock runs out. He says sorry. He means it."

### Final screen
"Score: N of 250. Hints used: H. Margin at the line: S seconds." Ranks: 250 "Deck Officer", 200+ "Second Class", 150+ "Third Class", 100+ "Contractor", below "Delivery".

Epilogue card: Okonjo promotes Wim to Custodial Technician Second Class ("It comes with a better mop.") A new mop appears in his hands. Through the hull window, the old one drifts past one last time. Mop: "Nine."

---

## Complete item list (for `ITEMS`)

| id | name | color | first seen | leaves inventory |
| --- | --- | --- | --- | --- |
| mymop | Mop | 7 | ch1 | ch4 (airlock) |
| badge | Contractor badge | 14 | ch1 | kept |
| coin | Lucky coin | 14 | ch1 | ch1 (vending) |
| snakpak → wrapper | SnakPak / wrapper | 13 | ch1 | bar ch1 (shelf); wrapper fed to Gumbo ch3 (optional, +0, flavour) |
| wrench | Adjustable wrench | 7 | ch1 | kept |
| granules | Absorbent granules | 14 | ch1 | optional: use on wax corridor to cancel it (ch7 flavour) |
| notice | Salvage declaration | 15 | ch2 | kept (shown ch6) |
| roster | Crew roster | 15 | ch2 | ch3 (to Thistle; Thistle returns a copy) |
| hose | Coolant hose | 11 | ch2 | ch2 |
| drawing | Gumbo drawing | 13 | ch2 | kept |
| tray | Plastic tray | 13 | ch3 | ch3 (Gumbo) |
| ties | Plant ties | 10 | ch3 | ch3 (Gumbo) |
| tomato | Tomato | 12 | ch3 | ch6 (Brack) |
| gumbo1/2/3 | Gumbo | 10 | ch3 | companion item; size changes ch3, ch7 |
| toolkit | Toolkit | 7 | ch3 | kept |
| rations | Ration packs | 14 | ch3 | ch8 (Brack) or kept |
| oven | Oven cleaner | 14 | ch3 | ch4 |
| crewcard | Temporary crew card | 14 | ch3 | kept |
| polish → canister | Floor polish / canister | 15 | ch4 (from Mop) | polish ch4; canister ch5 |
| filter | Coolant filter | 7 | ch4 | ch4 |
| suit, helmet, tether, o2, dosimeter | EVA kit | 15/15/7/11/10 | ch4 | suit racked ch6; tether kept |
| plate | Shield plate | 7 | ch5 | ch5 |
| coffee | Coffee | 6 | ch6 | ch6 |
| contract | Your contract | 15 | ch6 (Vane produces it) | kept |
| logslip | Log printout | 15 | ch6 | kept (shown ch8) |
| sandwich | Brack's sandwich | 6 | ch7 | ch7 (cat) |
| crateslip | Delivery slip | 15 | ch7 | kept |
| codecard | Thaw code card | 14 | ch7 | ch8 |
| keyA, keyB | Clamp keys | 7 | ch7 | ch7 |

## Puzzle ids for `GAMES['mop-galaxy'].puzzles`
ch1 `[wake-up, vent-peek, snack-tool, up-and-out]`; ch2 `[read-the-room, hide, roster, duct-two]`; ch3 `[feed-gumbo, thistle-crew, locker, dog-the-door, vault-tease]`; ch4 `[distract-ilse, foul-the-loop, lose-the-mop, suit-up]`; ch5 `[clip-on, bridge-the-gap, aim-the-dish, broadcast]`; ch6 `[coffee-brack, the-argument, mop-arrives, vault-truth]`; ch7 `[get-in, the-code, skating-rink, two-keys, get-out]`; ch8 `[ride-the-lift, thaw, who-are-you]`.
Each entry's three strings are the Nudge / Clue / Full lines above, verbatim.

## Implementation notes
- Add `'mop-galaxy'` and `'mop-galaxy-walkthrough'` to `CATALOG` (suggested $7.99 / $1.99 as Port Lucky) and a `GAMES['mop-galaxy']` entry with `walkthroughSku` and the puzzles above. The home page card changes from "Notify me" to "Play" when `catalog['mop-galaxy']` exists.
- Flags that cross chapters: `sawBoarders`, `knowsLoophole`, `needsCode`, `vaultMatters`, `brackLikesYou`, `sawCode`, `filingVoid`, `knowsPrize`. Gumbo size lives in the inventory item id.
- Mop is a drawn companion, not an inventory item; `Use Mop on X` routes through the `use` verb with `it === 'mop'` as a pseudo-item (add it to the inventory strip as a fixed first chip labelled "Mop" when Mop is in the room).
- Soft timers (Ilse's return, the O2 counter, the collar) count player actions, not seconds; only ch. 8 uses the real on-screen clock, reusing the Port Lucky ch. 7 clock code.
- Art: 19 rooms as listed; to cut scope merge `reactor` into `drive` (locker in the hall), `hull1`/`hull2` into one scrolling hull, and `lift` into a cutscene: 15 backgrounds.
- Point check: 20 + 25 + 35 + 35 + 30 + 30 + 45 + 30 = 250. Within chapters: ch1 3+3+6+8; ch2 5+8+6+6; ch3 7+10+8+6+4; ch4 6+14+5+10; ch5 4+6+14+6; ch6 4+16+6+4; ch7 6+14+10+10+5; ch8 6+14+10.
