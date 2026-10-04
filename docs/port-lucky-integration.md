# Last Night in Port Lucky — game module: integration, decisions and test evidence

Branch: `claude/port-lucky-complete` · baseline reviewed: `77423ee` · game id `port-lucky` · SKUs `port-lucky` (USD 7.99) and `port-lucky-walkthrough` (USD 1.99), prices supplied by the platform catalogue.

This document is for Atlas/Strategico (portal, accounts, payments, entitlements, saves, hint API, admin, hosting) and for Sipes (design review). The game module owns everything under `public/games/port-lucky/`, the server-only hint text in `src/games/port-lucky-hints.js`, the dev host under `dev/`, and the tests.

## 1. What is on the branch

| Path | Purpose |
| --- | --- |
| `public/games/port-lucky/game.js` | Public entry: `mount(container, adapter, options)` → `{ unmount, refresh, state }`. Loads `game.css` itself. |
| `public/games/port-lucky/engine.js` | Canvas render loop, messages, choice boxes, parser, inventory, saves (with visible failure + retry), reversible deaths, chapter checkpoints, chapter-7 clock, hint drawer, paywall/gate/final screens, mobile layout hooks. |
| `public/games/port-lucky/script.js` | All puzzle logic for chapters 1–8, chapter transitions, `CHAPTER_START(n)` presets, `migrateSave()` for v1 (demo) saves. |
| `public/games/port-lucky/data.js` | Items, chapters, puzzle lists (titles only, no hint text), the 250-point table. |
| `public/games/port-lucky/rooms.js` | 14 rooms with hotspot rectangles, walk boxes, parser nouns. |
| `public/games/port-lucky/art.js` | All pixel art: the two demo rooms ported unchanged plus 12 new EGA backgrounds and the NPC cast, drawn with canvas rectangles (no image assets). |
| `public/games/port-lucky/template.js`, `game.css` | DOM template and scoped styles (`.pl-game`). |
| `src/games/port-lucky-hints.js` | Walkthrough text for all 28 puzzles. **Server only.** |
| `src/catalog.js` | One data-only change: `GAMES['port-lucky'].puzzles` now imports from `src/games/port-lucky-hints.js` (see §3). |
| `dev/serve.js`, `dev/port-lucky/` | Local dev host with fixture adapter and synthetic players. Not deployable; `wrangler` serves only `public/`. |
| `dev/test/` | Playwright end-to-end suite (`run.js`, `walkthrough.js`, `harness.js`). |
| `test-evidence/` | Screenshots, logs, `results.md` / `results.json` from the last full run. |

Nothing under `public/index.html`, `public/admin.html`, `src/index.js`, `src/stripe.js`, `src/email.js`, `migrations/`, `wrangler.jsonc` or secrets was changed. The demo in `public/index.html` still works as before; it is now a legacy entry that the portal should replace by mounting the module (§2).

## 2. Mounting the game in the portal

```html
<div id="game"></div>
<script type="module">
  import { mount } from '/games/port-lucky/game.js';
  const handle = await mount(document.getElementById('game'), adapter, {
    onExit(reason) { /* 'user' | 'paywall' | 'finished' | 'signed-out' — show the catalogue */ }
  });
  // later: handle.unmount();  handle.refresh() after the player's state changes;  handle.state (read-only copy)
</script>
```

The module creates all of its own DOM inside the container, loads `game.css` once, and removes everything on `unmount()`. It never touches `fetch`, cookies, `location` or Stripe. It uses `localStorage` only for one UI preference (the 10-second hint delay).

### 2.1 Platform adapter contract (proposed; this is what the game calls)

