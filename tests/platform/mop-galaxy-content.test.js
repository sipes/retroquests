import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {resolve, dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
import {validDemoSave, demoSave} from '../../public/demos/mop-galaxy/save.js';
import {DEFINITION as DEMO} from '../../public/demos/mop-galaxy/game.js';
import {DEFINITION as OWNED} from '../../public/games/mop-galaxy/game.js';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const supplied=join(root,'evidence/mop-galaxy-v1/inputs/public/games');
const demo=join(root,'public/demos/mop-galaxy');
const owned=join(root,'public/games/mop-galaxy');
const fresh=()=>({...DEMO.CHAPTER_START(1),ownerId:'synthetic-player'});
const text=p=>readFileSync(p,'utf8');

test('supplier story, puzzles, room geometry and procedural art are preserved',()=>{
  for(const file of ['data.js','rooms.js','script.js']) assert.equal(text(join(owned,file)),text(join(supplied,'mop-galaxy',file)),file);
  assert.equal(text(join(owned,'art.js')),text(join(supplied,'mop-galaxy/art.js')).replace("'../_shared/pixels.js'","'./pixels.js'"));
  for(const file of ['pixels.js','template.js']) assert.equal(text(join(owned,file)),text(join(supplied,'_shared',file)));
  assert.equal(Object.keys(OWNED.ROOMS).length,19);
  assert.equal(Object.values(OWNED.PUZZLES).flat().filter((p,i,a)=>a.findIndex(x=>x.id===p.id)===i).length,33);
  assert.deepEqual(Object.keys(DEMO.ROOMS),['closet','deck9']);
  assert.deepEqual(Object.keys(DEMO.ART),['closet','deck9']);
});

test('Scene 1 extraction is deterministic, read-only --check and closed import graph',()=>{
  const before=Object.fromEntries(readdirSync(demo).map(f=>[f,readFileSync(join(demo,f))]));
  assert.match(execFileSync('python3',['scripts/extract-free-scene.py','--game','mop-galaxy','--check'],{cwd:root,encoding:'utf8'}),/9 deterministic files/);
  const refusal=execFileSync('python3',['-c',"import runpy\nfrom pathlib import Path\nfrom unittest.mock import patch\nm=runpy.run_path('scripts/extract-mop-free-scene.py')\nwith patch.object(Path, 'read_bytes', return_value=b'changed supplier source'):\n    try: m['extract']()\n    except ValueError as e: print(e)\n    else: raise AssertionError('changed source was accepted')\n"],{cwd:root,encoding:'utf8'});
  assert.match(refusal,/source changed; re-review/);
  for(const [file,bytes] of Object.entries(before)) assert.deepEqual(readFileSync(join(demo,file)),bytes);
  const visited=new Set();
  function walk(path){
    assert.ok(path.startsWith(demo+'/'),path); if(visited.has(path))return;visited.add(path);
    const source=text(path);
    assert.doesNotMatch(source,/4471|HANDLERS\.(cryo|gallery|bridge)|gumbo1|codecard|startChapter\(2\)|revealHint\(|listHints\(/,path);
    for(const match of source.matchAll(/\b(?:import|export)\s+(?:[^'"\n]*?\s+from\s*)?['"]([^'"]+)['"]/g)) {
      assert.ok(match[1].startsWith('./'),match[1]); walk(resolve(dirname(path),match[1]));
    }
  }
  walk(join(demo,'game.js'));assert.equal(visited.size,9);
  assert.doesNotMatch(text(join(demo,'game.css')),/url\(|@import/);
  const art=text(join(supplied,'mop-galaxy/art.js')).split('\n');
  assert.ok(text(join(demo,'art.js')).includes(art.slice(64,96).join('\n')));
  const script=text(join(supplied,'mop-galaxy/script.js')).split('\n');
  assert.ok(text(join(demo,'script.js')).includes(script.slice(209,345).join('\n')));
});

test('raw v2 free save projection preserves checkpoint/completion, never consumes CAS envelopes',()=>{
  const s=fresh();s.checkpoint={...fresh()};delete s.checkpoint.checkpoint;
  assert.ok(validDemoSave(s));assert.deepEqual(demoSave(s).checkpoint,{...s.checkpoint,checkpoint:null});
  const envelope={version:1,revision:7,data:s};assert.equal(validDemoSave(envelope),false);assert.ok(validDemoSave(envelope.data));
  for(const patch of [{v:1},{chapter:2},{room:'cryo'},{inv:['notice']},{inv:['mop','mop']},{flags:{mopBack:true}},{flags:{gotBadge:'yes'}},{scored:{notice:true}},{revealed:{'wake-up':0}},{hintsUsed:1},{score:21},{score:1},{px:NaN},{py:181},{dir:0},{done:true},{clock:240},{hintText:'not allowed'},{checkpoint:{...fresh(),room:'cryo'}},{checkpoint:{...fresh(),ownerId:'other-player'}},{checkpoint:{...fresh(),checkpoint:fresh()}}]) {
    assert.equal(validDemoSave({...fresh(),...patch}),false,JSON.stringify(patch));
    assert.throws(()=>demoSave({...fresh(),...patch}),/invalid save retained/);
  }
  const projected=demoSave(s);projected.inv.push('badge');assert.deepEqual(s.inv,['mop']);
});

test('actual free Scene 1 logic reaches 20 points and paywall, even with paid entitlement supplied',()=>{
  const E={game:fresh(),ent:{game:true},view:'idle',messages:[],paywall:false,
    say(t,next){this.messages.push(t);next?.();},points(k){if(!this.game.scored[k]){this.game.scored[k]=true;this.game.score+=DEMO.POINTS[k];}},
    has(id){return this.game.inv.includes(id);},give(id){if(!this.has(id))this.game.inv.push(id);},drop(id){this.game.inv=this.game.inv.filter(x=>x!==id);},
    spotName(id){return id;},gotoRoom(room,px,py,dir){Object.assign(this.game,{room,px,py,dir});},persist(){assert.ok(validDemoSave(this.game));},
    showPaywall(){this.paywall=true;},die(t){throw new Error('Unexpected death: '+t);}
  };
  E.game.checkpoint={...fresh()};const script=DEMO.createScript(E);
  for(const args of [['look','me'],['take','coverall'],['look','vent'],['look','shelves'],['take','mymop'],['use','door'],['use','vending','coin'],['use','closetdoor'],['use','shelves','snakpak'],['take','wrench'],['use','chute','mop'],['use','door'],['use','bolts','wrench'],['use','ladder']]) script.act(...args);
  assert.equal(E.game.chapter,1);assert.equal(E.game.room,'deck9');assert.equal(E.game.score,20);assert.equal(E.game.flags.leftDeck9,true);assert.equal(E.paywall,true);
  assert.ok(validDemoSave(E.game));assert.equal(demoSave(E.game).flags.leftDeck9,true);
  assert.throws(()=>script.startChapter(2),/boundary/);
});

// This static host serves only this task's module directories. No Worker, D1,
// auth cookie, checkout provider or external service is contacted by these tests.
async function browserFixture(t){
  const server=createServer((req,res)=>{
    const p=new URL(req.url,'http://localhost').pathname;
    if(p==='/'){res.setHeader('content-type','text/html');res.end('<!doctype html><div id="port" class="pl-game"><button>Port Lucky sentinel</button></div><div id="game"></div>');return;}
    if(!/^\/((games|demos)\/mop-galaxy)\/[a-z-]+\.(js|css)$/.test(p)){res.writeHead(404);res.end();return;}
    const path=join(root,'public',p);if(!existsSync(path)){res.writeHead(404);res.end();return;}
    res.setHeader('content-type',p.endsWith('.css')?'text/css':'text/javascript');res.end(readFileSync(path));
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const executablePath=process.env.RETRO_CHROMIUM || process.env.PL_CHROME || '/home/openclaw/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome';
  const browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox']});
  t.after(async()=>{await browser.close();await new Promise(r=>server.close(r));});
  const page=await browser.newPage({viewport:{width:1100,height:800}}),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(new URL(r.url()).pathname));
  await page.goto('http://127.0.0.1:'+server.address().port);
  await page.evaluate(()=>{
    window.liveGlobalListeners=new Set();window.listenerIds=new WeakMap();let n=0;
    for(const target of [document,window]){
      const add=target.addEventListener.bind(target),remove=target.removeEventListener.bind(target);
      const key=(type,fn)=>{if(!listenerIds.has(fn))listenerIds.set(fn,++n);return (target===document?'d':'w')+type+listenerIds.get(fn);};
      const gameEvents=new Set(['fullscreenchange','visibilitychange','pagehide','keydown']);
      target.addEventListener=(type,fn,opts)=>{if(gameEvents.has(type))liveGlobalListeners.add(key(type,fn));return add(type,fn,opts);};
      target.removeEventListener=(type,fn,opts)=>{if(gameEvents.has(type))liveGlobalListeners.delete(key(type,fn));return remove(type,fn,opts);};
    }
    window.saves=[];window.events=[];window.subscribers=new Set();
    window.st={user:{id:'synthetic-player',verified:true},entitlements:[],save:null,catalog:{'mop-galaxy':{price_cents:799,sale_enabled:false},'mop-galaxy-walkthrough':{price_cents:199,sale_enabled:false}}};
    window.adapter={getState:async()=>structuredClone(st),subscribe(fn){subscribers.add(fn);return()=>subscribers.delete(fn);},save:async(id,data,opts)=>{saves.push({id,data:structuredClone(data),opts});return{updated_at:1};},signUp:async()=>{},signIn:async()=>{},checkout:async()=>{throw new Error('No provider calls allowed');},listHints:async()=>({revealed:[{puzzle_id:'wake-up',level:0,text:'synthetic hint'}],count:1}),revealHint:async(id,puzzle_id,level)=>({puzzle_id,level,text:'synthetic clue'})};
    window.mountDemo=async()=>{const m=await import('/demos/mop-galaxy/game.js');window.handle=await m.mount(document.querySelector('#game'),adapter,{onExit:r=>events.push(r)});};
    window.mountOwned=async()=>{const m=await import('/games/mop-galaxy/game.js');window.handle=await m.mount(document.querySelector('#game'),adapter,{onExit:r=>events.push(r)});};
  });
  return{page,errors,requests};
}
async function dismiss(page){for(let i=0;i<20;i++){const box=page.locator('.mg-game .sierra.msg');if(!await box.count())return;await box.click();}throw new Error('Too many queued messages');}
async function command(page,value){await dismiss(page);await page.evaluate(raw=>handle.engine.parse(raw),value);await page.waitForFunction(()=>!handle.engine.walkTarget);await dismiss(page);}

test('browser free scene: real parser/art, save/resume, boundary and full teardown without paid requests',async t=>{
  const{page,errors,requests}=await browserFixture(t);
  const sentinel=await page.locator('#port button').evaluate(el=>({font:getComputedStyle(el).fontFamily,color:getComputedStyle(el).color}));
  await page.evaluate(()=>mountDemo());await dismiss(page);
  await page.waitForFunction(()=>handle.engine.frame>2);
  assert.equal(await page.locator('.mg-game').evaluate(el=>getComputedStyle(el).color),'rgb(242, 238, 255)');
  assert.ok(await page.locator('canvas').evaluate(el=>new Set(el.getContext('2d').getImageData(0,0,320,180).data).size>4));
  for(const raw of ['look at me','take coverall','look at vent','look at shelves','take your mop','use door','use coin on vending machine','use closet door','use snakpak on shelves','take wrench','use mop on chute','use door','use wrench on bolts','use ladder']) await command(page,raw);
  assert.equal(await page.locator('.overlay-card').count(),1);
  assert.match(await page.locator('.overlay-card').innerText(),/End of the free scene/);
  assert.equal(await page.locator('[data-a="buy"]').isDisabled(),true);
  assert.ok(validDemoSave(await page.evaluate(()=>handle.state)));
  assert.equal(await page.evaluate(()=>handle.state.score),20);
  await page.evaluate(async()=>{await handle.engine.flushSave(false);st.save=structuredClone(handle.state);handle.unmount();});
  const saved=await page.evaluate(()=>saves.at(-1));assert.equal(saved.id,'mop-galaxy');assert.equal(saved.opts.ownerId,'synthetic-player');assert.ok(validDemoSave(saved.data));
  assert.deepEqual(await page.evaluate(()=>({listeners:liveGlobalListeners.size,subs:subscribers.size,roots:document.querySelector('#game').childElementCount,timers:handle.engine.timers.size,intervals:handle.engine.intervals.size})),{listeners:0,subs:0,roots:0,timers:0,intervals:0});
  await page.evaluate(()=>mountDemo());assert.equal(await page.locator('.overlay-card').count(),1);
  await page.evaluate(()=>handle.unmount());
  await page.waitForTimeout(180);
  assert.deepEqual(await page.locator('#port button').evaluate(el=>({font:getComputedStyle(el).fontFamily,color:getComputedStyle(el).color})),sentinel);
  assert.equal(requests.some(p=>p.startsWith('/games/')),false);assert.deepEqual(errors,[]);
});

test('browser initialization fails closed; anonymous demo plays without saves',async t=>{
  const{page,errors}=await browserFixture(t);
  for(const kind of ['network','unsafe-save','unverified','other-game']){
    const result=await page.evaluate(async kind=>{
      st.save=null;st.user={id:'synthetic-player',verified:true};st.entitlements=[];
      const old=adapter.getState;
      if(kind==='network')adapter.getState=async()=>{throw new Error('offline');};
      if(kind==='unsafe-save')st.save={v:2,chapter:2,room:'cryo',flags:{},inv:[],score:0};
      if(kind==='unverified')st.user.verified=false;
      if(kind==='other-game')st.entitlements=['port-lucky'];
      let error;try{if(kind==='unverified'||kind==='other-game')await mountOwned();else await mountDemo();}catch(e){error=e.message;}finally{adapter.getState=old;}
      return{error,roots:document.querySelector('#game').childElementCount,listeners:liveGlobalListeners.size,subs:subscribers.size};
    },kind);
    assert.ok(result.error,kind);assert.equal(result.roots,0,kind);assert.equal(result.listeners,0,kind);assert.equal(result.subs,0,kind);
  }
  await page.evaluate(()=>{st={user:null,entitlements:[],save:null,catalog:{}};return mountDemo();});await dismiss(page);await command(page,'look at me');
  assert.equal(await page.evaluate(()=>handle.state.score),1);await page.evaluate(()=>handle.unmount());assert.equal(await page.evaluate(()=>saves.length),0);assert.deepEqual(errors,[]);
});

test('browser owned lifecycle preserves unsaved progress; hint wire format, pending revocation and modal cleanup',async t=>{
  const{page,errors}=await browserFixture(t);
  await page.evaluate(()=>{st.entitlements=['mop-galaxy','mop-galaxy-walkthrough'];return mountOwned();});await dismiss(page);await command(page,'look at me');
  await page.evaluate(()=>handle.refresh());assert.equal(await page.evaluate(()=>handle.state.score),1);
  await page.evaluate(()=>handle.engine.openDrawer());await page.waitForFunction(()=>handle.engine.hintTexts['wake-up0']==='synthetic hint');
  assert.equal(await page.evaluate(()=>handle.state.hintsUsed),1);
  await page.locator('button[data-puzzle="wake-up"][data-level="0"]').click();assert.match(await page.locator('.hint-text').first().innerText(),/synthetic hint/);
  await page.locator('button[data-puzzle="wake-up"][data-level="1"]').click();await page.locator('[data-a="yes"]').click();await page.waitForFunction(()=>handle.engine.hintTexts['wake-up1']==='synthetic clue');
  assert.equal(await page.evaluate(()=>handle.state.revealed['wake-up']),1);
  await page.locator('button[data-puzzle="wake-up"][data-level="2"]').click();
  assert.equal(await page.locator('[data-a="yes"]').isDisabled(),true);
  await page.evaluate(()=>handle.unmount());
  assert.deepEqual(await page.evaluate(()=>({listeners:liveGlobalListeners.size,timers:handle.engine.timers.size,intervals:handle.engine.intervals.size,observers:handle.engine.observers.size})),{listeners:0,timers:0,intervals:0,observers:0});
  for(const change of ['base','walkthrough','verified','account','network']){
    await page.evaluate(()=>{st.save=null;st.user={id:'synthetic-player',verified:true};st.entitlements=['mop-galaxy','mop-galaxy-walkthrough'];return mountOwned();});await dismiss(page);
    await page.evaluate(()=>{adapter.listHints=()=>new Promise(resolve=>window.finishHints=resolve);window.hintPending=handle.engine.loadHints();handle.engine.hintTexts.old='must clear';});
    const revoked=await page.evaluate(async change=>{
      const old=adapter.getState,before=saves.length;
      if(change==='base')st.entitlements=['mop-galaxy-walkthrough'];
      if(change==='walkthrough')st.entitlements=['mop-galaxy'];
      if(change==='verified')st.user.verified=false;
      if(change==='account')st.user.id='another-synthetic-player';
      if(change==='network')adapter.getState=async()=>{throw new Error('offline');};
      try{await handle.refresh();}catch(_){}finally{adapter.getState=old;}
      finishHints({revealed:[{puzzle_id:'wake-up',level:0,text:'stale response'}],count:1});await hintPending;
      return{roots:document.querySelector('#game').childElementCount,listeners:liveGlobalListeners.size,subs:subscribers.size,hints:handle.engine.hintTexts,state:handle.state,writes:saves.length-before};
    },change);
    assert.deepEqual(revoked,{roots:0,listeners:0,subs:0,hints:{},state:null,writes:0},change);
  }
  assert.deepEqual(errors,[]);
});

test('Mop hint reveal waits for server history reconciliation before becoming actionable',async t=>{
  const {page,errors}=await browserFixture(t);
  await page.evaluate(()=>{st.entitlements=['mop-galaxy','mop-galaxy-walkthrough'];adapter.listHints=()=>new Promise(r=>window.resolveHistory=r);return mountOwned();});
  await dismiss(page);await page.evaluate(()=>handle.engine.openDrawer());
  assert.equal(await page.locator('.lvl[data-puzzle="snack-tool"][data-level="0"]').isDisabled(),true);
  await page.evaluate(()=>resolveHistory({revealed:[],count:0}));
  await page.waitForFunction(()=>!document.querySelector('.lvl[data-puzzle="snack-tool"][data-level="0"]').disabled);
  await page.locator('.lvl[data-puzzle="snack-tool"][data-level="0"]').click();await page.locator('[data-a="yes"]').click();
  await page.waitForSelector('.hint-text');assert.match(await page.locator('.hint-text').innerText(),/synthetic clue/);
  await page.evaluate(()=>handle.unmount());assert.deepEqual(errors,[]);
});
