import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {ROOMS as port} from '../public/games/port-lucky/rooms.js';
import {ROOMS as mop} from '../public/games/mop-galaxy/rooms.js';
import {fixture,call} from './platform/helpers.js';
for(const [game,rooms] of [['port-lucky',port],['mop-galaxy',mop]])test(game+' presentation Go list is exactly the original source walkAction list',()=>{
 const source=readFileSync('public/games/'+game+'/script.js','utf8');
 const literal=source.match(/const WALK_USE = (\{[^;]+\});/)[1];
 // Evaluate ONLY a static literal, never a story/puzzle handler.
 const walk=runInNewContext('('+literal+')');
 for(const [id,room] of Object.entries(rooms)){
  assert.deepEqual(room.spots.filter(s=>s.actions.some(a=>a.label==='Go')).map(s=>s.id).sort(),Array.from(walk[id]).sort(),id);
  for(const spot of room.spots){
   assert.ok(['self','object','portable','npc','exit'].includes(spot.kind));
   for(const a of spot.actions){assert.deepEqual(Object.keys(a).sort(),['label','verb']);assert.equal(a.verb,{Look:'look',Talk:'talk',Take:'take',Search:'take',Use:'use',Open:'use',Go:'use','Walk to':'walk'}[a.label]);if(a.label==='Take')assert.equal(spot.kind,'portable');}
  }
 }
});
test('presentation helper is publicly served without broadening any protected route',async()=>{
 const env=fixture();assert.equal((await call(env,'/context-input.js')).status,200);
 for(const path of ['/context-input.js.map','/%63ontext-input.js','/games/_shared/context-input.js','/games/port-lucky/context-input.js','/games/mop-galaxy/context-input.js'])assert.equal((await call(env,path)).status,404,path);
 assert.equal((await call(env,'/games/port-lucky/engine.js')).status,401);
 assert.equal((await call(env,'/games/mop-galaxy/engine.js')).status,401);
 const source=readFileSync('public/context-input.js','utf8');assert.doesNotMatch(source,/^import |HANDLERS|4471|gumbo|crackers/m);
});
