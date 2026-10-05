// Mop & Galaxy — the canonical maximum-score route, chapter by chapter, as parser commands. Used by mg-run.js.
import { assert } from './harness.js';

const score = async (s, n, label, opts = {}) => { if (opts.strict === false) return; const st = await s.state(); assert(st.score === n, `${label}: expected score ${n}, got ${st.score} (room ${st.room})`); };

export async function chapter1(s, opts = {}) {
  await s.cmd('look at me'); await s.cmd('take coverall'); await s.cmd('look at vent'); await s.cmd('look at shelves'); await s.cmd('take mop handle');
  await s.cmd('use door'); await s.waitRoom('deck9'); await s.cmd('use coin on vending machine'); await s.shot('ch1-deck9');
  await s.cmd('use closet door'); await s.waitRoom('closet'); await s.cmd('use snakpak on shelves'); await s.cmd('take wrench'); await s.cmd('use mop on chute'); await s.shot('ch1-closet');
  await s.cmd('use door'); await s.waitRoom('deck9'); await s.cmd('use wrench on bolts');
  await score(s, 18, 'ch1 before the climb', opts);
  await s.cmd('climb ladder');
}
export async function chapter2(s, opts = {}) {
  await s.waitRoom('cryo'); await s.shot('ch2-cryo');
  await s.cmd('take notice'); await s.cmd('look at nameplate'); await s.cmd('take hose'); await s.cmd('use hose on drain'); await s.cmd('take drawing'); await s.cmd('hide in pod');
  await s.cmd('use stairs'); await s.waitRoom('gallery'); await s.shot('ch2-gallery');
  await s.cmd('take roster'); await s.cmd('look at captain'); await s.cmd('take blanket'); await s.cmd('use blanket on duct');
  await score(s, 41, 'ch2 before the duct', opts);
  await s.cmd('climb duct');
}
export async function chapter3(s, opts = {}) {
  await s.waitRoom('galley'); await s.shot('ch3-galley');
  await s.cmd('look at compost'); await s.cmd('take tray'); await s.cmd('use tray on compost'); await s.dismiss();
  assert((await s.state()).inv.includes('gumbo1'), 'Gumbo joins the inventory');
  await s.cmd('use hatch'); await s.waitRoom('hydro'); await s.shot('ch3-hydro');
  await s.cmd('look at board'); await s.cmd('talk to thistle'); await s.cmd('give roster to thistle'); await s.cmd('take tomato'); await s.cmd('take ties'); await s.cmd('give ties to gumbo');
  await s.cmd('use galley hatch'); await s.waitRoom('galley'); await s.cmd('use crew card on locker'); await s.cmd('use gumbo on wheel'); await s.cmd('use dishwasher');
  await s.cmd('use hatch'); await s.waitRoom('hydro'); await s.cmd('look at vault');
  await score(s, 80, 'ch3 before the service duct', opts);
  await s.cmd('use service duct');
}
export async function chapter4(s, opts = {}) {
  await s.waitRoom('drive'); await s.shot('ch4-drive');
  await s.cmd('look at ilse'); await s.cmd('talk to mop'); assert((await s.state()).inv.includes('polish'), 'Mop hands over the polish');
  await s.cmd('press test button'); await s.cmd('use toolkit on intake'); await s.cmd('use polish on intake'); await s.cmd('use oven cleaner on intake'); await s.cmd('use filter on intake'); await s.cmd('look at gauge');
  await s.cmd('use red door'); await s.waitRoom('reactor'); await s.shot('ch4-reactor');
  await s.cmd('take dosimeter'); await s.cmd('take suit'); await s.cmd('take helmet'); await s.cmd('use toolkit on helmet'); await s.cmd('take oxygen'); await s.cmd('take tether'); await s.cmd('use suit check');
  await s.cmd('use door'); await s.waitRoom('drive');
  await score(s, 110, 'ch4 before the airlock', opts);
  await s.cmd('use mop handle on airlock');
}
export async function chapter5(s, opts = {}) {
  await s.waitRoom('hull1'); await s.shot('ch5-hull1');
  await s.cmd('use tether on cleats'); await s.cmd('take plate'); await s.cmd('use plate on gap'); await s.cmd('use aft'); await s.waitRoom('hull2'); await s.shot('ch5-hull2');
  await s.cmd('take pin'); await s.cmd('use toolkit on padlock'); await s.cmd('use canister on crank'); await s.cmd('use crank'); await s.cmd('look at panel');
  await s.cmd('use junction box'); await s.choose(/Luminous Hyacinth, colony transport/);
  await score(s, 145, 'ch5 after the broadcast', opts);
  await s.cmd('use airlock c');
}
export async function chapter6(s, opts = {}) {
  await s.waitRoom('ready'); await s.shot('ch6-ready');
  await s.cmd('use coffee machine'); await s.cmd('give coffee to brack'); await s.cmd('take contract');
  await s.cmd('use bridge door'); await s.waitRoom('bridge'); await s.shot('ch6-bridge');
  await s.cmd('talk to vane'); await s.cmd('give notice to vane'); await s.cmd('give roster to vane'); await s.cmd('give contract to vane');
  await s.cmd('use crew card on log console'); await s.cmd('give log printout to vane'); await s.dismiss();
  assert((await s.state()).inv.includes('mop'), 'Mop arrives on the bridge');
  await s.cmd('talk to dorrit'); await s.cmd('use mop on filing'); await s.shot('ch6-filing-void');
  await score(s, 175, 'ch6 before the escort', opts);
  await s.cmd('talk to vane');
}
export async function chapter7(s, opts = {}) {
  await s.waitRoom('collar'); await s.shot('ch7-collar');
  await s.cmd('look at crate'); await s.cmd('search crate'); await s.cmd('take sandwich'); await s.cmd('use keypad'); await s.choose(/^4471$/); await s.waitRoom('hold'); await s.shot('ch7-hold');
  await s.cmd('use light switch'); await s.cmd('use corridor to crew quarters'); await s.waitRoom('quarters'); await s.shot('ch7-quarters');
  await s.cmd('give sandwich to cat'); await s.cmd('search breast pocket'); await s.cmd('use toolkit on lockbox'); await s.cmd('use gumbo on vent');
  await s.cmd('use cabin door'); await s.waitRoom('hold'); await s.cmd('use clamp room'); await s.waitRoom('clamps'); await s.shot('ch7-clamps');
  await s.cmd('use mop on corridor'); await s.cmd('use loudspeaker'); await s.dismiss(); assert((await s.state()).inv.includes('keyA'), 'Dorrit loses key A');
  await s.cmd('give key b to gumbo'); await s.cmd('use key a on left keyhole'); await s.cmd('use gumbo on right keyhole'); await s.cmd('use panel'); await s.dismiss(); await s.cmd('pull lever');
  await score(s, 215, 'ch7 after the lever', opts);
  await s.cmd('use corridor'); await s.waitRoom('hold'); await s.cmd('use collar'); await s.waitRoom('collar'); await s.cmd('use hyacinth');
}
export async function chapter8(s, answer = 'officer', opts = {}) {
  await s.waitRoom('lift'); await s.shot('ch8-lift');
  await s.cmd('use hatch'); await s.cmd('use buttons'); await s.waitRoom('gallery2'); await s.shot('ch8-gallery');
  await s.cmd('use code card on thaw console'); await s.cmd('give rations to brack'); await s.cmd('use captain'); await s.dismiss();
  await s.choose(answer === 'officer' ? /Deck Officer/ : answer === 'wim' ? /^"Wim/ : /contractor/);
  await s.waitRoom('bridge2'); await s.shot('ch8-bridge');
  await s.cmd('talk to okonjo');
  await s.dismiss(); await s.page.waitForSelector('.pl-game .modal.final', { timeout: 10000 });
}
