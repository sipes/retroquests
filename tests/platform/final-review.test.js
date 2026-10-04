import test from 'node:test';
import assert from 'node:assert/strict';
import {createPlatform} from '../../public/platform.js';
import worker from '../../src/index.js';
import {fixture,seed,call,mockNetwork} from './helpers.js';
import {createHmac} from 'node:crypto';

test('out-of-order /me cannot restore stale player or paid access',async()=>{
 const resolves=[];
 const platform=createPlatform({fetch:()=>new Promise(r=>resolves.push(r))});
 const old=platform.getPlayerState('port-lucky');
 const rejected=assert.rejects(old,e=>e.code==='STATE_CHANGED');
 const latest=platform.getPlayerState('port-lucky');
 resolves[1](Response.json({user:{id:'B'},entitlements:[]}));
 assert.equal((await latest).user.id,'B');
 resolves[0](Response.json({user:{id:'A'},entitlements:['port-lucky']}));
 await rejected;
});

test('different simultaneous completion events claim a single receipt; provider failure visible for reconciliation',async()=>{
 const e=fixture(),u=seed(e),net=mockNetwork({fail:true});
 e.STRIPE_WEBHOOK_SECRET='synthetic-only';
 e.DB.db.prepare('INSERT INTO purchases(id,user_id,sku,amount_cents,currency,status,created_at) VALUES(?,?,?,?,?,?,?)').run('cs_review',u.id,'port-lucky',799,'usd','pending',1);
 async function event(id){const raw=JSON.stringify({id,type:'checkout.session.completed',data:{object:{id:'cs_review',payment_status:'paid',amount_total:799,currency:'usd',payment_intent:'pi_review',metadata:{user_id:u.id,sku:'port-lucky'}}}}),t=Math.floor(Date.now()/1000),sig=createHmac('sha256',e.STRIPE_WEBHOOK_SECRET).update(t+'.'+raw).digest('hex');return worker.fetch(new Request('http://localhost/api/stripe/webhook',{method:'POST',headers:{'stripe-signature':`t=${t},v1=${sig}`},body:raw}),e,{});}
 try {
  const rs=await Promise.all(Array.from({length:8},(_,i)=>event('evt_review_'+i)));
  assert.ok(rs.every(r=>r.status===200));
  assert.equal(e.DB.db.prepare("SELECT count(*) n FROM email_log WHERE kind='receipt'").get().n,1);
  assert.equal(e.DB.db.prepare('SELECT status FROM receipt_outbox').get().status,'failed');
  const a=seed(e,{email:'admin@example.test'});
  const report=await (await call(e,'/api/admin/reconciliation',{token:a.token})).json();
  assert.equal(report.receipts[0].status,'failed');
  e.DB.db.exec("UPDATE receipt_outbox SET status='sending'");
  assert.equal((await (await call(e,'/api/admin/reconciliation',{token:a.token})).json()).receipts[0].status,'sending');
 } finally {net.restore();}
});
