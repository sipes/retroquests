import {installContextInput, contextTap} from '../../context-input.js';
// Retro Quest Arcade — shared adventure engine. Vanilla JS + canvas, Sierra-style.
// A game passes a definition object (see public/games/port-lucky/game.js) and an injected platform adapter.
// All platform access goes through the adapter (docs/port-lucky-integration.md §2.1).
const LEVEL_NAMES = ['Nudge', 'Clue', 'Full solution'];
import {VERBS, installGameplayControls, scoreDisplay} from '../../gameplay-controls.js';
import {installSceneRuntime, allocateSceneScores} from '../../scene-history.js';
import {POINTS, CHAPTERS, ROOM_CHAPTER} from './data.js';
export const SCENES = {
  "1": {
    "objective": "Find out what has changed aboard the Hyacinth and leave Deck 9.",
    "keys": [
      "look-arm",
      "badge",
      "vent",
      "shelf-look",
      "coin-vend",
      "wrench",
      "bolts",
      "mop-chute",
      "climb"
    ]
  },
  "2": {
    "objective": "Learn what is happening to the sleeping colonists and get past the search.",
    "keys": [
      "notice",
      "nameplate",
      "hide",
      "drain",
      "roster",
      "okonjo-look",
      "blanket",
      "duct2"
    ]
  },
  "3": {
    "objective": "Find help and a way onward through the ship.",
    "keys": [
      "compost-look",
      "tray-feed",
      "gumbo",
      "board",
      "thistle-talk",
      "roster-show",
      "tomato",
      "locker",
      "oven",
      "rations",
      "gumbo-ties",
      "wheel",
      "dish",
      "vault"
    ]
  },
  "4": {
    "objective": "Keep the ship from being taken to the wrong destination and prepare to move onward.",
    "keys": [
      "headphones",
      "suppression",
      "filter-out",
      "polish-in",
      "oven-in",
      "gauge",
      "airlock",
      "suit",
      "helmet-tape",
      "o2",
      "tether",
      "suitcheck"
    ]
  },
  "5": {
    "objective": "Safely make your way outside the ship and get a message out.",
    "keys": [
      "clip",
      "plate",
      "gap",
      "pin",
      "padlock",
      "crank",
      "panel",
      "broadcast"
    ]
  },
  "6": {
    "objective": "Find out why the ship and its passengers are being claimed.",
    "keys": [
      "coffee",
      "brack",
      "notice-show",
      "roster-show2",
      "contract-loss",
      "log",
      "code-seen",
      "mop-stamp",
      "filing",
      "seed"
    ]
  },
  "7": {
    "objective": "Get free of the Lien and return to the Hyacinth.",
    "keys": [
      "crate",
      "slip",
      "keypad",
      "gumbo-vent",
      "cat",
      "jacket",
      "lockbox",
      "lights",
      "mop-polish",
      "keyA",
      "gumbo-key",
      "turn",
      "lever",
      "run"
    ]
  },
  "8": {
    "objective": "Reach the captain and protect the colonists before time runs out.",
    "keys": [
      "lift",
      "code",
      "brack-stall",
      "thaw",
      "answer",
      "answer-ok",
      "answer-weak",
      "seal"
    ]
  }
};

allocateSceneScores(SCENES,POINTS,CHAPTERS,[[['answer'],['answer-ok'],['answer-weak']]]);
export class Engine {
  constructor(def, container, adapter, options = {}) {
    this.D = def; this.container = container; this.adapter = adapter; this.options = options;
    this.account = null; this.ent = { game: false, walk: false }; this.catalog = {};
    this.game = null; this.view = 'idle'; this.verb = 'walk'; this.selItem = null;
    this.msgQueue = []; this.msgOpen = false; this.blocking = false; this.choiceOpen = false; this.modalCount = 0;
    this.walkTarget = null; this.walkThen = null; this.frame = 0; this.raf = 0; this.bgKey = '';
    this.lastSnap = null; this.saveTimer = null; this.saveState = 'idle'; this.lastSaveError = null;
    this.hintTexts = {}; this.shown = {}; this.unsub = null; this.destroyed = false;
    this.timers = new Set(); this.intervals = new Set(); this.listeners = []; this.modals = new Set(); this.observers = new Set();
    this.identity = null; this.refreshSequence = 0;
    this.settings = { wait10: true };
    try { const s = JSON.parse(localStorage.getItem('rq-' + def.GAME_ID + '-settings') || 'null'); if (s && typeof s.wait10 === 'boolean') this.settings = s; } catch (e) {}
    this.script = def.createScript(this);
    installSceneRuntime(this,{id:def.GAME_ID,scenes:SCENES,rooms:def.ROOMS,items:def.ITEMS,roomChapter:ROOM_CHAPTER,completedFlag:def.demo ? def.chapter1DoneFlag : null});
  }

