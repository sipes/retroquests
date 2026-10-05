// Isolated browser proof of the generated free-demo CTA; no server or provider access.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const source=readFileSync('public/demos/port-lucky/game.js','utf8');
const css=JSON.parse(source.split('\n')[0].slice('const CSS='.length,-1));
const paywall=source.slice(source.indexOf('function showPaywall()'),source.indexOf('function modal('));
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage();
 await page.route('**/*',route=>route.abort());
 for(const width of [1280,390])for(const enabled of [false,true]) {
  await page.setViewportSize({width,height:844});
  await page.setContent('<style>'+css+'</style><div class="demo-shell"><div id="view"></div></div>');
  const result=await page.evaluate(({paywall,enabled})=>{
   const catalog={'port-lucky':{sale_enabled:enabled}},SKU_GAME='port-lucky';
   const price=()=>'$7.99';let checkouts=0;
   const adapter={checkout:async sku=>{if(sku!==SKU_GAME)throw Error('Wrong SKU');checkouts++;}},toast=()=>{};
   const overlay=html=>{const o=document.createElement('div');o.className='overlay-card';o.innerHTML=html;document.getElementById('view').append(o);return o;};
   eval(paywall+'showPaywall();');
   const buy=document.querySelector('[data-a=buy]'),back=document.querySelector('[data-a=back]');
   buy.click();
   const style=getComputedStyle(buy);
   return {disabled:buy.disabled,label:buy.textContent,note:document.querySelector('.note').textContent,focused:document.activeElement===back,checkouts,cursor:style.cursor,background:style.backgroundColor,shadow:style.boxShadow};
  },{paywall,enabled});
  assert.equal(result.disabled,!enabled);assert.equal(result.checkouts,enabled?1:0);
  assert.equal(result.label,enabled?'Unlock full game':'Purchase unavailable');
  assert.equal(result.focused,true);
  if(!enabled){assert.equal(result.cursor,'not-allowed');assert.equal(result.shadow,'none');assert.match(result.note,/currently unavailable/);assert.doesNotMatch(result.note,/Secure card payment/);}
  else assert.match(result.note,/Secure card payment by Stripe/);
  console.log(JSON.stringify({width,enabled,...result}));
 }
 console.log('PASS: generated CTA browser states at desktop and mobile widths; disabled native clicks never checkout.');
} finally {await browser.close();}
