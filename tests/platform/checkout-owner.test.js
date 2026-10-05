import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture,seed,call} from './helpers.js';
for(const sku of ['port-lucky','port-lucky-walkthrough','mop-galaxy','mop-galaxy-walkthrough'])test(`${sku}: checkout rejects preflight owner/session race before any purchase/provider work`,async()=>{
 const e=fixture(),a=seed(e),b=seed(e,{email:'checkout-other@example.test'});
 const response=await call(e,'/api/checkout',{method:'POST',token:b.token,data:{sku,ownerId:a.id}});
 assert.equal(response.status,409);assert.match((await response.json()).error,/Checkout owner/);
 assert.equal(e.DB.db.prepare('SELECT count(*) n FROM purchases').get().n,0);
});
