// LOCAL DEV FIXTURE ADAPTER (Port Lucky) — never deploy. Thin wrapper over dev/_shared/fixture-adapter.js.
// Hint text is imported from src/ (server-only in production), never from public/.
import { createFixtureAdapter as create } from '../_shared/fixture-adapter.js';
import { PORT_LUCKY_HINTS } from '../../src/games/port-lucky-hints.js';
const CATALOG = {
  'port-lucky': { name: 'Last Night in Port Lucky (full game)', price_cents: 799, game: 'port-lucky', requires: null },
  'port-lucky-walkthrough': { name: 'Port Lucky walkthrough add-on', price_cents: 199, game: 'port-lucky', requires: 'port-lucky' }
};
export function createFixtureAdapter(initial = 'free') { return create(initial, { gameId: 'port-lucky', skuGame: 'port-lucky', skuWalk: 'port-lucky-walkthrough', catalog: CATALOG, hints: PORT_LUCKY_HINTS }); }
