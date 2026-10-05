// Generated Scene 1 only; scripts/extract-mop-free-scene.py --check.
import {Engine} from './engine.js';
import {template} from './template.js';
import {GAME_ID, SKU_GAME, SKU_WALK, MAX_SCORE, SAVE_VERSION, PAL, ITEMS, PUZZLES, POINTS} from './data.js';
import {ROOMS} from './rooms.js';
import {ART, drawPlayer} from './art.js';
import {createScript, CHAPTER_START, migrateSave} from './script.js';
import {validDemoSave} from './save.js';
export {GAME_ID, SKU_GAME, SKU_WALK, MAX_SCORE, SAVE_VERSION} from './data.js';
export const DEFINITION = {
  demo:true, validateSave:validDemoSave,
  GAME_ID, SKU_GAME, SKU_WALK, MAX_SCORE, SAVE_VERSION, PAL, ITEMS, PUZZLES, POINTS,
  ROOMS, ART, drawPlayer, createScript, CHAPTER_START, migrateSave, template,
  rankFor:()=>'Scene 1 complete', startRoom:'closet', startPos:[150,160], chapter1DoneFlag:'leftDeck9', clock:null,
  texts:{title:'Mop & Galaxy', gate:'Sign up free to save your progress.', placeholder:'Type a command, e.g. talk to mop', rotate:'Mop & Galaxy plays best in landscape, with the room filling your screen.', paywall:'Two thousand colonists are asleep and a floor-polishing robot signed them away. Unlock the full game to keep playing. Check your save status before leaving.', help:'Type simple commands: LOOK, LOOK AT MOP, TAKE COVERALL, USE COIN ON VENDING MACHINE, INVENTORY. Or click a verb, then click the room.'}
};
export async function mount(container, adapter, options={}) {
  if (!container || typeof adapter?.getState !== 'function') throw new Error('Container and adapter required.');
  if (!document.querySelector('link[data-mop-css="demo"]')) {
    const link=document.createElement('link'); link.rel='stylesheet'; link.href=new URL('./game.css',import.meta.url).href; link.dataset.mopCss='demo'; document.head.appendChild(link);
  }
  const engine=new Engine(DEFINITION,container,adapter,options);
  try { await engine.mount(); } catch (error) { engine.unmount({save:false}); throw error; }
  return {unmount:()=>engine.unmount(),refresh:()=>engine.onPlatformChange(),get state(){return engine.game?structuredClone(engine.game):null;},engine};
}
