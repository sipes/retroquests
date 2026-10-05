import {createPortLuckyHost,mountManaged as mount} from './port-lucky-platform.js';
import {createMopGalaxyHost,mountManaged as mountMop} from './mop-galaxy-platform.js';
import {ART as mopDemoArt,drawPlayer as drawWim} from './demos/mop-galaxy/art.js';
import {drawLandingArt} from './landing-art.js';
import {authProof} from './auth-proof.js';
import {createPurchaseReturn} from './purchase-return.js';
const $=id=>document.getElementById(id);
const SKU_GAME='port-lucky',SKU_WALK='port-lucky-walkthrough';
let account=null,ent={game:false,walk:false},catalog={};
let selectedGame='port-lucky',allEntitlements=[];
const escapeHtml=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(method,path,data){const r=await fetch(path,{method,credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(15000),headers:data?{'content-type':'application/json'}:{},body:data?JSON.stringify(data):undefined});const out=await r.json();if(!r.ok)throw Object.assign(new Error(out.error || 'Request failed'),{status:r.status});return out;}
function applyState(s){const next={game:s.entitlements.includes(SKU_GAME),walk:s.entitlements.includes(SKU_WALK)};const changed=JSON.stringify([account,allEntitlements])!==JSON.stringify([s.user,s.entitlements]);account=s.user;ent=next;allEntitlements=s.entitlements;catalog=s.catalog;if(changed || !$('nav').children.length){renderNav();$('acctMenu').hidden=true;$('acctMenu').replaceChildren();}document.querySelectorAll('[data-price]').forEach(el=>el.textContent=catalog[el.dataset.price]?.display_price || 'Unavailable');}
const hostOptions={container:$('gameMount'),signUp,signIn,onState:applyState,onExit:showCatalogue,onError:e=>toast(e.message),onConflict:()=>{$('saveRecovery').hidden=false;}};
const hosts={'port-lucky':createPortLuckyHost({...hostOptions,mount}),'mop-galaxy':createMopGalaxyHost({...hostOptions,mount:mountMop})};
export let host=hosts[selectedGame];
function showCatalogue(){document.body.classList.remove('in-game');$('home').hidden=false;$('gameView').hidden=true;$('saveRecovery').hidden=true;window.scrollTo(0,0);}
let starting=null;
function startGame(expectedOwner,gameId=selectedGame,{discardPending=false}={}){const guarded=typeof expectedOwner==='string';if(starting)return guarded?Promise.resolve(false):starting;starting=(async()=>{try{if(!Object.hasOwn(hosts,gameId))throw new Error('Unknown game');if(gameId!==selectedGame){await host.stop();selectedGame=gameId;host=hosts[gameId];}await refreshMe();if(guarded && (account?.id!==expectedOwner || !account?.verified || !allEntitlements.includes(gameId)))throw new Error('Account or game ownership changed. No automatic resume.');if(!account?.verified && gameId!=='mop-galaxy'){await signIn();return false;}document.body.classList.add('in-game');$('home').hidden=true;$('gameView').hidden=false;await host.start(guarded?expectedOwner:undefined,{discardPending});$('saveRecovery').hidden=true;return true;}catch(e){toast(e.message);if(host.handle){$('saveRecovery').hidden=false;return false;}await host.stop();showCatalogue();return false;}})().finally(()=>{starting=null;});return starting;}
async function refreshMe(){await host.refresh();const [me,c]=await Promise.all([api('GET','/api/me'),api('GET','/api/config')]);applyState({user:me.user || null,entitlements:me.entitlements || [],catalog:me.catalog || c.catalog});return {user:me.user || null,entitlements:me.entitlements || []};}
$('playHero').onclick=()=>startGame(undefined,'port-lucky');$('playCard').onclick=()=>startGame(undefined,'port-lucky');$('playMopCard').onclick=()=>startGame(undefined,'mop-galaxy');
$('logoBtn').onclick=async()=>{try{await host.stop();showCatalogue();}catch(e){toast(e.message);$('saveRecovery').hidden=false;}};
$('reloadSave').onclick=()=>{if(confirm('Discard pending progress and load the server save?'))startGame(undefined,selectedGame,{discardPending:true});};
drawLandingArt();
{const c=$('cover2').getContext('2d'),s={flags:{},inv:['mop']};c.save();c.translate(0,-20);mopDemoArt.closet.bg(c,s);for(const p of mopDemoArt.closet.props(c,s,0))p.d();drawWim(c,236,160,-1,0);c.restore();}
const query=new URLSearchParams(location.search);
const purchaseResult=query.get('purchase'),purchaseSku=query.get('sku');
function purchaseStatus({text,retry=false,play=false}){
 let panel=$('purchaseReturn');if(!panel){panel=document.createElement('section');panel.id='purchaseReturn';panel.className='overlay-card';panel.setAttribute('aria-label','Purchase return');$('home').prepend(panel);}
 panel.replaceChildren();const message=document.createElement('p');message.setAttribute('role','status');message.textContent=text;panel.append(message);
 if(retry){const b=document.createElement('button');b.className='btn';b.textContent='Check ownership again';b.onclick=()=>purchaseReturn.run(purchaseResult,purchaseSku,{retry:true});panel.append(b);}
 if(play){const gameId=purchaseSku?.startsWith('mop-galaxy')?'mop-galaxy':'port-lucky';const b=document.createElement('button');b.className='btn ghost';b.textContent='Play / resume '+(gameId==='mop-galaxy'?'Mop & Galaxy':'Port Lucky');b.onclick=()=>startGame(undefined,gameId);panel.append(b);}
}
export const purchaseReturn=createPurchaseReturn({read:refreshMe,resume:async(s,gameId)=>{if(!await startGame(s.user.id,gameId))throw new Error('Resume failed');},status:purchaseStatus});
if(query.has('purchase') || query.has('signin'))history.replaceState(null,'',location.pathname);
if(query.has('purchase')){purchaseReturn.run(purchaseResult,purchaseSku);if(purchaseResult!=='success' || ![SKU_GAME,SKU_WALK,'mop-galaxy','mop-galaxy-walkthrough'].includes(purchaseSku))refreshMe().catch(e=>toast(e.message));}
else refreshMe().catch(e=>toast(e.message));
if(query.get('signin')==='expired')signIn();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
/* ---------- Modals: sign-up, checkout, confirm ---------- */
function modal(html, onClose) {
  const v = document.createElement('div'); v.className = 'modal-veil'; v.innerHTML = html;
  let closed=false;
  const close = (silent=false) => { if(closed)return; closed=true; v.remove(); document.removeEventListener('keydown', esc); observer.disconnect(); if (!silent && onClose) onClose(); };
  const esc = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', esc);
  const observer = new MutationObserver(() => { if (!v.isConnected) close(); });
  observer.observe($('modalRoot'), { childList: true });
  v.addEventListener('click', e => { if (e.target === v) close(); });
  $('modalRoot').appendChild(v);
  return { el: v, close };
}

