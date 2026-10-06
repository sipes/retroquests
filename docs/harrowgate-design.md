# The Harrowgate Will — puzzle & item map, chapters 1–8

Design spec for implementation on the shared engine. Companion to `docs/harrowgate-story.md`. Conventions as for the other games: rooms have `title`, `walk` box, `describe`, `spots`; items have `name`, `color` (EGA index), `words`, `look`; points are awarded once per `scored` key; hints are `[nudge, clue, full solution]` per puzzle id, served from `src/games/harrowgate-hints.js` only to walkthrough owners. Game id `harrowgate`. Chapter 1 is the free scene; the paywall triggers at the end of it.

## Scoring budget (250 total)

| Chapter | Points | Running total |
| --- | --- | --- |
| 1 The Causeway (free) | 20 | 20 |
| 2 The Fish Course | 30 | 50 |
| 3 The Library | 35 | 85 |
| 4 Upstairs | 30 | 115 |
| 5 The Conservatory | 35 | 150 |
| 6 The Servants' Hall | 30 | 180 |
| 7 The Study | 40 | 220 |
| 8 The Drawing Room | 30 | 250 |

Verbs as the other games: Walk, Look, Take, Use, Talk (plus parser-only Give/Eat/Drink/Open/Search/Climb/Hit/Read/Sit/Listen).

