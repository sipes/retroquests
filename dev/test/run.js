// End-to-end tests for Last Night in Port Lucky against the fixture adapter. No debug skips: every scenario plays the real UI.
//   node dev/serve.js 8788 &   then   node dev/test/run.js [scenario,...]
// Writes test-evidence/*.png, test-evidence/results.json and test-evidence/results.md
import fs from 'node:fs';
import path from 'node:path';
import { launch, Session, assert, EVIDENCE } from './harness.js';
import * as W from './walkthrough.js';

const only = process.argv.slice(2);
const results = [];
async function scenario(name, fn) {
  if (only.length && !only.includes(name)) return;
  const t0 = Date.now(); let s = null; const entry = { name, status: 'pass', ms: 0, notes: [], errors: [] };
  try { s = await fn(entry); }
  catch (e) { entry.status = 'fail'; entry.errors.push(e.stack || String(e)); if (e.session) { try { await e.session.shot('FAIL'); fs.writeFileSync(path.join(EVIDENCE, e.session.name + '-FAIL.log'), e.session.log.join('\n')); } catch (_) {} } }
  entry.ms = Date.now() - t0; results.push(entry); console.log(`${entry.status.toUpperCase()}  ${name}  (${(entry.ms / 1000).toFixed(1)}s)`); if (entry.status === 'fail') console.log('   ', entry.errors[0].split('\n')[0]);
}
const browser = await launch();
const wrap = async (s, fn) => { try { return await fn(); } catch (e) { e.session = s; throw e; } finally { if (s.errors.length) console.log('   page errors:', s.errors.slice(0, 3)); } };

// 1. Maximum score, dolphin route, as a game owner (no walkthrough).
await scenario('full-run-dolphin', async entry => {
  const s = await Session.open(browser, { player: 'owner', name: 'full-dolphin' }); await s.page.evaluate(() => window.__plAdapter.__reset()); await s.page.reload(); await s.page.waitForSelector('.pl-game');
  await wrap(s, async () => {
    await W.chapter1(s); await W.chapter2(s); await W.chapter3(s); await W.chapter4(s, 'dolphin'); await W.chapter5(s); await W.chapter6(s); await W.chapter7(s); const st = await W.chapter8(s, 'dolphin');
    entry.notes.push(`score ${st.score}/250, hints ${st.hintsUsed}, margin ${st.flags.margin}s, actions ${s.log.filter(l => l.startsWith('>')).length}`);
    assert(s.errors.length === 0, 'no page errors: ' + s.errors.join(' | '));
  }); fs.writeFileSync(path.join(EVIDENCE, 'full-dolphin.log'), s.log.join('\n')); await s.close();
});

