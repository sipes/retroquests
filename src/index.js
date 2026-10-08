// Retro Quest Arcade: platform API (Cloudflare Worker + D1)
// Accounts (passwordless email links), cloud saves, Stripe payments,
// Mailtrap emails, paid hints served from the server, and an admin API.

import { CATALOG, GAMES, PUBLIC_GAMES } from './catalog.js';
import {shareLink,attributionStatement,rewardStatement,couponsFor,redeemCoupon} from './referrals.js';
import {validHistory} from '../public/scene-history.js';
import { sendEmail, emails } from './email.js';
import { createCheckout, verifyStripeSignature } from './stripe.js';

const DAY = 86400;
const SESSION_DAYS = 180;
const LOGIN_LINK_MINUTES = 30;
const EMAIL_COOLDOWN_SECONDS = 60;
const MAX_SAVE_BYTES = 64 * 1024;
// Mop's supplier engine/primitives are copied into its own protected namespace;
// Port Lucky keeps its existing runtime. No cross-game/shared asset route.
const GAME_ASSETS = {
  'port-lucky': new Set(['art.js','data.js','engine.js','game.css','game.js','rooms.js','script.js','template.js']),
  'mop-galaxy': new Set(['art.js','data.js','engine.js','game.css','game.js','pixels.js','rooms.js','script.js','template.js'])
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    try {
      if (env.DEV_MODE === '1' && !isLoopback(url)) throw new HttpError(503, 'Unsafe development configuration.');
      const res = await route(request, env, ctx, url) || await env.ASSETS.fetch(request);
      return secureResponse(res, url);
    } catch (err) {
      if (err instanceof HttpError || err.status) return secureResponse(json({ error: err.message }, err.status), url);
      console.error('Unhandled platform error');
      return secureResponse(json({ error: 'Something went wrong on our side. Please try again.' }, 500), url);
    }
  }
};

// ---------- Router ----------
async function route(req, env, ctx, url) {
  const p = url.pathname, m = req.method;
  // Refuse noncanonical encoded paths before static serving can decode them.
  if (p.includes('%')) return json({error:'Not found'},404);
  // Gate before the static-assets binding; unknown/private paths never fall back.
  if (/^\/(?:__uat|tests|src|dev|scripts|evidence|\.git|\.env)(?:\/|$)/.test(p) || /\.(?:map|sql|sqlite|env)$/.test(p)) return json({error:'Not found'},404);
  if (p.startsWith('/games/')) {
    const asset = p.match(/^\/games\/(port-lucky|mop-galaxy)\/([a-z0-9-]+\.(?:js|css))$/);
    if (!asset || !GAME_ASSETS[asset[1]].has(asset[2])) return json({error:'Not found'},404);
    const u = await requireUser(req,env);
    const owned = await entitlementsFor(env,u.id);
    if (!u.verified_at || !owned.includes(asset[1])) throw new HttpError(402,'The full game requires a verified account and game ownership.');
    return env.ASSETS.fetch(req);
  }
  if (!p.startsWith('/api/') && !p.startsWith('/auth/')) return null;
  if (m !== 'GET' && m !== 'HEAD' && p !== '/api/stripe/webhook') checkSameOrigin(req, url);

  if (p === '/api/config' && m === 'GET') return json({ games: PUBLIC_GAMES, catalog: publicCatalog(env), devMode: false, saleEnabled: saleEnabled(env), saveVersion: 1, turnstileSiteKey: env.TURNSTILE_SITE_KEY || null });
  if (p === '/api/referrals/share' && m === 'POST') { const b=await body(req);return json(await shareLink(env,await currentUser(req,env),String(b.game || ''),url.origin)); }
  if (p === '/api/referrals/redeem' && m === 'POST') { const u=await requireUser(req,env),b=await body(req);await limit(env,'referral-redeem',u.id,30,60);return json(await redeemCoupon(env,u,b.coupon_id,String(b.game || ''))); }
  if (p === '/api/me' && m === 'GET') return me(req, env);
  if (p === '/api/signup' && m === 'POST') return signup(req, env, url);
  if (p === '/api/login' && m === 'POST') return requestLogin(req, env, url);
  if (p === '/auth/link' && m === 'GET') return useLoginLink(req, env, url);
  if (p === '/api/logout' && m === 'POST') return logout(req, env);
  if (p === '/api/account' && m === 'PATCH') return updateAccount(req, env);
  if (p === '/api/account' && m === 'DELETE') return deleteAccount(req, env);
  if (p === '/api/save' && m === 'PUT') return putSave(req, env);
  if (p === '/api/checkout' && m === 'POST') return checkout(req, env, url);
  if (p === '/api/stripe/webhook' && m === 'POST') return stripeWebhook(req, env, ctx);
  if (p === '/api/hint' && m === 'POST') return revealHint(req, env);
  if (p === '/api/hints' && m === 'GET') return listHints(req, env, url);

  if (p.startsWith('/api/admin/')) return admin(req, env, url);
  return json({ error: 'Not found' }, 404);
}

