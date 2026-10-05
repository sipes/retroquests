import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHmac } from 'node:crypto';
import worker from '../../src/index.js';
import { CATALOG, GAMES } from '../../src/catalog.js';
import { createCheckout } from '../../src/stripe.js';
import { fixture, seed, call, mockNetwork } from './helpers.js';
import { validDemoSave } from '../../public/demos/mop-galaxy/save.js';
import { CHAPTER_START } from '../../public/games/mop-galaxy/script.js';
import { POINTS } from '../../public/games/mop-galaxy/data.js';

// All identities, price objects, signatures and provider responses are synthetic.
const mg = 'mop-galaxy', pl = 'port-lucky';
function grant(e,u,sku,source='test') {
  e.DB.db.prepare('INSERT INTO entitlement_contributions(user_id,sku,source_id,source,granted_at) VALUES(?,?,?,?,1)').run(u.id,sku,source,'admin');
}
const fresh = ownerId => ({v:2,ownerId,chapter:1,room:'closet',inv:['mop'],flags:{},scored:{},score:0,hintsUsed:0,revealed:{},px:150,py:160,dir:1,started:true,clock:null,checkpoint:null,done:false});
const sceneEnd = ownerId => ({...fresh(ownerId),room:'deck9',inv:['mymop','badge','wrapper','wrench'],flags:{lookedArm:true,gotBadge:true,sawBoarders:true,sawWrench:true,shelfWedged:true,gotWrench:true,vended:true,grilleOpen:true,mopChuted:true,tookMymop:true,leftDeck9:true},scored:{'look-arm':true,badge:true,vent:true,'shelf-look':true,'coin-vend':true,wrench:true,bolts:true,'mop-chute':true,climb:true},score:20,checkpoint:fresh(ownerId)});
function save(e,u,data,revision=0,game_id=mg,extra={}) { return call(e,'/api/save',{method:'PUT',token:u.token,data:{game_id,version:1,revision,ownerId:u.id,data,...extra}}); }
async function state(e,u) { return (await call(e,'/api/me',{token:u.token})).json(); }
function pending(e,u,id,sku) {
  e.DB.db.prepare('INSERT INTO purchases(id,user_id,sku,amount_cents,currency,status,created_at) VALUES(?,?,?,?,?,?,1)').run(id,u.id,sku,CATALOG[sku].price_cents,'usd','pending');
}
function complete(u,id,sku,pi='pi_'+id) { return {id,payment_status:'paid',amount_total:CATALOG[sku].price_cents,currency:'usd',payment_intent:pi,metadata:{user_id:u.id,sku,game_id:CATALOG[sku].game},client_reference_id:u.id}; }
async function webhook(e,type,object,id=crypto.randomUUID(),bad=false) {
  e.STRIPE_WEBHOOK_SECRET='synthetic-mg-only';
  const raw=JSON.stringify({id,type,data:{object}}),t=Math.floor(Date.now()/1000);
  const signature=createHmac('sha256',e.STRIPE_WEBHOOK_SECRET).update(t+'.'+raw).digest('hex');
  return worker.fetch(new Request('http://localhost/api/stripe/webhook',{method:'POST',headers:{'stripe-signature':`t=${t},v1=${bad?'00':signature}`},body:raw}),e,{});
}
const refund = (payment_intent,amount=799) => ({payment_intent,refunded:true,amount,amount_refunded:amount});
function approvals(e,email) { Object.assign(e,{CONTENT_APPROVED:'1',PROVIDER_APPROVED:'1',RELEASE_APPROVED:'1',STRIPE_SECRET_KEY:'synthetic',STRIPE_WEBHOOK_SECRET:'synthetic',SALES_TEST_EMAILS:email}); }
function price(sku,id) { return {id,object:'price',active:true,currency:'usd',unit_amount:CATALOG[sku].price_cents,type:'one_time',billing_scheme:'per_unit',tax_behavior:'exclusive',product:{id:'prod_synthetic',active:true,metadata:{application:'retroquests',sku,game_id:CATALOG[sku].game}}}; }
async function admin(e,a,u,action,sku) { return call(e,`/api/admin/users/${u.id}/${action}`,{method:'POST',token:a.token,data:{sku}}); }