// 2. Maximum score, cash route, as a walkthrough owner; reveals real hints along the way.
await scenario('full-run-cash-with-hints', async entry => {
  const s = await Session.open(browser, { player: 'walkthrough', name: 'full-cash' }); await s.page.evaluate(() => window.__plAdapter.__reset()); await s.page.reload(); await s.page.waitForSelector('.pl-game');
  await wrap(s, async () => {
    await W.chapter1(s); await W.chapter2(s); await W.chapter3(s);
    // Hint drawer: nudge, clue, full solution (10 s wait), ordering enforced.
    await s.cmd('look'); await s.page.click('.pl-game [data-id="stucktab"]'); await s.page.waitForSelector('.pl-game .drawer:not([hidden])');
    assert(await s.page.$('.pl-game .lvl[data-puzzle="sal-standoff"][data-level="2"][disabled]'), 'full solution disabled before clue');
    await s.page.click('.pl-game .lvl[data-puzzle="sal-standoff"][data-level="0"]'); await s.page.click('.pl-game .modal-veil [data-a="yes"]'); await s.page.waitForSelector('.pl-game .hint-text');
    const nudge = await s.page.$eval('.pl-game .hint-text', e => e.textContent); assert(/Sal only wants two things/.test(nudge), 'nudge text served from src/: ' + nudge);
    await s.page.click('.pl-game .lvl[data-puzzle="sal-standoff"][data-level="1"]'); await s.page.click('.pl-game .modal-veil [data-a="yes"]'); await s.page.waitForTimeout(300);
    await s.page.click('.pl-game .lvl[data-puzzle="sal-standoff"][data-level="2"]'); const yes = await s.page.$('.pl-game .modal-veil [data-a="yes"]'); assert(await yes.isDisabled(), 'full solution has a 10 s wait'); await s.page.click('.pl-game .modal-veil [data-a="no"]');
    await s.shot('hints-drawer'); await s.page.click('.pl-game .drawer .btn:has-text("Close")');
    assert((await s.state()).hintsUsed === 2, 'hintsUsed 2');
    await W.chapter4(s, 'cash'); await W.chapter5(s); await W.chapter6(s); await W.chapter7(s); const st = await W.chapter8(s, 'cash');
    entry.notes.push(`score ${st.score}/250 on the cash route, hints used ${st.hintsUsed}, margin ${st.flags.margin}s`);
    assert(s.errors.length === 0, 'no page errors: ' + s.errors.join(' | '));
  }); fs.writeFileSync(path.join(EVIDENCE, 'full-cash.log'), s.log.join('\n')); await s.close();
});

// 3. Free player: scene 1 ends at the paywall; hints are an upsell; no ownership is ever granted locally.
await scenario('free-player-paywall-and-denied-hints', async entry => {
  const s = await Session.open(browser, { player: 'free', name: 'free' }); await s.page.evaluate(() => window.__plAdapter.__reset()); await s.page.reload(); await s.page.waitForSelector('.pl-game');
  await wrap(s, async () => {
    await s.page.click('.pl-game [data-id="stucktab"]'); await s.page.waitForSelector('.pl-game .drawer:not([hidden])');
    assert(await s.page.$('.pl-game .locked'), 'drawer shows upsell for free player'); const txt = await s.page.$eval('.pl-game .locked', e => e.textContent); assert(/\$7\.99/.test(txt) && /\$1\.99/.test(txt), 'prices come from the catalogue: ' + txt);
    await s.shot('free-hints-locked'); await s.page.click('.pl-game .drawer .btn:has-text("Close")');
    const denied = await s.page.evaluate(() => window.__plAdapter.revealHint('port-lucky', 'goat', 0).then(() => 'granted', e => e.status)); assert(denied === 402, 'adapter denies hint with 402 for non-owners, got ' + denied);
    await W.chapter1(s); await s.dismiss(); await s.page.waitForSelector('.pl-game .overlay-card .price-big'); const price = await s.page.$eval('.pl-game .overlay-card .price-big', e => e.textContent); assert(price === '$7.99', 'paywall price $7.99: ' + price);
    await s.shot('paywall');
    await s.page.click('.pl-game .overlay-card [data-a="buy"]'); await s.page.waitForSelector('.pl-game .modal-veil [data-id="coErr"]'); await s.page.waitForFunction(() => /not simulated/.test(document.querySelector('.pl-game [data-id="coErr"]').textContent));
    await s.shot('checkout-not-simulated'); await s.page.click('.pl-game .modal-veil [data-a="cancel"]');
    const st = await s.state(); assert(st.chapter === 1 && st.flags.leftSuite && st.score === 25, 'progress saved at paywall');
    const ents = await s.page.evaluate(() => window.__plAdapter.getState().then(x => x.entitlements)); assert(ents.length === 0, 'no entitlements granted');
    // Reload: paywall persists for a free player with a finished scene 1
    await s.page.reload(); await s.page.waitForSelector('.pl-game .overlay-card .price-big'); entry.notes.push('paywall shown, checkout refused by fixture, entitlements unchanged, paywall persists on reload');
  }); await s.close();
});

