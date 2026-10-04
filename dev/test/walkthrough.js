// The canonical maximum-score route, chapter by chapter, as parser commands. Used by run.js for both routes.
import { assert } from './harness.js';

export async function chapter1(s) {
  await s.cmd('look at me'); await s.cmd('open minibar'); await s.cmd('take crackers'); await s.cmd('give crackers to goat');
  await s.cmd('take tuba'); await s.cmd('play tuba'); await s.cmd('use phone'); await s.shot('ch1-suite');
  const st = await s.state(); assert(st.score === 20, 'ch1 score 20 before the door, got ' + st.score);
  await s.cmd('use keycard on door');
}
export async function chapter2(s) {
  await s.waitRoom('garage'); await s.cmd('give ticket to valet'); await s.cmd('use keys on truck'); await s.cmd('take shoe'); await s.cmd('take receipt');
  await s.shot('ch2-garage'); assert((await s.state()).score === 50, 'ch2 score 50');
  await s.cmd('use ramp');
}
export async function chapter3(s) {
  await s.waitRoom('bar'); await s.shot('ch3-bar');
  await s.cmd('search jukebox'); await s.cmd('use token on karaoke machine'); await s.cmd('use microphone');
  await s.cmd('give receipt to earl'); await s.cmd('take polaroid'); await s.cmd('talk to duane'); await s.cmd('give polaroid to duane');
  await s.cmd('talk to earl'); // jump leads
  await s.cmd('use cage'); await s.waitRoom('cage'); await s.shot('ch3-cage');
  await s.cmd('look at shelf'); await s.cmd('take feather'); await s.cmd('look at ledger'); await s.cmd('use polaroid on earl'); await s.cmd('take ledger');
  await s.cmd('use door'); await s.waitRoom('bar'); await s.cmd('use alley door'); await s.waitRoom('alley'); await s.shot('ch3-alley');
  await s.cmd('use leads on hood'); assert((await s.state()).score === 85, 'ch3 score 85, got ' + (await s.state()).score);
  await s.cmd('use street');
}
export async function chapter4(s, route = 'dolphin') {
  await s.waitRoom('pier'); await s.shot('ch4-pier');
  await s.cmd('talk to sal'); await s.cmd('give keys to sal'); await s.cmd('talk to nadia'); await s.cmd('take churro');
  await s.cmd('use arcade'); await s.waitRoom('arcade'); await s.shot('ch4-arcade');
  await s.cmd('use change machine'); await s.cmd('use quarters on claw'); await s.cmd('look at hammer'); await s.cmd('use hammer'); await s.cmd('use hammer'); await s.cmd('use hammer'); await s.cmd('take wallet');
  await s.cmd('use door'); await s.waitRoom('pier');
  if (route === 'dolphin') await s.cmd('give dolphin to nadia'); else await s.cmd('give wallet to nadia');
  await s.cmd('use quarters on zora'); await s.cmd('use phone'); await s.choose(/Kevin/);
  const st = await s.state(); assert(st.score === 120, 'ch4 score 120, got ' + st.score);
  if (route === 'dolphin') assert(st.money === 2100, 'dolphin route keeps $21'); else assert(st.money === 1000, 'cash route leaves $10');
  await s.cmd('use marina');
}
export async function chapter5(s) {
  await s.waitRoom('dock'); await s.shot('ch5-dock');
  await s.cmd('use quarters on telescope'); await s.cmd('talk to marguerite'); await s.cmd('talk to oscar'); await s.cmd('give churro to oscar');
  await s.cmd('take rope'); await s.cmd('use rope on dinghy'); await s.cmd('use rope on cleat'); await s.cmd('use oars on dinghy'); await s.cmd('use dinghy');
  await s.waitRoom('pontoon'); await s.shot('ch5-pontoon');
  await s.cmd('take shoe'); await s.cmd('take cooler'); await s.cmd('use cooler on benny'); await s.cmd('give right shoe to benny'); await s.cmd('take logbook'); await s.cmd('use phone');
  await s.waitRoom('corridor'); await s.dismiss();
  const st = await s.state(); assert(st.score === 155, 'ch5 score 155, got ' + st.score); assert(st.inv.includes('logpage') && st.inv.includes('phone'), 'has log page and phone');
}
export async function chapter6(s) {
  await s.waitRoom('corridor'); await s.shot('ch6-corridor');
  await s.cmd('take cloche'); await s.cmd('use cloche on door 701'); await s.waitRoom('hartwell'); await s.shot('ch6-hartwell');
  await s.cmd('give feather to dolores'); await s.cmd('look at photo'); await s.cmd('talk to dolores'); await s.choose(/Gus in the photo/);
  await s.cmd('talk to dolores'); await s.choose(/Tell her everything/);
  await s.cmd('take tea'); await s.cmd('give tea to bathroom');
  const st = await s.state(); assert(st.score === 185, 'ch6 score 185, got ' + st.score); assert(st.inv.includes('ring'), 'has ring');
  await s.cmd('use exit');
}
export async function chapter7(s) {
  await s.waitRoom('lawn'); await s.shot('ch7-lawn');
  await s.cmd('use grooms tent'); await s.waitRoom('groomtent'); await s.shot('ch7-groomtent');
  await s.cmd('take bag'); await s.cmd('take water'); await s.cmd('take polish'); await s.cmd('take bow tie');
  await s.cmd('give water to benny'); await s.cmd('use tuxedo on benny'); await s.cmd('use polish on shoe'); await s.cmd('give shoe to benny');
  await s.cmd('use flap'); await s.waitRoom('lawn'); await s.cmd('use bow tie on gus');
  await s.cmd('use arch'); await s.waitRoom('altar'); await s.shot('ch7-altar');
  await s.cmd('take program'); await s.cmd('use page on lectern'); await s.cmd('use fortune on lectern'); await s.cmd('use log on lectern'); await s.cmd('use ring on cushion');
  await s.cmd('use lawn'); await s.waitRoom('lawn');
  // Earl arrives at 4 minutes elapsed on the game clock, Sal at 7. The clock only runs while no box is open.
  await s.dismiss(); await s.page.waitForFunction(() => window.__plGame.state.flags.earlArrived, null, { timeout: 200000 });
  await s.cmd('talk to earl'); await s.cmd('give polaroid to earl');
  await s.dismiss(); await s.page.waitForFunction(() => window.__plGame.state.flags.salArrived, null, { timeout: 200000 });
  await s.cmd('talk to sal'); await s.cmd('talk to dolores'); await s.shot('ch7-ready');
  const st = await s.state(); assert(st.score === 230, 'ch7 score 230, got ' + st.score); assert(st.flags.ceremonyReady, 'ceremony ready');
  await s.dismiss();
}
export async function chapter8(s, route = 'dolphin') {
  await s.waitRoom('reception'); await s.shot('ch8-reception');
  await s.cmd('use gus'); await s.cmd('use napkin on mic'); await s.choose(/truth/);
  await s.cmd(route === 'dolphin' ? 'give wallet to kevin' : 'give quarters to kevin'); await s.cmd('give log to marguerite'); await s.cmd('give token to earl'); await s.cmd('use watch on benny');
  await s.dismiss();
  await s.page.waitForSelector('.pl-game .modal.final', { timeout: 10000 }); await s.shot('final');
  const st = await s.state(); assert(st.score === 250, 'final score 250, got ' + st.score); assert(st.done, 'done flag');
  return st;
}