| Method | Returns | Notes |
| --- | --- | --- |
| `getState()` | `Promise<{ user, entitlements, save, catalog }>` | `user`: `{ id, name, email, isAdmin }` or `null`. `entitlements`: array of SKUs. `save`: the last object passed to `save()` for this game, or `null`. `catalog`: `{ [sku]: { name, price_cents } }` (the existing `/api/config` shape). Called on mount and after every `subscribe` notification. |
| `subscribe(cb)` *(optional)* | `unsubscribe()` | Call `cb()` whenever the user, entitlements or catalogue may have changed (sign-in, sign-out, purchase confirmed, return from Stripe). |
| `signUp()`, `signIn()` | `Promise<void>` | Open the portal's own UI; resolve when it closes. The game then calls `getState()` again. |
| `checkout(sku)` | `Promise<void>` | Start Stripe Checkout (normally navigates away). Must never resolve "paid"; ownership only ever arrives via `getState()`. Reject with `{ message }` to show an error in the game. |
| `save(gameId, data, { keepalive, ownerId })` | `Promise<{ updated_at }>` | Reject on any failure: the game shows "Save failed · Retry". `keepalive` is set on `pagehide`/unmount (use `fetch(..., { keepalive: true })`). `ownerId` is the user id the progress belongs to; **reject with 409 if it is not the signed-in user** (protects against a save racing a sign-out). Payload is ≤ 8 KB. |
| `revealHint(gameId, puzzleId, level)` | `Promise<{ text }>` | Reject `{ status: 402 }` when the walkthrough is not owned, `{ status: 409 }` when an earlier level has not been revealed. Maps to the existing `POST /api/hint`. |
| `listHints(gameId)` *(optional)* | `Promise<{ revealed: [{ puzzle_id, level, text }], count }>` | Maps to the existing `GET /api/hints?game=`. |

The existing Worker already implements the server side of all of this (`/api/me`, `/api/save`, `/api/checkout`, `/api/hint`, `/api/hints`, `/api/config`). A thin adapter in the portal page that wraps those calls with `credentials: 'same-origin'` satisfies the contract; `dev/port-lucky/fixture-adapter.js` is a complete reference implementation of the shape.

### 2.2 Save format

`save()` receives a plain object: `{ v: 2, ownerId, chapter, room, inv, flags, scored, score, hintsUsed, revealed, px, py, dir, started, money, quarters, clock, checkpoint, done }`. `checkpoint` is a snapshot of the state at the start of the current chapter (used by *Restart scene*). The game accepts and migrates the old demo shape (no `v`, no `chapter`); tested in `old-save-migration`. The server's `MAX_SAVE_BYTES` of 64 KB is ample (observed ≈ 4 KB).

## 3. Platform changes for Atlas to implement

1. **Mount the module instead of the demo.** Replace the inline game in `public/index.html` with the mount above and a real adapter. The portal's catalogue card for Port Lucky should call `mount()`; `onExit` returns to the catalogue.
2. **Adopt the `src/catalog.js` change** (already on this branch, data only): `GAMES['port-lucky'].puzzles` comes from `src/games/port-lucky-hints.js`. No API change; `/api/hint` and `/api/hints` work unchanged for the 23 new puzzle ids. Please keep `src/games/*` out of any asset build.
3. **Reject mismatched saves.** In `/api/save`, if the request body carries `ownerId` and it is not the session's user id, respond 409. (Optional but recommended; the game already guards client-side.)
4. **`subscribe`.** After a successful return from Stripe (`?purchase=success`) and after sign-in/out, notify the adapter's subscribers (or call `handle.refresh()`), so the paywall clears without a reload.
5. **Service worker.** `public/sw.js` caches the shell; add `/games/port-lucky/*` to its asset list or let it fall through to network (it currently does, since only `./`, `index.html`, the manifest and icons are precached). Bump `CACHE` when shipping.
6. **Nothing else.** No migrations, no new secrets, no env vars. SKUs and prices unchanged.

## 4. Design decisions, assumptions and corrections (for Sipes to confirm)

These were applied to make the review build consistent and finishable. None were previously approved.

