// Narrow bridge for the supplied game. Save revisions belong to a mount, not a poll.
import {validDemoSave,demoSave} from './demos/port-lucky/save.js';
let Engine, suppliedMount, ROOMS;
export async function loadOwnedGame(){
 const modules=await Promise.all([import('./games/port-lucky/engine.js'),import('./games/port-lucky/game.js'),import('./games/port-lucky/rooms.js')]);
 [Engine,suppliedMount,ROOMS]=[modules[0].Engine,modules[1].mount,modules[2].ROOMS];
}
// Retain the received engine before its async initialization, so even a rejected
// supplied mount can be unmounted. Restore the synchronous hook immediately.
export async function mountManaged(container,adapter,options){
 const access=await adapter.getState();
 if(!access.user?.verified)throw new Error('A verified account is required.');
 if(!access.entitlements.includes('port-lucky')){
  const demo=await import('./demos/port-lucky/game.js');
  return demo.mount(container,adapter,options);
 }
 if(!Engine) await loadOwnedGame();
 let engine;const original=Engine.prototype.mount;
 Engine.prototype.mount=function(...args){engine=this;return original.apply(this,args);};
 const listeners=[],add=document.addEventListener;
 document.addEventListener=function(type,listener,opts){if(type==='fullscreenchange'||type==='keydown')listeners.push([type,listener,opts]);return add.call(this,type,listener,opts);};
 const cleanup=()=>{for(const args of listeners)document.removeEventListener(...args);};
 let pending;try{pending=suppliedMount(container,adapter,options);}finally{Engine.prototype.mount=original;document.addEventListener=add;}
 try{const handle=await pending;const unmount=handle.unmount;handle.unmount=()=>{cleanup();unmount();};return handle;}catch(error){cleanup();engine?.unmount();throw error;}
}
const object=v=>v!==null && typeof v==='object' && !Array.isArray(v);
function validSave(data){
 return object(data) && object(data.flags) && Object.hasOwn(ROOMS,data.room) && Array.isArray(data.inv)
  && data.inv.every(x=>typeof x==='string') && Number.isFinite(data.score)
  && (data.v===undefined || data.v===2)
  && (data.chapter===undefined || (Number.isInteger(data.chapter)&&data.chapter>=1&&data.chapter<=8))
  && (!data.checkpoint || (object(data.checkpoint)&&Object.hasOwn(ROOMS,data.checkpoint.room)&&object(data.checkpoint.flags)&&Array.isArray(data.checkpoint.inv)));
}
const changed = () => Object.assign(new Error('Player access changed; result discarded.'), {status:409, code:'STATE_CHANGED'});
const fingerprint = s => JSON.stringify([s.user?.id || null, s.user?.verified ?? null, [...(s.entitlements || [])].sort()]);
export function createPortLuckyAdapter({fetch:fetcher=(...args)=>globalThis.fetch(...args), signUp, signIn, onAccessChange, onConflict, onState}={}) {
 let state=null, identity=null, epoch=0, sequence=0, disposed=false, revision=0, initialized=false, conflict=false, saveBlocked=false, queue=Promise.resolve();
 const listeners=new Set();
 const controllers=new Set();
 function invalidate(){disposed=true;epoch++;sequence++;listeners.clear();for(const c of controllers)c.abort();}
 async function api(method,path,data,keepalive=false) {
  const e=epoch;
  const controller=new AbortController();controllers.add(controller);const timer=setTimeout(()=>controller.abort(),15000);
  try{
   const r=await fetcher(path,{method,credentials:'same-origin',cache:'no-store',keepalive,signal:controller.signal,headers:data?{'content-type':'application/json'}:{},body:data?JSON.stringify(data):undefined});
   const out=await r.json();
   if(disposed || e!==epoch)throw changed();
   if(!r.ok)throw Object.assign(new Error(out.error || 'Request failed'),{status:r.status});
   return out;
  }finally{clearTimeout(timer);controllers.delete(controller);}
 }
 async function refresh() {
  const seq=++sequence;
  const [me,config]=await Promise.all([api('GET','/api/me'),api('GET','/api/config')]);
  if(seq!==sequence || disposed)throw changed();
  const next=fingerprint(me);
  if(identity!==null && next!==identity) {
   invalidate(); onAccessChange?.(); throw changed();
  }
  identity=next;
  const envelope=me.save_envelopes?.['port-lucky'];
  const owned=(me.entitlements || []).includes('port-lucky');
  if(envelope && owned && !ROOMS) await loadOwnedGame();
  if(envelope && (envelope.version!==1 || !Number.isSafeInteger(envelope.revision) || envelope.revision<0 || !(owned?validSave(envelope.data):validDemoSave(envelope.data)))){saveBlocked=true;throw new Error('Unsupported or invalid save retained. No automatic reset; contact the platform owner.');}
  if(!initialized){revision=envelope?.revision || 0; initialized=true;}
  state={user:me.user || null,entitlements:me.entitlements || [],save:envelope?(owned?envelope.data:demoSave(envelope.data)):null,catalog:config.catalog || {}};
  onState?.(structuredClone(state)); return structuredClone(state);
 }
 async function guarded(fn) {
  const e=epoch; await refresh(); const result=await fn(); await refresh();
  if(disposed || e!==epoch)throw changed(); return result;
 }
 const adapter={
  getState:refresh,
  subscribe(cb){listeners.add(cb);return()=>listeners.delete(cb);},
  async signUp(){await signUp?.();await refresh();for(const cb of listeners)cb();},
  async signIn(){await signIn?.();await refresh();for(const cb of listeners)cb();},
  async checkout(sku){return guarded(async()=>{const r=await api('POST','/api/checkout',{sku});const u=new URL(r.url);if(u.protocol!=='https:' || u.hostname!=='checkout.stripe.com')throw new Error('Invalid checkout URL');globalThis.location.assign(u.href);});},
  save(gameId,data,{keepalive=false,ownerId}={}) {
   const snapshot=structuredClone(data), e=epoch;
   const work=async()=>{
    if(disposed || e!==epoch)throw changed();
    if(saveBlocked)throw new Error('Invalid existing save retained; automatic writes are disabled.');
    if(conflict)throw Object.assign(new Error('Save conflict: pending progress retained. Explicitly load server progress before writing.'),{status:409});
    if(!keepalive)await refresh();
    if(!state.user || !ownerId || ownerId!==state.user.id || (snapshot.ownerId && snapshot.ownerId!==ownerId))throw changed();
    if(!state.entitlements.includes('port-lucky') && (!state.user.verified || gameId!=='port-lucky' || !validDemoSave(snapshot)))throw new Error('Free-scene save boundary rejected.');
    try {
     const expected=revision;
     const r=await api('PUT','/api/save',{game_id:gameId,version:1,revision:expected,data:snapshot,ownerId},keepalive);
     if(r.acknowledged!==true || r.revision!==expected+1 || !Number.isInteger(r.updated_at))throw new Error('Save was not acknowledged');
     revision=Math.max(revision,r.revision); return {updated_at:r.updated_at};
    } catch(err){if(err.status===409 && err.code!=='STATE_CHANGED'){conflict=true;onConflict?.(err);}throw err;}
   };
   // Unload must dispatch now, not wait for an ordinary fetch that may be
   // cancelled by navigation. Concurrent writes retain strict server CAS.
   const previous=queue,result=keepalive?work():queue.then(work);
   queue=Promise.allSettled([previous,result]).then(()=>{});return result;
  },
  revealHint(gameId,puzzleId,level){return guarded(()=>api('POST','/api/hint',{game_id:gameId,puzzle_id:puzzleId,level}));},
  listHints(gameId){return guarded(()=>api('GET','/api/hints?game='+encodeURIComponent(gameId)));}
 };
 return {adapter, refresh, dispose:invalidate, idle(){return queue;}};
}