// 4. Every death, with Try again restoring the pre-action state, then Restart scene from a checkpoint.
await scenario('deaths-retry-restart', async entry => {
  const s = await Session.open(browser, { player: 'owner', name: 'deaths' }); await s.page.evaluate(() => window.__plAdapter.__reset()); await s.page.reload(); await s.page.waitForSelector('.pl-game');
  const deaths = [];
  const die = async (label, cmd, pre) => { await s.cmd(cmd); const t = await s.expectDeath(label); deaths.push(label); await s.tryAgain(); const st = await s.state(); assert(JSON.stringify([st.score, st.inv, st.room]) === JSON.stringify([pre.score, pre.inv, pre.room]), `retry restores state for ${label}`); return t; };
  await wrap(s, async () => {
    let pre = await s.state(); await die('cocktail', 'drink cocktail', pre);
    await W.chapter1(s); await W.chapter2(s); await s.waitRoom('bar'); await s.dismiss();
    pre = await s.state(); await die('karaoke-no-token', 'use microphone', pre);
    pre = await s.state(); await die('duane-trophy', 'take trophy', pre);
    await s.cmd('use alley door'); await s.waitRoom('alley'); pre = await s.state(); await die('alley-bottle', 'drink bottle', pre);
    // Restart scene mid-chapter 3 returns to the chapter checkpoint
    await s.cmd('use bar door'); await s.waitRoom('bar'); await s.cmd('search jukebox'); assert((await s.state()).inv.includes('token'), 'token taken');
    await s.restartScene(); await s.dismiss(); const cp = await s.state(); assert(cp.room === 'bar' && !cp.inv.includes('token') && cp.score === 50, 'restart returns to chapter start');
    await W.chapter3(s); await s.waitRoom('pier'); await s.dismiss();
    await s.cmd('talk to nadia'); await s.cmd('take churro'); pre = await s.state(); await die('gulls', 'eat churro', pre);
    await s.cmd('use arcade'); await s.waitRoom('arcade'); pre = await s.state(); await die('hammer-on-glass', 'hit claw', pre);
    await s.cmd('use change machine'); await s.cmd('use quarters on claw'); await s.cmd('look at hammer'); await s.cmd('use hammer'); await s.cmd('use hammer'); await s.cmd('use hammer'); await s.cmd('take wallet'); await s.cmd('use door'); await s.waitRoom('pier');
    await s.cmd('talk to sal'); await s.cmd('give keys to sal'); await s.cmd('give dolphin to nadia'); pre = await s.state(); await s.cmd('use phone'); await s.choose(/Mom/); await s.expectDeath('call-mom'); deaths.push('call-mom'); await s.tryAgain(); assert((await s.state()).flags.calledKevin === undefined, 'retry after Mom restores');
    await s.cmd('use quarters on zora'); await s.cmd('use phone'); await s.choose(/Kevin/); await s.cmd('use marina'); await s.waitRoom('dock'); await s.dismiss();
    pre = await s.state(); await die('breakwater', 'use breakwater', pre);
    pre = await s.state(); await die('diesel', 'drink from pump', pre);
    await s.cmd('use quarters on telescope'); await s.cmd('talk to oscar'); await s.cmd('give churro to oscar'); await s.cmd('use oars on dinghy'); pre = await s.state(); await die('dinghy-no-rope', 'use dinghy', pre);
    await s.cmd('take rope'); await s.cmd('use rope on dinghy'); await s.cmd('use rope on cleat'); await s.cmd('use dinghy'); await s.waitRoom('pontoon'); pre = await s.state(); await die('winch', 'use winch', pre);
    await s.cmd('take shoe'); await s.cmd('take cooler'); await s.cmd('use cooler on benny'); await s.cmd('give right shoe to benny'); await s.cmd('use phone'); await s.waitRoom('corridor'); await s.dismiss();
    await W.chapter6(s); await s.waitRoom('lawn'); await s.dismiss();
    await s.cmd('use grooms tent'); await s.waitRoom('groomtent'); pre = await s.state(); await die('hip-flask', 'drink flask', pre);
    await s.cmd('take bag'); await s.cmd('take water'); await s.cmd('take polish'); await s.cmd('take bow tie'); await s.cmd('give water to benny'); await s.cmd('use tuxedo on benny'); await s.cmd('use polish on shoe'); await s.cmd('give shoe to benny'); await s.cmd('use flap'); await s.waitRoom('lawn');
    pre = await s.state(); await die('bridal-tent', 'use bridal tent', pre);
    // Clock expiry: wait for the real clock to run out (12 game-minutes = 4 real minutes), then retry gets 2 game-minutes back.
    for (let i = 0; i < 320 && !(await s.page.$('.pl-game .sierra.death')); i++) { await s.dismiss(); await s.page.waitForTimeout(1000); } // arrival messages pause the clock; a player would dismiss them
    await s.expectDeath('clock'); deaths.push('clock'); await s.tryAgain(); const st = await s.state(); assert(st.clock >= 100 && st.clock <= 120, 'retry after clock death restores 2 minutes: ' + st.clock);
    await s.restartScene(); await s.dismiss(); const r = await s.state(); assert(r.clock > 700 && r.inv.includes('ring') && r.score === 185, 'restart ch7 resets clock and inventory: ' + JSON.stringify([r.clock, r.score, r.inv]));
    entry.notes.push('deaths verified: ' + deaths.join(', '));
    assert(s.errors.length === 0, 'no page errors: ' + s.errors.join(' | '));
  }); fs.writeFileSync(path.join(EVIDENCE, 'deaths.log'), s.log.join('\n')); await s.close();
});