- **Karaoke chronology corrected.** Receipt 4:02 AM (ring pawned, six tokens bought) → sing-off → Benny wins Gus at **5:31 AM** (Polaroid) → Marguerite's log: 1:10 AM pickup with tuba, **6:05 AM** returned with the goat, 9:25 AM Benny back alone "to think", 10:40 AM anchor dragged → Earl sells the ring at **9:04 AM** to "D. H., lilac hat" → Duane: Benny left at 9:20 with Marguerite. All in-game text now agrees.
- **Tokens.** The jukebox coin return yields **two** karaoke tokens: one is spent to sing (chapter 3), one is owed to Earl at the reception (chapter 8). The design's "trophy returned to Duane to unlock the exit" was dropped; the trophy is now only a death (taking it while Duane sleeps).
- **Money.** The wallet holds **$21** when recovered. Quarters come free from a jammed change machine (coin-return button), not from the wallet, so the claw puzzle has no circular dependency. Spend: claw 4 quarters, Zora 1, telescope 1. Nadia's tab is $11 (cash route) or a plush dolphin (dolphin route). Oscar wants $40, which the player can never have, so the gulls route is the only one. Kevin's tip in chapter 8 accepts the wallet (if it still has cash) or the remaining quarters, so **both routes reach 250**.
- **Chapter 5 soft-lock removed.** If the player never reads Marguerite's logbook, Benny pockets the page himself during the rescue, so the truth option in chapter 6 is always reachable.
- **Chapter 6 has no deaths** (Dolores: "Nobody dies in my suite"). The balcony is a near-miss line only.
- **Chapter 7 clock.** 12 game-minutes at 3 game-seconds per real second (4 real minutes), shown as wall time and time left. It runs only in chapter 7, only until the ceremony is ready, and pauses during messages, dialogue choices, the hint drawer, modals, death boxes and while the tab is hidden. Earl arrives at 3:52, Sal at 3:55. On a clock death, *Try again* restores the pre-action state with **two game-minutes** on the clock (not the few seconds that were left), so retry is fair; *Restart scene* resets to 3:48 with the chapter-start inventory.
- **Deaths implemented (14):** blue cocktail; live microphone without a token; Duane's trophy; the alley bottle; eating the churro in front of the gulls; calling Mom; hammering the claw glass; the breakwater (two ways: climbing it, rowing without the line); the diesel pump; the anchor winch; the hip flask; the bridal tent with a dressed groom; the clock. Each shows *Try again* (restores the state before the fatal action) and *Restart scene* (chapter checkpoint; hints used and revealed hints are kept).
- **Scoring:** chapter totals 25/25/35/35/35/30/45/20 = 250; `POINTS` in `data.js` is the single source of truth. The only alternative keys are `phone-back` (4, cash) vs `phone-back-dolphin` + `nadia-dolphin` (2 + 2, dolphin) and `speech-honest` (10) vs `speech-ok` (4). Final ranks: 250 Best Man, 200+ Good Man, 150+ Man, 100+ Plus-One, otherwise Goat.
- **Reception epilogue** can also be finished without the four kindnesses: after the speech, talk to Lucy and choose to call it a day.
- **Walk-mode shortcuts.** Clicking a door/exit with Walk selected uses it (as the demo did for the suite door).
- **Hit-testing.** Hotspots take priority over the player's own sprite, so Dex never blocks the thing he just walked up to (the demo had this bug: standing in front of the minibar made the crackers unclickable).
- **Ages 16+** text retained from the demo (one blue cocktail, one hip flask, no new drinking).
- **Artwork.** All twelve new rooms are drawn procedurally in the same 320×180 EGA style as the demo, plus a shared NPC figure drawer. They are review-quality, not final; a pixel-art pass can replace any `bg()` function without touching logic.

## 5. Running it

```bash
# 1. static dev server (serves the repo root so the dev host can import src/games/*-hints.js)
node dev/serve.js 8788        # http://localhost:8788/dev/port-lucky/?player=free|owner|walkthrough|anon

# 2. end-to-end tests (needs playwright + a Chromium; set PL_CHROME to the browser binary if not default)
npm i -D playwright@1.59.0-alpha-1771104257000   # or any 1.5x; then `npx playwright install chromium`
node dev/test/run.js                              # all scenarios (~16 min; the chapter-7 clock is real time)
node dev/test/run.js full-run-dolphin             # one scenario
```