test('Mop catalogue/hints import is byte-exact; public catalogue exposes no hint text',async()=>{
  assert.deepEqual(readFileSync('src/games/mop-galaxy-hints.js'),readFileSync('evidence/mop-galaxy-v1/inputs/src/games/mop-galaxy-hints.js'));
  assert.equal(Object.keys(GAMES[mg].puzzles).length,33);
  assert.ok(Object.values(GAMES[mg].puzzles).every(p=>p.length===3 && p.every(t=>typeof t==='string')));
  const e=fixture(),config=await (await call(e,'/api/config')).json();
  for(const [sku,cents,requires] of [[mg,799,null],[mg+'-walkthrough',199,mg],[pl,799,null],[pl+'-walkthrough',199,pl]]) {
    assert.equal(config.catalog[sku].price_cents,cents);assert.equal(config.catalog[sku].requires,requires);
    assert.equal(config.catalog[sku].currency,'usd');assert.equal(config.catalog[sku].sale_enabled,false);
    assert.equal(config.catalog[sku].game,sku.replace(/-walkthrough$/,''));
  }
  assert.doesNotMatch(JSON.stringify(config),/puzzles|You are not dressed for a crisis/);
});

test('protected assets require the exact verified base game, including the isolated Mop engine/primitives',async()=>{
  const e=fixture(),users={free:seed(e)};
  for(const [role,skus,verified] of [['pl',[pl],true],['mg',[mg],true],['both',[pl,mg],true],['walk',[mg+'-walkthrough'],true],['unverified',[pl,mg],false]]) {
    const u=users[role]=seed(e,{email:role+'@example.test',verified});for(const sku of skus)grant(e,u,sku);
  }
  const served=[];e.ASSETS.fetch=async req=>{served.push(new URL(req.url).pathname);return new Response('synthetic asset');};
  for(const [role,u] of [['anonymous',null],...Object.entries(users)]) {
    for(const game of [pl,mg])for(const file of ['game.js','script.js','art.js','rooms.js','data.js','engine.js','template.js','game.css',...(game===mg?['pixels.js']:[])]) {
      const allowed=role===game.replace('port-lucky','pl').replace('mop-galaxy','mg') || role==='both';
      assert.equal((await call(e,`/games/${game}/${file}`,{token:u?.token})).status,role==='anonymous'?401:allowed?200:402,role+':'+game+':'+file);
    }
    for(const file of ['engine.js','template.js','game.css','pixels.js'])assert.equal((await call(e,'/games/_shared/'+file,{token:u?.token})).status,404);
  }
  const count=served.length;
  for(const p of ['/games/unknown/game.js','/games/mop-galaxy-walkthrough/game.js','/games/_shared/mop-galaxy-hints.js','/games/mop-galaxy/mop-galaxy-hints.js','/games/mop-galaxy/private/hints.js','/games/mop-galaxy/%67ame.js','/games/mop-galaxy/game.js.map','/src/games/mop-galaxy-hints.js','/evidence/mop-galaxy-v1/inputs/src/games/mop-galaxy-hints.js'])assert.equal((await call(e,p,{token:users.both.token})).status,404,p);
  assert.equal(served.length,count);
  assert.equal((await call(e,'/demos/mop-galaxy/game.js')).status,200);
});

