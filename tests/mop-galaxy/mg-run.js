// Supplier scenarios adapted to actual LOCAL portal/adapter/Worker/D1. No live providers.
//   node dev/serve.js 8788 &   then   PL_BASE=http://localhost:8788/dev/mop-galaxy/ PL_EVIDENCE=test-evidence/mop-galaxy node dev/test/mg-run.js [scenario,...]
// Writes <evidence>/*.png, results.json and results.md
import fs from 'node:fs';
import path from 'node:path';
import { launch, Session, assert, EVIDENCE } from './harness.js';
import * as W from './mg-walkthrough.js';

process.env.PL_BASE || (console.error('Set PL_BASE to the Mop & Galaxy dev host, e.g. http://localhost:8788/dev/mop-galaxy/'), process.exit(2));
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
const fresh = async (player, name, viewport) => { const s = await Session.open(browser, { player, name, viewport }); await s.page.evaluate(async () => {const p=await import('/portal.js');await p.host.stop();await window.__plAdapter.__reset();}); await s.page.reload(); await s.page.waitForSelector('.pl-game'); return s; };
const finalText = s => s.page.$eval('.pl-game .modal.final', e => e.textContent);

// 1. Maximum score as a game owner (no walkthrough): 250/250, Deck Officer.
await scenario('full-run-deck-officer', async entry => {
  const s = await fresh('owner', 'full-officer');
  await wrap(s, async () => {
    await W.chapter1(s); await W.chapter2(s); await W.chapter3(s); await W.chapter4(s); await W.chapter5(s); await W.chapter6(s); await W.chapter7(s); await W.chapter8(s, 'officer');
    const st = await s.state(); const ft = await finalText(s); await s.shot('final');
    assert(st.score === 250 && st.done && /Deck Officer/.test(ft), 'final 250 Deck Officer: ' + st.score + ' / ' + ft.slice(0, 80));
    entry.notes.push(`score ${st.score}/250, hints ${st.hintsUsed}, margin ${st.flags.margin}s, actions ${s.log.filter(l => l.startsWith('>')).length}`);
    assert(s.errors.length === 0, 'no page errors: ' + s.errors.join(' | '));
  }); fs.writeFileSync(path.join(EVIDENCE, 'full-officer.log'), s.log.join('\n')); await s.close();
});

// 2. Walkthrough owner: real hints from src/ through the drawer, ordering enforced; weaker answer scores less.
await scenario('full-run-with-hints', async entry => {
  const s = await fresh('walkthrough', 'full-hints');
  await wrap(s, async () => {
    await s.dismiss(); await s.page.click('.pl-game [data-id="stucktab"]'); await s.page.waitForSelector('.pl-game .drawer:not([hidden])');
    assert(await s.page.$('.pl-game .lvl[data-puzzle="snack-tool"][data-level="2"][disabled]'), 'full solution disabled before clue');
    await s.page.click('.pl-game .lvl[data-puzzle="snack-tool"][data-level="0"]'); await s.page.click('.pl-game .modal-veil [data-a="yes"]'); await s.page.waitForSelector('.pl-game .hint-text');
    const nudge = await s.page.$eval('.pl-game .hint-text', e => e.textContent); assert(/doing a job already/.test(nudge), 'nudge text served from src/: ' + nudge);
    await s.page.click('.pl-game .lvl[data-puzzle="snack-tool"][data-level="1"]'); await s.page.click('.pl-game .modal-veil [data-a="yes"]'); await s.page.waitForTimeout(300);
    await s.page.click('.pl-game .lvl[data-puzzle="snack-tool"][data-level="2"]'); const yes = await s.page.$('.pl-game .modal-veil [data-a="yes"]'); assert(await yes.isDisabled(), 'full solution has a 10 s wait'); await s.page.click('.pl-game .modal-veil [data-a="no"]');
    await s.shot('hints-drawer'); await s.page.click('.pl-game .drawer .btn:has-text("Close")');
    assert((await s.state()).hintsUsed === 2, 'hintsUsed 2');
    await W.chapter1(s); await W.chapter2(s); await W.chapter3(s); await W.chapter4(s); await W.chapter5(s); await W.chapter6(s); await W.chapter7(s); await W.chapter8(s, 'wim');
    const st = await s.state(); const ft = await finalText(s); assert(st.score === 247 && /Second Class/.test(ft), 'weaker answer: 247 Second Class, got ' + st.score + ' ' + ft.slice(0, 60));
    entry.notes.push(`score ${st.score}/250 with the "Wim" answer, hints used ${st.hintsUsed}, margin ${st.flags.margin}s`);
    assert(s.errors.length === 0, 'no page errors: ' + s.errors.join(' | '));
  }); fs.writeFileSync(path.join(EVIDENCE, 'full-hints.log'), s.log.join('\n')); await s.close();
});

