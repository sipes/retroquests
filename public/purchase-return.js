// Checkout URLs are navigation hints only. Never grant access or mutate saves here.
export function createPurchaseReturn({read,resume,status,wait=ms=>new Promise(r=>setTimeout(r,ms)),delays=[1000,2000,3000,4000,5000]}) {
 let task=null,running=false;
 async function check(result,sku){
  if(result!=='success'){status({text:result==='cancelled'?'Checkout cancelled. No purchase was confirmed. You can play or resume using your current account access.':'Unrecognized checkout return. No purchase was confirmed. You can play or resume using your current account access.',play:true});return;}
  if(!['port-lucky','port-lucky-walkthrough','mop-galaxy','mop-galaxy-walkthrough'].includes(sku)){status({text:'Unknown purchase return. No access was changed.',play:true});return;}
  const gameId=sku.replace(/-walkthrough$/,''),title=gameId==='mop-galaxy'?'Mop & Galaxy':'Port Lucky';
  status({text:'Checking server ownership. A checkout return is not proof of payment.'});
  let owner=null;
  for(let attempt=0;attempt<=delays.length;attempt++){
   if(attempt)await wait(delays[attempt-1]);
   let s;try{s=await read();}catch{continue;}
   if(!s.user?.verified){status({text:'Sign in to the verified account used at checkout, then check ownership again.',retry:true,play:true});return;}
   if(owner!==null && owner!==s.user.id){status({text:'The signed-in account changed. No game was resumed. Check ownership on the account used at checkout.',retry:true,play:true});return;}
   owner=s.user.id;
   if(s.entitlements.includes(sku)){
    if(sku.endsWith('-walkthrough')){status({text:'Walkthrough ownership confirmed for this account. Play or resume '+title+' to use it; full-game access is separate.',play:true});return;}
    status({text:'Game ownership confirmed. Resuming your server save…'});
    try{await resume(s,gameId);status({text:'Game ownership confirmed. You can play or resume your saved game.',play:true});}
    catch{status({text:'Ownership was confirmed, but the game could not resume. Your server save has not been reset. Try Play / resume.',play:true});}
    return;
   }
  }
  status({text:'Ownership is not confirmed for this account yet. Payment may still be processing, unpaid, or linked to another account. No access was unlocked. Check again or play with your current access.',retry:true,play:true});
 }
 return {run(result,sku,{retry=false}={}){if(task && (running || !retry))return task;running=true;task=check(result,sku).finally(()=>{running=false;});return task;}};
}