test('server free schema agrees with the extracted client schema and actual supplier chapter-1 presets',async()=>{
  const e=fixture(),u=seed(e),preset={...CHAPTER_START(1),ownerId:u.id};
  const snapshots=[preset,{...preset,checkpoint:structuredClone(preset)},sceneEnd(u.id),{...fresh(u.id),inv:['granules']}];
  for(let revision=0;revision<snapshots.length;revision++) {
    assert.equal(validDemoSave(snapshots[revision]),true);
    assert.equal((await save(e,u,snapshots[revision],revision)).status,200);
  }
  const points=sceneEnd(u.id);assert.equal(points.score,Object.keys(points.scored).reduce((n,key)=>n+POINTS[key],0));
});

test('free scene 1 includes closet AND deck9; scene-end checkpoint, CAS and separate accounts/games persist',async()=>{
  const e=fixture(),u=seed(e),b=seed(e,{email:'other@example.test'});
  assert.equal((await save(e,u,fresh(u.id))).status,200);
  const end=sceneEnd(u.id),rs=await Promise.all([save(e,u,end,1),save(e,u,end,1)]);
  assert.deepEqual(rs.map(r=>r.status).sort(),[200,409]);
  assert.equal((await save(e,b,fresh(b.id))).status,200);
  assert.equal((await save(e,u,{room:'garage',score:50},0,pl)).status,200); // legacy Port Lucky unchanged
  const s=await state(e,u);assert.deepEqual(s.saves[mg],end);assert.equal(s.save_envelopes[mg].revision,2);
  assert.equal(s.saves[pl].room,'garage');assert.equal(s.save_envelopes[pl].revision,1);
  assert.equal((await state(e,b)).saves[mg].room,'closet');
});

test('free saves reject paid rooms/items/flags/hints, invalid checkpoints and fields without touching saved progress',async()=>{
  const e=fixture(),u=seed(e);assert.equal((await save(e,u,sceneEnd(u.id))).status,200);
  const previous=await state(e,u);
  for(const patch of [{room:'cryo'},{chapter:2},{v:1},{inv:['notice']},{inv:['mop','mop']},{flags:{mopBack:true}},{flags:{gotBadge:'yes'}},{scored:{notice:true}},{revealed:{'wake-up':0}},{hintsUsed:1},{score:21},{score:1},{score:0.5},{px:-1},{py:181},{dir:0},{done:true},{clock:240},{hintText:'private'},{checkpoint:{...fresh(u.id),room:'cryo'}},{checkpoint:{...fresh(u.id),checkpoint:fresh(u.id)}}]) {
    assert.equal((await save(e,u,{...fresh(u.id),...patch},1)).status,400,JSON.stringify(patch));
    assert.deepEqual((await state(e,u)).save_envelopes,previous.save_envelopes);
  }
  for(const patch of [{ownerId:'other'},{checkpoint:{...fresh('other')}}])assert.equal((await save(e,u,{...fresh(u.id),...patch},1)).status,409);
  assert.equal((await save(e,u,fresh(u.id),1,mg,{ownerId:'other'})).status,409);
  assert.equal((await save(e,u,fresh(u.id),1,mg,{version:2})).status,400);
  assert.equal((await save(e,u,fresh(u.id),-1)).status,400);
  assert.equal((await save(e,u,{...fresh(u.id),extra:'漢'.repeat(22000)},1)).status,413);
  assert.deepEqual((await state(e,u)).save_envelopes,previous.save_envelopes);
});

test('owning Port Lucky or an orphan walkthrough does not allow paid Mop saves; base owner accepts full supplier shape',async()=>{
  const e=fixture(),u=seed(e),b=seed(e,{email:'other@example.test'});grant(e,u,pl);grant(e,u,mg+'-walkthrough');
  const paid={...fresh(u.id),chapter:8,room:'bridge2',inv:['mop','codecard'],flags:{okonjoAwake:true},score:250,clock:100,done:true,checkpoint:{...fresh(u.id),chapter:8,room:'lift'}};
  assert.equal((await save(e,u,paid)).status,400);grant(e,u,mg);
  assert.equal((await save(e,u,paid)).status,200);
  assert.equal((await save(e,b,paid)).status,409);
  assert.equal((await save(e,u,{...paid,checkpoint:{...paid.checkpoint,ownerId:b.id}},1)).status,409);
  assert.deepEqual((await state(e,u)).saves[mg],paid);
  const returned=await call(e,'/?purchase=success&sku=mop-galaxy',{token:b.token});assert.equal(returned.status,200);
  assert.deepEqual((await state(e,b)).entitlements,[]);
});

