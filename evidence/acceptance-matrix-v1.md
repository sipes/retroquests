# Delegated local acceptance matrix v1

Task `t_9be9c2e5`; workspace `/opt/hermes-data/workspaces/Strategico-Workspace/apps/retroquests`; branch `platform/retroquests-hardening-v1`; baseline `77423ee3bd8c368c1d4efe887a2ef43a589e0248`.

**These are implementation-worker reruns, NOT the owner's independent acceptance.** Previous worker outputs are retained where useful but do not replace the fresh final reruns below. No provider/Cloudflare remote operation, external write, deployment or Kanban transition occurred. The task was read from the authoritative local Kanban SQLite DB with `mode=ro`, since no `kanban_show` tool was available in this subagent.

## Measured run summary

- Initial predecessor baseline regressions: **4 FAIL / 0 PASS**, retained redacted in `baseline-regressions.txt` (unverified admin, premature signup session, purchaser FK deletion failure, blind saves).
- Final fast tests: **26 PASS / 0 FAIL**, `node-tests-handoff.txt`. Node v26.10.0, real SQLite FK/transactions, deterministic provider mocks; not Wrangler or live providers.
- Fresh Wrangler migrations: **0001 and 0002 applied**, `migrations-handoff.txt`. Previous `.wrangler/final-state` was renamed under ignored `.wrangler/`; this run created a fresh database and seeded it.
- Actual Worker/workerd + local D1 HTTP suite: **8 PASS**, `runtime-handoff-final.txt`.
- Reseeded same final-state before real Chromium suite: **11 PASS**, `browser-handoff-final.txt`; no page errors. Browser external traffic blocked. Inert fixture, abort and delayed-response cases labelled synthetic.
- Actual local D1 FK check: **foreign_keys=1; foreign_key_check empty**, `fk-handoff.txt`.
- Screenshot visual review: actual final `save-conflict.png` visibly says “Conflict — not saved” and retains original garage; `inert-adapter.png` labels “DEVELOPMENT FIXTURES / NO REAL PAYMENT” and shows “Mounts 3; destroys 2”. Eight final synthetic screenshots under `screenshots/`.

## Acceptance mapping

| Card criterion | Delegated status | Grounding / limitations |
|---|---|---|
| 1 Seven-method adapter/catalogue/lifecycle | PASS (local) | Exact keys and response tests; inert browser mount/conflict/account switch/revoke; display prices from config. Out-of-order player responses discarded. Real complete Claude game integration NOT-RUN. |
| 2 Verified admin, atomic proof, HTML/abuse/Turnstile | PASS (prepared local scope) | Unverified admin denied then controlled proof allowed; eight simultaneous actual D1 consumes yield one session; escaping in host UI; durable mocked limits and proof verification. Public widget/approved keys NOT-RUN, intentionally fail closed. |
| 3 Deletion/retained accounting/forward migration | PASS (local) | Real SQLite populated-baseline migration and FK-enabled rollback trigger; actual D1 purchaser deletion readback retains refunded accounting with null email; final D1 FK clean. No provider-side deletion asserted. |
| 4 Honest email outcomes/no token hook | PASS (local) | Missing config 503, no signup cookie/public hook; deterministic provider failures redacted; failed send removes token; mocked acceptance labelled accepted, not delivered. Actual Mailtrap acceptance/inbox NOT-RUN. |
| 5 Checkout/webhook lifecycle/provenance/reconciliation | PASS (local synthetic) | Signed fixtures, concurrent duplicate events, invalid amount/signature, refund-before/after-completion, admin grant survival, revocation, partial/dispute, rollback retry, receipt concurrency/failure visibility. Actual D1 duplicates/refund/provenance tested. Real Stripe/checkout/merchant/tax NOT-RUN. |
| 6 Bounded versioned CAS saves/isolation/legacy | PASS (local) | Real SQLite and actual D1 one-winner CAS; version/UTF-8 bounds; cross-account isolation; reset increments revision; browser explicit conflict reload and network failure. Legacy suite/garage reader retains demo flags. Root recovery clears old closures; no durable offline pending promise. |
| 7 Hints/dependencies/access loss/no DRM claim | PASS (local) | Server rejects unowned hints, dependency enforced, revocation hides access/text; old paid scene game UI tears down. New game/hint pack/cache-policy integration NOT-RUN. Paid root scene assets remain soft-protected. |
| 8 Admin audit/destructive operations/notification truth | PASS (local) | Minimal actor/target/action/time audit and reset/signout checks; revoke/reset confirmation UI preserved; notifications visibly disabled (no fake subscription). Legal/refund/support policy NOT-RUN, explicit release gates. |
| 9 Linux setup/lockfile/bindings/DEV guard/SW/headers | PASS (local) | Locked tooling; fresh local D1; actual static response headers and allowlist SW cache; public DEV_MODE refusal in Node; no dev harness shipped. Production DB/secrets unconfigured; no remote migrations. |
| Required original chapters/portal regression | PASS (two-scene scope) | Real browser original suite goat/ticket/keycard path then granted garage valet/truck/shoe/receipt/demo ending and acknowledged saves. No art/puzzle rewrite. Full game/mobile/end-to-end eight chapters NOT-RUN (Claude-owned). |
| Owner independent review/rerun | NOT-RUN | Owner must inspect final commits and independently rerun before acceptance. No owner-pass claim. |
| Launch/live operational readiness | NOT-RUN | Domain, sandbox/live providers, widget, complete game, legal/support, approved delivery policy, backups/restoration, receipt/manual dispute operations remain gates. |