  // ---------- Mount / unmount ----------
  later(fn, ms) { if (this.destroyed) return null; const id = setTimeout(() => { this.timers.delete(id); if (!this.destroyed) fn(); }, ms); this.timers.add(id); return id; }
  every(fn, ms) { const id = setInterval(() => { if (!this.destroyed) fn(); }, ms); this.intervals.add(id); return id; }
  listen(target, type, fn, opts) { target.addEventListener(type, fn, opts); this.listeners.push([target, type, fn, opts]); }
  accessChanged() {
    this.unmount({ save: false });
    this.options.onExit?.('access-changed');
  }
  async mount() {
    await this.refreshState(); // Fail closed before creating DOM, listeners or a render loop.
    if (this.destroyed) throw new Error('Mount cancelled.');
    const root = document.createElement('div'); root.className = 'mg-game pl-game'; root.innerHTML = this.D.template(this.D.texts);
    this.container.appendChild(root); this.root = root;
    this.$ = id => root.querySelector('[data-id="' + id + '"]');
    this.cv = this.$('canvas'); this.cx = this.cv.getContext('2d');
    this.bg = document.createElement('canvas'); this.bg.width = 320; this.bg.height = 180; this.bx = this.bg.getContext('2d');
    installContextInput(this); this.wire(); installGameplayControls(this, SCENES);
    this.renderVerbs(); this.renderInv();
    if (this.adapter.subscribe) this.unsub = this.adapter.subscribe(() => this.onPlatformChange().catch(() => {}));
    this.onVis = () => { this.updateClockUI(); };
    this.listen(document, 'visibilitychange', this.onVis);
    this.onHide = () => this.flushSave(true);
    this.listen(window, 'pagehide', this.onHide);
    this.lastTick = performance.now();
    const loop = t => { if (this.destroyed) return; this.render(t); this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
    this.start();
    return this;
  }
  unmount({ save = true } = {}) { this.gameplay?.destroy(); this.context?.destroy();
    if (this.destroyed) return;
    if (save && this.saveTimer) this.flushSave(true); // normal exit only; never save after revocation
    this.destroyed = true; cancelAnimationFrame(this.raf); clearTimeout(this.saveTimer);
    this.refreshSequence++;
    if (this.unsub) this.unsub();
    for (const close of [...this.modals]) close();
    for (const obs of this.observers) obs.disconnect(); this.observers.clear();
    for (const id of this.timers) clearTimeout(id); this.timers.clear();
    for (const id of this.intervals) clearInterval(id); this.intervals.clear();
    for (const [target, type, fn, opts] of this.listeners) target.removeEventListener(type, fn, opts); this.listeners = [];
    this.exitImmersive();
    if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
    this.clearTransient(); this.hintTexts = {}; this.shown = {}; this.game = null; this.account = null; this.ent = { game: false, walk: false }; this.view = 'idle';
  }

  // ---------- Platform state ----------
  async refreshState() { this.context?.clear();
    const sequence = ++this.refreshSequence;
    let st;
    try { st = await this.adapter.getState(); } catch (error) { if (this.root) this.accessChanged(); throw error; }
    if (this.destroyed || sequence !== this.refreshSequence) throw new Error('Player state changed.');
    const reject = message => { if (this.root) this.accessChanged(); throw new Error(message); };
    if (!st || !Array.isArray(st.entitlements)) reject('Invalid platform state.');
    const identity = JSON.stringify([st.user?.id || null, st.user?.verified ?? null, [...st.entitlements].sort()]);
    if (this.identity !== null && identity !== this.identity) { this.accessChanged(); throw new Error('Player access changed; remount required.'); }
    if (!this.D.demo && (!st.user?.verified || !st.entitlements.includes(this.D.SKU_GAME))) reject('Verified game ownership required.');
    if (this.D.validateSave && st.save && (!this.D.validateSave(st.save) || (st.save.ownerId && st.save.ownerId !== st.user?.id) || (st.save.checkpoint?.ownerId && st.save.checkpoint.ownerId !== st.user?.id))) reject('Invalid save retained.');
    const initial = this.identity === null; this.identity = identity;
    this.account = st.user || null;
    const owned = st.entitlements || [];
    this.ent = { game: owned.includes(this.D.SKU_GAME), walk: owned.includes(this.D.SKU_WALK) };
    if (st.catalog) this.catalog = st.catalog;
    const sv = st.save;
    if (initial) this.game = this.account && sv && typeof sv === 'object' && sv.flags ? this.D.migrateSave(sv) : null;
    if (this.game && this.account) this.game.ownerId = this.account.id;
    return st;
  }
  async onPlatformChange() {
    if (this.destroyed) return;
    await this.refreshState();
    if (this.$('drawer') && !this.$('drawer').hidden) this.renderDrawer();
  }
  price(sku) { return this.catalog[sku]?.display_price || 'Unavailable'; }

  // ---------- Game start / chapters ----------
  start() {
    if (this.destroyed) return;
    if (!this.account && !this.D.demo) { this.showGate(); return; }
    if (!this.game) { this.game = this.newGame(); if (this.account) this.game.ownerId = this.account.id; this.script.startChapter(1, { fresh: true }); return; }
    this.view = 'game'; this.$('gate').hidden = true; this.$('stage').hidden = false;
    this.bgKey = ''; this.selItem = null; this.verb = 'walk'; this.renderVerbs(); this.renderInv(); this.updateHud();
    if (this.game.done) { this.showFinal(); return; }
    if (this.game.chapter === 1 && this.game.flags[this.D.chapter1DoneFlag]) { if (this.ent.game) this.script.startChapter(2); else this.showPaywall(); return; }
    if (this.game.chapter > 1 && !this.ent.game) { this.showPaywall(); return; }
    this.updateClockUI();
    this.say('Welcome back. Your game was saved right where you left it.');
  }
  newGame() {
    return Object.assign({ v: this.D.SAVE_VERSION, chapter: 1, room: this.D.startRoom, inv: [], flags: {}, scored: {}, score: 0, hintsUsed: 0, revealed: {}, px: this.D.startPos[0], py: this.D.startPos[1], dir: 1, started: false, clock: null, checkpoint: null, done: false }, this.D.newGameExtras || {});
  }
  // snapshot/setCheckpoint/restartScene are installed by the shared history contract.
  clearTransient() { this.context?.clear(); this.msgQueue = []; this.msgOpen = false; this.blocking = false; this.choiceOpen = false; this.walkTarget = null; this.walkThen = null; this.bgKey = ''; this.selItem = null; }
  clearOverlays() { this.context?.clear(); if (!this.root) return; for (const close of [...this.modals]) close(); this.root.querySelectorAll('[data-id="view"] .sierra, [data-id="view"] .overlay-card').forEach(n => n.remove()); this.modalCount = 0; this.blocking = false; this.msgOpen = false; this.choiceOpen = false; }

  // ---------- Saving ----------
  persist() {
    try { localStorage.setItem('rq-' + this.D.GAME_ID + '-settings', JSON.stringify(this.settings)); } catch (e) {}
    if (this.destroyed || !this.account?.verified || !this.game) return;
    clearTimeout(this.saveTimer); this.saveTimer = this.later(() => this.flushSave(false), 800);
  }
  // flushSave is installed by the shared history contract (serial acknowledgement barrier).
  setSaveState(s) {
    this.saveState = s; const el = this.$ && this.$('savestate'); if (!el) return;
    el.className = 'savestate ' + s;
    el.innerHTML = s === 'saving' ? 'Saving…' : s === 'saved' ? 'Saved' : s === 'failed' ? 'Save failed. <button type="button" data-id="retrysave">Retry</button>' : '';
    el.hidden = s === 'idle';
    if (s === 'failed') { const b = this.$('retrysave'); if (b) b.onclick = () => this.flushSave(false); }
    if (s === 'saved') { clearTimeout(this.savedT); this.savedT = this.later(() => { if (this.saveState === 'saved') this.setSaveState('idle'); }, 1800); }
  }

  // ---------- Messages / choices / deaths ----------
  say(text, then) { this.context?.clear(); if (this.destroyed) return; this.msgQueue.push({ text, then }); if (!this.msgOpen) this.nextMsg(); }
  nextMsg() {
    const view = this.$('view'); const old = view.querySelector('.sierra.msg'); if (old) old.remove();
    const m = this.msgQueue.shift(); if (!m) { this.msgOpen = false; return; }
    this.msgOpen = true;
    const box = document.createElement('div'); box.className = 'sierra msg'; box.setAttribute('role', 'dialog'); box.tabIndex = 0;
    const p = document.createElement('div'); p.textContent = m.text; box.appendChild(p);
    const more = document.createElement('span'); more.className = 'more'; more.textContent = 'Click or press Enter'; box.appendChild(more);
    const close = () => { if (this.destroyed || !box.isConnected) return; box.remove(); this.msgOpen = false; if (m.then) m.then(); if (!this.msgOpen) this.nextMsg(); this.refocus(); };
    box.addEventListener('click', close);
    box.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') { e.preventDefault(); close(); } });
    view.appendChild(box); box.focus({ preventScroll: true });
  }
  // Dialogue choice box. options: [{label, value}]. Resolves with value. Pauses the clock while open.
  choose(prompt, options) { this.context?.clear();
    return new Promise(resolve => {
      const view = this.$('view'); this.choiceOpen = true;
      const box = document.createElement('div'); box.className = 'sierra choice'; box.setAttribute('role', 'dialog');
      const p = document.createElement('div'); p.textContent = prompt; box.appendChild(p);
      const a = document.createElement('div'); a.className = 'actions';
      options.forEach((o, i) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = o.label; b.onclick = e => { if (this.destroyed) return; e.stopPropagation(); box.remove(); this.choiceOpen = false; resolve(o.value); this.refocus(); }; a.appendChild(b); if (i === 0) this.later(() => b.focus(), 0); });
      box.appendChild(a); view.appendChild(box);
    });
  }
  die(text) { this.context?.clear();
    const snap = this.lastSnap || this.snapshot();
    const view = this.$('view');
    const box = document.createElement('div'); box.className = 'sierra death'; box.setAttribute('role', 'alertdialog');
    const p = document.createElement('div'); p.style.whiteSpace = 'pre-line'; p.textContent = text; box.appendChild(p);
    const a = document.createElement('div'); a.className = 'actions';
    const again = document.createElement('button'); again.type = 'button'; again.textContent = 'Try again';
    const restart = document.createElement('button'); restart.type = 'button'; restart.textContent = 'Restart scene';
    a.append(again, restart); box.appendChild(a);
    again.onclick = e => { if(this.rewindPending)return; e.stopPropagation(); box.remove(); const cp = this.game.checkpoint; this.game = Object.assign(JSON.parse(JSON.stringify(snap)), { history:this.game.history, checkpoint: cp, hintsUsed: this.game.hintsUsed, revealed: this.game.revealed }); this.clearTransient(); this.lastSnap=null; this.renderInv(); this.updateHud(); this.updateClockUI(); this.persist(); this.refocus(); };
    restart.onclick = e => { e.stopPropagation(); this.restartScene(); };
    this.msgQueue = []; this.blocking = true; view.appendChild(box); again.focus();
  }
  overlay(html) { this.context?.clear(); const o = document.createElement('div'); o.className = 'overlay-card'; o.innerHTML = html; this.$('view').appendChild(o); this.blocking = true; return o; }
  modal(html) { this.context?.clear();
    const v = document.createElement('div'); v.className = 'modal-veil'; v.innerHTML = html; this.modalCount++;
    const close = () => { if (!this.modals.delete(close)) return; v.remove(); this.modalCount--; document.removeEventListener('keydown', esc); this.refocus(); };
    const esc = e => { if (e.key === 'Escape') close(); };
    this.modals.add(close); this.listen(document, 'keydown', esc); v.addEventListener('click', e => { if (e.target === v) close(); });
    this.$('modalroot').appendChild(v); return { el: v, close };
  }
  toast(t) { if (this.destroyed) return; const el = this.$('toast'); if (!el) return; el.textContent = t; el.hidden = false; clearTimeout(this.toastT); this.toastT = this.later(() => el.hidden = true, 2800); }
  refocus() { this.later(() => { if (!this.msgOpen && !this.choiceOpen && this.view === 'game' && (!this.coarse() || this.root.classList.contains('typing'))) { const c = this.$('cmd'); if (c) c.focus({ preventScroll: true }); } }, 0); }
  coarse() { return window.matchMedia && window.matchMedia('(pointer: coarse)').matches; }