// 3. Free player: scene 1 ends at the paywall; hints are an upsell; no ownership is ever granted locally.
await scenario('free-player-paywall-and-denied-hints', async entry => {
  const s = await fresh('free', 'free');
  await wrap(s, async () => {
    await s.dismiss(); await s.page.click('.pl-game [data-id="stucktab"]');
    assert(!(await s.page.$('.pl-game .hint-text')), 'safe public scene has no answer drawer');
    await s.shot('free-hints-locked');
    const denied = await s.page.evaluate(() => window.__plAdapter.revealHint('mop-galaxy', 'snack-tool', 0).then(() => 'granted', e => e.status)); assert(denied === 402, 'actual Worker denies hint with 402 for non-owners, got ' + denied);
    await W.chapter1(s); await s.dismiss(); await s.page.waitForSelector('.pl-game .overlay-card .price-big'); const price = await s.page.$eval('.pl-game .overlay-card .price-big', e => e.textContent); assert(price === '$7.99', 'paywall price $7.99: ' + price);
    await s.shot('paywall');
    assert(await s.page.locator('.pl-game .overlay-card [data-a="buy"]').isDisabled(), 'real server-disabled sale is disabled in demo');
    const checkout = await s.page.evaluate(() => window.__plAdapter.checkout('mop-galaxy').then(() => 'opened', e => e.status)); assert(checkout === 503, 'actual Worker refuses disabled checkout');
    await s.shot('checkout-disabled-server');
    const st = await s.state(); assert(st.chapter === 1 && st.flags.leftDeck9 && st.score === 20, 'progress saved at paywall: ' + JSON.stringify([st.chapter, st.score]));
    const ents = await s.page.evaluate(() => window.__plAdapter.getState().then(x => x.entitlements)); assert(ents.length === 0, 'no entitlements granted');
    await s.page.waitForSelector('.pl-game .savestate.saved'); await s.page.reload(); await s.page.waitForSelector('.pl-game .overlay-card .price-big'); entry.notes.push('safe paywall, actual checkout refused, ownership unchanged, actual D1 save resumes');
  }); await s.close();
});