test('checkout pins per-game SKU metadata, USD amount, pending records and matching walkthrough dependencies',async()=>{
  const e=fixture(),u=seed(e);approvals(e,u.email);const calls=[],old=fetch;
  globalThis.fetch=async(url,opts)=>{assert.equal(String(url),'https://api.stripe.com/v1/checkout/sessions');const params=new URLSearchParams(opts.body);calls.push(params);return Response.json({id:'cs_mock_'+calls.length,url:'https://checkout.stripe.com/synthetic'});};
  try {
    assert.equal((await call(e,'/api/checkout',{method:'POST',token:u.token,data:{sku:mg+'-walkthrough'}})).status,409);
    grant(e,u,pl);assert.equal((await call(e,'/api/checkout',{method:'POST',token:u.token,data:{sku:mg+'-walkthrough'}})).status,409);
    for(const sku of [mg,pl+'-walkthrough'])assert.equal((await call(e,'/api/checkout',{method:'POST',token:u.token,data:{sku}})).status,200);
    grant(e,u,mg);assert.equal((await call(e,'/api/checkout',{method:'POST',token:u.token,data:{sku:mg+'-walkthrough'}})).status,200);
    for(const params of calls) {
      const sku=params.get('metadata[sku]'),game=CATALOG[sku].game;
      for(const prefix of ['metadata','payment_intent_data[metadata]']) {assert.equal(params.get(prefix+'[game_id]'),game);assert.equal(params.get(prefix+'[user_id]'),u.id);assert.equal(params.get(prefix+'[sku]'),sku);}
      assert.equal(params.get('line_items[0][price_data][product_data][metadata][game_id]'),game);
      assert.equal(Number(params.get('line_items[0][price_data][unit_amount]')),CATALOG[sku].price_cents);
      assert.equal(params.get('line_items[0][price_data][currency]'),'usd');assert.equal(params.get('allow_promotion_codes'),'false');assert.equal(params.get('automatic_tax[enabled]'),'false');
      assert.equal(new URL(params.get('success_url')).searchParams.get('sku'),sku);
    }
    const rows=e.DB.db.prepare('SELECT sku,status,amount_cents,currency FROM purchases ORDER BY id').all();
    assert.equal(rows.length,3);for(const p of rows){assert.equal(p.status,'pending');assert.equal(p.currency,'usd');assert.equal(p.amount_cents,CATALOG[p.sku].price_cents);}
    assert.deepEqual((await state(e,u)).entitlements.sort(),[mg,pl].sort());
  } finally {globalThis.fetch=old;}
});

test('Mop sales remain tester-only, verified, approval-gated and same-origin with zero provider calls on denial',async()=>{
  const e=fixture(),tester=seed(e),other=seed(e,{email:'notallowed@example.test'}),unverified=seed(e,{email:'unverified@example.test',verified:false});approvals(e,tester.email+','+unverified.email);
  let calls=0;const old=fetch;globalThis.fetch=async()=>{calls++;throw new Error('No outbound allowed');};
  try {
    for(const [token,status] of [[undefined,401],[other.token,503],[unverified.token,503]])assert.equal((await call(e,'/api/checkout',{method:'POST',token,data:{sku:mg}})).status,status);
    assert.equal((await call(e,'/api/checkout',{method:'POST',token:tester.token,headers:{origin:'https://elsewhere.example.test'},data:{sku:mg}})).status,403);
    e.SALES_TEST_EMAILS='';assert.equal((await call(e,'/api/checkout',{method:'POST',token:tester.token,data:{sku:mg}})).status,503);
    e.SALES_TEST_EMAILS=tester.email;e.RELEASE_APPROVED='0';assert.equal((await call(e,'/api/checkout',{method:'POST',token:tester.token,data:{sku:mg}})).status,503);
    assert.equal(calls,0);assert.equal(e.DB.db.prepare('SELECT count(*) n FROM purchases').get().n,0);
  } finally {globalThis.fetch=old;}
});