  // ---------- Score / inventory ----------
  points(key) {
    const n = this.D.POINTS[key]; if (n == null) { console.warn('Unknown points key', key); return; }
    if (this.game.scored[key]) return;
    this.game.scored[key] = true; this.game.score += n; this.updateHud();
    const f = document.createElement('div'); f.className = 'float'; f.textContent = '+' + n;
    f.style.left = (this.game.px / 320 * 100) + '%'; f.style.top = ((this.game.py - 50) / 180 * 100) + '%';
    this.$('view').appendChild(f); this.later(() => f.remove(), 1400);
  }
  has(id) { return this.game.inv.includes(id); }
  give(id) { if (!this.has(id)) this.game.inv.push(id); this.renderInv(); }
  drop(id) { this.game.inv = this.game.inv.filter(i => i !== id); if (this.selItem === id) this.selItem = null; this.renderInv(); }
  room() { return this.D.ROOMS[this.game.room]; }
  spotName(id) { const s = this.room().spots.find(x => x.id === id); return s ? s.name : id; }
  activeSpots() { return this.room().spots.filter(s => !s.when || s.when(this.game)); }
  gotoRoom(id, px, py, dir) { this.context?.clear(); this.game.room = id; this.game.px = px; this.game.py = py; this.game.dir = dir || 1; this.walkTarget = null; this.walkThen = null; this.bgKey = ''; this.updateHud(); this.persist(); }
  updateHud() {
    const g = this.game; if (!g || !this.root) return;
    this.$('score').textContent = scoreDisplay(g, SCENES, this.D.POINTS, this.D.MAX_SCORE);
    this.$('roomtxt').textContent = this.room().title;
    this.$('hints').textContent = `Hints: ${g.hintsUsed}`;
    const inv = this.$('invcount'); if (inv) inv.textContent = g.inv.length;
  }

