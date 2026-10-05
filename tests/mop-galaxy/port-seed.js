import {createHash} from 'node:crypto';import {sql,q} from './local-control.js';
const n=Math.floor(Date.now()/1000);let out='';
for(const [i,kind] of ['free','owner','walkthrough','other'].entries()){
 const id=`55555555-5555-4555-8555-${String(i+1).padStart(12,'0')}`;
 out+=`INSERT OR IGNORE INTO users(id,email,name,created_at,verified_at) VALUES('${id}','${kind}@port-lucky.example.test','Synthetic ${kind}',${n},${n});INSERT OR REPLACE INTO sessions(token_hash,user_id,created_at,expires_at) VALUES('${createHash('sha256').update('pl-session-'+kind).digest('hex')}','${id}',${n},${n+86400});DELETE FROM access_revocations WHERE user_id='${id}';\n`;
 for(const sku of kind==='walkthrough'?['port-lucky','port-lucky-walkthrough']:kind==='owner'?['port-lucky']:[])out+=`INSERT OR REPLACE INTO entitlement_contributions(user_id,sku,source_id,source,granted_at) VALUES('${id}',${q(sku)},'test','admin',${n});\n`;
}sql(out);
