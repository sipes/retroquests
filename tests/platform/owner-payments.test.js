import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture,seed,call} from './helpers.js';
import {createHmac} from 'node:crypto';
import worker from '../../src/index.js';

test('signed completions validate currency user SKU purchase; delayed payment grants only after paid',async()=>{
 const env=fixture(),buyer=seed(env);
 env.STRIPE_WEBHOOK_SECRET='synthetic-owner-test';
 env.DB.db.prepare('INSERT INTO purchases(id,user_id,sku,amount_cents,currency,status,created_at) VALUES(?,?,?,?,?,?,?)').run('cs_owner',buyer.id,'port-lucky',799,'usd','pending',1);
 const complete={id:'cs_owner',payment_status:'paid',amount_total:799,currency:'usd',payment_intent:'pi_owner',metadata:{user_id:buyer.id,sku:'port-lucky'}};
 let sequence=0;
 async function event(object,type='checkout.session.completed') {
  const raw=JSON.stringify({id:'evt_owner_'+(++sequence),type,data:{object}}),t=Math.floor(Date.now()/1000);
  const sig=createHmac('sha256',env.STRIPE_WEBHOOK_SECRET).update(t+'.'+raw).digest('hex');
  return worker.fetch(new Request('http://localhost/api/stripe/webhook',{method:'POST',headers:{'stripe-signature':`t=${t},v1=${sig}`},body:raw}),env,{});
 }
 for(const bad of [ {...complete,currency:'eur'}, {...complete,metadata:{...complete.metadata,user_id:'wrong-user'}}, {...complete,metadata:{...complete.metadata,sku:'port-lucky-walkthrough'}}, {...complete,id:'cs_missing'} ]) assert.equal((await event(bad)).status,400);
 assert.equal((await event({...complete,payment_status:'unpaid'})).status,200);
 assert.equal(env.DB.db.prepare('SELECT status FROM purchases').get().status,'pending');
 assert.equal(env.DB.db.prepare('SELECT count(*) n FROM entitlement_contributions').get().n,0);
 assert.equal((await event(complete,'checkout.session.async_payment_succeeded')).status,200);
 assert.equal(env.DB.db.prepare('SELECT status FROM purchases').get().status,'paid');
 assert.deepEqual((await (await call(env,'/api/me',{token:buyer.token})).json()).entitlements,['port-lucky']);
});