test('optional Mop Stripe price bindings are independently verified; wrong game/SKU/amount fails closed',async()=>{
  for(const [sku,binding,id] of [[mg,'STRIPE_PRICE_MOP_GALAXY','price_MopGame'],[mg+'-walkthrough','STRIPE_PRICE_MOP_GALAXY_WALKTHROUGH','price_MopWalk']]) {
    const old=fetch,env={STRIPE_SECRET_KEY:'synthetic',[binding]:id},args={product:CATALOG[sku],sku,user:{id:'synthetic',email:'test@example.test'},successUrl:'http://localhost',cancelUrl:'http://localhost'};
    let lookups=0,sessions=0,mutation=p=>p;
    globalThis.fetch=async(url,o)=>{
      if(String(url).startsWith('https://api.stripe.com/v1/prices/')) {lookups++;assert.equal(String(url),`https://api.stripe.com/v1/prices/${id}?expand%5B%5D=product`);return Response.json(mutation(price(sku,id)));}
      assert.equal(String(url),'https://api.stripe.com/v1/checkout/sessions');sessions++;const p=new URLSearchParams(o.body);assert.equal(p.get('line_items[0][price]'),id);assert.equal(p.has('line_items[0][price_data][unit_amount]'),false);assert.equal(p.get('metadata[game_id]'),mg);return Response.json({id:'cs_mock'});
    };
    try {
      await createCheckout(env,args);await createCheckout(env,args);assert.equal(lookups,2);assert.equal(sessions,2);
      for(const change of [p=>({...p,unit_amount:1}),p=>({...p,currency:'eur'}),p=>({...p,active:false}),p=>({...p,product:{...p.product,metadata:{...p.product.metadata,sku:pl}}}),p=>({...p,product:{...p.product,metadata:{...p.product.metadata,game_id:pl}}})]) {
        mutation=change;await assert.rejects(createCheckout(env,args),e=>e.status===502);assert.equal(sessions,2);
      }
      const before=lookups;for(const malformed of [' price_MopGame','price_MopGame ', 'price_bad-token',''])await assert.rejects(createCheckout({...env,[binding]:malformed},args),e=>e.status===502);
      assert.equal(lookups,before);assert.equal(sessions,2);
    } finally {globalThis.fetch=old;}
  }
});

test('signed Mop completions require matching game/user/SKU/currency/amount; asynchronous and duplicate effects grant once',async()=>{
  const e=fixture(),u=seed(e),net=mockNetwork();pending(e,u,'cs_mg',mg);const obj=complete(u,'cs_mg',mg);
  try {
    assert.equal((await webhook(e,'checkout.session.completed',obj,'bad-signature',true)).status,400);
    for(const patch of [{metadata:{...obj.metadata,game_id:pl}},{metadata:{user_id:u.id,sku:mg}},{metadata:{...obj.metadata,sku:pl}},{metadata:{...obj.metadata,user_id:'other'}},{currency:'eur'},{amount_total:1},{client_reference_id:'other'},{id:'cs_unknown'},{payment_intent:null}])assert.equal((await webhook(e,'checkout.session.completed',{...obj,...patch})).status,400);
    assert.equal(e.DB.db.prepare('SELECT count(*) n FROM stripe_events').get().n,0);
    assert.equal((await webhook(e,'checkout.session.completed',{...obj,payment_status:'unpaid'})).status,200);assert.deepEqual((await state(e,u)).entitlements,[]);
    const rs=await Promise.all(Array.from({length:5},()=>webhook(e,'checkout.session.async_payment_succeeded',obj,'evt_mg_same')));assert.ok(rs.every(r=>r.status===200));
    assert.deepEqual((await state(e,u)).entitlements,[mg]);assert.equal(e.DB.db.prepare('SELECT count(*) n FROM entitlement_contributions').get().n,1);
    assert.equal(e.DB.db.prepare('SELECT count(*) n FROM receipt_outbox').get().n,1);assert.equal(net.mailbox.length,1);
    assert.equal((await call(e,'/games/port-lucky/game.js',{token:u.token})).status,402);assert.equal((await call(e,'/games/mop-galaxy/game.js',{token:u.token})).status,200);
  } finally {net.restore();}
});

