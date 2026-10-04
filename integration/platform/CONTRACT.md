# Retro Quests platform integration contract v1

Source baseline: `77423ee3bd8c368c1d4efe887a2ef43a589e0248`. Stable module: `public/platform.js`. This implements the seven-method seam in the supplied Claude brief (lines 43–53); it does not implement or edit Claude's game. The root portal currently runs the original two scenes, not `mountPortLucky`.

```js
import { createPlatform, mountPlatformGame } from './platform.js';
const platform = createPlatform({
  requestSignIn: async () => { /* host sign-in UI */ },
  requestPurchase: async sku => { /* host checkout UI */ }
});
// After the completed game is accepted, the host can mount its real export:
// const host = await mountPlatformGame({root, platform, gameId:'port-lucky',
//   mount: mountPortLucky});
// host.destroy() on exit. Do not mount the missing game now.
```

## Exact seven methods

| Method | Promise result / semantics |
|---|---|
| `getPlayerState('port-lucky')` | `{ authenticated, user, entitlements, save }`; `user` null or public `{id,email,name,verified,isAdmin}`; `entitlements` SKU array; `save` null or `{version,data,revision}`. Read-only access state, not a grant. |
| `requestSignIn()` | `void`; invokes host UI, does not manufacture a session. |
| `requestPurchase(sku)` | `void`; invokes host UI/checkout, does not grant locally. |
| `saveGame('port-lucky', {version,data,revision})` | `{acknowledged:true,revision}` only after server acceptance; rejects on transport, server, missing acknowledgement or conflict. |
| `getRevealedHints('port-lucky')` | Array of `{puzzle_id,level,text}`; text can be null when entitlement is lost. |
| `revealHint('port-lucky', puzzleId, level)` | `{puzzle_id,level,text}`; levels 0/1/2, prior level required, server authorization required. |
| `getCatalog()` | Catalogue keyed by SKU, including `name`, `price_cents`, `currency`, `display_price`, `sale_enabled`, `game`, `requires`. Use `display_price` and actual `sale_enabled`. |

The adapter object contains exactly these seven keys. No cookie/provider access in game code. `mountPlatformGame` is an **additive exported lifecycle helper**, not an eighth adapter method. It polls every 5 seconds by default, exposes `refresh()`/`destroy()`, destroys before remount on user-ID or entitlement fingerprint change and clears the supplied root. The game must return `{destroy()}` and release all its own timers/listeners/animations. Poll errors do not themselves mean revocation. Background/host signout should prompt a refresh; lifecycle polling is not synchronous server authorization. The root legacy host also checks on document visibility, uses a separate epoch to discard delayed responses after logout/recovery, clears menu/drawer/modals/movement closures and pending saves on identity/access change, and remounts only through deliberate play.

Out-of-order `/api/me` responses are rejected (`code='STATE_CHANGED'`), as are in-flight save/hint results after a detected access-generation change. A save already committed on the server cannot be undone by client abort. Refresh after sign-in/purchase; redirects or UI success alone do not confirm ownership. Rejected HTTP 409 has `status=409, code='SAVE_CONFLICT'`. Preserve pending snapshots and require a deliberate server reload before recovery. No offline/durable-local pending guarantee is made.

## API/version boundary

`GET /api/config` includes `{catalog,devMode:false,saleEnabled,saveVersion:1}`. `GET /api/me` retains the old `saves` map for safe reading and adds authoritative `save_envelopes`. The adapter consumes only the envelope map.

`PUT /api/save` is the explicit unavoidable v1 write change:

```json
{"game_id":"port-lucky","version":1,"revision":0,"data":{"room":"suite"}}
```

This abbreviated example demonstrates the API envelope, not a valid complete game snapshot. `data` must be a non-array object, `revision` a nonnegative safe integer, `version` exactly 1; the full UTF-8 request must not exceed 65536 bytes. Revision 0 creates only if no row exists; otherwise supply the last returned revision. Atomic CAS produces 409 for stale input. Successful reply includes `{ok:true,acknowledged:true,revision,updated_at}`. Reset increments the persisted revision and leaves a null-data tombstone, preventing ABA reuse of an old revision. An old unversioned blind write now gets 400; it is intentionally not silently converted. `revision?` in the earlier proposed game contract is now mandatory for this backend's writes; game integration must preserve it from player state and acknowledgement.

The platform validates the envelope and bounds, not every game's puzzle schema. `public/legacy-save.js` is the **explicit legacy portal reader**, limited to existing suite/garage snapshots and known original inventory IDs. Migration wraps old data with version 1/revision 1 without rewriting it. `demoDone` and flags remain intact; this candidate still ends at the original garage demo. Unsupported/corrupt snapshots are retained, not automatically reset or overwritten. The reader rejects unsupported versions/rooms and malformed core fields and discards saved hint text/count in favor of server authorization. Claude must own any future chapter/item snapshot schema and old-demo continuation migration; do not run its later snapshots through this two-scene reader.

## Authorization/accounting and delivery

Signup/login require server-verified Turnstile (`hostname`, action `auth`) and actual provider acceptance; public UI/widget provisioning remains gated. No signup session until controlled mailbox proof, no `dev_link`, no magic-link logging. Single-use token/session/verification changes are transactional. Every admin API and visible `isAdmin` requires verified mailbox plus configured allowlist. Sessions are HttpOnly/SameSite=Lax and Secure on HTTPS; non-loopback DEV_MODE is refused. Mutating APIs reject foreign Origin; privileged audit rows contain actor/target/action/time/SKU, not personal payload. Admin destructive UI retains confirmation safeguards.

D1 contributions distinguish purchase source from admin source. Full refunds revoke only that purchase; unrelated contributions survive. Durable revocation blocks late completion; terminal payment-intent tombstones block refund-before-completion revival. Signed completion checks the existing purchase, user/SKU, exact USD amount and payment intent. No arbitrary webhook-created purchase. Partial refunds/disputes remain `reconciliation-required`; existing access is not automatically revoked by a partial refund, and a terminal event before completion blocks automatic grant. There is no approved automatic dispute-restoration policy. Receipt outbox claims at most one send for a purchase in normal concurrent handling; `pending`, `sending`, `failed` are visible in the admin reconciliation API. No automatic receipt retry is implemented, and uncertain `sending` must be manually reconciled before resend. Provider `accepted` never asserts inbox delivery.

Deletion atomically clears personal state, nulls retained purchase user references and removes email logs. Provider-side retention is separate. Hints remain in `src/catalog.js`, server-side. Production `public/` contains neither fixture hint packs nor the dev host. Only manifest/icons are cached; API/auth/admin/game/module/fixtures are not offline-cached. Root paid scene assets are still publicly downloadable (soft protection, not DRM).

## Owned paths and integration gates

Platform owns root portal/admin/SW, backend, migrations, package lock, `public/platform.js`, `public/legacy-save.js`, `dev/platform/`, `tests/platform/`, this `integration/platform/` and local evidence. Strictly unchanged: `public/games/port-lucky/`, `dev/port-lucky/`, `integration/port-lucky/`, `tests/games/port-lucky/`.

No complete game mounting/content, protected delivery policy, Turnstile widget, external provider/domain, legal/support or live checkout readiness is implied. The local inert harness at port 8790 demonstrates the seam only. Owner independent review/rerun must occur before local acceptance; complete-game integration and release approval remain separate gates.
