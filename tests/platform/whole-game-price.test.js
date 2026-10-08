import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine as Port} from '../../public/games/port-lucky/engine.js';
import {Engine as Mop} from '../../public/games/mop-galaxy/engine.js';
import {Engine as MopDemo} from '../../public/demos/mop-galaxy/engine.js';
for(const [id,Engine] of [['port-lucky',Port],['mop-galaxy',Mop],['mop-galaxy-demo',MopDemo]]){
 const sku=id==='port-lucky'?id:'mop-galaxy';
 test(id+': paywall uses changed server price, separates clues, honors sale gate and never republishes owned buy',()=>{
  for(const enabled of [true,false]){
   let html='',starts=0;const buy={focus(){}},back={focus(){}},note={textContent:''};
   const E={ent:{game:false},D:{SKU_GAME:sku},catalog:{[sku]:{display_price:'$9.49',sale_enabled:enabled}},$:()=>({}),root:{querySelectorAll:()=>[]},updateHud(){},price:Engine.prototype.price,overlay(s){html=s;return {querySelector(q){return q==='.note'?note:q.includes('buy')?buy:back;}};},checkout(){throw new Error('unexpected checkout');},start(){starts++;}};
   Engine.prototype.showPaywall.call(E);
   assert.match(html,/entire game — all remaining scenes — for \$9\.49, one-time/);
   assert.match(html,/Unlock full game — \$9\.49/);assert.match(html,/separate optional add-on/);assert.match(html,/No recurring charge/);assert.equal(buy.disabled,!enabled);
   assert.equal(html.includes('Secure card payment'),enabled);
   if(id!=='mop-galaxy-demo'){E.ent.game=true;E.overlay=()=>{throw new Error('owned must not see buy');};Engine.prototype.showPaywall.call(E);assert.equal(starts,1);}
  }
 });
}
