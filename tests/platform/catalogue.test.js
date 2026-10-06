import test from 'node:test';
import assert from 'node:assert/strict';
import {cataloguePresentation,createCatalogueReader} from '../../public/catalogue-state.js';
import {CHAPTER_START as pl} from '../../public/games/port-lucky/script.js';
import {CHAPTER_START as mg} from '../../public/games/mop-galaxy/script.js';
import {CHAPTERS as plChapters} from '../../public/games/port-lucky/data.js';
import {CHAPTERS as mgChapters} from '../../public/games/mop-galaxy/data.js';
const user={id:'A',verified:true};
const envelope=data=>({version:1,revision:4,data});
for(const [id,start,terminal] of [['port-lucky',pl,'leftSuite'],['mop-galaxy',mg,'leftDeck9']]){
 const state=(data,patch={})=>({user,entitlements:[id],save_envelopes:data===null?{}:{[id]:envelope(data)},...patch});
 const present=s=>cataloguePresentation(s,id);
 test(id+' CTA: owned/free/walkthrough/unverified/wrong account/revoke',()=>{
  assert.equal(present(state(null)).action,'Continue game');
  for(const patch of [{entitlements:[]},{entitlements:[id+'-walkthrough']},{user:{...user,verified:false}},{user:null}])assert.equal(present(state(null,patch)).action,'Play scene 1 free');
  const wrong=present(state({...start(4),ownerId:'B'}));assert.equal(wrong.progress,'Progress unavailable');
  assert.equal(present(state(null,{entitlements:[id==='port-lucky'?'mop-galaxy':'port-lucky']})).owned,false);
 });
 test(id+' durable early/mid/final and terminal chapter1 (not score/hints)',()=>{
  assert.equal(present(state(null)).progress,'0 / 8 scenes completed');
  for(let n=1;n<=8;n++)assert.equal(present(state({...start(n),ownerId:'A',score:999,hintsUsed:99})).progress,`${n-1} / 8 scenes completed`);
  assert.equal(present(state({...start(1),flags:{[terminal]:true}})).progress,'1 / 8 scenes completed');
  assert.equal(present(state({...start(8),room:id==='port-lucky'?'reception':'bridge2',done:true})).progress,'8 / 8 scenes completed');
  assert.equal(present(state(null,{user:null})).progress,'Sign in to see progress');
 });
 test(id+' invalid/unknown never fabricated; summary immutable',()=>{
  for(const patch of [{v:99},{chapter:9},{chapter:0},{chapter:'4'},{room:'unknown'},{flags:null},{done:true},{ownerId:'B'},{checkpoint:{ownerId:'B'}},{room:id==='port-lucky'?'garage':'cryo'},{done:'yes'}])assert.equal(present(state({...start(1),...patch})).progress,'Progress unavailable',JSON.stringify(patch));
  for(const patch of [{version:2},{revision:-1},{revision:1.5},{ownerId:'B'}]){const s=state(start(1));Object.assign(s.save_envelopes[id],patch);assert.equal(present(s).progress,'Progress unavailable');}
  const s=state(start(5)),before=structuredClone(s);for(let i=0;i<4;i++)present(s);assert.deepEqual(s,before);
 });
 test(id+' legacy read-only source contract',()=>{
  const d=start(2);delete d.v;delete d.chapter;delete d.checkpoint;const s=state(d),before=structuredClone(s);assert.equal(present(s).progress,'1 / 8 scenes completed');assert.deepEqual(s,before);
  const first=start(1);delete first.v;delete first.chapter;first.flags[terminal]=1;assert.equal(present(state(first)).progress,'1 / 8 scenes completed');
  if(id==='port-lucky'){d.flags.demoDone=true;d.done=true;assert.equal(present(state(d)).progress,'1 / 8 scenes completed');}
 });
}
for(const [id,start,chapters] of [['port-lucky',pl,plChapters],['mop-galaxy',mg,mgChapters]])test(id+' summary metadata matches every supplier chapter and room',()=>{
 assert.equal(chapters.length,8);assert.deepEqual(chapters.map(c=>c.n),[1,2,3,4,5,6,7,8]);
 for(const c of chapters)for(const room of c.rooms){const d={...start(c.n),room,ownerId:user.id},s={user,entitlements:[id],save_envelopes:{[id]:envelope(d)}};assert.equal(cataloguePresentation(s,id).progress,`${c.n-1} / 8 scenes completed`,room);const before=structuredClone(s);cataloguePresentation(s,id);assert.deepEqual(s,before);}
});
test('latest refresh wins; invalidation erases prior-account data; no summary writes',async()=>{
 let resolve;const held=new Promise(r=>resolve=r),commits=[],reader=createCatalogueReader(s=>commits.push(s));
 const old=reader.refresh(()=>held);await reader.refresh(async()=>({user:{id:'B'},save_envelopes:{}}));resolve({user,save_envelopes:{private:'A'}});await old;assert.equal(commits.length,1);assert.equal(commits[0].user.id,'B');
 let release;const pending=reader.refresh(()=>new Promise(r=>release=r));reader.invalidate();release({user});await pending;assert.deepEqual(commits.at(-1),{user:null,entitlements:[],save_envelopes:{}});
});
