// Unit coverage only. Native headed visibility evidence is separately reported.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createCarousel} from '../../public/catalogue-carousel.js';
test('carousel hidden-state branch stops and resumes timer without focus changes (unit)',()=>{
 const original=Object.fromEntries(['document','matchMedia','setTimeout','clearTimeout'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 const timers=new Map(),events={},focus={id:'untouched-focus'};let serial=0;
 const document={hidden:true,activeElement:focus,addEventListener:(type,fn)=>events[type]=fn};
 const element=()=>({dataset:{},setAttribute(k,v){this[k]=v;}});
 const slides=['port-lucky','mop-galaxy','crown'].map(id=>Object.assign(element(),{dataset:{slide:id}})),dots=slides.map(element),position=element(),toggle=element();
 const buttons={'[data-position]':position,'[data-cycle]':toggle,'[data-prev]':element(),'[data-next]':element()};
 const root={querySelectorAll:s=>s==='[data-slide]'?slides:dots,querySelector:s=>buttons[s],addEventListener(){},contains:()=>false};
 try{
  Object.defineProperty(globalThis,'document',{configurable:true,value:document});Object.defineProperty(globalThis,'matchMedia',{configurable:true,value:()=>({matches:false,addEventListener(){}})});
  globalThis.setTimeout=(fn,ms)=>{assert.equal(ms,8000);timers.set(++serial,fn);return serial;};globalThis.clearTimeout=id=>timers.delete(id);
  const carousel=createCarousel(root);assert.equal(timers.size,0);assert.equal(carousel.selected,'port-lucky');
  document.hidden=false;events.visibilitychange();assert.equal(timers.size,1);
  const queued=[...timers.values()][0];timers.clear();document.hidden=true;queued();assert.equal(timers.size,0);assert.equal(carousel.selected,'port-lucky');
  document.hidden=false;events.visibilitychange();assert.equal(timers.size,1);const advance=[...timers.values()][0];timers.clear();advance();assert.equal(carousel.selected,'mop-galaxy');assert.equal(document.activeElement,focus);
  buttons['[data-next]'].onclick();assert.equal(carousel.selected,'crown');assert.equal(timers.size,0);
  document.hidden=true;events.visibilitychange();document.hidden=false;events.visibilitychange();assert.equal(timers.size,0,'manual navigation remains paused across visibility changes');
  toggle.onclick();assert.equal(timers.size,1,'explicit Play resumes');carousel.pause();assert.equal(timers.size,0);
 }finally{for(const [key,descriptor] of Object.entries(original)){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}
});