// 4. Deaths along the way, with Try again restoring the pre-action state; action timers; Restart scene from a checkpoint; the chapter 8 clock.
await scenario('deaths-retry-restart', async entry => {
  const s = await fresh('owner', 'deaths');
  const deaths = [];
  const die = async (label, cmd, pre) => { await s.cmd(cmd); const t = await s.expectDeath(label); deaths.push(label); await s.tryAgain(); const st = await s.state(); assert(JSON.stringify([st.score, st.inv, st.room]) === JSON.stringify([pre.score, pre.inv, pre.room]), `retry restores state for ${label}`); return t; };
  await wrap(s, async () => {
    let pre = await s.state(); await die('cage-bottle', 'drink from cage', pre);
    await s.cmd('look at shelves'); pre = await s.state(); await die('shelf-collapse', 'take wrench', pre);
    await s.cmd('use door'); await s.waitRoom('deck9'); pre = await s.state(); await die('fire-cabinet-alarm', 'break glass', pre);
    await s.cmd('use closet door'); await s.waitRoom('closet');
    await W.chapter1(s, { strict: false }); await s.waitRoom('cryo'); await s.dismiss();
    pre = await s.state(); await die('main-door', 'use main door', pre);
    pre = await s.state(); await die('lick-hose', 'lick hose', pre);
    // The sweep is an action timer: seven non-look actions without hiding and the flashlights find you. Try again rolls the counter back.
    for (let i = 0; i < 6; i++) await s.cmd('use terminal'); pre = await s.state(); await s.cmd('use terminal'); await s.expectDeath('sweep'); deaths.push('sweep'); await s.tryAgain();
    await s.cmd('use terminal'); assert(!(await s.page.$('.pl-game .sierra.death')), 'timer death does not repeat on the very next action'); await s.dismiss();
    // Restart scene returns to the chapter 2 checkpoint
    await s.cmd('take notice'); assert((await s.state()).inv.includes('notice'), 'notice taken');
    await s.restartScene(); await s.dismiss(); const cp = await s.state(); assert(cp.room === 'cryo' && !cp.inv.includes('notice') && cp.score === 20 && !cp.flags.sweep, 'restart returns to chapter start: ' + JSON.stringify([cp.room, cp.score]));
    await s.cmd('take notice'); await s.cmd('take hose'); await s.cmd('hide in pod'); await s.cmd('use stairs'); await s.waitRoom('gallery');
    pre = await s.state(); await die('hot-duct', 'climb duct', pre);
    await s.cmd('take roster'); await s.cmd('look at captain'); await s.cmd('take blanket'); await s.cmd('use blanket on duct'); await s.cmd('climb duct'); await s.waitRoom('galley'); await s.dismiss();
    pre = await s.state(); await die('corridor-door', 'open corridor door', pre);
    await s.cmd('use hatch'); await s.waitRoom('hydro'); pre = await s.state(); await die('thistle-tomato', 'take tomato', pre);
    await s.cmd('use galley hatch'); await s.waitRoom('galley'); await s.cmd('look at compost'); await s.cmd('take tray'); await s.cmd('use tray on compost'); await s.dismiss();
    await s.cmd('use hatch'); await s.waitRoom('hydro'); await s.cmd('give roster to thistle'); await s.cmd('take tomato'); await s.cmd('take ties'); await s.cmd('give ties to gumbo');
    await s.cmd('use galley hatch'); await s.waitRoom('galley'); await s.cmd('use crew card on locker'); await s.cmd('use gumbo on wheel'); await s.cmd('use hatch'); await s.waitRoom('hydro'); await s.cmd('look at vault'); await s.cmd('use service duct'); await s.waitRoom('drive'); await s.dismiss();
    pre = await s.state(); await die('ilse-hears', 'talk to ilse', pre);
    pre = await s.state(); await die('ilse-turns', 'use intake', pre);
    pre = await s.state(); await die('airlock-no-suit', 'use airlock', pre);
    await s.cmd('use red door'); await s.waitRoom('reactor'); await s.cmd('look at glass'); await s.cmd('look at glass'); pre = await s.state(); await die('lead-glass', 'look at glass', pre);
    await s.cmd('use door'); await s.waitRoom('drive'); await s.cmd('talk to mop'); await s.cmd('press test button'); await s.cmd('use toolkit on intake');
    // Ilse comes back with the housing open: death; Try again gives you enough actions to finish and close it.
    for (let i = 0; i < 9 && !(await s.page.$('.pl-game .sierra.death')); i++) await s.cmd('use catwalk');
    await s.expectDeath('ilse-returns'); deaths.push('ilse-returns'); await s.tryAgain(); const ilse = await s.state(); assert(ilse.flags.ilseDistracted && ilse.flags.ilseT === 4 && ilse.flags.filterOut, 'retry leaves Ilse away for four actions: ' + JSON.stringify([ilse.flags.ilseDistracted, ilse.flags.ilseT]));
    await s.cmd('use polish on intake'); await s.cmd('use oven cleaner on intake'); await s.cmd('use filter on intake'); await s.dismiss(); assert((await s.state()).flags.jumpInhibited, 'loop fouled after the retry');
    await s.cmd('use red door'); await s.waitRoom('reactor'); await s.cmd('take dosimeter'); await s.cmd('take suit'); await s.cmd('take helmet'); await s.cmd('use toolkit on helmet'); await s.cmd('take oxygen'); await s.cmd('take tether'); await s.cmd('use suit check'); await s.cmd('use door'); await s.waitRoom('drive');
    await s.cmd('use mop handle on airlock'); await s.waitRoom('hull1'); await s.dismiss();
    pre = await s.state(); await die('unclipped', 'use aft', pre);
    await W.chapter5(s, { strict: false }); await W.chapter6(s, { strict: false }); await s.waitRoom('collar'); await s.dismiss();
    pre = await s.state(); await die('keypad-wrench', 'use wrench on keypad', pre);
    await s.cmd('search crate'); await s.cmd('take sandwich'); await s.cmd('use keypad'); await s.choose(/^4471$/); await s.waitRoom('hold');
    pre = await s.state(); await die('cargo-drone', 'use drone', pre);
    await s.cmd('use corridor to crew quarters'); await s.waitRoom('quarters'); await s.cmd('take jacket'); await s.cmd('take jacket'); pre = await s.state(); await die('precedent', 'take jacket', pre);
    await s.cmd('give sandwich to cat'); await s.cmd('search breast pocket'); await s.cmd('use toolkit on lockbox'); await s.cmd('use gumbo on vent'); await s.cmd('use cabin door'); await s.waitRoom('hold'); await s.cmd('use light switch'); await s.cmd('use clamp room'); await s.waitRoom('clamps');
    pre = await s.state(); await die('dorrit-tablet', 'hit dorrit', pre);
    await s.cmd('use mop on corridor'); await s.cmd('use loudspeaker'); await s.dismiss(); await s.cmd('give key b to gumbo'); await s.cmd('use key a on left keyhole'); await s.cmd('use gumbo on right keyhole'); await s.cmd('use panel'); await s.dismiss(); await s.cmd('pull lever'); await s.dismiss();
    // Dawdle after the lever: the pressure door seals with you inside. Try again gives the door back four actions.
    for (let i = 0; i < 8 && !(await s.page.$('.pl-game .sierra.death')); i++) await s.cmd('use hydraulics');
    await s.expectDeath('door-seals'); deaths.push('door-seals'); await s.tryAgain(); assert((await s.state()).flags.doorT === 4, 'retry resets the door timer to 4');
    await s.cmd('use corridor'); await s.waitRoom('hold'); await s.cmd('use collar'); await s.waitRoom('collar'); await s.cmd('use hyacinth'); await s.waitRoom('lift'); await s.dismiss(); const lift0 = await s.state();
    await s.cmd('use hatch'); await s.cmd('use buttons'); await s.waitRoom('gallery2'); await s.dismiss();
    pre = await s.state(); await s.cmd('talk to brack'); await s.choose(/Please/); await s.dismiss(); await s.cmd('talk to brack'); await s.choose(/Gumbo eats/); await s.expectDeath('brack-reaches-you'); deaths.push('brack-reaches-you'); await s.tryAgain();
    // Clock expiry: wait for the real four-minute clock to run out, then Try again restores 90 s; Restart scene resets it.
    for (let i = 0; i < 300 && !(await s.page.$('.pl-game .sierra.death')); i++) { await s.dismiss(); await s.page.waitForTimeout(1000); }
    await s.expectDeath('clock'); deaths.push('clock'); await s.tryAgain(); const st = await s.state(); assert(st.clock >= 80 && st.clock <= 90, 'retry after clock death restores 90 s: ' + st.clock);
    await s.restartScene(); await s.dismiss(); const r = await s.state(); assert(r.clock > 230 && r.room === 'lift' && r.inv.includes('codecard') && r.score === lift0.score, 'restart ch8 resets clock and inventory: ' + JSON.stringify([r.clock, r.room, r.score]));
    entry.notes.push('deaths verified: ' + deaths.join(', '));
    assert(s.errors.length === 0, 'no page errors: ' + s.errors.join(' | '));
  }); fs.writeFileSync(path.join(EVIDENCE, 'deaths.log'), s.log.join('\n')); await s.close();
});

