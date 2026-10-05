import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fixture, call } from './helpers.js';
const html=readFileSync(new URL('../../public/index.html',import.meta.url),'utf8');
const home=html.slice(html.indexOf('<main class="wrap" id="home">'),html.indexOf('<main class="wrap" id="gameView"'));
test('landing identifies the arcade before the original featured adventure',()=>{
  assert.match(home,/<h1[^>]*>Small pixels\.<br><span>Big adventures\.<\/span><\/h1>/);
  assert.ok(home.indexOf('arcadeTitle')<home.indexOf('featuredTitle'));
  assert.match(home,/Your best mate is missing\. The wedding is at four\. There is a goat in your hotel suite, and nobody remembers why\./);
  for(const id of ['playHero','playCard','buyHero','heroCanvas','cover1','cover2','cover3'])assert.equal((home.match(new RegExp(`id="${id}"`,'g'))||[]).length,1);
  assert.match(home,/href="#catalogue"/);
});
test('landing has honest demo, development and planned SKU-specific pricing',()=>{
  assert.match(home,/Two-scene demo/);assert.doesNotMatch(home,/Coming 2027|2–3 hours|release gates|processed securely/);
  assert.equal((home.match(/<span class="tag">In development<\/span>/g)||[]).length,2);
  assert.match(home,/<button[^>]*id="buyHero" disabled>Full game · <span data-price="port-lucky">\$7\.99<\/span><\/button>/);
  assert.match(home,/data-price="port-lucky-walkthrough">\$1\.99/);
  assert.equal((home.match(/data-price="port-lucky"/g)||[]).length,1);
  assert.match(home,/Planned pricing · USD/);
});
test('original handlers and hardened inline JS are unchanged except the approved inventory dialogue guard',()=>{
  const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];
  const updated='function openInventory() {\n  // Browsing/selecting items does not advance dialogue; scene actions remain gated.\n  if (blocking || !game || document.querySelector(\'.inv-sheet\')) return;';
  assert.ok(scripts.at(-1)[1].includes(updated));
  const normalized=scripts.at(-1)[1].replace(updated,'function openInventory() {\n  if (msgOpen || blocking || !game) return;');
  assert.equal(createHash('sha256').update(normalized).digest('hex'),'94553e423c3d10a050fd46b51872bffe089fd9b099ff0c608f0fcf274ccdb90f');
  assert.match(html,/document\.querySelectorAll\('\[data-price\]'\)\.forEach\(el => el\.textContent = price\(el\.dataset\.price\)\)/);
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
