import test from 'node:test';import assert from 'node:assert/strict';
import {createPortLuckyAdapter} from '../../public/port-lucky-platform.js';
import {fixture,seed,call} from './helpers.js';
for(const method of ['save','revealHint','listHints','checkout'])for(const target of ['mop-galaxy','mop-galaxy-walkthrough','unknown','__proto__',null])test(`Port Lucky ${method} rejects ${target} before ANY network`,async()=>{
 let requests=0;const b=createPortLuckyAdapter({fetch:async p=>{requests++;if(p==='/api/me')return Response.json({user:{id:'A',verified:true},entitlements:['port-lucky','mop-galaxy']});if(p==='/api/config')return Response.json({catalog:{}});if(p==='/api/save')return Response.json({acknowledged:true,revision:1,updated_at:123});return Response.json({revealed:[],count:0});}});
 await b.refresh();requests=0;const invoke=()=>method==='save'?b.adapter.save(target,{ownerId:'A',room:'closet',flags:{},inv:[],score:0},{ownerId:'A'}):method==='revealHint'?b.adapter.revealHint(target,'goat',0):b.adapter[method](target);
 try{await assert.rejects(invoke,e=>e.code==='STATE_CHANGED');assert.equal(requests,0);}finally{b.dispose();}
});
test('actual Worker rejects unknown game/SKU without D1 mutation; catalogue games remain separate',async()=>{const e=fixture(),u=seed(e);for(const target of ['unknown','__proto__','mop-galaxy-walkthrough']){
 assert.equal((await call(e,'/api/save',{method:'PUT',token:u.token,data:{game_id:target,version:1,revision:0,ownerId:u.id,data:{}}})).status,400);
 assert.equal((await call(e,'/api/hint',{method:'POST',token:u.token,data:{game_id:target,puzzle_id:'goat',level:0}})).status,400);
 assert.equal((await call(e,'/api/hints?game='+target,{token:u.token})).status,400);
}assert.equal((await call(e,'/api/checkout',{method:'POST',token:u.token,data:{sku:'unknown',ownerId:u.id}})).status,400);assert.equal(e.DB.db.prepare('SELECT count(*) n FROM saves').get().n,0);assert.equal(e.DB.db.prepare('SELECT count(*) n FROM purchases').get().n,0);});