// 5. Chapter presets: every CHAPTER_START(n) is a playable checkpoint (seeded as a save, then the chapter is completed from it).
await scenario('chapter-presets', async entry => {
  const s = await fresh('owner', 'presets');
  await wrap(s, async () => {
    const chapters = { 2: W.chapter2, 3: W.chapter3, 4: W.chapter4, 5: W.chapter5, 6: W.chapter6, 7: W.chapter7 };
    for (const n of Object.keys(chapters)) {
      await s.page.evaluate(async () => { const p = await import('/portal.js'); await p.host.stop(); });
      await s.page.evaluate(async n => { const m = await import('/games/mop-galaxy/script.js'); await window.__plAdapter.__seedSave(m.CHAPTER_START(n)); }, Number(n));
      await s.page.reload(); await s.page.waitForSelector('.pl-game'); await s.dismiss();
      await chapters[n](s); await s.dismiss(); const st = await s.state(); assert(st.chapter === Number(n) + 1, `preset ${n} plays through to chapter ${Number(n) + 1}, got ${st.chapter}`);
    }
    await s.page.evaluate(async () => { const p = await import('/portal.js'); await p.host.stop(); });
    await s.page.evaluate(async () => { const m = await import('/games/mop-galaxy/script.js'); await window.__plAdapter.__seedSave(m.CHAPTER_START(8)); });
    await s.page.reload(); await s.page.waitForSelector('.pl-game'); await s.dismiss(); await W.chapter8(s, 'contractor');
    const st = await s.state(); assert(st.score === 245 && st.done, 'preset 8 finishes with the weakest answer at 245: ' + st.score);
    entry.notes.push('presets 2–8 seeded as saves and completed');
  }); await s.close();
});

