# Mop & Galaxy test results

Run: 2026-10-05T18:56:18.185Z · 9/9 scenarios passed · fixture adapter (not the live platform)

| Scenario | Status | Time | Notes |
| --- | --- | --- | --- |
| full-run-deck-officer | pass | 157s | score 250/250, hints 0, margin 232s, actions 113 |
| full-run-with-hints | pass | 159s | score 247/250 with the "Wim" answer, hints used 2, margin 231s |
| free-player-paywall-and-denied-hints | pass | 21s | paywall shown, checkout refused by fixture, entitlements unchanged, paywall persists on reload |
| deaths-retry-restart | pass | 452s | deaths verified: cage-bottle, shelf-collapse, fire-cabinet-alarm, main-door, lick-hose, sweep, hot-duct, corridor-door, thistle-tomato, ilse-hears, ilse-turns, airlock-no-suit, lead-glass, ilse-returns, unclipped, keypad-wrench, cargo-drone, precedent, dorrit-tablet, door-seals, brack-reaches-you, clock |
| chapter-presets | pass | 143s | presets 2–8 seeded as saves and completed |
| save-failure-visible | pass | 3s | failed save shows "Save failed" + Retry; retry succeeds and persists |
| account-change | pass | 25s | signed-out state hands control back to host (onExit) or shows the gate: onExit |
| mobile-layouts | pass | 7s | portrait rotate prompt, landscape side actions, Type + Items sheets, tap-to-use on canvas |
| mount-unmount-and-clicks | pass | 8s | verb clicks, item-on-hotspot clicks, unmount/remount |