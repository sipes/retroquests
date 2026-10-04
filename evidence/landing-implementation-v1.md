# Retro Quest landing elevation v1 — implementation handoff

## Scope and result

Worktree: `/opt/hermes-data/workspaces/Strategico-Workspace/apps/retroquests-landing-v1`
Branch: `platform/retroquests-landing-v1`; base: `d07e3db`.

Implemented an original-based after-hours arcade landing in `public/index.html`. Added a clear arcade-level “Small pixels. Big adventures.” heading before the featured Port Lucky story, a dominant framed original suite canvas, direct existing Play action, catalogue anchor, three original canvas cards, and concise planned USD pricing below the catalogue. Removed invented future release dates and long internal release checklist copy. One two-scene demo status and one concise sales/notifications unavailable note remain. Both future titles say “In development”.

Original plum `#120f22`, EGA magenta/cyan/yellow, goat, tuba, story, artwork and three font families are retained. All layout overrides are in `#landing-elevation`, scoped to `#home` except homepage-only header sizing/touch targets. Existing gameplay CSS is untouched. Both notification controls are disabled even before JS boots; the planned full-game button is disabled in initial markup and remains controlled by the unchanged server-sale binding.

## Original comparison and invariants

Reference read: `../retroquests/.wrangler/original-reference/2026-10-04-11-01-22_retro-quest-platform/platform/public/index.html` (97,244 bytes).

- `drawSuiteCover`, `drawStarCover`, `drawCastleCover` and the cover-function block are byte-identical to the original reference. Canvas dimensions and existing rendering calls are retained.
- All inline script contents are byte-identical to base `d07e3db`.
- Exact verified module SHA-256: `94553e423c3d10a050fd46b51872bffe089fd9b099ff0c608f0fcf274ccdb90f` (also locked by landing regression test).
- Everything from `<main class="wrap" id="gameView"` onward is unchanged from base. Existing `playHero`, `playCard`, `buyHero`, logo/back, signup and auth/save/entitlement handlers are preserved.
- No changes under game paths, backend, adapter, security, migrations, service worker, private runtime or proxy. No publishing, remote push, provider operation, actual email/payment, UAT DB writes or owner-card transition.

## Price trace

The reported $1.99 full-game misbinding was not present/reproducible in this checked-out source. The landing uses each element’s own `data-price` SKU; `price(sku)` reads `catalog[sku].display_price`. There is no `closest('.steps')` price binding in this tree. `src/catalog.js` has 799/199 cents, and the actual worker `/api/config` response tested with an isolated in-memory database returns `$7.99` for `port-lucky`, `$1.99` for `port-lucky-walkthrough`, both sales disabled.

The new landing has exactly one full-game `data-price` element, inside preserved `buyHero`, and one walkthrough element. The browser verifies both against the actual worker config at every requested viewport. No speculative JS/backend fix was made. If the private proxy still shows $1.99 for the game, owner should inspect that wrapper/injected binding independently before publication.

## Fonts

Self-hosted the original Google Fonts families/weights, unmodified TTFs, with `font-display: swap`:

- Pixelify Sans 500/700
- Atkinson Hyperlegible 400/700
- VT323 400

Five font files total 352,220 bytes. `public/fonts/README.md` records exact source URLs. Family-specific `*-OFL.txt` files preserve SIL Open Font License 1.1 and copyright notices. Browser tests block external origins and confirm all five faces load locally. No service-worker policy modification.

## Verification

- Original platform suite: **28/28 pass**, before implementation; unchanged-suite rerun recorded in `evidence/landing/baseline-28-tests.txt`.
- Final `node --test tests/platform/*.test.js`: **33/33 pass**, including five new landing regressions; `evidence/landing/node-tests.txt`.
- Actual local Chromium via `node tests/platform/landing-browser.js`: **PASS at 320, 390, 768, 1440 pixels**. No horizontal overflow; enabled homepage/header targets at least 44px high; original canvases painted; local fonts loaded; reduced-motion transition zero; keyboard Enter activates original signup via Play; catalogue anchor and card Play work. Separate synthetic signed-in identity verifies original Play handler enters the actual suite and Back returns home.
- Config uses real worker endpoint on isolated in-memory SQLite. Browser identities/save failures are explicit synthetic fixtures, not proof of provider or real UAT signup. Test server uses an ephemeral local port and closes automatically. Existing 8787/8788 untouched.
- `evidence/landing/browser-results.json` and `browser-run.txt` contain machine-readable and console evidence. Screenshots: `landing-320.png`, `landing-390.png`, `landing-768.png`, `landing-1440.png`. Desktop and mobile screenshots visually inspected for hierarchy, artwork fidelity and clipping. Owner before/after capture remains separate.
- Application/evidence `git diff --check`: clean. Unmodified upstream OFL files retain original CRLF/trailing whitespace; whitespace checks exclude only `public/fonts/*-OFL.txt`.

## Reproduction and remaining work

Source shared cache environment:

```sh
source /opt/hermes-data/hermes/operations/kanban-lifecycle/shared-worker-cache-env.sh
node --test tests/platform/*.test.js
# Browser script requires installed playwright; safely link existing source deps if absent:
ln -s ../retroquests/node_modules node_modules
node tests/platform/landing-browser.js
# Remove only that temporary symlink afterward, not source dependencies.
```

No install was performed. The temporary source dependency symlink is not committed. Owner retains independent review, private wrapper price investigation if still observed, publication, and lifecycle/card closure. This local implementation commit includes this handoff; its exact SHA is returned in the agent’s final report (avoids a self-referential commit hash).
