# Stripe sandbox preparation — proposal, not a deployment

This work is bounded to the linked sandbox worktree. **No Cloudflare Worker/D1, Stripe endpoint, tunnel, DNS, email integration, live sale or public release has been created.** Real Stripe tests are **NOT RUN**: no approved actual keys were supplied and native Stripe CLI is not installed. Missing credentials do not prevent offline code preparation.

## Current contract and isolation

- Hosted Stripe Checkout is built directly by `src/stripe.js`: `mode=payment`, USD price data, full game **799 cents**, optional walkthrough **199 cents**, quantity one, promotions and automatic tax disabled. There is no Stripe Price ID dependency. Customer/session/payment-intent metadata ties purchases to the user and SKU.
- A verified user and all three explicit approval flags plus both keys are required to start Checkout. `/api/config` reports `saleEnabled`; never bypass it with a return query string. `?purchase=success` and `?purchase=cancelled` confer no ownership. The stable seven-method platform API reads `/api/me`; lifecycle refresh/remount observes authoritative changes.
- The second game exists **only in `tests/platform/stripe-sandbox.test.js`**, temporarily installed into the Node process catalog and removed afterwards. It is not a production SKU or asset. No production catalog change is proposed.
- Existing full-game assets are not a protected content-delivery design. **Do not publish `public/`** for payment staging: that would expose the complete game. No `/__uat` assets, harness, seeded sessions or proof endpoint may be deployed.
- UAT runs in another integration worktree on ports **8787/8788**. Never restart, seed, change its configuration/DB, or use mutation tests against it. Tests here use in-memory SQLite or a fresh local `.wrangler/stripe-sandbox-state`, with loopback-only ports **18797/18798**.

## User-operated local provisioning (no external changes)

Run only from an interactive owner terminal, never from chat, a CI log or an agent input tool:

```bash
python3 scripts/provision-stripe-sandbox.py
```

The Python standard-library helper uses `getpass` masked prompts, fails rather than falling back to echoed stdin, and accepts only alphanumeric non-empty `sk_test_...` and `whsec_...` values. `sk_live_`, public keys, whitespace and invalid prefixes are refused. **`whsec_` itself does not encode test/live mode**: the owner must obtain the signing secret for the specifically approved sandbox endpoint. The Stripe CLI listener secret is distinct from a Dashboard endpoint secret; do not interchange them.

It writes a single JSON pair to:

`/opt/hermes-data/hermes/profiles/nicolaas/secrets/retroquests-payment-sandbox/stripe-sandbox.json`

That is outside the business checkout, and outside other profiles. New directories are `0700`, file `0600`, current-user-owned; symlink paths and unsafe writable ancestors are rejected. Both values validate before writing. A same-directory temporary file is flushed/fsynced and atomically published without overwriting an existing file; failure rolls back newly created artifacts. Existing escrow is never overwritten. It prints no credential, traceback or exception detail, even on failures. No actual escrow file has been written during this preparation. Synthetic tests use temporary worktree evidence directories only.

For rotation, stop and follow an owner-approved backup/rotation procedure; do not delete or chmod unrelated paths to force the helper through. A restrictive-umask filesystem/encrypted disk and access policy still matter: plaintext escrow is not a vault and cannot protect against root or another process running as the same owner. This helper does not authenticate the keys with Stripe, upload them or grant deployment approval.

## Minimal Cloudflare staging proposal — explicit approval required

Proposed exact Worker name: **`retroquests-payment-sandbox`**. Proposed separate D1 name: **`retroquests-payment-sandbox-db`**. Both are proposals, **not provisioned resources**. Never reuse the UAT/production D1 ID, bindings, credentials, customer data, or another app's keys.

Prefer **payment/API-only staging**, or a minimal inert staging asset directory. For existing `src/index.js`, bind `ASSETS` to a reviewed directory with only an inert no-game page and normal 404 behavior (the router falls back to `env.ASSETS.fetch`). Exclude root production `public/`, all full-game sources/assets, `/__uat`, `dev/`, tests, credentials, evidence, login proof and any test fixtures. Do not deploy a config that silently inherits the current production asset directory or root Worker name.