// ---------- Helpers ----------
class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
const now = () => Math.floor(Date.now() / 1000);
function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });
}
function checkSameOrigin(req, url) {
  const origin = req.headers.get('origin');
  if (origin && origin !== url.origin) throw new HttpError(403, 'Requests from other sites are not allowed.');
}
async function body(req) {
  const raw=await req.text();
  if(new TextEncoder().encode(raw).byteLength>16384) throw new HttpError(413,'Request body too large.');
  try { const b=JSON.parse(raw); if(!b || typeof b!=='object' || Array.isArray(b)) throw new Error(); return b; } catch { throw new HttpError(400, 'Send the request body as a JSON object.'); }
}
function b64url(bytes) {
  let s = ''; for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function randomToken(n = 32) { return b64url(crypto.getRandomValues(new Uint8Array(n))); }
async function sha256(text) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('');
}
function cleanEmail(e) {
  const v = String(e || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || v.length > 254) throw new HttpError(400, 'Enter an email address like name@example.com.');
  return v;
}
function cleanName(n) {
  const v = String(n || '').trim().replace(/\s+/g, ' ');
  if (!v) throw new HttpError(400, 'Enter your name.');
  if (v.length > 60) throw new HttpError(400, 'Keep your name under 60 characters.');
  return v;
}
function cookieValue(req, name) {
  const c = req.headers.get('cookie') || '';
  for (const part of c.split(/;\s*/)) { const i = part.indexOf('='); if (i > 0 && part.slice(0, i) === name) return decodeURIComponent(part.slice(i + 1)); }
  return null;
}
function sessionCookie(url, token, maxAge) {
  const secure = url.protocol === 'https:' ? '; Secure' : '';
  return `rq_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}
function isAdminEmail(env, email) {
  return String(env.ADMIN_EMAILS || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean).includes(email);
}
function publicCatalog(env = {}, user = null) {
  return Object.fromEntries(Object.entries(CATALOG).map(([sku, p]) => [sku, { name: p.name, price_cents: p.price_cents, currency: 'usd', display_price: new Intl.NumberFormat('en-US', {style:'currency',currency:'USD'}).format(p.price_cents/100), sale_enabled: saleEnabled(env, user), game: p.game, requires: p.requires || null }]));
}
function saleEnabled(env, user = null) {
  const approved = env.CONTENT_APPROVED === '1' && env.PROVIDER_APPROVED === '1' && env.RELEASE_APPROVED === '1' && !!env.STRIPE_SECRET_KEY && !!env.STRIPE_WEBHOOK_SECRET && (env.CURRENCY || 'usd') === 'usd' && env.STRIPE_AUTOMATIC_TAX !== '1';
  if (!approved) return false;
  // An absent restriction preserves the existing policy; an explicitly empty one closes sales.
  if (!Object.hasOwn(env, 'SALES_TEST_EMAILS')) return true;
  const allowed = String(env.SALES_TEST_EMAILS || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
  return !!user?.verified_at && allowed.includes(String(user.email || '').trim().toLowerCase());
}
function isLoopback(url) { return ['localhost','127.0.0.1','[::1]'].includes(url.hostname); }
function secureResponse(res, url) {
  const h = new Headers(res.headers);
  h.set('X-Content-Type-Options','nosniff'); h.set('Referrer-Policy','no-referrer'); h.set('X-Frame-Options','DENY');
  h.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  // Only the public portal may load the consent-gated Meta SDK. Admin/auth/API
  // retain the original policy; do not broadly allow third-party trackers.
  const metaPortal = ['/', '/index.html'].includes(url.pathname);
  const metaScript = metaPortal ? ' https://connect.facebook.net' : '';
  const metaNetwork = metaPortal ? ' https://www.facebook.com' : '';
  h.set('Content-Security-Policy', `default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${metaScript}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:${metaNetwork}; connect-src 'self' https://challenges.cloudflare.com${metaNetwork}; frame-src https://challenges.cloudflare.com; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'`);
  if(url.protocol === 'https:') h.set('Strict-Transport-Security','max-age=31536000');
  if (!/^\/icons\/[a-z0-9-]+\.png$/.test(url.pathname) && url.pathname !== '/manifest.webmanifest') h.set('Cache-Control','no-store');
  return new Response(res.body,{status:res.status,statusText:res.statusText,headers:h});
}
async function limit(env, scope, subject, max, seconds) {
  const window = Math.floor(now()/seconds)*seconds;
  const row = await env.DB.prepare('INSERT INTO abuse_limits(scope,subject_hash,window_start,hits) VALUES(?,?,?,1) ON CONFLICT(scope,subject_hash,window_start) DO UPDATE SET hits=hits+1 RETURNING hits').bind(scope,await sha256(subject),window).first();
  if(row.hits>max) throw new HttpError(429,'Too many requests. Try again later.');
  await env.DB.prepare('DELETE FROM abuse_limits WHERE window_start < ?').bind(now()-DAY).run();
}
async function authProtection(req,env,url,email,b) {
  await limit(env,'auth-ip',req.headers.get('cf-connecting-ip') || 'local',20,3600);
  await limit(env,'auth-mail',email,5,3600);
  if(!env.TURNSTILE_SECRET || !env.TURNSTILE_HOSTNAME || !b.turnstile_token) throw new HttpError(503,'Sign-in protection is not configured or proof is missing.');
  if(!env.MAILTRAP_TOKEN || !env.MAIL_FROM_EMAIL || env.MAIL_FROM_EMAIL.endsWith('@example.com')) throw new HttpError(503,'Email configuration unavailable.');
  let proof; try { const r=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:env.TURNSTILE_SECRET,response:String(b.turnstile_token)})}); proof=await r.json(); } catch { throw new HttpError(503,'Sign-in protection unavailable.'); }
  if(!proof.success || proof.hostname!==env.TURNSTILE_HOSTNAME || proof.action!=='auth') throw new HttpError(403,'Sign-in protection failed.');
}

