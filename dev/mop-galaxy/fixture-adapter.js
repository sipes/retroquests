// LOCAL DEV FIXTURE ADAPTER (Mop & Galaxy) — never deploy. Thin wrapper over dev/_shared/fixture-adapter.js.
// Hint text is imported from src/ (server-only in production), never from public/.
import { createFixtureAdapter as create } from '../_shared/fixture-adapter.js';
import { MOP_GALAXY_HINTS } from '../../src/games/mop-galaxy-hints.js';
const CATALOG = {
  'mop-galaxy': { name: 'Mop & Galaxy (full game)', price_cents: 799, game: 'mop-galaxy', requires: null },
  'mop-galaxy-walkthrough': { name: 'Mop & Galaxy walkthrough add-on', price_cents: 199, game: 'mop-galaxy', requires: 'mop-galaxy' }
};
export function createFixtureAdapter(initial = 'free') { return create(initial, { gameId: 'mop-galaxy', skuGame: 'mop-galaxy', skuWalk: 'mop-galaxy-walkthrough', catalog: CATALOG, hints: MOP_GALAXY_HINTS }); }
