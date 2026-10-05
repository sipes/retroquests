import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {fixture, seed, call, hash} from './helpers.js';
import {CATALOG, GAMES} from '../../src/catalog.js';
import worker from '../../src/index.js';
import {createPlatform, mountPlatformGame} from '../../public/platform.js';
import {createPortLuckyAdapter} from '../../public/port-lucky-platform.js';

// These mutable-module additions exist ONLY in this Node test process, never in production.
function secondGame() {
 CATALOG['sandbox-second']={name:'Synthetic second game',description:'Test fixture only',price_cents:799,game:'sandbox-second'};
 CATALOG['sandbox-second-walkthrough']={name:'Synthetic second hints',description:'Test fixture only',price_cents:199,game:'sandbox-second',requires:'sandbox-second'};
 GAMES['sandbox-second']={walkthroughSku:'sandbox-second-walkthrough',puzzles:{door:['Synthetic nudge']}};
 return ()=>{delete CATALOG['sandbox-second'];delete CATALOG['sandbox-second-walkthrough'];delete GAMES['sandbox-second'];};
}
function sandbox(t) {
 const remove=secondGame(),original=globalThis.fetch,requests=[];
 const env=fixture(),buyer=seed(env),other=seed(env,{email:'other@example.test'});
 Object.assign(env,{STRIPE_SECRET_KEY:'sk_test_synthetic',STRIPE_WEBHOOK_SECRET:'whsec_synthetic',CONTENT_APPROVED:'1',PROVIDER_APPROVED:'1',RELEASE_APPROVED:'1'});
 globalThis.fetch=async(url,opts)=>{
  if(String(url)==='https://api.stripe.com/v1/checkout/sessions') {
   const body=new URLSearchParams(opts.body);requests.push(body);
   return Response.json({id:'cs_sandbox_'+requests.length,url:'https://checkout.stripe.com/synthetic/'+requests.length});
  }
  // No email provider calls: receipt failure stays visible, ownership must still work.
  throw new Error('Outbound network prohibited in sandbox tests');
 };
 t.after(()=>{globalThis.fetch=original;remove();env.DB.db.close();});
 let sequence=0;
 async function event(object,{type='checkout.session.completed',id='evt_sandbox_'+(++sequence),badSignature=false}={}) {
  const raw=JSON.stringify({id,type,data:{object}}),time=Math.floor(Date.now()/1000);
  const sig=createHmac('sha256',badSignature?'wrong_synthetic':env.STRIPE_WEBHOOK_SECRET).update(time+'.'+raw).digest('hex');
  return worker.fetch(new Request('http://localhost/api/stripe/webhook',{method:'POST',headers:{'stripe-signature':`t=${time},v1=${sig}`},body:raw}),env,{});
 }
 async function buy(sku,token=buyer.token) {
  const r=await call(env,'/api/checkout',{method:'POST',token,data:{sku}});assert.equal(r.status,200);assert.match((await r.json()).url,/checkout\.stripe\.com/);
  const p=env.DB.db.prepare('SELECT * FROM purchases WHERE id=?').get('cs_sandbox_'+requests.length);
  return {id:p.id,payment_status:'paid',amount_total:p.amount_cents,currency:p.currency,payment_intent:'pi_'+p.id,client_reference_id:p.user_id,metadata:{user_id:p.user_id,sku:p.sku}};
 }
 async function owned(token=buyer.token,path='/api/me') {return (await (await call(env,path,{token})).json()).entitlements;}
 return {env,buyer,other,requests,event,buy,owned};
}

