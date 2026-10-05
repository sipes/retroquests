import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { fixture, seed, call } from './helpers.js';
import { createCheckout } from '../../src/stripe.js';
import { CATALOG } from '../../src/catalog.js';
import worker from '../../src/index.js';

const validPrice = (id='price_Game', amount=799) => ({id, object:'price', active:true, currency:'usd', unit_amount:amount, type:'one_time', recurring:null, billing_scheme:'per_unit', custom_unit_amount:null, tax_behavior:'exclusive', product:{id:'prod_Synthetic',active:true,metadata:{application:'retroquests',sku:amount===199?'port-lucky-walkthrough':'port-lucky'}}});
function setup(t) {
  const env=fixture(), user=seed(env), requests=[], original=globalThis.fetch;
  Object.assign(env,{STRIPE_SECRET_KEY:'synthetic-key', STRIPE_WEBHOOK_SECRET:'synthetic-signing-key', CONTENT_APPROVED:'1', PROVIDER_APPROVED:'1', RELEASE_APPROVED:'1', STRIPE_PRICE_PORT_LUCKY:'price_Game', STRIPE_PRICE_PORT_LUCKY_WALKTHROUGH:'price_Hints'});
  let priceOverride, priceStatus=200;
  globalThis.fetch=async (url, opts={})=>{
    requests.push({url:String(url),opts});
    if(String(url).startsWith('https://api.stripe.com/v1/prices/')) return Response.json(priceOverride === undefined ? validPrice(String(url).includes('price_Hints')?'price_Hints':'price_Game',String(url).includes('price_Hints')?199:799) : priceOverride,{status:priceStatus});
    if(String(url)==='https://api.stripe.com/v1/checkout/sessions') return Response.json({id:'cs_synthetic_'+requests.filter(r=>r.opts.method==='POST').length,url:'https://checkout.stripe.com/synthetic'});
    throw new Error('Outbound network prohibited');
  };
  t.after(()=>{globalThis.fetch=original;env.DB.db.close();});
  const completed=async p=>{
    const event={id:'evt_'+p.id,type:'checkout.session.completed',data:{object:{id:p.id,payment_status:'paid',amount_total:p.amount_cents,currency:'usd',payment_intent:'pi_'+p.id,client_reference_id:p.user_id,metadata:{user_id:p.user_id,sku:p.sku}}}};
    const raw=JSON.stringify(event),time=Math.floor(Date.now()/1000),sig=createHmac('sha256',env.STRIPE_WEBHOOK_SECRET).update(time+'.'+raw).digest('hex');
    return worker.fetch(new Request('http://localhost/api/stripe/webhook',{method:'POST',headers:{'stripe-signature':`t=${time},v1=${sig}`},body:raw}),env,{});
  };
  return {env,user,requests,completed,setPrice:(p,s=200)=>{priceOverride=p;priceStatus=s;}};
}

test('verified catalogue prices preserve pending records, metadata, same-game dependency and signed ownership',async t=>{
  const {env,user,requests,completed}=setup(t);
  assert.equal((await call(env,'/api/checkout',{method:'POST',token:user.token,data:{sku:'port-lucky-walkthrough'}})).status,409);
  assert.equal(requests.length,0);
  for(const [sku,id,amount] of [['port-lucky','price_Game',799],['port-lucky-walkthrough','price_Hints',199]]) {
    assert.equal((await call(env,'/api/checkout',{method:'POST',token:user.token,data:{sku}})).status,200);
    const get=requests.at(-2),params=new URLSearchParams(requests.at(-1).opts.body);
    assert.equal(get.url,`https://api.stripe.com/v1/prices/${id}?expand%5B%5D=product`);
    assert.equal(get.opts.headers.authorization,requests.at(-1).opts.headers.authorization);
    assert.equal(params.get('line_items[0][price]'),id);
    assert.equal(params.get('line_items[0][quantity]'),'1');
    assert.equal([...params.keys()].some(k=>k.includes('price_data')),false);
    assert.equal(params.get('client_reference_id'),user.id);
    for(const prefix of ['metadata','payment_intent_data[metadata]']) {assert.equal(params.get(prefix+'[user_id]'),user.id);assert.equal(params.get(prefix+'[sku]'),sku);}
    assert.equal(params.get('automatic_tax[enabled]'),'false');assert.equal(params.get('allow_promotion_codes'),'false');
    const p=env.DB.db.prepare('SELECT * FROM purchases WHERE sku=?').get(sku);
    assert.equal(p.status,'pending');assert.equal(p.amount_cents,amount);assert.equal(p.currency,'usd');
    const before=await (await call(env,'/api/me',{token:user.token})).json();assert.equal(before.entitlements.includes(sku),false);
    assert.equal((await completed(p)).status,200);
    assert.equal((await completed(p)).status,200);
    assert.equal((await (await call(env,'/api/me',{token:user.token})).json()).entitlements.includes(sku),true);
  }
  assert.equal(env.DB.db.prepare('SELECT count(*) n FROM entitlement_contributions').get().n,2);
  const other=seed(env,{email:'other@example.test'});
  assert.deepEqual((await (await call(env,'/api/me',{token:other.token})).json()).entitlements,[]);
});