// Security changes require a new engine: the supplied refresh alone does not
// restart a revoked paid chapter or clear already-rendered hint text.
export function createPortLuckyHost({container,mount,signUp,signIn,onState,onExit,onError,onConflict,fetch,interval=5000}) {
 let handle=null, bridge=null, active=false, ticket=0, pending=null, lifecycle=Promise.resolve(), listeners=[];
 const serial=fn=>{const result=lifecycle.then(fn);lifecycle=result.catch(()=>{});return result;};
 async function stop(invalidate=false){
  active=false;ticket++;
  if(invalidate)bridge?.dispose();
  // Close module modals through their own controls so their Escape listeners,
  // solution-delay timers and observers are disposed before detaching the root.
  container.querySelectorAll?.('.pl-game .modal-veil [data-a="cancel"], .pl-game .modal-veil [data-a="no"], .pl-game .modal-veil [data-a="close"]').forEach(b=>b.click());
  const old=handle;old?.unmount();handle=null;
  for(const [type,listener,options] of listeners)document.removeEventListener(type,listener,options);listeners=[];
  await bridge?.idle();
  for(const key of ['savedT','toastT','lblT'])clearTimeout(old?.engine?.[key]);
  bridge?.dispose();bridge=null;container.replaceChildren();
 }
 async function start(){
  await stop(); active=true; const t=++ticket;
  const local=createPortLuckyAdapter({fetch,signUp,signIn,onState,onConflict,
   onAccessChange:()=>{if(active && bridge===local)serial(start).catch(e=>onError?.(e));}});bridge=local;
  // The received module registers two anonymous document listeners in wire()
  // but unmount() cannot remove them. Capture only synchronous mount-time
  // registrations, restore the browser method immediately, and own their cleanup.
  const add=document.addEventListener;
  document.addEventListener=function(type,listener,options){if(type==='fullscreenchange' || type==='keydown')listeners.push([type,listener,options]);return add.call(this,type,listener,options);};
  try{pending=mount(container,local.adapter,{onExit:reason=>{serial(()=>stop()).then(()=>onExit?.(reason)).catch(e=>onError?.(e));}});}finally{document.addEventListener=add;}
  let game;try{game=await pending;}catch(error){pending=null;await stop(true);throw error;}pending=null;
  if(!active || t!==ticket){game.unmount();return;}handle=game;return game;
 }
 const timer=setInterval(()=>{if(active && handle)bridge.refresh().catch(e=>{if(e.code!=='STATE_CHANGED')onError?.(e);});},interval);
 const visible=()=>{if(!document.hidden && active)bridge?.refresh().catch(()=>{});};document.addEventListener('visibilitychange',visible);
 return {start:()=>serial(start),stop:()=>serial(()=>stop()),async refresh(){if(bridge)return bridge.refresh();},get handle(){return handle;},get adapter(){return bridge?.adapter;},async destroy(){clearInterval(timer);document.removeEventListener('visibilitychange',visible);await serial(()=>stop(true));}};
}