The dev toolbar switches fixture players (which triggers the adapter's `subscribe`), resets a player's save, injects save/hint failures and latency, and remounts. **Checkout is never simulated**: the fixture's `checkout()` rejects with a message, and no local action grants an entitlement; "owner" and "walkthrough" are separate synthetic players.

## 6. Test evidence

`test-evidence/results.md` is the machine-written summary of the last full run; screenshots are named `<scenario>-<nn>-<label>.png`; `*.log` files are the exact command/message transcripts.

| Scenario | What it proves |
| --- | --- |
| `full-run-dolphin` | Owner (no walkthrough) plays all eight chapters by typed commands to **250/250**, dolphin route, no page errors. Screenshots of every room. |
| `full-run-cash-with-hints` | Walkthrough owner plays all eight chapters to **250/250**, cash route; reveals nudge and clue via the drawer (text served from `src/`), full solution gated by the 10 s wait, ordering enforced. |
| `free-player-paywall-and-denied-hints` | Free player: drawer shows the upsell with catalogue prices; adapter denies hints with 402; scene 1 ends at the paywall showing $7.99; checkout is refused by the fixture; entitlements unchanged; paywall persists on reload. |
| `deaths-retry-restart` | All 14 deaths triggered; *Try again* restores score/inventory/room each time; *Restart scene* returns to the chapter checkpoint (chapter 3 and chapter 7, including the clock). |
| `old-save-migration` | Two v1 demo saves (mid-garage and demo-complete with `demoDone`) migrate to v2, synthesise a checkpoint and continue into chapter 3. |
| `save-failure-visible` | Injected save failure shows "Save failed · Retry"; retry persists. |
| `account-change` | Switching fixture player mid-game reloads that account's save; nothing leaks between accounts; a pending save for the previous account is rejected by the adapter's owner check. |
| `mobile-layouts` | 390×844 portrait shows the rotate prompt ("play upright anyway" works); 844×390 landscape uses the side-action column with no horizontal scroll; Type shows the parser without covering the buttons; Items sheet and tap-to-use work. |
| `mount-unmount-and-clicks` | Verb clicks, item-then-hotspot clicks, `unmount()` removes the DOM with no errors, remount restores progress (pending save flushed on unmount). |

**All of this is fixture testing.** Nothing here exercised the live Worker, D1, Stripe or Mailtrap; the live adapter does not exist yet (§3.1). The server endpoints the contract maps to are unchanged from `77423ee` and were not re-tested on this branch.

## 7. Outstanding defects and limitations

- Artwork is procedural review art; several rooms (pontoon, reception) would benefit from a hand-pixelled pass. No change to logic required.
- The game-7 clock pauses when the tab is hidden, but mobile browsers may throttle `requestAnimationFrame` before `visibilitychange` fires; a few seconds of drift either way is possible. Not player-visible in testing.
- Google Fonts are referenced by the portal shell, not the module; offline the module falls back to monospace/system fonts (as in the screenshots).
- The parser accepts a wide synonym set but is English-only; unknown verbs get a help line.
- `listHints` reconciles hint counts from the server on drawer open; if the platform does not implement it, the local count is used (hints still work).
- The chapter-7 arrival messages (Earl, Sal) can appear while the player is inside the tent or at the altar; they are informational and pause the clock while shown.
- Not tested: real touch events (Playwright used mouse emulation at phone viewports), screen readers, Safari.

## 8. Repository notes

`main` on GitHub could not be inspected from the build environment (no GitHub access from the sandbox), so this branch is based on `77423ee` plus the two documentation commits. The module is isolated under `public/games/port-lucky/`, `src/games/`, `dev/` and `docs/`, and the only shared file touched is `src/catalog.js` (hint data). A rebase onto a newer `main` should be conflict-free unless `src/catalog.js` was edited there.
