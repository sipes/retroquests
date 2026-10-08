import {spawn,spawnSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,writeFileSync,createWriteStream} from 'node:fs';
import {resolve} from 'node:path';
import {Transform} from 'node:stream';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const evidence=resolve('evidence/email-entry-v1');mkdirSync(evidence,{recursive:true});mkdirSync('.wrangler',{recursive:true});
const persist=mkdtempSync(resolve('.wrangler/email-entry-local-')),config='dev/email-entry/wrangler.local.jsonc',w=resolve('node_modules/.bin/wrangler'),base='http://127.0.0.1:8848';
const env={...process.env,WRANGLER_SEND_METRICS:'false',CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV:'false',CLOUDFLARE_API_TOKEN:'',CLOUDFLARE_API_KEY:'',CLOUDFLARE_EMAIL:''};
function d1(args,file){const r=spawnSync(w,['d1',...args,'--local','--config',config,'--persist-to',persist,'--env-file','dev/platform/empty.vars'],{env,encoding:'utf8'});writeFileSync(resolve(evidence,file),r.stdout+r.stderr);assert.equal(r.status,0,'LOCAL D1 command failed; see '+file);return r.stdout;}
d1(['migrations','apply','retro-quest-db'],'local-migrations.txt');
const n=Math.floor(Date.now()/1000),users={};let sql='';
for(const game of ['port-lucky','mop-galaxy'])for(const kind of ['existing','unverified','owned','walk']){
 const id=crypto.randomUUID(),email=`${kind}-${game}@entry.test`;users[game+'-'+kind]={id,email};
 sql+=`INSERT INTO users(id,email,name,created_at,verified_at) VALUES('${id}','${email}','LOCAL ${kind}',${n},${kind==='unverified'?'NULL':n});`;
 const data=game==='port-lucky'?{v:2,chapter:1,ownerId:id,room:'suite',inv:['ticket','keycard'],flags:{leftSuite:true},score:0,scored:{},revealed:{},hintsUsed:0,px:150,py:160,dir:1,started:true,clock:null,done:false}: {v:2,chapter:1,ownerId:id,room:'deck9',inv:['mop','badge'],flags:{leftDeck9:true},score:0,scored:{},revealed:{},hintsUsed:0,px:150,py:160,dir:1,started:true,clock:null,checkpoint:null,done:false};
 sql+=`INSERT INTO saves(user_id,game_id,data,updated_at,version,revision) VALUES('${id}','${game}','${JSON.stringify(data)}',${n},1,3);`;
 if(['owned','walk'].includes(kind))sql+=`INSERT INTO entitlement_contributions(user_id,sku,source_id,source,granted_at) VALUES('${id}','${game+(kind==='walk'?'-walkthrough':'')}','LOCAL-entry-${id}','admin',${n});`;
}
writeFileSync(resolve(evidence,'local-seed.sql'),sql);d1(['execute','retro-quest-db','--file',resolve(evidence,'local-seed.sql')],'local-seed.txt');
const worker=spawn(w,['dev','--local','--config',config,'--port','8848','--inspector-port','9278','--ip','127.0.0.1','--persist-to',persist,'--env-file','dev/platform/empty.vars'],{env,stdio:['ignore','pipe','pipe']}),log=createWriteStream(resolve(evidence,'local-worker.txt'));
const scrub=()=>new Transform({transform(chunk,enc,done){done(null,String(chunk).replace(/https?:\/\/[^\s"'<>]*\/auth\/link[^\s"'<>]*/g,'[redacted authentication link]').replace(/token=[\w-]+/g,'token=[redacted]'));}});worker.stdout.pipe(scrub()).pipe(log);worker.stderr.pipe(scrub()).pipe(log);
let browser;const receipts=[],errors=[];let checkoutRequests=0;
const pass=s=>{receipts.push(s);console.log('PASS '+s);};
const proof=()=>{window.turnstile={render:(el,o)=>{queueMicrotask(()=>o.callback('LOCAL-proof'));return 'fixture';},remove:()=>{}};};
async function context(viewport={width:390,height:844}){const c=await browser.newContext({viewport});await c.addInitScript(proof);c.on('page',p=>{p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(new URL(r.url()).pathname==='/api/checkout')checkoutRequests++;});});return c;}
async function me(p){return p.request.get(base+'/api/me').then(r=>r.json());}
async function link(email){const mails=await fetch(base+'/__fixture/mail').then(r=>r.json());const mail=mails.filter(m=>m.to.some(t=>t.email===email)).at(-1);assert.ok(mail,'fixture mail accepted');return mail.text.match(/http:\/\/127\.0\.0\.1:8848\/auth\/link\?token=[\w-]+/)[0];}
async function entry(p,game,email,width){await p.goto(base+'/?game='+game);await p.locator(game==='port-lucky'?'#playCard':'#playMopCard').click();await p.getByRole('heading',{name:'Sign in or play free',exact:true}).waitFor();assert.equal(await p.getByRole('button',{name:'Create an account',exact:true}).count(),0);assert.equal(await p.getByRole('button',{name:'I have an account',exact:true}).count(),0);assert.equal(await p.getByLabel('Name',{exact:true}).isVisible(),false);await p.getByLabel('Email',{exact:true}).fill(email);await p.getByRole('button',{name:'Continue',exact:true}).click();await p.getByLabel('Name',{exact:true}).fill('LOCAL supplied name');await p.getByRole('button',{name:'Email me a link',exact:true}).click();await p.getByText('Agree to the free-account terms to continue.',{exact:true}).waitFor();await p.locator('#entryTerms').check();if(width)await p.screenshot({path:resolve(evidence,`entry-${game}-${width}.png`),fullPage:true});const response=p.waitForResponse(r=>new URL(r.url()).pathname==='/api/signup');await p.getByRole('button',{name:'Email me a link',exact:true}).click();assert.deepEqual(await (await response).json(),{status:'link_sent'});await p.getByRole('heading',{name:'Check your email'}).waitFor();}
try{
 let ready=false;for(let i=0;i<100;i++){try{if((await fetch(base+'/api/config')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,200));}assert.ok(ready,'LOCAL worker ready');
 writeFileSync(resolve(evidence,'runtime.json'),JSON.stringify({source:process.cwd(),persist,base,syntheticLOCAL:true,node:process.version},null,2));browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 let switched;
 for(const game of ['port-lucky','mop-galaxy'])for(const [i,kind] of ['new','existing','unverified','owned','walk'].entries()){
  const width=[320,390,844,1200,390][i],viewport={width,height:width===844?390:844};const c=await context(viewport),p=await c.newPage(),email=kind==='new'?`new-${game}@entry.test`:users[game+'-'+kind].email;
  await entry(p,game,email,i<2?width:null);pass(`${game} ${kind}: identical email-first/name/terms UI at ${width}px; generic confirmation`);
  const magic=await link(email);const separate=await context(viewport),q=await separate.newPage();await q.goto(magic);await q.waitForFunction(()=>document.body.classList.contains('in-game'));await q.locator('#gameMount canvas').first().waitFor({state:'visible'});
  await q.screenshot({path:resolve(evidence,`mounted-${game}-${kind}.png`),fullPage:true});const state=await me(q);assert.equal(state.user.email,email);assert.equal(state.user.verified,true);assert.equal(state.user.name,kind==='new'?'LOCAL supplied name':'LOCAL '+kind);assert.ok(await q.locator('#gameMount').locator('canvas').count());assert.equal(await q.evaluate(async()=>(await import('/portal.js')).host.handle.state.ownerId),state.user.id);
  if(kind==='owned'){
   assert.equal(await q.locator('[data-a="buy"]').count(),0);assert.equal(await q.evaluate(async()=>(await import('/portal.js')).host.handle.state.chapter),2);
   await q.locator('#logoBtn').click();await q.locator(`[data-slide="${game}"]`).getByRole('button',{name:'Continue game',exact:true}).waitFor();const before=await me(q);await q.locator(game==='port-lucky'?'#playCard':'#playMopCard').click();await q.locator('#gameMount canvas').first().waitFor({state:'visible'});assert.equal(await q.evaluate(async()=>(await import('/portal.js')).host.handle.state.chapter),2);assert.deepEqual((await me(q)).save_envelopes[game].data,before.save_envelopes[game].data);pass(`${game} owned: auto-next-scene, Continue not repurchase, flush/re-entry preserves exact cloud save`);
  }else if(kind!=='new'){
   const buy=q.getByRole('button',{name:'Unlock full game — $7.99',exact:true});await buy.waitFor();assert.equal(await buy.isDisabled(),true);await q.getByText(/Scene 1 complete\. Unlock the entire game — all remaining scenes — for \$7\.99, one-time\. No recurring charge\./).waitFor();assert.equal((await me(q)).save_envelopes[game].revision,3);assert.equal(state.entitlements.includes(game),false);await q.screenshot({path:resolve(evidence,`paywall-${game}-${kind}.png`),fullPage:true});pass(`${game} ${kind}: actual scene-end demo paywall, server USD price, sales disabled, save revision retained`);
  }else pass(`${game} new: welcome verifies and auto-mounts correct free scene in different browser`);
  const replay=await fetch(magic,{redirect:'manual'});assert.equal(replay.headers.get('set-cookie'),null);assert.match(replay.headers.get('location'),/signin=expired$/);pass(`${game} ${kind}: replay cannot create second session`);
  if(kind==='owned' && game==='port-lucky'){switched={context:separate,page:q};}else await separate.close();await c.close();
 }
 // Existing active paid game switches to different free identity, without stale owner/state.
 // Obtain a fresh normal login after clearing LOCAL cooldown only.
 writeFileSync(resolve(evidence,'local-cooldown.sql'),"DELETE FROM email_log WHERE to_email='new-mop-galaxy@entry.test';");d1(['execute','retro-quest-db','--file',resolve(evidence,'local-cooldown.sql')],'local-cooldown.txt');
 const login=await switched.page.request.post(base+'/api/login',{data:{email:'new-mop-galaxy@entry.test',turnstile_token:'LOCAL-proof'}});assert.equal(login.status(),200);await switched.page.goto(await link('new-mop-galaxy@entry.test'));await switched.page.locator('#nav').getByText('LOCAL supplied name',{exact:true}).waitFor();await switched.page.locator('[data-dot]').nth(1).click();await switched.page.locator('#playMopCard').click();await switched.page.locator('#gameMount canvas').first().waitFor({state:'visible'});assert.equal((await me(switched.page)).user.email,'new-mop-galaxy@entry.test');assert.equal(await switched.page.evaluate(async()=>(await import('/portal.js')).host.handle.state.ownerId),(await me(switched.page)).user.id);pass('normal login + paid-to-free different-account switch clears stale game identity');await switched.context.close();
 // Real D1 concurrent signup and same-token consumption.
 const intentEmail='intent@entry.test';
 for(const game of ['mop-galaxy','port-lucky']){const r=await fetch(base+'/api/signup',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:intentEmail,name:'LOCAL intent',free_play:true,game_id:game,terms_accepted:true,turnstile_token:'LOCAL-proof'})});assert.deepEqual(await r.json(),{status:'link_sent'});}
 const intents=(await fetch(base+'/__fixture/mail').then(r=>r.json())).filter(m=>m.to.some(t=>t.email===intentEmail));assert.equal(intents.length,2);
 for(const [i,game] of ['mop-galaxy','port-lucky'].entries()){const magic=intents[i].text.match(/http:\/\/127\.0\.0\.1:8848\/auth\/link\?token=[\w-]+/)[0];const r=await fetch(magic,{redirect:'manual'});assert.equal(r.headers.get('location'),base+'/?signin=ok&play='+game);}
 pass('actual local D1 separate per-game requests preserve each issued link intent without retargeting');
 const race={email:'race@entry.test',name:'LOCAL race',free_play:true,game_id:'port-lucky',terms_accepted:true,turnstile_token:'LOCAL-proof'};
 const requests=await Promise.all([1,2].map(()=>fetch(base+'/api/signup',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(race)})));for(const r of requests)assert.deepEqual(await r.json(),{status:'link_sent'});
 const raceMagic=await link(race.email),callbacks=await Promise.all([1,2].map(()=>fetch(raceMagic,{redirect:'manual'})));assert.equal(callbacks.filter(r=>r.headers.has('set-cookie')).length,1);assert.ok(callbacks.some(r=>r.headers.get('location').endsWith('&play=port-lucky')));
 const counts=d1(['execute','retro-quest-db','--command',"SELECT count(*) AS user_count FROM users WHERE email='race@entry.test';"],'local-race-count.txt');assert.match(counts,/"user_count": 1/);pass('real D1 concurrent signup one user; concurrent single-use callback one session');
 // Provider rejection remains honest and revokes issued tokens.
 await fetch(base+'/__fixture/fail-mail?enabled=1',{method:'POST'});const bad=await fetch(base+'/api/signup',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...race,email:'failed@entry.test'})});assert.equal(bad.status,503);assert.equal((await bad.json()).error,'Email could not be accepted. Please try again later.');await fetch(base+'/__fixture/fail-mail?enabled=0',{method:'POST'});pass('LOCAL mail transport rejection yields honest503 (no success screen)');
 const protectedAsset=await fetch(base+'/games/mop-galaxy/game.js');assert.equal(protectedAsset.status,401);assert.equal((await fetch(base+'/games/thistlemere/game.js')).status,404);pass('paid modules and private Thistlemere remain inaccessible');
 assert.equal(checkoutRequests,0);assert.deepEqual(errors,[]);pass('zero checkout requests; no browser JavaScript errors');
}catch(e){console.error(String(e.stack).replace(/https?:\/\/[^\s"'<>]*\/auth\/link[^\s"'<>]*/g,'[redacted authentication link]'));process.exitCode=1;}
finally{writeFileSync(resolve(evidence,'browser-receipts.json'),JSON.stringify({syntheticLOCAL:true,receipts,errors,checkoutRequests},null,2));await browser?.close();worker.kill('SIGTERM');log.end();}
