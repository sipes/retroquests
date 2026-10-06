import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Engine as Port} from '../public/games/port-lucky/engine.js';
import {Engine as Mop} from '../public/games/mop-galaxy/engine.js';
import {Engine as Demo} from '../public/demos/mop-galaxy/engine.js';
import {ROOMS as PR} from '../public/games/port-lucky/rooms.js';
import {ROOMS as MR} from '../public/games/mop-galaxy/rooms.js';
import {ROOMS as DR} from '../public/demos/mop-galaxy/rooms.js';
for(const [name,Engine,rooms,start,target] of [['Port full',Port,PR,'suite','goat'],['Mop full',Mop,MR,'closet','mopbot'],['Mop demo',Demo,DR,'closet','mopbot']]) {
 const make=()=>{const e=Object.create(Engine.prototype);Object.assign(e,{D:{ROOMS:rooms},game:{room:start,chapter:1,flags:{},inv:['mop','test'],px:150,py:160},account:{id:'A'},ent:{game:true,walk:true},view:'game',modalCount:0,verb:'take',selItem:'test',destroyed:false});e.calls=[];e.act=(...a)=>e.calls.push(a);e.canvasPoint=()=>[160,70];e.renderInv=()=>{};e.renderVerbs=()=>{};e.context={tap:s=>e.selected=s,clear:()=>{e.selected=null;}};return e;};
 test(name+' object-first tap has no canonical action/save/item mutation',()=>{const e=make(),s=e.activeSpots().find(s=>s.id===target);e.hitTest=()=>s;e.onCanvasTap({});assert.equal(e.calls.length,0);assert.equal(e.selItem,'test');assert.equal(e.selected.id,target);});
 test(name+' empty tap walks despite stale verb/item and cancels queued action',()=>{const e=make();e.hitTest=()=>null;e.walkThen=()=>e.calls.push('stale');e.onCanvasTap({});assert.deepEqual(e.walkTarget,e.clampWalk(160,70));assert.equal(e.walkThen,null);assert.equal(e.selected,null);assert.equal(e.calls.length,0);});
 test(name+' metadata covers every hotspot without required item solutions',()=>{for(const r of Object.values(rooms))for(const s of r.spots){assert.ok(Array.isArray(s.actions),r.title+' '+s.id);assert.ok(s.actions.some(a=>a.label==='Look'));assert.ok(s.actions.every(a=>!a.item));assert.ok(s.actions.some(a=>a.label==='Walk to'));}});
 test(name+' self never masks object overlap',()=>{const e=make(),s=e.activeSpots().find(s=>s.rect);e.game.px=s.rect[0]+2;e.game.py=s.rect[1]+20;assert.equal(e.hitTest(s.rect[0]+2,s.rect[1]+2).id,s.id);});
}
test('Port free-scene installs (not merely mentions) the same safe helper',()=>{const s=fs.readFileSync(new URL('../public/demos/port-lucky/game.js',import.meta.url),'utf8');assert.match(s,/^import \{installContextInput, contextTap\} from '\.\.\/\.\.\/context-input\.js';$/m);assert.match(s,/^context=installContextInput\(inputEngine\);$/m);assert.match(s,/unmount\(\)\{if\(disposed\)return;context\.destroy\(\);unsubContext\?\.\(\);/);assert.doesNotMatch(s,/\/games\//);});
test('shared helper gesture arbitration and stale execution tests',async()=>{const {ContextInput}=await import('../public/context-input.js');const g={room:'r',chapter:1,inv:['item']},spot={id:'s',name:'Object',actions:[{label:'Look',verb:'look'}]},e={game:g,account:{id:'A'},ent:{game:true},view:'game',activeSpots:()=>[spot],approach:(_s,f)=>{e.walkThen=f;},act:(...a)=>e.calls.push(a),calls:[],renderInv(){},renderVerbs(){}};const c=new ContextInput(e);c.paint=()=>{};c.tap(spot);const snap=c.selected;c.dispatch({label:'Take',verb:'take'},snap);g.room='other';e.walkThen();assert.equal(e.calls.length,0);g.room='r';c.tap(spot);c.dispatch({label:'Look',verb:'look'},c.selected);assert.deepEqual(e.calls,[['look','s',undefined]]);c.dispatch({label:'Look',verb:'look'},snap);assert.equal(e.calls.length,1);});
