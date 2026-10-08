import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fixture,seed,call,mockNetwork,hash} from './helpers.js';
import {attributionStatement,rewardStatement} from '../../src/referrals.js';
test('invalid/expired/unknown/self referrals ignored; first valid pending attribution immutable; existing account ineligible',async()=>{
 const e=fixture(),a=seed(e,{email:'a@example.test'}),b=seed(e,{email:'b@example.test'}),pending=seed(e,{email:'pending@example.test',verified:false});
 e.DB.db.prepare('UPDATE users SET referral_eligible=1 WHERE id=?').run(pending.id);
 const la=await share(e,a),lb=await share(e,b);
 for(const id of ['invalid','x'.repeat(32),null])await attributionStatement(e,pending.id,id).run();
 assert.equal(e.DB.db.prepare('SELECT COUNT(*) n FROM referral_attributions').get().n,0);
 e.DB.db.prepare('UPDATE referral_links SET expires_at=1 WHERE id=?').run(la.referral_id);await attributionStatement(e,pending.id,la.referral_id).run();assert.equal(e.DB.db.prepare('SELECT COUNT(*) n FROM referral_attributions').get().n,0);
 e.DB.db.prepare('UPDATE referral_links SET expires_at=NULL WHERE id=?').run(la.referral_id);
 await attributionStatement(e,pending.id,la.referral_id).run();await attributionStatement(e,pending.id,lb.referral_id).run();assert.equal(e.DB.db.prepare('SELECT link_id FROM referral_attributions').get().link_id,la.referral_id);
 await attributionStatement(e,a.id,lb.referral_id).run();assert.equal(e.DB.db.prepare('SELECT COUNT(*) n FROM referral_attributions').get().n,1);
 e.DB.db.prepare('UPDATE referral_links SET owner_id=? WHERE id=?').run(pending.id,la.referral_id);await rewardStatement(e,pending.id,hash(pending.token)).run();assert.equal(e.DB.db.prepare('SELECT COUNT(*) n FROM referral_coupons').get().n,0);
 const net=mockNetwork();try{for(const [i,referral_id] of ['bad','z'.repeat(32)].entries())assert.equal((await call(e,'/api/signup',{method:'POST',data:{name:'LOCAL',email:`invalid${i}@example.test`,referral_id,turnstile_token:'LOCAL'}})).status,200);}finally{net.restore();}
});
test('already owned rejection preserves coupon; paid/referral provenance, save/hints, deletion detach safely',async()=>{
 const e=fixture(),u=seed(e),newcomer=seed(e,{email:'new2@example.test',verified:false}),s=await share(e,u);
 e.DB.db.prepare('UPDATE users SET referral_eligible=1 WHERE id=?').run(newcomer.id);await attributionStatement(e,newcomer.id,s.referral_id).run();await rewardStatement(e,newcomer.id,hash(newcomer.token)).run();const c=e.DB.db.prepare('SELECT * FROM referral_coupons').get();
 e.DB.db.prepare("INSERT INTO entitlement_contributions(user_id,sku,source_id,source,granted_at) VALUES(?,'port-lucky','paid-existing','stripe',1)").run(u.id);
 const redeem=game=>call(e,'/api/referrals/redeem',{method:'POST',token:u.token,data:{coupon_id:c.id,game}});
 assert.equal((await redeem('port-lucky')).status,409);assert.equal(e.DB.db.prepare('SELECT redeemed_at FROM referral_coupons').get().redeemed_at,null);
 assert.equal((await redeem('mop-galaxy')).status,200);
 e.DB.db.prepare("INSERT INTO purchases(id,user_id,sku,amount_cents,currency,status,created_at) VALUES('LOCAL-paid',?,'mop-galaxy',799,'usd','paid',1)").run(u.id);
 e.DB.db.prepare("INSERT INTO entitlement_contributions(user_id,sku,source_id,source,purchase_id,granted_at) VALUES(?,'mop-galaxy','LOCAL-paid','stripe','LOCAL-paid',1)").run(u.id);
 e.DB.db.prepare("UPDATE entitlement_contributions SET revoked_at=2 WHERE purchase_id='LOCAL-paid'").run();assert.equal((await call(e,'/games/mop-galaxy/game.js',{token:u.token})).status,200);
 assert.equal((await call(e,'/api/save',{method:'PUT',token:u.token,data:{game_id:'mop-galaxy',version:1,revision:0,data:{chapter:3,room:'bridge',ownerId:u.id}}})).status,200);
 assert.equal((await call(e,'/api/hint',{method:'POST',token:u.token,data:{game_id:'mop-galaxy',puzzle_id:'x',level:0}})).status,402);
 assert.equal((await call(e,'/api/account',{method:'DELETE',token:newcomer.token,data:{confirm:newcomer.email}})).status,200);assert.equal(e.DB.db.prepare('SELECT registration_id FROM referral_coupons').get().registration_id,null);
 assert.equal((await call(e,'/api/account',{method:'DELETE',token:u.token,data:{confirm:u.email}})).status,200);assert.equal(e.DB.db.prepare('SELECT owner_id FROM referral_coupons').get().owner_id,null);assert.equal(e.DB.db.prepare("SELECT user_id FROM purchases WHERE id='LOCAL-paid'").get().user_id,null);assert.equal(e.DB.db.prepare('PRAGMA foreign_key_check').all().length,0);
});
async function share(e,u,game='mop-galaxy'){const r=await call(e,'/api/referrals/share',{method:'POST',token:u.token,data:{game}});assert.equal(r.status,200);return r.json();}
test('existing verified signup and ordinary login never reward; name change preserves link identity',async()=>{
 const e=fixture(),u=seed(e),existing=seed(e,{email:'existing@example.test'}),net=mockNetwork();try{
 const link=await share(e,u);assert.equal((await call(e,'/api/signup',{method:'POST',data:{name:'Existing',email:existing.email,referral_id:link.referral_id,turnstile_token:'LOCAL'}})).status,200);
 const mail=net.mailbox[0];const path=new URL(mail.text.match(/http:\/\/localhost\/auth\/link\?token=[\w-]+/)[0]);assert.equal((await call(e,path.pathname+path.search)).status,302);
 e.DB.db.prepare('DELETE FROM email_log').run();assert.equal((await call(e,'/api/login',{method:'POST',data:{email:existing.email,referral_id:link.referral_id,turnstile_token:'LOCAL'}})).status,200);
 const login=new URL(net.mailbox.at(-1).text.match(/http:\/\/localhost\/auth\/link\?token=[\w-]+/)[0]);await call(e,login.pathname+login.search);assert.equal(e.DB.db.prepare('SELECT COUNT(*) n FROM referral_coupons').get().n,0);
 assert.equal((await call(e,'/api/account',{method:'PATCH',token:u.token,data:{name:'Changed name'}})).status,200);assert.equal((await share(e,u)).referral_id,link.referral_id);
 }finally{net.restore();}
});
test('entitlement insertion failure atomically rolls back coupon consumption',async()=>{
 const e=fixture(),u=seed(e),newcomer=seed(e,{email:'atomic@example.test',verified:false}),link=await share(e,u);
 e.DB.db.prepare('UPDATE users SET referral_eligible=1 WHERE id=?').run(newcomer.id);await attributionStatement(e,newcomer.id,link.referral_id).run();await rewardStatement(e,newcomer.id,hash(newcomer.token)).run();const c=e.DB.db.prepare('SELECT * FROM referral_coupons').get();
 const prepare=e.DB.prepare;e.DB.prepare=sql=>{const s=prepare(sql);if(sql.includes('INSERT INTO entitlement_contributions'))s.run=()=>{throw new Error('LOCAL injected insertion failure');};return s;};
 assert.equal((await call(e,'/api/referrals/redeem',{method:'POST',token:u.token,data:{coupon_id:c.id,game:'mop-galaxy'}})).status,500);
 assert.equal(e.DB.db.prepare('SELECT redeemed_at FROM referral_coupons').get().redeemed_at,null);assert.equal(e.DB.db.prepare('SELECT COUNT(*) n FROM entitlement_contributions').get().n,0);
});
test('concurrent missing then valid signup attributes the actual persisted pending account',async()=>{
 const e=fixture(),u=seed(e),net=mockNetwork();try{
 const s=await share(e,u);const prepare=e.DB.prepare;let readers=0,release;const gate=new Promise(r=>release=r);
 e.DB.prepare=sql=>{const statement=prepare(sql);if(sql==='SELECT * FROM users WHERE email = ?'){const first=statement.first.bind(statement);statement.first=async()=>{const result=await first();if(readers<2){if(++readers===2)release();await gate;}return result;};}return statement;};
 const signup=referral_id=>call(e,'/api/signup',{method:'POST',data:{name:'LOCAL race',email:'signup-race@example.test',referral_id,turnstile_token:'LOCAL'}});
 const results=await Promise.all([signup('invalid'),signup(s.referral_id)]);assert.deepEqual(results.map(r=>r.status),[200,200]);
 const row=e.DB.db.prepare('SELECT a.link_id FROM referral_attributions a JOIN users u ON u.id=a.registration_id WHERE u.email=?').get('signup-race@example.test');assert.equal(row?.link_id,s.referral_id);
 }finally{net.restore();}
});
test('verified sharer opaque public game link, anonymous plain link and all catalogue entries',async()=>{const e=fixture(),u=seed(e);const a=await share(e,{});assert.equal(new URL(a.url).searchParams.has('ref'),false);for(const game of ['port-lucky','mop-galaxy','thistlemere','nine-miles','harrowgate']){const s=await share(e,u,game);assert.equal(new URL(s.url).searchParams.get('game'),game);assert.match(s.referral_id,/^[A-Za-z0-9_-]{32}$/);assert.ok(!s.url.includes(u.id));}assert.equal((await call(e,'/api/referrals/share',{method:'POST',token:u.token,data:{game:'__proto__'}})).status,400);});
test('new signup attribution survives separate verification, replay, login, redemption races and ownership',async()=>{const e=fixture(),u=seed(e),net=mockNetwork();try{const s=await share(e,u);const signup=await call(e,'/api/signup',{method:'POST',data:{name:'New LOCAL',email:'new@example.test',referral_id:s.referral_id,turnstile_token:'synthetic'}});assert.equal(signup.status,200);const mail=net.mailbox[0],link=(mail.text.match(/http:\/\/localhost\/auth\/link\?token=[\w-]+/)||[])[0];assert.ok(link);const path=new URL(link).pathname+new URL(link).search;const results=await Promise.all([call(e,path),call(e,path)]);assert.equal(results.filter(r=>r.headers.has('set-cookie')).length,1);assert.equal(e.DB.db.prepare('SELECT COUNT(*) n FROM referral_coupons').get().n,1);const coupon=e.DB.db.prepare('SELECT * FROM referral_coupons').get();assert.equal(coupon.owner_id,u.id);const recipient=e.DB.db.prepare("SELECT id FROM users WHERE email='new@example.test'").get();assert.notEqual(coupon.owner_id,recipient.id);const other=seed(e,{email:'other@example.test'});const redeem=(who,game)=>call(e,'/api/referrals/redeem',{method:'POST',token:who.token,data:{coupon_id:coupon.id,game}});assert.equal((await redeem(other,'mop-galaxy')).status,409);for(const game of ['thistlemere','mop-galaxy-walkthrough','unknown'])assert.equal((await redeem(u,game)).status,400);const rr=await Promise.all([redeem(u,'mop-galaxy'),redeem(u,'port-lucky')]);assert.equal(rr.filter(r=>r.status===200).length,1);assert.equal((await call(e,'/api/me',{token:u.token})).status,200);assert.equal(e.DB.db.prepare("SELECT COUNT(*) n FROM entitlement_contributions WHERE source='referral'").get().n,1);assert.equal((await redeem(u,'mop-galaxy')).status,409);assert.equal((await call(e,'/api/hint',{method:'POST',token:u.token,data:{game_id:'mop-galaxy',puzzle_id:'x',level:0}})).status,402);assert.equal((await call(e,path)).headers.has('set-cookie'),false);}finally{net.restore();}});
