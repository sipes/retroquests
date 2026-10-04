# Retro Quests — Linux local candidate setup

This branch is a **local review candidate**, not a public launch. It preserves the vanilla portal and the suite/garage prototype; the complete Claude game has not been integrated. Nothing below provisions Cloudflare, sends real mail, uses real Stripe, purchases a domain or deploys. Do not run the historical `deploy`, `db:migrate` (remote) or `logs` npm scripts for this review.

## Prerequisites and isolation

Verified here: Linux, Node v26.10.0 (includes `node:sqlite`), Wrangler 4.147.0 and Playwright 1.63.0, using the committed lockfile. Use Node 26 for the SQLite tests. On AI00:

```bash
cd /opt/hermes-data/workspaces/Strategico-Workspace/apps/retroquests
source /opt/hermes-data/hermes/operations/kanban-lifecycle/shared-worker-cache-env.sh
export WRANGLER_SEND_METRICS=false
export CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV=false
npm ci
node --test tests/platform/*.test.js
```

Dependencies are project-local and locked; shared caches/toolchains remain managed. `npm ci` needs package-registry access if the cache is empty. It is not needed again for the installed candidate. Do not read `.dev.vars`, provider credentials or real user databases. Use **only** `dev/platform/wrangler.local.jsonc` for these tests. Its `DB` is local and its webhook key is an openly synthetic fixture, not a provider secret. `ASSETS` serves only `public/`; the inert harness and test data stay outside it.

## Fresh local D1 and fixture seeding

Stop any previous local server before replacing its state. If `.wrangler/final-state` already exists, rename it to an unused backup path under `.wrangler/` first (do not reuse a partially tested DB). Then:

```bash
./node_modules/.bin/wrangler d1 migrations apply retro-quest-db --local \
  --config dev/platform/wrangler.local.jsonc --persist-to .wrangler/final-state
node tests/platform/seed-local.js
./node_modules/.bin/wrangler d1 execute retro-quest-db --local \
  --config dev/platform/wrangler.local.jsonc --persist-to .wrangler/final-state \
  --file evidence/local-fixture.sql
```

The seed is destructive **only to this synthetic local DB**; it removes local test users/accounting and recreates synthetic identities, sessions and hashed mailbox proof. Never execute it remotely. The fixture SQL is generated and not committed. The forward migration changes retained purchases to nullable `user_id` with `ON DELETE SET NULL`, adds the contribution ledger, terminal payment tombstones, audit, outbox, abuse windows and versioned CAS saves. Node tests additionally migrate a populated baseline database with real FK enforcement.

## Start the real local Worker and inert harness

In two terminals, from the repository root:

```bash
export WRANGLER_SEND_METRICS=false CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV=false
./node_modules/.bin/wrangler dev --local \
  --config dev/platform/wrangler.local.jsonc --ip 127.0.0.1 --port 8787 \
  --persist-to .wrangler/final-state \
  --env-file /opt/hermes-data/workspaces/Strategico-Workspace/apps/retroquests/dev/platform/empty.vars
```

```bash
node dev/platform/server.js
```

Wrangler 4.147.0 has **no `--vars` option**. The explicit `--env-file` skips `.dev.vars` loading; disabling dotenv loading prevents host environment secrets being imported. The absolute file above is inert. If using a different checkout, substitute its absolute path. No login or real database ID is needed. `DEV_MODE=1` on any non-loopback origin is rejected; it no longer fakes payments or logs emails even locally.

Verify readiness rather than waiting blindly:

```bash
curl --fail http://127.0.0.1:8787/api/config
curl --fail --output /dev/null http://127.0.0.1:8790
node tests/platform/runtime-local.js
```

Runtime tests consume the controlled single-use admin proof. **Reseed before browser tests** with the three seed commands above (not migrations). Both tests target the same `.wrangler/final-state` DB.

## Actual browser verification

The installed managed Chromium used here is `/home/openclaw/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`. Set `RETRO_CHROMIUM` to another approved installed executable if necessary. If no browser exists, install into the managed shared cache, not the repository (and report the resulting exact path):

```bash
export PLAYWRIGHT_BROWSERS_PATH=/opt/hermes-data/hermes/cache/shared-workers/playwright
./node_modules/.bin/playwright install chromium
# Set RETRO_CHROMIUM to the installed chrome executable under that cache.
node tests/platform/browser-local.js
./node_modules/.bin/wrangler d1 execute retro-quest-db --local \
  --config dev/platform/wrangler.local.jsonc --persist-to .wrangler/final-state \
  --command 'PRAGMA foreign_keys; PRAGMA foreign_key_check;'
```

Browser routing blocks non-loopback network requests, including fonts/providers. Tests use synthetic identities and overwrite private screenshots in `evidence/screenshots/`. They exercise real local APIs and original puzzles; the inert adapter and aborted-save/delayed-response cases are explicitly synthetic. Node tests mock provider fetch; they are not live-provider tests. Stop the two local server processes after testing. Do not commit `.wrangler/`, `node_modules/`, fixture SQL or server logs.

## Configuration and release gates — not provisioning instructions

`wrangler.jsonc` is an unprovisioned production template: `DB.database_id=REPLACE_WITH_YOUR_DATABASE_ID`, `ASSETS=public/`, `DEV_MODE=0`, USD, automatic tax off, and all three approval flags off. A separately approved test Worker/D1 and production Worker/D1 must have distinct bindings/secrets; never share NAIS marketing/Concert credentials. Required future configuration includes scoped Stripe secret/webhook keys, Mailtrap token and approved sender, dedicated Turnstile secret/hostname and a real host widget producing an `auth` proof. The current portal does not load a Turnstile widget: signup/login deliberately show an honest unavailable response rather than fail open. No public proof-capture endpoint exists.

Sales require `CONTENT_APPROVED=1`, `PROVIDER_APPROVED=1`, `RELEASE_APPROVED=1`, both Stripe keys, USD and no automatic tax. Exact approved prices are 799 cents / 199 cents. Tax, promotions or currency changes need a new reviewed policy and matching validation; do not enable tax with this candidate. Checkout returns do not grant ownership; signed webhooks do.

Before release: independently rerun local acceptance; integrate and accept Claude's full game and server-only hint pack; approve content delivery/cache policy; configure and verify dedicated provider sandbox flows; confirm Strategico US LLC merchant permissions; approve terms/privacy/refunds/support and retention; purchase/verify the proposed domain only with approval; complete backup/restore and operational reconciliation tests. No legal policy, address, domain availability or launch readiness is asserted here.

Account deletion removes personal local records atomically while retaining detached minimal financial records. Stripe retention is separate. Partial refunds/disputes and pending/sending/failed receipts are visible at `/api/admin/reconciliation`; policy/manual recovery remains a release gate. `sending` can mean a crashed/uncertain provider call: do not blindly resend it. Provider `accepted` is not inbox delivery. Paid scenes in root HTML remain soft-protected. Offline progress is not promised; service-worker caching is limited to public icons/manifest.

See `integration/platform/CONTRACT.md` and `evidence/acceptance-matrix-v1.md` for the exact boundary and measured results.