// 5. Old (v1 demo) save continues into the new chapters.
await scenario('old-save-migration', async entry => {
  const s = await Session.open(browser, { player: 'owner', name: 'oldsave' });
  await wrap(s, async () => {
    const v1 = { room: 'garage', inv: ['keycard', 'ticket'], flags: { minibarOpen: true, gotCrackers: true, goatFed: true, gotTicket: true, leftSuite: true, calledDesk: true, started: true }, scored: { feed: true, arm: true, minibar: true, crackers: true, ticket: true, tuba: true, desk: true, door: true }, score: 25, hintsUsed: 0, revealed: {}, px: 290, py: 168, dir: -1, started: true };
    await s.page.evaluate(() => window.__plGame.unmount()); await s.page.evaluate(v => window.__plAdapter.__seedSave(v), v1); await s.page.reload(); await s.page.waitForSelector('.pl-game'); await s.dismiss();
    const st = await s.state(); assert(st.v === 2 && st.chapter === 2 && st.room === 'garage' && st.score === 25 && st.inv.includes('ticket'), 'v1 save migrated: ' + JSON.stringify([st.v, st.chapter, st.room, st.score]));
    assert(st.checkpoint && st.checkpoint.chapter === 2, 'checkpoint synthesised for migrated save');
    await s.shot('migrated-save'); await W.chapter2(s); await s.waitRoom('bar'); assert((await s.state()).chapter === 3, 'continued into chapter 3');
    // A finished-demo v1 save (demoDone) also continues
    const v1b = Object.assign({}, v1, { flags: Object.assign({}, v1.flags, { truckOpen: true, gotKeys: true, gotShoe: true, gotReceipt: true, demoDone: true }), inv: ['keycard', 'keys', 'shoe', 'receipt'], score: 50 });
    await s.page.evaluate(() => window.__plGame.unmount()); await s.page.evaluate(v => window.__plAdapter.__seedSave(v), v1b); await s.page.reload(); await s.page.waitForSelector('.pl-game'); await s.dismiss();
    const st2 = await s.state(); assert(st2.chapter === 2 && !st2.flags.demoDone, 'demoDone cleared'); await s.cmd('use ramp'); await s.waitRoom('bar');
    entry.notes.push('v1 saves (mid-demo and demo-complete) migrate to v2 and continue');
  }); await s.close();
});