// ---------- Sessions ----------
async function createSession(env, userId) {
  const token = randomToken();
  await env.DB.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
    .bind(await sha256(token), userId, now(), now() + SESSION_DAYS * DAY).run();
  return token;
}
async function currentUser(req, env) {
  const token = cookieValue(req, 'rq_session');
  if (!token) return null;
  const row = await env.DB.prepare(
    'SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?'
  ).bind(await sha256(token), now()).first();
  return row || null;
}
async function requireUser(req, env) {
  const u = await currentUser(req, env);
  if (!u) throw new HttpError(401, 'Sign in to continue.');
  return u;
}
async function entitlementsFor(env, userId) {
  const { results } = await env.DB.prepare('SELECT sku FROM entitlements WHERE user_id = ?').bind(userId).all();
  return effectiveEntitlements(results.map(r => r.sku));
}
// The legacy D1 view knows only Port Lucky's dependency. Apply the catalogue
// dependency to every game here, without changing or replacing its migrations.
function effectiveEntitlements(skus) {
  return skus.filter(sku => Object.hasOwn(CATALOG, sku) && (!CATALOG[sku].requires || skus.includes(CATALOG[sku].requires)));
}
function userOut(u, env) {
  return { id: u.id, email: u.email, name: u.name, verified: !!u.verified_at, isAdmin: !!u.verified_at && isAdminEmail(env, u.email) };
}

// ---------- Account endpoints ----------
async function me(req, env) {
  const u = await currentUser(req, env);
  if (!u) return json({ user: null });
  await env.DB.prepare('UPDATE users SET last_seen_at = ? WHERE id = ?').bind(now(), u.id).run();
  const [ents, saves] = await Promise.all([
    entitlementsFor(env, u.id),
    env.DB.prepare('SELECT game_id, data, version, revision, updated_at FROM saves WHERE user_id = ?').bind(u.id).all()
  ]);
  const saveMap = {};
  const envelopes = {};
  for (const s of saves.results) { try { saveMap[s.game_id] = JSON.parse(s.data); envelopes[s.game_id] = {version:s.version,data:saveMap[s.game_id],revision:s.revision}; } catch {} }
  return json({ user: userOut(u, env), coupons: await couponsFor(env,u.id), entitlements: ents, saves: saveMap, save_envelopes: envelopes, catalog: publicCatalog(env, u) });
}

async function signup(req, env, url) {
  const b = await body(req);
  const email = cleanEmail(b.email), name = cleanName(b.name);
  await authProtection(req,env,url,email,b);
  const existing = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  if (existing) {
    await attributionStatement(env,existing.id,b.referral_id).run();
    // Never hand out a session for an existing email: send a sign-in link instead.
    const dev = await sendLoginLink(env, url, existing, 'login');
    return json({ status: 'link_sent', ...dev });
  }
  const id = crypto.randomUUID();
  await env.DB.batch([
    env.DB.prepare('INSERT OR IGNORE INTO users (id, email, name, created_at, last_seen_at,referral_eligible) VALUES (?, ?, ?, ?, ?,1)').bind(id,email,name,now(),now()),
    attributionStatement(env,id,b.referral_id,email)
  ]);
  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  const dev = await sendLoginLink(env, url, user, 'welcome');
  return json({ status: 'link_sent', ...dev });
}

async function requestLogin(req, env, url) {
  const b = await body(req);
  const email = cleanEmail(b.email);
  await authProtection(req,env,url,email,b);
  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  let dev = {};
  if (user) dev = await sendLoginLink(env, url, user, 'login');
  else {
    const recent=await env.DB.prepare("SELECT 1 FROM email_log WHERE to_email=? AND kind='login' AND status='accepted' AND created_at>?").bind(email,now()-EMAIL_COOLDOWN_SECONDS).first();
    if(!recent && !await deliver(env,{id:null,email,name:'Player'},'login',{subject:'Retro Quest sign-in request',text:'If you do not have an account, create one in the arcade. No account access was granted.'})) throw new HttpError(503,'Email could not be accepted. Please try again later.');
  }
  // Same answer whether or not the account exists, so emails can't be probed.
  return json({ status: 'link_sent', ...dev });
}

