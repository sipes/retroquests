// LOCAL DEV FIXTURE ADAPTER — never deploy. Implements the platform adapter contract with synthetic players.
// Players: 'anon' (signed out), 'free' (account, no purchases), 'owner' (full game), 'walkthrough' (game + walkthrough).
// Saves live in localStorage per fixture player. Hint text is imported from src/ (server-only in production) by the
// per-game wrapper (dev/<game>/fixture-adapter.js), which passes { gameId, skuGame, skuWalk, catalog, hints } here.
const KEY = (pid, what) => `pl-fixture:${pid}:${what}`;
function readJSON(k, d) { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? d; } catch (e) { return d; } }
function writeJSON(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
const delay = ms => new Promise(r => setTimeout(r, ms));

export function createFixtureAdapter(initial = 'free', cfg) {
  const { gameId, skuGame, skuWalk, catalog: CATALOG, hints: HINTS } = cfg;
  const PLAYERS = {
    anon: { user: null, entitlements: [] },
    free: { user: { id: 'fx-free-0001', name: 'Free Fixture', email: 'free@fixture.local', isAdmin: false }, entitlements: [] },
    owner: { user: { id: 'fx-owner-0002', name: 'Owner Fixture', email: 'owner@fixture.local', isAdmin: false }, entitlements: [skuGame] },
    walkthrough: { user: { id: 'fx-walk-0003', name: 'Walkthrough Fixture', email: 'walk@fixture.local', isAdmin: false }, entitlements: [skuGame, skuWalk] }
  };
  let player = PLAYERS[initial] ? initial : 'free';
  const subs = new Set();
  const faults = { failSaves: false, failHints: false, latency: 0 };
  const log = [];
  const note = (op, detail) => { log.push({ t: Date.now(), op, detail }); if (log.length > 200) log.shift(); window.dispatchEvent(new CustomEvent('pl-fixture-log', { detail: { op, detail } })); };
  const uid = () => PLAYERS[player].user && PLAYERS[player].user.id;

  const adapter = {
    // ----- contract -----
    async getState() {
      await delay(faults.latency);
      const p = PLAYERS[player]; const save = uid() ? readJSON(KEY(uid(), 'save:' + gameId), null) : null;
      note('getState', { player, hasSave: !!save });
      return { user: p.user, entitlements: p.entitlements.slice(), save, catalog: CATALOG };
    },
    subscribe(cb) { subs.add(cb); return () => subs.delete(cb); },
    async signUp() { note('signUp', {}); if (!uid()) adapter.__setPlayer('free'); },
    async signIn() { note('signIn', {}); if (!uid()) adapter.__setPlayer('free'); },
    async checkout(sku) {
      note('checkout', { sku });
      // No fake payments. The dev toolbar can switch fixture players explicitly; checkout never grants anything.
      throw Object.assign(new Error(`Checkout is not simulated in the local dev host (requested ${sku}). Use the dev toolbar to switch to the "owner" or "walkthrough" fixture.`), { status: 503 });
    },
    async save(gameId, data, opts = {}) {
      await delay(faults.latency);
      if (faults.failSaves) { note('save:FAIL', { gameId }); throw Object.assign(new Error('Fixture: save failure injected'), { status: 500 }); }
      if (!uid()) throw Object.assign(new Error('Sign in to save.'), { status: 401 });
      if (opts.ownerId && opts.ownerId !== uid()) { note('save:REJECT-owner', { ownerId: opts.ownerId, uid: uid() }); throw Object.assign(new Error('Save rejected: signed-in user changed.'), { status: 409 }); }
      writeJSON(KEY(uid(), 'save:' + gameId), data); note('save', { gameId, chapter: data.chapter, room: data.room, score: data.score, keepalive: !!opts.keepalive });
      return { updated_at: Math.floor(Date.now() / 1000) };
    },
    async revealHint(gameId, puzzleId, level) {
      await delay(faults.latency);
      const ents = PLAYERS[player].entitlements;
      if (!uid()) throw Object.assign(new Error('Sign in to continue.'), { status: 401 });
      if (faults.failHints) throw Object.assign(new Error('Fixture: hint failure injected'), { status: 500 });
      if (!ents.includes(skuWalk)) { note('hint:402', { puzzleId, level }); throw Object.assign(new Error('The walkthrough add-on is needed for hints.'), { status: 402 }); }
      const puzzle = HINTS[puzzleId]; if (!puzzle || level < 0 || level >= puzzle.length) throw Object.assign(new Error('Unknown hint.'), { status: 400 });
      const rev = readJSON(KEY(uid(), 'hints:' + gameId), []);
      if (level > 0 && !rev.some(h => h.puzzle_id === puzzleId && h.level === level - 1)) throw Object.assign(new Error('Reveal the earlier hint first.'), { status: 409 });
      if (!rev.some(h => h.puzzle_id === puzzleId && h.level === level)) { rev.push({ puzzle_id: puzzleId, level }); writeJSON(KEY(uid(), 'hints:' + gameId), rev); }
      note('hint', { puzzleId, level });
      return { puzzle_id: puzzleId, level, text: puzzle[level] };
    },
    async listHints(gameId) {
      if (!uid()) throw Object.assign(new Error('Sign in to continue.'), { status: 401 });
      const can = PLAYERS[player].entitlements.includes(skuWalk);
      const rev = readJSON(KEY(uid(), 'hints:' + gameId), []);
      return { revealed: rev.map(h => ({ puzzle_id: h.puzzle_id, level: h.level, text: can && HINTS[h.puzzle_id] ? HINTS[h.puzzle_id][h.level] : null })), count: rev.length };
    },
    // ----- dev-only controls (not part of the contract) -----
    __setPlayer(p) { if (!PLAYERS[p]) return; player = p; note('fixture:player', { player }); subs.forEach(cb => { try { cb(); } catch (e) { console.error(e); } }); },
    __player() { return player; },
    __faults: faults,
    __log: log,
    __reset(p) { const id = PLAYERS[p || player].user && PLAYERS[p || player].user.id; if (id) { localStorage.removeItem(KEY(id, 'save:' + gameId)); localStorage.removeItem(KEY(id, 'hints:' + gameId)); } note('fixture:reset', { player: p || player }); subs.forEach(cb => cb()); },
    __seedSave(data, p) { const id = PLAYERS[p || player].user.id; writeJSON(KEY(id, 'save:' + gameId), data); note('fixture:seed', { player: p || player }); subs.forEach(cb => cb()); },
    __readSave(p) { const id = PLAYERS[p || player].user && PLAYERS[p || player].user.id; return id ? readJSON(KEY(id, 'save:' + gameId), null) : null; }
  };
  return adapter;
}
