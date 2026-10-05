// Playwright harness for Last Night in Port Lucky (fixture adapter). Drives the real UI: typed commands, clicks, choices.
// Usage: node dev/test/run.js  (expects dev/serve.js on :8788; set PL_BASE to override)
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

export const BASE = process.env.PL_BASE || 'http://localhost:8788/dev/port-lucky/';
export const EVIDENCE = path.resolve(process.env.PL_EVIDENCE || 'test-evidence');
fs.mkdirSync(EVIDENCE, { recursive: true });
const EXEC = process.env.PL_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

export class Session {
  constructor(page, name) { this.page = page; this.name = name; this.shots = 0; this.log = []; this.errors = []; }
  static async open(browser, { player = 'owner', viewport = { width: 1100, height: 820 }, name = 'session' } = {}) {
    const ctx = await browser.newContext({ viewport });
    const page = await ctx.newPage(); const s = new Session(page, name);
    page.on('pageerror', e => s.errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL|404|favicon|fonts/.test(m.text())) s.errors.push('console: ' + m.text()); });
    await page.goto(BASE + '?player=' + player); await page.waitForSelector('.pl-game', { timeout: 15000 }); await page.waitForTimeout(400);
    return s;
  }
  async state() { return this.page.evaluate(() => window.__plGame && window.__plGame.state); }
  async flags() { return (await this.state()).flags; }
  async shot(label) { this.shots++; const f = path.join(EVIDENCE, `${this.name}-${String(this.shots).padStart(2, '0')}-${label}.png`); await this.page.screenshot({ path: f }); return f; }
  async dismiss(max = 12) { // close message boxes (not deaths/choices)
    for (let i = 0; i < max; i++) {
      const box = await this.page.$('.pl-game .sierra.msg'); if (!box) break;
      const t = await box.textContent(); this.log.push('MSG ' + t.replace(/Click or press Enter/, '').trim().slice(0, 140));
      await box.click(); await this.page.waitForTimeout(60);
    }
  }
  async cmd(text, { settle = 250 } = {}) {
    await this.dismiss();
    const input = await this.page.$('.pl-game [data-id="cmd"]');
    await input.fill(text); await input.press('Enter'); this.log.push('> ' + text);
    await this.page.waitForTimeout(settle);
    // allow walking to finish, then messages
    await this.page.waitForFunction(() => { const g = window.__plGame && window.__plGame.engine; return g && !g.walkTarget; }, null, { timeout: 8000 }).catch(() => {});
    await this.page.waitForTimeout(80);
    return this.lastMessages();
  }
  async lastMessages() { const els = await this.page.$$('.pl-game .sierra'); const out = []; for (const e of els) out.push((await e.textContent()).replace(/Click or press Enter/, '').trim()); return out; }
  async choose(labelRe) {
    await this.page.waitForSelector('.pl-game .sierra.choice', { timeout: 5000 });
    const btns = await this.page.$$('.pl-game .sierra.choice button');
    for (const b of btns) { const t = await b.textContent(); if (labelRe.test(t)) { this.log.push('CHOOSE ' + t); await b.click(); await this.page.waitForTimeout(150); return t; } }
    throw new Error('choice not found: ' + labelRe);
  }
  async expectDeath(label) {
    await this.page.waitForSelector('.pl-game .sierra.death', { timeout: 5000 });
    const txt = await this.page.$eval('.pl-game .sierra.death', e => e.textContent); this.log.push('DEATH ' + txt.slice(0, 120));
    await this.shot('death-' + label);
    return txt;
  }
  async tryAgain() { await this.page.click('.pl-game .sierra.death button:has-text("Try again")'); await this.page.waitForTimeout(150); }
  async restartScene() { const d = await this.page.$('.pl-game .sierra.death'); if (d) await this.page.click('.pl-game .sierra.death button:has-text("Restart scene")'); else await this.page.click('.pl-game [data-id="restart"]'); await this.page.waitForTimeout(200); }
  async clickItem(id) { await this.dismiss(); await this.page.click(`.pl-game .item[data-item="${id}"]`); await this.page.waitForTimeout(80); }
  async clickVerb(label) { await this.page.click(`.pl-game .verb:has-text("${label}")`); }
  async clickCanvas(gx, gy) { // game-space coordinates
    await this.dismiss(); const box = await this.page.$eval('.pl-game canvas', c => { const r = c.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
    await this.page.mouse.click(box.x + gx / 320 * box.w, box.y + gy / 180 * box.h); await this.page.waitForTimeout(200);
    await this.page.waitForFunction(() => { const g = window.__plGame && window.__plGame.engine; return g && !g.walkTarget; }, null, { timeout: 8000 }).catch(() => {});
  }
  async waitRoom(room, timeout = 10000) { await this.dismiss(); await this.page.waitForFunction(r => window.__plGame && window.__plGame.state && window.__plGame.state.room === r, room, { timeout }); }
  async setPlayer(p) { await this.page.selectOption('#player', p); await this.page.waitForTimeout(500); }
  async close() { await this.page.context().close(); }
}
export async function launch() { return chromium.launch({ executablePath: EXEC }); }
export function assert(cond, msg) { if (!cond) throw new Error('ASSERT: ' + msg); }
