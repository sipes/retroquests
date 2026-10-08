// Game is captured from its own button; a carousel transition cannot change it.
export function installSharing({root,carousel,api,account,signIn,games}){
 for(const [id,game] of Object.entries(games)){
  const slide=[...root.querySelectorAll('[data-slide]')].find(s=>s.dataset.slide===id);if(!slide)continue;
  const box=document.createElement('div'),status=document.createElement('p');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  let prepared=null,identity=null,busy=false;const buttons=[];
  const prepare=()=>{const next=account()?.verified?account().id:'';if(next===identity)return;identity=next;prepared=null;buttons.forEach(b=>b.disabled=true);api('POST','/api/referrals/share',{game:id}).then(link=>{if(identity===next){prepared=link;buttons.forEach(b=>b.disabled=false);}}).catch(()=>{if(identity===next){identity=null;buttons.forEach(b=>b.disabled=false);status.textContent='Could not prepare link. Please try again.';}});};
  for(const action of ['Share','Copy link']){const b=document.createElement('button');b.type='button';b.className='btn ghost';b.textContent=action;b.setAttribute('aria-label',action+' '+game.name);b.onclick=async()=>{
   if(busy)return;carousel.pause();prepare();busy=true;buttons.forEach(button=>button.disabled=true);status.textContent='Preparing link…';
   try{if(!prepared){prepare();status.textContent='Link is preparing. Please press again in a moment.';return;}const link=prepared;
    if(action==='Share' && typeof navigator.share==='function'){try{await navigator.share({title:game.name,url:link.url});status.textContent='Share completed.';}catch(e){if(e.name==='AbortError'){status.textContent='Sharing cancelled. No reward issued.';return;}if(!navigator.clipboard?.writeText)throw e;await navigator.clipboard.writeText(link.url);status.textContent='Link copied.';}}
    else {if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable.');await navigator.clipboard.writeText(link.url);status.textContent='Link copied.';}
   }catch(e){status.textContent='Could not share or copy: '+e.message+' Try again or copy the link below.';const a=document.createElement('a');a.href=prepared?.url || '/?game='+encodeURIComponent(id);a.textContent=a.href;status.append(' ',a);}
   finally{busy=false;buttons.forEach(button=>button.disabled=false);}
  };buttons.push(b);box.append(b);}
  const earn=document.createElement('button');earn.type='button';earn.className='btn ghost';earn.textContent='Sign in to earn a free full-game coupon';earn.onclick=()=>signIn();const help=document.createElement('p');help.textContent='The first valid referral is saved with a new registration. Your friend must verify their email before you earn a coupon.';box.append(earn,help,status);slide.querySelector('.catalogue-copy').append(box);
  const sync=()=>{earn.hidden=!!account()?.verified;prepare();};sync();root.addEventListener('referral-state',sync);
 }
 const id=new URLSearchParams(location.search).get('game');if(Object.hasOwn(games,id))carousel.selectGame(id);
}
export function renderCoupons({root,coupons,games,entitlements,api,refresh}){
 root.style.maxHeight='calc(100dvh - 100px)';root.style.overflowY='auto';
 const section=document.createElement('section');section.setAttribute('aria-label','Referral coupons');root.append(section);
 const intro=document.createElement('p');intro.textContent='Share a game: each new verified registration earns you one account-bound free full-game coupon. No expiry, card, minimum spend or purchase required. Walkthroughs are excluded. Friends receive no coupon.';section.append(intro);
 if(!coupons.length){const p=document.createElement('p');p.textContent='No referral coupons yet.';section.append(p);}
 for(const coupon of coupons){const row=document.createElement('div'),state=document.createElement('p');state.textContent=coupon.redeemed_at?'Coupon redeemed: '+(games[coupon.game]?.name || coupon.game):'Free full-game coupon available';state.setAttribute('role','status');row.append(state);
 if(!coupon.redeemed_at){const select=document.createElement('select');select.setAttribute('aria-label','Choose a free full game');for(const [id,g] of Object.entries(games)){if(!g.available || entitlements.includes(id))continue;const o=document.createElement('option');o.value=id;o.textContent=g.name;select.append(o);}const b=document.createElement('button');b.className='btn';b.textContent='Redeem free game';b.disabled=!select.options.length;b.onclick=async()=>{b.disabled=true;try{await api('POST','/api/referrals/redeem',{coupon_id:coupon.id,game:select.value});await refresh();}catch(e){state.textContent=e.message;b.disabled=false;}};row.append(select,b);if(!select.options.length)state.textContent+=' — all available games owned; keep this coupon for a future game.';}
 section.append(row);}
}
