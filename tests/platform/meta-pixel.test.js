import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { fixture, call } from './helpers.js';

function run({choice, path='/', search='', hash='', gpc=false, storageFails=false}={}) {
  const nodes = new Map(), scripts = [], store = new Map(choice ? [['rq_meta_consent_v1', choice]] : []);
  function node(tag) { return {tagName:tag,hidden:false,children:[],style:{},listeners:{},setAttribute(k,v){this[k]=v;},appendChild(n){this.children.push(n);if(n.id)nodes.set(n.id,n);if(n.tagName==='script')scripts.push(n);},addEventListener(k,f){this.listeners[k]=f;},querySelector(){return null;},focus(){this.focused=true;}}; }
  const document = {readyState:'complete',head:node('head'),body:node('body'),createElement:node,getElementById:id=>nodes.get(id),addEventListener(){}};
  let reloaded=false;
  const window = {document,navigator:{globalPrivacyControl:gpc},location:{pathname:path,search,hash,reload(){reloaded=true;}},localStorage:{getItem:k=>{if(storageFails)throw Error('blocked');return store.get(k)||null;},setItem:(k,v)=>{if(storageFails)throw Error('blocked');store.set(k,v);}},addEventListener(){}};
  window.window=window;
  vm.runInNewContext(readFileSync('public/meta-pixel.js','utf8'),{window,document,navigator:window.navigator,URLSearchParams});
  return {window,nodes,scripts,store,reloaded:()=>reloaded,click:id=>nodes.get(id).listeners.click()};
}
test('Meta is never contacted until explicit consent, including when storage is unavailable',()=>{
  for(const options of [{},{storageFails:true},{choice:'denied'}]){const r=run(options);assert.equal(r.scripts.length,0);assert.equal(r.window.fbq,undefined);}
});
test('Accept loads exact pixel and one PageView without automatic form/identity collection',()=>{
  const r=run();r.click('rqMetaAllow');assert.equal(r.scripts.length,1);assert.equal(r.scripts[0].src,'https://connect.facebook.net/en_US/fbevents.js');
  const calls=Array.from(r.window.fbq.queue,a=>Array.from(a));
  assert.deepEqual(calls,[['consent','grant'],['set','autoConfig',false,'2275341449930487'],['init','2275341449930487'],['track','PageView']]);
  r.click('rqMetaAllow');assert.equal(r.scripts.length,1);assert.equal(Array.from(r.window.fbq.queue).filter(a=>a[0]==='track'&&a[1]==='PageView').length,1);
});
test('previous consent loads on ordinary and ad-click pages; rejection persists without loading',()=>{
  assert.equal(run({choice:'granted'}).scripts.length,1);
  assert.equal(run({choice:'granted',search:'?utm_source=facebook&fbclid=ad-click'}).scripts.length,1);
  const r=run();r.click('rqMetaReject');assert.equal(r.scripts.length,0);assert.equal(r.store.get('rq_meta_consent_v1'),'denied');
});
test('auth/admin/private and sensitive URLs are not tracked even with stored consent',()=>{
  for(const options of [{path:'/admin.html'},{path:'/auth/link',search:'?token=private'},{path:'/api/me'},{search:'?token=private'},{search:'?email=private'},{search:'?session_id=private'},{hash:'#private'},{gpc:true}]) {
    assert.equal(run({choice:'granted',...options}).scripts.length,0);
  }
});
test('withdrawal revokes consent without reloading or losing game progress',()=>{
  const r=run({choice:'granted'});r.click('rqMetaSettings');r.click('rqMetaReject');assert.equal(r.store.get('rq_meta_consent_v1'),'denied');assert.equal(r.reloaded(),false);
  assert.deepEqual(Array.from(r.window.fbq.queue.at(-1)),['consent','revoke']);
});
test('only public portal CSP allows the exact Meta hosts; no inline noscript tracker',async()=>{
  const env=fixture();const portal=await call(env,'/');
  assert.match(portal.headers.get('content-security-policy'),/script-src[^;]*https:\/\/connect.facebook.net/);
  assert.match(portal.headers.get('content-security-policy'),/img-src[^;]*https:\/\/www.facebook.com/);
  assert.match(portal.headers.get('content-security-policy'),/connect-src[^;]*https:\/\/www.facebook.com/);
  for(const path of ['/admin.html','/api/config','/auth/link'])assert.doesNotMatch((await call(env,path)).headers.get('content-security-policy'),/facebook/);
  const html=readFileSync('public/index.html','utf8');assert.match(html,/<script defer src="\.\/meta-pixel\.js"><\/script>[\s\S]*<\/head>/);assert.doesNotMatch(html,/facebook\.com\/tr\?/);
});