Prepared local-only `wrangler.payment-sandbox.jsonc` specifies the following, with an intentionally invalid database-ID placeholder. It must be explicitly passed and reviewed after the isolated D1/account is approved:

- `name: retroquests-payment-sandbox`, `main: src/index.js`, compatibility date consistent with the accepted Worker (`2026-09-01`).
- `ASSETS`: only the dedicated minimal reviewed directory, `run_worker_first: true`; no production game assets.
- `DB`: only the newly approved isolated D1 ID/name, with the existing `migrations` applied to that isolated database. No fixture SQL or existing DB copy.
- `DEV_MODE=0`, `CURRENCY=usd`, `STRIPE_AUTOMATIC_TAX=0`, all approval flags initially `0`. Provider sandbox enablement must explicitly approve the target and each flag; it is not authorization for a live/public launch.
- Test-only auth/account fixtures require a private, owner-approved seeding procedure scoped to that D1; no public seeding/proof routes. A signup/login exercise requires a separately approved test email/Turnstile integration; existing provider protections must stay fail-closed. Do not wire other app mail/provider secrets here.

Only **after** provisioning and explicit approval of that exact config/account/target, the owner can use native Wrangler masked input:

```bash
./node_modules/.bin/wrangler secret put STRIPE_SECRET_KEY \
  --name retroquests-payment-sandbox --config wrangler.payment-sandbox.jsonc
./node_modules/.bin/wrangler secret put STRIPE_WEBHOOK_SECRET \
  --name retroquests-payment-sandbox --config wrangler.payment-sandbox.jsonc
```

These are future owner-operated instructions, **not executed**. The prepared config is not deployable until its isolated D1 placeholder is replaced after approval. Confirm the authenticated Cloudflare account and config name/D1 ID before any external change. Do not paste secret values into commands, shell history, committed `.dev.vars`, logs or this document. Do not pipe the full JSON file to Wrangler (each prompt expects one value). No `wrangler deploy`, remote migration, Stripe account/endpoint setup or DNS operation is authorized by this guide.

Proposed URL shape: `https://retroquests-payment-sandbox.<approved-account-workers-subdomain>.workers.dev/api/stripe/webhook`. The account subdomain is deliberately unresolved; this is NOT a live URL or registered endpoint. Use workers.dev for the smallest stable HTTPS route, avoiding DNS/domain/tunnel changes. The inert `staging/payment-assets/index.html` contains no game. Public HTTPS exposes APIs too: require explicit approval, rate-limit/access review and isolated synthetic users before deploying. A separate native local Stripe listener is an alternative, not yet installed or authenticated.

Dashboard setup after those approvals: sandbox selector → Workbench → Webhooks → Create an event destination → Your account → snapshot format → the eight event types below → approved exact HTTPS URL. Record the API version and install that endpoint's signing secret through the protected flow. No manual Product or Payment Link is required. The redirect implementation does not require a publishable key. Live activation remains separate: merchant verification/bank payouts, approved price/refund/tax policy, approved domain and independently provisioned live secrets.

## Stripe endpoint contract (future approval/setup)

Use the approved sandbox/test account and an approved HTTPS endpoint ending in `/api/stripe/webhook` on the separately approved target. Select **snapshot events**, not thin events. The handler consumes `event.data.object` directly and does not fetch thin-event objects or expand IDs.

Subscribe to exactly the useful handled set:

1. `checkout.session.completed`
2. `checkout.session.async_payment_succeeded`
3. `charge.refunded`
4. `charge.dispute.created`
5. `charge.dispute.updated`
6. `charge.dispute.closed`
7. `charge.dispute.funds_withdrawn`
8. `charge.dispute.funds_reinstated`

The code handles the two Checkout types, `charge.refunded`, and `charge.dispute.*`; other signed types are acknowledged but have no granting logic. `checkout.session.expired` and async failures are not required subscriptions: pending/unpaid sessions never grant. Dispute events and partial refunds mark reconciliation-required without an invented automatic restoration/revocation policy. A full refund revokes only contributions linked to that purchase/payment intent; another game's purchase and independent admin grants survive.

