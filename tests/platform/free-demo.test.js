import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';import {execFileSync} from 'node:child_process';
import {createPortLuckyAdapter,mountManaged} from '../../public/port-lucky-platform.js';
import {validDemoSave} from '../../public/demos/port-lucky/save.js';
import {fixture,seed,call} from './helpers.js';
import {runInNewContext} from 'node:vm';
const fresh=()=>({room:'suite',inv:[],flags:{},score:0,scored:{},revealed:{},hintsUsed:0,px:150,py:160});
test('safe demo contains byte-exact accepted suite drawing and puzzle logic, no paid content/imports/hints',()=>{
 const old=execFileSync('git',['show','c508239:public/index.html'],{encoding:'utf8'}),demo=readFileSync('public/demos/port-lucky/game.js','utf8');
 for(const [start,end] of [['function drawSuiteBg','/* ---------- Drawing: Garage'],['function suiteAct','function leaveSuite']])assert.ok(demo.includes(old.slice(old.indexOf(start),old.indexOf(end))));
 const safeImport="import {installContextInput, contextTap} from '../../context-input.js';\n";
 assert.equal(demo.split(safeImport).length,2);
 const gameplayImport="import {VERBS, installGameplayControls, scoreDisplay} from '../../gameplay-controls.js';\n";
 assert.equal(demo.split(gameplayImport).length,2);
 const historyImport="import {installSceneRuntime, captureScene, showSceneConfirmation, saveGameplay} from '../../scene-history.js';\n";
 assert.equal(demo.split(historyImport).length,2);
 assert.doesNotMatch(demo.replace(safeImport,'').replace(gameplayImport,'').replace(historyImport,''),/garage|drawTruck|garageAct|Pawn receipt|CHAPTER_START|revealHint|listHints|\/games\/|\bimport\s/);
 const marker='\n// Approved presentation-only contextual actions (mobile-context-v1).\n';
 for(const file of readdirSync('public/games/port-lucky')){
  let expected=execFileSync('git',['show','ecae4de:public/games/port-lucky/'+file],{encoding:'utf8'});
  let actual=readFileSync('public/games/port-lucky/'+file,'utf8');
  if(file==='rooms.js'){assert.equal(actual.split(marker).length,2);actual=actual.split(marker)[0];}
  if(file==='engine.js'){
   actual=actual.replace("import {installSceneRuntime, allocateSceneScores} from '../../scene-history.js';\n",'')
    .replace(/^allocateSceneScores\(.*\);\n/m,'')
    .replace('    installSceneRuntime(this,{id:GAME_ID,scenes:SCENES,rooms:ROOMS,items:ITEMS,roomChapter:ROOM_CHAPTER});\n','')
    .replace('if(this.rewindPending)return; ','').replace('history:this.game.history, ','').replace('this.clearTransient(); this.lastSnap=null;','this.clearTransient();');
   actual=actual.replace('&& !this.blocking && !this.modalCount','&& !this.blocking');
   // Strip only the named gameplay-A presentation contract. Pin the rest exactly.
   actual=actual.replace(/import \{VERBS, installGameplayControls, scoreDisplay\} from '\.\.\/\.\.\/gameplay-controls\.js';\nexport const SCENES = [\s\S]*?;\n/,"const VERBS = [['walk','Walk'],['look','Look'],['take','Take'],['use','Use'],['talk','Talk']];\n")
    .replace(' this.wire(); installGameplayControls(this, SCENES);',' this.wire();')
    .replace('unmount() { this.gameplay?.destroy();','unmount() {')
    .replace('this.context?.check(); this.gameplay?.check();','this.context?.check();')
    .replace('scoreDisplay(g, SCENES, POINTS, MAX_SCORE)','`Score: ${g.score} of ${MAX_SCORE}`');
   // Exact approved plumbing only; all parser, dispatch, save and story bytes stay pinned.
   expected=safeImport+expected;
   expected=expected.replace(/  snapshot\(\) \{[\s\S]*?\n  clearTransient\(\)/,'  // snapshot/setCheckpoint/restartScene are installed by the shared history contract.\n  clearTransient()');
   expected=expected.replace(/  flushSave\(keepalive\) \{[\s\S]*?\n  setSaveState\(s\)/,'  // flushSave is installed by the shared history contract (serial acknowledgement barrier).\n  setSaveState(s)');
   expected=expected.replace('    this.wire();','    installContextInput(this); this.wire();');
   expected=expected.replace('restart.onclick = e => { e.stopPropagation(); box.remove(); this.restartScene(); };','restart.onclick = e => { e.stopPropagation(); this.restartScene(); };');
   for(const sig of ['async refreshState() {','clearTransient() {','clearOverlays() {','say(text, then) {','die(text) {','overlay(html) {','modal(html) {','gotoRoom(id, px, py, dir) {','parse(raw) {','openDrawer() {','choose(prompt, options) {'])expected=expected.replace(sig,sig+' this.context?.clear();');
   expected=expected.replace('unmount() {','unmount() { this.context?.destroy();').replace('render(t) {','render(t) { this.context?.check();');
   expected=expected.replace('  onCanvasClick(e) {','  onCanvasTap(e) { return contextTap.call(this, e); }\n  contextDrawerOpen() { return this.$ && !this.$(\'drawer\').hidden; }\n  onCanvasClick(e) {');
   expected=expected.replace("    const close = () => { if (!v.isConnected) return; v.remove(); this.modalCount--; document.removeEventListener('keydown', esc); this.refocus(); };", "    const cleanup = () => { document.removeEventListener('keydown', esc); observer.disconnect(); };\n    const close = () => { cleanup(); if (!v.isConnected) return; v.remove(); this.modalCount--; this.refocus(); };")
    .replace("    const esc = e => { if (e.key === 'Escape') close(); };", "    const esc = e => { if (e.key === 'Escape') close(); };\n    const observer = new MutationObserver(() => { if (!v.isConnected) cleanup(); });\n    observer.observe(this.container,{childList:true,subtree:true});");
   expected=expected.replace("$('exit').onclick = () => {", "$('exit').onclick = () => { this.context?.clear();");
  }
  if(file==='script.js')expected=expected.replace('    g.checkpoint = CHAPTER_START(g.chapter);\n    g.checkpoint.hintsUsed = g.hintsUsed || 0;','').replace('  if (!g.checkpoint) g.checkpoint = CHAPTER_START(g.chapter);','');
  assert.equal(actual,expected,file);
 }
});
test('generated free-demo paywall truthfully labels available and disabled purchase states',()=>{
 const demo=readFileSync('public/demos/port-lucky/game.js','utf8');
 const css=JSON.parse(demo.split('\n')[0].slice('const CSS='.length,-1));
 assert.match(css,/\.btn:disabled, \.btn:disabled:hover, \.btn:disabled:active \{[^}]*box-shadow: none;[^}]*cursor: not-allowed/);
 const paywall=demo.slice(demo.indexOf('function showPaywall()'),demo.indexOf('function modal('));
 for(const enabled of [false,true]) {
  const buy={},back={focus(){this.focused=true;}};let html,checkouts=0;
  runInNewContext(paywall+'showPaywall();',{catalog:{'port-lucky':{sale_enabled:enabled}},SKU_GAME:'port-lucky',document:{querySelectorAll:()=>[]},overlay:s=>{html=s;return {querySelector:s=>s.includes('buy')?buy:back};},price:()=>'$7.99',adapter:{checkout:async()=>{checkouts++;}},toast(){}});
  assert.equal(buy.disabled,!enabled);assert.equal(back.focused,true);assert.equal(checkouts,0);
  assert.match(html,enabled?/Unlock full game/:/Purchase unavailable/);
  assert.match(html,enabled?/Secure card payment by Stripe/:/Purchases are currently unavailable for this account/);
  if(!enabled)assert.doesNotMatch(html,/Secure card payment by Stripe/);
 }
});
test('free-demo extraction is reproducible',()=>{
 const before=readFileSync('public/demos/port-lucky/game.js');
 execFileSync('python3',['scripts/extract-free-scene.py']);
 assert.deepEqual(readFileSync('public/demos/port-lucky/game.js'),before);
});
test('bridge uses signed-in catalog rather than anonymous rollout-disabled catalog',async()=>{
 const catalog={'port-lucky':{sale_enabled:true}},b=createPortLuckyAdapter({fetch:async p=>Response.json(p==='/api/me'?{user:{id:'sipes',verified:true},entitlements:[],catalog}:{catalog:{'port-lucky':{sale_enabled:false}}})});
 assert.deepEqual((await b.refresh()).catalog,catalog);b.dispose();
});
test('free saves resume and use CAS without loading protected module, reject unsafe saves and retain server progress',async()=>{
 let me={user:{id:'free',verified:true},entitlements:[],save_envelopes:{'port-lucky':{version:1,revision:7,data:fresh()}}},writes=[];
 const fetch=async(p,o)=>{if(p==='/api/me')return Response.json(me);if(p==='/api/config')return Response.json({catalog:{}});if(p==='/api/save'){const b=JSON.parse(o.body);writes.push(b);return Response.json({acknowledged:true,revision:b.revision+1,updated_at:1});}throw new Error(p);};
 const b=createPortLuckyAdapter({fetch});assert.equal((await b.refresh()).save.room,'suite');await b.adapter.save('port-lucky',fresh(),{ownerId:'free'});assert.equal(writes[0].revision,7);
 await assert.rejects(b.adapter.save('port-lucky',{...fresh(),room:'garage'},{ownerId:'free'}),/boundary/);
 me.save_envelopes['port-lucky'].data={...fresh(),room:'garage'};await assert.rejects(b.refresh(),/invalid save retained/);await assert.rejects(b.adapter.save('port-lucky',fresh(),{ownerId:'free',keepalive:true}),/automatic writes are disabled/);assert.equal(writes.length,1);b.dispose();
});
test('safe schema rejects paid state, art-affecting flags, hints and malformed positions/checkpoints',()=>{
 assert.ok(validDemoSave(fresh()));for(const extra of [{room:'bar'},{chapter:2},{inv:['keys']},{flags:{truckOpen:true}},{revealed:{goat:2}},{px:NaN},{checkpoint:{...fresh(),room:'garage'}}])assert.equal(validDemoSave({...fresh(),...extra}),false);
});
test('unverified mounts rejected before either game import',async()=>{await assert.rejects(mountManaged({}, {getState:async()=>({user:{verified:false},entitlements:['port-lucky']})}),/verified/);});
test('public safe demo is separate; all paid assets still denied to free and walkthrough-only users',async()=>{
 const e=fixture(),free=seed(e),walk=seed(e,{email:'walk@example.test'});e.DB.db.prepare("INSERT INTO entitlement_contributions(user_id,sku,source_id,source,granted_at) VALUES(?, 'port-lucky-walkthrough','test','admin',1)").run(walk.id);
 assert.equal((await call(e,'/demos/port-lucky/game.js')).status,200);
 for(const file of readdirSync('public/games/port-lucky'))for(const token of [free.token,walk.token])assert.equal((await call(e,'/games/port-lucky/'+file,{token})).status,402);
 for(const p of ['/games/port-lucky/%65ngine.js','/demos/port-lucky/game.js.map','/scripts/extract-free-scene.py','/evidence/production-v6/frozen-demo.html'])assert.equal((await call(e,p,{token:free.token})).status,404);
});
