import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture,seed,call} from './helpers.js';

test('admin target detail never labels unverified allowlisted identity privileged',async()=>{
 const env=fixture();
 const actor=seed(env,{email:'admin@example.test'});
 const target=seed(env,{email:'second-admin@example.test',verified:false});
 env.ADMIN_EMAILS='admin@example.test,second-admin@example.test';
 const response=await call(env,`/api/admin/users/${target.id}`,{token:actor.token});
 assert.equal(response.status,200);
 assert.equal((await response.json()).user.isAdmin,false);
 assert.equal((await call(env,'/api/admin/stats',{token:target.token})).status,403);
 env.DB.db.prepare('UPDATE users SET verified_at=? WHERE id=?').run(Math.floor(Date.now()/1000),target.id);
 assert.equal((await (await call(env,`/api/admin/users/${target.id}`,{token:actor.token})).json()).user.isAdmin,true);
});
