import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
import worker from '../../src/index.js';
import {fixture} from './helpers.js';

test('real browser consent, CSP, rejection/reload, sensitive URLs and responsive controls (Meta transport stubbed)',async()=>{
  const browser=await chromium.launch({headless:true});
  const results=[];
  try {
    for(const viewport of [{width:390,height:844},{width:1200,height:800}]) {
      const context=await browser.newContext({viewport});
      const page=await context.newPage(); const env=fixture(); const meta=[]; const errors=[];
      env.ASSETS.fetch=async req=>{
        let pathname=new URL(req.url).pathname; if(pathname==='/')pathname='/index.html';
        const file=resolve('public','.'+pathname); const root=resolve('public');
        if(!file.startsWith(root+'/')||!existsSync(file))return new Response('Not found',{status:404});
        const type=file.endsWith('.html')?'text/html':file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.woff2')?'font/woff2':'application/octet-stream';
        return new Response(readFileSync(file),{headers:{'content-type':type}});
      };
      page.on('pageerror',e=>errors.push(e.message));
      await page.route('**/*',async route=>{
        const req=route.request(), url=new URL(req.url());
        if(url.hostname==='connect.facebook.net') {
          meta.push({type:'sdk',url:url.href});
          // Deliberately synthetic SDK: proves consent and CSP browser plumbing,
          // not acceptance by Meta. Actual production transport checked separately.
          return route.fulfill({contentType:'application/javascript',body:`(() => { const q=window.fbq.queue.slice(); window.fbq.callMethod=function(...a){if(a[0]==='track')fetch('https://www.facebook.com/tr?id='+${JSON.stringify('2275341449930487')}+'&ev='+a[1],{mode:'no-cors'});}; q.forEach(a=>window.fbq.callMethod(...a)); })();`});
        }
        if(url.hostname==='www.facebook.com'){meta.push({type:'event',url:url.href});return route.fulfill({status:200,body:''});}
        if(url.hostname!=='retroquests.test') return route.abort();
        const res=await worker.fetch(new Request(req.url(),{method:req.method(),headers:req.headers(),body:req.method()==='GET'?undefined:req.postData()}),env,{waitUntil(){}});
        await route.fulfill({status:res.status,headers:Object.fromEntries(res.headers),body:Buffer.from(await res.arrayBuffer())});
      });
      await page.goto('https://retroquests.test/');
      await page.locator('#rqMetaConsent').waitFor({state:'visible'});
      assert.equal(meta.length,0);
      const geometry=await page.locator('#rqMetaConsent').evaluate(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,viewport:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth};});
      assert(geometry.left>=0&&geometry.right<=geometry.viewport&&!geometry.overflow);
      await page.click('#rqMetaReject');await page.reload();assert.equal(meta.length,0);
      assert.equal(await page.locator('#rqMetaConsent').isVisible(),false);
      await page.click('#rqMetaSettings');await page.click('#rqMetaAllow');
      await page.waitForFunction(()=>typeof window.fbq?.callMethod==='function');
      await page.waitForTimeout(100);
      assert.equal(meta.filter(x=>x.type==='sdk').length,1);assert.equal(meta.filter(x=>x.type==='event').length,1);
      assert.match(meta.find(x=>x.type==='event').url,/id=2275341449930487&ev=PageView/);
      await page.reload();await page.waitForFunction(()=>typeof window.fbq?.callMethod==='function');await page.waitForTimeout(100);
      assert.equal(meta.filter(x=>x.type==='event').length,2);
      await page.click('#rqMetaSettings');await page.click('#rqMetaReject');
      await page.reload();const before=meta.length;assert.equal(await page.evaluate(()=>window.fbq===undefined),true);
      await page.evaluate(()=>localStorage.setItem('rq_meta_consent_v1','granted'));
      await page.goto('https://retroquests.test/?token=synthetic-private-token');
      assert.equal(meta.length,before);assert.equal(await page.evaluate(()=>window.fbq===undefined),true);
      assert.deepEqual(errors,[]);
      results.push({viewport,consentBeforeNetwork:true,onePageViewPerLoad:true,rejectionPersists:true,sensitiveQueryNotTracked:true,noPageErrors:true,geometry});
      await context.close();
    }
    console.log('META_BROWSER_RESULTS '+JSON.stringify(results));
  }finally{await browser.close();}
});