// 6. Save failure is visible and retryable; saves resume.
await scenario('save-failure-visible', async entry => {
  const s = await fresh('owner', 'savefail');
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
  const s = await Session.open(browser, { player: 'owner', name: 'account' }); await s.page.evaluate(async () => { const p=await import('/portal.js');await p.host.stop();await window.__plAdapter.__reset('owner');await window.__plAdapter.__reset('free'); }); await s.page.reload(); await s.page.waitForSelector('.pl-game');
  await wrap(s, async () => {
    await W.chapter1(s); await s.waitRoom('cryo'); await s.dismiss(); const owner = await s.state(); assert(owner.chapter === 2, 'owner in chapter 2'); await s.page.evaluate(()=>window.__plGame.engine.flushSave(false));await s.page.waitForFunction(async () => { const sv = await window.__plAdapter.__readSave('owner'); return sv && sv.chapter === 2; }, null, { timeout: 5000 });
    await s.setPlayer('free'); await s.page.waitForTimeout(600); await s.dismiss(); const free = await s.state(); assert(free && free.chapter === 1 && free.score === 0 && free.room === 'closet', 'free player starts fresh: ' + JSON.stringify([free && free.chapter, free && free.score]));
    await s.cmd('look at me'); await s.page.evaluate(()=>window.__plGame.engine.flushSave(false));await s.setPlayer('owner');await s.page.waitForFunction(()=>window.__plGame?.state?.chapter===2); await s.dismiss(); const back = await s.state(); assert(back.chapter === 2 && back.score === 20, 'owner progress intact after switching back: ' + JSON.stringify([back.chapter, back.score]));
    await s.setPlayer('anon'); await s.page.waitForTimeout(600); const gate = await s.page.$('.pl-game .pl-gate:not([hidden])'); entry.notes.push('signed-out state hands control back to host (onExit) or shows the gate: ' + (gate ? 'gate' : 'onExit'));
  }); await s.close();
});

