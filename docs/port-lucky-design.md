# Last Night in Port Lucky — puzzle & item map, chapters 3–8

Design spec for implementation. Companion to `claude/story/port-lucky.md` (canon) and `public/index.html` (chapters 1–2 as shipped). Conventions follow the existing code: rooms have `title`, `walk` box, `describe`, and `spots` (`id`, `name`, `rect`, `at`, `words`, optional `when`); items have `name`, `color` (EGA index), `words`, `look`; points are awarded once per `scored` key; hints are `[nudge, clue, full solution]` per puzzle id and live only on the server in `src/catalog.js`.

## Scoring budget (250 total)

| Chapter | Points | Running total |
| --- | --- | --- |
| 1 Honeymoon Suite (shipped) | 25 | 25 |
| 2 Level P2 (shipped) | 25 | 50 |
| 3 Big Earl's | 35 | 85 |
| 4 Boardwalk | 35 | 120 |
| 5 Marina | 35 | 155 |
| 6 Hartwell Suite | 30 | 185 |
| 7 Seaside Pavilion | 45 | 230 |
| 8 Epilogue | 20 | 250 |

Verbs stay as shipped: Walk, Look, Take, Use, Talk, plus parser-only Give/Eat/Drink/Play/Search/Sit. "Give X to Y" and "Use X on Y" are equivalent.

