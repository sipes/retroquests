// In-app navigation is not page unload: keep the engine/recovery alive until
// the latest serial CAS write is acknowledged. Security teardown skips this.
export async function flushGameExit(handle,bridge){
 if(!handle)return;
 const engine=handle.engine,root=engine?.root || handle.root,blocked=engine?.blocking,inert=root?.inert;
 const resume=handle.pause?.();
 if(root)root.inert=true;
 if(engine){engine.blocking=true;engine.modalCount=(engine.modalCount || 0)+1;}
 try{
  await bridge?.idle();
  if(handle.flush){
   for(let attempt=0;attempt<3;attempt++){
    const snapshot=JSON.stringify(handle.state);
    await handle.flush();await bridge?.idle();
    if(snapshot===JSON.stringify(handle.state))return;
   }
   throw new Error('Progress changed while saving. Game retained; retry leaving.');
  }
  if(!engine?.flushSave)return;
  for(let attempt=0;attempt<3;attempt++){
   const snapshot=JSON.stringify(engine.game);
   clearTimeout(engine.saveTimer);engine.saveTimer=null;
   await engine.flushSave(false);await bridge?.idle();
   if(engine.saveState==='failed')throw engine.lastSaveError || new Error('Final save failed. Pending progress retained.');
   if(snapshot===JSON.stringify(engine.game)){clearTimeout(engine.saveTimer);engine.saveTimer=null;return;}
  }
  throw new Error('Progress changed while saving. Game retained; retry leaving.');
 }finally{
  resume?.();
  if(root)root.inert=inert;
  if(engine){engine.blocking=blocked;engine.modalCount--;}
 }
}
