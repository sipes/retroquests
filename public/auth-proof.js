// Explicit Turnstile rendering; token never persisted or logged.
let script;
export async function authProof(container){
 const config=await fetch('/api/config',{cache:'no-store'}).then(r=>r.json());
 if(!config.turnstileSiteKey)throw new Error('Sign-in protection unavailable.');
 if(!globalThis.turnstile){
  script ||= new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';s.onload=resolve;s.onerror=()=>reject(new Error('Sign-in protection could not load.'));document.head.appendChild(s);});
  await script;
 }
 if(!container.isConnected)throw new Error('Sign-in closed.');
 return new Promise((resolve,reject)=>{
  const node=document.createElement('div');container.appendChild(node);
  const timer=setTimeout(()=>{cleanup();reject(new Error('Sign-in protection timed out. Please retry.'));},120000);
  let id;
  const cleanup=()=>{clearTimeout(timer);observer.disconnect();if(id!==undefined)globalThis.turnstile.remove(id);node.remove();};
  const observer=new MutationObserver(()=>{if(!container.isConnected){cleanup();reject(new Error('Sign-in closed.'));}});observer.observe(document.body,{childList:true,subtree:true});
  id=globalThis.turnstile.render(node,{sitekey:config.turnstileSiteKey,action:'auth',callback:token=>{cleanup();resolve(token);},'error-callback':()=>{cleanup();reject(new Error('Sign-in protection failed. Please retry.'));},'expired-callback':()=>{cleanup();reject(new Error('Sign-in protection expired. Please retry.'));}});
 });
}
