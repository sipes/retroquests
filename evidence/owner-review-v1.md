# Owner independent local acceptance — Retro Quests v1

Task t_9be9c2e5. Owner Nicolaas. Reserved workspace /opt/hermes-data/workspaces/Strategico-Workspace/apps/retroquests, branch platform/retroquests-hardening-v1, base 77423ee3bd8c368c1d4efe887a2ef43a589e0248. Final SHA recorded in owner-status-v1.txt after commits.

Implementation was delegated through two sequential native engineering runs. Both reached their execution-iteration limits after real implementation/testing, without committing. Owner read the final backend/schema/adapter, original portal diff, provider/SW/admin/config changes and contract; independently reran the candidate instead of accepting those self-reports. Owner made two narrow review corrections: require verified_at in admin target-detail isAdmin; release removed modal Escape listeners during account teardown. Owner added privilege-detail and signed currency/user/SKU/purchase/delayed-payment regressions. Main code implementation remained delegated. A third small delegation was refused by one-shot budget; owner finished verification/docs/local commits directly.

Independent measured results (all exit 0):
- node --test tests/platform/*.test.js: 28 passed, 0 failed, 0 skipped. Real SQLite with FK enforcement/transactions and deterministic provider mocks. Outputs owner-node-tests-v1.txt. Expected failure-injection cases emit only generic redacted error lines.
- Fresh local Wrangler 0001 + 0002 migrations: passed, owner-migrations-v1.txt. Original local state preserved by rename to ignored .wrangler/pre-owner-state; no remote operations.
- node tests/platform/runtime-local.js: 8 actual Worker/workerd + local D1 checks passed, owner-runtime-tests-v1.txt.
- Reseeded synthetic database; node tests/platform/browser-local.js: 11 actual Chromium checks passed, no page errors, owner-browser-tests-v1.txt. Outbound browser traffic blocked; controlled mailbox proof is seeded synthetic fixture, not real delivery. Inert stub/conflict/aborted-save/delayed-state cases labelled synthetic.
- Actual local D1 PRAGMA foreign_keys=1; foreign_key_check returned empty, owner-fk-v1.txt.
- git diff --check: clean. Claude-owned paths unchanged.

Owner PASS / FAIL / NOT-RUN matrix
1 PASS local: exact seven-method adapter, response/error/CAS semantics, catalogue prices, account/access teardown and inert mount/destroy/remount. Complete Claude module integration NOT-RUN.
2 PASS local/prepared: unverified privileged signup denied, controlled mailbox proof admin allowed, simultaneous proof one winner, provider-mocked signup/login, scoped durable abuse limits and fail-closed server Turnstile preparation. Production/widget keys NOT-RUN; portal honestly unavailable without proof.
3 PASS local: populated baseline forward migration, purchaser deletion accounting retained/null reference, atomic failure rollback and FK checks. Stripe data deletion NOT-RUN/separate.
4 PASS mocked/local: missing mail config 503, no token capture/logging hook, provider failure honest/redacted and accepted versus failed audit. Real Mailtrap/inbox delivery NOT-RUN.
5 PASS signed synthetic/local: signature, amount/currency/user/SKU/purchase validation, delayed completion, duplicate and reordered effects, terminal refund tombstone, late completion no revival, independent admin/purchase contributions, durable revoke, partial/dispute reconciliation and receipt uncertainty visible. Real Stripe/merchant/tax NOT-RUN.
6 PASS local: bounded UTF-8 version1 JSON, CAS acknowledgment, stale revision409, multi-device one winner/cross-account isolation, compatibility reader, reset revision, pending save conflict/failure/newer snapshot retained. No offline durable progress claim.
7 PASS local: server-owned paid hints, entitlement/dependency checks, access loss teardown. Root paid scenes remain public/soft-protected; full module and approved delivery/caching policy NOT-RUN.
8 PASS local: sensitive admin audit actor/time/action/target, grant/revoke/reset/signout, deletion and disabled notification truth. Legal/refund/privacy/support NOT-RUN/release gate.
9 PASS local: lockfile, reproducible Linux instructions, isolated test config, placeholder production DB, actual runtime headers/controlled SW caching/public DEV guard. Production provisioning/deployment NOT-RUN.
Original suite/garage and portal: PASS desktop browser command progression through free paywall and privately granted garage/demo ending. Eight-chapter/mobile full-game acceptance remains Claude-owned NOT-RUN, not claimed.

Visual evidence inspected directly: screenshots/save-conflict.png shows Conflict — not saved and preserves retro garage; screenshots/inert-adapter.png explicitly says DEVELOPMENT FIXTURES / NO REAL PAYMENT and Mounts 3; destroys 2. Eight synthetic screenshots retained privately; they are evidence, not public game artwork.

Known boundaries, not local failures: root game is still original two-scene demo; sale/notifications disabled; no Turnstile widget or actual sender/merchant/domain verified; no launch/legal approval; no automatic receipt resend/dispute restoration policy or backup restoration acceptance. Sessions remain baseline180days (HTTPS Secure + HttpOnly + SameSite=Lax); shorter privileged-session policy is a future release consideration, not claimed implemented. No public deployment/push/live mails/charges/domain spending/provider or NAIS changes.

Owner commands reproduce SETUP.md using final-state, dev/platform/wrangler.local.jsonc and explicit empty.vars --env-file; both servers bound127.0.0.1 and are stopped before handoff. Source and evidence committed locally only; preserve workspace for Atlas t_2dab68fc and Claude integration. Source paths: backend/root portal/admin/SW, migrations, adapter/compatibility, dev/platform, tests/platform, integration/platform. No Claude-owned paths changed.
