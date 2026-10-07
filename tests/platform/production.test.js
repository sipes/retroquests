import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fixture,seed,call} from './helpers.js';
test('production full game static fallback requires verified exact ownership',async()=>{
 const env=fixture(); const a=seed(env,{email:'a@example.test'}), b=seed(env,{email:'b@example.test'}), unverified=seed(env,{email:'c@example.test',verified:false});
 assert.equal((await call(env,'/games/port-lucky/engine.js')).status,401);
 for(const token of [a.token,b.token,unverified.token])assert.equal((await call(env,'/games/port-lucky/game.js',{token})).status,402);
 env.DB.db.prepare("INSERT INTO entitlement_contributions(user_id,sku,source_id,source,granted_at) VALUES(?,'port-lucky','test','admin',1)").run(a.id);
 assert.equal((await call(env,'/games/port-lucky/engine.js',{token:a.token})).status,200);
 assert.equal((await call(env,'/games/port-lucky/engine.js',{token:b.token})).status,402);
 assert.equal((await call(env,'/games/future/game.js',{token:a.token})).status,404);
 env.DB.db.prepare('INSERT INTO access_revocations VALUES(?,?,1)').run(a.id,'port-lucky');
 assert.equal((await call(env,'/games/port-lucky/engine.js',{token:a.token})).status,402);
});
test('private routes never reach static fallback and Turnstile configuration matches CSP',async()=>{
 const env=fixture();env.TURNSTILE_SITE_KEY='public-site-key';
 for(const p of ['/__uat','/__uat/x','/tests/platform/helpers.js','/src/games/port-lucky-hints.js','/.env','/dev/x','/scripts/x','/public.map'])assert.equal((await call(env,p)).status,404);
 const r=await call(env,'/api/config'); assert.equal((await r.json()).turnstileSiteKey,'public-site-key');
 assert.match(r.headers.get('content-security-policy'),/frame-src https:\/\/challenges.cloudflare.com/);
 assert.equal((await call(env,'/api/signup',{method:'POST',data:{name:'Player',email:'player@example.test'}})).status,503);
});
test('production configuration permits approved public sales and runs Worker before all assets',()=>{
 const c=JSON.parse(readFileSync('wrangler.production.json'));
 assert.equal(c.assets.run_worker_first,true);assert.equal(c.vars.DEV_MODE,'0');assert.equal(c.vars.RELEASE_APPROVED,'1');assert.equal(Object.hasOwn(c.vars,'SALES_TEST_EMAILS'),false);assert.equal(c.vars.CONTENT_APPROVED,'1');assert.equal(c.vars.PROVIDER_APPROVED,'1');assert.equal(c.workers_dev,false);assert.equal(c.preview_urls,false);
 assert.match(readFileSync('scripts/provision-production.py','utf8'),/'RELEASE_APPROVED':'0'/);
 assert.equal(c.vars.STRIPE_PRICE_PORT_LUCKY,'price_1UNArtEKHBH8mBfWqkjQF8Fn');
 const bridge=readFileSync('public/port-lucky-platform.js','utf8');assert.doesNotMatch(bridge,/^import .*games\//m);
 assert.match(readFileSync('public/portal.js','utf8'),/turnstile_token: await authProof/);
});