// 6. Save failure is visible and retryable; saves resume.
await scenario('save-failure-visible', async entry => {
  const s = await Session.open(browser, { player: 'owner', name: 'savefail' }); await s.page.evaluate(() => window.__plAdapter.__reset()); await s.page.reload(); await s.page.waitForSelector('.pl-game');
  await wrap(s, async () => {
    await s.page.check('#failSaves'); await s.cmd('look at me'); await s.page.waitForSelector('.pl-game .savestate.failed', { timeout: 5000 }); await s.shot('save-failed');
    const txt = await s.page.$eval('.pl-game .savestate', e => e.textContent); assert(/Save failed/.test(txt), 'failure shown');
    await s.page.uncheck('#failSaves'); await s.page.click('.pl-game [data-id="retrysave"]'); await s.page.waitForSelector('.pl-game .savestate.saved', { timeout: 5000 });
    const saved = await s.page.evaluate(() => window.__plAdapter.__readSave()); assert(saved && saved.score === 1, 'retry persisted the save: ' + JSON.stringify(saved && saved.score));
    entry.notes.push('failed save shows "Save failed" + Retry; retry succeeds and persists');
  }); await s.close();
});

// 7. Account change mid-game: progress is per account, nothing leaks between fixture players.
await scenario('account-change', async entry => {
  const s = await Session.open(browser, { player: 'owner', name: 'account' }); await s.page.evaluate(() => { window.__plAdapter.__reset('owner'); window.__plAdapter.__reset('free'); }); await s.page.reload(); await s.page.waitForSelector('.pl-game');
  await wrap(s, async () => {
    await W.chapter1(s); await s.waitRoom('garage'); await s.dismiss(); const owner = await s.state(); assert(owner.chapter === 2, 'owner in chapter 2'); await s.page.waitForFunction(() => { const sv = window.__plAdapter.__readSave('owner'); return sv && sv.chapter === 2; }, null, { timeout: 5000 });
    await s.setPlayer('free'); await s.page.waitForTimeout(600); await s.dismiss(); const free = await s.state(); assert(free && free.chapter === 1 && free.score === 0 && free.room === 'suite', 'free player starts fresh: ' + JSON.stringify([free && free.chapter, free && free.score]));
    await s.cmd('look at me'); await s.page.waitForTimeout(1200); await s.setPlayer('owner'); await s.page.waitForTimeout(600); await s.dismiss(); const back = await s.state(); assert(back.chapter === 2 && back.score === 25, 'owner progress intact after switching back');
    await s.setPlayer('anon'); await s.page.waitForTimeout(600); const gate = await s.page.$('.pl-game .pl-gate:not([hidden])'); entry.notes.push('signed-out state hands control back to host (onExit) or shows the gate: ' + (gate ? 'gate' : 'onExit'));
  }); await s.close();
});

