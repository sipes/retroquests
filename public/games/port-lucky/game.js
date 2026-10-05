// Last Night in Port Lucky — public entry point.
//
//   import { mount } from '/games/port-lucky/game.js';
//   const handle = await mount(containerElement, platformAdapter, { onExit(reason) {} });
//   handle.unmount();
//
// The platform adapter is injected by the host page. Contract: docs/port-lucky-integration.md §2.1
// (getState, subscribe?, signUp, signIn, checkout, save, revealHint, listHints?).
import { Engine } from '../_shared/engine.js';
import { template } from '../_shared/template.js';
import { GAME_ID, SKU_GAME, SKU_WALK, MAX_SCORE, SAVE_VERSION, PAL, ITEMS, PUZZLES, POINTS, rankFor } from './data.js';
import { ROOMS } from './rooms.js';
import { ART, drawPlayer } from './art.js';
import { createScript, CHAPTER_START, migrateSave } from './script.js';
export { GAME_ID, SKU_GAME, SKU_WALK, MAX_SCORE, SAVE_VERSION } from './data.js';

const CLOCK_START = 12 * 60;
export const DEFINITION = {
  GAME_ID, SKU_GAME, SKU_WALK, MAX_SCORE, SAVE_VERSION, PAL, ITEMS, PUZZLES, POINTS, rankFor, ROOMS, ART, drawPlayer, createScript, CHAPTER_START, migrateSave, template,
  startRoom: 'suite', startPos: [150, 160], chapter1DoneFlag: 'leftSuite',
  newGameExtras: { money: 0, quarters: 0 },
  // Chapter 7 wedding countdown: 12 game-minutes at 3 game-seconds per real second (4 real minutes).
  clock: { chapter: 7, start: CLOCK_START, rate: 3, stopFlag: 'ceremonyReady', lateAt: 120,
    label: s => { const m = Math.floor(s / 60), r = s % 60, wall = 48 + Math.floor((CLOCK_START - s) / 60); return `${wall >= 60 ? '4:00' : '3:' + wall} · ${m}:${String(r).padStart(2, '0')} left`; } },
  texts: {
    title: 'Last Night in Port Lucky',
    gate: 'Sign up free to play scene 1. Your saves follow you to any device.',
    placeholder: 'Type a command, e.g. look at goat',
    rotate: 'Port Lucky plays best in landscape, with the room filling your screen.',
    paywall: "Benny's still out there and the wedding is at four. Unlock the full game to keep playing. Your progress is saved.",
    marginLabel: 'Margin at the altar',
    finalPerfect: 'Every point. Every kindness. Dex Morrow, Best Man.',
    finalOther: 'There were things you missed. There always are. Port Lucky will still be here.',
    help: 'Type simple commands: LOOK, LOOK AT GOAT, TAKE TICKET, OPEN MINIBAR, GIVE CRACKERS TO GOAT, USE KEYCARD ON DOOR, TALK TO VALET, INVENTORY. Or click a verb, then click the room.'
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
