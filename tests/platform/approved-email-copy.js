import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
// Only the B purchase presentation surfaces may differ from accepted f99c630.
// All other engine bytes still pass the older supplier/gameplay provenance pin.
export function priorPurchasePresentation(actual,path){
 const prior=execFileSync('git',['show','f99c630:'+path],{encoding:'utf8'});
 for(const [start,end] of [['  price(sku) {','\n\n  // ---------- Game start'],['  showPaywall() {','\n  showFinal() {'],["      l.innerHTML = this.ent.game ?",'\n      l.appendChild(b);']]){
  const a=actual.indexOf(start),b=actual.indexOf(end,a),p=prior.indexOf(start),q=prior.indexOf(end,p);
  assert.ok(a>=0 && b>a && p>=0 && q>p,'purchase presentation boundary '+start);
  actual=actual.slice(0,a)+prior.slice(p,q)+actual.slice(b);
 }
 return actual;
}
