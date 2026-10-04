// Retro Quest Arcade: platform API (Cloudflare Worker + D1)
// Accounts (passwordless email links), cloud saves, Stripe payments,
// Mailtrap emails, paid hints served from the server, and an admin API.

import { CATALOG, GAMES } from './catalog.js';
import { sendEmail, emails } from './email.js';
import { createCheckout, verifyStripeSignature } from './stripe.js';

const DAY = 86400;
const SESSION_DAYS = 180;
const LOGIN_LINK_MINUTES = 30;
const EMAIL_COOLDOWN_SECONDS = 60;
const MAX_SAVE_BYTES = 64 * 1024;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    try {
      const res = await route(request, env, ctx, url);
      if (res) return res;
      return env.ASSETS.fetch(request);
    } catch (err) {
      if (err instanceof HttpError || err.status) return json({ error: err.message }, err.status);
      console.error('Unhandled error', err && err.stack || err);
      return json({ error: 'Something went wrong on our side. Please try again.' }, 500);
    }
  }
};

// ---------- Router ----------
async function route(req, env, ctx, url) {
  const p = url.pathname, m = req.method;
  if (!p.startsWith('/api/') && !p.startsWith('/auth/')) return null;
  if (m !== 'GET' && m !== 'HEAD' && p !== '/api/stripe/webhook') checkSameOrigin(req, url);

  if (p === '/api/config' && m === 'GET') return json({ catalog: publicCatalog(), devMode: env.DEV_MODE === '1' });
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
  if (p === '/api/dev/complete' && m === 'GET') return devComplete(req, env, url);
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
  try { return await req.json(); } catch { throw new HttpError(400, 'Send the request body as JSON.'); }
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
function publicCatalog() {
  return Object.fromEntries(Object.entries(CATALOG).map(([sku, p]) => [sku, { name: p.name, price_cents: p.price_cents, game: p.game, requires: p.requires || null }]));
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
  return results.map(r => r.sku);
}
function userOut(u, env) {
  return { id: u.id, email: u.email, name: u.name, verified: !!u.verified_at, isAdmin: isAdminEmail(env, u.email) };
}

// ---------- Account endpoints ----------
async function me(req, env) {
  const u = await currentUser(req, env);
  if (!u) return json({ user: null });
  await env.DB.prepare('UPDATE users SET last_seen_at = ? WHERE id = ?').bind(now(), u.id).run();
  const [ents, saves] = await Promise.all([
    entitlementsFor(env, u.id),
    env.DB.prepare('SELECT game_id, data, updated_at FROM saves WHERE user_id = ?').bind(u.id).all()
  ]);
  const saveMap = {};
  for (const s of saves.results) { try { saveMap[s.game_id] = JSON.parse(s.data); } catch {} }
  return json({ user: userOut(u, env), entitlements: ents, saves: saveMap });
}

async function signup(req, env, url) {
  const b = await body(req);
  const email = cleanEmail(b.email), name = cleanName(b.name);
  const existing = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  if (existing) {
    // Never hand out a session for an existing email: send a sign-in link instead.
    const dev = await sendLoginLink(env, url, existing, 'login');
    return json({ status: 'link_sent', ...dev });
  }
  const id = crypto.randomUUID();
  await env.DB.prepare('INSERT INTO users (id, email, name, created_at, last_seen_at) VALUES (?, ?, ?, ?, ?)')
    .bind(id, email, name, now(), now()).run();
  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
  const token = await createSession(env, id);
  const dev = await sendLoginLink(env, url, user, 'welcome');
  return json({ status: 'created', user: userOut(user, env), entitlements: [], saves: {}, ...dev }, 200, { 'set-cookie': sessionCookie(url, token, SESSION_DAYS * DAY) });
}

async function requestLogin(req, env, url) {
  const b = await body(req);
  const email = cleanEmail(b.email);
  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  let dev = {};
  if (user) dev = await sendLoginLink(env, url, user, 'login');
  // Same answer whether or not the account exists, so emails can't be probed.
  return json({ status: 'link_sent', ...dev });
}

async function sendLoginLink(env, url, user, kind) {
  const recent = await env.DB.prepare("SELECT created_at FROM email_log WHERE to_email = ? AND kind IN ('login','welcome') AND created_at > ? ORDER BY created_at DESC LIMIT 1")
    .bind(user.email, now() - EMAIL_COOLDOWN_SECONDS).first();
  if (recent) throw new HttpError(429, 'We just sent you an email. Check your inbox, or try again in a minute.');
  const token = randomToken();
  await env.DB.prepare('INSERT INTO login_tokens (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
    .bind(await sha256(token), user.id, now(), now() + LOGIN_LINK_MINUTES * 60).run();
  const link = `${url.origin}/auth/link?token=${encodeURIComponent(token)}`;
  const mail = kind === 'welcome' ? emails.welcome(env, user, link) : emails.login(env, user, link, LOGIN_LINK_MINUTES);
  await deliver(env, user, kind, mail);
  return env.DEV_MODE === '1' ? { dev_link: link } : {};
}

async function deliver(env, user, kind, mail) {
  let status = 'sent', error = null;
  try { await sendEmail(env, { to: user.email, toName: user.name, ...mail, category: kind }); }
  catch (e) { status = 'failed'; error = String(e.message || e).slice(0, 500); console.error('Email failed', kind, error); }
  await env.DB.prepare('INSERT INTO email_log (user_id, kind, to_email, status, error, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(user.id, kind, user.email, status, error, now()).run();
  return status === 'sent';
}

async function useLoginLink(req, env, url) {
  const token = url.searchParams.get('token') || '';
  const row = token && await env.DB.prepare('SELECT * FROM login_tokens WHERE token_hash = ?').bind(await sha256(token)).first();
  if (!row || row.used_at || row.expires_at < now()) {
    return Response.redirect(`${url.origin}/?signin=expired`, 302);
  }
  await env.DB.batch([
    env.DB.prepare('UPDATE login_tokens SET used_at = ? WHERE token_hash = ?').bind(now(), row.token_hash),
    env.DB.prepare('UPDATE users SET verified_at = COALESCE(verified_at, ?), last_seen_at = ? WHERE id = ?').bind(now(), now(), row.user_id)
  ]);
  const session = await createSession(env, row.user_id);
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
    env.DB.prepare('DELETE FROM entitlements WHERE user_id = ?').bind(u.id),
    // Purchases are kept for accounting, but detached from personal data.
    env.DB.prepare("UPDATE purchases SET user_id = 'deleted' WHERE user_id = ?").bind(u.id),
    env.DB.prepare("UPDATE email_log SET to_email = 'deleted', user_id = NULL WHERE user_id = ?").bind(u.id),
    env.DB.prepare('DELETE FROM users WHERE id = ?').bind(u.id)
  ]);
  return json({ ok: true }, 200, { 'set-cookie': 'rq_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0' });
}

// ---------- Saves ----------
async function putSave(req, env) {
  const u = await requireUser(req, env);
  const raw = await req.text();
  if (raw.length > MAX_SAVE_BYTES) throw new HttpError(413, 'Save file is too large.');
  let b; try { b = JSON.parse(raw); } catch { throw new HttpError(400, 'Send the save as JSON.'); }
  const gameId = String(b.game_id || '');
  if (!GAMES[gameId]) throw new HttpError(400, 'Unknown game.');
  await env.DB.prepare('INSERT INTO saves (user_id, game_id, data, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, game_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at')
    .bind(u.id, gameId, JSON.stringify(b.data ?? null), now()).run();
  return json({ ok: true, updated_at: now() });
}

// ---------- Payments ----------
async function checkout(req, env, url) {
  const u = await requireUser(req, env);
  const b = await body(req);
  const sku = String(b.sku || '');
  const product = CATALOG[sku];
  if (!product) throw new HttpError(400, 'Unknown product.');
  const owned = await entitlementsFor(env, u.id);
  if (owned.includes(sku)) throw new HttpError(409, 'You already own this.');
  if (product.requires && !owned.includes(product.requires)) throw new HttpError(409, `Buy ${CATALOG[product.requires].name} first.`);

  if (!env.STRIPE_SECRET_KEY) {
    if (env.DEV_MODE !== '1') throw new HttpError(503, 'Payments are not set up yet.');
    const fakeId = 'dev_' + randomToken(12);
    await env.DB.prepare('INSERT INTO purchases (id, user_id, sku, amount_cents, currency, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(fakeId, u.id, sku, product.price_cents, env.CURRENCY || 'usd', 'pending', now()).run();
    return json({ url: `${url.origin}/api/dev/complete?session=${fakeId}` });
  }

  const session = await createCheckout(env, {
    product, sku, user: u,
    successUrl: `${url.origin}/?purchase=success&sku=${encodeURIComponent(sku)}`,
    cancelUrl: `${url.origin}/?purchase=cancelled`
  });
  await env.DB.prepare('INSERT INTO purchases (id, user_id, sku, amount_cents, currency, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(session.id, u.id, sku, product.price_cents, env.CURRENCY || 'usd', 'pending', now()).run();
  return json({ url: session.url });
}

async function fulfil(env, { sessionId, userId, sku, amount, currency, paymentIntent, customerId }) {
  const product = CATALOG[sku];
  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
  if (!product || !user) { console.error('Fulfil: unknown user or product', userId, sku); return; }
  const existing = await env.DB.prepare('SELECT status FROM purchases WHERE id = ?').bind(sessionId).first();
  if (existing && existing.status === 'paid') return;
  const stmts = [
    existing
      ? env.DB.prepare('UPDATE purchases SET status = ?, paid_at = ?, payment_intent = ?, amount_cents = ?, currency = ? WHERE id = ?').bind('paid', now(), paymentIntent, amount, currency, sessionId)
      : env.DB.prepare('INSERT INTO purchases (id, user_id, sku, amount_cents, currency, status, payment_intent, created_at, paid_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(sessionId, userId, sku, amount, currency, 'paid', paymentIntent, now(), now()),
    env.DB.prepare('INSERT OR IGNORE INTO entitlements (user_id, sku, granted_at, source) VALUES (?, ?, ?, ?)').bind(userId, sku, now(), 'stripe')
  ];
  if (customerId) stmts.push(env.DB.prepare('UPDATE users SET stripe_customer_id = COALESCE(stripe_customer_id, ?) WHERE id = ?').bind(customerId, userId));
  await env.DB.batch(stmts);
  await deliver(env, user, 'receipt', emails.receipt(env, user, product, amount, currency));
}

async function stripeWebhook(req, env, ctx) {
  const raw = await req.text();
  const ok = await verifyStripeSignature(raw, req.headers.get('stripe-signature'), env.STRIPE_WEBHOOK_SECRET);
  if (!ok) return json({ error: 'Bad signature' }, 400);
  const event = JSON.parse(raw);
  const seen = await env.DB.prepare('SELECT id FROM stripe_events WHERE id = ?').bind(event.id).first();
  if (seen) return json({ received: true, duplicate: true });

  const obj = event.data && event.data.object || {};
  if ((event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') && obj.payment_status === 'paid') {
    const md = obj.metadata || {};
    await fulfil(env, {
      sessionId: obj.id, userId: md.user_id || obj.client_reference_id, sku: md.sku,
      amount: obj.amount_total, currency: obj.currency, paymentIntent: obj.payment_intent, customerId: obj.customer
    });
  } else if (event.type === 'charge.refunded' && obj.refunded) {
    const p = await env.DB.prepare('SELECT * FROM purchases WHERE payment_intent = ?').bind(obj.payment_intent).first();
    if (p) {
      await env.DB.batch([
        env.DB.prepare("UPDATE purchases SET status = 'refunded' WHERE id = ?").bind(p.id),
        env.DB.prepare("DELETE FROM entitlements WHERE user_id = ? AND sku = ? AND source = 'stripe'").bind(p.user_id, p.sku)
      ]);
    }
  }
  await env.DB.prepare('INSERT OR IGNORE INTO stripe_events (id, type, received_at) VALUES (?, ?, ?)').bind(event.id, event.type, now()).run();
  return json({ received: true });
}

// Local testing only: pretend Stripe finished the payment.
async function devComplete(req, env, url) {
  if (env.DEV_MODE !== '1') return json({ error: 'Not found' }, 404);
  const id = url.searchParams.get('session') || '';
  const p = await env.DB.prepare('SELECT * FROM purchases WHERE id = ?').bind(id).first();
  if (!p) return json({ error: 'Unknown test purchase' }, 404);
  await fulfil(env, { sessionId: p.id, userId: p.user_id, sku: p.sku, amount: p.amount_cents, currency: p.currency, paymentIntent: 'pi_dev_' + p.id });
  return Response.redirect(`${url.origin}/?purchase=success&sku=${encodeURIComponent(p.sku)}`, 302);
}

// ---------- Hints (served only to walkthrough owners) ----------
async function revealHint(req, env) {
  const u = await requireUser(req, env);
  const b = await body(req);
  const game = GAMES[String(b.game_id || '')];
  if (!game) throw new HttpError(400, 'Unknown game.');
  const owned = await entitlementsFor(env, u.id);
  if (!owned.includes(game.walkthroughSku)) throw new HttpError(402, 'The walkthrough add-on is needed for hints.');
  const puzzle = game.puzzles[String(b.puzzle_id || '')];
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
  const game = GAMES[gameId];
  if (!game) throw new HttpError(400, 'Unknown game.');
  const owned = await entitlementsFor(env, u.id);
  const { results } = await env.DB.prepare('SELECT puzzle_id, level FROM hint_reveals WHERE user_id = ? AND game_id = ? ORDER BY puzzle_id, level').bind(u.id, gameId).all();
  const canRead = owned.includes(game.walkthroughSku);
  return json({ revealed: results.map(r => ({ puzzle_id: r.puzzle_id, level: r.level, text: canRead && game.puzzles[r.puzzle_id] ? game.puzzles[r.puzzle_id][r.level] : null })), count: results.length });
}

// ---------- Admin ----------
async function admin(req, env, url) {
  const u = await requireUser(req, env);
  if (!isAdminEmail(env, u.email)) throw new HttpError(403, 'Admins only.');
  const p = url.pathname.replace('/api/admin', ''), m = req.method;

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
    return json({ users: results });
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
      return json({ user: { ...target, isAdmin: isAdminEmail(env, target.email) }, entitlements: ents.results, purchases: purchases.results, emails: mails.results, hints: hints.n, saves });
    }
    if (action === '/grant' && m === 'POST') {
      const b = await body(req); const sku = String(b.sku || '');
      if (!CATALOG[sku]) throw new HttpError(400, 'Unknown product.');
      await env.DB.prepare('INSERT OR IGNORE INTO entitlements (user_id, sku, granted_at, source) VALUES (?, ?, ?, ?)').bind(target.id, sku, now(), 'admin').run();
      return json({ ok: true });
    }
    if (action === '/revoke' && m === 'POST') {
      const b = await body(req); const sku = String(b.sku || '');
      await env.DB.prepare('DELETE FROM entitlements WHERE user_id = ? AND sku = ?').bind(target.id, sku).run();
      return json({ ok: true });
    }
    if (action === '/send-link' && m === 'POST') {
      const dev = await sendLoginLink(env, url, target, 'login');
      return json({ ok: true, ...dev });
    }
    if (action === '/reset-save' && m === 'POST') {
      await env.DB.prepare('DELETE FROM saves WHERE user_id = ?').bind(target.id).run();
      return json({ ok: true });
    }
    if (action === '/signout' && m === 'POST') {
      await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(target.id).run();
      return json({ ok: true });
    }
  }
  return json({ error: 'Not found' }, 404);
}