test('invalid configured prices fail closed before session creation or pending purchase',async t=>{
  const {env,user,requests,setPrice}=setup(t);
  const variations=[null,{}, {...validPrice(),id:'price_Other'}, {...validPrice(),object:'product'}, {...validPrice(),active:false}, {...validPrice(),currency:'eur'}, {...validPrice(),unit_amount:800}, {...validPrice(),unit_amount:199}, {...validPrice(),unit_amount:null}, {...validPrice(),unit_amount:'799'}, {...validPrice(),type:'recurring'}, {...validPrice(),recurring:{}}, {...validPrice(),billing_scheme:'tiered'}, {...validPrice(),custom_unit_amount:{}}, {...validPrice(),tax_behavior:'inclusive'}, {...validPrice(),product:'prod_Synthetic'}, {...validPrice(),product:{active:false}}, {...validPrice(),product:{active:true,deleted:true}}];
  for(const p of variations) {
    setPrice(p);requests.length=0;
    const r=await call(env,'/api/checkout',{method:'POST',token:user.token,data:{sku:'port-lucky'}});
    assert.equal(r.status,502);assert.equal(requests.length,1);assert.equal(requests[0].opts.method,undefined);
    // The normal abuse limit is independent; reset only the isolated test fixture.
    env.DB.db.exec('DELETE FROM abuse_limits');
  }
  for (const metadata of [{application:'retroquests',sku:'another-game'}, {application:'unrelated',sku:'port-lucky'}, {}]) {
    setPrice({...validPrice(),product:{...validPrice().product,metadata}});requests.length=0;
    assert.equal((await call(env,'/api/checkout',{method:'POST',token:user.token,data:{sku:'port-lucky'}})).status,502);
    assert.equal(requests.length,1);
    env.DB.db.exec('DELETE FROM abuse_limits');
  }
  assert.equal(env.DB.db.prepare('SELECT count(*) n FROM purchases').get().n,0);
  setPrice(validPrice(),404);requests.length=0;
  assert.equal((await call(env,'/api/checkout',{method:'POST',token:user.token,data:{sku:'port-lucky'}})).status,502);
  assert.equal(requests.length,1);
});

test('malformed bindings are never normalized, looked up, or replaced by inline pricing',async t=>{
  const {env,user,requests}=setup(t);
  for(const id of ['', ' price_Game','price_Game ', 'price_Game/other','prod_Game',42]) {
    env.STRIPE_PRICE_PORT_LUCKY=id;
    assert.equal((await call(env,'/api/checkout',{method:'POST',token:user.token,data:{sku:'port-lucky'}})).status,502);
  }
  assert.equal(requests.length,0);
  assert.equal(env.DB.db.prepare('SELECT count(*) n FROM purchases').get().n,0);
});

test('unconfigured SKU retains inline USD pricing; configured prices are reverified each checkout',async t=>{
  const {env,user,requests,setPrice}=setup(t);
  delete env.STRIPE_PRICE_PORT_LUCKY;
  const args={product:CATALOG['port-lucky'],sku:'port-lucky',user,successUrl:'https://approved.example/?purchase=success',cancelUrl:'https://approved.example/?purchase=cancelled'};
  await createCheckout(env,args);
  assert.equal(requests.length,1);
  const params=new URLSearchParams(requests[0].opts.body);
  assert.equal(params.get('line_items[0][price_data][unit_amount]'),'799');assert.equal(params.get('line_items[0][price_data][currency]'),'usd');assert.equal(params.has('line_items[0][price]'),false);
  env.STRIPE_PRICE_PORT_LUCKY='price_Game';
  setPrice({...validPrice(),tax_behavior:'unspecified'});await createCheckout(env,args);
  setPrice({...validPrice(),active:false});await assert.rejects(createCheckout(env,args),e=>e.status===502);
  assert.equal(requests.filter(r=>r.opts.method==='POST').length,2);
});

test('price transport or invalid JSON failures expose no provider details and never create Checkout',async t=>{
  const {env,user}=setup(t),args={product:CATALOG['port-lucky'],sku:'port-lucky',user,successUrl:'https://approved.example/',cancelUrl:'https://approved.example/'};
  for(const fetcher of [async()=>{throw new Error('private provider detail');},async()=>new Response('not JSON')]) {
    globalThis.fetch=fetcher;
    await assert.rejects(createCheckout(env,args),e=>e.status===502 && !e.message.includes('private'));
  }
});
