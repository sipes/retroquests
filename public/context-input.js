import {VERBS} from './gameplay-controls.js';
// Presentation-only input. No game data, puzzle knowledge or platform routes.
export class ContextInput {
  constructor(engine) { this.e = engine; this.selected = null; this.sequence = 0; this.listeners = []; this.pointers = new Map(); this.suppressUntil = 0; }
  blocked() { const e=this.e; return this.destroyed || e.destroyed || e.paused || !e.game || e.view !== 'game' || e.msgOpen || e.blocking || e.choiceOpen || e.modalCount > 0 || e.contextDrawerOpen?.(); }
  snapshot(id) { const e=this.e; return {id,game:e.game,room:e.game.room,chapter:e.game.chapter,account:e.account?.id,verified:e.account?.verified,ent:JSON.stringify(e.ent),sequence:this.sequence}; }
  current(s) { const e=this.e; if(!s || s.sequence!==this.sequence || this.blocked() || e.game!==s.game || e.game.room!==s.room || e.game.chapter!==s.chapter || e.account?.id!==s.account || e.account?.verified!==s.verified || JSON.stringify(e.ent)!==s.ent)return null;return e.activeSpots().find(x=>x.id===s.id) || null; }
  clear() { this.pointers.clear(); this.sequence++; this.selected=null; this.menu?.remove(); this.menu=null; if(this.pending){this.e.walkThen=null;this.e.walkTarget=null;}this.pending=false;this.pendingSnapshot=null; }
  tap(spot) { this.clear(); this.e.walkThen=null;this.e.walkTarget=null;this.selected=this.snapshot(spot.id);this.paint();this.openingClick=true; }
  check() { const s=this.selected || this.pendingSnapshot; if(s && !this.current(s))this.cancel(s); }
  cancel(s) { if(s?.sequence===this.sequence)this.clear(); }
  async authorized(s) { if(!this.current(s))return false;const e=this.e;if(e.adapter?.getState){try{const st=await e.adapter.getState();if(st.user?.id!==s.account || st.user?.verified!==s.verified)return false;const sku=e.D?.SKU_GAME || 'port-lucky';if(e.ent.game && !st.entitlements?.includes(sku))return false;const walk=e.D?.SKU_WALK || 'port-lucky-walkthrough';if(e.ent.walk && !st.entitlements?.includes(walk))return false;}catch{return false;}}return !!this.current(s); }
  dispatch(action,s=this.selected,item) {
    if(!this.current(s) || this.pending)return;
    this.menu?.remove();this.menu=null;this.selected=null;this.pending=true;this.pendingSnapshot=s;
    const run=()=>{const spot=this.current(s);if(!spot){this.cancel(s);return;}const finish=()=>{if(!this.current(s) || (item && !this.e.game.inv.includes(item))){this.cancel(s);return;}this.pending=false;this.pendingSnapshot=null;this.sequence++;if(item){this.e.selItem=null;this.e.renderInv();this.e.renderVerbs();}this.e.act(action.verb,s.id,item);};
      if(this.e.adapter?.getState)this.authorized(s).then(ok=>{if(ok)finish();else this.cancel(s);});else finish();};
    const approach=()=>{const spot=this.current(s);if(!spot){this.cancel(s);return;}if(action.verb==='walk'){this.pending=false;this.pendingSnapshot=null;this.sequence++;this.e.walkThen=null;const at=spot.at || (spot.rect ? [spot.rect[0]+spot.rect[2]/2,spot.rect[1]+spot.rect[3]] : [this.e.game.px,this.e.game.py]);this.e.walkTarget=this.e.clampWalk(...at);return;}if(action.verb==='look')run();else this.e.approach(spot,run);};
    if(this.e.adapter?.getState)this.authorized(s).then(ok=>{if(ok)approach();else this.cancel(s);});else approach();
  }
  paint(picker=false) {
    const s=this.selected,spot=this.current(s);if(!spot)return this.clear();
    this.menu?.remove();const doc=this.e.cv.ownerDocument,box=doc.createElement('section');box.className='rq-context';box.setAttribute('aria-label','Actions for '+spot.name);box.setAttribute('role','group');
    const title=doc.createElement('strong');title.textContent=picker?'Use / Give item to '+spot.name:spot.name;box.append(title);
    const button=(label,fn)=>{const b=doc.createElement('button');b.type='button';b.textContent=label;b.onclick=event=>{event.stopPropagation();if(this.selected===s && this.current(s))fn();};box.append(b);};
    if(picker){for(const id of this.e.game.inv)button(this.e.itemLabel(id),()=>this.dispatch({verb:'use'},s,id));if(!this.e.game.inv.length){const p=doc.createElement('span');p.textContent='Nothing carried';box.append(p);}}
    else {for(const [verb,label] of VERBS)button(label,()=>this.dispatch({verb},s));button('Use item…',()=>this.paint(true));if(spot.kind==='npc')button('Give…',()=>this.paint(true));if(this.e.selItem && this.e.game.inv.includes(this.e.selItem)){const item=this.e.selItem;button('Use '+this.e.itemLabel(item),()=>this.dispatch({verb:'use'},s,item));}}
    button('Cancel',()=>this.clear());this.menu=box;this.e.$('view').append(box);this.position();
  }
  position() { if(!this.menu)return;const r=this.e.$('view').getBoundingClientRect(),win=this.e.cv.ownerDocument.defaultView,vv=win.visualViewport;const left=Math.max(r.left,vv?.offsetLeft || 0)+6,top=Math.max(r.top,vv?.offsetTop || 0)+6,right=Math.min(r.right,(vv?.offsetLeft || 0)+(vv?.width || win.innerWidth))-6,bottom=(vv?.offsetTop || 0)+(vv?.height || win.innerHeight)-6;Object.assign(this.menu.style,{left:(left-r.left)+'px',top:(top-r.top)+'px',width:Math.max(0,Math.min(270,right-left))+'px',maxHeight:Math.max(0,bottom-top)+'px'}); }
  listen(target,type,fn,opts) {target.addEventListener(type,fn,opts);this.listeners.push([target,type,fn,opts]);}
  wire() {
    const e=this.e,cv=e.cv,doc=cv.ownerDocument,win=doc.defaultView;
    const style=doc.createElement('style');style.textContent='.rq-context{position:absolute;z-index:7;box-sizing:border-box;display:flex;flex-wrap:wrap;gap:4px;padding:6px;background:#1c1735;color:#f2eeff;border:2px solid #55ffff;box-shadow:3px 3px #000;overflow:auto;overscroll-behavior:contain;font:16px "Atkinson Hyperlegible",sans-serif;touch-action:pan-y pinch-zoom}.rq-context strong,.rq-context span{width:100%;overflow-wrap:anywhere}.rq-context button{box-sizing:border-box;min-width:44px;min-height:44px;flex:1 0 44%;background:#251f45;color:#f2eeff;border:2px solid #3b3266;font:inherit;padding:6px;overflow-wrap:anywhere}.rq-context button:focus-visible{outline:2px solid #ffff55}';e.$('view').append(style);this.style=style;
    this.listen(cv,'pointerdown',ev=>{if(ev.pointerType==='mouse'){this.suppressUntil=0;return;}this.suppressUntil=Date.now()+900;const p={x:ev.clientX,y:ev.clientY,cancel:!!this.blocked()};this.pointers.set(ev.pointerId,p);if(this.pointers.size>1)for(const p of this.pointers.values())p.cancel=true;});
    this.listen(doc,'pointermove',ev=>{const p=this.pointers.get(ev.pointerId);if(p && Math.hypot(ev.clientX-p.x,ev.clientY-p.y)>10)p.cancel=true;});
    this.listen(doc,'pointercancel',ev=>{this.pointers.delete(ev.pointerId);this.suppressUntil=Date.now()+900;});
    this.listen(doc,'pointerup',ev=>{const p=this.pointers.get(ev.pointerId);if(!p)return;this.pointers.delete(ev.pointerId);this.suppressUntil=Date.now()+900;if(!p.cancel && Math.hypot(ev.clientX-p.x,ev.clientY-p.y)<=10 && ev.composedPath().includes(cv))e.onCanvasTap(ev);});
    this.listen(cv,'click',ev=>{if(ev.pointerType==='touch' || ev.sourceCapabilities?.firesTouchEvents || (Date.now()<this.suppressUntil && ev.pointerType!=='mouse')){ev.stopImmediatePropagation();return;}if(!ev.pointerType && e.coarse?.()){ev.stopImmediatePropagation();e.onCanvasTap(ev);return;}this.clear();},true);
    // Creating the menu during pointerup may retarget the browser's following
    // click to a button under that finger. Suppress that opening click at the
    // document boundary; a new deliberate pointerdown enables menu actions.
    this.listen(doc,'click',ev=>{if(this.openingClick){this.openingClick=false;ev.stopImmediatePropagation();}},true);
    this.listen(doc,'pointerdown',ev=>{this.openingClick=false;const path=ev.composedPath();if(ev.pointerType!=='mouse' && this.pointers.size && !this.pointers.has(ev.pointerId))for(const p of this.pointers.values())p.cancel=true;if(!path.includes(cv) && !path.includes(this.menu))this.clear();},true);
    this.listen(doc,'keydown',ev=>{this.openingClick=false;if(ev.key==='Escape')this.clear();});
    for(const type of ['resize','orientationchange','pagehide'])this.listen(win,type,()=>{this.pointers.clear();this.clear();});
    this.listen(doc,'fullscreenchange',()=>this.clear());if(win.visualViewport)this.listen(win.visualViewport,'resize',()=>this.clear());
  }
  destroy() {this.destroyed=true;this.clear();this.pointers.clear();for(const [t,k,f,o]of this.listeners)t.removeEventListener(k,f,o);this.listeners=[];this.style?.remove();}
}
export function contextTap(event) {if(this.context.blocked?.())return;const [x,y]=this.canvasPoint(event),spot=this.hitTest(x,y);if(spot)this.context.tap(spot);else{this.context.clear();this.walkThen=null;this.walkTarget=this.clampWalk(x,y);}}
export function installContextInput(engine) {const c=new ContextInput(engine);engine.context=c;c.wire();return c;}
