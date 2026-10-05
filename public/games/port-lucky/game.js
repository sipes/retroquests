// Last Night in Port Lucky — public entry point.
//
//   import { mount } from '/games/port-lucky/game.js';
//   const handle = await mount(containerElement, platformAdapter, { onExit(reason) {} });
//   ...
//   handle.unmount();
//
// The platform adapter is injected by the host page (the arcade shell, or dev/port-lucky for local work).
// Required shape (all async unless noted) — see docs/port-lucky-integration.md for the full contract:
//   getState()                      -> { user|null, entitlements: string[], save: object|null, catalog: { [sku]: { name, price_cents } } }
//   subscribe(cb)  (optional, sync)  -> unsubscribe(); cb() is called whenever user/entitlements may have changed
//   signUp(), signIn()              -> resolve when the platform's own UI has finished (state may or may not have changed)
//   checkout(sku)                   -> resolve/navigate; never resolves "paid" by itself — ownership comes back via getState()
//   save(gameId, data, { keepalive }) -> resolve on success, reject on failure (the game shows the failure and a retry button)
//   revealHint(gameId, puzzleId, level) -> { text } ; reject with { status: 402 } when not owned
//   listHints(gameId)  (optional)    -> { revealed: [{ puzzle_id, level, text|null }], count }
import { Engine } from './engine.js';
export { GAME_ID, SKU_GAME, SKU_WALK, MAX_SCORE, SAVE_VERSION } from './data.js';

let cssLoaded = false;
function ensureCss() {
  if (cssLoaded || document.querySelector('link[data-pl-css]')) { cssLoaded = true; return; }
  const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = new URL('./game.css', import.meta.url).href; l.setAttribute('data-pl-css', '1'); document.head.appendChild(l); cssLoaded = true;
}
export async function mount(container, adapter, options = {}) {
  if (!container) throw new Error('mount(container, adapter): container is required');
  if (!adapter || typeof adapter.getState !== 'function') throw new Error('mount(container, adapter): adapter.getState() is required');
  ensureCss();
  const engine = new Engine(container, adapter, options);
  await engine.mount();
  return {
    unmount: () => engine.unmount(),
    refresh: () => engine.onPlatformChange(),
    get state() { return engine.game ? JSON.parse(JSON.stringify(engine.game)) : null; },
    engine
  };
}
