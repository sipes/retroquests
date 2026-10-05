// What you sell. Prices are in cents. Add a game by adding its products and hints here.

export const CATALOG = {
  'port-lucky': {
    name: 'Last Night in Port Lucky (full game)',
    description: 'Unlocks every scene after the free one. Yours to keep.',
    price_cents: 799,
    game: 'port-lucky'
  },
  'port-lucky-walkthrough': {
    name: 'Port Lucky walkthrough add-on',
    description: 'Hidden, step-by-step hints for every puzzle.',
    price_cents: 199,
    game: 'port-lucky',
    requires: 'port-lucky'
  },
  'mop-galaxy': {
    name: 'Mop & Galaxy (full game)',
    description: 'Unlocks every scene after the free one. Yours to keep.',
    price_cents: 799,
    game: 'mop-galaxy'
  },
  'mop-galaxy-walkthrough': {
    name: 'Mop & Galaxy walkthrough add-on',
    description: 'Hidden, step-by-step hints for every puzzle.',
    price_cents: 199,
    game: 'mop-galaxy',
    requires: 'mop-galaxy'
  }
};

// Hint text lives on the server so it only reaches players who bought the add-on.
// Each puzzle: [nudge, clue, full solution]. Per-game hint files live in src/games/ (never under public/).
import { PORT_LUCKY_HINTS } from './games/port-lucky-hints.js';
import { MOP_GALAXY_HINTS } from './games/mop-galaxy-hints.js';
export const GAMES = {
  'port-lucky': {
    walkthroughSku: 'port-lucky-walkthrough',
    puzzles: PORT_LUCKY_HINTS
  },
  'mop-galaxy': {
    walkthroughSku: 'mop-galaxy-walkthrough',
    puzzles: MOP_GALAXY_HINTS
  }
};