## Final review defects corrected here

1. `getPlayerState` could apply an older `/api/me` after a newer identity/access result. It now checks generation and latest-request sequence; deterministic out-of-order regression passes.
2. Root polling could undo a completed local logout with delayed player state. Root epoch guard plus an actual delayed-browser-response regression proves the logout remains effective.
3. Explicit server reload could leave prior scene/modal/movement/hint closures alive when user/access fingerprint was unchanged. Recovery now uses full root-state reset, clears drawer/account menu and guards hint callbacks by epoch.
4. A failing save could replace newer in-memory pending progress with its earlier snapshot. Failure retains an existing newer pending snapshot instead. A dedicated overlapping-gameplay/failing-save browser regression passes in the final 11-check output.
5. Receipt-outbox concurrent distinct completion/failure visibility was independently inspected and a new real-SQLite regression added: one attempted receipt, failed/sending exposed for manual reconciliation. No automatic retry policy was invented.

## Commands and encountered failures

Exact successful commands and paths are in `SETUP.md` and the final delegated handoff. Wrangler 4.147.0 rejected the inherited `--vars` suggestion; the first runtime attempt consequently got ECONNREFUSED. Replaced it with the supported absolute `--env-file` plus dotenv loading disabled, after inspecting the installed CLI loader to confirm `.dev.vars` is skipped. The corrected server then passed real health, runtime and browser tests. Raw startup/failed-run logs remain local and are excluded from commits. The arbitrary-Python execute tool was blocked in unattended mode; normal file patch tools were used instead. No test output was synthesized.

The acceptance record is local implementation evidence, not a claim of production or owner acceptance. Final immutable candidate SHA is recorded in the generated local `delegated-result-v1.txt` after scoped commits; this completion record is intentionally not versioned to avoid a self-referential commit SHA. Source, tests, docs, selected safe outputs and screenshots are committed; runtime DB, fixtures and server logs are excluded.

Required review inputs read (unchanged):
- `/opt/strategico/concert/data/concert/project-69/chat-404/generated/retroquests-adaptation-review-v1.txt`
- `/opt/strategico/concert/data/concert/project-69/chat-404/generated/retroquests-decisions-and-hosting-recommendation-v1.txt`
- `/opt/strategico/concert/data/concert/project-69/chat-404/generated/claude-port-lucky-build-brief-v1.txt`

Final user-facing report/contract copies into that generated directory are left to the owner, because this delegated request prohibits external writes. Claude-owned paths remain untouched.
