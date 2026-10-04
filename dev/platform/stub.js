// Inert integration sentinel, not Port Lucky game code/art.
export async function mountStub({root,platform,onDestroy=()=>{}}) {
 const state=await platform.getPlayerState('port-lucky');
 const p=document.createElement('p');p.textContent=state.authenticated?'Mounted synthetic player '+state.user.id:'Mounted guest';root.append(p);
 let alive=true;
 const b=document.createElement('button');b.textContent='Save inert snapshot';b.onclick=async()=>{try{const r=await platform.saveGame('port-lucky',{version:1,revision:state.save?.revision || 0,data:{inert:true}});if(alive)p.textContent=r.acknowledged?'Saved after acknowledgement':'Not saved';}catch(e){if(alive)p.textContent='Not saved: '+e.message;}};root.append(b);
 return {destroy(){alive=false;b.onclick=null;root.replaceChildren();onDestroy();}};
}
