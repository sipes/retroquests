import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fixture,seed,call,mockNetwork,hash} from './helpers.js';
const data={email:'new@entry.test',name:'New Player',free_play:true,game_id:'mop-galaxy',terms_accepted:true,turnstile_token:'synthetic'};
test('game intent remains immutable across concurrent game requests and normal login',async()=>{
 const env=fixture(),net=mockNetwork();try{
  await call(env,'/api/signup',{method:'POST',data});
  await call(env,'/api/signup',{method:'POST',data:{...data,game_id:'port-lucky'}});
  const rows=env.DB.db.prepare('SELECT game_id FROM login_tokens ORDER BY rowid').all();
  assert.deepEqual(rows.map(r=>r.game_id),['mop-galaxy','port-lucky']);
  assert.equal(net.mailbox.length,2);
  await call(env,'/api/signup',{method:'POST',data});assert.equal(net.mailbox.length,2,'same intent respects mail cooldown');
  await call(env,'/api/login',{method:'POST',data:{email:data.email,turnstile_token:'synthetic'}});
  assert.deepEqual(env.DB.db.prepare('SELECT game_id FROM login_tokens ORDER BY rowid').all().slice(0,2),rows);
  for(const [i,game] of ['mop-galaxy','port-lucky'].entries()){
   const link=net.mailbox[i].text.match(/http:\/\/localhost\/auth\/link\?token=[\w-]+/)[0],u=new URL(link);
   assert.equal((await call(env,u.pathname+u.search)).headers.get('location'),'http://localhost/?signin=ok&play='+game);
  }
 }finally{net.restore();}
});
test('free-play welcome binds validated intent to token, verifies once and redirects selected game',async()=>{
 const env=fixture(),net=mockNetwork();try{
 const r=await call(env,'/api/signup',{method:'POST',data});assert.deepEqual(await r.json(),{status:'link_sent'});
 const link=net.mailbox[0].text.match(/http:\/\/localhost\/auth\/link\?token=[\w-]+/)[0];
 const token=new URL(link).searchParams.get('token');const row=env.DB.db.prepare('SELECT * FROM login_tokens WHERE token_hash=?').get(hash(token));assert.equal(row.game_id,'mop-galaxy');
 const used=await call(env,new URL(link).pathname+new URL(link).search);assert.equal(used.headers.get('location'),'http://localhost/?signin=ok&play=mop-galaxy');assert.ok(used.headers.get('set-cookie'));
 const replay=await call(env,new URL(link).pathname+new URL(link).search);assert.equal(replay.headers.get('location'),'http://localhost/?signin=expired');assert.equal(replay.headers.get('set-cookie'),null);
 }finally{net.restore();}
});
test('same public response for existing and unverified email; never overwrites existing name',async()=>{
 for(const verified of [true,false]){const env=fixture(),u=seed(env,{email:data.email,verified}),net=mockNetwork();try{assert.deepEqual(await call(env,'/api/signup',{method:'POST',data}).then(r=>r.json()),{status:'link_sent'});assert.equal(env.DB.db.prepare('SELECT name FROM users WHERE id=?').get(u.id).name,'Synthetic');assert.equal(env.DB.db.prepare('SELECT game_id FROM login_tokens').get().game_id,'mop-galaxy');assert.equal(net.mailbox.length,1);}finally{net.restore();}}
});
test('free-play requires explicit terms and public playable game, never creates private accounts/intents',async()=>{
 for(const change of [{terms_accepted:false},{game_id:'thistlemere'},{game_id:'nine-miles'},{game_id:'__proto__'},{game_id:'https://evil.test'},{game_id:'mop-galaxy',free_play:'yes'}]){const env=fixture(),net=mockNetwork();try{const r=await call(env,'/api/signup',{method:'POST',data:{...data,...change}});assert.equal(r.status,400);assert.equal(net.mailbox.length,0);assert.equal(env.DB.db.prepare('SELECT count(*) AS n FROM users').get().n,0);}finally{net.restore();}}
});
test('normal signup remains additive and mail failure revokes entry token',async()=>{
 const env=fixture(),net=mockNetwork({fail:true});try{assert.equal((await call(env,'/api/signup',{method:'POST',data})).status,503);assert.equal(env.DB.db.prepare('SELECT count(*) AS n FROM login_tokens').get().n,0);}finally{net.restore();}
 const e=fixture(),n=mockNetwork();try{assert.equal((await call(e,'/api/signup',{method:'POST',data:{email:'ordinary@entry.test',name:'Ordinary',turnstile_token:'synthetic'}})).status,200);assert.equal(e.DB.db.prepare('SELECT game_id FROM login_tokens').get().game_id,null);}finally{n.restore();}
});
test('both cards use unified email-first entry and all paywalls state whole-game server price',()=>{
 const portal=readFileSync('public/portal.js','utf8');assert.match(portal,/Sign in or play free/);assert.match(portal,/free_play: true/);assert.match(portal,/query.get\('play'\)/);
 for(const p of ['public/demos/port-lucky/game.js','public/demos/mop-galaxy/engine.js','public/games/port-lucky/engine.js','public/games/mop-galaxy/engine.js']){const s=readFileSync(p,'utf8');assert.match(s,/all remaining scenes/);assert.match(s,/No recurring charge/);assert.match(s,/Unlock full game — \$\{/);assert.match(s,/optional add-on/);}
});
