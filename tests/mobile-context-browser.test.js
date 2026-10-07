import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
// Input/runtime tests, not ownership UAT: isolated static host and synthetic adapter.
for(const game of ['port-lucky','mop-galaxy'])for(const mode of ['games','demos'])test(`${game} ${mode}: real touch, picker, empty walk, mouse and teardown`,{timeout:30000},async t=>{
 let browser;
 const server=createServer((req,res)=>{
  const p=new URL(req.url,'http://localhost').pathname;
  if(p==='/'){res.setHeader('content-type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><div id="game"></div>');return;}
  if(!['/context-input.js','/gameplay-controls.js','/scene-history.js'].includes(p) && !/^\/(games|demos)\/(port-lucky|mop-galaxy)\/[a-z-]+\.(js|css)$/.test(p)){res.writeHead(404);res.end();return;}
  const file=resolve('public','.'+p);if(!existsSync(file)){res.writeHead(404);res.end();return;}
  res.setHeader('content-type',p.endsWith('.css')?'text/css':'text/javascript');res.end(readFileSync(file));
 });
 t.after(async()=>{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({executablePath:process.env.RETRO_CHROMIUM||process.env.PL_CHROME||'/home/openclaw/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true});page.setDefaultTimeout(5000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port);
 await page.evaluate(async({game,mode})=>{
  window.saves=[];window.subs=new Set();
  const save=game==='port-lucky'?{v:2,chapter:1,room:'suite',inv:['crackers'],flags:{minibarOpen:true,gotCrackers:true},scored:{},score:0,hintsUsed:0,revealed:{},px:150,py:160,dir:1,started:true,clock:null,done:false}:null;
  window.st={user:{id:'synthetic',verified:true},entitlements:mode==='games'?[game]:[],save,catalog:{}};
  window.adapter={getState:async()=>structuredClone(st),subscribe:fn=>{subs.add(fn);return()=>subs.delete(fn);},save:async(...a)=>{saves.push(a);return{updated_at:1};},listHints:async()=>({revealed:[],count:0}),checkout:async()=>{throw Error('No provider allowed');}};
  const m=await import(`/${mode}/${game}/game.js`);window.handle=await m.mount(document.querySelector('#game'),adapter,{});
 },{game,mode});
 const dismiss=async()=>{for(let i=0;i<12;i++){const boxes=page.locator('.sierra:not(.death)');if(!await boxes.count())return;await boxes.first().click();}};
 // Let the existing new-game debounce settle before auditing tap side effects.
 await dismiss();await page.waitForTimeout(1300);
 const canvas=page.locator('canvas').first();
 const tap=async(x,y)=>{const r=await canvas.boundingBox();assert.ok(r);await page.touchscreen.tap(r.x+x/320*r.width,r.y+y/180*r.height);};
 const target=game==='port-lucky'?[166,66]:[112,122];
 const before=await page.evaluate(()=>({inv:handle.state.inv,flags:handle.state.flags,score:handle.state.score,saves:saves.length}));
 await tap(...target);await page.locator('.rq-context').waitFor();
 assert.deepEqual(await page.evaluate(()=>({inv:handle.state.inv,flags:handle.state.flags,score:handle.state.score,saves:saves.length})),before);
 assert.match(await page.locator('.rq-context').getAttribute('aria-label'),/Actions for/);
 const geometry=await page.locator('.rq-context').evaluate(el=>{const r=el.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,buttons:[...el.querySelectorAll('button')].map(b=>{const r=b.getBoundingClientRect();return[r.width,r.height];})};});
 assert.ok(geometry.left>=0 && geometry.right<=844 && geometry.top>=0 && geometry.bottom<=390,JSON.stringify(geometry));assert.ok(geometry.buttons.every(([w,h])=>w>=44 && h>=44));
 await page.screenshot({path:`evidence/gameplay-a-v1/context-${game}-${mode}-844.png`});

 for(const width of [320,390]){
  await page.setViewportSize({width,height:844});await page.waitForTimeout(120);
  const upright=page.getByRole('button',{name:'Play upright anyway',exact:true});if(await upright.isVisible())await upright.click();
  await canvas.scrollIntoViewIfNeeded();await tap(...target);await page.locator('.rq-context').waitFor();
  assert.deepEqual(await page.evaluate(()=>({inv:handle.state.inv,flags:handle.state.flags,score:handle.state.score,saves:saves.length})),before);
  const g=await page.locator('.rq-context').evaluate(el=>{const r=el.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,minButton:Math.min(...[...el.querySelectorAll('button')].map(b=>b.getBoundingClientRect().height)),overflow:document.documentElement.scrollWidth>innerWidth};});
  assert.ok(g.left>=0 && g.right<=width && g.top>=0 && g.bottom<=844 && g.minButton>=44 && !g.overflow,JSON.stringify(g));
  await page.screenshot({path:`evidence/gameplay-a-v1/context-${game}-${mode}-${width}.png`});
 }
 await page.setViewportSize({width:844,height:390});await page.waitForTimeout(120);await tap(...target);await page.locator('.rq-context').waitFor();
 await page.locator('.rq-context button').filter({hasText:/^Use item…$/}).click();assert.equal(await page.locator('.rq-context').count(),1);assert.equal((await page.evaluate(()=>handle.state.inv)).length,before.inv.length);
 await page.getByRole('button',{name:'Cancel',exact:true}).click();
 await tap(...target);await tap(310,175);assert.equal(await page.locator('.rq-context').count(),0);await page.waitForTimeout(100);assert.deepEqual(await page.evaluate(()=>handle.state.inv),before.inv);
 // Native mouse event remains verb-first even with touch hardware/coarse emulation.
 if(mode==='games'||game==='mop-galaxy')await page.evaluate(()=>{handle.engine.verb='look';});else await page.locator('.verb').filter({hasText:/^Look$/}).first().evaluate(b=>b.click());
 const r=await canvas.boundingBox();await page.mouse.click(r.x+target[0]/320*r.width,r.y+target[1]/180*r.height);assert.equal(await page.locator('.rq-context').count(),0);assert.ok(await page.locator('.sierra').count()>0);await dismiss();
 await tap(...target);await page.keyboard.press('Escape');assert.equal(await page.locator('.rq-context').count(),0);
 // Select an inventory item explicitly; the target tap itself never uses it.
 await page.evaluate(()=>{window.contextActions=[];if(handle.engine){const act=handle.engine.act.bind(handle.engine);handle.engine.act=(...a)=>{contextActions.push(a);return act(...a);};}});
 await tap(...target);await page.locator('.rq-context button').filter({hasText:/^Give…$/}).click();
 const item=page.locator('.rq-context button').first();await item.click();
 await page.locator('.sierra').first().waitFor();
 if(game==='port-lucky'){assert.equal(await page.evaluate(()=>handle.state.flags.goatFed),true);assert.deepEqual(await page.evaluate(()=>handle.state.inv),['keycard']);assert.equal(await page.evaluate(()=>handle.state.score),5);}
 if(mode==='games'||game==='mop-galaxy')assert.equal(await page.evaluate(()=>contextActions.length),1);
 await dismiss();
 await tap(...target);await page.evaluate(()=>handle.unmount());assert.equal(await page.locator('.rq-context').count(),0);assert.equal(await page.evaluate(()=>subs.size),0);assert.deepEqual(errors,[]);
});
