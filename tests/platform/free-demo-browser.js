// Actual Worker routes + in-memory D1 facade, local-only static binding. No providers.
import {chromium} from 'playwright';import assert from 'node:assert/strict';
import {createServer} from 'node:http';import {readFile,mkdir,writeFile} from 'node:fs/promises';import {resolve,extname} from 'node:path';
import worker from '../../src/index.js';import {fixture,seed} from './helpers.js';
const env=fixture(),free=seed(env),owner=seed(env,{email:'owner@example.test'});
env.DB.db.prepare("INSERT INTO entitlement_contributions(user_id,sku,source_id,source,granted_at) VALUES(?,'port-lucky','test','admin',1)").run(owner.id);
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.ttf':'font/ttf','.png':'image/png','.webmanifest':'application/manifest+json'};
env.ASSETS.fetch=async req=>{const p=new URL(req.url).pathname;try{const file=resolve('public','.'+(p==='/'?'/index.html':p));assert.ok(file.startsWith(resolve('public')+'/'));return new Response(await readFile(file),{headers:{'content-type':mime[extname(file)]||'application/octet-stream'}});}catch{return new Response('Not found',{status:404});}};
const server=createServer(async(req,res)=>{let body='';for await(const c of req)body+=c;const r=await worker.fetch(new Request('http://'+req.headers.host+req.url,{method:req.method,headers:req.headers,body:body||undefined}),env,{waitUntil(){}});res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.RETRO_CHROMIUM||'/home/openclaw/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',args:['--no-sandbox']});
const errors=[],requests=[],results=[];await mkdir('evidence/production-v6',{recursive:true});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 await context.addCookies([{name:'rq_session',value:free.token,url:base}]);
 await context.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(new URL(r.url()).pathname));
 await page.goto(base);await page.locator('#nav').getByRole('button',{name:'Synthetic',exact:true}).waitFor();await page.locator('#playHero').click();
 // CSS/text and canvas from the frozen standalone suite, shadow-isolated from portal.
 const scene=page.locator('#gameMount #gameView');await scene.waitFor();
 async function dismiss(){for(let i=0;i<10;i++){const msg=page.locator('#gameMount .sierra:not(.death)');if(!await msg.count())return;await msg.click();await page.waitForTimeout(40);}}
 async function command(text){await dismiss();await page.locator('#gameMount #cmd').fill(text);await page.locator('#gameMount #parserForm').evaluate(f=>f.requestSubmit());await page.waitForTimeout(3000);await dismiss();console.log('command',text,await page.locator('#gameMount #scoreTxt').innerText());}
 await dismiss();assert.match(await page.locator('#gameMount #roomTxt').innerText(),/Honeymoon Suite/);
 await command('look self');await command('open minibar');await command('take crackers');await command('give crackers to goat');await command('take ticket');await command('play tuba');await command('use phone');await command('use door');
 await page.locator('#gameMount #pwT').waitFor();assert.equal(await page.locator('#gameMount [data-a=buy]').isDisabled(),true);
 await page.waitForTimeout(1000);assert.equal(await page.locator('#gameMount #saveStatus').innerText(),'Saved');
 const saved=env.DB.db.prepare('SELECT data,revision FROM saves WHERE user_id=?').get(free.id);assert.equal(JSON.parse(saved.data).room,'suite');assert.equal(JSON.parse(saved.data).score,25);assert.ok(JSON.parse(saved.data).flags.leftSuite);
 assert.equal(requests.some(p=>p.startsWith('/games/')),false);assert.equal(requests.some(p=>p.startsWith('/api/hint')),false);
 await page.screenshot({path:'evidence/production-v6/demo-end-desktop.png',fullPage:true});
 await page.reload();await page.locator('#nav').getByRole('button',{name:'Synthetic',exact:true}).waitFor();await page.locator('#playCard').click();await page.locator('#gameMount #pwT').waitFor();results.push('Free Scene 1: 25/25, CAS save, reload resumes end boundary; no paid requests or hints');
 // Another viewport can resume without paid module requests.
 await page.setViewportSize({width:390,height:844});await page.locator('#gameMount #rotAnyway').click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('#gameMount [data-a=back]').scrollIntoViewIfNeeded();await page.screenshot({path:'evidence/production-v6/demo-end-mobile.png',fullPage:true});results.push('390px portrait: approved rotate prompt and upright control');
 await page.locator('#gameMount [data-a=back]').click();await page.locator('#home').waitFor();
 env.DB.db.prepare("INSERT INTO entitlement_contributions(user_id,sku,source_id,source,granted_at) VALUES(?,'port-lucky','test','admin',1)").run(free.id);
 await page.setViewportSize({width:1440,height:1000});await page.reload();await page.locator('#nav').getByRole('button',{name:'Synthetic',exact:true}).waitFor();await page.locator('#playHero').click();await page.locator('.pl-game').waitFor();
 await page.waitForFunction(async()=>{const {host}=await import('/portal.js');return host.handle?.state?.room==='garage';});results.push('Verified game grant migrates completed legacy demo save into unchanged full-game garage');
 await page.locator('#logoBtn').click();await page.locator('#home').waitFor();
 // Change actual server identity and verify owner branch gets the unchanged engine.
 await context.addCookies([{name:'rq_session',value:owner.token,url:base}]);await page.reload();await page.setViewportSize({width:1440,height:1000});await page.locator('#playHero').click();await page.locator('.pl-game').waitFor();
 assert.ok(requests.includes('/games/port-lucky/engine.js'));results.push('Full owner: unchanged protected engine mounts');
 // Revoke access while running; old full-game DOM must be removed, new safe demo mounts.
 env.DB.db.prepare('INSERT INTO access_revocations VALUES(?,?,1)').run(owner.id,'port-lucky');
 await page.locator('#gameMount #gameView').waitFor({timeout:15000});assert.equal(await page.locator('.pl-game').count(),0);results.push('Revocation polling unmounts full engine and remounts safe free scene');
 await dismiss();await command('drink cocktail');await page.locator('#gameMount .death').waitFor();await page.locator('#gameMount .death').getByRole('button',{name:'Try again'}).click();assert.equal(await page.locator('#gameMount .death').count(),0);
 await page.locator('#gameMount #restartBtn').click();await dismiss();assert.match(await page.locator('#gameMount #scoreTxt').innerText(),/Score: 0/);results.push('Frozen death retry and Scene 1 restart work');
 await page.locator('#gameMount #backBtn').click();await page.locator('#home').waitFor();assert.deepEqual(errors,[]);
 await writeFile('evidence/production-v6/browser-results.json',JSON.stringify({scope:'local actual Worker with synthetic identities and in-memory D1; outbound prohibited',results,errors,freeSaveRevision:saved.revision},null,2));console.log(JSON.stringify({results,errors},null,2));await context.close();
}finally{await browser.close();await new Promise(r=>server.close(r));}
