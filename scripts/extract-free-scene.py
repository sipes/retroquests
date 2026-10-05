"""Reproduce the safe Scene 1 module from the accepted c508239 frozen source.
No full-game module is read. Explicit slices exclude the paid garage and hints.
"""
from pathlib import Path
import subprocess, json
root = Path(__file__).resolve().parents[1]
s = subprocess.check_output(['git', 'show', 'c508239:public/index.html'], cwd=root, text=True)
lines = s.splitlines(keepends=True)
def part(a,b): return ''.join(lines[a-1:b])
# Accepted source line positions intentionally checked: fail rather than ship another scene.
assert 'function suiteAct' in part(859,934)
assert 'function drawGarageBg' in part(737,754)
css = '\n'.join(block.split('</style>')[0] for block in s.split('<style>')[1:])
css = css.replace(':root', '.demo-shell').replace('body', '.demo-shell').replace('html', '.demo-shell')
css += '\n.btn:disabled, .btn:disabled:hover, .btn:disabled:active { background: #302c38; color: #aaa4b5; border-color: #625a70; box-shadow: none; transform: none; cursor: not-allowed; }\n'
html = part(443,496).replace(' id="gameView" hidden', ' id="gameView"')
html = html.replace('<button class="btn small ghost" id="reloadSave">Load server progress (discard pending)</button>', '')
head = '''// Extracted from the accepted frozen Scene 1 (c508239); see scripts/extract-free-scene.py.
// Suite art, puzzle text, parser and inventory are reused, never imported from paid modules.
export async function mount(container, adapter, options = {}) {
 const initial = await adapter.getState();
 if (!initial.user?.verified) throw new Error('A verified free account is required.');
 const shell = globalThis.document.createElement('div'); shell.className='demo-shell';
 container.replaceChildren(shell);
 const root = shell.attachShadow({mode:'open'});
 root.innerHTML = `<style>${CSS}</style><div class="demo-shell">${HTML}</div>`;
 const body=root.querySelector('.demo-shell');
 const listeners=[], timers=new Set(); let live=true, raf;
 const document = {
  body, documentElement: body,
  getElementById: id=>root.querySelector('#'+id),
  querySelector: s=>root.querySelector(s), querySelectorAll:s=>root.querySelectorAll(s),
  createElement: (...a)=>globalThis.document.createElement(...a),
  createTextNode: (...a)=>globalThis.document.createTextNode(...a),
  get activeElement(){return root.activeElement;},
  get fullscreenElement(){return globalThis.document.fullscreenElement;},
  get webkitFullscreenElement(){return globalThis.document.webkitFullscreenElement;},
  get fullscreenEnabled(){return globalThis.document.fullscreenEnabled;},
  exitFullscreen:()=>globalThis.document.exitFullscreen?.(),
  webkitExitFullscreen:()=>globalThis.document.webkitExitFullscreen?.(),
  addEventListener(type,fn,opts){globalThis.document.addEventListener(type,fn,opts);listeners.push([type,fn,opts]);},
  removeEventListener(...a){globalThis.document.removeEventListener(...a);}
 };
 const setTimeout=(fn,ms)=>{const id=globalThis.setTimeout(()=>{timers.delete(id);if(live)fn();},ms);timers.add(id);return id;};
 const clearTimeout=id=>{timers.delete(id);globalThis.clearTimeout(id);};
 const requestAnimationFrame=fn=>{if(live)raf=globalThis.requestAnimationFrame(fn);};
 const GAME_ID='port-lucky', SKU_GAME='port-lucky';
 const account=initial.user, catalog=initial.catalog || {};
 const price=sku=>catalog[sku]?.display_price || 'Unavailable';
 let game=initial.save ? structuredClone(initial.save) : newGame(), deathSnap;
 let pendingSave=null, saveTimer, saving, disposed=false;
 function persist(){if(disposed)return;pendingSave=structuredClone(game);clearTimeout(saveTimer);saveTimer=setTimeout(()=>saveNow().catch(()=>{}),800);}
 async function saveNow(keepalive=false){
  clearTimeout(saveTimer); if(!pendingSave)return;
  if(saving && !keepalive)await saving;
  if(!pendingSave)return;
  const snapshot=structuredClone(pendingSave);
  $('saveStatus').textContent='Saving…';
  const work=adapter.save(GAME_ID,snapshot,{ownerId:account.id,keepalive}); saving=work;
  try{await work;if(!live)return;if(JSON.stringify(pendingSave)===JSON.stringify(snapshot))pendingSave=null;$('saveStatus').textContent='Saved';}
  catch(e){if(live)$('saveStatus').textContent='Not saved — '+e.message;throw e;}
  finally{if(saving===work)saving=null;}
 }
 function toast(t){$('toast').textContent=t;$('toast').hidden=false;setTimeout(()=>$('toast').hidden=true,2600);}
 function closeDrawer(){ $('drawer').hidden=true; $('drawerVeil').hidden=true; }
 function openDrawer(){toast('Walkthrough is available in the full game. No hints are included in this demo.');}
'''
code = part(503,510) + part(569,577).rstrip().rstrip(',') + '\n};\n'
code += part(582,604).rstrip().rstrip(',')+'\n};\n'
code += part(635,736)
render = part(800,827)
render = render.replace("if (game.room === 'suite') drawSuiteBg(bx, game); else drawGarageBg(bx, game);", 'drawSuiteBg(bx, game);')
render = render.replace(part(819,822), '    }\n')
code += render + part(829,952) + "  persist(); showPaywall();\n}\n" + part(1013,1180)
code=code.replace("if (game.room === 'suite') suiteAct(v, id, it); else garageAct(v, id, it);", 'suiteAct(v, id, it);')
code=code.replace('TALK TO VALET, ', '')
code += part(1183,1208)
code += '''function showView(v){if(v==='home'){options.onExit?.('user');return;} view='game';document.body.classList.add('in-game');}
function startGame(){
 showView('game');bgKey='';selItem=null;verb='walk';renderVerbs();renderInv();updateHud();
 if(game.flags.leftSuite)return showPaywall();
 if(!game.started){game.started=true;persist();
'''+part(1233,1235)+'''
 }else say('Welcome back. Your game was saved right where you left it.');
}
function restartScene(){game=newGame();game.started=true;msgQueue=[];walkTarget=null;walkThen=null;bgKey='';selItem=null;
 document.querySelectorAll('#view .sierra, #view .overlay-card').forEach(n=>n.remove());msgOpen=false;blocking=false;
 renderInv();updateHud();persist();say('You wake up face-down on the carpet. Again. The goat watches you with mild interest.');
}
'''
code += part(1255,1268).replace("<p>Benny's still out there and the wedding is at four. Unlock the full game to keep playing. Your progress is saved.</p>", "<p>Benny's still out there and the wedding is at four. Unlock the full game to keep playing. Check the save status above before leaving.</p>")
code=code.replace('function showPaywall() {', "function showPaywall() {\n  const canBuy = !!catalog[SKU_GAME]?.sale_enabled;")
code=code.replace('One-time purchase. Secure card payment by Stripe.', "${canBuy ? 'One-time purchase. Secure card payment by Stripe.' : 'Purchases are currently unavailable for this account. You can return to games or replay the free scene.'}")
code=code.replace('data-a="buy">Unlock full game', 'data-a="buy">${canBuy ? \'Unlock full game\' : \'Purchase unavailable\'}')
code=code.replace("() => checkout('game')", "() => adapter.checkout(SKU_GAME).catch(e=>toast(e.message))")
code=code.replace("o.querySelector('[data-a=buy]').focus();", "o.querySelector('[data-a=buy]').disabled=!canBuy; o.querySelector('[data-a=back]').focus();")
code += part(1279,1289) + part(1379,1399) + part(1514,1530)
code += '''$('stuckTab').onclick=openDrawer;
$('retrySave').onclick=()=>saveNow().catch(e=>toast(e.message));
const pagehide=()=>saveNow(true).catch(()=>{});window.addEventListener('pagehide',pagehide);
startGame();if(initial.save)$('saveStatus').textContent='Loaded server progress';requestAnimationFrame(render);
return {get state(){return structuredClone(game);}, refresh:()=>adapter.getState(),
 unmount(){if(disposed)return;disposed=true;exitImmersive();saveNow(true).catch(()=>{});live=false;globalThis.cancelAnimationFrame(raf);
 for(const id of timers)globalThis.clearTimeout(id);for(const args of listeners)globalThis.document.removeEventListener(...args);
 window.removeEventListener('pagehide',pagehide);root.querySelectorAll('[data-a="close"]').forEach(b=>b.click());root.replaceChildren();}
};
}
'''
# No paid content or hint calls can survive extraction.
for word in ['garage','drawTruck','Pawn receipt','revealHint','listHints','platform.js']:
 assert word not in code, word
out=root/'public/demos/port-lucky'
out.mkdir(parents=True,exist_ok=True)
(out/'game.js').write_text('const CSS='+json.dumps(css)+';\nconst HTML='+json.dumps(html)+';\n'+head+code)
print('Extracted approved suite-only module:',out/'game.js')