Before enabling sandbox sales, record the **actual approved Stripe API version and snapshot endpoint version** in owner evidence. `createCheckout` currently sends no `Stripe-Version` header and therefore depends on the account default; do not assume a version is pinned by this preparation. Confirm request API and endpoint schema compatibility, or review a version-pinning change before use:

- Checkout session: string `id`, `payment_intent` (not an expanded object), `payment_status=paid`, integer `amount_total`, lower-case `currency=usd`, exact `metadata.user_id` and `metadata.sku`, matching `client_reference_id` if supplied.
- Charge refund: string `payment_intent`, integer positive `amount`, equal `amount_refunded`, `refunded=true` for full refunds.
- Disputes: string `payment_intent`; missing/non-string values are rejected, not inferred from charge IDs.
- Preserve the raw request bytes and `Stripe-Signature`; HMAC timestamp tolerance is 300 seconds. Event IDs are deduplicated atomically with effects. Bad signature/amount/SKU/user/currency/unknown purchase must return 400 and grant nothing.

Do not use generic `stripe trigger` fixtures as proof of fulfillment: they do not match the application's recorded session, metadata and pending purchase. Future real provider acceptance must begin through the approved app Checkout for a verified sandbox user, inspect hosted Checkout, receive the real signed paid snapshot, then refresh `/api/me`, reload/sign in, try a second SKU, exercise refund/disputes and inspect reconciliation. The second-game Node fixture does **not** authorize a public second game. Never use live cards or live-mode keys. Stripe CLI installation/login/listener setup remains a separate owner-authorized task.

## Verified offline checks

```bash
source /opt/hermes-data/hermes/operations/kanban-lifecycle/shared-worker-cache-env.sh
node --test tests/platform/*.test.js
python3 -B tests/platform/provision-stripe-sandbox.test.py -v
```

The Node command includes the seven Python stdlib security tests. It exercises mocked provider form submission, signed synthetic events and real local SQLite schema, not Stripe. New tests cover separate ownership for two games/one user, another-user isolation, second purchase, same-game walkthrough dependency and hint authorization, duplicate delivery, full-refund isolation/late completion, session replacement/reload, unpaid/expired/cancelled/success-query non-grants, invalid metadata/amount/signature and helper lifecycle refresh/remount. No demonstrated production platform gap required a source change.

Measured final preparation results: **49/49 Node tests passed** on independent owner rerun, including four new payment/bridge regressions and the Python runner; **7/7 Python tests passed** independently. The accepted Port Lucky adapter was exercised too: redirect and success query grant nothing; only server webhook ownership changes invalidate the old adapter and appear on remount. The existing isolated Workerd/D1 suite passed **8/8 checks** on specialist ports 18797/18798 and independently on owner ports 18795/18796 using fresh `.wrangler/owner-stripe-state`. Those local runtimes were stopped afterwards. Specialist foreign-key checks passed. Protected tracked `public/`, `src/`, `migrations/` and root Wrangler configuration were byte-compared against the accepted commit with no differences. The prepared staging config passed Wrangler `deploy --dry-run` (NO deployment): only one inert public asset was included and all approval flags remained zero. These results do not claim real Stripe, browser-hosted Checkout, cloud staging or production acceptance.

Local Workerd/D1 tests must use this worktree's existing `dev/platform/wrangler.local.jsonc`, explicit inert `dev/platform/empty.vars`, a **fresh** `.wrangler/stripe-sandbox-state`, port `18797`, inspector `18798`, and `PL_API_BASE=http://127.0.0.1:18797` for `tests/platform/runtime-local.js`. Never run that script with its default UAT-conflicting `8787` base. The runtime script has synthetic local-only mutation tests and does not test real provider Checkout. Logs are retained under `evidence/stripe-sandbox/`; public/UAT/game/production DB bytes remain untouched.