async function sendLoginLink(env, url, user, kind) {
  const recent = await env.DB.prepare("SELECT created_at FROM email_log WHERE to_email = ? AND kind IN ('login','welcome') AND status='accepted' AND created_at > ? ORDER BY created_at DESC LIMIT 1")
    .bind(user.email, now() - EMAIL_COOLDOWN_SECONDS).first();
  if (recent) return {};
  const token = randomToken();
  await env.DB.prepare('INSERT INTO login_tokens (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
    .bind(await sha256(token), user.id, now(), now() + LOGIN_LINK_MINUTES * 60).run();
  const link = `${url.origin}/auth/link?token=${encodeURIComponent(token)}`;
  const mail = kind === 'welcome' ? emails.welcome(env, user, link) : emails.login(env, user, link, LOGIN_LINK_MINUTES);
  const accepted = await deliver(env, user, kind, mail);
  if(!accepted) { await env.DB.prepare('DELETE FROM login_tokens WHERE token_hash = ?').bind(await sha256(token)).run(); throw new HttpError(503,'Email could not be accepted. Please try again later.'); }
  return {};
}

async function deliver(env, user, kind, mail) {
  let status = 'accepted', error = null;
  try { await sendEmail(env, { to: user.email, toName: user.name, ...mail, category: kind }); }
  catch (e) { status = 'failed'; error = 'Email provider unavailable'; }
  await env.DB.prepare('INSERT INTO email_log (user_id, kind, to_email, status, error, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(user.id, kind, user.email, status, error, now()).run();
  return status === 'accepted';
}

async function useLoginLink(req, env, url) {
  const token = url.searchParams.get('token') || '';
  const row = token && await env.DB.prepare('SELECT * FROM login_tokens WHERE token_hash = ?').bind(await sha256(token)).first();
  if (!row || row.used_at || row.expires_at < now()) {
    return Response.redirect(`${url.origin}/?signin=expired`, 302);
  }
  const session = randomToken(), sh = await sha256(session);
  const results = await env.DB.batch([
    env.DB.prepare('INSERT INTO sessions(token_hash,user_id,created_at,expires_at) SELECT ?,user_id,?,? FROM login_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at>?').bind(sh,now(),now()+SESSION_DAYS*DAY,row.token_hash,now()),
    env.DB.prepare('UPDATE login_tokens SET used_at=?,consumed_session=? WHERE token_hash=? AND used_at IS NULL AND EXISTS(SELECT 1 FROM sessions WHERE token_hash=?)').bind(now(),sh,row.token_hash,sh),
    rewardStatement(env,row.user_id,sh),
    env.DB.prepare('UPDATE users SET verified_at=COALESCE(verified_at,?),last_seen_at=? WHERE id=? AND EXISTS(SELECT 1 FROM sessions WHERE token_hash=?)').bind(now(),now(),row.user_id,sh)
  ]);
  if(!results[0].meta.changes) return Response.redirect(`${url.origin}/?signin=expired`,302);
  return new Response(null, { status: 302, headers: { location: `${url.origin}/?signin=ok`, 'set-cookie': sessionCookie(url, session, SESSION_DAYS * DAY) } });
}

async function logout(req, env) {
  const token = cookieValue(req, 'rq_session');
  if (token) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(token)).run();
  return json({ ok: true }, 200, { 'set-cookie': 'rq_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0' });
}

async function updateAccount(req, env) {
  const u = await requireUser(req, env);
  const b = await body(req);
  const name = cleanName(b.name);
  await env.DB.prepare('UPDATE users SET name = ? WHERE id = ?').bind(name, u.id).run();
  return json({ ok: true, name });
}

async function deleteAccount(req, env) {
  const u = await requireUser(req, env);
  const b = await body(req);
  if (String(b.confirm || '').trim().toLowerCase() !== u.email) throw new HttpError(400, 'Type your email address to confirm.');
  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(u.id),
    env.DB.prepare('DELETE FROM login_tokens WHERE user_id = ?').bind(u.id),
    env.DB.prepare('DELETE FROM saves WHERE user_id = ?').bind(u.id),
    env.DB.prepare('DELETE FROM hint_reveals WHERE user_id = ?').bind(u.id),
    env.DB.prepare('DELETE FROM entitlement_contributions WHERE user_id = ?').bind(u.id),
    // Purchases are kept for accounting, but detached from personal data.
    env.DB.prepare('UPDATE purchases SET user_id = NULL WHERE user_id = ?').bind(u.id),
    env.DB.prepare('DELETE FROM email_log WHERE user_id = ? OR to_email = ?').bind(u.id,u.email),
    env.DB.prepare('DELETE FROM users WHERE id = ?').bind(u.id)
  ]);
  return json({ ok: true }, 200, { 'set-cookie': 'rq_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0' });
}

