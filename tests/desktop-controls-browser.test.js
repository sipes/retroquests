import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
const OUT=resolve('evidence/desktop-controls-v1');mkdirSync(OUT,{recursive:true});
for(const game of ['port-lucky','mop-galaxy'])for(const mode of ['games','demos'])test(`${game} ${mode} desktop controls and stable label`,{timeout:90000},async t=>{
 const report={scope:'Real Chromium, static local assets with explicit synthetic verified ownership. No production account or data changes.',geometry:[]};
 const server=createServer((req,res)=>{const p=new URL(req.url,'http://localhost').pathname;if(p==='/'){res.setHeader('content-type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fonts/fonts.css"><style>body{margin:0;background:#120f22}</style><div id="game"></div>');return;}const f=resolve('public','.'+p);if(!f.startsWith(resolve('public')+'/')||!existsSync(f)){res.writeHead(404);res.end();return;}res.setHeader('content-type',p.endsWith('.css')?'text/css':p.endsWith('.js')?'text/javascript':'application/octet-stream');res.end(readFileSync(f));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:process.env.RETRO_CHROMIUM||'/home/openclaw/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',args:['--no-sandbox'],headless:true});
 t.after(async()=>{writeFileSync(resolve(OUT,`${game}-${mode}.json`),JSON.stringify(report,null,2));await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));});
 const page=await browser.newPage({viewport:{width:1440,height:1100}});page.setDefaultTimeout(4000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}`);
 await page.evaluate(async({game,mode})=>{
  window.subs=new Set();window.hintCalls=[];window.saves=[];window.exits=[];
  const adapter={getState:async()=>({user:{id:'desktop-local-fixture',verified:true},entitlements:mode==='games'?[game]:[],save:game==='port-lucky'?{v:2,chapter:1,room:'suite',inv:['crackers'],flags:{minibarOpen:true,gotCrackers:true},scored:{},score:0,hintsUsed:0,revealed:{},px:150,py:160,dir:1,started:true,clock:null,done:false}:null,catalog:{}}),subscribe:f=>{subs.add(f);return()=>subs.delete(f);},save:async(...a)=>{saves.push(a);return{updated_at:1};},listHints:async()=>({revealed:[],count:0}),revealHint:async()=>{hintCalls.push('forbidden');throw Error('Paid hints forbidden');},checkout:async()=>{throw Error('Provider forbidden');}};
  window.handle=await(await import(`/${mode}/${game}/game.js`)).mount(document.querySelector('#game'),adapter,{onExit:r=>exits.push(r)});
 },{game,mode});
 for(let i=0;i<15&&await page.locator('.sierra:not(.death)').count();i++)await page.locator('.sierra:not(.death)').first().click();await page.evaluate(()=>document.fonts.ready);
 const panels=page.locator('.controls>.panel');const hover=page.locator('.hover-label');
 const rects=()=>panels.evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height};}));
 // Geometry recorded before header assertions so red run also measures current jitter.
 for(const width of [1440,1200,900]){
  await page.setViewportSize({width,height:1100});await page.mouse.move(0,0);await hover.evaluate(el=>el.textContent='');const empty=await rects();
  for(const label of ['Look bed','Use crackers with the extremely long named object '.repeat(8),'']){
   await hover.evaluate((el,label)=>el.textContent=label,label);const actual=await rects();report.geometry.push({width,label,empty,actual});assert.deepEqual(actual,empty,'hover label changes Action/Inventory geometry');
  }
  const cv=page.locator('canvas').first(),r=await cv.boundingBox();await page.mouse.move(r.x+r.width*0.52,r.y+r.height*0.37);report.geometry.push({width,pointerLabel:await hover.innerText(),rects:await rects()});assert.deepEqual(await rects(),empty);await page.mouse.move(0,0);assert.deepEqual(await rects(),empty);
  await page.locator('.verbs button').first().hover();assert.deepEqual(await rects(),empty);const item=page.locator('.inv .item').first();if(await item.count()){await item.hover();assert.deepEqual(await rects(),empty);}
  assert.equal(await page.locator('.game-top [data-rq-utility=mute]').count(),1);assert.equal(await page.locator('.game-top [data-rq-utility=objective]').count(),1);
  const visible=await page.locator('.game-top button').evaluateAll(bs=>bs.filter(b=>b.getBoundingClientRect().width>0).map(b=>b.textContent.trim()));report.header=visible;assert.ok(!visible.some(x=>/^(Type|Full screen|Hide keys)$/.test(x)),JSON.stringify(visible));assert.ok(visible.includes('Restart scene'));assert.ok(visible.includes('Back to games'));
  await page.screenshot({path:resolve(OUT,`${game}-${mode}-${width}.png`),fullPage:true});
 }
 // Long text must remain readable when pointer leaves canvas into the label.
 const canvasRect=await page.locator('canvas').first().boundingBox();await page.mouse.move(canvasRect.x+20,canvasRect.y+20);
 const longLabel='Use crackers with the exceptionally long object name '.repeat(12);await hover.evaluate((el,text)=>el.textContent=text,longLabel);await hover.hover();assert.equal(await hover.innerText(),longLabel.trim());await page.mouse.wheel(0,150);await page.waitForTimeout(150);report.overflow=await hover.evaluate(el=>({height:el.clientHeight,scrollHeight:el.scrollHeight,scrollTop:el.scrollTop,text:el.textContent}));assert.ok(report.overflow.scrollTop>0);assert.ok(report.overflow.scrollHeight>report.overflow.height);await hover.focus();await page.keyboard.press('End');await page.mouse.move(0,0);assert.equal((await hover.innerText()).trim(),'');
 await page.locator('[data-rq-utility=objective]').click();report.goal=await page.locator('.modal-veil .modal p').innerText();assert.ok(report.goal.length>20);await page.locator('[data-rq-close]').click();assert.deepEqual(await page.evaluate(()=>hintCalls),[]);
 await page.getByRole('button',{name:'Mute music',exact:true}).click();assert.equal(await page.evaluate(()=>localStorage.getItem('rq-music-muted')),'true');await page.getByRole('button',{name:'Unmute music',exact:true}).click();assert.equal(await page.evaluate(()=>localStorage.getItem('rq-music-muted')),'false');
 const parser=page.locator('.parser input');assert.ok(await parser.isVisible());await parser.fill('look');await parser.press('Enter');for(let i=0;i<15&&await page.locator('.sierra:not(.death)').count();i++)await page.locator('.sierra:not(.death)').first().click();
 // Existing fullscreen API remains supported even though desktop buttons are hidden.
 await page.locator('canvas').first().evaluate(el=>el.requestFullscreen());await hover.evaluate(el=>el.textContent='');const fs=await rects();await hover.evaluate(el=>el.textContent='Look at this long object '.repeat(15));assert.deepEqual(await rects(),fs);await page.evaluate(()=>document.exitFullscreen());
 await page.evaluate(()=>handle.unmount());assert.equal(await page.evaluate(()=>subs.size),0);assert.deepEqual(errors,[]);report.pass=true;
});
