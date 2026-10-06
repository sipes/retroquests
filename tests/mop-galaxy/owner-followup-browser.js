// Real integrated portal + Worker + isolated LOCAL D1. No provider calls or
// fabricated browser auth/adapter responses. Only latency/503 are injected.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {BASE,E,sql,q} from './local-control.js';
import {CHAPTER_START as plStart} from '../../public/games/port-lucky/script.js';
import {CHAPTER_START as mgStart} from '../../public/games/mop-galaxy/script.js';
import {PORT_LUCKY_HINTS} from '../../src/games/port-lucky-hints.js';
import {MOP_GALAXY_HINTS} from '../../src/games/mop-galaxy-hints.js';
assert.match(BASE,/^http:\/\/127\.0\.0\.1:/);
const DIR=path.join(E,'owner-followup-browser');fs.mkdirSync(DIR,{recursive:true});
const ids=['61000000-0000-4000-8000-000000000001','61000000-0000-4000-8000-000000000002'];
const token=i=>'synthetic-followup-local-only-'+i;
const hash=s=>createHash('sha256').update(s).digest('hex');
const now=Math.floor(Date.now()/1000);
sql(ids.map((id,i)=>`INSERT OR IGNORE INTO users(id,email,name,created_at,verified_at) VALUES(${q(id)},${q('followup-'+i+'@example.test')},'Synthetic local followup',${now},${now});INSERT OR REPLACE INTO sessions(token_hash,user_id,created_at,expires_at) VALUES(${q(hash(token(i)))},${q(id)},${now},${now+86400});`).join('\n'));
async function api(url,{method='GET',data,user=0}={}){return fetch(BASE+url,{method,headers:{cookie:'rq_session='+token(user),...(data?{'content-type':'application/json'}:{})},body:data?JSON.stringify(data):undefined});}
async function json(response){assert.equal(response.status,200,await response.clone().text());return response.json();}
const me=()=>api('/api/me').then(json);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const gate=()=>{let resolve;const promise=new Promise(r=>resolve=r);return{resolve,promise};};
const results=[],browser=await chromium.launch({executablePath:process.env.PL_CHROME || chromium.executablePath()});
const games=[{id:'port-lucky',button:'#playCard',puzzle:'loose-ends',hints:PORT_LUCKY_HINTS,start:()=>plStart(8)},{id:'mop-galaxy',button:'#playMopCard',puzzle:'snack-tool',hints:MOP_GALAXY_HINTS,start:()=>mgStart(1)}];
async function reset(g,{history=false,paidChapter=false}={}){
 sql(`DELETE FROM saves WHERE user_id IN (${ids.map(q).join(',')});DELETE FROM hint_reveals WHERE user_id IN (${ids.map(q).join(',')});DELETE FROM access_revocations WHERE user_id IN (${ids.map(q).join(',')});DELETE FROM entitlement_contributions WHERE user_id IN (${ids.map(q).join(',')});`+['port-lucky','port-lucky-walkthrough','mop-galaxy','mop-galaxy-walkthrough'].map(s=>`INSERT INTO entitlement_contributions(user_id,sku,source_id,source,granted_at) VALUES(${q(ids[0])},${q(s)},'synthetic-followup','admin',${now});`).join('\n'));
 const data=paidChapter && g.id==='mop-galaxy'?mgStart(2):g.start();data.ownerId=ids[0];data.score=g.id==='port-lucky'?242:data.score;
 if(history){const puzzles=Object.keys(g.hints).filter(x=>x!==g.puzzle).slice(0,4);for(const puzzle of puzzles)for(let level=0;level<3;level++)await json(await api('/api/hint',{method:'POST',data:{game_id:g.id,puzzle_id:puzzle,level}}));await json(await api('/api/hint',{method:'POST',data:{game_id:g.id,puzzle_id:g.puzzle,level:0}}));data.hintsUsed=13;data.revealed=Object.fromEntries([...puzzles.map(p=>[p,2]),[g.puzzle,0]]);}
 await json(await api('/api/save',{method:'PUT',data:{game_id:g.id,version:1,revision:0,ownerId:ids[0],data}}));return data;
}
async function open(g,{mobile=false}={}){
 const ctx=await browser.newContext({serviceWorkers:'block',viewport:mobile?{width:390,height:844}:{width:1150,height:850},hasTouch:mobile});await ctx.addCookies([{name:'rq_session',value:token(0),url:BASE,httpOnly:true,sameSite:'Lax'}]);const page=await ctx.newPage(),errors=[],network=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{const u=new URL(r.url());if(u.pathname.startsWith('/api/'))network.push({at:Date.now(),method:r.request().method(),path:u.pathname+u.search,status:r.status()});});
 await page.addInitScript(()=>{window.__writes=[];const original=window.fetch;window.fetch=function(p,o){if(p==='/api/save')window.__writes.push({keepalive:!!o.keepalive,body:JSON.parse(o.body)});return original.apply(this,arguments);};});
 await page.goto(BASE);if(g.id==='mop-galaxy')await page.click('[data-next]');await page.click(g.button);await page.waitForSelector('.pl-game');await page.evaluate(async()=>{window.__followupPortal=await import('/portal.js');});await page.waitForFunction(()=>!!window.__followupPortal.host.handle?.engine?.game);
 await dismiss(page);return {ctx,page,errors,network,async finish(){fs.writeFileSync(path.join(DIR,current+'-network.json'),JSON.stringify(network,null,2));assert.deepEqual(errors,[]);await ctx.close();}};
}
async function dismiss(page){for(let i=0;i<12;i++){const msg=page.locator('.sierra.msg');if(!await msg.count())break;await msg.first().click();await page.waitForTimeout(60);}const rotate=page.locator('[data-id="rotAnyway"]');if(await rotate.isVisible())await rotate.click();}
const engineEval=(page,fn,arg)=>page.evaluate(`(async()=>{const {host}=await import('/portal.js');return (${fn.toString()})(host,${JSON.stringify(arg??null)});})()`);
async function shot(page,label){await page.screenshot({path:path.join(DIR,current+'-'+label+'.png')});}
let current='';
async function check(name,fn){current=name.replaceAll(/[^a-z0-9-]+/gi,'-');try{await fn();results.push({name,status:'pass'});console.log('PASS',name);}catch(e){results.push({name,status:'fail',error:e.stack});console.log('FAIL',name,e.stack);}fs.writeFileSync(path.join(DIR,'results.json'),JSON.stringify({runtime:'actual LOCAL portal/Worker/D1; seeded synthetic accounts, no live fulfilment',pass:results.filter(x=>x.status==='pass').length,fail:results.filter(x=>x.status==='fail').length,results},null,2));}
for(const g of games){
 await check(g.id+' cached nudge13, repeated clue/solution, close/reopen and real 5s poll latency',async()=>{
  await reset(g,{history:true});const s=await open(g);let held=false;try{
   await s.page.route('**/api/me',async route=>{const response=await route.fetch();await sleep(180);await route.fulfill({response});});
   let first=true;await s.page.route('**/api/hints?*',async route=>{const response=await route.fetch();if(first){first=false;held=true;await sleep(6200);}else await sleep(100);await route.fulfill({response});});
   await s.page.click('[data-id="stucktab"]');await s.page.waitForFunction(p=>document.querySelector(`[data-puzzle="${p}"]`),g.puzzle);
   const begun=Date.now();while(!held && Date.now()-begun<5000)await sleep(20);assert.equal(held,true);
   await engineEval(s.page,host=>{window.__poll=host.refresh().catch(e=>window.__pollError=e.message);window.__save=host.handle.engine.flushSave(false);});
   await s.page.waitForFunction(p=>!!window.__followupPortal.host.handle.engine.hintTexts[p+'0'],g.puzzle,{timeout:16000});
   assert.equal((await json(await api('/api/hints?game='+g.id))).count,13);assert.ok(s.network.filter(x=>x.path==='/api/me' && x.at>=begun).length>=2,'actual 5s periodic refresh crossed held hint list');
   const puzzle=s.page.locator(`.puzzle:has([data-puzzle="${g.puzzle}"])`);
   const nudge=puzzle.locator('[data-level="0"]');assert.match(await nudge.innerText(),/Show nudge/);await nudge.click();assert.equal(await puzzle.locator('.hint-text').innerText(),g.hints[g.puzzle][0]);await shot(s.page,'cached-nudge-13');
   for(const level of [1,2]){
    await puzzle.locator(`[data-level="${level}"]`).click();const yes=s.page.locator('.pl-game [data-a="yes"]');
    if(level===2){assert.equal(await yes.isDisabled(),true);await s.page.locator('.pl-game [data-a="no"]').click();assert.equal((await json(await api('/api/hints?game='+g.id))).count,14);await puzzle.locator('[data-level="2"]').click();await yes.waitFor();await s.page.waitForFunction(()=>!document.querySelector('.pl-game [data-a="yes"]').disabled,null,{timeout:14000});}
    await yes.click();await s.page.waitForFunction(({p,level})=>window.__followupPortal.host.handle.engine.hintTexts[p+level],{p:g.puzzle,level},{timeout:12000});assert.ok((await puzzle.locator('.hint-text').allTextContents()).includes(g.hints[g.puzzle][level]));
    await engineEval(s.page,host=>{window.__poll=host.refresh().catch(e=>window.__pollError=e.message);window.__save=host.handle.engine.flushSave(false);});
   }
   await shot(s.page,'all-three-authoritative-hints');
   for(let repeat=0;repeat<3;repeat++){
    await s.page.locator('[data-id="drawer"] header button').click();await s.page.click('[data-id="stucktab"]');
    await s.page.waitForFunction(()=>!window.__followupPortal.host.handle.engine.loadingHints);
    // Port Lucky's unchanged engine has no loading flag: await a guarded real
    // list round trip as well, then show/hide cached text without new charges.
    await engineEval(s.page,async(host,id)=>{await host.adapter.listHints(id);await host.refresh();},g.id);
    for(let level=0;level<3;level++){const b=puzzle.locator(`[data-level="${level}"]`);assert.match(await b.innerText(),/Show /);await b.click();assert.ok((await puzzle.locator('.hint-text').allTextContents()).includes(g.hints[g.puzzle][level]));await b.click();}
    assert.equal((await json(await api('/api/hints?game='+g.id))).count,15);
   }
   const toast=await s.page.locator('.pl-game [data-id="toast"]').innerText();assert.doesNotMatch(toast,/Player access changed/);assert.equal(await s.page.evaluate(()=>window.__pollError),undefined);
   await engineEval(s.page,async host=>{await host.handle.engine.flushSave(false);});const saved=(await me()).save_envelopes[g.id];assert.equal(saved.data.hintsUsed,15);
   await s.page.reload();if(g.id==='mop-galaxy')await s.page.click('[data-next]');await s.page.click(g.button);await s.page.waitForSelector('.pl-game');await dismiss(s.page);await s.page.click('[data-id="stucktab"]');await engineEval(s.page,async host=>{await host.handle.engine.loadHints();host.handle.engine.renderDrawer();});await s.page.locator(`[data-puzzle="${g.puzzle}"][data-level="0"]`).click();assert.ok((await s.page.locator('.hint-text').allTextContents()).includes(g.hints[g.puzzle][0]));await shot(s.page,'reloaded-cached-nudge');
  }finally{await s.finish();}
 });
 await check(g.id+' ordinary in-app exit waits pending CAS then saves latest, no keepalive',async()=>{
  await reset(g);const s=await open(g),ready=gate(),release=gate();let first=true;try{
   await s.page.route('**/api/save',async route=>{const response=await route.fetch();if(first){first=false;ready.resolve();await release.promise;}await route.fulfill({response});});
   await engineEval(s.page,host=>{window.__oldSave=host.handle.engine.flushSave(false);});await ready.promise;
   const latest=await engineEval(s.page,host=>{const e=host.handle.engine;e.game.score++;e.persist();return structuredClone(e.game);});
   await s.page.click('#logoBtn');await sleep(150);assert.equal(await s.page.locator('.pl-game').count(),1);assert.equal(await s.page.locator('#saveRecovery').isVisible(),false);await shot(s.page,'held-old-save-engine-retained');release.resolve();await s.page.waitForSelector('#home:not([hidden])');
   const saved=(await me()).save_envelopes[g.id];assert.equal(saved.data.score,latest.score);assert.deepEqual(saved.data.flags,latest.flags);
   const writes=await s.page.evaluate(()=>window.__writes);assert.ok(writes.length>=2);assert.ok(writes.every(x=>!x.keepalive));for(let i=1;i<writes.length;i++)assert.equal(writes[i].body.revision,writes[i-1].body.revision+1);
   await s.page.click(g.button);await s.page.waitForSelector('.pl-game');assert.equal(await engineEval(s.page,host=>host.handle.state.score),latest.score);await shot(s.page,'latest-save-restored');
  }finally{release.resolve();await s.finish();}
 });
 await check(g.id+' failed final save preserves engine and recovery, retry then exit',async()=>{
  await reset(g);const s=await open(g);let fail=true;try{
   const before=(await me()).save_envelopes[g.id];await s.page.route('**/api/save',route=>fail?route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Synthetic network fault: final save not acknowledged'})}):route.continue());
   const latest=await engineEval(s.page,host=>{host.handle.engine.game.score++;return host.handle.engine.game.score;});await s.page.click('#logoBtn');await s.page.waitForSelector('#saveRecovery:not([hidden])');assert.equal(await s.page.locator('.pl-game').count(),1);assert.equal(await engineEval(s.page,host=>host.handle.state.score),latest);assert.deepEqual((await me()).save_envelopes[g.id],before);await shot(s.page,'failed-exit-retains-progress');
   fail=false;await s.page.click('[data-id="retrysave"]');await s.page.waitForSelector('.savestate.saved');await s.page.click('#logoBtn');await s.page.waitForSelector('#home:not([hidden])');assert.equal((await me()).save_envelopes[g.id].data.score,latest);
  }finally{await s.finish();}
 });
 await check(g.id+' real D1 conflict retains local snapshot; explicit server recovery',async()=>{
  await reset(g);const s=await open(g);try{
   const en=(await me()).save_envelopes[g.id];const remote={...en.data,score:en.data.score+1};await json(await api('/api/save',{method:'PUT',data:{game_id:g.id,version:1,revision:en.revision,ownerId:ids[0],data:remote}}));
   const pending=await engineEval(s.page,host=>{host.handle.engine.game.score+=2;return host.handle.engine.game.score;});await s.page.click('#logoBtn');await s.page.waitForSelector('#saveRecovery:not([hidden])');assert.equal(await engineEval(s.page,host=>host.handle.state.score),pending);assert.equal((await me()).save_envelopes[g.id].data.score,remote.score);await shot(s.page,'real-cas-conflict');
   s.page.once('dialog',d=>d.accept());await s.page.click('#reloadSave');await s.page.waitForFunction(score=>window.__followupPortal.host.handle?.state?.score===score,remote.score);assert.equal(await s.page.locator('#saveRecovery').isVisible(),false);await shot(s.page,'explicit-server-recovery');
  }finally{await s.finish();}
 });
 await check(g.id+' held real private hint discarded after actual session switch',async()=>{
  await reset(g);const s=await open(g),ready=gate(),release=gate();try{
   await s.page.route('**/api/hint',async route=>{const response=await route.fetch();assert.equal(response.status(),200);ready.resolve();await release.promise;await route.fulfill({response}).catch(()=>{});});
   await engineEval(s.page,(host,g)=>{window.__switchedFrom=host.handle;window.__private=host.adapter.revealHint(g.id,g.puzzle,0).then(r=>({exposed:r.text}),e=>({code:e.code}));},{id:g.id,puzzle:g.puzzle});await ready.promise;
   await s.ctx.clearCookies();await s.ctx.addCookies([{name:'rq_session',value:token(1),url:BASE,httpOnly:true,sameSite:'Lax'}]);await engineEval(s.page,async host=>{try{await host.refresh();}catch{}});release.resolve();assert.equal((await s.page.evaluate(()=>window.__private)).exposed,undefined);assert.equal((await s.page.evaluate(()=>window.__private)).code,'STATE_CHANGED');await s.page.waitForSelector('#home:not([hidden])');assert.equal(await s.page.locator('.pl-game').count(),0,'guarded Continue never automatically mounts a different account');assert.equal(await s.page.evaluate(()=>window.__switchedFrom.engine.destroyed),true);assert.equal(await s.page.locator('.hint-text').count(),0);await s.page.waitForFunction(sel=>document.querySelector(sel).textContent==='Play scene 1 free',g.button);assert.equal(await s.page.locator(g.button).innerText(),'Play scene 1 free');await s.page.click(g.button);await s.page.waitForFunction(()=>window.__followupPortal.host.handle && window.__followupPortal.host.handle!==window.__switchedFrom);assert.equal((await engineEval(s.page,async host=>host.adapter.getState())).user.id,ids[1]);assert.equal(await s.page.locator('.hint-text').count(),0);await shot(s.page,'switched-account-no-private-text');
  }finally{release.resolve();await s.finish();}
 });
 await check(g.id+' walkthrough/base revocation clears private UI, retains save and sibling access',async()=>{
  await reset(g,{history:true,paidChapter:true});const s=await open(g);try{
   await engineEval(s.page,async host=>{await host.handle.engine.flushSave(false);await host.handle.engine.loadHints();});
   sql(`INSERT OR REPLACE INTO access_revocations VALUES(${q(ids[0])},${q(g.id+'-walkthrough')},1);`);await engineEval(s.page,async host=>{window.__revokedHandle=host.handle;try{await host.refresh();}catch{}});await s.page.waitForFunction(()=>{const h=window.__followupPortal.host;return h.handle && h.handle!==window.__revokedHandle;});assert.equal(await s.page.locator('.hint-text').count(),0);assert.equal(await engineEval(s.page,host=>host.handle.engine.ent.walk),false);await shot(s.page,'walkthrough-revoked');
   const before=(await me()).save_envelopes[g.id];sql(`INSERT OR REPLACE INTO access_revocations VALUES(${q(ids[0])},${q(g.id)},1);`);await engineEval(s.page,async host=>{try{await host.refresh();}catch{}});await s.page.waitForSelector('#home:not([hidden])');assert.equal(await s.page.locator('.pl-game').count(),0);assert.deepEqual((await me()).save_envelopes[g.id],before);assert.equal((await api('/games/'+g.id+'/game.js')).status,402);const sibling=g.id==='port-lucky'?'mop-galaxy':'port-lucky';assert.equal((await api('/games/'+sibling+'/game.js')).status,200);const revokedHints=await json(await api('/api/hints?game='+g.id));assert.ok(revokedHints.revealed.every(h=>h.text===null));assert.equal(revokedHints.count,13);await shot(s.page,'base-revoked-save-retained');
  }finally{await s.finish();}
 });
}
await check('actual Worker rejects checkout owner race for all four products without provider',async()=>{for(const sku of ['port-lucky','port-lucky-walkthrough','mop-galaxy','mop-galaxy-walkthrough']){const r=await api('/api/checkout',{method:'POST',user:1,data:{sku,ownerId:ids[0]}});assert.equal(r.status,409);assert.match((await r.json()).error,/Checkout owner/);}});
await browser.close();console.log(JSON.stringify({pass:results.filter(x=>x.status==='pass').length,fail:results.filter(x=>x.status==='fail').length}));process.exitCode=results.some(x=>x.status==='fail')?1:0;