// ---------- Saves ----------
// Supplier scene 1 is BOTH closet and deck9 (20 points). No paid progress,
// hint text, extra fields or nested paid checkpoint can enter a free snapshot.
const MOP_FREE_ITEMS = new Set(['mop','mymop','badge','coin','snakpak','wrapper','wrench','granules']);
const MOP_FREE_FLAGS = new Set(['lookedArm','gotBadge','sawBoarders','sawWrench','shelfWedged','gotWrench','vended','grilleOpen','mopChuted','tookMymop','leftDeck9']);
const MOP_FREE_POINTS = {'look-arm':1,badge:2,vent:3,'shelf-look':1,'coin-vend':2,wrench:3,bolts:3,'mop-chute':3,climb:2};
const MOP_FREE_FIELDS = new Set(['v','ownerId','chapter','room','inv','flags','scored','score','hintsUsed','revealed','px','py','dir','started','clock','checkpoint','history','done']);
const plainObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const flagValue = v => typeof v === 'boolean' || v === 0 || v === 1;
function validMopFreeSave(s, ownerId, depth = 0) {
  if (!plainObject(s) || Object.keys(s).some(k => !MOP_FREE_FIELDS.has(k)) ||
      (s.ownerId !== undefined && s.ownerId !== ownerId) ||
      s.v !== 2 || s.chapter !== 1 ||
      !['closet','deck9'].includes(s.room) || !Array.isArray(s.inv) ||
      s.inv.some(id => !MOP_FREE_ITEMS.has(id)) || new Set(s.inv).size !== s.inv.length ||
      !plainObject(s.flags) || Object.entries(s.flags).some(([k,v]) => !MOP_FREE_FLAGS.has(k) || !flagValue(v)) ||
      !Number.isInteger(s.score) || s.score < 0 || s.score > 20 ||
      !plainObject(s.scored) || Object.entries(s.scored).some(([k,v]) => !Object.hasOwn(MOP_FREE_POINTS,k) || !flagValue(v)) ||
      s.score !== Object.entries(s.scored).reduce((total,[key,value]) => total + (value ? MOP_FREE_POINTS[key] : 0),0) ||
      !plainObject(s.revealed) || Object.keys(s.revealed).length || s.hintsUsed !== 0 ||
      ['px','py'].some(k => !Number.isFinite(s[k]) || s[k] < 0 || s[k] > (k === 'px' ? 320 : 180)) ||
      (s.dir !== 1 && s.dir !== -1) || typeof s.started !== 'boolean' ||
      s.done !== false || s.clock !== null) return false;
  if (s.history != null && (depth > 0 || !validHistory(s.history,s,{id:'mop-galaxy',scenes:{1:{}},rooms:{closet:{},deck9:{}},items:Object.fromEntries([...MOP_FREE_ITEMS].map(i=>[i,{}]))}) || !Object.values(s.history.starts).every(cp=>validMopFreeSave(cp,ownerId,1)))) return false;
  return s.checkpoint === undefined || s.checkpoint === null || (depth === 0 && validMopFreeSave(s.checkpoint, ownerId, 1));
}
async function putSave(req, env) {
  const u = await requireUser(req, env);
  const raw = await req.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_SAVE_BYTES) throw new HttpError(413, 'Save file is too large.');
  let b; try { b = JSON.parse(raw); } catch { throw new HttpError(400, 'Send the save as JSON.'); }
  if(!b || b.version !== 1 || !Number.isSafeInteger(b.revision) || b.revision < 0 || !b.data || typeof b.data !== 'object' || Array.isArray(b.data)) throw new HttpError(400,'Save version 1, object data and a CAS revision are required.');
  if ((b.ownerId !== undefined && b.ownerId !== u.id) || (b.data.ownerId !== undefined && b.data.ownerId !== u.id)) throw new HttpError(409, 'Save owner does not match the signed-in user.');
  const gameId = String(b.game_id || '');
  if (!Object.hasOwn(GAMES,gameId)) throw new HttpError(400, 'Unknown game.');
  if (gameId === 'mop-galaxy') {
    if (!u.verified_at) throw new HttpError(403, 'Verify your account before saving.');
    if (b.data.checkpoint?.ownerId !== undefined && b.data.checkpoint.ownerId !== u.id) throw new HttpError(409, 'Save owner does not match the signed-in user.');
    const owned = await entitlementsFor(env,u.id);
    if (!owned.includes(gameId) && !validMopFreeSave(b.data,u.id)) throw new HttpError(400, 'Save is outside the free scene boundary. Server progress was not changed.');
  }
  await limit(env,'save',u.id,120,60);
  const row = await env.DB.prepare('INSERT INTO saves(user_id,game_id,data,updated_at,version,revision) SELECT ?,?,?,?,1,1 WHERE ?=0 ON CONFLICT(user_id,game_id) DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at,version=1,revision=saves.revision+1 WHERE saves.revision=? RETURNING revision').bind(u.id,gameId,JSON.stringify(b.data),now(),b.revision,b.revision).first();
  // INSERT SELECT above only inserts revision 0; existing saves use an atomic UPDATE.
  const updated = row || (b.revision > 0 && await env.DB.prepare('UPDATE saves SET data=?,updated_at=?,version=1,revision=revision+1 WHERE user_id=? AND game_id=? AND revision=? RETURNING revision').bind(JSON.stringify(b.data),now(),u.id,gameId,b.revision).first());
  if(!updated) throw new HttpError(409,'Save conflict. Keep your pending snapshot; reload server progress before choosing a recovery.');
  return json({ ok: true, acknowledged: true, revision: updated.revision, updated_at: now() });
}

