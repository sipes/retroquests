// Real browser inventory regression; synthetic identity/save fixtures, no provider or UAT DB writes.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.RETRO_PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const html = await readFile('public/index.html', 'utf8');
const browser = await chromium.launch({headless:true, executablePath:process.env.RETRO_CHROMIUM || '/home/openclaw/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',args:['--no-sandbox']});
const results=[];
try {
 for (const viewport of [{width:844,height:390},{width:667,height:375},{width:932,height:430}]) {
  const context=await browser.newContext({viewport,hasTouch:true,isMobile:viewport.width<1000});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',async r=>{
   const path=new URL(r.request().url()).pathname;
   if(path==='/')return r.fulfill({contentType:'text/html',body:html});
   if(path==='/api/config')return r.fulfill({json:{catalog:[],devMode:false}});
   if(path==='/api/me')return r.fulfill({json:{user:{id:'inventory-test',name:'Inventory test',email:'inventory@example.test'},entitlements:[],save_envelopes:{}}});
   if(path==='/api/save')return r.fulfill({json:{revision:1}});
   if(path==='/platform.js'||path==='/legacy-save.js')return r.fulfill({contentType:'text/javascript',body:await readFile('public'+path,'utf8')});
   return r.abort();
  });
  await page.goto('http://inventory.test/');
  await page.getByRole('button',{name:'Inventory test',exact:true}).waitFor();
  await page.locator('#playHero').click();
  if(viewport.width<viewport.height)await page.locator('#rotAnyway').click();
  await page.locator('#view .sierra').first().waitFor();
  const dialogue=await page.locator('#view .sierra').first().innerText();
  await page.locator('#sideItems').tap();
  assert.equal(await page.locator('.inv-sheet').count(),1,'Items must open during dialogue');
  assert.equal(await page.locator('#view .sierra').first().innerText(),dialogue,'Inventory must not skip story dialogue');
  await page.locator('.inv-sheet [data-a=close]').tap();
  assert.equal(await page.locator('.inv-sheet').count(),0);
  await page.evaluate(()=>{let i=0;while(document.querySelector('#view .sierra:not(.death)')&&i++<20)document.querySelector('#view .sierra:not(.death)').click();});
  await page.locator('#sideItems').tap();
  assert.equal(await page.locator('.inv-sheet').count(),1,'Empty inventory must open after dialogue');
  assert.match(await page.locator('.inv-sheet').innerText(),/Nothing yet/);
  await page.locator('.inv-sheet [data-a=close]').tap();
  await page.locator('#sideType').tap();
  await page.locator('#cmd').fill('open minibar');
  await page.locator('#parserForm').evaluate(e=>e.requestSubmit());
  await page.locator('#view .sierra').waitFor();
  await page.evaluate(()=>{let i=0;while(document.querySelector('#view .sierra:not(.death)')&&i++<20)document.querySelector('#view .sierra:not(.death)').click();});
  await page.locator('#cmd').evaluate(e=>e.value='take crackers');
  await page.locator('#parserForm').evaluate(e=>e.requestSubmit());
  await page.locator('#view .sierra').waitFor();
  const itemDialogue=await page.locator('#view .sierra').innerText();
  await page.locator('#sideItems').tap();
  assert.match(await page.locator('.inv-sheet').innerText(),/Crackers of Regret/i);
  await page.locator('.inv-sheet .acts button').tap();
  assert.equal(await page.locator('.inv-sheet').count(),0);
  assert.match(await page.locator('#view .using').innerText(),/Crackers of Regret/i);
  assert.equal(await page.locator('#view .sierra').innerText(),itemDialogue);
  assert.deepEqual(errors,[]);
  results.push({viewport,status:'PASS',checks:'Dialogue preserved; empty and populated inventory; close and item selection'});
  await context.close();
 }
 console.log(JSON.stringify({scope:'Real Chromium, synthetic API fixtures; no external requests or DB writes',results},null,2));
} finally {await browser.close();}
