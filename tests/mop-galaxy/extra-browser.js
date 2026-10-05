// Additional integrated security/return/mobile proof on real local endpoints.
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';
import {Session,launch,EVIDENCE} from './harness.js';import * as W from './mg-walkthrough.js';import {api,sql,q,ids,token,BASE,reset} from './local-control.js';
const E=EVIDENCE;
const results=[],browser=await launch();
async function check(name,fn){try{await fn();results.push({name,status:'pass'});console.log('PASS',name);}catch(e){results.push({name,status:'fail',error:e.stack});console.log('FAIL',name,e.stack);}}
const me=async p=>(await (await api(p,'/api/me')).json());
async function refresh(page){await page.evaluate(async()=>{try{await (await import('/portal.js')).host.refresh();}catch{}});}
await check('real D1 save conflict retains pending progress; explicit reload recovery',async()=>{
 reset('both');const s=await Session.open(browser,{player:'both',name:'extra-cas'});
 try{await s.dismiss();await s.page.evaluate(()=>window.__plGame.engine.flushSave(false));const en=(await me('both')).save_envelopes['mop-galaxy'];const remote={...en.data,score:99};const r=await api('both','/api/save',{method:'PUT',data:{game_id:'mop-galaxy',version:1,revision:en.revision,ownerId:ids.both,data:remote}});assert.equal(r.status,200);
 await s.cmd('look at me');await s.page.waitForSelector('.savestate.failed');await s.page.waitForSelector('#saveRecovery:not([hidden])');assert.equal((await s.state()).score,1);assert.equal((await me('both')).save_envelopes['mop-galaxy'].data.score,99);await s.page.click('.pl-game [data-id="retrysave"]');await s.page.waitForTimeout(300);assert.equal((await me('both')).save_envelopes['mop-galaxy'].data.score,99);await s.shot('pending-cas-conflict');s.page.once('dialog',d=>d.accept());await s.page.click('#reloadSave');await s.page.waitForFunction(()=>window.__plGame?.state?.score===99);}
 finally{await s.close();}
});
await check('actual walkthrough revocation removes rendered text; base revocation clears paid game without rewriting save',async()=>{
 reset('both');const s=await Session.open(browser,{player:'both',name:'extra-revoke'});try{
 await W.chapter1(s);await s.waitRoom('cryo');await s.dismiss();await s.page.evaluate(()=>window.__plGame.engine.flushSave(false));const before=(await me('both')).save_envelopes['mop-galaxy'];
 await s.page.click('[data-id="stucktab"]');await s.page.click('.lvl[data-puzzle="read-the-room"][data-level="0"]');await s.page.click('.pl-game [data-a="yes"]');await s.page.waitForSelector('.hint-text');await s.shot('authorized-hint');
 sql(`INSERT OR REPLACE INTO access_revocations VALUES(${q(ids.both)},'mop-galaxy-walkthrough',1);`);await refresh(s.page);await s.page.waitForFunction(()=>!document.querySelector('.hint-text')&&window.__plGame?.state?.chapter===2);assert.equal((await s.state()).chapter,2);await s.shot('hint-revoked');
 const beforeBase=(await me('both')).save_envelopes['mop-galaxy'];sql(`INSERT OR REPLACE INTO access_revocations VALUES(${q(ids.both)},'mop-galaxy',1);`);await refresh(s.page);await s.page.waitForSelector('#home:not([hidden])');assert.equal(await s.page.locator('.pl-game').count(),0);assert.deepEqual((await me('both')).save_envelopes['mop-galaxy'],beforeBase);assert.equal((await api('both','/games/mop-galaxy/engine.js')).status,402);assert.equal((await api('both','/games/port-lucky/engine.js')).status,200);await s.shot('paid-revoked-save-retained');
 }finally{await s.close();sql(`DELETE FROM access_revocations WHERE user_id=${q(ids.both)};`);}
});
await check('held genuine Worker hint response discarded after real account switch',async()=>{
 reset('both');reset('free');const s=await Session.open(browser,{player:'both',name:'extra-stale-hint'});let release;try{
 await s.dismiss();let arrived,hintStatus;const ready=new Promise(r=>arrived=r),held=new Promise(r=>release=r);await s.page.route('**/api/hint',async route=>{try{const response=await route.fetch();hintStatus=response.status();arrived();await held;try{await route.fulfill({response});}catch{}}catch(e){hintStatus=e.message;arrived();}});
 await s.page.click('[data-id="stucktab"]');await s.page.click('.lvl[data-puzzle="snack-tool"][data-level="0"]');await s.page.click('.pl-game [data-a="yes"]');await Promise.race([ready,new Promise((_,r)=>setTimeout(()=>r(new Error('Hint request never reached actual Worker')),15000))]);assert.equal(hintStatus,200);await s.setPlayer('free');release();await s.page.waitForTimeout(300);assert.equal(await s.page.locator('.hint-text').count(),0);assert.equal((await s.state()).score,0);assert.equal((await s.state()).ownerId,ids.free);await s.shot('stale-private-response-discarded');
 }finally{release?.();await s.close();}
});
await check('both games selectable and unmounted cleanly; portrait/landscape actual touch Items/Type',async()=>{
 reset('both');const ctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,serviceWorkers:'block'});await ctx.addCookies([{name:'rq_session',value:token('both'),url:BASE,httpOnly:true,sameSite:'Lax'}]);const p=await ctx.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));try{
 await p.goto(BASE);await p.tap('#playMopCard');await p.waitForSelector('.mg-game');await p.tap('.pl-game [data-id="rotAnyway"]');for(let i=0;i<4;i++){const msg=p.locator('.sierra.msg');if(await msg.count())await msg.tap();}assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.screenshot({path:E+'/touch-mop-portrait.png'});
 await p.setViewportSize({width:844,height:390});await p.tap('[data-id="sideType"]');await p.locator('[data-id="cmd"]').fill('take coverall');await p.locator('[data-id="cmd"]').press('Enter');await p.waitForTimeout(300);for(let i=0;i<4;i++){const msg=p.locator('.sierra.msg');if(await msg.count())await msg.tap();}await p.tap('[data-id="sideItems"]');await p.waitForSelector('.inv-sheet');await p.screenshot({path:E+'/touch-mop-landscape-items.png'});await p.tap('.inv-card .btn');assert.equal(await p.locator('.inv-sheet').count(),0);assert.ok(await p.locator('.using').count());
 const c=await p.locator('canvas[data-id="canvas"]').boundingBox();await p.touchscreen.tap(c.x+40/320*c.width,c.y+40/180*c.height);await p.waitForTimeout(500);await p.evaluate(async()=>{await (await import('/portal.js')).host.stop();document.getElementById('logoBtn').click();});await p.waitForSelector('#home:not([hidden])');await p.tap('#playCard');await p.waitForSelector('.pl-game:not(.mg-game)');assert.equal(await p.locator('.pl-game').count(),1);await p.tap('[data-id="sideType"]');await p.locator('[data-id="cmd"]').fill('open minibar');await p.locator('[data-id="cmd"]').press('Enter');await p.waitForTimeout(500);await p.screenshot({path:E+'/touch-port-landscape.png'});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);
 }finally{await ctx.close();}
});
await check('actual authenticated Mop return resumes correct server save; walkthrough never auto-mounts',async()=>{
 const ctx=await browser.newContext({serviceWorkers:'block'});await ctx.addCookies([{name:'rq_session',value:token('both'),url:BASE,httpOnly:true,sameSite:'Lax'}]);const p=await ctx.newPage();try{
 const before=(await me('both')).save_envelopes['mop-galaxy'];await p.goto(BASE+'/?purchase=success&sku=mop-galaxy');await p.waitForSelector('.mg-game');assert.equal(await p.evaluate(async()=>{const m=await import('/portal.js');return m.host.handle.state.room;}),before.data.room);assert.equal(await p.locator('.pl-game:not(.mg-game)').count(),0);await p.screenshot({path:E+'/return-mop-confirmed.png'});
 await p.goto(BASE+'/?purchase=success&sku=mop-galaxy-walkthrough');await p.waitForFunction(()=>/Walkthrough ownership confirmed/.test(document.getElementById('purchaseReturn')?.textContent));assert.equal(await p.locator('.pl-game').count(),0);assert.match(await p.locator('#purchaseReturn').innerText(),/Mop & Galaxy/);
 }finally{await ctx.close();}
});
await check('real wrong-account/pending/cancel/failed returns truthful, bounded, no save reset or auto-mount',async()=>{
 const ctx=await browser.newContext({serviceWorkers:'block'});await ctx.addCookies([{name:'rq_session',value:token('free'),url:BASE,httpOnly:true,sameSite:'Lax'}]);const p=await ctx.newPage();try{
 const before=(await me('free')).save_envelopes;for(const result of ['cancelled','failed','success']){await p.goto(BASE+'/?purchase='+result+'&sku=mop-galaxy');await p.waitForFunction(()=>{const t=document.getElementById('purchaseReturn')?.textContent || '';return /cancelled|Unrecognized|not confirmed for this account yet/.test(t);},null,{timeout:22000});assert.equal(await p.locator('.pl-game').count(),0);assert.match(await p.locator('#purchaseReturn').innerText(),/Mop & Galaxy/);assert.deepEqual((await me('free')).save_envelopes,before);await p.screenshot({path:E+'/return-mop-'+result+'.png'});}
 }finally{await ctx.close();}
});
await browser.close();fs.writeFileSync(E+'/extra-browser-results.json',JSON.stringify({results,pass:results.filter(x=>x.status==='pass').length,fail:results.filter(x=>x.status==='fail').length},null,2));process.exitCode=results.some(x=>x.status==='fail')?1:0;