// ---------- Payments ----------
async function checkout(req, env, url) {
  const u = await requireUser(req, env);
  const b = await body(req);
  if (b.ownerId !== undefined && b.ownerId !== u.id) throw new HttpError(409, 'Checkout owner does not match the signed-in user.');
  const sku = String(b.sku || '');
  const product = Object.hasOwn(CATALOG,sku) ? CATALOG[sku] : null;
  if (!product) throw new HttpError(400, 'Unknown product.');
  const owned = await entitlementsFor(env, u.id);
  if (owned.includes(sku)) throw new HttpError(409, 'You already own this.');
  if (product.requires && !owned.includes(product.requires)) throw new HttpError(409, `Buy ${CATALOG[product.requires].name} first.`);

  if (!u.verified_at || !saleEnabled(env, u)) throw new HttpError(503, 'Sales are currently unavailable for this account.');
  await limit(env,'checkout',u.id,10,3600);

  const session = await createCheckout(env, {
    product, sku, user: u,
    successUrl: `${url.origin}/?purchase=success&sku=${encodeURIComponent(sku)}`,
    cancelUrl: `${url.origin}/?purchase=cancelled&sku=${encodeURIComponent(sku)}`
  });
  await env.DB.prepare('INSERT INTO purchases (id, user_id, sku, amount_cents, currency, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(session.id, u.id, sku, product.price_cents, env.CURRENCY || 'usd', 'pending', now()).run();
  return json({ url: session.url });
}

async function stripeWebhook(req, env) {
  const raw = await req.text();
  if(new TextEncoder().encode(raw).byteLength > 256*1024) throw new HttpError(413,'Webhook too large.');
  if(!await verifyStripeSignature(raw,req.headers.get('stripe-signature'),env.STRIPE_WEBHOOK_SECRET)) throw new HttpError(400,'Bad signature');
  let event; try {event=JSON.parse(raw);} catch {throw new HttpError(400,'Invalid event');}
  if(!event || typeof event.id !== 'string' || !event.id || typeof event.type !== 'string') throw new HttpError(400,'Invalid event');
  const seen=await env.DB.prepare('SELECT id FROM stripe_events WHERE id=?').bind(event.id).first();
  if(seen) return json({received:true,duplicate:true});
  const obj=event.data?.object || {}, key=randomToken(), n=now();
  const gate='EXISTS(SELECT 1 FROM stripe_events WHERE id=? AND claim_key=? AND processed_at IS NULL)';
  const stmt=(sql,...args)=>env.DB.prepare(sql).bind(...args,event.id,key);
  const stmts=[env.DB.prepare('INSERT OR IGNORE INTO stripe_events(id,type,received_at,claim_key) VALUES(?,?,?,?)').bind(event.id,event.type,n,key)];
  if(['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type) && obj.payment_status==='paid') {
    const p=await env.DB.prepare('SELECT * FROM purchases WHERE id=?').bind(obj.id).first();
    const md=obj.metadata || {}, product=Object.hasOwn(CATALOG,md.sku) ? CATALOG[md.sku] : null;
    if (product && ((product.game === 'mop-galaxy' && md.game_id !== product.game) || (md.game_id !== undefined && md.game_id !== product.game))) throw new HttpError(400,'Purchase game validation failed');
    if(!p || !product || (p.user_id!==null && md.user_id !== p.user_id) || md.sku!==p.sku || (obj.client_reference_id && p.user_id!==null && obj.client_reference_id!==p.user_id) || obj.amount_total!==product.price_cents || obj.amount_total!==p.amount_cents || obj.currency!=='usd' || p.currency!=='usd' || typeof obj.payment_intent!=='string' || !obj.payment_intent || (p.payment_intent && p.payment_intent!==obj.payment_intent)) throw new HttpError(400,'Purchase validation failed');
    const linked=await env.DB.prepare('SELECT id FROM purchases WHERE payment_intent=? AND id!=?').bind(obj.payment_intent,obj.id).first();
    if(linked) throw new HttpError(400,'Payment intent already linked');
    stmts.push(stmt(`UPDATE purchases SET payment_intent=?,paid_at=COALESCE(paid_at,?),status=CASE WHEN EXISTS(SELECT 1 FROM payment_terminals WHERE payment_intent=? AND status='refunded') THEN 'refunded' WHEN EXISTS(SELECT 1 FROM payment_terminals WHERE payment_intent=?) THEN 'reconciliation-required' ELSE 'paid' END WHERE id=? AND status='pending' AND ${gate}`,obj.payment_intent,n,obj.payment_intent,obj.payment_intent,p.id));
    stmts.push(stmt(`INSERT OR IGNORE INTO entitlement_contributions(user_id,sku,source_id,source,purchase_id,granted_at) SELECT user_id,sku,id,'stripe',id,? FROM purchases WHERE id=? AND status='paid' AND user_id IS NOT NULL AND ${gate}`,n,p.id));
    stmts.push(stmt(`INSERT OR IGNORE INTO receipt_outbox(purchase_id,status,updated_at) SELECT id,'pending',? FROM purchases WHERE id=? AND status='paid' AND user_id IS NOT NULL AND ${gate}`,n,p.id));
  } else if(event.type==='charge.refunded' || event.type.startsWith('charge.dispute.')) {
    if(typeof obj.payment_intent!=='string' || !obj.payment_intent) throw new HttpError(400,'Missing payment intent');
    const full=event.type==='charge.refunded' && obj.refunded===true && Number.isSafeInteger(obj.amount) && obj.amount>0 && obj.amount_refunded===obj.amount;
    const state=full?'refunded':'reconciliation-required';
    stmts.push(stmt(`INSERT INTO payment_terminals(payment_intent,status,updated_at) SELECT ?,?,? WHERE ${gate} ON CONFLICT(payment_intent) DO UPDATE SET status=CASE WHEN payment_terminals.status='refunded' THEN 'refunded' ELSE excluded.status END,updated_at=excluded.updated_at`,obj.payment_intent,state,n));
    stmts.push(stmt(`UPDATE purchases SET status=(SELECT status FROM payment_terminals WHERE payment_intent=?) WHERE payment_intent=? AND ${gate}`,obj.payment_intent,obj.payment_intent));
    if(full) stmts.push(stmt(`UPDATE entitlement_contributions SET revoked_at=? WHERE purchase_id IN(SELECT id FROM purchases WHERE payment_intent=?) AND ${gate}`,n,obj.payment_intent));
  }
  stmts.push(stmt(`UPDATE stripe_events SET processed_at=? WHERE ${gate}`,n));
  const result=await env.DB.batch(stmts);
  if(result[0].meta.changes && ['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type)) await dispatchReceipt(env,obj.id);
  return json({received:true,duplicate:!result[0].meta.changes});
}
async function dispatchReceipt(env,id) {
  const claim=await env.DB.prepare("UPDATE receipt_outbox SET status='sending',updated_at=? WHERE purchase_id=? AND status='pending' RETURNING purchase_id").bind(now(),id).first();
  if(!claim)return;
  const p=await env.DB.prepare('SELECT * FROM purchases WHERE id=?').bind(id).first();
  const user=p?.user_id && await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(p.user_id).first();
  let status='cancelled';
  if(user && p.status==='paid') status=await deliver(env,user,'receipt',emails.receipt(env,user,CATALOG[p.sku],p.amount_cents,p.currency))?'accepted':'failed';
  await env.DB.prepare('UPDATE receipt_outbox SET status=?,updated_at=? WHERE purchase_id=?').bind(status,now(),id).run();
  // A crash in sending is reconciliation-required, never a claimed inbox delivery.
}

// ---------- Hints (served only to walkthrough owners) ----------
async function revealHint(req, env) {
  const u = await requireUser(req, env);
  const b = await body(req);
  const gameId = String(b.game_id || '');
  const game = Object.hasOwn(GAMES,gameId) ? GAMES[gameId] : null;
  if (!game) throw new HttpError(400, 'Unknown game.');
  const owned = await entitlementsFor(env, u.id);
  if (!owned.includes(game.walkthroughSku)) throw new HttpError(402, 'The walkthrough add-on is needed for hints.');
  const puzzleId = String(b.puzzle_id || '');
  const puzzle = Object.hasOwn(game.puzzles,puzzleId) ? game.puzzles[puzzleId] : null;
  const level = Number(b.level);
  if (!puzzle || !Number.isInteger(level) || level < 0 || level >= puzzle.length) throw new HttpError(400, 'Unknown hint.');
  if (level > 0) {
    const prev = await env.DB.prepare('SELECT 1 FROM hint_reveals WHERE user_id = ? AND game_id = ? AND puzzle_id = ? AND level = ?').bind(u.id, b.game_id, b.puzzle_id, level - 1).first();
    if (!prev) throw new HttpError(409, 'Reveal the earlier hint first.');
  }
  await env.DB.prepare('INSERT OR IGNORE INTO hint_reveals (user_id, game_id, puzzle_id, level, revealed_at) VALUES (?, ?, ?, ?, ?)').bind(u.id, b.game_id, b.puzzle_id, level, now()).run();
  return json({ puzzle_id: b.puzzle_id, level, text: puzzle[level] });
}

async function listHints(req, env, url) {
  const u = await requireUser(req, env);
  const gameId = url.searchParams.get('game') || '';
  const game = Object.hasOwn(GAMES,gameId) ? GAMES[gameId] : null;
  if (!game) throw new HttpError(400, 'Unknown game.');
  const owned = await entitlementsFor(env, u.id);
  const { results } = await env.DB.prepare('SELECT puzzle_id, level FROM hint_reveals WHERE user_id = ? AND game_id = ? ORDER BY puzzle_id, level').bind(u.id, gameId).all();
  const canRead = owned.includes(game.walkthroughSku);
  return json({ revealed: results.map(r => ({ puzzle_id: r.puzzle_id, level: r.level, text: canRead && game.puzzles[r.puzzle_id] ? game.puzzles[r.puzzle_id][r.level] : null })), count: results.length });
}

// ---------- Admin ----------
async function admin(req, env, url) {
  const u = await requireUser(req, env);
  if (!u.verified_at || !isAdminEmail(env, u.email)) throw new HttpError(403, 'Verified admins only.');
  const p = url.pathname.replace('/api/admin', ''), m = req.method;
  if(m!=='GET') await limit(env,'admin',u.id,60,60);
  const audit = (target,action,sku=null) => env.DB.prepare('INSERT INTO admin_audit(actor_id,target_id,action,sku,created_at) VALUES(?,?,?,?,?)').bind(u.id,target,action,sku,now());
  if(p==='/audit' && m==='GET') return json({audit:(await env.DB.prepare('SELECT * FROM admin_audit ORDER BY id DESC LIMIT 100').all()).results});
  if(p==='/reconciliation' && m==='GET') return json({payments:(await env.DB.prepare("SELECT * FROM payment_terminals WHERE status='reconciliation-required' ORDER BY updated_at DESC LIMIT 100").all()).results,receipts:(await env.DB.prepare("SELECT * FROM receipt_outbox WHERE status IN ('pending','sending','failed') ORDER BY updated_at DESC LIMIT 100").all()).results});

  if (p === '/stats' && m === 'GET') {
    const since = now() - 30 * DAY;
    const [users, users30, buyers, revenue, rev30, recent] = await Promise.all([
      env.DB.prepare('SELECT COUNT(*) n FROM users').first(),
      env.DB.prepare('SELECT COUNT(*) n FROM users WHERE created_at > ?').bind(since).first(),
      env.DB.prepare("SELECT COUNT(DISTINCT user_id) n FROM purchases WHERE status = 'paid'").first(),
      env.DB.prepare("SELECT COALESCE(SUM(amount_cents),0) c, COUNT(*) n FROM purchases WHERE status = 'paid'").first(),
      env.DB.prepare("SELECT COALESCE(SUM(amount_cents),0) c, COUNT(*) n FROM purchases WHERE status = 'paid' AND paid_at > ?").bind(since).first(),
      env.DB.prepare("SELECT p.id, p.sku, p.amount_cents, p.currency, p.status, p.paid_at, p.created_at, u.email FROM purchases p LEFT JOIN users u ON u.id = p.user_id WHERE p.status != 'pending' ORDER BY COALESCE(p.paid_at, p.created_at) DESC LIMIT 15").all()
    ]);
    return json({ users: users.n, users30: users30.n, buyers: buyers.n, revenue_cents: revenue.c, sales: revenue.n, revenue30_cents: rev30.c, sales30: rev30.n, recent: recent.results, catalog: publicCatalog() });
  }
  if (p === '/users' && m === 'GET') {
    const q = (url.searchParams.get('q') || '').trim().toLowerCase();
    const like = `%${q.replace(/[%_]/g, '')}%`;
    const { results } = await env.DB.prepare(
      `SELECT u.id, u.email, u.name, u.created_at, u.verified_at, u.last_seen_at,
        (SELECT GROUP_CONCAT(sku) FROM entitlements e WHERE e.user_id = u.id) AS skus,
        (SELECT COALESCE(SUM(amount_cents),0) FROM purchases pp WHERE pp.user_id = u.id AND pp.status = 'paid') AS spent_cents
       FROM users u WHERE (? = '' OR lower(u.email) LIKE ? OR lower(u.name) LIKE ?) ORDER BY u.created_at DESC LIMIT 100`
    ).bind(q, like, like).all();
    return json({ users: results.map(user => ({...user, skus: user.skus ? effectiveEntitlements(user.skus.split(',')).join(',') || null : null})) });
  }
  const mm = p.match(/^\/users\/([0-9a-f-]{36})(\/[a-z-]+)?$/);
  if (mm) {
    const target = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(mm[1]).first();
    if (!target) throw new HttpError(404, 'User not found.');
    const action = mm[2] || '';
    if (action === '' && m === 'GET') {
      const [ents, purchases, mails, hints, save] = await Promise.all([
        env.DB.prepare('SELECT sku, granted_at, source FROM entitlements WHERE user_id = ?').bind(target.id).all(),
        env.DB.prepare('SELECT id, sku, amount_cents, currency, status, created_at, paid_at FROM purchases WHERE user_id = ? ORDER BY created_at DESC').bind(target.id).all(),
        env.DB.prepare('SELECT kind, status, error, created_at FROM email_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').bind(target.id).all(),
        env.DB.prepare('SELECT COUNT(*) n FROM hint_reveals WHERE user_id = ?').bind(target.id).first(),
        env.DB.prepare('SELECT game_id, updated_at, data FROM saves WHERE user_id = ?').bind(target.id).all()
      ]);
      const saves = save.results.map(s => { let d = {}; try { d = JSON.parse(s.data) || {}; } catch {} return { game_id: s.game_id, updated_at: s.updated_at, room: d.room, score: d.score }; });
      const effective = effectiveEntitlements(ents.results.map(e => e.sku));
      return json({ user: { ...target, isAdmin: !!target.verified_at && isAdminEmail(env, target.email) }, entitlements: ents.results.filter(e => effective.includes(e.sku)), purchases: purchases.results, emails: mails.results, hints: hints.n, saves });
    }
    if (action === '/grant' && m === 'POST') {
      const b = await body(req); const sku = String(b.sku || '');
      if (!Object.hasOwn(CATALOG,sku)) throw new HttpError(400, 'Unknown product.');
      const owned = await entitlementsFor(env,target.id);
      if(CATALOG[sku].requires && !owned.includes(CATALOG[sku].requires)) throw new HttpError(409,'Grant the base game first.');
      await env.DB.batch([
        env.DB.prepare('DELETE FROM access_revocations WHERE user_id=? AND sku=?').bind(target.id,sku),
        env.DB.prepare("INSERT INTO entitlement_contributions(user_id,sku,source_id,source,granted_at) VALUES(?,?,'admin','admin',?) ON CONFLICT(user_id,sku,source_id) DO UPDATE SET revoked_at=NULL,granted_at=excluded.granted_at").bind(target.id,sku,now()),
        audit(target.id,'grant',sku)
      ]);
      return json({ ok: true });
    }
    if (action === '/revoke' && m === 'POST') {
      const b = await body(req); const sku = String(b.sku || '');
      if(!Object.hasOwn(CATALOG,sku)) throw new HttpError(400,'Unknown product.');
      await env.DB.batch([
        env.DB.prepare('INSERT INTO access_revocations VALUES(?,?,?) ON CONFLICT(user_id,sku) DO UPDATE SET revoked_at=excluded.revoked_at').bind(target.id,sku,now()),
        env.DB.prepare('UPDATE entitlement_contributions SET revoked_at=? WHERE user_id=? AND sku=?').bind(now(),target.id,sku), audit(target.id,'revoke',sku)
      ]);
      return json({ ok: true });
    }
    if (action === '/send-link' && m === 'POST') {
      await audit(target.id,'send-link').run();
      const dev = await sendLoginLink(env, url, target, 'login');
      return json({ ok: true, ...dev });
    }
    if (action === '/reset-save' && m === 'POST') {
      await env.DB.batch([env.DB.prepare("UPDATE saves SET data='null',revision=revision+1,updated_at=? WHERE user_id=?").bind(now(),target.id), audit(target.id,'reset-save')]);
      return json({ ok: true });
    }
    if (action === '/signout' && m === 'POST') {
      await env.DB.batch([env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(target.id), audit(target.id,'signout')]);
      return json({ ok: true });
    }
  }
  return json({ error: 'Not found' }, 404);
}