  // ---------- Clock (chapter 7 only) ----------
  clockActive() { const g = this.game, ck = this.D.clock; return !!(ck && g && g.chapter === ck.chapter && g.clock != null && !g.flags[ck.stopFlag] && !g.done); }
  clockPaused() { return this.msgOpen || this.choiceOpen || this.blocking || this.modalCount > 0 || !this.$('drawer').hidden || document.hidden || this.view !== 'game'; }
  tickClock(dt) {
    if (!this.clockActive() || this.clockPaused()) return;
    this.game.clock = Math.max(0, this.game.clock - dt * this.D.clock.rate);
    this.updateClockUI(); if (this.script.clockTick) this.script.clockTick(this.game.clock);
    if (this.game.clock <= 0) { this.game.clock = 0; this.script.clockExpired(); }
  }
  updateClockUI() {
    const el = this.$('clock'); if (!el) return;
    if (!this.clockActive()) { el.hidden = true; return; }
    el.hidden = false; const s = Math.ceil(this.game.clock);
    el.textContent = this.D.clock.label(s); el.classList.toggle('late', s <= this.D.clock.lateAt);
  }
  startClock() { this.game.clock = this.D.clock.start; this.updateClockUI(); }

  // ---------- Rendering ----------
  render(t) { this.context?.check(); this.gameplay?.check();
    const dt = Math.min(0.25, (t - this.lastTick) / 1000); this.lastTick = t; this.frame++;
    if (this.view !== 'game' || !this.game) return;
    this.tickClock(dt);
    const g = this.game, art = this.D.ART[g.room]; if (!art) return;
    const key = g.room + JSON.stringify(g.flags);
    if (key !== this.bgKey) { this.bx.clearRect(0, 0, 320, 180); art.bg(this.bx, g); this.bgKey = key; }
    this.cx.drawImage(this.bg, 0, 0);
    if (this.walkTarget && !this.msgOpen && !this.blocking && !this.modalCount) {
      const dx = this.walkTarget[0] - g.px, dy = this.walkTarget[1] - g.py, d = Math.hypot(dx, dy), sp = 1.6;
      if (d <= sp) { g.px = this.walkTarget[0]; g.py = this.walkTarget[1]; this.walkTarget = null; const f = this.walkThen; this.walkThen = null; if (f) f(); }
      else { g.px += dx / d * sp; g.py += dy / d * sp; if (Math.abs(dx) > .5) g.dir = dx > 0 ? 1 : -1; }
    }
    const step = this.walkTarget ? Math.floor(this.frame / 6) % 2 : 0;
    const items = art.props ? art.props(this.cx, g, this.frame) : [];
    if (!g.flags.hidePlayer) items.push({ y: g.py, d: () => this.D.drawPlayer(this.cx, g.px, g.py, g.dir, step) });
    items.sort((a, b) => a.y - b.y).forEach(i => i.d());
  }