function signUp() {
  let done; const promise=new Promise(r=>done=r);
  const m = modal(`<form class="modal" id="suForm" novalidate role="dialog" aria-labelledby="suT"><h3 id="suT">Create your free account</h3>
    <p>Free accounts play scene 1 of every game, and your saves follow you to any device.</p>
    <div class="field"><label for="suName">Name</label><input id="suName" required autocomplete="name" placeholder="Your name"></div>
    <div class="field"><label for="suEmail">Email</label><input id="suEmail" type="email" required autocomplete="email" placeholder="you@example.com"></div>
    <div class="err" id="suErr" role="alert"></div>
    <p class="note">No password needed. We email you a link whenever you sign in on a new device.</p>
    <div class="row"><button type="button" class="btn ghost" id="suHave">I have an account</button><button class="btn" type="submit" id="suGo">Sign up free</button></div></form>`, done);
  m.el.querySelector('#suName').focus();
  m.el.querySelector('#suHave').onclick = () => { m.close(true); signIn().then(done); };
  m.el.querySelector('#suForm').addEventListener('submit', async e => {
    e.preventDefault();
    const name = m.el.querySelector('#suName').value.trim(), email = m.el.querySelector('#suEmail').value.trim();
    const err = m.el.querySelector('#suErr'); err.textContent = '';
    if (!name) return err.textContent = 'Enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err.textContent = 'Enter an email address like name@example.com.';
    const go = m.el.querySelector('#suGo'); go.disabled = true; go.textContent = 'Creating…';
    try {
      const r = await api('POST', '/api/signup', { name, email, turnstile_token: await authProof(m.el.querySelector('.modal')) });
      {
        m.el.querySelector('form, .modal').innerHTML = `<h3>Check your email</h3><p>If your request was eligible, an email was accepted for ${escapeHtml(email)}. Open the single-use link to verify and sign in. Provider acceptance is not a guarantee of inbox delivery.</p><div class="row"><button class="btn" type="button" id="okBtn">OK</button></div>`;
        m.el.querySelector('#okBtn').onclick = () => m.close();
      }
    } catch (x) { err.textContent = x.message; go.disabled = false; go.textContent = 'Sign up free'; }
  });
  return promise;
}
function signIn() {
  let done; const promise=new Promise(r=>done=r);
  const m = modal(`<form class="modal" id="siForm" novalidate role="dialog" aria-labelledby="siT"><h3 id="siT">Sign in</h3>
    <p>Enter the email you signed up with. We'll send you a link that signs you in.</p>
    <div class="field"><label for="siEmail">Email</label><input id="siEmail" type="email" required autocomplete="email" placeholder="you@example.com"></div>
    <div class="err" id="siErr" role="alert"></div>
    <div class="row"><button type="button" class="btn ghost" id="siNew">Create an account</button><button class="btn" type="submit" id="siGo">Email me a link</button></div></form>`, done);
  m.el.querySelector('#siEmail').focus();
  m.el.querySelector('#siNew').onclick = () => { m.close(true); signUp().then(done); };
  m.el.querySelector('#siForm').addEventListener('submit', async e => {
    e.preventDefault();
    const email = m.el.querySelector('#siEmail').value.trim(), err = m.el.querySelector('#siErr'); err.textContent = '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err.textContent = 'Enter an email address like name@example.com.';
    const go = m.el.querySelector('#siGo'); go.disabled = true; go.textContent = 'Sending…';
    try {
      const r = await api('POST', '/api/login', { email, turnstile_token: await authProof(m.el.querySelector('.modal')) });
      m.el.querySelector('.modal').innerHTML = `<h3>Check your email</h3><p>If ${escapeHtml(email)} has an account and is eligible, a sign-in email was accepted. Delivery is not guaranteed. It works once, for 30 minutes.</p><div class="row"><button class="btn" type="button" id="okBtn">OK</button></div>`;
      m.el.querySelector('#okBtn').onclick = () => m.close();
    } catch (x) { err.textContent = x.message; go.disabled = false; go.textContent = 'Email me a link'; }
  });
  return promise;
}
async function checkout(key){try{if(!host.adapter)throw new Error('Open the game before checkout.');await host.adapter.checkout(key==='walk'?SKU_WALK:SKU_GAME);}catch(e){toast(e.message);}}
let toastT = null;
function toast(t) { const el = $('toast'); el.textContent = t; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => el.hidden = true, 2600); }

