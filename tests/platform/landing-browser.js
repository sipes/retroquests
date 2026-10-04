// Landing-only isolated HTTP fixture. Config is from the real worker; identity responses are synthetic.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { fixture, call } from './helpers.js';
const root = resolve('public'), output = resolve('evidence/landing');
await mkdir(output, { recursive: true });
// Actual worker config endpoint, isolated in-memory SQLite; identity fixtures below remain synthetic.
const config = await (await call(fixture(), '/api/config')).json();
const catalog = config.catalog;
const server = createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://localhost').pathname;
    if (path.startsWith('/api/')) {
      res.setHeader('Content-Type', 'application/json');
      if (path === '/api/config') return res.end(JSON.stringify({catalog,devMode:false}));
      if (path === '/api/me') return res.end(JSON.stringify({user:null,entitlements:[],save_envelopes:{}}));
      res.statusCode=503; return res.end(JSON.stringify({error:'Synthetic landing fixture: unavailable'}));
    }
    const file = resolve(root, '.'+(path==='/'?'/index.html':path));
    if (!file.startsWith(root+'/')) {res.statusCode=403;return res.end();}
    const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.ttf':'font/ttf','.png':'image/png','.webmanifest':'application/manifest+json'};
    res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(await readFile(file));
  } catch {res.statusCode=404;res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.RETRO_CHROMIUM||'/home/openclaw/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',args:['--no-sandbox']});
const results=[],errors=[],external=[];
try {
  for (const width of [320,390,768,1440]) {
    const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
    await context.route('**/*',route=>{if(new URL(route.request().url()).origin!==base){external.push(route.request().url());return route.abort();}return route.continue();});
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base);await page.locator('#buyHero').filter({hasText:'$7.99'}).waitFor();await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.locator('h1').count(),1);
    assert.match(await page.locator('h1').innerText(),/Small pixels\.[\s\S]*Big adventures\./);
    assert.equal(await page.locator('#buyHero').isDisabled(),true);
    assert.equal(await page.locator('[data-wish]:disabled').count(),2);
    assert.equal(await page.locator('[data-price="port-lucky"]').innerText(),'$7.99');
    assert.equal(await page.locator('[data-price="port-lucky-walkthrough"]').innerText(),'$1.99');
    const measurements=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,fonts:['500 16px "Pixelify Sans"','700 16px "Pixelify Sans"','400 16px "Atkinson Hyperlegible"','700 16px "Atkinson Hyperlegible"','400 16px VT323'].map(f=>document.fonts.check(f)),targets:[...document.querySelectorAll('#home button,#home a,.top button')].filter(e=>!e.disabled).map(e=>({id:e.id||e.textContent,height:e.getBoundingClientRect().height})),canvases:[...document.querySelectorAll('#home canvas')].map(c=>({id:c.id,painted:c.getContext('2d').getImageData(0,0,c.width,c.height).data.some(x=>x!==0)})),transition:getComputedStyle(document.querySelector('#playHero')).transitionDuration}));
    assert.ok(measurements.scrollWidth<=width,JSON.stringify(measurements));assert.ok(measurements.fonts.every(Boolean));assert.ok(measurements.targets.every(t=>t.height>=44));assert.ok(measurements.canvases.every(c=>c.painted));assert.equal(measurements.transition,'0s');
    await page.screenshot({path:output+'/landing-'+width+'.png',fullPage:true});
    // Keyboard primary action uses the original signup handler, not a substitute landing flow.
    await page.locator('#playHero').focus();assert.equal(await page.locator('#playHero').evaluate(e=>e.matches(':focus-visible')),true);await page.keyboard.press('Enter');await page.locator('#suName').waitFor();await page.keyboard.press('Escape');
    await page.locator('a[href="#catalogue"]').focus();await page.keyboard.press('Enter');assert.equal(new URL(page.url()).hash,'#catalogue');
    await page.locator('#playCard').click();await page.locator('#suName').waitFor();await page.keyboard.press('Escape');
    results.push({width,status:'PASS',...measurements});await context.close();
  }
  // Verify existing Play handler enters actual suite for a synthetic signed-in identity.
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/me',r=>r.fulfill({json:{user:{id:'synthetic-landing-player',name:'Synthetic player',email:'landing@example.test'},entitlements:[],save_envelopes:{}}}));
  await page.goto(base);await page.locator('#buyHero').filter({hasText:'$7.99'}).waitFor();await page.locator('#nav').getByRole('button',{name:'Synthetic player',exact:true}).waitFor();await page.locator('#playHero').click();await page.locator('#gameView:not([hidden])').waitFor();assert.match(await page.locator('#roomTxt').innerText(),/Honeymoon Suite/);await page.locator('#backBtn').click();await page.locator('#home:not([hidden])').waitFor();
  results.push({name:'Original Play handler enters suite and returns home (synthetic identity)',status:'PASS'});
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  const report={scope:'Isolated static landing; config from actual worker using in-memory SQLite; identity/save API fixtures explicitly synthetic. No UAT DB or provider access.',results,pageErrors:errors,externalRequests:external};
  await writeFile(output+'/browser-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
} finally {await browser.close();await new Promise(r=>server.close(r));}
