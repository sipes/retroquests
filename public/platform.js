// Stable seven-method game contract. No provider or cookie access here.
export function createPlatform({ requestSignIn: signIn, requestPurchase: purchase, fetch: fetcher = globalThis.fetch } = {}) {
 let generation=0, identity='', player=null, stateRequest=0;
 const controllers=new Set();
 async function api(method,path,data,protectedCall=false) {
  const epoch=generation, controller=new AbortController(); controllers.add(controller);
  try {
   const r=await fetcher(path,{method,credentials:'same-origin',signal:controller.signal,headers:data?{'content-type':'application/json'}:{},body:data?JSON.stringify(data):undefined});
   const out=await r.json();
   if(protectedCall && epoch!==generation) throw Object.assign(new Error('Player access changed; result discarded.'),{code:'STATE_CHANGED'});
   if(!r.ok) throw Object.assign(new Error(out.error || 'Request failed'),{status:r.status,code:r.status===409?'SAVE_CONFLICT':'REQUEST_FAILED'});
   return out;
  } finally {controllers.delete(controller);}
 }
 return Object.freeze({
  async getPlayerState(gameId) {
   const sequence=++stateRequest;
   const me=await api('GET','/api/me',undefined,true);
   if(sequence!==stateRequest) throw Object.assign(new Error('Stale player state discarded.'),{code:'STATE_CHANGED'});
   const next=JSON.stringify([me.user?.id || null,[...(me.entitlements || [])].sort()]);
   if(next!==identity) {generation++; identity=next; for(const c of controllers)c.abort();}
   player={authenticated:!!me.user,user:me.user || null,entitlements:me.entitlements || [],save:me.save_envelopes?.[gameId] || null};
   return structuredClone(player);
  },
  async requestSignIn() { if(!signIn) throw new Error('Sign-in UI not connected'); await signIn(); },
  async requestPurchase(sku) { if(!purchase) throw new Error('Purchase UI not connected'); await purchase(sku); },
  async saveGame(gameId,envelope) {const r=await api('PUT','/api/save',{game_id:gameId,...envelope},true); if(r.acknowledged!==true) throw new Error('Save was not acknowledged'); return {acknowledged:true,revision:r.revision};},
  async getRevealedHints(gameId) {return (await api('GET','/api/hints?game='+encodeURIComponent(gameId),undefined,true)).revealed;},
  async revealHint(gameId,puzzleId,level) {return api('POST','/api/hint',{game_id:gameId,puzzle_id:puzzleId,level},true);},
  async getCatalog() {const me=await api('GET','/api/me',undefined,true);return me.catalog || (await api('GET','/api/config')).catalog;}
 });
}
// Additive lifecycle helper; destroy before remount on identity/access changes.
export async function mountPlatformGame({root,platform,gameId,mount,interval=5000}) {
 let instance=null, fingerprint='', disposed=false, refreshing=false;
 async function refresh() {
  if(disposed || refreshing)return; refreshing=true;
  try {const state=await platform.getPlayerState(gameId); if(disposed)return;
   const next=JSON.stringify([state.user?.id || null,[...state.entitlements].sort()]);
   if(next!==fingerprint) {instance?.destroy(); instance=null; root.replaceChildren(); fingerprint=next; instance=await mount({root,platform}); if(disposed)instance?.destroy();}
  } finally {refreshing=false;}
 }
 await refresh(); const timer=setInterval(()=>refresh().catch(()=>{}),interval);
 return {refresh,destroy(){disposed=true;clearInterval(timer);instance?.destroy();root.replaceChildren();}};
}
