// Mop-only bridge: raw game saves remain inside the platform's revision envelope.
import {validDemoSave,demoSave} from './demos/mop-galaxy/save.js';
import {flushGameExit} from './flush-game-exit.js';
let ownedModule;
async function loadOwned(){return ownedModule ||= await import('./games/mop-galaxy/game.js');}
export async function mountManaged(container,adapter,options){
 const s=await adapter.getState();
 const module=s.user?.verified && s.entitlements.includes('mop-galaxy')?await loadOwned():await import('./demos/mop-galaxy/game.js');
 return module.mount(container,adapter,options);
}
const changed=()=>Object.assign(new Error('Player access changed; result discarded.'),{status:409,code:'STATE_CHANGED'});
const fingerprint=s=>JSON.stringify([s.user?.id || null,s.user?.verified ?? null,[...(s.entitlements || [])].sort()]);
export function createMopGalaxyAdapter({fetch:fetcher=(...a)=>globalThis.fetch(...a),signUp,signIn,onAccessChange,onConflict,onState,expectedOwner,loadGame=loadOwned}={}){
 let state=null,identity=null,epoch=0,disposed=false,revision=0,initialized=false,conflict=false,saveBlocked=false,queue=Promise.resolve(),refreshQueue=Promise.resolve();
 const listeners=new Set(),controllers=new Set();
 function invalidate(){disposed=true;epoch++;listeners.clear();for(const c of controllers)c.abort();}
 async function api(method,path,data,keepalive=false){
  const e=epoch,c=new AbortController();controllers.add(c);const timer=setTimeout(()=>c.abort(),15000);
  try{const r=await fetcher(path,{method,credentials:'same-origin',cache:'no-store',keepalive,signal:c.signal,headers:data?{'content-type':'application/json'}:{},body:data?JSON.stringify(data):undefined});const out=await r.json();if(disposed || e!==epoch)throw changed();if(!r.ok)throw Object.assign(new Error(out.error || 'Request failed'),{status:r.status});return out;}
  catch(error){if(disposed || e!==epoch)throw changed();throw error;}
  finally{clearTimeout(timer);controllers.delete(c);}
 }
 // Each guard reads current access in FIFO order, without treating polling as
 // a logout. A final guard is never coalesced with a pre-operation request.
 function refresh(){const e=epoch,result=refreshQueue.then(()=>readState(e));refreshQueue=result.catch(()=>{});return result;}
 async function readState(e){
  if(disposed || e!==epoch)throw changed();
  const [me,config]=await Promise.all([api('GET','/api/me'),api('GET','/api/config')]);
  if(disposed || e!==epoch)throw changed();const next=fingerprint(me);
  if(identity!==null && next!==identity){invalidate();onAccessChange?.();throw changed();}
  if(expectedOwner && (me.user?.id!==expectedOwner || !me.user?.verified || !(me.entitlements || []).includes('mop-galaxy')))throw changed();
  const envelope=me.save_envelopes?.['mop-galaxy'],owned=me.user?.verified && (me.entitlements || []).includes('mop-galaxy');
  const valid=envelope?(owned?(await loadGame()).DEFINITION.validateSave(envelope.data):validDemoSave(envelope.data)):true;
  if(disposed || e!==epoch)throw changed();
  // Paid saves are retained server-side after revocation, but only a bounded
  // chapter-one projection is supplied to the public demo.
  if(envelope && (envelope.version!==1 || !Number.isSafeInteger(envelope.revision) || envelope.revision<0 || !valid || (envelope.data.ownerId && envelope.data.ownerId!==me.user?.id) || (envelope.data.checkpoint?.ownerId && envelope.data.checkpoint.ownerId!==me.user?.id))){saveBlocked=true;throw new Error('Unsupported or invalid save retained. No automatic reset; contact the platform owner.');}
  if(disposed || e!==epoch)throw changed();identity=next;
  if(!initialized){revision=envelope?.revision || 0;initialized=true;}
  state={user:me.user || null,entitlements:me.entitlements || [],save:envelope?(owned?envelope.data:demoSave(envelope.data)):null,catalog:me.catalog || config.catalog || {}};
  onState?.(structuredClone(state));return structuredClone(state);
 }
 async function guarded(fn){const e=epoch;await refresh();const r=await fn();await refresh();if(disposed || e!==epoch)throw changed();return r;}
 const adapter={getState:refresh,subscribe(cb){listeners.add(cb);return()=>listeners.delete(cb);},
  async signUp(){await signUp?.();await refresh();for(const cb of listeners)cb();},
  async signIn(){await signIn?.();await refresh();for(const cb of listeners)cb();},
  async checkout(sku){if(!['mop-galaxy','mop-galaxy-walkthrough'].includes(sku))throw changed();const e=epoch;const url=await guarded(async()=>{const r=await api('POST','/api/checkout',{sku,ownerId:state.user?.id});const u=new URL(r.url);if(u.protocol!=='https:' || u.hostname!=='checkout.stripe.com')throw new Error('Invalid checkout URL');return u.href;});if(disposed || e!==epoch)throw changed();globalThis.location.assign(url);},
  save(gameId,data,{keepalive=false,ownerId}={}){
   const snapshot=structuredClone(data),e=epoch;
   const work=async()=>{
    if(disposed || e!==epoch || gameId!=='mop-galaxy')throw changed();
    if(saveBlocked)throw new Error('Invalid existing save retained; automatic writes are disabled.');
    if(conflict)throw Object.assign(new Error('Save conflict: pending progress retained. Explicitly load server progress before writing.'),{status:409});
    if(!keepalive)await refresh();
    if(!state?.user?.verified || !ownerId || ownerId!==state.user.id || snapshot.ownerId!==ownerId)throw changed();
    if(!state.entitlements.includes('mop-galaxy') && !validDemoSave(snapshot))throw new Error('Free-scene save boundary rejected.');
    try{const expected=revision;const r=await api('PUT','/api/save',{game_id:gameId,version:1,revision:expected,data:snapshot,ownerId},keepalive);if(r.acknowledged!==true || r.revision!==expected+1 || !Number.isInteger(r.updated_at))throw new Error('Save was not acknowledged');revision=Math.max(revision,r.revision);return {updated_at:r.updated_at};}
    catch(err){if(err.status===409 && err.code!=='STATE_CHANGED'){conflict=true;onConflict?.(err);}throw err;}
   };
   const previous=queue,result=keepalive?work():queue.then(work);queue=Promise.allSettled([previous,result]).then(()=>{});return result;
  },
  revealHint(gameId,puzzleId,level){if(gameId!=='mop-galaxy')return Promise.reject(changed());return guarded(()=>api('POST','/api/hint',{game_id:gameId,puzzle_id:puzzleId,level}));},
  listHints(gameId){if(gameId!=='mop-galaxy')return Promise.reject(changed());return guarded(()=>api('GET','/api/hints?game='+encodeURIComponent(gameId)));}
 };
 return {adapter,refresh,dispose:invalidate,idle(){return queue;}};
}
export function createMopGalaxyHost({container,mount=mountManaged,signUp,signIn,onState,onExit,onError,onConflict,fetch,interval=5000}){
 let handle=null,bridge=null,active=false,ticket=0,lifecycle=Promise.resolve();
 const serial=fn=>{const r=lifecycle.then(fn);lifecycle=r.catch(()=>{});return r;};
 async function stop(invalidate=false,discardPending=false){if(!invalidate && !discardPending)await flushGameExit(handle,bridge);active=false;ticket++;if(invalidate || discardPending)bridge?.dispose();const old=handle;handle=null;old?.unmount();await bridge?.idle();bridge?.dispose();bridge=null;container.replaceChildren();}
 async function start(expectedOwner,invalidate=false,discardPending=false){
  await stop(invalidate,discardPending);active=true;const t=++ticket;
  const local=createMopGalaxyAdapter({fetch,signUp,signIn,onState,onConflict,expectedOwner,onAccessChange:()=>{if(active && bridge===local)serial(()=>start(expectedOwner,true)).catch(e=>{onError?.(e);onExit?.('signed-out');});}});bridge=local;
  let game;try{game=await mount(container,local.adapter,{onExit:reason=>{serial(()=>stop()).then(()=>onExit?.(reason)).catch(e=>onError?.(e));}});}catch(error){await stop(true);throw error;}
  if(!active || t!==ticket){game.unmount();return;}handle=game;return game;
 }
 const timer=setInterval(()=>{if(active && handle)bridge.refresh().catch(e=>{if(e.code!=='STATE_CHANGED')onError?.(e);});},interval);
 const visible=()=>{if(!document.hidden && active)bridge?.refresh().catch(()=>{});};document.addEventListener('visibilitychange',visible);
 return {start:(expectedOwner,{discardPending=false}={})=>serial(()=>start(expectedOwner,false,discardPending)),stop:()=>serial(()=>stop()),async refresh(){if(bridge)return bridge.refresh();},get handle(){return handle;},get adapter(){return bridge?.adapter;},async destroy(){clearInterval(timer);document.removeEventListener('visibilitychange',visible);await serial(()=>stop(true));}};
}