test('sandbox two-game purchases persist across reload/session; same-game dependencies and isolated full refund',async t=>{
 const {env,buyer,other,requests,event,buy,owned}=sandbox(t);
 assert.equal((await call(env,'/api/checkout',{method:'POST',token:buyer.token,data:{sku:'sandbox-second-walkthrough'}})).status,409);
 const first=await buy('port-lucky');assert.equal((await event(first)).status,200);
 assert.deepEqual(await owned(),['port-lucky']);assert.deepEqual(await owned(other.token),[]);
 assert.equal((await call(env,'/api/checkout',{method:'POST',token:buyer.token,data:{sku:'sandbox-second-walkthrough'}})).status,409);
 assert.equal(requests.length,1);
 const second=await buy('sandbox-second');assert.equal((await event(second,{id:'evt_second'})).status,200);
 assert.equal((await (await event(second,{id:'evt_second'})).json()).duplicate,true);
 assert.equal(env.DB.db.prepare('SELECT count(*) n FROM entitlement_contributions').get().n,2);
 assert.deepEqual((await owned()).sort(),['port-lucky','sandbox-second']);
 assert.deepEqual((await owned(buyer.token,'/api/me?purchase=success&sku=unowned')).sort(),['port-lucky','sandbox-second']);
 assert.equal((await call(env,'/api/checkout',{method:'POST',token:buyer.token,data:{sku:'port-lucky'}})).status,409);
 const addon=await buy('sandbox-second-walkthrough');assert.equal((await event(addon)).status,200);
 const params=requests[2];
 assert.equal(params.get('line_items[0][price_data][unit_amount]'),'199');
 assert.equal(params.get('line_items[0][price_data][currency]'),'usd');
 assert.equal(params.get('metadata[user_id]'),buyer.id);assert.equal(params.get('metadata[sku]'),'sandbox-second-walkthrough');
 assert.equal(params.get('payment_intent_data[metadata][sku]'),'sandbox-second-walkthrough');
 assert.equal(params.get('mode'),'payment');assert.equal(params.get('automatic_tax[enabled]'),'false');assert.equal(params.get('allow_promotion_codes'),'false');
 assert.equal(requests[0].get('line_items[0][price_data][unit_amount]'),'799');
 assert.equal(requests[1].get('line_items[0][price_data][unit_amount]'),'799');
 assert.equal((await call(env,'/api/hint',{method:'POST',token:buyer.token,data:{game_id:'port-lucky',puzzle_id:'goat',level:0}})).status,402);
 assert.equal((await call(env,'/api/hint',{method:'POST',token:buyer.token,data:{game_id:'sandbox-second',puzzle_id:'door',level:0}})).status,200);
 const now=Math.floor(Date.now()/1000),newToken='synthetic-reloaded-session';
 await call(env,'/api/logout',{method:'POST',token:buyer.token});
 env.DB.db.prepare('INSERT INTO sessions VALUES(?,?,?,?)').run(hash(newToken),buyer.id,now,now+3600);
 assert.deepEqual((await owned(newToken)).sort(),['port-lucky','sandbox-second','sandbox-second-walkthrough']);
 assert.equal((await event({payment_intent:first.payment_intent,refunded:true,amount:799,amount_refunded:799},{type:'charge.refunded',id:'evt_full_refund'})).status,200);
 assert.deepEqual((await owned(newToken)).sort(),['sandbox-second','sandbox-second-walkthrough']);
 assert.equal((await event(first,{id:'evt_late_complete'})).status,200);
 assert.deepEqual((await owned(newToken)).sort(),['sandbox-second','sandbox-second-walkthrough']);
 assert.equal(env.DB.db.prepare('SELECT status FROM purchases WHERE id=?').get(second.id).status,'paid');
 assert.deepEqual(await owned(other.token),[]);
});

