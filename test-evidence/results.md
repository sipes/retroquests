# Port Lucky test results

Run: 2026-10-05T18:55:06.616Z · 9/9 scenarios passed · fixture adapter (not the live platform)

| Scenario | Status | Time | Notes |
| --- | --- | --- | --- |
| full-run-dolphin | pass | 249s | score 250/250, hints 0, margin 296s, actions 100 |
| full-run-cash-with-hints | pass | 252s | score 250/250 on the cash route, hints used 2, margin 296s |
| free-player-paywall-and-denied-hints | pass | 11s | paywall shown, checkout refused by fixture, entitlements unchanged, paywall persists on reload |
| deaths-retry-restart | pass | 351s | deaths verified: cocktail, karaoke-no-token, duane-trophy, alley-bottle, gulls, hammer-on-glass, call-mom, breakwater, diesel, dinghy-no-rope, winch, hip-flask, bridal-tent, clock |
| old-save-migration | pass | 11s | v1 saves (mid-demo and demo-complete) migrate to v2 and continue |
| save-failure-visible | pass | 3s | failed save shows "Save failed" + Retry; retry succeeds and persists |
| account-change | pass | 16s | signed-out state hands control back to host (onExit) or shows the gate: onExit |
| mobile-layouts | pass | 5s | portrait rotate prompt, landscape side actions, Type + Items sheets, tap-to-use on canvas |
| mount-unmount-and-clicks | pass | 5s | verb clicks, item-on-hotspot clicks, unmount/remount |