test('refund isolates payment contribution and same-game walkthrough; other game, saves and hint history survive',async()=>{
  const e=fixture(),u=seed(e),a=seed(e,{email:'admin@example.test'}),net=mockNetwork();
  try {
    for(const sku of [pl,pl+'-walkthrough',mg,mg+'-walkthrough']) {const id='cs_'+sku;pending(e,u,id,sku);assert.equal((await webhook(e,'checkout.session.completed',complete(u,id,sku))).status,200);}
    assert.equal((await save(e,u,sceneEnd(u.id))).status,200);
    assert.equal((await call(e,'/api/hint',{method:'POST',token:u.token,data:{game_id:mg,puzzle_id:'wake-up',level:0}})).status,200);
    assert.equal((await call(e,'/api/hint',{method:'POST',token:u.token,data:{game_id:pl,puzzle_id:'goat',level:0}})).status,200);
    assert.equal((await webhook(e,'charge.refunded',refund('pi_cs_'+mg))).status,200);
    assert.deepEqual((await state(e,u)).entitlements.sort(),[pl,pl+'-walkthrough'].sort());
    assert.equal((await call(e,'/api/hint',{method:'POST',token:u.token,data:{game_id:mg,puzzle_id:'wake-up',level:1}})).status,402);
    const history=await (await call(e,'/api/hints?game='+mg,{token:u.token})).json();assert.equal(history.count,1);assert.equal(history.revealed[0].text,null);
    assert.equal((await call(e,'/games/mop-galaxy/game.js',{token:u.token})).status,402);assert.equal((await call(e,'/games/port-lucky/game.js',{token:u.token})).status,200);
    const detail=await (await call(e,`/api/admin/users/${u.id}`,{token:a.token})).json();assert.deepEqual(detail.entitlements.map(x=>x.sku).sort(),[pl,pl+'-walkthrough'].sort());
    const list=await (await call(e,'/api/admin/users',{token:a.token})).json();assert.equal(list.users.find(x=>x.id===u.id).skus.includes(mg),false);
    const stats=await (await call(e,'/api/admin/stats',{token:a.token})).json();assert.equal(stats.sales,3);assert.equal(stats.revenue_cents,1197);assert.equal(stats.catalog[mg].price_cents,799);assert.ok(stats.recent.some(x=>x.sku===mg&&x.status==='refunded'));
    assert.deepEqual((await state(e,u)).saves[mg],sceneEnd(u.id));assert.equal(e.DB.db.prepare('SELECT count(*) n FROM hint_reveals').get().n,2);
    // An independent admin contribution restores only this base; the retained add-on can now work again.
    assert.equal((await admin(e,a,u,'grant',mg)).status,200);assert.ok((await state(e,u)).entitlements.includes(mg+'-walkthrough'));
    assert.equal((await admin(e,a,u,'revoke',mg)).status,200);assert.equal((await call(e,'/api/hint',{method:'POST',token:u.token,data:{game_id:mg,puzzle_id:'wake-up',level:1}})).status,402);
    assert.ok((await state(e,u)).entitlements.includes(pl+'-walkthrough'));
  } finally {net.restore();}
});