// 8. Mobile: portrait shows the rotate prompt; landscape phone uses the side-action layout and the Type/Items sheets.
await scenario('mobile-layouts', async entry => {
  const s = await Session.open(browser, { player: 'owner', name: 'mobile', viewport: { width: 390, height: 844 } });
  await wrap(s, async () => {
    const vis = await s.page.$eval('.pl-game .rotate-hint', e => getComputedStyle(e).display); assert(vis !== 'none', 'rotate hint visible in portrait'); await s.shot('portrait-rotate-hint');
    await s.page.click('.pl-game [data-id="rotAnyway"]'); assert((await s.page.$eval('.pl-game .rotate-hint', e => getComputedStyle(e).display)) === 'none', 'play upright anyway dismisses it'); await s.shot('portrait-playing');
    await s.page.setViewportSize({ width: 844, height: 390 }); await s.page.waitForTimeout(300);
    assert((await s.page.$eval('.pl-game .side-actions', e => getComputedStyle(e).display)) === 'grid', 'side actions in landscape');
    assert((await s.page.$eval('.pl-game .parser', e => getComputedStyle(e).display)) === 'none', 'parser hidden until Type');
    const noScroll = await s.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1); assert(noScroll, 'no horizontal scroll in landscape');
    await s.shot('landscape');
    await s.page.click('.pl-game [data-id="sideType"]'); assert((await s.page.$eval('.pl-game .parser', e => getComputedStyle(e).display)) === 'flex', 'Type shows the keyboard parser'); await s.shot('landscape-typing');
    await s.cmd('open minibar'); await s.cmd('take crackers'); await s.dismiss();
    await s.page.click('.pl-game [data-id="sideItems"]'); await s.page.waitForSelector('.pl-game .inv-sheet'); await s.shot('landscape-items'); assert(await s.page.$('.pl-game .inv-card'), 'inventory sheet lists the crackers');
    await s.page.click('.pl-game .inv-card .btn'); await s.page.waitForTimeout(200); assert(await s.page.$('.pl-game .using'), 'Use on… arms the item'); await s.clickCanvas(160, 70); await s.dismiss(); assert((await s.state()).flags.goatFed, 'tap-to-use works on the goat');
    entry.notes.push('portrait rotate prompt, landscape side actions, Type + Items sheets, tap-to-use on canvas');
  }); await s.close();
});

// 9. Mount/unmount hygiene and point-and-click verbs.
await scenario('mount-unmount-and-clicks', async entry => {
  const s = await Session.open(browser, { player: 'owner', name: 'mount' }); await s.page.evaluate(() => window.__plAdapter.__reset()); await s.page.reload(); await s.page.waitForSelector('.pl-game'); await s.dismiss();
  await wrap(s, async () => {
    await s.clickVerb('Look'); await s.clickCanvas(160, 70); const m = await s.lastMessages(); assert(/goat/i.test(m[0] || ''), 'click Look on goat: ' + m[0]); await s.dismiss();
    await s.clickVerb('Use'); await s.clickCanvas(236, 95); await s.dismiss(); assert((await s.state()).flags.minibarOpen, 'click Use on minibar');
    await s.clickVerb('Take'); await s.clickCanvas(228, 90); await s.dismiss(); assert((await s.state()).inv.includes('crackers'), 'click Take crackers');
    await s.clickItem('crackers'); await s.clickCanvas(160, 70); await s.dismiss(); assert((await s.state()).flags.goatFed, 'select item then click goat');
    await s.page.evaluate(() => window.__plGame.unmount()); assert(!(await s.page.$('.pl-game')), 'unmount removes the DOM'); await s.page.waitForTimeout(300); assert(s.errors.length === 0, 'no errors after unmount');
    await s.page.click('#remount'); await s.page.waitForSelector('.pl-game'); await s.dismiss(); assert((await s.state()).flags.goatFed, 'remount restores saved progress');
    entry.notes.push('verb clicks, item-on-hotspot clicks, unmount/remount');
  }); await s.close();
});

await browser.close();
const pass = results.filter(r => r.status === 'pass').length;
fs.writeFileSync(path.join(EVIDENCE, 'results.json'), JSON.stringify(results, null, 2));
const md = ['# Port Lucky test results', '', `Run: ${new Date().toISOString()} · ${pass}/${results.length} scenarios passed · fixture adapter (not the live platform)`, '', '| Scenario | Status | Time | Notes |', '| --- | --- | --- | --- |', ...results.map(r => `| ${r.name} | ${r.status} | ${(r.ms / 1000).toFixed(0)}s | ${r.notes.join('; ')}${r.errors.length ? ' **' + r.errors[0].split('\n')[0] + '**' : ''} |`)].join('\n');
fs.writeFileSync(path.join(EVIDENCE, 'results.md'), md);
console.log(`\n${pass}/${results.length} passed`); process.exit(pass === results.length ? 0 : 1);