  // ---------- Interaction ----------
  hitTest(x, y) { // room hotspots first; the player's own sprite is the lowest-priority target so the hero never blocks what they are standing in front of
    const spots = this.activeSpots(); let me = null;
    for (const s of spots) {
      if (s.dyn) { me = s; continue; }
      const [rx, ry, rw, rh] = s.rect; if (x >= rx && x < rx + rw && y >= ry && y < ry + rh) return s;
    }
    if (me && Math.abs(x - this.game.px) < 9 && y > this.game.py - 38 && y < this.game.py) return me;
    return null;
  }
  clampWalk(x, y) { const w = this.room().walk; return [Math.max(w.x0, Math.min(w.x1, x)), Math.max(w.y0, Math.min(w.y1, y))]; }
  approach(spot, fn) { if (spot.at && !spot.dyn) { this.walkTarget = this.clampWalk(spot.at[0], spot.at[1]); this.walkThen = fn; } else fn(); }
  act(verb, spotId, itemId) {
    if (this.destroyed || !this.game || this.blocking || this.msgOpen || this.choiceOpen) return;
    this.lastSnap = this.snapshot();
    try { this.script.act(verb, spotId, itemId); } catch (e) { console.error(e); this.say('Something went wrong with that. It has been noted. Try something else.'); }
    this.persist();
  }
  combine(a, b) { if (this.destroyed || !this.game || this.blocking || this.msgOpen || this.choiceOpen) return; this.lastSnap = this.snapshot(); try { this.script.combine(a, b); } catch (e) { console.error(e); } this.persist(); }
  canvasPoint(e) { const r = this.cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 320, (e.clientY - r.top) / r.height * 180]; }
  onCanvasTap(e) { return contextTap.call(this, e); }
  contextDrawerOpen() { return this.$ && !this.$('drawer').hidden; }
  onCanvasClick(e) {
    if (this.msgOpen || this.blocking || this.choiceOpen || !this.game || this.view !== 'game') return;
    const [x, y] = this.canvasPoint(e); const spot = this.hitTest(x, y);
    if (spot) { const nm = spot.name.charAt(0).toUpperCase() + spot.name.slice(1); this.$('hover').textContent = nm; this.$('roomtxt').textContent = nm; clearTimeout(this.lblT); this.lblT = this.later(() => this.updateHud(), 1600); }
    if (this.selItem && spot) { const it = this.selItem; this.selItem = null; this.renderInv(); return this.approach(spot, () => this.act('use', spot.id, it)); }
    if (this.selItem && !spot) { this.selItem = null; this.renderInv(); }
    if (!spot || this.verb === 'walk') {
      if (spot && this.script.walkAction(spot.id)) return this.approach(spot, () => this.act('use', spot.id));
      this.walkTarget = this.clampWalk(x, y); this.walkThen = null; return;
    }
    if (this.verb === 'look') return this.act('look', spot.id);
    this.approach(spot, () => this.act(this.verb, spot.id));
  }
  onCanvasMove(e) {
    if (!this.game || this.view !== 'game') return;
    const [x, y] = this.canvasPoint(e); const s = this.hitTest(x, y);
    const vName = this.selItem ? `Use ${this.D.ITEMS[this.selItem].name} on` : ({ walk: 'Walk to', look: 'Look at', take: 'Take', use: 'Use', talk: 'Talk to' })[this.verb];
    this.$('hover').textContent = s ? `${vName} ${s.name}` : (this.selItem ? `${vName} …` : ' ');
  }
  renderVerbs() {
    const box = this.$('verbs'); box.innerHTML = '';
    VERBS.forEach(([k, label]) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'verb'; b.textContent = label; b.setAttribute('aria-pressed', String(this.verb === k && !this.selItem)); b.onclick = () => { this.verb = k; this.selItem = null; this.renderVerbs(); this.renderInv(); }; box.appendChild(b); });
  }
  renderInv() {
    if (!this.root) return;
    const old = this.$('view').querySelector('.using'); if (old) old.remove();
    const g = this.game; const n = g ? g.inv.length : 0; const ic = this.$('invcount'); if (ic) ic.textContent = n;
    if (this.selItem && g) {
      const u = document.createElement('div'); u.className = 'using';
      const t = document.createElement('span'); t.textContent = `Using ${this.D.ITEMS[this.selItem].name}. Tap what to use it on.`;
      const c = document.createElement('button'); c.type = 'button'; c.textContent = 'Cancel'; c.onclick = e => { e.stopPropagation(); this.selItem = null; this.renderInv(); this.renderVerbs(); };
      u.append(t, c); this.$('view').appendChild(u);
    }
    const box = this.$('inv'); box.innerHTML = '';
    if (!g || !g.inv.length) { const s = document.createElement('span'); s.className = 'empty'; s.textContent = 'Nothing yet. Your pockets are as empty as your memory.'; box.appendChild(s); return; }
    g.inv.forEach(id => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'item'; b.setAttribute('aria-pressed', String(this.selItem === id)); b.dataset.item = id;
      const i = document.createElement('i'); i.style.background = this.D.PAL[this.D.ITEMS[id].color]; b.append(i, document.createTextNode(this.itemLabel(id)));
      b.title = 'Select to use on something. With Look selected, examines it.';
      b.onclick = () => {
        if (this.msgOpen || this.blocking || this.choiceOpen) return;
        if (this.verb === 'look' && !this.selItem) return this.say(this.script.itemLook(id));
        if (this.selItem && this.selItem !== id) { const a = this.selItem; this.selItem = null; this.renderInv(); return this.combine(a, id); }
        this.selItem = this.selItem === id ? null : id; this.renderInv(); this.renderVerbs();
      };
      box.appendChild(b);
    });
  }
  itemLabel(id) { return (this.script.itemLabel && this.script.itemLabel(id)) || this.D.ITEMS[id].name; }

  // ---------- Parser ----------
  parse(raw) { this.context?.clear();
    const g = this.game; if (this.destroyed || !g || this.blocking || this.msgOpen || this.choiceOpen) return; const txt = raw.toLowerCase().trim(); if (!txt) return;
    const STOP = new Set(['the','a','an','at','to','on','with','into','onto','up','from','my','some','this','that','of','for','please','around','about','in','inside','through','out','off']);
    const VMAP = {
      look: ['look','l','examine','x','inspect','read','check','view','watch','see','describe'],
      take: ['take','get','grab','pick','steal','remove','fish','collect','pull'],
      use: ['use','open','unlock','push','press','turn','apply','insert','swipe','put','dial','call','ring','operate','pour','tie','wear','attach','enter','knock','row','start','light','polish','clean','pay','buy','cut','climb','board','write','knock'],
      hit: ['hit','strike','smash','break','punch','kick','whack','bash'],
      talk: ['talk','speak','ask','chat','greet','hello','hi','say','shout','tell','order'],
      give: ['give','feed','offer','hand','show','throw','tip'],
      drink: ['drink','sip','taste','swallow'], eat: ['eat','chew','lick','bite'],
      play: ['play','blow','toot','sing'], search: ['search','rummage','dig'],
      sit: ['sit','lie','sleep','rest','hide','fold'], walk: ['go','walk','leave','exit','move','run','enter'],
      inv: ['inventory','inv','i','items','pockets'], help: ['help','?','commands'], score: ['score','points'],
      hints: ['hint','hints','stuck','walkthrough','clue'], save: ['save'], restart: ['restart']
    };
    let words = txt.replace(/[^a-z0-9\s'?-]/g, ' ').split(/\s+/).filter(Boolean);
    let v = Object.keys(VMAP).find(k => VMAP[k].includes(words[0]));
    if (!v) return this.say(`I don't understand "${raw}". Try a verb like LOOK, TAKE, USE, TALK, GIVE or OPEN.`);
    if (v === 'look' && ['in','inside','into'].includes(words[1])) v = 'search';
    if (v === 'walk' && words[1] === 'to') { /* walk to X: treat as approach+look */ }
    const rest = words.slice(1).filter(w => !STOP.has(w)); const phrase = rest.join(' ');
    if (v === 'save') { this.flushSave(false); return this.toast('Saving…'); }
    if (v === 'restart') return this.$('restart').click();
    if (v === 'inv' && this.landscapePhone()) return this.openInventory();
    if (v === 'inv') return this.say(g.inv.length ? 'You are carrying: ' + g.inv.map(i => this.itemLabel(i)).join(', ') + '.' : 'You are carrying nothing. Not even a plan.');
    if (v === 'help') return this.say(this.D.texts.help);
    if (v === 'score') return this.say(`Your score is ${g.score} of ${this.D.MAX_SCORE}.`);
    if (v === 'hints') return this.openDrawer();
    const pad = ' ' + phrase + ' ';
    const matchIn = list => { let best = null, bl = 0; list.forEach(e => e.words.forEach(w => { if (pad.includes(' ' + w + ' ') && w.length > bl) { best = e; bl = w.length; } })); return best; };
    const invEntries = g.inv.map(id => ({ id, words: this.D.ITEMS[id].words }));
    const spots = this.activeSpots();
    let it = matchIn(invEntries); let restAfter = phrase;
    if (it) { const w = it.words.find(w => pad.includes(' ' + w + ' ')); restAfter = pad.replace(' ' + w + ' ', ' ').trim(); }
    const spotIn = p => { const pp = ' ' + p + ' '; let best = null, bl = 0; spots.forEach(s => s.words.forEach(w => { if (pp.includes(' ' + w + ' ') && w.length > bl) { best = s; bl = w.length; } })); return best; };
    let sp = it ? spotIn(restAfter) : spotIn(phrase);
    // For non-transitive verbs prefer a visible hotspot over an inventory item with the same noun ("take shoe" on the pontoon).
    if (it && ['take','look','search','talk','sit','walk'].includes(v)) { const sp0 = spotIn(phrase); if (sp0) { it = null; sp = sp0; } }
    // item on item
    if (it && !sp) { const it2 = matchIn(invEntries.filter(e => e.id !== it.id).map(e => ({ id: e.id, words: e.words.filter(w => (' ' + restAfter + ' ').includes(' ' + w + ' ')) }))); if (it2 && (v === 'use' || v === 'give')) return this.combine(it.id, it2.id); }
    if (!rest.length) {
      if (v === 'look') return this.say(this.room().describe);
      if (v === 'walk') return this.say('Click where you want to go.');
      if (v === 'search') return this.say(this.room().describe);
      return this.say(`${words[0].toUpperCase()} what?`);
    }
    if (it && !sp) {
      if (v === 'look' || v === 'search') return this.say(this.script.itemLook(it.id));
      if (v === 'use') return this.act('use', 'me', it.id);
      if (v === 'give') return this.say(`Give the ${this.D.ITEMS[it.id].name.toLowerCase()} to whom?`);
      if (v === 'eat' || v === 'drink' || v === 'play' || v === 'take' || v === 'sit') return this.act(v, 'me', it.id);
      return this.say('Nothing happens.');
    }
    if (!sp) return this.say("You don't see that here.");
    const doIt = () => {
      if (it) return this.act('use', sp.id, it.id);
      let cv = v;
      if (cv === 'give') return this.say('Give what?');
      if (cv === 'walk') { if (this.script.walkAction(sp.id)) cv = 'use'; else return; }
      this.act(cv, sp.id);
    };
    if (v === 'look' || sp.dyn) return doIt();
    this.approach(sp, doIt);
  }

  // ---------- Paywall / gate / final ----------
  showGate() {
    this.view = 'gate'; this.$('stage').hidden = true; const g = this.$('gate'); g.hidden = false;
    g.querySelector('[data-id="gateSignup"]').onclick = async () => { try { await this.adapter.signUp(); } catch (e) {} await this.refreshState(); this.start(); };
    g.querySelector('[data-id="gateSignin"]').onclick = async () => { try { await this.adapter.signIn(); } catch (e) {} await this.refreshState(); this.start(); };
  }
  showPaywall() {
    if (this.ent.game) { this.start(); return; }
    this.view = 'game'; this.$('gate').hidden = true; this.$('stage').hidden = false; this.updateHud();
    this.root.querySelectorAll('.overlay-card').forEach(n => n.remove());
    const o = this.overlay(`<div class="modal" role="dialog" aria-labelledby="pl-pwT"><h3 id="pl-pwT">End of the free scene</h3>
      <p>Scene 1 complete. Unlock the entire game — all remaining scenes — for ${this.price(this.D.SKU_GAME)}, one-time. No recurring charge. Check the save status before leaving.</p><p class="note">Walkthrough/clue pack is a separate optional add-on.</p>
      <div class="price-big">${this.price(this.D.SKU_GAME)}</div><p class="note">${this.catalog[this.D.SKU_GAME]?.sale_enabled === true ? 'One-time purchase. Secure card payment handled by the arcade.' : 'Purchases are currently unavailable for this account.'}</p>
      <div class="row"><button type="button" class="btn ghost" data-a="back">Back to games</button><button type="button" class="btn" data-a="buy">Unlock full game — ${this.price(this.D.SKU_GAME)}</button></div></div>`);
    const buy = o.querySelector('[data-a=buy]'); buy.disabled = this.catalog[this.D.SKU_GAME]?.sale_enabled !== true;
    if (buy.disabled) o.querySelector('.note').textContent += ' Purchases are currently unavailable for this account.';
    buy.onclick = () => this.checkout(this.D.SKU_GAME);
    o.querySelector('[data-a=back]').onclick = () => { o.remove(); this.blocking = false; if (this.options.onExit) this.options.onExit('paywall'); };
    o.querySelector('[data-a=back]').focus();
  }
  async checkout(sku) {
    if (this.destroyed) return;
    if (!this.account) { try { await this.adapter.signUp(); } catch (e) {} await this.refreshState(); if (!this.account) return; }
    if (sku === this.D.SKU_WALK && !this.ent.game) sku = this.D.SKU_GAME;
    if (this.ent.game && sku === this.D.SKU_GAME) { this.start(); return; }
    if (this.destroyed || this.catalog[sku]?.sale_enabled !== true) { this.toast('Purchases are currently unavailable for this account.'); return; }
    const m = this.modal(`<div class="modal" role="dialog"><h3>Opening secure checkout…</h3><p>${this.price(sku)}</p><p>${sku === this.D.SKU_GAME ? 'Unlock the entire game — all remaining scenes. One-time purchase. No recurring charge.' : 'Walkthrough/clue pack: a separate optional add-on, not full-game access.'}</p><p class="note">You'll pay on the arcade's secure page, then come straight back here. Check the save status before leaving.</p><div class="err" data-id="coErr" role="alert"></div><div class="row"><button type="button" class="btn ghost" data-a="cancel">Cancel</button></div></div>`);
    m.el.querySelector('[data-a=cancel]').onclick = () => m.close();
    try { await this.flushSave(false); if (this.destroyed || !m.el.isConnected) return; if (this.saveState === 'failed') throw this.lastSaveError; await this.adapter.checkout(sku); if (this.destroyed) return; m.close(); await this.onPlatformChange(); }
    catch (x) { const err = m.el.querySelector('[data-id="coErr"]'); if (err) err.textContent = (x && x.message) || 'Checkout could not be opened.'; }
  }
  showFinal() {
    const g = this.game; this.view = 'game';
    this.msgQueue = []; this.msgOpen = false; this.root.querySelectorAll('.overlay-card, [data-id="view"] .sierra').forEach(n => n.remove());
    const margin = g.flags.margin != null ? `${Math.floor(g.flags.margin / 60)}:${String(g.flags.margin % 60).padStart(2, '0')}` : '—';
    const o = this.overlay(`<div class="modal final" role="dialog" aria-labelledby="pl-fT"><h3 id="pl-fT">${this.D.rankFor(g.score)}</h3>
      <p>Score: ${g.score} of ${this.D.MAX_SCORE} · Hints used: ${g.hintsUsed} · ${this.D.texts.marginLabel}: ${margin}</p>
      <p class="note">${g.score >= this.D.MAX_SCORE ? this.D.texts.finalPerfect : this.D.texts.finalOther}</p>
      <div class="row"><button type="button" class="btn ghost" data-a="back">Back to games</button><button type="button" class="btn" data-a="again">Play again</button></div></div>`);
    o.querySelector('[data-a=again]').onclick = () => { o.remove(); this.blocking = false; this.game = this.newGame(); this.game.ownerId = this.account && this.account.id; this.script.startChapter(1, { fresh: true }); };
    o.querySelector('[data-a=back]').onclick = () => { o.remove(); this.blocking = false; if (this.options.onExit) this.options.onExit('finished'); };
  }

  // ---------- Hint drawer ----------
  async loadHints() {
    if (this.destroyed || !this.account || !this.ent.game || !this.ent.walk || !this.adapter.listHints) return;
    const game = this.game;
    try { const r = await this.adapter.listHints(this.D.GAME_ID); if (this.destroyed || this.game !== game) return; const rev = {}; (r.revealed || []).forEach(h => { if (typeof h.text === 'string' && Number.isInteger(h.level) && h.level >= 0 && h.level <= 2) { this.hintTexts[h.puzzle_id + h.level] = h.text; rev[h.puzzle_id] = Math.max(rev[h.puzzle_id] ?? -1, h.level); } }); if (this.game) { this.game.revealed = rev; this.game.hintsUsed = r.count || 0; this.updateHud(); } } catch (e) { if (!this.destroyed) this.toast(e.message || 'Hints unavailable.'); }
  }
  openDrawer() { this.context?.clear(); if (this.destroyed) return; this.shown = {}; this.loadingHints = true; this.renderDrawer(); this.loadHints().then(() => { this.loadingHints = false; if (!this.destroyed && !this.$('drawer').hidden) this.renderDrawer(); }); this.$('drawer').hidden = false; this.$('drawerveil').hidden = false; const f = this.$('drawer').querySelector('button'); if (f) f.focus(); }
  closeDrawer(silent) { this.$('drawer').hidden = true; this.$('drawerveil').hidden = true; this.shown = {}; if (!silent) this.refocus(); }
  renderDrawer() {
    const d = this.$('drawer'); d.innerHTML = ''; const g = this.game;
    const head = document.createElement('header');
    head.innerHTML = `<div><h3>Stuck?</h3><p class="sub">${g ? this.room().title : ''} · hints used: ${g ? g.hintsUsed : 0}</p></div>`;
    const x = document.createElement('button'); x.type = 'button'; x.className = 'btn small ghost'; x.textContent = 'Close'; x.onclick = () => this.closeDrawer(); head.appendChild(x); d.appendChild(head);
    if (!g) return;
    const list = this.D.PUZZLES[g.room] || [];
    if (!this.ent.game || !this.ent.walk) {
      const l = document.createElement('div'); l.className = 'locked';
      l.innerHTML = this.ent.game ? `<strong>The walkthrough is a separate optional add-on.</strong><span>It has a nudge, a clue and the full solution for every puzzle. Nothing is shown until you choose to reveal it.</span>` : `<strong>The walkthrough is a separate optional add-on.</strong><span>Unlock the entire ${this.D.texts.title} game — all remaining scenes — for ${this.price(this.D.SKU_GAME)}, one-time. No recurring charge. Then optionally add the walkthrough for ${this.price(this.D.SKU_WALK)}. Hints stay hidden until you choose to reveal them.</span>`;
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = this.ent.game ? `Add walkthrough · ${this.price(this.D.SKU_WALK)}` : `Unlock full game — ${this.price(this.D.SKU_GAME)}`; b.disabled = this.catalog[this.ent.game ? this.D.SKU_WALK : this.D.SKU_GAME]?.sale_enabled !== true; b.onclick = () => this.checkout(this.D.SKU_WALK);
      l.appendChild(b); d.appendChild(l);
      const t = document.createElement('p'); t.className = 'sub'; t.textContent = `Puzzles in this scene: ${list.map(p => p.title).join(' · ')}`; d.appendChild(t); return;
    }
    list.forEach(p => {
      const box = document.createElement('div'); box.className = 'puzzle'; const solved = p.solved(g);
      box.innerHTML = `<div class="ph"><b>${p.title}</b><span class="status-pill ${solved ? 'solved' : ''}">${solved ? 'Solved' : 'Unsolved'}</span></div>`;
      const lv = document.createElement('div'); lv.className = 'levels'; const got = g.revealed[p.id] ?? -1;
      LEVEL_NAMES.forEach((name, i) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'lvl' + (i <= got ? ' seen' : ''); b.dataset.puzzle = p.id; b.dataset.level = i;
        b.textContent = i <= got ? (this.shown[p.id + i] ? `Hide ${name.toLowerCase()}` : `Show ${name.toLowerCase()}`) : `Reveal ${name.toLowerCase()}`;
        b.disabled = this.loadingHints || i > got + 1; if (i > got + 1) b.title = `Reveal the ${LEVEL_NAMES[i - 1].toLowerCase()} first`;
        b.onclick = () => {
          if (i <= got) { this.shown[p.id + i] = !this.shown[p.id + i]; return this.renderDrawer(); }
          this.confirmReveal(p, i, async () => {
            try { const r = await this.adapter.revealHint(this.D.GAME_ID, p.id, i); if (this.destroyed || this.game !== g) return; if (typeof r.text !== 'string') throw new Error('Invalid hint response.'); this.hintTexts[p.id + i] = r.text; g.revealed[p.id] = i; g.hintsUsed++; this.shown[p.id + i] = true; this.persist(); this.updateHud(); this.renderDrawer(); }
            catch (x) { if (this.destroyed) return; this.toast((x && x.message) || 'That hint could not be fetched.'); if (x && x.status === 402) { try { await this.onPlatformChange(); } catch (_) {} } }
          });
        };
        lv.appendChild(b);
      });
      box.appendChild(lv);
      LEVEL_NAMES.forEach((_, i) => { if (this.shown[p.id + i]) { const t = document.createElement('div'); t.className = 'hint-text' + (i === 2 ? ' l3' : ''); t.textContent = this.hintTexts[p.id + i] || 'Loading…'; box.appendChild(t); } });
      d.appendChild(box);
    });
    const tg = document.createElement('label'); tg.className = 'toggle';
    tg.innerHTML = `<input type="checkbox" ${this.settings.wait10 ? 'checked' : ''}><span>Make me wait 10 seconds before a full solution appears</span>`;
    tg.querySelector('input').onchange = e => { this.settings.wait10 = e.target.checked; this.persist(); }; d.appendChild(tg);
    const n = document.createElement('p'); n.className = 'sub'; n.textContent = 'Hints hide again when you close this panel.'; d.appendChild(n);
  }
  confirmReveal(puzzle, lvl, onYes) {
    const bodies = ['You will see a gentle nudge. You can still work out the rest yourself.', 'This names the thing you need. It gives away part of the puzzle.', 'This shows the exact steps and spoils the puzzle completely.'];
    const m = this.modal(`<div class="modal" role="alertdialog"><h3>Reveal the ${LEVEL_NAMES[lvl].toLowerCase()} for “${puzzle.title}”?</h3><p>${bodies[lvl]}</p><div class="row"><button type="button" class="btn ghost" data-a="yes">Reveal</button><button type="button" class="btn alt" data-a="no">Keep trying</button></div></div>`);
    const yes = m.el.querySelector('[data-a=yes]'), no = m.el.querySelector('[data-a=no]'); no.focus(); no.onclick = () => m.close();
    let timer = null;
    if (lvl === 2 && this.settings.wait10) { let n = 10; yes.disabled = true; yes.textContent = `Reveal in ${n}`; timer = this.every(() => { n--; if (n <= 0) { clearInterval(timer); yes.disabled = false; yes.textContent = 'Reveal'; } else yes.textContent = `Reveal in ${n}`; }, 1000); }
    yes.onclick = () => { if (timer) clearInterval(timer); m.close(); onYes(); };
    const obs = new MutationObserver(() => { if (!m.el.isConnected) { if (timer) { clearInterval(timer); this.intervals.delete(timer); } obs.disconnect(); this.observers.delete(obs); } }); this.observers.add(obs); obs.observe(this.$('modalroot'), { childList: true });
  }

  // ---------- Inventory sheet (phones) ----------
  openInventory() {
    if (this.msgOpen || this.blocking || this.choiceOpen || !this.game) return;
    const m = this.modal(`<div class="modal inv-sheet" role="dialog"><div class="inv-head"><h3>Inventory</h3><button type="button" class="btn small ghost" data-a="close">Close</button></div><div class="inv-grid" data-id="invgrid"></div></div>`);
    m.el.querySelector('[data-a=close]').onclick = () => m.close();
    const g = m.el.querySelector('[data-id="invgrid"]');
    if (!this.game.inv.length) { const e = document.createElement('p'); e.className = 'inv-empty'; e.textContent = 'Nothing yet. Your pockets are as empty as your memory.'; g.appendChild(e); }
    this.game.inv.forEach(id => {
      const it = this.D.ITEMS[id]; const card = document.createElement('div'); card.className = 'inv-card';
      const nm = document.createElement('div'); nm.className = 'nm'; const i = document.createElement('i'); i.style.background = this.D.PAL[it.color]; nm.append(i, document.createTextNode(this.itemLabel(id)));
      const ds = document.createElement('div'); ds.className = 'ds'; ds.textContent = this.script.itemLook(id);
      const acts = document.createElement('div'); acts.className = 'acts';
      const use = document.createElement('button'); use.type = 'button'; use.className = 'btn'; use.textContent = 'Use on…'; use.onclick = () => { this.selItem = id; m.close(); this.renderInv(); this.renderVerbs(); };
      acts.append(use); card.append(nm, ds, acts); g.appendChild(card);
    });
    m.el.querySelector('[data-a=close]').focus();
  }
  landscapePhone() { return window.matchMedia('(orientation: landscape) and (max-height: 540px)').matches; }

  // ---------- Full screen ----------
  isFs() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  async enterImmersive() {
    if (this.destroyed) return false;
    const el = this.root;
    try { if (!this.isFs()) { if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' }); else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen(); } } catch (e) { return false; }
    if (this.destroyed) { this.exitImmersive(); return false; }
    this.ownsFullscreen = document.fullscreenElement === el || document.webkitFullscreenElement === el;
    try { if (screen.orientation && screen.orientation.lock) await screen.orientation.lock('landscape'); } catch (e) {}
    return true;
  }
  exitImmersive() { if (!this.root || (!this.ownsFullscreen && document.fullscreenElement !== this.root && document.webkitFullscreenElement !== this.root)) return; try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) {} try { if (this.isFs()) Promise.resolve((document.exitFullscreen || document.webkitExitFullscreen).call(document)).catch(() => {}); } catch (e) {} this.ownsFullscreen = false; }
  syncFs() { const can = !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen) && document.fullscreenEnabled !== false; this.root.querySelectorAll('.fs-btn').forEach(b => { b.hidden = !can; if (b.dataset.id !== 'rotFs') b.textContent = this.isFs() ? 'Exit full screen' : 'Full screen'; }); }

  // ---------- Wiring ----------
  wire() {
    const $ = this.$;
    this.cv.addEventListener('click', e => this.onCanvasClick(e));
    this.cv.addEventListener('mousemove', e => this.onCanvasMove(e));
    this.cv.addEventListener('mouseleave', () => { $('hover').textContent = ' '; });
    $('parser').addEventListener('submit', e => { e.preventDefault(); if (this.msgOpen || this.blocking || this.choiceOpen) return; const v = $('cmd').value; $('cmd').value = ''; this.parse(v); });
    $('restart').onclick = () => { if (!this.game) return; if (!this.blocking || this.root.querySelector('.sierra.death')) this.restartScene(); };
    $('exit').onclick = () => { this.context?.clear(); this.flushSave(false); if (this.options.onExit) this.options.onExit('user'); };
    $('stucktab').onclick = () => this.openDrawer();
    $('drawerveil').onclick = () => this.closeDrawer();
    $('sideStuck').onclick = () => this.openDrawer();
    $('sideItems').onclick = () => this.openInventory();
    $('sideRestart').onclick = () => $('restart').click();
    $('sideExit').onclick = () => $('exit').click();
    $('sideType').onclick = () => { const on = !this.root.classList.contains('typing'); this.root.classList.toggle('typing', on); $('sideType').textContent = on ? 'Hide keys' : 'Type'; if (on) $('cmd').focus(); else $('cmd').blur(); };
    $('cmd').addEventListener('blur', () => this.later(() => { if (document.activeElement !== $('cmd') && this.root.classList.contains('typing') && !$('cmd').value && !this.msgOpen && !this.choiceOpen && this.modalCount === 0) { this.root.classList.remove('typing'); $('sideType').textContent = 'Type'; } }, 150));
    this.root.querySelectorAll('.fs-btn').forEach(b => b.onclick = () => { if (b.dataset.id === 'rotFs') this.enterImmersive(); else if (this.isFs()) this.exitImmersive(); else this.enterImmersive(); });
    $('rotAnyway').onclick = () => this.root.classList.add('portrait-ok');
    this.listen(document, 'fullscreenchange', () => this.syncFs()); this.syncFs();
    this.listen(document, 'keydown', e => { if (e.key === 'Escape' && !$('drawer').hidden && this.modalCount === 0) this.closeDrawer(); });
  }
}
