import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import worker from '../../src/index.js';
// Fail any unmocked provider request before network access.
globalThis.fetch = async () => { throw new Error('Outbound network prohibited in Node tests'); };
export const hash = s => createHash('sha256').update(s).digest('hex');
export function database(migrate=true) {
 const db = new DatabaseSync(':memory:'); db.exec('PRAGMA foreign_keys=ON');
 for (const f of readdirSync('migrations').sort()) { if (!migrate && !f.startsWith('0001')) continue; db.exec(readFileSync('migrations/'+f,'utf8')); }
 const prepare = sql => ({ args: [], bind(...args) { this.args=args; return this; }, async first() { return db.prepare(sql).get(...this.args) || null; }, async all() { return {results:db.prepare(sql).all(...this.args)}; }, run() { const r=db.prepare(sql).run(...this.args); return {meta:{changes:Number(r.changes)}}; } });
 return { db, prepare, async batch(stmts) { db.exec('BEGIN'); try { const r=[]; for(const s of stmts) r.push(s.run()); db.exec('COMMIT'); return r; } catch(e) {db.exec('ROLLBACK'); throw e;} } };
}
export function fixture(migrate=true) { const DB=database(migrate); return { DB, DEV_MODE:'0', ADMIN_EMAILS:'admin@example.test', ASSETS:{fetch:async()=>new Response('asset')}, MAIL_FROM_EMAIL:'sender@example.test', MAILTRAP_TOKEN:'synthetic', MAILTRAP_INBOX_ID:'123', TURNSTILE_SECRET:'synthetic', TURNSTILE_HOSTNAME:'localhost' }; }
export function seed(env,{id=crypto.randomUUID(),email='player@example.test',verified=true,token=crypto.randomUUID()}={}) { const n=Math.floor(Date.now()/1000); env.DB.db.prepare('INSERT INTO users(id,email,name,created_at,verified_at) VALUES(?,?,?,?,?)').run(id,email,'Synthetic',n,verified?n:null); env.DB.db.prepare('INSERT INTO sessions VALUES(?,?,?,?)').run(hash(token),id,n,n+10000); return {id,email,token}; }
export async function call(env,path,{method='GET',data,token,headers={}}={}) { return worker.fetch(new Request('http://localhost'+path,{method,headers:{...(data?{'content-type':'application/json'}:{}),...(token?{cookie:'rq_session='+token}:{}),...headers},body:data?JSON.stringify(data):undefined}),env,{waitUntil(){}}); }
export function mockNetwork({fail=false}={}) { const original=globalThis.fetch; const mailbox=[]; globalThis.fetch=async(url,opts)=> { if(String(url).includes('turnstile')) return Response.json({success:true,hostname:'localhost',action:'auth'}); if(String(url).includes('mailtrap')) {mailbox.push(JSON.parse(opts.body)); return new Response('{}',{status:fail?500:200});} throw new Error('Outbound network prohibited'); }; return {mailbox,restore(){globalThis.fetch=original;}}; }
