// Generates ONLY synthetic fixtures. Never use against remote D1.
import {writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const hash=s=>createHash('sha256').update(s).digest('hex');
const n=Math.floor(Date.now()/1000), ids={admin:'11111111-1111-4111-8111-111111111111',player:'22222222-2222-4222-8222-222222222222',buyer:'33333333-3333-4333-8333-333333333333'};
const q=s=>"'"+String(s).replaceAll("'","''")+"'";
const legacy={room:'suite',inv:[],flags:{},scored:{},score:0,hintsUsed:0,revealed:{},px:150,py:160,dir:1,started:true};
let sql='DELETE FROM users; DELETE FROM receipt_outbox; DELETE FROM purchases; DELETE FROM stripe_events; DELETE FROM payment_terminals; DELETE FROM admin_audit; DELETE FROM abuse_limits;\n';
for(const [kind,id] of Object.entries(ids)){sql+=`INSERT INTO users(id,email,name,created_at,verified_at) VALUES('${id}','${kind}@example.test','Synthetic ${kind}',${n},${kind==='admin'?'NULL':n});\n`;sql+=`INSERT INTO sessions(token_hash,user_id,created_at,expires_at) VALUES('${hash('synthetic-session-'+kind)}','${id}',${n},${n+3600});\n`;}
sql+=`INSERT INTO login_tokens(token_hash,user_id,created_at,expires_at) VALUES('${hash('synthetic-mailbox-proof-admin')}','${ids.admin}',${n},${n+3600});\n`;
sql+=`INSERT INTO saves(user_id,game_id,data,updated_at) VALUES('${ids.player}','port-lucky',${q(JSON.stringify(legacy))},${n});\n`;
sql+=`INSERT INTO purchases(id,user_id,sku,amount_cents,currency,status,created_at) VALUES('cs_runtime','${ids.buyer}','port-lucky',799,'usd','pending',${n});\n`;
writeFileSync('evidence/local-fixture.sql',sql);
console.log('Synthetic fixtures generated; hashed controlled mailbox proof, no capture endpoint.');
