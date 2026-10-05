import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';import {execFileSync} from 'node:child_process';
import {createPortLuckyAdapter,mountManaged} from '../../public/port-lucky-platform.js';
import {validDemoSave} from '../../public/demos/port-lucky/save.js';
import {fixture,seed,call} from './helpers.js';
const fresh=()=>({room:'suite',inv:[],flags:{},score:0,scored:{},revealed:{},hintsUsed:0,px:150,py:160});
test('safe demo contains byte-exact accepted suite drawing and puzzle logic, no paid content/imports/hints',()=>{
 const old=execFileSync('git',['show','c508239:public/index.html'],{encoding:'utf8'}),demo=readFileSync('public/demos/port-lucky/game.js','utf8');
 for(const [start,end] of [['function drawSuiteBg','/* ---------- Drawing: Garage'],['function suiteAct','function leaveSuite']])assert.ok(demo.includes(old.slice(old.indexOf(start),old.indexOf(end))));
 assert.doesNotMatch(demo,/garage|drawTruck|garageAct|Pawn receipt|CHAPTER_START|revealHint|listHints|\/games\/|\bimport\s/);
 for(const file of readdirSync('public/games/port-lucky'))assert.deepEqual(readFileSync('public/games/port-lucky/'+file),execFileSync('git',['show','ecae4de:public/games/port-lucky/'+file]));
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
