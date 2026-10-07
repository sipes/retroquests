// Shared gameplay contract for current games and future mounts. No story/hint data.
import {showSceneProgress} from './scene-history.js';
export const VERBS = Object.freeze([['walk','Walk'],['look','Look'],['take','Take'],['use','Use'],['talk','Talk']].map(Object.freeze));
export function scoreDisplay(game, scenes, points, maxScore=250) {
  const scored=game.scored || {}, keys=scenes[game.chapter]?.keys;
  const awarded=Object.entries(scored).filter(([,v])=>v);
  const known=awarded.every(([k])=>Object.hasOwn(points,k));
  const reconstructed=awarded.reduce((n,[k])=>n+(points[k] || 0),0);
  const scene=keys && known && reconstructed===game.score ? keys.reduce((n,k)=>n+(scored[k]?points[k]:0),0) : 'unknown';
  return `Scene: ${scene} / ${scenes[game.chapter]?.max ?? 'unknown'} | Total: ${game.score} / ${maxScore}`;
}
const PREF='rq-music-muted';
// Original eight-bar C-major melody and bass composed for Retro Quests.
// Square lead + triangle bass, not sampled from any existing soundtrack.
const MELODY=[72,76,79,76,74,77,81,77,76,79,84,79,74,77,79,77,72,76,79,81,77,81,84,81,76,79,83,79,74,71,72,null];
const BASS=[48,48,53,53,45,45,55,55];
let owner=null;
export class RetroMusic {
  constructor(win=window) {this.win=win;this.muted=false;try{this.muted=win.localStorage.getItem(PREF)==='true';}catch{}this.unlocked=false;this.nodes=new Set();this.step=0;this.queue=Promise.resolve();}
  async gesture(active,hidden) {if(this.destroyed)return;this.unlocked=true;return this.sync(active,hidden);}
  async toggle(active,hidden) {this.muted=!this.muted;try{this.win.localStorage.setItem(PREF,String(this.muted));}catch{}this.unlocked=true;return this.sync(active,hidden);}
  sync(active,hidden) {
    this.want=!!(active && !hidden && this.unlocked && !this.muted && !this.destroyed && !this.failed);
    this.queue=this.queue.then(async()=>{
      try {
        if(this.want) {
          if(owner && owner!==this)await owner.destroy();owner=this;
          if(!this.ctx){const AC=this.win.AudioContext || this.win.webkitAudioContext;if(!AC)return;this.ctx=new AC();this.master=this.ctx.createGain();this.master.gain.value=0.045;this.master.connect(this.ctx.destination);}
          if(this.ctx.state!=='running')await this.ctx.resume();
          if(!this.want)return this.stop();
          if(!this.timer){this.next=this.ctx.currentTime+0.03;this.schedule();this.timer=this.win.setInterval(()=>this.schedule(),100);}
        }else await this.stop();
      }catch {this.failed=true;await this.stop().catch(()=>{});}
    });return this.queue;
  }
  note(midi,type,time,duration,volume) {
    if(midi==null)return;const osc=this.ctx.createOscillator(),gain=this.ctx.createGain();osc.type=type;osc.frequency.value=440*2**((midi-69)/12);gain.gain.setValueAtTime(0.0001,time);gain.gain.exponentialRampToValueAtTime(volume,time+0.015);gain.gain.exponentialRampToValueAtTime(0.0001,time+duration);osc.connect(gain);gain.connect(this.master);this.nodes.add(osc);osc.onended=()=>{this.nodes.delete(osc);osc.disconnect?.();gain.disconnect?.();};osc.start(time);osc.stop(time+duration+0.02);
  }
  schedule() {
    if(!this.want || !this.ctx || this.ctx.state!=='running')return;
    if(this.next<this.ctx.currentTime)this.next=this.ctx.currentTime+0.03;
    while(this.next<this.ctx.currentTime+0.3){this.note(MELODY[this.step%32],'square',this.next,0.21,0.32);if(this.step%4===0)this.note(BASS[Math.floor(this.step/4)%8],'triangle',this.next,0.85,0.6);this.step++;this.next+=0.25;}
  }
  async stop() {if(this.timer){this.win.clearInterval(this.timer);this.timer=null;}for(const node of this.nodes){try{node.stop();}catch{}}this.nodes.clear();if(this.ctx && this.ctx.state==='running')await this.ctx.suspend();}
  async destroy() {this.destroyed=true;this.want=false;await this.stop();await this.queue;try{await this.ctx?.close();}catch{}if(owner===this)owner=null;}
}
export function installGameplayControls(engine, scenes) {
  const doc=engine.cv.ownerDocument,win=doc.defaultView,view=engine.$('view'),host=engine.root || view.getRootNode().querySelector('.demo-shell');
  const music=new RetroMusic(win),listeners=[];
  const active=()=>!engine.destroyed && !engine.paused && engine.view==='game' && !!engine.game;
  const hidden=()=>doc.hidden || controller.backgrounded;
  const listen=(target,type,fn,opts)=>{target.addEventListener(type,fn,opts);listeners.push([target,type,fn,opts]);};
  listen(doc,'keydown',ev=>{if(engine.rewindPending){ev.preventDefault();ev.stopImmediatePropagation();}},true);
  for(const type of ['click','submit','keydown','pointerdown','pointerup'])listen(host,type,ev=>{if(engine.rewindPending){ev.preventDefault();ev.stopImmediatePropagation();}},true);
  const rail=host.querySelector('.side-actions');
  const button=(id,label,text)=>{const b=doc.createElement('button');b.type='button';b.className='btn ghost';b.dataset.rqUtility=id;b.setAttribute('aria-label',label);b.title=label;b.textContent=text;return b;};
  const mute=button('mute','Mute music','♪ Mute'),objective=button('objective','Scene objective','◎ Goal');
  const get=id=>engine.$(id);
  const legacy=!!get('sideTypeBtn');
  const ids=legacy?['sideStuckBtn','sideRestartBtn','sideExitBtn','sideInvBtn']:['sideStuck','sideRestart','sideExit','sideItems'];
  const top=host.querySelector('.game-top .cta-row') || host.querySelector('.game-top') || host.querySelector('.topbar');
  if(engine.sceneConfig){const progress=button('scenes','Scene progress','Scenes');progress.classList.add('rq-scenes');progress.onclick=()=>showSceneProgress(engine);top?.append(progress);}
  if(rail){
    for(const id of legacy?['sideTypeBtn','sideFsBtn']:['sideType','sideFs']){const b=get(id);if(b){b.classList.add('rq-nonrail');(top || rail.parentNode).append(b);}}
    const existing=ids.map(get);existing.forEach((b,i)=>{if(!b)return;b.dataset.rqUtility=['stuck','restart','exit','items'][i];b.setAttribute('aria-label',['Stuck?','Restart scene','Exit game','Items'][i]);b.title=b.getAttribute('aria-label');const icon=doc.createElement('span');icon.textContent=['?','↻','←','▣'][i];icon.setAttribute('aria-hidden','true');b.prepend(icon);});
    rail.replaceChildren(mute,objective,...existing.filter(Boolean));
  }
  // Move the same controls, not copies: preserve handlers, audio and mobile order.
  const desktop=win.matchMedia('(pointer:fine)');
  const hover=host.querySelector('.hover-label');
  const placeUtilities=()=>{
    if(!rail || !top)return;
    if(desktop.matches){top.prepend(mute,objective);}
    else rail.prepend(mute,objective);
    if(hover){if(desktop.matches)hover.tabIndex=0;else hover.removeAttribute('tabindex');}
  };
  placeUtilities();listen(desktop,'change',placeUtilities);
  // Keep overflowing target text available when moving into its scroll area.
  // Elsewhere the engine's normal pointer-leave clearing remains unchanged.
  if(hover){
    listen(engine.cv,'mouseleave',ev=>{if(desktop.matches && ev.relatedTarget && hover.contains(ev.relatedTarget))ev.stopImmediatePropagation();},true);
    listen(hover,'mouseleave',ev=>{if(desktop.matches && ev.relatedTarget!==engine.cv)hover.textContent='';});
  }
  mute.onclick=async()=>{await music.toggle(active(),hidden());controller.updateMute();};
  objective.onclick=()=>{
    if(!engine.game || engine.view!=='game' || engine.destroyed || engine.paused)return;
    engine.context?.clear();const goal=scenes[engine.game.chapter || 1]?.objective || 'Objective unavailable for this scene.';
    // Existing blocking modal/reading behavior pauses timers just as normal dialogs.
    const html='<div class="modal"><h3>Scene objective</h3><p></p><button type="button" data-rq-close>Close</button></div>';
    const m=engine.modal(html);m.el.querySelector('p').textContent=goal;m.el.querySelector('[data-rq-close]').onclick=m.close;m.el.querySelector('button').focus();
  };
  const style=doc.createElement('style');style.textContent=`
  .rq-nonrail,.rq-scenes{min-width:44px;min-height:44px}.rq-utilities{display:flex;gap:6px}.rq-utilities button{min-height:44px}
  .rq-scene-dialog{box-sizing:border-box;max-height:calc(100dvh - 16px);overflow:auto;overflow-wrap:anywhere}
  .rq-scene-dialog button{min-height:44px;min-width:44px;white-space:normal}
  .rq-scene-dialog ol{padding-left:22px}.rq-scene-dialog li{margin-bottom:8px}
  .rq-scene-dialog li button{width:100%;text-align:left}
  .rq-scene-dialog button:focus-visible{outline:2px solid #00d5ed;outline-offset:3px}
  .pl-game .side-actions,.demo-shell .side-actions{display:flex;gap:6px;grid-column:1/-1}
  .pl-game .side-actions>[data-rq-utility],.demo-shell .side-actions>[data-rq-utility]{min-height:44px}
  @media (pointer:fine){
    .pl-game .side-actions,.demo-shell .side-actions{display:none}
    .pl-game .rq-nonrail,.demo-shell .rq-nonrail,.pl-game [data-id=fsTop],.demo-shell #fsTopBtn{display:none!important}
    .pl-game .game-top [data-rq-utility],.demo-shell .game-top [data-rq-utility]{min-height:44px}
    /* Two readable lines, stable even when empty. Exceptional labels scroll rather
       than clipping or moving the action/inventory panels. No spoken placeholder. */
    .pl-game .hover-label,.demo-shell .hover-label{display:block!important;box-sizing:border-box;height:56px;min-height:56px;max-height:56px;line-height:26px;padding:4px 2px 0;white-space:normal;overflow:auto;overflow-wrap:anywhere;scrollbar-gutter:stable}
  }
  @media (pointer:coarse){
    .pl-game .pl-stage,.demo-shell #gameView{display:grid!important;grid-template-columns:minmax(0,1fr) 48px!important;gap:6px!important;height:auto!important;min-height:0;padding:4px max(4px,env(safe-area-inset-right,0px)) 4px max(4px,env(safe-area-inset-left,0px));box-sizing:border-box}
    .pl-game .game-top,.demo-shell .game-top,.demo-shell.in-game .game-top{display:flex!important;grid-column:1/-1;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:3px;margin:0!important}
    .pl-game .game-top .title,.demo-shell .game-top h2{display:none}
    .pl-game .game-top .cta-row,.demo-shell .game-top .cta-row{display:flex;gap:3px}
    .pl-game .controls,.demo-shell .controls{display:block!important;margin:0!important;min-width:0!important;overflow:visible!important}
    .pl-game .stage,.demo-shell .stage{min-width:0!important;align-self:start}
    .pl-game .screen,.demo-shell .screen{width:100%!important;box-sizing:border-box}
    .pl-game .statusbar,.demo-shell .statusbar{font-size:12px!important;flex-wrap:wrap;gap:3px!important;white-space:normal}
    .pl-game .inv-panel,.demo-shell .inv-panel{display:none!important}
    .pl-game .parser,.demo-shell .parser{display:none!important}
    .pl-game.typing .parser,.demo-shell.typing .parser{display:flex!important;position:fixed!important;z-index:50;left:4px!important;right:58px!important;top:4px!important;box-sizing:border-box;min-width:0}
    .pl-game .parser input,.demo-shell .parser input{min-width:0}
    .pl-game [data-id=fsTop],.demo-shell #fsTopBtn{display:none!important}
    .demo-shell #restartBtn,.demo-shell #backBtn{display:none!important}
    .pl-game .controls>.panel:not(.inv-panel),.mg-game .controls>.panel:not(.inv-panel),.demo-shell .controls>.panel:not(.inv-panel){display:none!important}
    .pl-game .side-actions,.mg-game .side-actions,.demo-shell .side-actions{display:flex!important;flex-direction:column!important;width:48px!important;min-width:48px!important;gap:3px!important;overflow:auto;max-height:100dvh;box-sizing:border-box}
    .pl-game .side-actions>.btn,.mg-game .side-actions>.btn,.demo-shell .side-actions>.btn{display:flex!important;flex-direction:column;gap:0!important;flex:0 0 44px!important;box-sizing:border-box;width:44px!important;height:44px!important;min-height:44px!important;min-width:44px!important;padding:2px!important;font:10px/1.15 system-ui,sans-serif!important;letter-spacing:0!important;white-space:normal!important;overflow-wrap:normal!important;transform:none!important;box-shadow:none!important}
    .pl-game .side-actions .inv-count,.demo-shell .side-actions .inv-count{display:none!important}
    .pl-game [data-id=restart],.pl-game [data-id=exit],.mg-game [data-id=restart],.mg-game [data-id=exit],.demo-shell #restartSceneBtn,.demo-shell #exitGameBtn{display:none!important}
    .pl-game .stuck-tab,.mg-game .stuck-tab,.demo-shell .stuck-tab{display:none!important}
    .rq-nonrail{display:inline-block!important;font-size:11px!important;padding:3px!important}
  }
  @media (pointer:coarse) and (orientation:landscape){
    .pl-game,.demo-shell{height:auto!important;overflow:visible!important}
    .pl-game .screen,.demo-shell .screen{width:min(100%,calc((100dvh - 110px) * 16 / 9))!important}
    .pl-game .stage,.demo-shell .stage{justify-content:center}
    .pl-game .hover-label,.demo-shell .hover-label{display:none!important}
  }`;
  // Both adapters use the same template class names but isolated root scopes.
  style.textContent=style.textContent.replace(/\.pl-game/g, ':is(.pl-game,.mg-game)');
  host.append(style);
  const controller={music,backgrounded:false,updateMute(){mute.textContent=music.muted?'♫ Sound':'♪ Mute';mute.setAttribute('aria-label',music.muted?'Unmute music':'Mute music');mute.setAttribute('aria-pressed',String(music.muted));},check(){const wanted=!!(active()&&!hidden());if(this.lastActive!==wanted){this.lastActive=wanted;music.sync(active(),hidden());}},destroy(){for(const [t,k,f,o]of listeners)t.removeEventListener(k,f,o);listeners.length=0;style.remove();music.destroy();}};
  controller.updateMute();
  const gesture=ev=>{if(ev.isTrusted){music.gesture(active(),hidden());controller.updateMute();}};
  listen(host,'pointerdown',gesture,true);listen(host,'keydown',gesture,true);
  listen(doc,'visibilitychange',()=>music.sync(active(),hidden()));
  listen(win,'pagehide',()=>{controller.backgrounded=true;music.sync(false,true);});
  listen(win,'pageshow',()=>{controller.backgrounded=false;music.sync(active(),hidden());});
  listen(win,'storage',ev=>{if(ev.key===PREF){music.muted=ev.newValue==='true';controller.updateMute();music.sync(active(),hidden());}});
  engine.gameplay=controller;return controller;
}
