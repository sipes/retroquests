import test from 'node:test';
import assert from 'node:assert/strict';
import {createPortLuckyHost} from '../../public/port-lucky-platform.js';

test('purchase resume pins host and later remount to checked account; revocation clears mount',async()=>{
 const old=globalThis.document;globalThis.document={addEventListener(){},removeEventListener(){}};
 let id='B',owned=true,mounted=[],unmounted=0;
 const host=createPortLuckyHost({container:{replaceChildren(){},querySelectorAll(){return[];}},interval:60000,
  fetch:async path=>Response.json(path==='/api/me'?{user:{id,verified:true},entitlements:owned?['port-lucky']:[]}:{catalog:{}}),
  mount:async(_,adapter)=>{const s=await adapter.getState();mounted.push(s.user.id);return {unmount(){unmounted++;}};},onError(){}});
 try{
  // Portal checked A; the next actual adapter request observes B instead.
  await assert.rejects(host.start('A'),/changed/);assert.deepEqual(mounted,[]);assert.equal(host.handle,null);
  id='A';await host.start('A');assert.deepEqual(mounted,['A']);
  id='B';await assert.rejects(host.refresh(),/changed/);await host.stop();assert.equal(unmounted,1);assert.deepEqual(mounted,['A']);assert.equal(host.handle,null);
  id='A';await host.start('A');owned=false;await assert.rejects(host.refresh(),/changed/);await host.stop();assert.equal(unmounted,2);assert.equal(host.handle,null);assert.deepEqual(mounted,['A','A']);
 }finally{await host.destroy();globalThis.document=old;}
});
