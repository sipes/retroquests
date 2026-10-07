import test from 'node:test';
import assert from 'node:assert/strict';
import {saveGameplay} from '../public/scene-history.js';
import {Engine as Port} from '../public/games/port-lucky/engine.js';
import {Engine as Mop} from '../public/games/mop-galaxy/engine.js';
import {Engine as Demo} from '../public/demos/mop-galaxy/engine.js';
test('unload dispatch is immediate and remains part of rewind drain barrier',async()=>{
 let release;const calls=[];const e={game:{ownerId:'A'},account:{id:'A',verified:true},ent:{game:true},setSaveState(){},adapter:{save:async(id,data,opts)=>{calls.push(opts.keepalive);if(!opts.keepalive)await new Promise(r=>release=r);return {updated_at:1};}}};
 const ordinary=saveGameplay(e,{id:'test'},false);await Promise.resolve();const unload=saveGameplay(e,{id:'test'},true);await Promise.resolve();assert.deepEqual(calls,[false,true]);let drained=false;e.sceneSaveQueue.then(()=>drained=true);await unload;assert.equal(drained,false);release();await ordinary;await e.sceneSaveQueue;assert.equal(drained,true);
});
for(const [name,Engine]of [['Port',Port],['Mop',Mop],['Demo',Demo]])test(name+' death recovery controls survive opening reset confirmation',()=>{
 const nodes=[];function node(){return {style:{},setAttribute(){},append(...xs){this.children=xs;},appendChild(x){(this.children ||= []).push(x);},remove(){this.removed=true;},focus(){}};}
 const previous=globalThis.document;globalThis.document={createElement(){const n=node();nodes.push(n);return n;}};
 try{const e={$(){return node();},game:{checkpoint:{},history:{},hintsUsed:0,revealed:{}},root:{querySelector(){return node();}},context:{clear(){}},snapshot(){return {};},clearOverlays(){},restartScene(){this.confirmed=true;}};Engine.prototype.die.call(e,'Test death');const restart=nodes.find(n=>n.textContent?.includes('Restart'));assert.ok(restart);restart.onclick({stopPropagation(){}});assert.equal(e.confirmed,true);assert.equal(nodes[0].removed,undefined);assert.equal(e.blocking,true);}finally{globalThis.document=previous;}
});
