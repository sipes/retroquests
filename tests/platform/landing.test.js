import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fixture, call } from './helpers.js';
const html=readFileSync(new URL('../../public/index.html',import.meta.url),'utf8');
const home=html.slice(html.indexOf('<main class="wrap" id="home">'),html.indexOf('<main id="gameView"'));
test('single accessible catalogue replaces duplicated intro, hero and game grid',()=>{
  assert.match(home,/<h1[^>]*>Choose your next misadventure<\/h1>/);
  assert.ok(home.indexOf('catalogueTitle')<home.indexOf('featuredTitle'));
  assert.equal((home.match(/data-slide=/g)||[]).length,3);
  assert.doesNotMatch(home,/class="intro"|class="hero"|class="games"/);
  assert.match(home,/Your best mate is missing\. The wedding is at four\. There is a goat in your hotel suite, and nobody remembers why\./);
  for(const id of ['playCard','playMopCard','buyHero','heroCanvas','cover2','cover3'])assert.equal((home.match(new RegExp(`id="${id}"`,'g'))||[]).length,1);
  assert.match(home,/aria-roledescription="carousel"/);
  assert.match(home,/data-slide="mop-galaxy"[^>]*hidden inert/);
  assert.match(home,/data-slide="crown"[^>]*hidden inert/);
});
test('landing has honest demo, development and planned SKU-specific pricing',()=>{
  assert.match(home,/Eight-chapter adventure/);assert.match(home,/full-game sales are not available yet/);assert.doesNotMatch(home,/Coming 2027|2–3 hours|release gates|processed securely/);
  assert.equal((home.match(/<span class="tag">In development<\/span>/g)||[]).length,1);
  assert.match(home,/id="playMopCard">Play/);
  assert.match(home,/<button[^>]*id="buyHero" disabled>Full game · <span data-price="port-lucky">\$7\.99<\/span><\/button>/);
  assert.match(home,/data-price="port-lucky-walkthrough">\$1\.99/);
  assert.equal((home.match(/data-price="port-lucky"/g)||[]).length,1);
  assert.match(home,/Planned pricing · USD/);
});
test('supplied game replaces legacy handlers while landing artwork remains exact',()=>{
  assert.match(html,/<script type="module" src="\.\/portal.js"><\/script>/);
  assert.doesNotMatch(html,/suiteAct|garageAct|parserForm|gameCanvas/);
  const art=readFileSync(new URL('../../public/landing-art.js',import.meta.url),'utf8');
  assert.match(art,/function drawSuiteCover/);assert.match(art,/function drawStarCover/);assert.match(art,/function drawCastleCover/);
  const portal=readFileSync(new URL('../../public/portal.js',import.meta.url),'utf8');
  assert.match(portal,/createPortLuckyHost/);assert.match(portal,/data-price/);
});
test('actual worker config keeps full-game and optional-hint prices distinct and sales disabled',async()=>{
  const res=await call(fixture(),'/api/config');assert.equal(res.status,200);
  const {catalog}=await res.json();
  assert.equal(catalog['port-lucky'].display_price,'$7.99');
  assert.equal(catalog['port-lucky-walkthrough'].display_price,'$1.99');
  assert.equal(catalog['port-lucky'].sale_enabled,false);
  assert.equal(catalog['port-lucky-walkthrough'].sale_enabled,false);
});
test('original licensed fonts are local and contain the five required faces',()=>{
  assert.doesNotMatch(html,/fonts\.googleapis\.com|fonts\.gstatic\.com/);
  const css=readFileSync(new URL('../../public/fonts/fonts.css',import.meta.url),'utf8');
  assert.equal((css.match(/@font-face/g)||[]).length,5);
  for(const name of ['atkinson-400.ttf','atkinson-700.ttf','pixelify-500.ttf','pixelify-700.ttf','vt323-400.ttf'])assert.ok(readFileSync(new URL('../../public/fonts/'+name,import.meta.url)).length>1000);
  for(const family of ['atkinsonhyperlegible','pixelifysans','vt323'])assert.match(readFileSync(new URL('../../public/fonts/'+family+'-OFL.txt',import.meta.url),'utf8'),/SIL OPEN FONT LICENSE/);
});
