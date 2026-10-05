// Real portal harness. Test helpers live only in Playwright, never public assets.
import {Session as SuppliedSession,assert} from '../../dev/test/harness.js';
import {chromium} from 'playwright';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
export {assert};
export const EVIDENCE=path.resolve('evidence/port-lucky/browser');fs.mkdirSync(EVIDENCE,{recursive:true});
export const BASE=process.env.PL_BASE;
export const ids={free:'55555555-5555-4555-8555-000000000001',owner:'55555555-5555-4555-8555-000000000002',walkthrough:'55555555-5555-4555-8555-000000000003',other:'55555555-5555-4555-8555-000000000004'};
export function sql(command){assert(process.env.PL_PERSIST?.includes('/retroquests-port-lucky-integration-v1/.wrangler/port-lucky-isolated-'),'must use isolated DB');const r=spawnSync(path.resolve('node_modules/.bin/wrangler'),['d1','execute','retro-quest-db','--local','--config','dev/platform/wrangler.local.jsonc','--persist-to',process.env.PL_PERSIST,'--env-file','dev/platform/empty.vars','--command',command],{encoding:'utf8',env:process.env});if(r.status!==0)throw new Error(r.stdout+r.stderr);return r.stdout;}
export async function api(kind,route,{method='GET',data}={}){const r=await fetch(new URL(route,BASE),{method,headers:{cookie:'rq_session=pl-session-'+kind,...(data?{'content-type':'application/json'}:{})},body:data?JSON.stringify(data):undefined});return {status:r.status,data:await r.json()};}
export async function reset(kind){sql(`DELETE FROM saves WHERE user_id='${ids[kind]}';DELETE FROM hint_reveals WHERE user_id='${ids[kind]}';`);}
export async function seedSave(kind,data){const me=await api(kind,'/api/me');return api(kind,'/api/save',{method:'PUT',data:{game_id:'port-lucky',version:1,revision:me.data.save_envelopes?.['port-lucky']?.revision || 0,data,ownerId:ids[kind]}});}
export class Session extends SuppliedSession {
 static async open(browser,{player='owner',viewport={width:1100,height:820},name='session',touch=false}={}){
  const ctx=await browser.newContext({viewport,hasTouch:touch});const page=await ctx.newPage();const s=new Session(page,name);s.player=player;s.network=[];
  page.on('pageerror',e=>s.errors.push('pageerror: '+e.message));
  page.on('response',async r=>{if(r.url().includes('/api/')){let body;try{body=await r.json();}catch{}s.network.push({method:r.request().method(),url:r.url(),status:r.status(),body});}});
  if(player!=='anon')await ctx.addCookies([{name:'rq_session',value:'pl-session-'+player,url:BASE,httpOnly:true,sameSite:'Lax'}]);
  await page.addInitScript(()=>{window.__listeners={};for(const [name,target] of [['document',document],['window',window]]){const add=target.addEventListener,remove=target.removeEventListener;target.addEventListener=function(type,listener,options){(window.__listeners[name+':'+type] ||= new Set()).add(listener);return add.call(this,type,listener,options);};target.removeEventListener=function(type,listener,options){window.__listeners[name+':'+type]?.delete(listener);return remove.call(this,type,listener,options);};}});
  await page.goto(BASE);await s.play();return s;
 }
 async play(){
  await this.page.evaluate(async()=>{const {host}=await import('/portal.js');Object.defineProperty(window,'__plGame',{configurable:true,get:()=>host.handle});Object.defineProperty(window,'__plAdapter',{configurable:true,get:()=>host.adapter});});
  if(await this.page.locator('#playCard').isVisible())await this.page.click('#playCard');
  else await this.page.evaluate(async()=>{await (await import('/portal.js')).host.start();});
  await this.page.waitForSelector('.pl-game');await this.page.waitForTimeout(300);
 }
 async reload(){await this.page.reload();await this.play();}
 async setPlayer(player){await this.page.context().clearCookies();if(player!=='anon')await this.page.context().addCookies([{name:'rq_session',value:'pl-session-'+player,url:BASE,httpOnly:true,sameSite:'Lax'}]);this.player=player;await this.page.evaluate(async()=>{const {host}=await import('/portal.js');try{await host.refresh();}catch{}});await this.page.waitForTimeout(600);}
 async shot(label){this.shots++;const f=path.join(EVIDENCE,`${this.name}-${String(this.shots).padStart(2,'0')}-${label}.png`);await this.page.screenshot({path:f});return f;}
 async clickCanvas(x,y){if(!this.touch)return super.clickCanvas(x,y);await this.dismiss();const b=await this.page.locator('.pl-game canvas').boundingBox();await this.page.touchscreen.tap(b.x+x/320*b.width,b.y+y/180*b.height);await this.page.waitForTimeout(1200);}
 async close(){fs.writeFileSync(path.join(EVIDENCE,this.name+'.log'),this.log.join('\n'));fs.writeFileSync(path.join(EVIDENCE,this.name+'-network.json'),JSON.stringify(this.network,null,2));await super.close();}
}
export async function launch(){return chromium.launch({executablePath:process.env.PL_CHROME || chromium.executablePath()});}