// 8. Mobile: portrait shows the rotate prompt; landscape phone uses the side-action layout and the Type/Items sheets.
await scenario('mobile-layouts', async entry => {
  const s = await fresh('owner', 'mobile', { width: 390, height: 844 });
  await wrap(s, async () => {
    const vis = await s.page.$eval('.pl-game .rotate-hint', e => getComputedStyle(e).display); assert(vis !== 'none', 'rotate hint visible in portrait'); await s.shot('portrait-rotate-hint');
    await s.page.click('.pl-game [data-id="rotAnyway"]');await s.page.waitForFunction(()=>getComputedStyle(document.querySelector('.pl-game .rotate-hint')).display==='none'); assert((await s.page.$eval('.pl-game .rotate-hint', e => getComputedStyle(e).display)) === 'none', 'play upright anyway dismisses it'); await s.shot('portrait-playing');
    await s.page.setViewportSize({ width: 844, height: 390 }); await s.page.waitForTimeout(300);
    assert((await s.page.$eval('.pl-game .side-actions', e => getComputedStyle(e).display)) === 'grid', 'side actions in landscape');
    assert((await s.page.$eval('.pl-game .parser', e => getComputedStyle(e).display)) === 'none', 'parser hidden until Type');
    const noScroll = await s.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1); assert(noScroll, 'no horizontal scroll in landscape');
    await s.shot('landscape');
    await s.page.click('.pl-game [data-id="sideType"]'); assert((await s.page.$eval('.pl-game .parser', e => getComputedStyle(e).display)) === 'flex', 'Type shows the keyboard parser'); await s.shot('landscape-typing');
    await s.cmd('take coverall'); await s.dismiss();
    await s.page.click('.pl-game [data-id="sideItems"]'); await s.page.waitForSelector('.pl-game .inv-sheet'); await s.shot('landscape-items'); assert(await s.page.$('.pl-game .inv-card'), 'inventory sheet lists the items');
    const cards = await s.page.$$('.pl-game .inv-card'); let armed = false; for (const c of cards) { const t = await c.textContent(); if (/badge/i.test(t)) { await c.$eval('.btn', b => b.click()); armed = true; break; } }
    assert(armed, 'badge card found'); await s.page.waitForTimeout(200); assert(await s.page.$('.pl-game .using'), 'Use on… arms the item'); await s.clickCanvas(40, 40); await s.dismiss();
    const m = s.log.filter(l => l.startsWith('MSG')).pop(); assert(/CONTRACTOR/.test(m || ''), 'tap-to-use badge on the chemical cage: ' + m);
    entry.notes.push('portrait rotate prompt, landscape side actions, Type + Items sheets, tap-to-use on canvas');
  }); await s.close();
});

// 9. Mount/unmount hygiene and point-and-click verbs.
await scenario('mount-unmount-and-clicks', async entry => {
  const s = await fresh('owner', 'mount'); await s.dismiss();
  await wrap(s, async () => {
    await s.clickVerb('Look'); await s.clickCanvas(114, 120); const m = await s.lastMessages(); assert(/MOP-7/.test(m[0] || ''), 'click Look on Mop: ' + m[0]); await s.dismiss();
    await s.clickVerb('Take'); await s.clickCanvas(278, 60); await s.dismiss(); assert((await s.state()).inv.includes('badge'), 'click Take coverall gives the badge');
    await s.clickVerb('Use'); await s.clickCanvas(160, 152); await s.dismiss(); assert((await s.state()).flags.sawBoarders, 'click Use on the floor vent');
    await s.clickItem('badge'); await s.clickCanvas(40, 40); await s.dismiss(); const m2 = s.log.filter(l => l.startsWith('MSG')).pop(); assert(/CONTRACTOR/.test(m2 || ''), 'select item then click the cage: ' + m2);
    await s.clickVerb('Talk'); await s.clickCanvas(114, 120); await s.dismiss(); assert(s.log.some(l => /delivery/.test(l)), 'Talk to Mop');
    await s.page.evaluate(async () => { const p=await import('/portal.js');await p.host.stop(); }); assert(!(await s.page.$('.pl-game')), 'unmount removes the DOM'); await s.page.waitForTimeout(300); assert(s.errors.length === 0, 'no errors after unmount');
    await s.page.click('#remount'); await s.page.waitForSelector('.pl-game'); await s.dismiss(); assert((await s.state()).flags.sawBoarders, 'remount restores saved progress');
    entry.notes.push('verb clicks, item-on-hotspot clicks, unmount/remount');
  }); await s.close();
});

await browser.close();
const pass = results.filter(r => r.status === 'pass').length;
fs.writeFileSync(path.join(EVIDENCE, 'results.json'), JSON.stringify(results, null, 2));
const md = ['# Mop & Galaxy test results', '', `Run: ${new Date().toISOString()} · ${pass}/${results.length} scenarios passed · actual LOCAL portal/adapter/workerd/D1; synthetic accounts, no live providers`, '', '| Scenario | Status | Time | Notes |', '| --- | --- | --- | --- |', ...results.map(r => `| ${r.name} | ${r.status} | ${(r.ms / 1000).toFixed(0)}s | ${r.notes.join('; ')}${r.errors.length ? ' **' + r.errors[0].split('\n')[0] + '**' : ''} |`)].join('\n');
fs.writeFileSync(path.join(EVIDENCE, 'results.md'), md);
console.log(`\n${pass}/${results.length} passed`); process.exit(pass === results.length ? 0 : 1);