test('Mop refund-before-completion, distinct duplicate events and shared payment-intent replay cannot revive/cross-grant',async()=>{
  const e=fixture(),u=seed(e);pending(e,u,'cs_mg',mg);pending(e,u,'cs_pl',pl);
  assert.equal((await webhook(e,'charge.refunded',refund('pi_terminal'))).status,200);
  const obj=complete(u,'cs_mg',mg,'pi_terminal');assert.equal((await webhook(e,'checkout.session.completed',obj)).status,200);
  assert.equal((await webhook(e,'checkout.session.async_payment_succeeded',obj)).status,200);
  assert.deepEqual((await state(e,u)).entitlements,[]);assert.equal(e.DB.db.prepare('SELECT status FROM purchases WHERE id=?').get('cs_mg').status,'refunded');
  assert.equal((await webhook(e,'checkout.session.completed',complete(u,'cs_pl',pl,'pi_terminal'))).status,400);
  assert.equal(e.DB.db.prepare('SELECT count(*) n FROM receipt_outbox').get().n,0);
});

test('Mop hints preserve API contract, ordered tiers and per-game/per-user history with no public server-text route',async()=>{
  const e=fixture(),u=seed(e),b=seed(e,{email:'other@example.test'});grant(e,u,mg);grant(e,u,mg+'-walkthrough');grant(e,b,pl);grant(e,b,pl+'-walkthrough');
  const hint=(who,level,puzzle_id='wake-up',game_id=mg)=>call(e,'/api/hint',{method:'POST',token:who.token,data:{game_id,puzzle_id,level}});
  assert.equal((await hint(b,0)).status,402);assert.equal((await hint(u,2)).status,409);
  for(const level of [0,1,2]) {const r=await hint(u,level);assert.equal(r.status,200);assert.deepEqual(await r.json(),{puzzle_id:'wake-up',level,text:GAMES[mg].puzzles['wake-up'][level]});}
  assert.equal((await hint(u,2)).status,200);
  for(const [puzzle,game] of [['goat',mg],['constructor',mg],['wake-up','constructor']])assert.equal((await hint(u,0,puzzle,game)).status,400);
  assert.equal((await hint(u,0,'goat',pl)).status,402);
  const h=await (await call(e,'/api/hints?game='+mg,{token:u.token})).json();assert.equal(h.count,3);assert.deepEqual(h.revealed.map(x=>x.text),GAMES[mg].puzzles['wake-up']);
  assert.equal((await (await call(e,'/api/hints?game='+mg,{token:b.token})).json()).count,0);
  assert.equal((await (await call(e,'/api/hints?game='+pl,{token:u.token})).json()).count,0);
  assert.equal((await call(e,'/api/hints?game=constructor',{token:u.token})).status,400);
});

test('Mop grant/revoke rules do not borrow Port Lucky ownership, and invalid catalogue keys stay invalid',async()=>{
  const e=fixture(),u=seed(e),a=seed(e,{email:'admin@example.test'});grant(e,u,pl);
  assert.equal((await admin(e,a,u,'grant',mg+'-walkthrough')).status,409);
  assert.equal((await admin(e,a,u,'grant',mg)).status,200);assert.equal((await admin(e,a,u,'grant',mg+'-walkthrough')).status,200);
  for(const key of ['constructor','__proto__','toString']) {
    assert.equal((await admin(e,a,u,'grant',key)).status,400);
    assert.equal((await call(e,'/api/checkout',{method:'POST',token:u.token,data:{sku:key}})).status,400);
    assert.equal((await save(e,u,fresh(u.id),0,key)).status,400);
  }
  assert.equal((await admin(e,a,u,'revoke',mg+'-walkthrough')).status,200);
  assert.deepEqual((await state(e,u)).entitlements.sort(),[mg,pl].sort());
});
