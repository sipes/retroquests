import test from 'node:test';
import assert from 'node:assert/strict';
import {createPurchaseReturn} from '../../public/purchase-return.js';
const state=(owned=false,id='A',verified=true)=>({user:id?{id,verified}:null,entitlements:owned?['port-lucky']:[]});
function setup(states){let reads=0,starts=0;const messages=[];const flow=createPurchaseReturn({read:async()=>{const s=states[Math.min(reads++,states.length-1)];if(s instanceof Error)throw s;return s;},resume:async()=>{starts++;},status:s=>messages.push(s),wait:async()=>{},delays:[0,0]});return {flow,messages,get reads(){return reads;},get starts(){return starts;}};}
test('verified ownership resumes once; concurrent callbacks share work',async()=>{const s=setup([state(true)]);await Promise.all([s.flow.run('success','port-lucky'),s.flow.run('success','port-lucky')]);assert.equal(s.starts,1);assert.equal(s.reads,1);});
test('late server grant retries then resumes',async()=>{const s=setup([state(),state(),state(true)]);await s.flow.run('success','port-lucky');assert.equal(s.starts,1);assert.equal(s.reads,3);});
test('timeout stays truthful and bounded; explicit retry can recover',async()=>{const s=setup([state()]);await s.flow.run('success','port-lucky');assert.equal(s.reads,3);assert.equal(s.starts,0);assert.match(s.messages.at(-1).text,/not confirmed/);assert.equal(s.messages.at(-1).retry,true);await s.flow.run('success','port-lucky');assert.equal(s.reads,3);});
test('cancel, unknown SKU and walkthrough never auto-start game',async()=>{for(const [result,sku] of [['cancelled','port-lucky'],['success','bad'],['success','port-lucky-walkthrough']]){const s=setup([state(true)]);await s.flow.run(result,sku);assert.equal(s.starts,0);}});
test('signed out, unverified and switched identities never resume',async()=>{for(const states of [[state(true,null)],[state(true,'A',false)],[state(),state(true,'B')]]){const s=setup(states);await s.flow.run('success','port-lucky');assert.equal(s.starts,0);}});
test('explicit retry recovers and concurrent retry clicks share one check',async()=>{const s=setup([state(),state(),state(),state(true)]);await s.flow.run('success','port-lucky');await Promise.all([s.flow.run('success','port-lucky',{retry:true}),s.flow.run('success','port-lucky',{retry:true})]);assert.equal(s.reads,4);assert.equal(s.starts,1);});
test('network failure never invents ownership',async()=>{const s=setup([new Error('offline')]);await s.flow.run('success','port-lucky');assert.equal(s.starts,0);assert.equal(s.reads,3);assert.match(s.messages.at(-1).text,/not confirmed/);});
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};
test('successful automatic resume consumes status, failed resume preserves manual fallback',async()=>{
 for(const game of ['port-lucky','mop-galaxy'])for(const failed of [false,true]){
  const messages=[];let starts=0;const flow=createPurchaseReturn({read:async()=>({...state(),entitlements:[game]}),resume:async(s,id)=>{assert.equal(id,game);starts++;if(failed)throw Error('mount failed');},status:s=>messages.push(s)});
  await flow.run('success',game);assert.equal(starts,1);if(failed){assert.equal(messages.at(-1).play,true);assert.match(messages.at(-1).text,/not been reset/);}else assert.equal(messages.at(-1),null);
 }
});
test('dismiss during read, delay or resume cancels stale work and statuses',async()=>{
 for(const boundary of ['read','delay','resume']){
  const gate=deferred(),entered=deferred(),messages=[];let reads=0,starts=0,guard;
  const flow=createPurchaseReturn({read:async()=>{reads++;if(boundary==='read'){entered.resolve();await gate.promise;}return state(boundary!=='delay');},wait:async()=>{entered.resolve();await gate.promise;},delays:[0],resume:async(s,g,{isCurrent})=>{starts++;guard=isCurrent;entered.resolve();await gate.promise;},status:s=>messages.push(s)});
  const task=flow.run('success','port-lucky');await entered.promise;flow.cancel();const count=messages.length;if(guard)assert.equal(guard(),false);gate.resolve();await task;
  assert.equal(messages.length,count);assert.equal(messages.at(-1),null);assert.equal(starts,boundary==='resume'?1:0);if(boundary==='delay')assert.equal(reads,1);
 }
});
test('cancelled generation cannot finish or unset running state of a later retry',async()=>{
 const old=deferred(),next=deferred();let reads=0,starts=0;const messages=[];
 const flow=createPurchaseReturn({read:()=>++reads===1?old.promise:next.promise,resume:async()=>{starts++;},status:s=>messages.push(s)});
 const first=flow.run('success','port-lucky');flow.cancel({clear:false});const second=flow.run('success','port-lucky',{retry:true});old.resolve(state(true));await first;
 assert.equal(flow.run('success','port-lucky',{retry:true}),second);assert.equal(reads,2);assert.equal(starts,0);next.resolve(state(true));await second;assert.equal(starts,1);assert.equal(messages.at(-1),null);
});
