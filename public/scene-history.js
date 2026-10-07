// Versioned bounded gameplay-only history. No purchases, entitlement or clue text.
export const HISTORY_VERSION = 1;
export const HISTORY_BYTES = 48000;
const clone = value => JSON.parse(JSON.stringify(value));
const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const freeze = v => { if (object(v) || Array.isArray(v)) { Object.values(v).forEach(freeze); Object.freeze(v); } return v; };
const bytes = v => new TextEncoder().encode(JSON.stringify(v)).length;
const SAVE_BYTES = 60000; // Leave room for the server's 64KiB request envelope.
function safeValues(v, depth=0) {
  if(depth>8)return false;
  if(v===null || typeof v==='boolean' || typeof v==='string')return true;
  if(typeof v==='number')return Number.isFinite(v);
  if(Array.isArray(v))return v.every(x=>safeValues(x,depth+1));
  return object(v) && Object.entries(v).every(([k,x])=>!['__proto__','constructor','prototype','history','checkpoint'].includes(k) && safeValues(x,depth+1));
}
export function gameplaySnapshot(game) {
  const snap = clone(game);
  delete snap.checkpoint; delete snap.history;
  return snap;
}
function validStart(s, chapter, game, c) {
  return object(s) && safeValues(s) && !s.history && !s.checkpoint && s.chapter === chapter &&
    (s.ownerId || null) === (game.ownerId || null) && Object.hasOwn(c.rooms,s.room) &&
    (!c.roomChapter || c.roomChapter[s.room] === chapter) && Array.isArray(s.inv) &&
    s.inv.every(id => Object.hasOwn(c.items,id)) && object(s.flags) && object(s.scored) &&
    Number.isFinite(s.score) && s.score >= 0 && s.score <= 250 &&
    ['money','quarters'].every(k=>s[k] == null || (Number.isInteger(s[k]) && s[k]>=0)) &&
    (s.flags.tokens == null || (Number.isInteger(s.flags.tokens) && s.flags.tokens>=0)) &&
    Number.isFinite(s.px) && s.px >= 0 && s.px <= 320 && Number.isFinite(s.py) && s.py >= 0 && s.py <= 180 &&
    [1,-1].includes(s.dir) && (s.clock == null || (Number.isFinite(s.clock) && s.clock >= 0)) && s.done === false;
}
export function validHistory(h, game, c) {
  try {
    if (!object(h) || h.version !== HISTORY_VERSION || h.gameId !== c.id || h.ownerId !== (game.ownerId || null) ||
        !object(h.starts) || !Array.isArray(h.completed) || new TextEncoder().encode(JSON.stringify(h)).length > HISTORY_BYTES) return false;
    const ns=Object.keys(h.starts).map(Number), limit=Object.keys(c.scenes).length;
    return ns.length <= limit && ns.every(n => Number.isInteger(n) && n >= 1 && n <= limit && n <= game.chapter && validStart(h.starts[n],n,game,c)) &&
      new Set(h.completed).size === h.completed.length && h.completed.every(n => ns.includes(n) && (n < game.chapter || (game.done && n === game.chapter)));
  } catch { return false; }
}
export function captureScene(game, c) {
  if (game.history && !validHistory(game.history,game,c)) throw new Error('Scene history is invalid; retained without replacement. Reload or contact support.');
  const h=game.history ? clone(game.history) : {version:HISTORY_VERSION,gameId:c.id,ownerId:game.ownerId || null,starts:{},completed:[]};
  const n=game.chapter;
  if (!h.starts[n]) h.starts[n]=gameplaySnapshot(game);
  // A transition is evidence only for starts actually recorded in this timeline.
  h.completed=Object.keys(h.starts).map(Number).filter(i=>i<n);
  if (!validHistory(h,game,c)) throw new Error('Scene checkpoint exceeds the supported history contract.');
  const cp=clone(h.starts[n]);
  if(bytes({...game,history:h,checkpoint:cp})>SAVE_BYTES)throw new Error('Scene save exceeds the supported size. Current progress retained; contact support.');
  game.history=freeze(h); game.checkpoint=freeze(cp);
}
export function sceneProgress(game,c) {
  const valid=game.history && validHistory(game.history,game,c);
  const last=game.chapter;
  return Object.entries(c.scenes).filter(([n])=>Number(n)<=last).map(([key,s])=>{
    const chapter=Number(key), completed=chapter<last || ((game.done || (last===1 && c.completedFlag && game.flags[c.completedFlag])) && chapter===last);
    return {chapter,name:s.name || `Scene ${chapter}`,state:completed?'completed':'current',available:!!(valid && game.history.starts[chapter])};
  });
}
function identity(e) {return JSON.stringify([e.account?.id,e.account?.verified,!!e.ent?.game]);}
function checkOwner(e) {
  if (e.destroyed || !e.account?.verified || !e.game || e.game.ownerId !== e.account.id) throw new Error('Player access changed. Reload your game.');
}
export function saveGameplay(e,c,keepalive) {
  clearTimeout(e.saveTimer);e.saveTimer=null;
  if (e.rewindPending || e.destroyed || !e.account || !e.game) return Promise.resolve();
  const data=clone(e.game), owner=e.account.id, token=identity(e);
  const run=async()=>{
    if (e.destroyed || identity(e)!==token || data.ownerId!==owner) throw new Error('Player access changed.');
    e.setSaveState('saving');
    try {const ack=await e.adapter.save(c.id,data,{keepalive:!!keepalive,ownerId:owner});
      if (!ack || !Number.isInteger(ack.updated_at)) throw new Error('Save was not acknowledged');
      e.sceneOrdinaryError=null;if (!e.destroyed && identity(e)===token) e.setSaveState('saved');
    } catch(error) {e.sceneOrdinaryError=error;e.lastSaveError=error;if (!e.destroyed && identity(e)===token)e.setSaveState('failed');throw error;}
  };
  // Ordinary writes AND unload writes share the drain barrier. A rewind cannot
  // run until every dispatched old-timeline write has settled.
  const previous=e.sceneSaveQueue || Promise.resolve();
  const result=keepalive ? run() : previous.then(run);
  e.sceneSaveQueue=Promise.allSettled([previous,result]).then(()=>{});
  return result.catch(()=>{}); // existing UI retry contract; rewind checks failure
}
export async function rewindScene(e,chapter,c) {
  if (e.rewindPending) throw new Error('A scene reset is already pending.');
  checkOwner(e);
  const old=e.game, token=identity(e), h=old.history;
  if (!validHistory(h,old,c) || !h.starts[chapter] || chapter>old.chapter || ((chapter>1 || old.chapter>1) && !e.ent.game)) throw new Error('Exact scene-start history unavailable. Reload or contact support; no progress was reset.');
  e.rewindPending=true;e.paused=true;clearTimeout(e.saveTimer);e.saveTimer=null;
  try {
    await Promise.allSettled([...(e.sceneHintWork || [])]);
    await (e.sceneSaveQueue || Promise.resolve());
    checkOwner(e);if (identity(e)!==token || e.game!==old)throw new Error('Player access changed.');
    if (e.sceneOrdinaryError)throw e.sceneOrdinaryError;
    const history=clone(h);
    for (const n of Object.keys(history.starts))if(Number(n)>chapter)delete history.starts[n];
    history.completed=history.completed.filter(n=>n<chapter);
    const next={...clone(h.starts[chapter]),ownerId:e.account.id,done:false,hintsUsed:old.hintsUsed,revealed:clone(old.revealed || {}),history,checkpoint:clone(h.starts[chapter])};
    if(bytes(next)>SAVE_BYTES)throw new Error('Scene reset exceeds the supported save size.');
    e.setSaveState('saving');
    const ack=await e.adapter.save(c.id,next,{keepalive:false,ownerId:e.account.id});
    if (!ack || !Number.isInteger(ack.updated_at))throw new Error('Save was not acknowledged');
    checkOwner(e);if(identity(e)!==token || e.game!==old)throw new Error('Player access changed.');
    next.history=freeze(next.history);next.checkpoint=freeze(next.checkpoint);
    e.game=next;e.clearTransient();e.lastSnap=null;e.clearOverlays();e.lastTick=globalThis.performance.now();
    e.renderInv();e.updateHud();e.updateClockUI();e.setSaveState('saved');e.script.onRestart(chapter);
    return next;
  } catch(error) {e.lastSaveError=error;if(!e.destroyed && identity(e)===token)e.setSaveState('failed');throw error;}
  finally {e.rewindPending=false;e.paused=false;e.lastTick=globalThis.performance.now();}
}
export function installSceneRuntime(e,c) {
  e.sceneConfig=c;
  e.sceneHintWork=new Set();
  const trackHint=fn=>{if(e.rewindPending || e.destroyed)return Promise.resolve();const work=Promise.resolve().then(fn);e.sceneHintWork.add(work);work.then(()=>e.sceneHintWork.delete(work),()=>e.sceneHintWork.delete(work));return work;};
  const load=e.loadHints;if(load)e.loadHints=(...args)=>trackHint(()=>load.apply(e,args));
  const confirm=e.confirmReveal;if(confirm)e.confirmReveal=(p,i,fn)=>confirm.call(e,p,i,()=>trackHint(fn));
  e.snapshot=()=>gameplaySnapshot(e.game);
  e.setCheckpoint=()=>captureScene(e.game,c);
  e.flushSave=keepalive=>saveGameplay(e,c,keepalive);
  e.rewindScene=n=>rewindScene(e,n,c);
  e.restartScene=()=>showSceneConfirmation(e,e.game.chapter,c);
  // Stop queued actions, timer advancement and parser/canvas input throughout
  // a durable reset. Keep the old object usable until acknowledgement arrives.
  for(const method of ['persist','act','combine','parse','onCanvasClick','onCanvasTap','render','tickClock']) {
    const original=e[method];if(original)e[method]=function(...args){if(this.rewindPending)return;return original.apply(this,args);};
  }
}
export function showSceneConfirmation(e,chapter,c) {
  if (e.rewindPending || e.destroyed || !e.game)return;
  const scene=sceneProgress(e.game,c).find(s=>s.chapter===chapter);
  const m=e.modal('<div class="modal rq-scene-dialog" role="dialog" aria-modal="true" aria-label="Reset to scene"><h3></h3><p></p><p data-error role="alert"></p><button class="btn ghost" type="button" data-cancel>Cancel</button> <button class="btn" type="button" data-reset>Reset to scene</button></div>');
  trapSceneFocus(m);
  const title=m.el.querySelector('h3'), text=m.el.querySelector('p'), cancel=m.el.querySelector('[data-cancel]'), reset=m.el.querySelector('[data-reset]');
  title.textContent=`Return to the beginning of ${scene?.name || 'this scene'}?`;
  text.textContent=scene?.available ? 'Progress from this scene onward will be reset. Your inventory and points will return to what they were at the start of this scene. Paid hints remain revealed.' : 'Exact scene-start history is unavailable for this older save. Recovery requires support; no progress has been reset.';
  reset.disabled=!scene?.available;cancel.onclick=m.close;cancel.focus();
  reset.onclick=async()=>{if(e.rewindPending)return;reset.disabled=true;cancel.disabled=true;
    try {await e.rewindScene(chapter);m.close();}
    catch(error){if(e.destroyed)return;m.el.querySelector('[data-error]').textContent=`Reset not confirmed: ${error.message} Your current progress is retained. Retry or reload server progress.`;reset.disabled=false;cancel.disabled=false;}
  };
}
export function showSceneProgress(e) {
  const c=e.sceneConfig;if(!c || !e.game || e.destroyed || e.rewindPending)return;
  e.context?.clear();
  const m=e.modal('<div class="modal rq-scene-dialog" role="dialog" aria-modal="true" aria-label="Scene progress"><h3>Scenes</h3><ol></ol><button class="btn ghost" type="button" data-close>Close</button></div>');
  trapSceneFocus(m);
  const doc=m.el.ownerDocument,list=m.el.querySelector('ol');
  for(const s of sceneProgress(e.game,c)) {
    const li=doc.createElement('li'),b=doc.createElement('button');b.type='button';b.className='btn ghost';
    b.textContent=`${s.name} — ${s.state}${s.available?'':' (exact rewind unavailable)'}`;
    if(s.state==='current'){b.disabled=true;b.setAttribute('aria-current','step');}
    else b.onclick=()=>{m.close();showSceneConfirmation(e,s.chapter,c);};
    li.append(b);list.append(li);
  }
  m.el.querySelector('[data-close]').onclick=m.close;m.el.querySelector('[data-close]').focus();
}
export function allocateSceneScores(scenes,points,chapters,branches=[]) {
  for(const [n,s] of Object.entries(scenes)) {
    s.name=chapters?.find(ch=>ch.n===Number(n))?.title || `Scene ${n}`;
    s.max=s.keys.reduce((total,k)=>total+points[k],0);
    for(const choices of branches){const keys=choices.flat();if(keys.every(k=>s.keys.includes(k)))s.max-=keys.reduce((sum,k)=>sum+points[k],0)-Math.max(...choices.map(ks=>ks.reduce((sum,k)=>sum+points[k],0)));}
  }
  return scenes;
}
function trapSceneFocus(m) {
  m.el.addEventListener('keydown',ev=>{
    if(ev.key!=='Tab')return;
    const buttons=[...m.el.querySelectorAll('button:not(:disabled)')];
    if(!buttons.length){ev.preventDefault();return;}
    const focused=m.el.getRootNode().activeElement || m.el.ownerDocument.activeElement;
    if(ev.shiftKey && focused===buttons[0]){ev.preventDefault();buttons.at(-1).focus();}
    else if(!ev.shiftKey && focused===buttons.at(-1)){ev.preventDefault();buttons[0].focus();}
  });
}
