# Mop & Galaxy — game module: integration, decisions and test evidence

Branch: `claude/mop-galaxy-complete` (builds on `claude/port-lucky-complete`, commit `2944329`) · game id `mop-galaxy` · SKUs `mop-galaxy` (USD 7.99) and `mop-galaxy-walkthrough` (USD 1.99), prices supplied by the platform catalogue.

This document is for Atlas/Strategico (portal, accounts, payments, entitlements, saves, hint API, admin, hosting) and for Sipes (design review). It covers two things: the second game, and the small refactor that let both games share one engine. Read `docs/port-lucky-integration.md` first for the adapter contract; nothing in that contract changed.

## 1. What is on the branch

| Path | Purpose |
| --- | --- |
| `public/games/_shared/engine.js` | **New location** of the adventure engine (was `public/games/port-lucky/engine.js`). Identical behaviour; every game-specific value now comes from a `DEFINITION` object passed to `new Engine(def, container, adapter, options)`. |
| `public/games/_shared/template.js`, `game.css`, `pixels.js` | Shared DOM template (texts injected), scoped styles (`.pl-game`), and the EGA drawing primitives (`R`, `disc`, `sparse`, `text`, `fig`). |
| `public/games/port-lucky/game.js`, `script.js` | Port Lucky now builds a `DEFINITION` and mounts the shared engine. `script.js` gained `itemLabel()` (wallet/quarters labels moved out of the engine). All other Port Lucky files are unchanged. |
| `public/games/mop-galaxy/game.js` | Public entry: `mount(container, adapter, options)` → `{ unmount, refresh, state }`. Same signature as Port Lucky. |
| `public/games/mop-galaxy/script.js` | All puzzle logic for chapters 1–8, action-counted timers, the chapter-8 clock, `CHAPTER_START(n)` presets, `migrateSave()`. |
| `public/games/mop-galaxy/data.js` | 46 items, 8 chapters, 33 puzzles (titles only, no hint text), the 250-point table. |
| `public/games/mop-galaxy/rooms.js` | 19 rooms with hotspot rectangles, walk boxes and parser nouns. Mop appears as a hotspot in any room where it is in the inventory. |
| `public/games/mop-galaxy/art.js` | 19 EGA backgrounds, Wim, Mop, Gumbo (three sizes), Thistle, Ilse, Vane, Dorrit, Brack, Okonjo and Precedent the cat, drawn with canvas rectangles (no image assets). |
| `src/games/mop-galaxy-hints.js` | Walkthrough text for all 33 puzzles, three tiers each. **Server only.** |
| `src/catalog.js` | Data-only change: two new SKUs and `GAMES['mop-galaxy']` (see §3). |
| `dev/_shared/fixture-adapter.js` | The fixture adapter is now generic (takes `{ gameId, skuGame, skuWalk, catalog, hints }`); `dev/port-lucky/` and `dev/mop-galaxy/` are thin wrappers plus a dev page each. |
| `dev/test/mg-run.js`, `mg-walkthrough.js` | Playwright end-to-end suite for Mop & Galaxy (9 scenarios). `harness.js` gained `PL_EVIDENCE` for the output folder. |
| `test-evidence/mop-galaxy/` | Screenshots, logs, `results.md` / `results.json` from the last full run. `test-evidence/` (root) is the Port Lucky run, re-executed after the engine move. |

Nothing under `public/index.html`, `public/admin.html`, `src/index.js`, `src/stripe.js`, `src/email.js`, `migrations/`, `wrangler.jsonc` or secrets was changed.

## 2. Mounting the game in the portal

```html
<div id="game"></div>
<script type="module">
  import { mount } from '/games/mop-galaxy/game.js';
  const handle = await mount(document.getElementById('game'), adapter, { onExit(reason) { /* back to the catalogue */ } });
</script>
```

The adapter is the same object the portal builds for Port Lucky; the game passes its own `gameId` (`'mop-galaxy'`) to `save()`, `revealHint()` and `listHints()`, so saves and hints are kept apart per game by the existing `/api/save?game=` and `/api/hints?game=` keys. Both games load `/games/_shared/game.css` once and share the `.pl-game` class, so only one game should be mounted at a time (unmount before mounting the other).

### 2.1 Save format

Same shape as Port Lucky without `money`/`quarters`: `{ v: 2, ownerId, chapter, room, inv, flags, scored, score, hintsUsed, revealed, px, py, dir, started, clock, checkpoint, done }`. Observed size ≈ 5 KB (chapter 8 carries 17 items and ~100 flags). There are no legacy saves for this game; `migrateSave()` only fills defaults and synthesises a checkpoint if one is missing.

## 3. Platform changes for Atlas to implement