/* ---------- Header / account ---------- */
function renderNav() {
  const n = $('nav'); n.innerHTML = '';
  if (!account) {
    const si = document.createElement('button'); si.className = 'btn small ghost'; si.textContent = 'Sign in'; si.onclick = () => signIn(); n.appendChild(si);
    const b = document.createElement('button'); b.className = 'btn small'; b.textContent = 'Sign up free'; b.onclick = () => signUp(); n.appendChild(b);
  } else {
    const b = document.createElement('button'); b.className = 'btn small ghost'; b.textContent = account.name; b.setAttribute('aria-expanded', 'false');
    b.onclick = () => { const m = $('acctMenu'); m.hidden = !m.hidden; b.setAttribute('aria-expanded', String(!m.hidden)); renderMenu(); };
    n.appendChild(b);
  }
}
function renderMenu() {
  const m = $('acctMenu');
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  m.innerHTML = `<div class="owned"><b>${esc(account.email)}</b>${account.verified ? '' : ' · not confirmed yet'}</div>
    <div class="owned">Port Lucky: <b>${ent.game ? 'full game' : 'scene 1 (free)'}</b></div>
    <div class="owned">Port Lucky walkthrough: <b>${ent.walk ? 'owned' : 'not owned'}</b></div>
    <div class="owned">Mop &amp; Galaxy: <b>${allEntitlements.includes('mop-galaxy') ? 'full game' : 'scene 1 (free)'}</b></div>
    <div class="owned">Mop walkthrough: <b>${allEntitlements.includes('mop-galaxy-walkthrough') ? 'owned' : 'not owned'}</b></div>`;
  if (account.isAdmin) { const a = document.createElement('a'); a.className = 'btn small alt'; a.href = '/admin.html'; a.textContent = 'Admin'; a.style.textDecoration = 'none'; m.appendChild(a); }
  const out = document.createElement('button'); out.className = 'btn small ghost'; out.textContent = 'Sign out';
  out.onclick = async () => {try {await api('POST','/api/logout');await refreshMe();m.hidden=true;toast('Signed out. Unsaved in-memory progress cleared.');} catch(e){toast(e.message);} };
  const del = document.createElement('button'); del.className = 'btn small ghost'; del.textContent = 'Delete my account';
  del.onclick = () => { m.hidden = true; deleteAccount(); };
  m.append(out, del);
}
function deleteAccount() {
  const md = modal(`<form class="modal" id="delForm" role="alertdialog" aria-labelledby="delT"><h3 id="delT">Delete your account?</h3>
    <p>This deletes personal account, save, session and hint records. Minimal detached financial records remain for accounting. Stripe retention is separate and is not deleted by this action. Purchased access cannot be restored.</p>
    <div class="field"><label for="delEmail">Type your email to confirm</label><input id="delEmail" type="email" autocomplete="off"></div>
    <div class="err" id="delErr" role="alert"></div>
    <div class="row"><button type="button" class="btn alt" id="delNo">Keep my account</button><button class="btn ghost" type="submit">Delete account</button></div></form>`);
  md.el.querySelector('#delNo').onclick = () => md.close();
  md.el.querySelector('#delNo').focus();
  md.el.querySelector('#delForm').addEventListener('submit', async e => {
    e.preventDefault();
    try { await api('DELETE', '/api/account', { confirm: md.el.querySelector('#delEmail').value }); md.close(); await refreshMe(); toast('Your account has been deleted.'); }
    catch (x) { md.el.querySelector('#delErr').textContent = x.message; }
  });
}
document.addEventListener('click', e => { const m = $('acctMenu'); if (!m.hidden && !m.contains(e.target) && !$('nav').contains(e.target)) m.hidden = true; });


