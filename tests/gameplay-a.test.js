import test from 'node:test';
import assert from 'node:assert/strict';
import {VERBS, scoreDisplay, RetroMusic} from '../public/gameplay-controls.js';
import {SCENES as Port} from '../public/games/port-lucky/engine.js';
import {SCENES as Mop} from '../public/games/mop-galaxy/engine.js';
import {POINTS as PP} from '../public/games/port-lucky/data.js';
import {POINTS as MP} from '../public/games/mop-galaxy/data.js';
import {CHAPTER_START as PC} from '../public/games/port-lucky/script.js';
import {CHAPTER_START as MC} from '../public/games/mop-galaxy/script.js';
import {ContextInput} from '../public/context-input.js';
test('touch uses complete canonical verb order even for an object with reduced metadata',()=>{
 const nodes=[];const doc={createElement:()=>({append(...n){this.children.push(...n);},children:[],setAttribute(){},remove(){},style:{}}),defaultView:{innerWidth:320,innerHeight:180}};
 const spot={id:'x',name:'Object',actions:[{label:'Open',verb:'use'}]};const e={cv:{ownerDocument:doc},game:{room:'r',chapter:1,inv:[]},view:'game',activeSpots:()=>[spot],$:()=>({append:n=>nodes.push(n),getBoundingClientRect:()=>({left:0,top:0,right:320,bottom:180})})};
 const c=new ContextInput(e);c.tap(spot);assert.deepEqual(c.menu.children.slice(1,6).map(b=>b.textContent),VERBS.map(v=>v[1]));
});
for(const [name,scenes,points,start] of [['Port',Port,PP,PC],['Mop',Mop,MP,MC]]){
 test(name+' all score keys have exactly one canonical scene including alternate routes',()=>{const keys=Object.values(scenes).flatMap(s=>s.keys);assert.equal(new Set(keys).size,keys.length);assert.deepEqual(keys.sort(),Object.keys(points).sort());assert.equal(Object.keys(scenes).length,8);});
 for(const n of [1,4,8])test(name+' scene '+n+' checkpoint, repeat, resumed save and transition attribution',()=>{const g=start(n),before=JSON.stringify(g);assert.equal(scoreDisplay(g,scenes,points),`Scene: 0 / ${scenes[g.chapter].max} | Total: ${g.score} / 250`);assert.equal(JSON.stringify(g),before);const k=scenes[n].keys[0];g.scored[k]=true;g.score+=points[k];const expected=`Scene: ${points[k]} / ${scenes[g.chapter].max} | Total: ${g.score} / 250`;assert.equal(scoreDisplay(g,scenes,points),expected);assert.equal(scoreDisplay(structuredClone(g),scenes,points),expected);g.scored[k]=true;assert.equal(scoreDisplay(g,scenes,points),expected);if(n<8){g.chapter++;assert.equal(scoreDisplay(g,scenes,points),`Scene: 0 / ${scenes[g.chapter].max} | Total: ${g.score} / 250`);}});
 test(name+' unknown legacy attribution preserves total honestly without save mutation',()=>{const g={chapter:4,score:100,scored:{unknown:true}},before=JSON.stringify(g);assert.equal(scoreDisplay(g,scenes,points),`Scene: unknown / ${scenes[4].max} | Total: 100 / 250`);assert.equal(JSON.stringify(g),before);});
}
test('original procedural music uses audible oscillators only after gesture and tears down',async()=>{
 let made=0,started=0,closed=0;class AC{constructor(){made++;this.currentTime=0;this.destination={};this.state='suspended';}createGain(){return {gain:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}};}createOscillator(){return {frequency:{value:0},connect(){},start(){started++;},stop(){}};}async resume(){this.state='running';}async suspend(){this.state='suspended';}async close(){closed++;this.state='closed';}}
 const storage=new Map(),win={AudioContext:AC,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},setInterval:()=>1,clearInterval(){}};
 const m=new RetroMusic(win);await m.sync(true,false);assert.equal(made,0);await m.gesture(true,false);assert.equal(made,1);assert.ok(started>0);await m.sync(true,true);assert.equal(m.ctx.state,'suspended');await m.toggle(true,false);assert.equal(m.muted,true);await m.destroy();assert.equal(closed,1);const next=new RetroMusic(win);assert.equal(next.muted,true);await next.gesture(true,false);assert.equal(made,1);await next.destroy();
});