1. **Catalogue.** `src/catalog.js` on this branch adds `mop-galaxy` (799) and `mop-galaxy-walkthrough` (199, `requires: 'mop-galaxy'`) and `GAMES['mop-galaxy']`. `/api/config`, `/api/checkout`, `/api/hint` and `/api/hints` need no code change; the admin dashboard picks the new SKUs up from `publicCatalog()`.
2. **Portal card.** Add a second catalogue card that mounts `/games/mop-galaxy/game.js` with the same adapter. Free players get scene 1; the paywall text and prices come from the game and the catalogue respectively.
3. **Service worker.** Precaching is unchanged; `/games/_shared/*` and `/games/mop-galaxy/*` fall through to the network like Port Lucky's files. Bump `CACHE` when shipping because `public/games/port-lucky/engine.js`, `template.js` and `game.css` moved to `_shared/`.
4. **Nothing else.** No migrations, no new secrets, no env vars.

## 4. Design decisions, assumptions and corrections (for Sipes to confirm)

None of these were previously approved; they were applied to make the game finishable and consistent with `claude/story/mop-galaxy-design.md`.

1. **Mop is an inventory item** (`mop`) rather than a separate companion system. It shows up as a hotspot wherever it is in the room, talks per room, is sent down the chute in chapter 1, rejoins in the galley, stays behind at Airlock A, comes up through the bridge floor in chapter 6, and holds the pressure door in chapter 7. This kept the engine unchanged.
2. **Soft timers count actions, not seconds** (cryo sweep: 7 actions, 14 once the drain is fogged; Ilse: 9 actions away; reactor radiation: 7 actions without the dosimeter; hull O2: 30 actions; the Lien's pressure door: 7 actions after the lever). *Look* never counts. A timer death rolls the *Try again* snapshot back a few actions so the death cannot repeat on the next click. Only chapter 8 has a real clock (240 s at 1×), which pauses on messages, choices, hints, modals and backgrounding and stops when the captain wakes.
3. **Your mop vs Mop.** "Your mop" (`mymop`) is a separate item taken in chapter 1 and lost at Airlock A, after which it drifts past the collar window once a minute (`flags.tick`). "take my mop" collides with the parser's stop-word list, so the hotspot also answers to "mop handle", "your mop" and "broom".
4. **Gumbo** grows in three stages (`gumbo1/2/3`): plastic from the compost (tray or SnakPak wrapper), Thistle's plant ties, Vane's vent insulation. Gumbo holds the galley door wheel during chapter 3 and is collected automatically when you take the service duct; it holds key B in chapter 7.
5. **Points that depend on route**: the final answer to Okonjo scores 6 (Deck Officer), 3 (Wim) or 1 (contractor); the vault seal scores only if Dorrit told you the seeds were pre-sold. `coffee-brack` accepts coffee or the tomato (same points); `brack-stall` accepts rations, tomato, coffee or the clause-9 line.
6. **The Lane Authority broadcast** is a three-way choice; the two wrong lines are retryable, not fatal.
7. **Keypad code 4471** is printed on the delivery slip in the crate; the keypad gives two wrong attempts before an alarm death.
8. **Chapter 8 starts in the lift**, not the ready room, so the clock starts on something the player can act on immediately. Brack arrives when the lift lands.
9. **Rank thresholds** (250 Deck Officer / 200 Second Class / 150 Third Class / 100 Contractor / Delivery) are mine; the design doc did not fix them.
10. **Precedent the cat** causes a death on the third grab, the drone files you under MISC, and Dorrit can be killed-by in two ways; 39 death sites in all, every one reversible with *Try again*.

## 5. Running it

```sh
node dev/serve.js 8788 &                                   # static server over the repo root
open http://localhost:8788/dev/mop-galaxy/?player=owner    # players: anon | free | owner | walkthrough
PL_BASE=http://localhost:8788/dev/mop-galaxy/ PL_EVIDENCE=test-evidence/mop-galaxy node dev/test/mg-run.js   # ~15 min (one scenario waits out the real 4-minute clock)
node dev/test/run.js                                       # Port Lucky suite, unchanged entry point
```

Checkout in the dev host always rejects with 503 "not simulated"; ownership can only be changed with the player selector. Hint text is imported from `src/` by the dev page and never appears under `public/`.

## 6. Test evidence

See `test-evidence/mop-galaxy/results.md` (summary table), `*.png` (screenshots per chapter, deaths, paywall, hints drawer, layouts) and `*.log` (every command and message of the full runs). Fixture testing only: no live platform, payment, email or deployment was exercised.

## 7. Outstanding defects and limitations

- The parser is shared with Port Lucky and still single-noun-per-side; "put the tray in the compost" works, "feed the compost unit with the tray" does not (it falls back to "Give what?").
- Hull rooms do not animate the tether; the clip is a static yellow line once attached.
- The fixture adapter's players own either game (`owner` owns the game whose dev page is open), which is fine for testing but does not model a player who owns one game and not the other. The real adapter does, via `entitlements`.
- Chapter 8's four-minute clock has not been tuned with players; `CLOCK_START` in `script.js` is the one knob.

## 8. Repository notes

Commits on this branch are mine; please review before merging. The branch does not touch `main`. Port Lucky's own suite was re-run after the engine moved to `_shared/` (results in `test-evidence/results.md`).
