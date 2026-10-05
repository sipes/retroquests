// Mop & Galaxy — public entry point.
//
//   import { mount } from '/games/mop-galaxy/game.js';
//   const handle = await mount(containerElement, platformAdapter, { onExit(reason) {} });
//   handle.unmount();
//
// The platform adapter is injected by the host page. Contract: docs/port-lucky-integration.md §2.1
// (getState, subscribe?, signUp, signIn, checkout, save, revealHint, listHints?). Same engine as Port Lucky.
import { Engine } from '../_shared/engine.js';
import { template } from '../_shared/template.js';
import { GAME_ID, SKU_GAME, SKU_WALK, MAX_SCORE, SAVE_VERSION, PAL, ITEMS, PUZZLES, POINTS, rankFor } from './data.js';
import { ROOMS } from './rooms.js';
import { ART, drawPlayer } from './art.js';
import { createScript, CHAPTER_START, migrateSave, CLOCK_START } from './script.js';
export { GAME_ID, SKU_GAME, SKU_WALK, MAX_SCORE, SAVE_VERSION } from './data.js';

export const DEFINITION = {
  GAME_ID, SKU_GAME, SKU_WALK, MAX_SCORE, SAVE_VERSION, PAL, ITEMS, PUZZLES, POINTS, rankFor, ROOMS, ART, drawPlayer, createScript, CHAPTER_START, migrateSave, template,
  startRoom: 'closet', startPos: [150, 160], chapter1DoneFlag: 'leftDeck9',
  newGameExtras: {},
  // Chapter 8: four real minutes to the jurisdiction line (1 game second per real second). Stops when the captain wakes.
  clock: { chapter: 8, start: CLOCK_START, rate: 1, stopFlag: 'okonjoAwake', lateAt: 60,
    label: s => { const m = Math.floor(s / 60), r = s % 60; return `Line in ${m}:${String(r).padStart(2, '0')}`; } },
  texts: {
    title: 'Mop & Galaxy',
    gate: 'Sign up free to play scene 1. Your saves follow you to any device.',
    placeholder: 'Type a command, e.g. talk to mop',
    rotate: 'Mop & Galaxy plays best in landscape, with the room filling your screen.',
    paywall: 'Two thousand colonists are asleep and a floor-polishing robot signed them away. Unlock the full game to keep playing. Your progress is saved.',
    marginLabel: 'Margin at the line',
    finalPerfect: 'Every point. Every floor. Wim Tarragon, Deck Officer (Custodial).',
    finalOther: 'There were things you missed. Thistle will know. The Hyacinth will still be here.',
    help: 'Type simple commands: LOOK, LOOK AT MOP, TAKE COVERALL, USE COIN ON VENDING MACHINE, GIVE ROSTER TO THISTLE, TALK TO VANE, INVENTORY. Or click a verb, then click the room.'
  }
};

let cssLoaded = false;
function ensureCss() {
  if (cssLoaded || document.querySelector('link[data-rq-css]')) { cssLoaded = true; return; }
  const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = new URL('../_shared/game.css', import.meta.url).href; l.setAttribute('data-rq-css', '1'); document.head.appendChild(l); cssLoaded = true;
}
export async function mount(container, adapter, options = {}) {
  if (!container) throw new Error('mount(container, adapter): container is required');
  if (!adapter || typeof adapter.getState !== 'function') throw new Error('mount(container, adapter): adapter.getState() is required');
  ensureCss();
  const engine = new Engine(DEFINITION, container, adapter, options);
  await engine.mount();
  return { unmount: () => engine.unmount(), refresh: () => engine.onPlatformChange(), get state() { return engine.game ? JSON.parse(JSON.stringify(engine.game)) : null; }, engine };
}