## Running jokes and rules
- **The notebook.** `notebook` is Edie's inventory item and the game's evidence system. Every important line a character says is "taken down" automatically (a flag per line: `nb.<id>`). "Read notebook" lists what has been taken down, grouped by person. Chapter 8's accusation is built from notebook entries plus physical evidence; the hint system never tells the player which entries matter.
- **Nobody looks at the stenographer.** In any room with guests, Edie can Listen (a parser verb, also a verb button in this game replacing Talk's position when guests are present) to take down what they say to each other when they think she is furniture. Listening is how most `nb.*` flags are set; talking to a guest directly gets their public story.
- **Tilly.** The housemaid joins as a companion item (`tilly`) from chapter 4. Use Tilly on a door she has a key for; Talk gives the staff's version of any room; she will not go into the study.
- **The two deaths.** Sir Lionel's first death (chapter 2) is staged; the library "corpse" is alive until midnight (chapter 4). Mr Sallow's death (chapter 4) is a blow to the head; he is alive in the coal cellar (chapter 6). The player can discover both early with the right actions (`flags.lionelWarm`, `flags.sallowBreathing`), which changes dialogue and shortens chapter 8's accusation but not the score.
- **Three accusations.** Chapter 8 lets Edie accuse Dr Pell, Colonel Fane or Honoria Quist. Each has a complete, Clue-style "this is how it happened" sequence. Pell and Fane are wrong: their sequences end with the real murderer leaving on the boat and a comic coda, and score 2. Honoria is right and scores the full 10. The clock gives the player time for two wrong accusations and one right one, if they are quick.
- **Timers.** Action-counted soft timers in chapter 1 (the tide), 4 (the candle) and 5 (Wilf's bottle). The only real clock is chapter 8: 10 game-minutes at 2.5 game-seconds per real second (4 real minutes), pausing on messages, choices, hints, modals and backgrounding.

---

## Chapter 1 — The Causeway (free scene) — 20 pts

**Premise.** 6:50 p.m., the tide an hour out. Edie arrives by the mainland bus with a suitcase, a typewriter case and a letter from the agency. The causeway is a mile of wet stone with the sea on both sides and a warning board. At the house, Garrick says nobody told him about a stenographer. Her instructions are in an envelope in the hall: "Take down everything. Speak to no one. — L.H." The guests are arriving. The tide covers the road at eight.

### Rooms

**1a. The causeway** — `causeway`
The mainland end (bus stop, warning board with tide times, a lifebelt), the causeway stones, a marker post with a bell, the sea, a stranded car (Colonel Fane's, abandoned halfway with the tide coming), the island end and the gate.
Hotspots: `busstop`, `tideboard`, `lifebelt`, `stones`, `post`, `bell`, `sea`, `car`, `carboot`, `gate`, `me`.

**1b. The hall** — `hall`
Garrick at the door, the visitors' book, an envelope on the salver, a barometer (falling), the telephone (works, for now), a stand of umbrellas and walking sticks, the stairs, the dining room doors (closed), a green baize door to the servants' side, the drawing room doors, Edie's suitcase and typewriter case.
Hotspots: `garrick`, `visitorsbook`, `salver`, `envelope`, `barometer`, `telephone`, `umbrellas`, `sticks`, `stairs`, `diningdoors`, `baizedoor`, `drawingdoors`, `suitcase`, `typecase`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `notebook` | Notebook | 15 | "A Pitman shorthand notebook, three pages used. By morning it will be the most dangerous object on the island." |
| `pencil` | Pencil | 14 | "An HB. You carry four. You have never needed four. Tonight you might." |
| `agencyletter` | Agency letter | 15 | "'Miss E. Marsh to attend Harrowgate House, Sat. 27th, 7 p.m., for a private reading. Fee paid in advance by Sir L. Harrowgate. Discretion is expected.' Underlined." |
| `instructions` | Sir Lionel's note | 15 | "'Miss Marsh: take down everything said at dinner and after. Speak to no one about it. Sit where you can see the table. — L.H.' The hand is firm. The paper is expensive. The 'everything' is underlined twice." |
| `tidetable` | Tide table | 15 | "Harrowgate causeway: covered 8:05 p.m. to 6:35 a.m. Police launch from Wells: 6:40 a.m. on request. The request is made by telephone." |
| `cartridge` | Revolver cartridge | 7 | "A .455 cartridge from the boot of the Colonel's abandoned car. He brought his service revolver to a dinner party. You take one note of it and one cartridge." |

### Puzzles

**P1.1 `the-tide` — Cross before eight (5 pts: `tideboard` 2, `bell` 1, `cross` 2)**
Look at tideboard → Take tidetable (a printed card in a box). Use bell at the marker post → the island hears a visitor is coming (Garrick is at the gate when Edie arrives; without it, chapter 1's hall has a locked door and a wait). Walk the stones: the tide timer runs (fourteen actions on the causeway).
- Nudge: "The sea has a timetable. Read it before you walk on its road."
- Clue: "The board at the bus stop has the tide table. Ring the post bell so the house knows you're coming."
- Full: "Take the tide table from the board, ring the marker-post bell, and walk the causeway to the gate."

**P1.2 `the-car` — The Colonel's car (4 pts: `car` 1, `carboot` 3)**
Halfway across, a car abandoned with the tide reaching its wheels: Colonel Fane's, by the regimental sticker. Search carboot → `cartridge`, and `nb.fanegun` ("The Colonel brought a revolver"). The car is lost to the sea by chapter 2 (flavour; Fane complains about it all night).
- Nudge: "Someone left a car on the causeway. Someone was in a hurry."
- Clue: "Search the boot."
- Full: "Look at the stranded car and search its boot for the cartridge."

**P1.3 `the-stenographer` — Be let in (6 pts: `garrick` 2, `letter` 2, `envelope` 2)**
Talk to Garrick: no stenographer was expected. Give agencyletter to Garrick → he reads it, says "Sir Lionel's arrangements," and lets her in with a face that Edie takes down (`nb.garrickface`). Take envelope from the salver → `instructions`.
- Nudge: "The butler doesn't know you. You have a letter that does."
- Clue: "Show Garrick the agency letter. Then the envelope on the salver is yours."
- Full: "Talk to Garrick, give him the agency letter, and take the envelope from the salver."

**P1.4 `first-words` — The hall before dinner (5 pts: `listen1` 3, `book` 2)**
Guests pass through the hall. Listen → Edie takes down: Mrs Lacombe asking Garrick "Is the girl here?" (`nb.lacombegirl`), the Reverend saying "I can't, Lionel, not again" to a closed door (`nb.molecant`). Look at visitorsbook → six names and, in Sir Lionel's hand, "and Miss Quist, as usual" (`nb.quistusual`). The dinner gong.
- Nudge: "Nobody looks at the stenographer. Use that."
- Clue: "Stand in the hall and listen. Read the visitors' book."
- Full: "Use Listen in the hall as the guests pass, and look at the visitors' book."

### Deaths
- **Tide**: fourteen actions on the causeway → "The sea covers the road at 8:05, as advertised. You are on the road at 8:06. The lifebelt at the bus stop is very well maintained."
- **Car**: Use car / sit in the car → "You sit in the Colonel's car to get out of the wind. The tide takes the car, the wind, and you, in that order."
- **Sticks**: Take a sword-stick from the hall stand twice → "One of the walking sticks is a sword. You find out which by the handle, then by the blade."
- **Telephone**: Use telephone repeatedly during the storm (ch. 1 only if lightning: three uses) → "You telephone the agency to complain. Lightning telephones you back."

### Exit condition
`notebook`, `instructions`, `tidetable`, `cartridge`, `nb.*` three entries; the dinner gong → Use diningdoors → end of free scene. Paywall. If owned, continue to Chapter 2.

---

## Chapter 2 — The Fish Course (30 pts)

**Premise.** Dinner. Seven at the table: Sir Lionel at the head, Pell, Lacombe, Fane, Mole, Sallow, Quist. Edie at a side table with the notebook. Soup, then Sir Lionel announces that a new will has been drawn and will be read in the library at ten "to those who stay", looks round the table, and tells each of them, in a sentence, why they will stay. The turbot comes. Sir Lionel eats, chokes, and dies. Dr Pell says heart. Edie writes down what she saw.

### Rooms

**2a. The dining room** — `dining`
The table (seven places), Sir Lionel's chair (then Sir Lionel, then the cloth over him), the sideboard (decanters, the fish on its dish), Edie's side table, the serving hatch to the kitchens, a portrait of the first Harrowgate, the windows (storm), the door to the hall, the door to the library.
Hotspots: `lionel`, `pell`, `lacombe`, `fane`, `mole`, `sallow`, `quist`, `sideboard`, `decanters`, `fishdish`, `sidetable`, `hatch`, `portrait`, `windows`, `halldoor`, `librarydoor`, `garrick2`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `menu` | Menu card | 15 | "Consommé. Turbot, sauce hollandaise. Saddle of mutton. Savoury. In Mrs Oakes's hand, and under 'Turbot', in another hand, 'Sir L. — no sauce'." |
| `glass` | Sir Lionel's glass | 11 | "His wine glass. A smear on the rim that is not wine. Dr Pell reached for it first and you took it from the tray before Garrick cleared." |
| `napkin` | Sir Lionel's napkin | 15 | "He dropped it as he fell. Inside the fold: a small brown bottle, empty, the sort a chemist sells. You did not see him drink from it. You saw him put it there." |

### Puzzles

**P2.1 `the-table` — Who sits where (5 pts: `seating` 3, `menu` 2)**
Look at each guest from the side table (one `nb.seat.*` each; the seating plan matters in chapter 8: who could reach the glass). Take menu from the side table.
- Nudge: "Before anything happens, know where everyone is."
- Clue: "Look at each guest from your table. Take the menu card."
- Full: "Look at all seven places and take the menu."

**P2.2 `the-toast` — The announcement (9 pts: `listen2` 4, `listen3` 3, `quist-look` 2)**
Listen during the soup → six sentences, one per guest, each a blackmail in a dinner-party voice (`nb.motive.pell/lacombe/fane/mole/sallow`, and for Quist: "And Honoria will stay because Honoria always stays," which is not a threat, and Edie writes that it is not). Listen again during the fish → Sallow: "Lionel, the old will is still in my office," and Lionel: "Then it had better stay there" (`nb.oldwill`). Look at Quist when Lionel speaks → she is not looking at him; she is looking at Mrs Lacombe (`nb.quistlook`).
- Nudge: "He's telling each of them why they'll stay. Take down every word."
- Clue: "Listen through the soup and the fish. Watch the secretary, not the host."
- Full: "Use Listen twice during dinner and look at Miss Quist while Sir Lionel speaks."

**P2.3 `the-death` — Take down what you saw (11 pts: `fall` 2, `pell-first` 3, `glass` 3, `napkin` 3)**
Sir Lionel chokes, grips the cloth, falls. Edie: Look at lionel → `nb.fall` (he fell left, away from the glass). Look at Pell → he was at the body before anyone else moved and his hand went to the wrist, then the glass (`nb.pellfirst`). Take glass from the tray before Garrick clears (two actions' window). Take napkin from the floor (nobody else looks down) → the brown bottle.
- Nudge: "Everyone is looking at the dead man. Look at everyone else."
- Clue: "The doctor reached for two things. Get the glass before the butler clears. Pick up what fell."
- Full: "Look at Sir Lionel, look at Dr Pell, take the glass from the tray and take the napkin from the floor."

**P2.4 `heart` — The doctor's verdict (5 pts: `pell-talk` 2, `listen4` 3)**
Talk to Pell: "Heart. I've warned him for years." Listen as the guests leave the table → Fane: "Convenient" (`nb.faneconvenient`); Mole praying, with Lionel's name wrong; Lacombe to Quist: "Not now, darling" (`nb.lacombedarling`, the first hint of who Quist is). Garrick and Pell carry the body to the library.
- Nudge: "The doctor says heart. Write down that he said it, and what everyone said after."
- Clue: "Talk to Pell, then listen as they leave."
- Full: "Talk to Dr Pell and use Listen as the guests leave the dining room."

### Deaths
- **Fish**: Eat from the fish dish → "You try the turbot, for the record. The record shows that the sauce was for Sir Lionel and that whatever was in the sauce was not for you either."
- **Decanters**: Drink from the decanters twice → "The port has been open since the old King died. So, after a glass, are you."
- **Hatch**: Climb through the serving hatch → "The hatch is for plates. Mrs Oakes's cleaver is for things that come through the hatch that are not plates."
- **Windows**: Open the windows in the storm → "You open the window to clear the room. The storm, which has been waiting, clears you."

### Exit condition
`menu`, `glass`, `napkin`, the chapter's `nb.*` entries; the body carried to the library and the guests to the drawing room → Chapter 3.

---

## Chapter 3 — The Library (35 pts)

**Premise.** Ten o'clock. The body on the library sofa under a sheet; the will in the desk, which Sallow was to read and now says he cannot "until the authorities"; the guests in the drawing room drinking; Edie told by Garrick to go to her room. Edie does not go to her room. The library has two doors and a window seat, and between ten and eleven, four people come into it separately, one of them to take the will, and the corpse is warm.

### Rooms

**3a. The library** — `library`
The sofa and the sheeted body, the desk (drawer, the will in a blue envelope, then not), bookshelves (one with a lever), the window seat (curtains; Edie's hiding place), the fireplace, a decanter, a globe, the drawing room door, the hall door, a clock.
Hotspots: `sofa`, `body`, `sheet`, `desk`, `drawer`, `bluewill`, `shelves`, `lever`, `windowseat`, `curtains`, `fireplace`, `ldecanter`, `globe`, `drawdoor`, `lhalldoor`, `clock`, `me`.

**3b. The drawing room** — `drawing`
The guests: Fane at the fire, Lacombe at the piano (not playing), Mole with a glass, Pell with two, Sallow with his case, Quist pouring, Garrick with a tray. A card table, a gramophone, the French windows (locked), the hall door, the library door.
Hotspots: `fane2`, `lacombe2`, `mole2`, `pell2`, `sallow2`, `quist2`, `garrick3`, `cardtable`, `gramophone`, `french`, `dhalldoor`, `dlibdoor`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `bluewill` | The new will (envelope) | 1 | "A blue envelope, sealed, 'LAST WILL AND TESTAMENT OF L. HARROWGATE, 27 Oct 1928, B. Sallow, sol.' You hold it for about forty seconds before you put it back, because a stenographer does not steal wills. Someone else does." |
| `cigarend` | Cigar end | 6 | "A cigar end from the library grate, Sir Lionel's brand, lit after he was dead. Dead men don't smoke. Men pretending to be dead do, when they think the room is empty." |
| `hairpin` | Hairpin | 8 | "A hairpin from the library carpet by the desk. Mrs Lacombe wears her hair up. So does Miss Quist. The pin is cheap." |

### Puzzles

**P3.1 `the-warm-corpse` — Something is wrong with the body (8 pts: `sheet` 3, `warm` 5)**
Use sheet → Edie looks. Use hand on body / Take pulse (Use body) → warm, and the chest moves. `flags.lionelWarm`, `nb.warm`. Sir Lionel does not open his eyes. Edie, who was told to take down everything, takes down that too.
- Nudge: "You're a stenographer, not a nurse. Check anyway."
- Clue: "Lift the sheet. Touch the wrist."
- Full: "Use the sheet, then use the body to take a pulse."

**P3.2 `the-will-in-the-desk` — See it before it goes (7 pts: `drawer` 2, `will-look` 3, `lever` 2)**
Search desk → the drawer, locked; Use hairpin? Not yet: Use pencil on drawer → the lock is a letter lock and the pencil's tip reads the wards (Edie's party trick). Take bluewill, Look, put it back (the game puts it back automatically: "A stenographer does not steal wills"). `nb.willseen` (the date and Sallow's name). Look at shelves → the lever; Use lever → a shelf swings an inch and stops (the passage; opens properly in chapter 5).
- Nudge: "The will is in this room. Know what it looks like before someone makes it not be."
- Clue: "The desk drawer. Your pencil can open a letter lock. Look at the shelves while you're here."
- Full: "Use the pencil on the desk drawer, take and look at the blue envelope (it goes back on its own), then use the lever on the shelves."

**P3.3 `the-window-seat` — Watch the room (14 pts: `hide` 2, `visitor1` 3, `visitor2` 3, `visitor3` 3, `cigar` 3)**
Use windowseat → Edie behind the curtains. Four visits over the hour (each triggered by Listen from the seat; the clock advances a quarter-hour per Listen): (1) Fane, who looks at the body, says "Good," and takes a book from the shelf (`nb.fanegood`); (2) Mole, who prays and puts something in the body's hand, a key (`nb.molekey`); (3) Lacombe, who stands at the desk a long time and leaves with nothing in her hands and a hairpin on the carpet (`nb.lacombedesk`); (4) the room empty, the corpse sitting up, lighting a cigar, listening at the drawing room door, lying down again (`nb.cigar`, Take cigarend after). After visit 4, Search desk → the will is gone (`flags.willGone`); nobody Edie saw took it.
- Nudge: "The library has a window seat and a curtain. Nobody looks at the stenographer, and nobody looks behind a curtain."
- Clue: "Hide in the window seat and listen, four times. Then check the desk."
- Full: "Use the window seat, use Listen four times, take the cigar end from the grate, and search the desk."

**P3.4 `the-drawing-room` — Who left and when (6 pts: `listen5` 3, `hairpin` 3)**
Back in the drawing room: Take hairpin from the library carpet on the way. Listen → Quist to Garrick: "Did he eat the sauce?" and Garrick: "Miss." (`nb.quistsauce`); Pell to nobody: "Two hours, he said. It has been two hours" (`nb.pelltwohours`). Garrick announces rooms have been prepared and the house will retire; the telephone is dead.
- Nudge: "The will walked out of a room you were watching. Listen to who's worried about it."
- Clue: "Take the hairpin from the carpet. Listen in the drawing room."
- Full: "Take the hairpin, go to the drawing room and use Listen."

### Deaths
- **Decanter**: Drink from the library decanter → "The library decanter is Sir Lionel's own. Tonight, so is what's in it. You go the way he pretended to, without the pretending."
- **Fireplace**: Use fireplace / climb → "The library chimney was swept in 1911. The sweep did not come down. Neither do you."
- **Globe**: Use globe three times → "The globe opens. Sir Lionel kept his cigars in it and a small snake, which he thought was funny."
- **Curtains**: Make noise behind the curtain (Use gramophone from the seat, impossible, or Talk from the seat) → "You speak from behind the curtain. The Colonel, who has been waiting all evening for a reason, fires through it."

### Exit condition
`flags.lionelWarm`, `flags.willGone`, `cigarend`, `hairpin`, the chapter's `nb.*`; the house retires → Chapter 4.

---

## Chapter 4 — Upstairs (30 pts)

**Premise.** Half past eleven. Six guest rooms off the gallery, Edie's attic room, the back stairs. Tilly, turning down beds, is the only person who goes into every room, and she is frightened enough to want a friend. The will is in one of these rooms or nowhere. At midnight the lamps are out and a candle lasts twelve actions. At a quarter past, a scream: Sallow on the gallery stairs, not moving. And in the library below, when Edie gets there, Sir Lionel is dead with a cushion on his face.

### Rooms

**4a. The gallery** — `gallery`
Six doors (Pell, Lacombe, Fane, Mole, Sallow, Quist), the gallery rail over the hall, a long-case clock, a linen press, the back stairs door, the attic stair, Tilly with an armful of hot-water bottles, a window at the end (the storm).
Hotspots: `doorpell`, `doorlacombe`, `doorfane`, `doormole`, `doorsallow`, `doorquist`, `rail`, `longclock`, `linenpress`, `backstairs`, `atticstair`, `tilly`, `galwindow`, `me`.

**4b. A guest room** — `guestroom` (one room art, six variants by flag)
Bed, washstand, wardrobe, a case, a writing table, a window. Contents by occupant (see P4.2).
Hotspots: `bed`, `washstand`, `wardrobe`, `case`, `writingtable`, `grwindow`, `me`.

**4c. The library, midnight** — `library2`
As the library, dark, the body with a cushion on the face, the window seat, the lever shelf now open a foot, a dropped candle, a wet footprint.
Hotspots: `body2`, `cushion`, `openshelf`, `droppedcandle`, `footprint`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `candle` | Candle | 15 | "A bedroom candle. Lasts a dozen careful minutes. Tilly says the house has a thousand of them and never where you are." |
| `tilly` | Tilly | 12 | "Tilly, sixteen, housemaid, has a key to every room on this floor and a terror of every person in them. She has decided you are not a person in that sense." |
| `ious` | The Colonel's IOUs | 15 | "A bundle of IOUs to Sir Lionel in Colonel Fane's hand: the regimental mess fund, 1919. From the Colonel's case. He has not burned them, which means he still hoped to buy them back." |
| `roofletter` | The roof fund letter | 15 | "From the Reverend Mole's writing table: a letter to the Bishop confessing that the roof fund paid for a girl's operation in Norwich. Unsent. He has written it eleven times." |
| `bombay` | Dr Pell's licence | 15 | "A medical registration, Bombay, 1912, in the name of A. Pelham. Pell is Pelham. Sir Lionel knew." |
| `playbill` | Playbill | 13 | "'THE SECOND MRS TANQUERAY — Miss Vivienne Lacombe', 1907, from her case. On the back, a baby's date of birth and the single word 'Honoria'." |
| `cushion` | Cushion | 4 | "The library sofa's cushion. Pressed. On the underside, a smear of face powder and one long grey hair that is Sir Lionel's and one short dark one that is not." |

### Puzzles

**P4.1 `tilly` — A friend on the stairs (6 pts: `tilly-talk` 2, `bottles` 2, `tilly-join` 2)**
Talk to Tilly: terrified; she saw "the dead gentleman's door open at eleven" and will say no more. Take hot-water bottles from her (Use Tilly) → Edie carries three, Tilly talks (`nb.tillydoor`). Give pencil to Tilly (she has never owned one) → she joins (`tilly`), with the keys.
- Nudge: "The maid goes everywhere and nobody talks to her. Try it."
- Clue: "Carry her bottles. Give her something of yours."
- Full: "Talk to Tilly, use Tilly to take the hot-water bottles, and give her a pencil."

**P4.2 `six-rooms` — The search (14 pts: `fane-room` 3, `mole-room` 3, `pell-room` 3, `lacombe-room` 3, `quist-room` 2)**
Use Tilly on each door while its occupant is downstairs (Garrick is serving a last drink; the order the player chooses does not matter; the candle timer runs). Fane: `ious` in the case. Mole: `roofletter` on the table. Pell: `bombay` in the washstand drawer. Lacombe: `playbill` in the case (`nb.honoria`). Quist's room: nothing; a bed not slept in all week, a photograph of a woman who is Lacombe at thirty, and the will is not here either (`nb.quistroom`). Sallow's door: locked from inside, no answer.
- Nudge: "Six rooms, one maid with the keys, and everyone downstairs for ten more minutes."
- Clue: "Use Tilly on each door. Search the case, the table and the washstand."
- Full: "Use Tilly on the five open doors and search each room: the Colonel's case, the Reverend's table, the Doctor's washstand, Mrs Lacombe's case, Miss Quist's photograph."

**P4.3 `the-scream` — Sallow on the stairs (5 pts: `sallow-look` 3, `breathing` 2)**
A scream (Tilly's). Sallow at the foot of the gallery stairs, a wound on the head, his case open and empty. Look → `nb.sallowfall`; Use body (pulse) → breathing (`flags.sallowBreathing`; Pell, arriving, says "Dead," and Edie writes "Dr Pell said dead" and, under it, "no"). Garrick and Fane carry him to the coal cellar "for the cold", at Pell's suggestion.
- Nudge: "Another body. Check it the way you checked the last one."
- Clue: "Take his pulse before the doctor pronounces."
- Full: "Look at Mr Sallow and use his body to take a pulse."

**P4.4 `the-real-death` — The library at midnight (5 pts: `cushion` 3, `footprint` 2)**
Library: the corpse with a cushion on its face, cold now and getting colder. Take cushion → the hairs. Look at footprint → wet, small, from the open shelf toward the sofa (`nb.footprint`). The open shelf is a passage; it is dark; the candle is nearly out. Tilly: "Not tonight, miss."
- Nudge: "The man who was warm isn't. Look at what killed him and how they got in."
- Clue: "The cushion. The wet footprint from the bookshelf."
- Full: "Take the cushion from the body and look at the footprint by the open shelf."

### Deaths
- **Candle**: twelve actions after midnight without a fresh candle → "The candle goes out on the gallery. The gallery has a rail for thirty of its thirty-two feet. You find the other two in the dark, and then the hall floor."
- **Rail**: Climb rail / lean → "You lean over the gallery rail to see who is in the hall. The rail, Georgian, has been meaning to mention something."
- **Sallow's door**: Force doorsallow before the scream → "You put your shoulder to the solicitor's door. The solicitor, inside, has a paperweight and a nervous disposition."
- **Fane's revolver**: Take the revolver from Fane's case → "You take the Colonel's revolver for safety. The Colonel comes up for his revolver, for safety. The two safeties cancel out."

### Exit condition
`tilly`, four documents, `cushion`, `flags.sallowBreathing`, the chapter's `nb.*`; the passage → Chapter 5.

---

## Chapter 5 — The Conservatory (35 pts)

**Premise.** One a.m. The bookshelf passage drops to a brick corridor that runs under the house to the conservatory, the cellars and the boathouse. In the conservatory, under glass, in the warm, Gladstone the tortoise is sitting on a blue envelope. In the cellars, the wine, the coal cellar door (bolted; Sallow behind it, not yet), and a second passage up. In the boathouse, Wilf, paid to be drunk with a bottle that a soft timer empties. The will names an heir who is not in the house: a child born in 1908, "to be identified by Mr Sallow from the register in his keeping."

### Rooms

**5a. The passage and conservatory** — `conservatory`
The brick passage (puddles; the wet footprint's source), the conservatory door, palms, a heating pipe, a vine, Gladstone on his slab, a potting bench, a watering can, the garden door (storm), the cellar stair.
Hotspots: `passage`, `puddle`, `consdoor`, `palms`, `pipe`, `vine`, `gladstone`, `slab`, `bench`, `wateringcan`, `gardendoor`, `cellarstair`, `me`.

**5b. The cellars** — `cellars`
Wine racks, a bin of claret with one bottle missing, the coal cellar door (bolted outside), a cold store, a second stair up (to the servants' hall), the passage to the boathouse (a grille), a lamp.
Hotspots: `racks`, `claretbin`, `coaldoor`, `bolt`, `coldstore`, `servantsstair`, `grille`, `lamp`, `me`.

**5c. The boathouse** — `boathouse`
Wilf asleep against the launch, a bottle, the launch (fuel, no spark plug), the oars, a tide gauge, the island's only lamp signal (a lantern and a shutter), the sea door.
Hotspots: `wilf`, `bottle`, `launch`, `plug`, `oars`, `tidegauge`, `signal`, `shutter`, `seadoor`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `thewill` | The new will | 1 | "Opened. 'To my natural child, born Norwich, March 1908, to be identified by Mr B. Sallow from the register in his keeping, the whole of my estate. To Miss H. Quist, my secretary, my thanks.' His thanks. Six years. His thanks." |
| `lettuce` | Lettuce | 10 | "From the potting bench. Gladstone has not moved for a will. He will move for this." |
| `claret` | Claret, 1911 | 4 | "The missing bottle from the bin, found in the boathouse. Someone brought Wilf his drink from the house cellar, which means someone with the cellar key." |
| `plug` | Spark plug | 7 | "The launch's spark plug, taken out and put in Wilf's pocket by someone who wanted the launch to stay. You put it in yours." |
| `register` | Sallow's register | 15 | "A parish register page, Norwich, March 1908, from Sallow's empty case: 'Honoria, daughter of Vivienne Lacombe, spinster. Father: not recorded.' In pencil beneath, in Sallow's hand: 'L.H.'" |

### Puzzles

**P5.1 `the-footprint` — Follow the water (4 pts: `puddle` 2, `pipe` 2)**
Look at puddle in the passage → the footprint's size (`nb.smallfoot`: a woman's, or Mole's, who has small feet, which the Reverend will point out himself). Look at pipe → the heating runs from the kitchen range; the conservatory is the only warm room, which is why someone in thin shoes comes this way.
- Nudge: "The wet footprint came from somewhere. Go there."
- Clue: "The passage puddles. The heating pipe."
- Full: "Look at the puddle in the passage and at the heating pipe."

**P5.2 `gladstone` — The will (11 pts: `gladstone-look` 2, `lettuce` 3, `will` 6)**
Look at Gladstone: ninety years old, on a slab, on a blue corner. Take lettuce from the bench; Give lettuce to Gladstone → he moves four inches in a minute; Take thewill. Read thewill → `nb.willtext`, `flags.willRead`. The heir is a child, not a guest; Quist gets thanks.
- Nudge: "The tortoise is sitting on something blue."
- Clue: "Tortoises move for lettuce."
- Full: "Take lettuce from the bench, give it to Gladstone, take the will from under him and read it."

**P5.3 `the-cellar` — Where the claret went (8 pts: `claretbin` 2, `coaldoor` 3, `grille` 3)**
Cellars: Look at claretbin → one bottle gone tonight. Look at coaldoor → bolted from this side; a sound inside. Use bolt → it is padlocked as well; Tilly has no key to it (chapter 6). Use grille → the boathouse passage; Use hairpin on grille → open.
- Nudge: "Someone has been in the cellar tonight for a bottle, and someone is in the coal cellar."
- Clue: "Count the claret. Try the coal door. The grille to the boathouse opens with a hairpin."
- Full: "Look at the claret bin and the coal cellar door, then use the hairpin on the grille."

**P5.4 `wilf` — The boatman (12 pts: `wilf-talk` 3, `claret` 2, `plug` 4, `signal` 3)**
Boathouse: Wilf, drunk on house claret, the bottle a timer (ten actions before he finishes it and passes out for the night). Talk to Wilf → "Lady brought it. Said drink up, no boat tonight. Didn't say which lady." (`nb.wilflady`). Take claret. Search Wilf → `plug`. Use signal → Edie opens the shutter and sends the lantern's three longs to the mainland (`nb.signal`; the police launch will come at 6:40 whether the telephone works or not). Use plug on launch? No: keep it; the launch stays here, and so does everyone.
- Nudge: "The only way off the island is a boat, a boatman and a spark plug. Someone has thought about all three."
- Clue: "Talk to Wilf before his bottle's empty, search him, and use the lamp signal."
- Full: "Talk to Wilf, take the claret, search Wilf for the spark plug, and use the signal lantern."

### Deaths
- **Pipe**: Use pipe / touch → "The heating pipe is at range temperature. Your hand is not. The conservatory gets a new smell."
- **Garden door**: Use gardendoor in the storm → "You step into the garden to look at the sea. The sea, which has come up to the garden, looks back."
- **Wilf's bottle**: Drink from bottle → "You share Wilf's claret, to be companionable. Wilf's claret has something in it that Wilf is used to and you are not."
- **Launch**: Use launch / cast off → "You take the launch out to fetch the police yourself. The launch has oars, fuel, and no spark plug. The tide has an opinion."
- **Cold store**: Enter cold store / close door → "The cold store door locks from outside. Mrs Oakes finds you on Monday, perfectly preserved, and is briefly pleased."

### Exit condition
`thewill`, `plug`, `claret`, `flags.willRead`, `nb.signal`, `nb.wilflady`; the servants' stair → Chapter 6.

---

## Chapter 6 — The Servants' Hall (30 pts)

**Premise.** Half past two. The servants' side: Garrick's pantry with the ledger and the keys, the kitchen and Mrs Oakes, the servants' hall and the bells, the coal cellar from the inside. Sallow, with a lump on his head and his case empty, tells Edie what the old will said and who knew it. Garrick's ledger says who had the cellar key tonight. Mrs Oakes says who told her "no sauce for Sir Lionel", and it was not Sir Lionel.

### Rooms

**6a. The servants' hall** — `servants`
The long table, the bell board (library bell rang at 11:58), the back door (bolted), Garrick's pantry door, the kitchen door, the coal cellar door (inside end), Tilly's chair, a clock.
Hotspots: `longtable`, `bellboard`, `backdoor`, `pantrydoor`, `kitchendoor`, `coaldoor2`, `tillychair`, `sclock`, `me`.

**6b. Garrick's pantry** — `pantry`
Garrick asleep in his chair (or not), the ledger, the key board (cellar key gone), the silver safe, a photograph of the staff in 1922 with a young Quist in it, the telephone's junction box (cut).
Hotspots: `garrick4`, `ledger`, `keyboard`, `silversafe`, `staffphoto`, `junction`, `me`.

**6c. The kitchen** — `kitchen`
Mrs Oakes, the range, the sauce pan (washed), the menu book, the chemist's box (brown bottles, labelled), the cook's chair.
Hotspots: `oakes`, `range`, `saucepan`, `menubook`, `chemistbox`, `cookchair`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `ledger` | Garrick's ledger | 6 | "Thirty years of what came in and went out. Tonight: 'Cellar key to Miss Q., 10.40 p.m., for Sir L.'s port. Returned: —.'" |
| `cellarkey` | Cellar key | 7 | "The cellar key, from Miss Quist's coat in the servants' hall, where she hung it at eleven. The coat is damp at the hem." |
| `bottlelabel` | Chemist's label | 15 | "From the chemist's box: 'Chloral. Sir L. Harrowgate. One measure in wine produces the appearance of collapse. Dr Pell.' Dr Pell's hand, dated last week." |
| `oldwill` | What the old will said | 15 | "In your shorthand, from Mr Sallow's mouth: 'The old will left everything to Miss Quist. He changed it on Tuesday, after I found the register. He said she would be provided for. He did not say how.'" |

### Puzzles

**P6.1 `the-bell` — 11:58 (4 pts: `bellboard` 2, `listen6` 2)**
Look at bellboard → the library bell, 11:58, which the dead man rang. Listen in the servants' hall → Garrick, through the pantry door, to Tilly: "You saw nothing on the gallery. Say it." (`nb.garricknothing`).
- Nudge: "The bells remember who rang. The butler is telling the maid what she saw."
- Clue: "Look at the bell board and listen at the pantry door."
- Full: "Look at the bell board, then use Listen in the servants' hall."

**P6.2 `the-ledger` — The cellar key (10 pts: `ledger` 4, `keyboard` 2, `cellarkey` 4)**
Pantry: Garrick asleep (if `nb.garricknothing` he is awake and Tilly must distract him: Use Tilly on Garrick → she asks about the morning's fires). Take ledger → the cellar key went to Miss Q. at 10:40. Look at keyboard → the hook empty. Search Quist's coat (hanging in the servants' hall; `tillychair` hotspot has the coat on it) → `cellarkey`, damp hem (`nb.damphem`).
- Nudge: "The butler writes everything down. So do you. Compare."
- Clue: "The ledger says who had the cellar key. Her coat is on the chair."
- Full: "Have Tilly distract Garrick if he's awake, take the ledger, look at the key board, and search the coat on the chair for the cellar key."

**P6.3 `the-sauce` — Mrs Oakes (8 pts: `oakes-talk` 3, `chemist` 3, `menubook` 2)**
Talk to Mrs Oakes: "'No sauce for Sir Lionel', the doctor told me. Then the master told me to put it on anyway, in his own glass, which I never. I did." (`nb.oakessauce`). Look at menubook → the amendment in Pell's hand. Search chemistbox → `bottlelabel`: the chloral was Pell's, for Sir Lionel, for the performance (`nb.chloral`).
- Nudge: "The cook knows what went on the fish and who said so."
- Clue: "Talk to Mrs Oakes, read the menu book, search the chemist's box."
- Full: "Talk to Mrs Oakes, look at the menu book and search the chemist's box for the label."

**P6.4 `the-coal-cellar` — Sallow (8 pts: `coaldoor2` 2, `sallow-talk` 6)**
Use cellarkey on coaldoor2 → Sallow, alive, cross, with a lump. Talk → he was struck on the stairs after telling Miss Quist what the new will said and that the register was in his case; his case is empty. He dictates what the old will said (`oldwill`, `nb.oldwill2`). He asks Edie not to tell the Doctor he is alive, "because I would like to see his face at breakfast."
- Nudge: "The second corpse is behind a door you now have the key to."
- Clue: "Use the cellar key on the coal cellar. Let him talk."
- Full: "Use the cellar key on the coal cellar door and talk to Mr Sallow."

### Deaths
- **Range**: Use range / open the firebox → "Mrs Oakes's range has been lit since 1890. You open the firebox to see. It sees you first."
- **Silver safe**: Use silversafe twice → "The silver safe is wired to a bell in Garrick's room and a shotgun in Garrick's hands."
- **Back door**: Unbolt the back door in the storm → "You open the back door to check the weather. The weather checks in."
- **Garrick**: Hit Garrick / take the ledger while he is awake and undistracted → "Garrick has been a butler for thirty years. Butlers do not strike guests. Stenographers are not guests."

### Exit condition
`ledger`, `cellarkey`, `bottlelabel`, `oldwill`, `nb.*` for the chapter; Tilly: "The study, miss. I'll not go in. Nobody does." → Chapter 7.

---

## Chapter 7 — The Study (40 pts)

**Premise.** Four a.m. Sir Lionel's study: locked (Tilly has no key; Mole's key, left in the dead man's hand, is the one). Behind a false Turner, the files. Six folders with six names; a seventh with none. The register from Sallow's case is here, because the person who took it brought it to the one room she had always been allowed into. Honoria Quist comes in while Edie is reading it. Chapter 7 ends with the two of them in the study and the truth said once, quietly, and then the door.

### Rooms

**7a. The study** — `study`
The desk, a typewriter (Edie's professional interest), the Turner (false), the safe behind it, the files, a decanter, a window onto the causeway (the sea beginning to go out), a photograph of a young woman on the desk, the door.
Hotspots: `sdesk`, `typewriter`, `turner`, `safe`, `files`, `folderpell`, `folderlacombe`, `folderfane`, `foldermole`, `foldersallow`, `folderquist`, `folderblank`, `sdecanter`, `swindow`, `deskphoto`, `sdoor`, `quist3`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `molekey` | The Reverend's key | 14 | "The study key, which Sir Lionel gave the Reverend 'to pray over' and the Reverend put back in a dead man's hand. Edie took it from the hand. The hand was cold by then." |
| `files` | The blackmail files | 15 | "Six folders. Pell (Bombay). Lacombe (Honoria). Fane (the mess fund). Mole (the roof). Sallow (a client's trust, 1924). Quist: a folder with her name on it and nothing in it. A seventh, blank: the register and a birth certificate." |
| `certificate` | Birth certificate | 15 | "Honoria Vivienne, born Norwich, 14 March 1908. Mother: V. Lacombe. Father: blank. Pinned to it, in Sir Lionel's hand: 'Not yet. Perhaps never. She is useful as she is.'" |
| `typed` | Typed page | 15 | "A page in the typewriter, typed tonight: 'To whom it may concern: Miss Quist has served me faithfully for six years and' — and nothing. He stopped. She read it. The ribbon is new; you can read it from the ribbon." |

### Puzzles

**P7.1 `the-key` — Get in (6 pts: `molekey` 3, `door` 3)**
The key is in the corpse's hand in the library (`nb.molekey` from chapter 3 tells you where). Take molekey from body2 (Tilly waits outside). Use molekey on study door.
- Nudge: "The Reverend put a key where nobody would look. You looked."
- Clue: "The library. The dead man's hand."
- Full: "Take the key from Sir Lionel's hand in the library and use it on the study door."

**P7.2 `the-turner` — The safe (8 pts: `turner` 2, `safe` 6)**
Look at Turner → a copy, hinged. Use turner → the safe: a letter lock, five letters. The word is on the desk photograph's frame: GLADSTONE has nine; the frame says "H.V., 1926" and the safe takes five: Use pencil on safe (as in chapter 3) → the wards read H-O-N-O-R. `nb.safeword`.
- Nudge: "The painting is a door. The lock is a word, and the word is on the desk."
- Clue: "Your pencil reads letter locks. The photograph on the desk is the hint."
- Full: "Use the Turner, then use the pencil on the safe; the word is HONOR."

**P7.3 `six-folders` — Motives (14 pts: `pell-file` 2, `lacombe-file` 2, `fane-file` 2, `mole-file` 2, `sallow-file` 2, `quist-file` 4)**
Take files; Look at each folder (one `nb.file.*` each). Quist's is empty, which is the point: he had nothing on her; she had everything to lose from him anyway. Look at folderblank → `certificate`, the register page, the note.
- Nudge: "Six people, six folders. One of them is empty. That's the one."
- Clue: "Read every folder. Then the one with no name."
- Full: "Take the files and look at each folder, including the blank one for the birth certificate."

**P7.4 `the-typewriter` — The last page (4 pts: `typed` 4)**
Look at typewriter → `typed`; Use typewriter (Edie reads the ribbon) → `nb.ribbon`: the sentence he did not finish and, three lines earlier on the ribbon, the first draft of the new will's clause about "my thanks".
- Nudge: "A stenographer can read a typewriter ribbon. Nobody else in the house can."
- Clue: "The page in the machine and the ribbon behind it."
- Full: "Look at the typewriter and use it to read the ribbon."

**P7.5 `honoria` — The door (8 pts: `quist-talk` 8)**
Quist comes in. Talk → a four-step dialogue, no choices that fail: she asks what Edie has; Edie can show the certificate, the will, the typed page or nothing. Each shown item gets a true sentence from her (she took the register from Sallow on the stairs and did not mean the stairs; she went down the passage to the library at midnight to ask him, awake, what "my thanks" meant; he laughed). She does not confess to the cushion. She says the launch's plug is in Wilf's pocket and the boat will not go before the tide, so there is time for breakfast, and leaves. `flags.honoriaTalked`, `nb.honoria.*`.
- Nudge: "She's in the doorway. She knows what you've read. Say something true."
- Clue: "Show her the certificate, the will and the typed page, one at a time, and listen."
- Full: "Talk to Miss Quist and show her the birth certificate, the will and the typed page."

### Deaths
- **Decanter**: Drink from the study decanter → "Sir Lionel's study decanter is where he kept the chloral. One measure produces the appearance of collapse. Two produce the fact."
- **Window**: Climb the study window to the causeway → "The tide is going out. It is not out. The difference is about four feet and all of you."
- **Safe**: Force the safe with the poker → "The safe was made in Birmingham by people who expected pokers. It expects you, too, in a way that involves a spring."
- **Quist**: Hit Quist / threaten her → "You put a hand on Miss Quist. Garrick, behind her, has been behind her for six years. You do not see what he has in his hand. You hear it."

### Exit condition
`files`, `certificate`, `typed`, `molekey`, `flags.honoriaTalked`; Edie asks Garrick to assemble the house in the drawing room at six → Chapter 8.

---

## Chapter 8 — The Drawing Room (30 pts)

**Premise.** 6:10 a.m. The drawing room; everyone, including Sallow with a bandage and Pell's face at seeing him; the tide out; the police launch a speck from the window. Ten game-minutes on the clock (four real) to the jetty. Edie, who has never spoken at a meeting she has taken down, has the notebook, the will, the files, the glass, the napkin, the cushion, the key, the label and a choice of three accusations. Each accusation is a sequence: Edie presents evidence in order; the game plays the "how it happened" in a run of messages; the room reacts.

### Rooms

**8a. The drawing room at dawn** — `drawing2`
All seven guests plus Garrick, Mrs Oakes, Tilly and Wilf; the French windows (unlocked now, onto the terrace and the jetty path); the card table where Edie lays out evidence; the clock; the launch on the horizon.
Hotspots: `pell3`, `lacombe3`, `fane3`, `mole3`, `sallow3`, `quist4`, `garrick5`, `oakes2`, `tilly2`, `wilf2`, `french2`, `evidencetable`, `dclock`, `launch`, `me`.

### Puzzles

**P8.1 `the-floor` — Stand up (4 pts: `stand` 4)**
Use evidencetable → Edie stands, and the room, for the first time, looks at the stenographer. She reads the agency letter's last line aloud: "Discretion is expected." Then: "Not tonight." `flags.floor`.
- Nudge: "You have taken down everything. Now you have to say some of it."
- Clue: "Go to the card table."
- Full: "Use the evidence table to take the floor."

**P8.2 `the-wrong-answers` — Pell and Fane (4 pts: `accuse-pell` 2, `accuse-fane` 2)**
Use Pell (accuse) → requires `bottlelabel`, `glass`, `nb.pellfirst`: the chloral sequence plays ("the doctor poisoned the fish") and ends with Sallow, bandaged, pointing out that Sir Lionel was alive at eleven and smoking at a quarter to twelve; Pell: "He paid me to do it. He paid me for a performance." Comic coda: Pell faints; Mole catches him. Use Fane (accuse) → requires `cartridge`, `ious`, `nb.fanegood`: the revolver sequence; ends with Garrick producing the revolver, unfired, from the umbrella stand where the Colonel hid it at nine. Each wrong accusation scores 2 and costs a game-minute; both can be done.
- Nudge: "There are two obvious answers. The game lets you try them. They're wrong, and finding out why helps."
- Clue: "Accuse the Doctor with the label and the glass. Accuse the Colonel with the cartridge and the IOUs. Listen to what's said back."
- Full: "Use Dr Pell and Colonel Fane at the table with their evidence; each is answered."

**P8.3 `honoria-quist` — The right answer (16 pts: `accuse-quist` 10, `chain` 6)**
Use Quist (accuse) → the game asks for the chain, four evidence choices in order from the inventory and notebook: the cellar key and the ledger (she had the key at 10:40, the passage to the library); the footprint and the damp hem (she came back wet from the conservatory where she hid the will under Gladstone); the cushion with the two hairs; and the typed page and the certificate (the motive: not money, "my thanks"). Any order; all four → `chain` 6. The sequence plays: Honoria at midnight in the library, Sir Lionel awake and laughing, the cushion, the passage, the will under the tortoise "because he loved that tortoise more than me". Mrs Lacombe stands up. `flags.solved`; the clock stops.
- Nudge: "The person it leaves out. The person with the key. The person who was always allowed everywhere."
- Clue: "Accuse Miss Quist with the cellar key, the damp hem, the cushion and the typed page."
- Full: "Use Miss Quist at the table and present the cellar key with the ledger, the footprint with the damp hem, the cushion, and the typed page with the certificate."

**P8.4 `the-jetty` — The launch (6 pts: `choice` 6)**
Honoria asks to walk to the jetty herself. Choice for Edie: "Let her" / "Garrick should go with her" / "I'll go." "I'll go" scores 6, the others 3 and 1; in all three the launch takes her, Mrs Lacombe goes too, and Pell is told by Sallow that he will be hearing from him. Final.
- Nudge: "It's over. Someone has to walk her down."
- Clue: "Go yourself."
- Full: "Choose 'I'll go.'"

### Deaths
- **Clock**: ten game-minutes before `flags.solved` → "The launch ties up. Sergeant Pryor takes statements from eleven people who agree that it was the Doctor, the Colonel, or the sea. Miss Quist goes to Norwich on the Monday train with her mother and a blue envelope, and the Harrowgate estate goes to a child nobody can find. Your notebook is entered as evidence and never read."
- **Fane**: Accuse Fane without the cartridge → "'Prove it,' says the Colonel, and you cannot, and the Colonel, who has been waiting all night for someone to say that to him, has his revolver after all."
- **French windows**: Leave by the French windows before the end → "You walk down to the jetty to meet the police yourself. Honoria Quist, who was going that way, is there first, and the jetty is wet."

### Final screen
"Score: N of 250. Hints used: H. Margin at the jetty: M:SS." Ranks: 250 "Stenographer", 200+ "Witness", 150+ "Guest", 100+ "Suspect", below "Furniture".
Epilogue card: the launch leaving; Mrs Lacombe and her daughter in the stern; Sallow on the jetty with the register; Gladstone on the terrace, moving toward a lettuce; Edie on the causeway with her typewriter case, walking to the bus, the notebook in her pocket and "Discretion is expected" crossed out.

---

## Complete item list (for `ITEMS`)

| id | name | color | first seen | leaves inventory |
| --- | --- | --- | --- | --- |
| notebook | Notebook | 15 | ch1 | kept (the evidence system) |
| pencil | Pencil | 14 | ch1 | one to Tilly ch4; kept |
| agencyletter | Agency letter | 15 | ch1 | kept (read aloud ch8) |
| instructions | Sir Lionel's note | 15 | ch1 | kept |
| tidetable | Tide table | 15 | ch1 | kept |
| cartridge | Revolver cartridge | 7 | ch1 | ch8 (Fane) |
| menu | Menu card | 15 | ch2 | kept |
| glass | Sir Lionel's glass | 11 | ch2 | ch8 (Pell) |
| napkin | Napkin and bottle | 15 | ch2 | kept |
| cigarend | Cigar end | 6 | ch3 | kept |
| hairpin | Hairpin | 8 | ch3 | ch5 (grille) |
| candle | Candle | 15 | ch4 | burns ch4 |
| tilly | Tilly | 12 | ch4 | companion item ch4–7 |
| ious | The Colonel's IOUs | 15 | ch4 | ch8 (Fane) |
| roofletter | Roof fund letter | 15 | ch4 | kept (returned to Mole in the epilogue) |
| bombay | Dr Pell's licence | 15 | ch4 | kept |
| playbill | Playbill | 13 | ch4 | kept |
| cushion | Cushion | 4 | ch4 | ch8 (Quist) |
| thewill | The new will | 1 | ch5 | ch8 |
| lettuce | Lettuce | 10 | ch5 | ch5 |
| claret | Claret, 1911 | 4 | ch5 | kept |
| plug | Spark plug | 7 | ch5 | kept (Wilf gets it back in the epilogue) |
| ledger | Garrick's ledger | 6 | ch6 | ch8 (Quist) |
| cellarkey | Cellar key | 7 | ch6 | ch8 (Quist) |
| bottlelabel | Chemist's label | 15 | ch6 | ch8 (Pell) |
| oldwill | What the old will said | 15 | ch6 | kept |
| molekey | The Reverend's key | 14 | ch7 | kept |
| files | The blackmail files | 15 | ch7 | kept |
| certificate | Birth certificate | 15 | ch7 | ch8 (Quist) |
| typed | Typed page | 15 | ch7 | ch8 (Quist) |

## Puzzle ids for `GAMES['harrowgate'].puzzles`
ch1 `[the-tide, the-car, the-stenographer, first-words]`; ch2 `[the-table, the-toast, the-death, heart]`; ch3 `[the-warm-corpse, the-will-in-the-desk, the-window-seat, the-drawing-room]`; ch4 `[tilly, six-rooms, the-scream, the-real-death]`; ch5 `[the-footprint, gladstone, the-cellar, wilf]`; ch6 `[the-bell, the-ledger, the-sauce, the-coal-cellar]`; ch7 `[the-key, the-turner, six-folders, the-typewriter, honoria]`; ch8 `[the-floor, the-wrong-answers, honoria-quist, the-jetty]`.
Each entry's three strings are the Nudge / Clue / Full lines above, verbatim.

## Implementation notes
- Add `'harrowgate'` and `'harrowgate-walkthrough'` to `CATALOG` ($7.99 / $1.99) and `GAMES['harrowgate']`; hints in `src/games/harrowgate-hints.js`, never under `public/`.
- Same module shape on the shared engine: `public/games/harrowgate/{game,data,rooms,art,script}.js`; `DEFINITION.clock = { chapter: 8, start: 600, rate: 2.5, stopFlag: 'solved', lateAt: 120 }`, label "Launch in m:ss"; `chapter1DoneFlag: 'leftHall'`; `startRoom: 'causeway'`.
- **Listen** is a new verb for this game: add `listen` to the parser's VMAP (`listen`, `eavesdrop`, `overhear`) and a verb button that replaces Talk's slot when the room's `listenable` flag is set; it routes to `act('listen', 'room')`. The engine change is one line in the verb map and one in the template's verb strip; both games already built are unaffected. The notebook's "read notebook" output is built by the script from `flags.nb` (an object of taken-down lines), rendered through the existing message box.
- Chapter 8's accusation sequences are `E.choose` chains over the inventory and `flags.nb` (four picks for Quist); wrong picks are answered in character and do not end the sequence. The two wrong accusations are complete short cutscenes (message runs), not deaths.
- Six guest rooms share one background with per-occupant props (a flag `flags.roomOf`); the library has a dark variant for midnight.
- Flags that cross chapters: `lionelWarm`, `willGone`, `sallowBreathing`, `willRead`, `honoriaTalked`, `floor`, `solved`, and the `nb.*` lines.
- Soft timers count actions: the tide (14 on the causeway), the candle (12 after midnight, reset by a fresh candle from the linen press), Wilf's bottle (10 in the boathouse). Only chapter 8 uses the real clock.
- Art: 17 rooms (causeway, hall, dining, library, drawing, gallery, guestroom, library2, conservatory, cellars, boathouse, servants, pantry, kitchen, study, drawing2 = 16 plus the library dark variant). To cut scope merge `pantry` into `servants` and reuse `drawing` with dawn light for `drawing2`: 14 backgrounds. Palette: candle ambers and storm blues; chapter 8 is the only grey daylight. Cast: Edie, Sir Lionel, Pell, Lacombe, Fane, Mole, Sallow, Quist, Garrick, Mrs Oakes, Tilly, Wilf, Gladstone.
- Point check: 20 + 30 + 35 + 30 + 35 + 30 + 40 + 30 = 250. Within chapters: ch1 5+4+6+5; ch2 5+9+11+5; ch3 8+7+14+6; ch4 6+14+5+5; ch5 4+11+8+12; ch6 4+10+8+8; ch7 6+8+14+4+8; ch8 4+4+16+6.
