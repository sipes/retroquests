// Task-local real Worker/D1 browser orchestrator. Never remote.
import {spawn,spawnSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,writeFileSync,createWriteStream} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=process.cwd(),evidence=resolve('evidence/scene-rewind-v1');mkdirSync(evidence,{recursive:true});mkdirSync('.wrangler',{recursive:true});
const persist=mkdtempSync(resolve('.wrangler/port-lucky-isolated-')),config='dev/platform/wrangler.local.jsonc',wrangler=resolve('node_modules/.bin/wrangler'),port='8826';
const env={...process.env,WRANGLER_SEND_METRICS:'false',CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV:'false',CLOUDFLARE_API_TOKEN:'',CLOUDFLARE_API_KEY:'',CLOUDFLARE_EMAIL:'',PL_API_BASE:`http://127.0.0.1:${port}`,PL_BASE:`http://127.0.0.1:${port}/`,PL_PERSIST:persist,PL_EVIDENCE:evidence};
function command(bin,args,name){const r=spawnSync(bin,args,{cwd:root,env,encoding:'utf8',maxBuffer:10*1024*1024});writeFileSync(resolve(evidence,name),r.stdout+r.stderr);if(r.status!==0)throw new Error(r.stdout+r.stderr);}
function d1(args,name){command(wrangler,['d1',...args,'--local','--config',config,'--persist-to',persist,'--env-file','dev/platform/empty.vars'],name);}
d1(['migrations','apply','retro-quest-db'],'migrations.txt');
const n=Math.floor(Date.now()/1000),hash=s=>createHash('sha256').update(s).digest('hex');let sql='';
for(const [i,kind] of ['free','owner','walkthrough','other'].entries()){
 const id=`55555555-5555-4555-8555-${String(i+1).padStart(12,'0')}`;
 sql+=`INSERT INTO users(id,email,name,created_at,verified_at) VALUES('${id}','${kind}@rewind.example.test','Synthetic ${kind}',${n},${n}); INSERT INTO sessions(token_hash,user_id,created_at,expires_at) VALUES('${hash('pl-session-'+kind)}','${id}',${n},${n+14400});\n`;
 if(['owner','walkthrough'].includes(kind))for(const game of ['port-lucky','mop-galaxy'])sql+=`INSERT INTO entitlement_contributions(user_id,sku,source_id,source,granted_at) VALUES('${id}','${game}','rewind-test','admin',${n});\n`;
}
writeFileSync(resolve(evidence,'game-fixtures.sql'),sql);d1(['execute','retro-quest-db','--file',resolve(evidence,'game-fixtures.sql')],'game-seed.txt');
const worker=spawn(wrangler,['dev','--local','--config',config,'--ip','127.0.0.1','--port',port,'--inspector-port','9266','--persist-to',persist,'--env-file','dev/platform/empty.vars'],{cwd:root,env,stdio:['ignore','pipe','pipe']}),log=createWriteStream(resolve(evidence,'worker.txt'));worker.stdout.pipe(log);worker.stderr.pipe(log);
try{
 let ready=false;for(let i=0;i<100;i++){try{if((await fetch(env.PL_API_BASE+'/api/config')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,200));}if(!ready)throw new Error('Worker not ready');
 writeFileSync(resolve(evidence,'runtime.json'),JSON.stringify({pid:worker.pid,source:root,persist,base:env.PL_API_BASE,isolated:true},null,2));
 const browser=spawn(process.execPath,['tests/scene-rewind-legal-browser.js'],{cwd:root,env,stdio:['ignore','pipe','pipe']}),out=createWriteStream(resolve(evidence,'legal-browser.txt'));browser.stdout.on('data',x=>{out.write(x);process.stdout.write(x);});browser.stderr.on('data',x=>{out.write(x);process.stderr.write(x);});const code=await new Promise(r=>browser.on('exit',r));out.end();if(code!==0)throw new Error('Rewind browser tests failed');
}finally{worker.kill('SIGTERM');await new Promise(r=>{worker.once('exit',r);setTimeout(r,5000);});log.end();}
