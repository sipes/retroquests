// Bridge supplier UI driver to the actual portal, Worker and isolated local D1.
import {Session as SupplierSession,assert} from '../../evidence/mop-galaxy-v1/inputs/dev/test/harness.js';
import {chromium} from 'playwright';
import {BASE,api,ids,token,reset,sql,q} from './local-control.js';
import fs from 'node:fs';
import path from 'node:path';
export {assert};
export const EVIDENCE=path.resolve(process.env.PL_EVIDENCE || 'evidence/mop-galaxy-v1/integrated');fs.mkdirSync(EVIDENCE,{recursive:true});
export async function launch(){return chromium.launch({executablePath:process.env.PL_CHROME || chromium.executablePath()});}
export class Session extends SupplierSession{
 static async open(browser,{player='owner',viewport={width:1100,height:820},name='session'}={}){
  const ctx=await browser.newContext({viewport,serviceWorkers:'block'});let current=player;
  if(player!=='anon')await ctx.addCookies([{name:'rq_session',value:token(player),url:BASE,httpOnly:true,sameSite:'Lax'}]);
  const page=await ctx.newPage(),s=new Session(page,name);s.player=()=>current;
  page.on('pageerror',e=>s.errors.push(e.message));
  page.on('request',r=>{if(r.url().includes('/api/') || r.url().includes('/games/'))s.log.push('HTTP '+r.method()+' '+new URL(r.url()).pathname);});
  await page.exposeFunction('__localReset',async p=>reset(p || current));
  await page.exposeFunction('__localSwitch',async p=>{current=p;await ctx.clearCookies();if(p!=='anon')await ctx.addCookies([{name:'rq_session',value:token(p),url:BASE,httpOnly:true,sameSite:'Lax'}]);});
  const install=async()=>{
   await page.evaluate(async()=>{
    const portal=await import('/portal.js');
    Object.defineProperty(window,'__plGame',{configurable:true,get:()=>portal.host.handle});
    const a=new Proxy({}, {get:(_,key)=>{
     if(key==='__reset')return p=>window.__localReset(p);
     if(key==='__readSave')return async()=>{const me=await (await fetch('/api/me')).json();return me.save_envelopes?.['mop-galaxy']?.data || null;};
     if(key==='__seedSave')return async data=>{const me=await (await fetch('/api/me')).json(),en=me.save_envelopes?.['mop-galaxy'];data.ownerId=me.user.id;const r=await fetch('/api/save',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({game_id:'mop-galaxy',version:1,revision:en?.revision || 0,ownerId:me.user.id,data})});if(!r.ok)throw new Error('Local seed API '+r.status);};
     return portal.host.adapter?.[key];
    }});window.__plAdapter=a;
    const tools=document.createElement('div');tools.id='local-test-controls';tools.style='position:fixed;bottom:0;right:0;z-index:9999;background:#222;color:white;font:12px sans-serif';
    tools.innerHTML='<select id="player"><option>owner</option><option>walkthrough</option><option>free</option><option>anon</option><option>port</option><option>both</option></select><label><input type="checkbox" id="failSaves">Fault save</label><button id="remount">Remount</button>';
    tools.querySelector('#player').onchange=async e=>{await window.__localSwitch(e.target.value);try{await portal.host.refresh();}catch{};};
    tools.querySelector('#remount').onclick=()=>portal.host.start();document.body.append(tools);
   });
   await page.evaluate(p=>document.getElementById('player').value=p,current);
  };
  const goto=async()=>{await page.goto(BASE);await page.click('#playMopCard');await page.waitForSelector('.pl-game');await install();};
  const reload=page.reload.bind(page);
  page.reload=async(...a)=>{const response=await reload(...a);await page.click('#playMopCard');await page.waitForSelector('.pl-game');await install();return response;};
  await page.route('**/api/save',async route=>{const fail=await page.locator('#failSaves').isChecked().catch(()=>false);if(fail)return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Injected local network/save fault'})});return route.continue();});
  await goto();await page.waitForTimeout(300);return s;
 }
 async setPlayer(p){await this.page.evaluate(async p=>{await window.__localSwitch(p);const m=await import('/portal.js');try{await m.host.refresh();}catch{};},p);await this.page.waitForTimeout(600);}
 async close(){await this.page.evaluate(async()=>{const m=await import('/portal.js');await m.host.stop();}).catch(()=>{});await super.close();}
}
