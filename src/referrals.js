import { PUBLIC_GAMES } from './catalog.js';
const n=()=>Math.floor(Date.now()/1000);
const opaque=()=>{const b=crypto.getRandomValues(new Uint8Array(24));return btoa(String.fromCharCode(...b)).replace(/\+/g,'-').replace(/\//g,'_');};
const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
export async function shareLink(env,user,game,origin){
 if(!Object.hasOwn(PUBLIC_GAMES,game))fail(400,'Unknown game.');
 const url=new URL('/',origin);url.searchParams.set('game',game);
 if(!user?.verified_at)return {url:url.href,referral_id:null,earn:false};
 await env.DB.prepare('INSERT OR IGNORE INTO referral_links(id,owner_id,game,created_at) VALUES(?,?,?,?)').bind(opaque(),user.id,game,n()).run();
 const link=await env.DB.prepare('SELECT id FROM referral_links WHERE owner_id=? AND game=?').bind(user.id,game).first();
 url.searchParams.set('ref',link.id);return {url:url.href,referral_id:link.id,earn:true};
}
export function attributionStatement(env,userId,id,email=null){
 // Malformed, unknown, expired and self identifiers never block registration.
 const valid=typeof id==='string' && /^[A-Za-z0-9_-]{32}$/.test(id)?id:'';
 return env.DB.prepare(`INSERT OR IGNORE INTO referral_attributions(registration_id,link_id,created_at)
 SELECT u.id,l.id,? FROM users u JOIN referral_links l ON l.id=? JOIN users s ON s.id=l.owner_id
 WHERE (u.id=? OR u.email=?) AND u.referral_eligible=1 AND u.verified_at IS NULL AND s.verified_at IS NOT NULL
 AND l.owner_id!=u.id AND (l.expires_at IS NULL OR l.expires_at>?)`).bind(n(),valid,userId,email,n());
}
export function rewardStatement(env,userId,sessionHash){
 return env.DB.prepare(`INSERT OR IGNORE INTO referral_coupons(id,owner_id,registration_id,link_id,issued_at)
 SELECT ?,l.owner_id,u.id,l.id,? FROM users u JOIN referral_attributions a ON a.registration_id=u.id
 JOIN referral_links l ON l.id=a.link_id JOIN users s ON s.id=l.owner_id
 WHERE u.id=? AND u.verified_at IS NULL AND u.referral_eligible=1 AND s.verified_at IS NOT NULL AND l.owner_id!=u.id
 AND EXISTS(SELECT 1 FROM sessions WHERE token_hash=? AND user_id=u.id)`).bind(opaque(),n(),userId,sessionHash);
}
export async function couponsFor(env,id){return (await env.DB.prepare('SELECT id,issued_at,redeemed_at,game FROM referral_coupons WHERE owner_id=? ORDER BY issued_at,id').bind(id).all()).results;}
export async function redeemCoupon(env,user,coupon,game){
 if(!user.verified_at)fail(403,'Verify your account first.');
 if(!Object.hasOwn(PUBLIC_GAMES,game) || !PUBLIC_GAMES[game].available)fail(400,'Choose an available full game, not a walkthrough.');
 const key=opaque(),time=n();
 const r=await env.DB.batch([
 env.DB.prepare(`UPDATE referral_coupons SET redeemed_at=?,game=?,claim_key=? WHERE id=? AND owner_id=? AND redeemed_at IS NULL
 AND NOT EXISTS(SELECT 1 FROM entitlements WHERE user_id=? AND sku=?)`).bind(time,game,key,String(coupon||''),user.id,user.id,game),
 env.DB.prepare(`DELETE FROM access_revocations WHERE user_id=? AND sku=? AND EXISTS(SELECT 1 FROM referral_coupons WHERE id=? AND owner_id=? AND claim_key=?)`).bind(user.id,game,String(coupon||''),user.id,key),
 env.DB.prepare(`INSERT INTO entitlement_contributions(user_id,sku,source_id,source,granted_at)
 SELECT owner_id,game,'referral:'||id,'referral',? FROM referral_coupons WHERE id=? AND owner_id=? AND claim_key=?`).bind(time,String(coupon||''),user.id,key)
 ]);
 if(!r[0].meta.changes)fail(409,'Coupon unavailable for this account, already redeemed, or game already owned.');
 return {ok:true,game};
}
