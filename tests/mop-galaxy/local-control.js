// Isolated local D1 controls; never remote and never a browser fixture adapter.
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
export const ROOT=path.resolve(import.meta.dirname,'../..');
export const E=path.join(ROOT,'evidence/mop-galaxy-v1');
export const BASE=process.env.MG_BASE || 'http://127.0.0.1:8799';
export const ids={owner:'10000000-0000-4000-8000-000000000001',walkthrough:'10000000-0000-4000-8000-000000000002',free:'10000000-0000-4000-8000-000000000003',port:'10000000-0000-4000-8000-000000000004',both:'10000000-0000-4000-8000-000000000005',admin:'10000000-0000-4000-8000-000000000006',buyer:'10000000-0000-4000-8000-000000000007'};
export const token=p=>'synthetic-mop-session-'+p;
const hash=s=>createHash('sha256').update(s).digest('hex');
export const q=s=>"'"+String(s).replaceAll("'","''")+"'";
export function sql(text){
 if(!BASE.startsWith('http://127.0.0.1:'))throw new Error('Local loopback only');
 const file=path.join(E,'control-'+process.pid+'.sql');fs.writeFileSync(file,text);
 let r;
 for(let attempt=0;attempt<5;attempt++){
  try{r=execFileSync('npm',['exec','--no','--','wrangler','d1','execute','retroquests-mop-local','--local','--config',path.join(E,'wrangler.local.jsonc'),'--persist-to',path.join(E,'local-state'),'--file',file],{cwd:ROOT,encoding:'utf8',env:{...process.env,CLOUDFLARE_API_TOKEN:'',CLOUDFLARE_API_KEY:'',CLOUDFLARE_EMAIL:'',WRANGLER_SEND_METRICS:'false'}});break;}
  catch(error){if(attempt===4 || !String(error.stderr).includes('SQLITE_BUSY'))throw error;Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,500);}
 }
 fs.appendFileSync(path.join(E,'d1-controls.log'),r);return r;
}
export function seed(){
 const n=Math.floor(Date.now()/1000);let out='';
 for(const [p,id] of Object.entries(ids)){
 out+=`INSERT OR IGNORE INTO users(id,email,name,created_at,verified_at) VALUES(${q(id)},${q(p+'@example.test')},${q('Synthetic '+p)},${n},${n});\n`;
 out+=`INSERT OR REPLACE INTO sessions(token_hash,user_id,created_at,expires_at) VALUES(${q(hash(token(p)))},${q(id)},${n},${n+86400});\n`;
 const skus=p==='walkthrough'?['mop-galaxy','mop-galaxy-walkthrough']:p==='owner'?['mop-galaxy']:p==='port'?['port-lucky','port-lucky-walkthrough']:p==='both'?['mop-galaxy','mop-galaxy-walkthrough','port-lucky','port-lucky-walkthrough']:[];
 for(const sku of skus)out+=`INSERT OR IGNORE INTO entitlement_contributions(user_id,sku,source_id,source,granted_at) VALUES(${q(id)},${q(sku)},'synthetic-local','admin',${n});\n`;
 }return sql(out);
}
export async function api(p,pathname,{method='GET',data,raw,headers={}}={}){
 const r=await fetch(BASE+pathname,{method,headers:{...(p && p!=='anon'?{cookie:'rq_session='+token(p)}:{}),...(data?{'content-type':'application/json'}:{}),...headers},body:raw??(data?JSON.stringify(data):undefined)});
 return r;
}
export function reset(p){sql(`DELETE FROM saves WHERE user_id=${q(ids[p])} AND game_id='mop-galaxy'; DELETE FROM hint_reveals WHERE user_id=${q(ids[p])} AND game_id='mop-galaxy'; DELETE FROM access_revocations WHERE user_id=${q(ids[p])};`);}
if(process.argv[1]===path.join(import.meta.dirname,'local-control.js'))seed();