test('sandbox wrong amounts/SKU/user/signatures, unpaid and cancelled returns never grant',async t=>{
 const {env,buyer,event,buy,owned}=sandbox(t),complete=await buy('sandbox-second');
 for(const bad of [
  {...complete,amount_total:199}, {...complete,amount_total:800}, {...complete,currency:'eur'},
  {...complete,metadata:{...complete.metadata,sku:'port-lucky'}},
  {...complete,metadata:{...complete.metadata,sku:'unknown-synthetic'}},
  {...complete,metadata:{...complete.metadata,user_id:'wrong-user'}},
  {...complete,client_reference_id:'wrong-user'}, {...complete,id:'cs_missing'}
 ]) {assert.equal((await event(bad)).status,400);assert.deepEqual(await owned(),[]);}
 assert.equal((await event(complete,{badSignature:true})).status,400);
 assert.equal((await event({...complete,payment_status:'unpaid'})).status,200);
 assert.equal((await event({...complete,payment_status:'unpaid'},{type:'checkout.session.expired'})).status,200);
 for(const query of ['purchase=cancelled','purchase=success&sku=sandbox-second']) assert.deepEqual(await owned(buyer.token,'/api/me?'+query),[]);
 assert.equal(env.DB.db.prepare('SELECT status FROM purchases').get().status,'pending');
 assert.equal(env.DB.db.prepare('SELECT count(*) n FROM entitlement_contributions').get().n,0);
 assert.equal(env.DB.db.prepare('SELECT count(*) n FROM receipt_outbox').get().n,0);
});

test('existing UI handoff helpers refresh authoritative server ownership, never trust success query',async t=>{
 const {env,buyer,event,buy}=sandbox(t);let mounts=[],destroyed=0;
 const fetcher=(path,opts)=>call(env,path,{token:buyer.token,method:opts.method,data:opts.body?JSON.parse(opts.body):undefined});
 const platform=createPlatform({fetch:fetcher,requestPurchase:async sku=>{assert.equal(sku,'sandbox-second');}});
 const root={replaceChildren(){}},host=await mountPlatformGame({root,platform,gameId:'sandbox-second',interval:60000,mount:async()=>{
  mounts.push((await platform.getPlayerState('sandbox-second')).entitlements);return {destroy(){destroyed++;}};
 }});t.after(()=>host.destroy());
 const completed=await buy('sandbox-second');await platform.requestPurchase('sandbox-second');
 await call(env,'/?purchase=success&sku=sandbox-second',{token:buyer.token});await host.refresh();
 assert.deepEqual(mounts,[[]]);assert.equal(destroyed,0);
 await event(completed);await host.refresh();assert.deepEqual(mounts,[[],['sandbox-second']]);assert.equal(destroyed,1);
 const reloaded=createPlatform({fetch:fetcher});assert.deepEqual((await reloaded.getPlayerState('sandbox-second')).entitlements,['sandbox-second']);
 await event({payment_intent:completed.payment_intent,refunded:true,amount:799,amount_refunded:799},{type:'charge.refunded'});
 await host.refresh();assert.deepEqual(mounts,[[],['sandbox-second'],[]]);assert.equal(destroyed,2);
});

test('accepted Port Lucky bridge reads server grants after checkout and invalidates on ownership change',async t=>{
 const {env,buyer,event}=sandbox(t);
 const prior=globalThis.location,redirects=[];
 globalThis.location={search:'?purchase=success',assign:url=>redirects.push(url)};
 t.after(()=>{if(prior===undefined)delete globalThis.location;else globalThis.location=prior;});
 const fetcher=(path,opts)=>call(env,path,{token:buyer.token,method:opts.method,data:opts.body?JSON.parse(opts.body):undefined});
 let changes=0;
 const bridge=createPortLuckyAdapter({fetch:fetcher,onAccessChange:()=>changes++});t.after(()=>bridge.dispose());
 assert.deepEqual((await bridge.adapter.getState()).entitlements,[]);
 await bridge.adapter.checkout('port-lucky');
 assert.equal(redirects.length,1);assert.deepEqual((await bridge.adapter.getState()).entitlements,[]);
 const pending=env.DB.db.prepare('SELECT * FROM purchases').get();
 await event({id:pending.id,payment_status:'paid',amount_total:pending.amount_cents,currency:'usd',payment_intent:'pi_bridge',metadata:{user_id:buyer.id,sku:'port-lucky'}});
 await assert.rejects(bridge.refresh(),e=>e.code==='STATE_CHANGED');assert.equal(changes,1);
 const remounted=createPortLuckyAdapter({fetch:fetcher});t.after(()=>remounted.dispose());
 assert.deepEqual((await remounted.adapter.getState()).entitlements,['port-lucky']);
});
