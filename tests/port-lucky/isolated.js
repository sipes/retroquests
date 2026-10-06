// Local-only orchestrator: fresh state per run; no UAT/private runtime touched.
import {spawn,spawnSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,writeFileSync,createWriteStream} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=process.cwd(), evidence=resolve(process.env.PL_EVIDENCE || 'evidence/port-lucky');mkdirSync(evidence,{recursive:true});mkdirSync('.wrangler',{recursive:true});
const persist=mkdtempSync(resolve('.wrangler/port-lucky-isolated-'));
const config='dev/platform/wrangler.local.jsonc', wrangler=resolve('node_modules/.bin/wrangler'), port=process.env.PL_TEST_PORT || '8796';
const env={...process.env,WRANGLER_SEND_METRICS:'false',CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV:'false',PL_API_BASE:`http://127.0.0.1:${port}`,PL_BASE:`http://127.0.0.1:${port}/`,PL_PERSIST:persist,PL_CHROME:process.env.PL_CHROME || undefined};
function command(bin,args,log){const r=spawnSync(bin,args,{cwd:root,env,encoding:'utf8',maxBuffer:10*1024*1024});if(log)writeFileSync(resolve(evidence,log),r.stdout+r.stderr);if(r.status!==0)throw new Error(`${bin} ${args.join(' ')} failed: ${r.stdout}\n${r.stderr}`);return r.stdout;}
function d1(args,log){return command(wrangler,['d1',...args,'--local','--config',config,'--persist-to',persist,'--env-file','dev/platform/empty.vars'],log);}
d1(['migrations','apply','retro-quest-db'],'migrations.txt');command(process.execPath,['tests/platform/seed-local.js'],'seed.txt');d1(['execute','retro-quest-db','--file','evidence/local-fixture.sql'],'seed-d1.txt');
const worker=spawn(wrangler,['dev','--local','--config',config,'--ip','127.0.0.1','--port',port,'--persist-to',persist,'--env-file','dev/platform/empty.vars'],{cwd:root,env,stdio:['ignore','pipe','pipe']});const log=createWriteStream(resolve(evidence,'worker.txt'));worker.stdout.pipe(log);worker.stderr.pipe(log);
try{
 let ready=false;for(let i=0;i<100;i++){try{const r=await fetch(env.PL_API_BASE+'/api/config');if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,200));}if(!ready)throw new Error('Isolated Worker not ready');
 writeFileSync(resolve(evidence,'runtime.json'),JSON.stringify({pid:worker.pid,source:root,persist,base:env.PL_API_BASE,isolated:true},null,2));
 command(process.execPath,['tests/platform/runtime-local.js'],'runtime-regressions.txt');
 const hash=s=>createHash('sha256').update(s).digest('hex'),q=s=>"'"+s.replaceAll("'","''")+"'",n=Math.floor(Date.now()/1000);let sql='';
 for(const [i,kind] of ['free','owner','walkthrough','other'].entries()){
 const id=`55555555-5555-4555-8555-${String(i+1).padStart(12,'0')}`;
 sql+=`INSERT INTO users(id,email,name,created_at,verified_at) VALUES('${id}','${kind}@port-lucky.example.test','Synthetic ${kind}',${n},${n}); INSERT INTO sessions(token_hash,user_id,created_at,expires_at) VALUES('${hash('pl-session-'+kind)}','${id}',${n},${n+7200});\n`;
 if(['owner','walkthrough'].includes(kind))sql+=`INSERT INTO entitlement_contributions(user_id,sku,source_id,source,granted_at) VALUES('${id}','port-lucky','test','admin',${n});\n`;
 if(kind==='walkthrough')sql+=`INSERT INTO entitlement_contributions(user_id,sku,source_id,source,granted_at) VALUES('${id}','port-lucky-walkthrough','test','admin',${n});\n`;
 }
 writeFileSync(resolve(evidence,'game-fixtures.sql'),sql);d1(['execute','retro-quest-db','--file',resolve(evidence,'game-fixtures.sql')],'game-seed.txt');
 const browser=spawn(process.execPath,['tests/port-lucky/run.js',...process.argv.slice(2)],{cwd:root,env,stdio:['ignore','pipe','pipe']});const out=createWriteStream(resolve(evidence,'browser-run.txt'));browser.stdout.on('data',x=>{out.write(x);process.stdout.write(x);});browser.stderr.on('data',x=>{out.write(x);process.stderr.write(x);});const code=await new Promise(r=>browser.on('exit',r));out.end();if(code!==0)throw new Error('Integrated browser tests failed');
}finally{worker.kill('SIGTERM');await new Promise(r=>{worker.once('exit',r);setTimeout(r,5000);});log.end();}