## Inventory carried in from chapter 2
`keycard`, `keys` (truck), `shoe` (Benny's left shoe), `receipt`. Items that leave the player's hands are listed per chapter under **Items out**.

## Time
The status bar shows room title; the clock advances per chapter (shown in the chapter's opening message, never a real timer) except in chapter 7, where an on-screen countdown is the only time pressure in the game.

---

## Chapter 3 — Big Earl's Pawn & Karaoke (11:00 AM) — 35 pts

**Premise.** Dex drives Mr. Sprinkles to Big Earl's. The bar never closed. Earl won't discuss the ring until Dex has earned "regular" status; the night's regulars remember more of Dex's night than he does.

### Rooms

**3a. Bar floor** — `earl-bar`
Long bar, a stage with a karaoke machine (sparking), a sleeping regular (Duane) face-down at a table with a plastic trophy, a jukebox, the pawn cage at the back (barred), a door to the alley, a wall of Polaroids.
Hotspots: `earl` (behind the bar), `duane` (sleeping regular), `trophy` (under Duane's arm), `karaoke` (machine on stage), `mic` (microphone, on stage), `jukebox`, `polaroids` (wall), `cage` (pawn cage, barred, Earl opens it), `tokens` (karaoke token slot on the machine), `alley` (door), `exit` (front door, back to truck), `me`.

**3b. Pawn cage** — `earl-cage` (opens only after Earl is satisfied)
Glass counter, ledger, a goat-shaped trophy stand (empty), a shelf of pawned junk including a one-lens pair of sunglasses' missing lens, a lilac feather, the day's receipt book.
Hotspots: `ledger`, `shelf`, `feather`, `receiptbook`, `lens`, `earl2` (Earl through the cage window), `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `token` | Karaoke token | 14 | "Good for one song at Big Earl's. One of six. Benny bought the other five." Found in the jukebox coin return. |
| `trophy` | Karaoke trophy | 14 | "SECOND PLACE — BIG EARL'S ALL-NIGHT SING-OFF. Engraved: DUANE. Duane did not win." |
| `polaroid` | Polaroid | 15 | "Benny on stage, 3:40 AM, holding a goat's lead and a microphone, mid-note. Underneath, in Earl's handwriting: WINNER." |
| `feather` | Lilac feather | 13 | "A single lilac feather, the kind that falls off a very serious hat." |
| `page` | Ledger page | 7 | "9:04 AM. Ring, gold, three stones. SOLD. Buyer: 'D. H., lilac hat, paid cash, did not haggle, looked at me like I'd stolen it.'" |

**Items in:** token, trophy (temporary), polaroid, feather, page. **Items out:** token (spent), trophy (returned to Duane), receipt (Earl keeps it as proof of the pawn).

### Puzzles

**P3.1 `earl-talk` — Get Earl to talk (10 pts: `earl-regular` 5, `earl-receipt` 5)**
Earl ignores anyone who hasn't sung. Solution: get a token from the jukebox coin return (Look at jukebox reveals "something glinting in the coin return"; Take jukebox / Search jukebox gives `token`), put token in the karaoke machine (Use token on karaoke/tokens), then Use mic. Dex sings; the regulars groan; Earl declares him a regular. Then Give receipt to Earl: Earl confirms the ring was pawned and sold, and opens the cage.
- Nudge: "Earl talks to customers. What does a customer do in a karaoke bar?"
- Clue: "You need a token for the machine, and you don't have one. Machines that take coins also give coins back. Check the jukebox."
- Full: "Take the token from the jukebox coin return. Use the token on the karaoke machine, then use the microphone. Once Earl calls you a regular, give him the pawn receipt."

**P3.2 `duane-trophy` — Wake Duane without losing a hand (10 pts: `duane-wake` 4, `duane-story` 6)**
Duane knows where Benny went but is asleep on the trophy. Taking the trophy directly: Duane swings and Dex loses (death, see below). Solution: Play the jukebox after getting the token? No, token is spent. Correct: Use mic while Duane sleeps makes him sit up shouting "I WAS ROBBED" (this happens during P3.1 automatically); after that, Talk to Duane: he wants his trophy "cleaned" of the word SECOND. Use polaroid on Duane (proof Benny won fair and square, he was holding a goat) calms him; he tells Dex that Benny left at 9:20 with "the lady boat captain, Marguerite, one shoe, crying, said he had to think."
- Nudge: "Duane is a sore loser. He might feel better if he knew who beat him and how."
- Clue: "There's a photo of the winner on the wall of Polaroids. Duane hasn't seen it."
- Full: "Take the Polaroid of Benny from the wall. After Duane wakes up (sing first), talk to him, then use the Polaroid on Duane. He tells you Benny left with Captain Marguerite."

**P3.3 `lilac-lead` — Find out who bought the ring (10 pts: `ledger` 6, `feather-pick` 4)**
In the cage: Look at ledger shows nothing (Earl's thumb covers it). Use polaroid on Earl distracts him ("Is that my goat?"), Dex reads the ledger: Take ledger → gets `page` ("D. H., lilac hat"). The lilac feather on the shelf is takeable once seen (Look at shelf). Both are needed in chapter 6.
- Nudge: "Earl's ledger has the buyer's name. Earl's thumb is on the ledger."
- Clue: "Earl cares about one thing more than money. Show him something about the goat."
- Full: "In the cage, use the Polaroid on Earl. While he's distracted, take the ledger page. Also look at the shelf and take the lilac feather."

**P3.4 `alley-truck` — Leave with the truck's jingle fixed (5 pts: `jingle` 5)**
Optional but required to proceed: Mr. Sprinkles won't start (battery flat from an hour of jingle). Alley: Use trophy on truck battery terminal is wrong (shock death). Correct: Earl, once a regular, lends jump leads if asked (Talk to Earl after P3.1, option appears in dialogue as "Ask about the truck"). Use leads on truck. Return trophy to Duane first or Duane blocks the door ("Give trophy to Duane": +0 but unlocks exit).

### Deaths
- **Karaoke machine**: Use mic without a token in the machine → "You grab the live microphone. The machine, which has been sparking since 1997, finally finds a use for you. You are the last song of the night."
- **Duane's trophy**: Take trophy while Duane is asleep → "You slide the trophy out from under Duane's arm. Duane, still asleep, defends his second place with a right hook that would have won the sing-off. Everything goes dark."
- **Alley**: Drink the mystery bottle by the bins → "It was not a drink."

### Exit condition
`page` and `feather` in inventory, Duane has told the Marguerite story, truck started → cutscene: Dex drives to the boardwalk. Chapter 4.

---

## Chapter 4 — The Boardwalk (12:15 PM) — 35 pts

**Premise.** Everything Dex owns is spread along Sunny Side Pier, traded away between 1 and 3 AM. He needs his wallet (to pay for things), his phone (Lucy has texted 41 times), and his watch back from Sal, who is sitting in a deckchair guarding Mr. Sprinkles' parking space with a tyre iron.

### Rooms

**4a. Pier entrance** — `pier`
Sal in a deckchair by the "ICE CREAM" sign, a churro stand run by Nadia, an arcade entrance, Madame Zora's fortune booth, the gulls, a lost-property kiosk (closed, "Back at 5").
Hotspots: `sal`, `deckchair`, `tyreiron`, `nadia`, `churros`, `grill`, `zora`, `booth`, `arcade` (door), `kiosk`, `gulls`, `bench`, `bin`, `me`.

**4b. Arcade** — `arcade`
Claw machine (Dex's wallet visibly inside, on top of plush dolphins), air hockey table, change machine, prize counter run by a bored teen (Tyler), a photo booth, a "test your strength" hammer.
Hotspots: `claw`, `clawglass`, `hockey`, `change`, `tyler`, `prizes`, `photobooth`, `hammer`, `bell`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `wallet` | Your wallet | 6 | "Your wallet. $11, a library card, and a photo of you and Benny aged nine, both missing teeth." |
| `phone` | Your phone | 0 | "41 texts from Lucy. The most recent: 'Dex. Where. Is. He.' Battery: 4%." |
| `watch` | Your watch | 7 | "Your grandfather's watch. Sal has been wearing it since 3 AM." (never actually in inventory; Sal gives it back in ch. 7) |
| `churro` | Churro | 6 | "A churro the length of your forearm. Nadia says you owe her for nine of these." |
| `quarters` | Roll of quarters | 7 | "$10 in quarters. The change machine is more generous than Tyler." |
| `plush` | Plush dolphin | 11 | "A plush dolphin named, according to the tag, 'Flipper 2'." |
| `fortune` | Fortune card | 13 | "MADAME ZORA SAYS: THE ONE YOU SEEK IS ON THE WATER. ALSO, YOU WILL NEED A TUBA. (Zora saw you last night.)" |
| `tuba` | Tuba | 14 | "The tuba from the suite. You went back for it. You are not proud." (acquired at the END of ch. 4 via phone call to Kevin; see P4.5) |

### Puzzles

**P4.1 `sal-standoff` — Get past Sal (8 pts: `sal-talk` 3, `sal-deal` 5)**
Sal wants his truck and your watch is "collateral". Talk to Sal: he'll trade the watch for the truck plus "what you owe". What Dex owes is unclear until Nadia explains (Talk to Nadia): Dex promised Sal a goat. Solution for now: Give keys to Sal (return the truck) — Sal keeps the watch until "the goat". This frees Dex but costs the truck (no transport; fine, the marina is at the end of the pier). Score `sal-deal`.
- Nudge: "Sal only wants two things back. One of them is in your pocket."
- Clue: "You can't give Sal a goat right now. You can give him his truck."
- Full: "Give the truck keys to Sal. He keeps your watch as a deposit against the goat you promised him. You'll settle that at the wedding."

**P4.2 `phone-churro` — Get the phone back from Nadia (7 pts: `nadia-debt` 3, `phone-back` 4)**
Nadia holds Dex's phone against a churro tab. She'll take $11 only after the wallet is recovered (P4.3). Alternative creative route: Give plush dolphin to Nadia (her daughter collects them) clears the tab for free (+2 bonus `nadia-dolphin`, total chapter still 35 by making `phone-back` 2 in that path — implement as: paying gives 4, dolphin gives 2 + 2 bonus).
- Nudge: "Nadia is holding your phone hostage. What does she want?"
- Clue: "She wants the churro money, or something for her daughter who likes marine mammals."
- Full: "Either pay Nadia with the wallet once you have it, or give her the plush dolphin from the claw machine."

**P4.3 `claw-wallet` — Retrieve the wallet from the claw machine (10 pts: `quarters` 2, `claw-fail` 2, `claw-win` 6)**
Wallet sits on the plush pile. Use quarters on claw: claw drops the wallet every time (scripted fail, +2 for trying). Tyler won't open the machine. Solution: Use hammer (test your strength) — ring the bell with a perfect strike (Use hammer three times; third time, after Look at hammer reveals "the trick is to hit the back edge") — the bell's vibration shakes the claw machine, wallet slides to the chute. Take wallet. The plush dolphin falls too.
- Nudge: "The claw is rigged. Think about what else in this arcade can shake things loose."
- Clue: "The strength-test bell is bolted to the same wall as the claw machine."
- Full: "Get quarters from the change machine, try the claw once, then look at the hammer and use it until you ring the bell. The wallet and a plush dolphin drop into the chute."

**P4.4 `zora` — Madame Zora's fortune (5 pts: `zora` 5)**
Zora remembers Dex ("You tipped me a tuba.") and reads his fortune for a quarter: Benny is "on the water", and Dex "will need the tuba". Gives `fortune`. Required: without it the marina chapter doesn't let Dex look out to sea with purpose (the `fortune` item unlocks the binoculars dialogue).
- Nudge: "Fortune tellers tell fortunes. Hers costs less than a churro."
- Clue: "Use a quarter on Madame Zora's booth."
- Full: "Get quarters from the change machine and use one on Zora's booth. She tells you Benny is on the water and that you'll need the tuba."

**P4.5 `call-kevin` — Get the tuba delivered (5 pts: `kevin-call` 5)**
Use phone (4% battery, one call): call Kevin at the Royale (Dex's phone has "Valet Kevin (DO NOT)" saved). Kevin, terrified, agrees to bring the tuba to the marina on a luggage trolley. Calling anyone else: Mom → see death; Lucy → Dex can't face it yet, phone dies (dead end: restart from chapter start prompt, not a death; implement as a soft fail: phone battery saves 1% "for emergencies" and the Kevin call still works).
- Nudge: "You have one phone call's worth of battery. Who owes you a favour and is scared enough to deliver a tuba?"
- Clue: "The valet has your room key history and your truck. He will do anything to make you go away."
- Full: "Use the phone and call Kevin. He brings the tuba to the marina."

### Deaths
- **Gulls**: Eat churro on the pier → "You bite the churro. Forty gulls bite you. Port Lucky's gulls have been waiting all morning for a man who smells like a minibar."
- **Call Mom**: Use phone, choose Mom → "You call Mom. She asks about Benny. You tell her. She drives down from Jacksonville, arrives at the wedding, and the ceremony is replaced by a two-hour conversation. Benny marries Lucy next spring. You are not invited."
- **Hammer**: Use hammer on claw glass → "You take the strength-test hammer to the claw machine. The glass holds. Tyler does not. Tyler's dad owns the pier."

### Exit condition
`wallet`, `phone`, `fortune` acquired; Sal has the keys; Kevin called → walk to end of pier → Chapter 5.

---

## Chapter 5 — The Marina (1:30 PM) — 35 pts

**Premise.** Benny is asleep on Captain Marguerite's party pontoon, *The Lady Lucinda*, which slipped its mooring and is drifting beyond the breakwater. Marguerite is on the dock, furious, boatless. Dex has a tuba (Kevin arrives with it on a trolley), a goat (Gus has followed Dex since the garage; he was hiding in the back of the truck and is now tied up by Kevin at the dock), and no boat.

### Rooms

**5a. Dock** — `dock`
Marguerite by an empty mooring, Kevin with a trolley and a tuba and a goat, a bait shop (Oscar), a coin-op telescope, a dinghy with no oars, a fuel pump, a coil of rope, a flare box (locked), a sign "NO HORNS AFTER 10 PM".
Hotspots: `marguerite`, `kevin`, `gus` (goat), `trolley`, `tuba` (on trolley), `oscar`, `baitshop`, `telescope`, `dinghy`, `oars` (missing — hotspot appears on Look at dinghy as "oarlocks"), `rope`, `flarebox`, `pump`, `breakwater` (far right, walkable, deadly), `sign`, `water`, `me`.

**5b. The Lady Lucinda** — `pontoon` (reached by dinghy)
Benny asleep under a lifejacket pile, a cooler, an anchor winch (jammed), the other tuxedo shoe hanging off the rail, a disco light, Marguerite's logbook.
Hotspots: `benny`, `lifejackets`, `cooler`, `winch`, `shoe2`, `discolight`, `logbook`, `rail`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `rope` | Coil of rope | 6 | "Thirty feet of marina rope. Smells of diesel and regret." |
| `bait` | Bucket of bait | 2 | "Shrimp, mostly. Oscar says they're 'yesterday's'." |
| `oars` | Oars | 6 | "A pair of oars Oscar was keeping as 'security' on a tab you don't remember opening." |
| `shoe2` | Benny's other shoe | 8 | "The right shoe. Now you have a pair. Now you have a groom." |
| `icewater` | Cooler of ice water | 11 | "Melted ice. Very cold. Very wake-uppy." |
| `logpage` | Logbook page | 15 | "1:10 AM: Picked up two gentlemen, one goat, one tuba from the Royale dock. Gentleman #2 paid in karaoke tokens. 9:25 AM: Gentleman #1 returned alone, crying, requested 'somewhere to think'. Anchored off breakwater. 10:40 AM: Anchor dragged. Pontoon gone. Captain furious." |

### Puzzles

**P5.1 `spot-benny` — Find the pontoon (5 pts: `telescope` 5)**
Use quarters on telescope (needs `fortune` to prompt "look toward the water"): Dex sees the pontoon drifting, one shoe on the rail. Without the telescope Marguerite won't talk business.
- Nudge: "Zora said he's on the water. The marina has a thing for looking at the water."
- Clue: "The coin-op telescope on the dock. You still have quarters."
- Full: "Use a quarter on the telescope. You spot the pontoon past the breakwater with Benny on board. Then talk to Marguerite."

**P5.2 `get-oars` — Get oars for the dinghy (10 pts: `oscar-talk` 2, `oscar-bait` 3, `oars` 5)**
The dinghy has no oars. Oscar at the bait shop has them "as security" on Dex's tab. Pay with wallet ($11 isn't enough, he wants $40). Alternative: Oscar's real problem is the gulls stealing bait. Give the churro to Oscar: he throws it on the far jetty, gulls leave, Oscar hands over the oars in gratitude. (If the churro was eaten → death earlier; if given to nobody it's still held.) Backup route if churro was somehow lost: Use tuba near bait shop scares gulls, same result (+0 bonus but valid).
- Nudge: "Oscar has your oars. Oscar has a gull problem."
- Clue: "Gulls love churros more than shrimp. You have a churro."
- Full: "Give the churro to Oscar (or play the tuba by the bait shop). The gulls leave and Oscar hands over the oars. Use the oars on the dinghy."

**P5.3 `row-out` — Reach the pontoon alive (10 pts: `rope-tie` 4, `row` 6)**
Rowing straight out: the current takes Dex onto the breakwater (death). Solution: Use rope on dinghy, then Give rope end to Marguerite (she anchors it to the dock cleat; "Use rope on cleat" also works) so the dinghy can be hauled back; then Use oars on dinghy / Use dinghy. Gus must stay on the dock (Use gus on dinghy → goat refuses, no death, funny line).
- Nudge: "Rowing out is easy. Rowing back against the current is the problem."
- Clue: "Thirty feet of rope and a captain with nothing to do but hold things."
- Full: "Take the rope, use it on the dinghy, then use the other end on the dock cleat (or give it to Marguerite). Use the oars on the dinghy to row out."

**P5.4 `wake-benny` — Wake Benny and bring him back (10 pts: `shoe-pair` 2, `wake` 5, `haul` 3)**
On the pontoon: Take shoe2. Talk to Benny: he mumbles about Lucy's mother and goes back to sleep. Use icewater (from cooler) on Benny: he wakes, panics, falls back asleep from exhaustion. Correct: Use tuba on Benny — but the tuba is on the dock. Solution: back on the dock, Play tuba (Use tuba) — the sound carries over water, Benny wakes and the goat, who hates brass, bolts along the dock and yanks the rope, hauling the dinghy (with Benny now rowing) back in. So the sequence is: row out, take shoe2, read logbook, pour ice water on Benny (he's groggy but will get in the dinghy), Take benny? No — Talk to Benny with shoe2 in hand ("Give shoe2 to Benny") → he puts the shoe on, agrees to come, gets in the dinghy. Row back: fail, current (not death this time, you're on the rope). Marguerite can't haul two men. Play tuba? Dex is in the boat; tuba is with Kevin on the dock: Use phone (1% emergency battery) → call Kevin → "Play the tuba." Kevin plays. Gus bolts, pulls the rope, dinghy comes in. `haul` 3.
- Nudge: "Benny's awake but you can't row two people against that current. Who is on the dock, and what do they have?"
- Clue: "Kevin, a tuba, and a goat that hates brass instruments tied to the same rope as your boat."
- Full: "On the pontoon, take the shoe and pour the cooler's ice water on Benny, then give him his shoe. Back in the dinghy, use the phone to call Kevin and tell him to play the tuba. Gus bolts and hauls you in."

### Deaths
- **Breakwater**: Walk onto the breakwater rocks, or row out without the rope → "The current knows this coastline better than you do. It introduces you to the breakwater. Repeatedly."
- **Fuel pump**: Use fuel pump / Drink from pump → "You were thirsty. It was diesel. Marguerite puts the fire out, eventually."
- **Winch**: Use winch on the pontoon → "The jammed anchor winch un-jams. It takes your sleeve, your arm, and your afternoon."

### Exit condition
Benny on the dock, both shoes, `logpage` read (sets `flags.knowsLucinda`, needed for Dolores). Marguerite drives everyone back to the Royale in her pickup; Kevin and Gus ride in the back. Chapter 6.

---

## Chapter 6 — The Hartwell Suite (2:40 PM) — 30 pts

**Premise.** Dolores Hartwell, mother of the bride, has had the ring since 9:04 AM. She is in the Hartwell suite (Suite 701, next door to the Honeymoon Suite) with a lilac hat on the stand and her handbag on her lap. She has been waiting to see what kind of man her son-in-law's best friend is. Benny is in the bathroom being sick; he can't be the one to do this.

Dialogue-driven chapter with a small inventory puzzle. Three approaches are offered; only one works, but the wrong ones aren't deaths, they're humiliations that cost nothing but let Dex try again.

### Rooms

**6a. Corridor, 7th floor** — `corridor`
Doors 701 and 702, a housekeeping cart, a room-service tray with a cloche, a window to the pavilion below (the clock on the pavilion reads 2:40).
Hotspots: `door701`, `door702`, `cart`, `tray`, `cloche`, `window`, `me`.

**6b. Hartwell Suite** — `hartwell`
Dolores in an armchair, hat stand with lilac hat (missing one feather), handbag, a framed photo of a younger Dolores with a goat, a tea service, Benny's voice from the bathroom, a balcony.
Hotspots: `dolores`, `hat`, `handbag`, `photo`, `tea`, `bathroom`, `balcony`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `cloche` | Room-service cloche | 7 | "A silver dome. Underneath was a bowl of soup. The soup is now in the corridor." (used to get Dolores to open the door: Dex poses as room service) |
| `tea` | Cup of tea | 15 | "Earl Grey, strong, no sugar. Dolores makes it the way the Hartwells have always made it." |
| `ring` | The ring | 14 | "Lucy's grandmother's ring. Three stones. It has had a longer night than you have." |

### Puzzles

**P6.1 `get-in` — Get Dolores to open the door (5 pts: `cloche` 2, `knock` 3)**
Knocking: "Go away, Dexter." Solution: Take cloche from the tray, Use cloche on door701 ("Room service"). Dolores opens it, sees Dex, sighs, lets him in anyway.
- Nudge: "Dolores won't open the door for you. Who does she open the door for?"
- Clue: "There's a room-service tray in the corridor."
- Full: "Take the cloche from the tray and use it on door 701."

**P6.2 `the-truth` — Get the ring (20 pts: `feather-match` 5, `photo` 5, `truth` 10)**
Talk to Dolores opens a dialogue tree with three branches:
1. *The cover story* ("Benny's at the barber, the ring's being cleaned"): Dolores produces the ring from her handbag, says "This ring?", and puts it back. Branch closes. 0 pts.
2. *The charm* (compliment the hat): she notices the missing feather. If Dex has the feather and gives it, +5 `feather-match`: she knows he was at Earl's. Still no ring.
3. *The truth*: only available after Dex has (a) given her the feather, (b) looked at the photo and asked about the goat (she tells the card-game story; +5 `photo`), and (c) `flags.knowsLucinda` (read Marguerite's log, so Dex knows Benny went to think, not to run). With all three, the "Tell her everything" option appears. Dex recounts the whole night, including the parts that make him look bad. Dolores hands over the ring. +10 `truth`.
Giving her the `page` (ledger) earlier shortens the tree: she admits buying it immediately ("Of course I did") but still won't hand it over without the truth option.
- Nudge: "Dolores already knows more than you do. She's not testing whether you can find the ring. She's testing something else."
- Clue: "Give her what proves you were at Earl's, ask about the photograph, and make sure you know why Benny left on that boat. Then stop performing."
- Full: "Give Dolores the lilac feather. Look at the photo and ask her about the goat. Having read Marguerite's logbook, choose 'Tell her everything' in the conversation. She gives you the ring."

**P6.3 `benny-up` — Get Benny upright (5 pts: `tea` 5)**
Benny won't come out of the bathroom. Take tea from the service, Give tea to bathroom/benny. He emerges. Dolores: "He takes it the Hartwell way. Good."
- Nudge: "Benny needs something to settle his stomach, and Dolores has made it already."
- Clue: "The tea on the tray is for exactly this."
- Full: "Take the cup of tea and give it to Benny through the bathroom door."

### Deaths
None. (Dolores: "Nobody dies in my suite, Dexter. We have a wedding.") Walking onto the balcony and Using the railing gives a near-miss line and a point deduction of 0; keep the chapter safe to contrast with 7.

### Exit condition
`ring` in inventory, Benny out of the bathroom. Dolores looks at the pavilion clock: 3:48. "Twelve minutes." Chapter 7.

---

## Chapter 7 — The Seaside Pavilion (3:48 PM) — 45 pts

**Premise.** Twelve minutes on an on-screen clock (ticks down one minute per ~25 seconds of real time or per 3 actions, whichever is slower; reaching 4:00 before the exit condition is a death that restarts the chapter). Five things must happen, in any order, across three rooms. Big Earl arrives at 3:52 to repossess Gus. Sal arrives at 3:55 for his goat. Lucy is in the bridal tent and must not see Benny.

### Rooms

**7a. Lawn** — `lawn`
Guests arriving, an usher (Priya) with a seating chart, the bridal tent (flap closed), the groom's tent, Gus tied to a palm, Kevin with the trolley, the aisle, a flower arch, a string quartet tuning.
Hotspots: `priya`, `chart`, `bridaltent`, `groomtent`, `gus`, `palm`, `kevin`, `trolley`, `arch`, `quartet`, `aisle`, `earl` (from 3:52), `sal` (from 3:55), `me`.

**7b. Groom's tent** — `groomtent`
A garment bag (tuxedo), a mirror, a hip flask (fatal), shoe polish, a bow tie that is Gus's size (the goat's), a bottle of water, Benny on a stool.
Hotspots: `bag`, `tux`, `mirror`, `flask`, `polish`, `bowtie`, `water`, `benny`, `me`.

**7c. Altar** — `altar`
The officiant (Reverend Okonkwo), a ring cushion, a lectern with no speech on it, chairs, the sea, the clock.
Hotspots: `officiant`, `cushion`, `lectern`, `chairs`, `clock`, `me`.

### Items
| id | name | color | look |
| --- | --- | --- | --- |
| `tux` | Tuxedo | 0 | "Benny's tuxedo. Pressed. Unaware of what it's about to be put on." |
| `polish` | Shoe polish | 0 | "Black. For a pair of shoes that have each had very different mornings." |
| `bowtie` | Goat bow tie | 4 | "The bow tie from the suite. It fits exactly one guest." |
| `water` | Bottle of water | 11 | "Still water. Benny needs about four of these." |
| `program` | Order of service | 15 | "Ceremony 4:00. Rings: Dex Morrow. Speech: Dex Morrow. Both of these are news to you." |
| `napkin` | Speech on a napkin | 15 | "Your speech, assembled from receipts, a Polaroid, a fortune card and a logbook page. It is honest. It is short. It will do." |

### Puzzles (any order; each is required)

**P7.1 `dress-benny` — Make Benny presentable (10 pts: `water` 2, `tux` 4, `shoes` 4)**
In the groom's tent: Give water to Benny, Use tux on Benny, Use polish on shoe (needs both shoes: `shoe` and `shoe2` are consumed, Benny is now wearing them). Giving the flask instead → death.
- Nudge: "Benny needs to look like a groom in under twelve minutes. Start with hydration."
- Clue: "Water, tuxedo, shoes. The shoes need polish; one of them has been in an ice-cream truck."
- Full: "In the groom's tent: give Benny the water, use the tuxedo on him, then use the shoe polish on the shoes and give them to Benny."

**P7.2 `earl-problem` — Deal with Big Earl (10 pts: `earl-stall` 4, `earl-settle` 6)**
Earl arrives to take Gus. Talking only stalls him (+4). Settling: Give trophy? (returned to Duane — no.) Give Earl the `polaroid`: it's proof Benny won Gus fair and square in Earl's own tournament, and Earl, a man of rules, honours it. If the Polaroid was given away earlier (Duane only looked at it, Dex kept it), it's here. +6.
- Nudge: "Earl respects exactly one authority: his own rules."
- Clue: "You have a photograph, marked WINNER in Earl's handwriting, of Benny winning the goat."
- Full: "Give Big Earl the Polaroid. He accepts that Benny won Gus fairly and leaves."

**P7.3 `sal-problem` — Deal with Sal (8 pts: `sal-goat` 3, `watch-back` 5)**
Sal arrives for the goat he was promised. Dex can't give him Gus (Gus is the ring-bearer and a Hartwell). Solution: Give Sal the `bowtie`-wearing *Flipper 2* plush? No — Sal isn't a fool. Correct: Dolores (now on the lawn) is the one who can settle a goat debt: Talk to Dolores about Sal → she offers Sal the inn's standing weekend ice-cream concession on the Hartwell pier, which is worth more than a goat. Sal returns the watch. `watch` finally in inventory.
- Nudge: "Sal wants a goat. You have one goat and it is not yours to give. Who owns the goat?"
- Clue: "Dolores Hartwell owns the goat, an inn, and a pier."
- Full: "Talk to Dolores about Sal. She offers him a concession on the Hartwell pier instead of a goat. Sal gives your watch back."

**P7.4 `ring-bearer` — Get the ring down the aisle (7 pts: `bowtie-gus` 3, `cushion` 4)**
Priya's chart says the ring-bearer is "TBD (ask Dex)". Use bowtie on Gus, Use ring on cushion, Use cushion on Gus (ties it to his harness). Gus will walk the aisle if (and only if) the quartet isn't playing brass — Talk to quartet to confirm "strings only" (free, flavour).
- Nudge: "Someone has to carry the ring. The order of service says it's you. There's a better candidate with four legs."
- Clue: "Gus has a bow tie somewhere in the groom's tent, and the altar has a ring cushion."
- Full: "Take the goat bow tie from the groom's tent and use it on Gus. Put the ring on the cushion at the altar and tie the cushion to Gus."

**P7.5 `speech` — Write the speech (10 pts: `program` 2, `napkin` 8)**
Look at lectern: no speech. Take program from a chair: Dex learns he is giving the speech. Use napkin? There's no napkin item until Dex combines things: Use `receipt`/`polaroid`/`fortune`/`logpage` on the lectern in any order — each one adds a line; when three of the four have been used, `napkin` is created ("You write it on a napkin. It's the truest thing you've written all year."). Note: receipt was left with Earl in ch. 3 and polaroid may be with Earl now; so the four candidates are `page` (ledger), `fortune`, `logpage`, `trophy`-memory via `token`? Simplify: the four speech sources are `page`, `fortune`, `logpage`, and `program`. Three of four required.
- Nudge: "The best man gives a speech. You haven't written one. You have, however, had a very well-documented day."
- Clue: "Use the pieces of paper you've collected on the lectern."
- Full: "Use at least three of the ledger page, the fortune card, the logbook page and the order of service on the lectern. Dex writes the speech on a napkin."

### Deaths
- **Clock**: 4:00 reached before all five puzzles done → "Four o'clock. The quartet plays. Lucy walks out to an arch, a reverend, a goat, and no groom. Port Lucky talks about it for years. You move to Jacksonville."
- **Hip flask**: Give flask to Benny or drink it → "Hair of the dog. The dog was a wolf. The ceremony goes ahead with the best man and groom asleep in the groom's tent, which is at least symmetrical."
- **Bridal tent**: Enter bridal tent with Benny in tow (Use bridaltent after `dress-benny`) → "Benny sees Lucy before the ceremony. Lucy sees Benny's sunburn. Dolores sees everything. It's not bad luck, exactly. It's just the end."

### Exit condition
All five puzzles complete with time remaining → the clock stops at the exact minute left (shown in final score as "Margin: N minutes"). Chapter 8.

---

## Chapter 8 — "To the Happy Couple" (4:00 PM, epilogue) — 20 pts

**Premise.** Non-fail epilogue. The ceremony plays as a cutscene with light interaction: Gus walks the ring down the aisle; the reverend asks for the rings; Dex takes them from Gus (Use gus / Take cushion, +2 `rings-handoff`). Then the reception toast.

### Room

**8a. Reception terrace** — `reception`
Long table, a microphone, Lucy and Benny, Dolores, Marguerite, Kevin (invited), Earl at the bar (invited, grudgingly), Sal serving ice cream from Mr. Sprinkles, Gus asleep under the cake table, the sunset.
Hotspots: `mic`, `lucy`, `benny`, `dolores`, `marguerite`, `kevin`, `earl`, `sal`, `gus`, `cake`, `sunset`, `me`.

### Puzzles

**P8.1 `the-speech` — Give the speech (10 pts; plus the 2-pt `rings-handoff` above = 12)**
Use napkin on mic. The speech is assembled from which sources the player used in P7.5, so it varies slightly. Then a three-choice ending beat: Dex can (a) take credit, (b) blame Benny, (c) tell them the goat was Benny's idea and Dolores's test. Only (c) earns the full 10 (`speech-honest`); (a) and (b) earn 4 (`speech-ok`) and Lucy's reply is cooler. In (c) Lucy stands and says she knew: Benny asked her mother's permission "the only way a Hartwell respects, by doing something stupid and brave for the family goat." +0 but the line is the payoff.
- Nudge: "You've spent all day learning that the cover story never works."
- Clue: "Tell them whose idea the goat was, and whose test this was."
- Full: "Use the napkin on the microphone. When asked, choose to tell the whole truth: the goat was Benny's plan and Dolores was testing you."

**P8.2 `loose-ends` — Four small kindnesses (8 pts, 2 each: `kevin-tip`, `marguerite-log`, `earl-token`, `watch-benny`)**
Give wallet ($11) to Kevin. Give logpage back to Marguerite. Give the last token to Earl (if saved — design note: make the jukebox give two tokens, one spent in ch. 3, so one remains). Show watch to Benny (Use watch on Benny): the photo of them aged nine is tucked behind the watch face — Benny's final line.

### Final screen
"Score: N of 250. Hints used: H. Margin at the altar: M minutes." Rank titles by score: 250 "Best Man", 200+ "Good Man", 150+ "Man", 100+ "Plus-One", below "Goat".

---

## Complete item list (for `ITEMS` in index.html)

| id | name | color | first seen | leaves inventory |
| --- | --- | --- | --- | --- |
| crackers, keycard, ticket, keys, shoe, receipt | shipped | | ch1–2 | crackers ch1, ticket ch2, receipt ch3, keys ch4, shoe ch7 |
| token | Karaoke token | 14 | ch3 jukebox (×2) | one ch3, one ch8 |
| trophy | Karaoke trophy | 14 | ch3 | ch3 (returned to Duane) |
| polaroid | Polaroid | 15 | ch3 | ch7 (to Earl) |
| feather | Lilac feather | 13 | ch3 | ch6 (to Dolores) |
| page | Ledger page | 7 | ch3 | ch7 (speech) or kept |
| wallet | Your wallet | 6 | ch4 | ch8 (to Kevin) |
| phone | Your phone | 0 | ch4 | kept |
| churro | Churro | 6 | ch4 | ch5 (to Oscar) |
| quarters | Roll of quarters | 7 | ch4 | spent gradually (telescope, Zora) |
| plush | Plush dolphin | 11 | ch4 | ch4 (to Nadia) or kept |
| fortune | Fortune card | 13 | ch4 | ch7 (speech) or kept |
| tuba | Tuba | 14 | ch5 (Kevin brings it; never in inventory, dock prop) | — |
| rope | Coil of rope | 6 | ch5 | ch5 |
| oars | Oars | 6 | ch5 | ch5 |
| shoe2 | Benny's other shoe | 8 | ch5 | ch7 |
| icewater | Cooler of ice water | 11 | ch5 (pontoon only) | ch5 |
| logpage | Logbook page | 15 | ch5 | ch8 (to Marguerite) |
| cloche | Room-service cloche | 7 | ch6 | ch6 |
| tea | Cup of tea | 15 | ch6 | ch6 |
| ring | The ring | 14 | ch6 | ch7 (cushion) |
| tux | Tuxedo | 0 | ch7 | ch7 |
| polish | Shoe polish | 0 | ch7 | kept |
| bowtie | Goat bow tie | 4 | ch7 | ch7 |
| water | Bottle of water | 11 | ch7 | ch7 |
| program | Order of service | 15 | ch7 | ch7 (speech) or kept |
| napkin | Speech on a napkin | 15 | ch7 | ch8 |
| watch | Your watch | 7 | ch7 (from Sal) | kept |

## Puzzle ids for `GAMES['port-lucky'].puzzles` (server-side hints)
Shipped: `goat`, `clue`, `door`, `valet`, `truck`.
New: `earl-talk`, `duane-trophy`, `lilac-lead`, `alley-truck`, `sal-standoff`, `phone-churro`, `claw-wallet`, `zora`, `call-kevin`, `spot-benny`, `get-oars`, `row-out`, `wake-benny`, `get-in`, `the-truth`, `benny-up`, `dress-benny`, `earl-problem`, `sal-problem`, `ring-bearer`, `speech`, `the-speech`, `loose-ends`.
Each entry's three strings are the Nudge / Clue / Full lines above, verbatim. The in-game `PUZZLES[room]` drawer lists, per room: ch3 `[earl-talk, duane-trophy, lilac-lead, alley-truck]`; ch4 `[sal-standoff, phone-churro, claw-wallet, zora, call-kevin]`; ch5 `[spot-benny, get-oars, row-out, wake-benny]`; ch6 `[get-in, the-truth, benny-up]`; ch7 `[dress-benny, earl-problem, sal-problem, ring-bearer, speech]`; ch8 `[the-speech, loose-ends]`.

## Implementation notes
- `restartScene()` needs a per-chapter preset (flags + inventory at chapter start) the way it already does for `garage`; store these as a `CHAPTER_START` table.
- The chapter-7 clock is the only timed element; pause it while a message box or modal is open.
- Dolores's dialogue tree (ch. 6) and the ending choice (ch. 8) need a small choice-box UI: reuse the `.sierra .actions` buttons used by the death box.
- Keep every death reversible with "Try again" restoring the pre-action snapshot, as `die()` already does.
- Art: twelve new rooms (bar, cage, pier, arcade, dock, pontoon, corridor, Hartwell suite, lawn, groom tent, altar, reception). To cut scope, merge the corridor into the Hartwell suite and the lawn/altar into one wide scene: nine backgrounds.
- Point check: ch3 35, ch4 35 (dolphin route: 3 + 2 + 2 bonus keeps the total), ch5 35, ch6 30, ch7 45, ch8 20 (2 + 10 + 8). Total with shipped chapters: 250.
