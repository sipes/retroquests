"""Dispatch game-specific free-scene extraction (default: unchanged Port Lucky).
The legacy Port Lucky path reads only the accepted c508239 frozen HTML.
--game mop-galaxy delegates reviewed Scene 1 slices and read-only --check.
"""
from pathlib import Path
import subprocess, json, argparse, sys, re
root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description='Extract a game-specific free scene.')
parser.add_argument('--game', choices=['port-lucky', 'mop-galaxy'], default='port-lucky')
parser.add_argument('--check', action='store_true', help='read-only deterministic check (Mop only)')
args = parser.parse_args()
if args.game == 'mop-galaxy':
    sys.exit(subprocess.call([sys.executable, str(root/'scripts/extract-mop-free-scene.py'), *(['--check'] if args.check else [])]))
if args.check:
    parser.error('--check currently requires --game mop-galaxy; legacy Port Lucky extraction is unchanged')
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
 const listeners=[], timers=new Set(), pausedTimers=[]; let live=true, paused=false, raf, pendingFrame;
 const blockPaused=e=>{if(paused){e.preventDefault();e.stopImmediatePropagation();}};
 for(const type of ['click','submit','keydown','keyup','pointerdown','pointerup','touchstart','touchend'])root.addEventListener(type,blockPaused,true);
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
 const setTimeout=(fn,ms)=>{const id=globalThis.setTimeout(()=>{timers.delete(id);if(live){if(paused)pausedTimers.push(fn);else fn();}},ms);timers.add(id);return id;};
 const clearTimeout=id=>{timers.delete(id);globalThis.clearTimeout(id);};
 const requestAnimationFrame=fn=>{pendingFrame=fn;if(live && !paused)raf=globalThis.requestAnimationFrame(t=>{if(!live || paused)return;pendingFrame=null;fn(t);});};
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
code += part(1255,1268).replace("<p>Benny's still out there and the wedding is at four. Unlock the full game to keep playing. Your progress is saved.</p>", '<p>Scene 1 complete. Unlock the entire game — all remaining scenes — for ${price(SKU_GAME)}, one-time. No recurring charge. Check the save status above before leaving.</p><p class="note">Walkthrough/clue pack is a separate optional add-on.</p>')
code=code.replace('function showPaywall() {', "function showPaywall() {\n  const canBuy = !!catalog[SKU_GAME]?.sale_enabled;")
code=code.replace('One-time purchase. Secure card payment by Stripe.', "${canBuy ? 'One-time purchase. Secure card payment by Stripe.' : 'Purchases are currently unavailable for this account. You can return to games or replay the free scene.'}")
code=code.replace('data-a="buy">Unlock full game', 'data-a="buy">Unlock full game — ${price(SKU_GAME)}')
code=code.replace("() => checkout('game')", "() => adapter.checkout(SKU_GAME).catch(e=>toast(e.message))")
code=code.replace("o.querySelector('[data-a=buy]').focus();", "o.querySelector('[data-a=buy]').disabled=!canBuy; o.querySelector('[data-a=back]').focus();")
code += part(1279,1289) + part(1379,1399) + part(1514,1530)
code += '''$('stuckTab').onclick=openDrawer;
$('retrySave').onclick=()=>saveNow().catch(e=>toast(e.message));
const pagehide=()=>saveNow(true).catch(()=>{});window.addEventListener('pagehide',pagehide);
startGame();if(initial.save)$('saveStatus').textContent='Loaded server progress';requestAnimationFrame(render);
return {root:shell,get state(){return structuredClone(game);}, refresh:()=>adapter.getState(),
 pause(){paused=true;globalThis.cancelAnimationFrame(raf);return ()=>{paused=false;if(!live)return;if(pendingFrame)requestAnimationFrame(pendingFrame);for(const fn of pausedTimers.splice(0))setTimeout(fn,0);};},
 async flush(){clearTimeout(saveTimer);if(saving)await saving;while(pendingSave){await saveNow(false);if(saving)await saving;}},
 unmount(){if(disposed)return;disposed=true;exitImmersive();live=false;globalThis.cancelAnimationFrame(raf);
 for(const id of timers)globalThis.clearTimeout(id);for(const args of listeners)globalThis.document.removeEventListener(...args);
 window.removeEventListener('pagehide',pagehide);root.querySelectorAll('[data-a="close"]').forEach(b=>b.click());root.replaceChildren();}
};
}
'''
# Mobile presentation/input bridge. Only the reviewed free suite receives metadata;
# puzzle functions above remain byte-exact, and no owned module is imported.
presentation = {
    'me': ('self', []), 'goat': ('npc', ['talk']),
    'cocktail': ('portable', ['take']), 'keycard': ('object', []),
    'crackers': ('portable', ['take']), 'ticket': ('portable', ['take']),
    'tuba': ('object', ['take']), 'phone': ('object', []),
    'minibar': ('object', []), 'door': ('exit', []),
    'window': ('object', []), 'painting': ('object', []),
    'disco': ('object', []), 'sofa': ('object', []), 'table': ('object', [])
}
metadata = {}
for id, (kind, extra) in presentation.items():
    actions = [{'label': 'Look', 'verb': 'look'}]
    actions += [{'label': 'Search' if id == 'tuba' and v == 'take' else v.title(), 'verb': v} for v in extra]
    actions += [{'label': 'Go' if id == 'door' else 'Open' if id in ['minibar', 'window'] else 'Use', 'verb': 'use'}, {'label': 'Walk to', 'verb': 'walk'}]
    metadata[id] = {'kind': kind, 'actions': actions}
bridge = '''
// Context input adapts closure state without changing canonical puzzle handlers.
let context;
const inputEngine = {
 cv, adapter, D: {SKU_GAME}, account, ent: {game:false, walk:false},
 get game(){return game;}, get view(){return view;},
 get destroyed(){return !live || disposed;}, get paused(){return paused;},
 get msgOpen(){return msgOpen;}, get blocking(){return blocking;},
 get modalCount(){return $('modalRoot').children.length;},
 get selItem(){return selItem;}, set selItem(v){selItem=v;},
 get walkTarget(){return walkTarget;}, set walkTarget(v){walkTarget=v;},
 get walkThen(){return walkThen;}, set walkThen(v){walkThen=v;},
 root:body, modal, $, activeSpots, hitTest, canvasPoint, clampWalk, approach, act,
 renderInv, renderVerbs, itemLabel:id=>ITEMS[id].name,
 onCanvasTap:event=>contextTap.call(inputEngine,event)
};
'''
code = code.replace('/* ---------- Drawing: Suite ---------- */',
    'const CONTEXT_PRESENTATION = '+json.dumps(metadata)+';\nfor (const spot of ROOMS.suite.spots) Object.assign(spot, CONTEXT_PRESENTATION[spot.id]);\n'+bridge+'\n/* ---------- Drawing: Suite ---------- */')
# Self is a last-resort target, matching the owned engines' hotspot precedence.
code = code.replace('  for (const s of activeSpots()) {\n    if (s.dyn) { if (Math.abs(x - game.px) < 9 && y > game.py - 38 && y < game.py) return s; continue; }',
    '  let me;\n  for (const s of activeSpots()) {\n    if (s.dyn) { me=s; continue; }')
code = code.replace('  return null;\n}\nfunction clampWalk',
    '  if (me && Math.abs(x - game.px) < 9 && y > game.py - 38 && y < game.py) return me;\n  return null;\n}\nfunction clampWalk')
for signature in ['function say(text, then) {', 'function die(text) {',
                  'function overlay(html) {', 'function modal(html, onClose) {',
                  'function parse(raw) {', 'function restartScene(){',
                  'function showView(v){']:
    assert signature in code, signature
    code = code.replace(signature, signature+' context?.clear();')
code = code.replace('function render() {', 'function render() { context?.check();')
code = code.replace('startGame();if(initial.save)',
    'context=installContextInput(inputEngine);\nconst unsubContext=adapter.subscribe?.(()=>context.clear());\nstartGame();if(initial.save)')
code = code.replace('pause(){paused=true;', 'pause(){context.clear();paused=true;')
code = code.replace('refresh:()=>adapter.getState()', 'refresh:()=>{context.clear();return adapter.getState();}')
code = code.replace('unmount(){if(disposed)return;', 'unmount(){if(disposed)return;context.destroy();unsubContext?.();')
head = "import {installContextInput, contextTap} from '../../context-input.js';\n"+head
# Shared gameplay UI imports no protected content. Demo contract is Scene 1 only.
head = "import {VERBS, installGameplayControls, scoreDisplay} from '../../gameplay-controls.js';\n"+head
code = code.replace("const VERBS = [['walk','Walk'],['look','Look'],['take','Take'],['use','Use'],['talk','Talk']];", '')
scene1 = {'1': {'max':25,'name':'The Honeymoon Suite','objective':'Get your bearings after last night and find a way out of the honeymoon suite.', 'keys':['feed','arm','minibar','crackers','ticket','tuba','desk','door']}}
points1 = {'feed':5,'arm':1,'minibar':2,'crackers':2,'ticket':5,'tuba':2,'desk':3,'door':5}
head += 'const SCENES='+json.dumps(scene1)+';\nconst SCENE_POINTS='+json.dumps(points1)+';\n'
code = code.replace('context=installContextInput(inputEngine);', 'context=installContextInput(inputEngine);\nconst gameplay=installGameplayControls(inputEngine,SCENES);')
code = code.replace('function render() { context?.check();', 'function render() { context?.check();inputEngine.gameplay?.check();')
code = code.replace('`Score: ${game.score} of 250`', 'scoreDisplay({...game,chapter:1},SCENES,SCENE_POINTS)')
code = code.replace('unsubContext?.();', 'unsubContext?.();gameplay.destroy();')
code = code.replace('if (walkTarget) {', "if (walkTarget && !$('modalRoot').children.length) {")
head = "import {installSceneRuntime, captureScene, showSceneConfirmation, saveGameplay} from '../../scene-history.js';\n" + head
head = head.replace('let game=initial.save ? structuredClone(initial.save) : newGame(), deathSnap;', "let game=initial.save ? structuredClone(initial.save) : newGame(), deathSnap;\n Object.assign(game,{v:2,chapter:1,ownerId:account.id,clock:null,done:false});")
head = re.sub(r' function persist\(\).*?\n function toast', " function persist(){if(disposed || paused)return;clearTimeout(saveTimer);saveTimer=setTimeout(()=>saveNow(),800);}\n function saveNow(keepalive=false){return saveGameplay(inputEngine,inputEngine.sceneConfig,keepalive);}\n function toast", head, flags=re.S)
code = code.replace('get game(){return game;}, get view(){return view;}', 'get game(){return game;}, set game(v){game=v;}, get view(){return view;}')
code = code.replace('get paused(){return paused;},', 'get paused(){return paused;}, set paused(v){paused=v;if(!v && pendingFrame && live)requestAnimationFrame(pendingFrame);},')
code = code.replace('root:body, modal, $, activeSpots,', "get saveTimer(){return saveTimer;},set saveTimer(v){saveTimer=v;},\n setSaveState(s){this.saveState=s;$('saveStatus').textContent=s==='saving'?'Saving…':s==='saved'?'Saved':s==='failed'?'Save failed. Retry or reload.':'';},\n clearTransient(){context?.clear();msgQueue=[];msgOpen=false;blocking=false;walkTarget=null;walkThen=null;selItem=null;bgKey='';deathSnap=null;},\n clearOverlays(){root.querySelectorAll('#view .sierra,#view .overlay-card,.modal-veil').forEach(n=>n.remove());blocking=false;msgOpen=false;},\n updateHud,updateClockUI(){},script:{onRestart(){say('You wake up face-down on the carpet. Again. The goat watches you with mild interest.');}},\n root:body, modal, $, activeSpots,")
code = code.replace('const gameplay=installGameplayControls(inputEngine,SCENES);', "installSceneRuntime(inputEngine,{id:GAME_ID,scenes:SCENES,rooms:ROOMS,items:ITEMS,roomChapter:{suite:1},completedFlag:'leftSuite'});\nconst gameplay=installGameplayControls(inputEngine,SCENES);")
code = code.replace('if(!game.started){game.started=true;persist();', 'if(!game.started){game.started=true;captureScene(game,inputEngine.sceneConfig);persist();')
code = re.sub(r'function restartScene\(\)\{.*?\n\}', 'function restartScene(){showSceneConfirmation(inputEngine,1,inputEngine.sceneConfig);\n}', code, flags=re.S)
code = code.replace('async flush(){clearTimeout(saveTimer);if(saving)await saving;while(pendingSave){await saveNow(false);if(saving)await saving;}}', 'async flush(){await saveNow(false);if(inputEngine.sceneOrdinaryError)throw inputEngine.sceneOrdinaryError;}')
# No paid content or hint calls can survive extraction.
for word in ['garage','drawTruck','Pawn receipt','revealHint','listHints','platform.js']:
 assert word not in code, word
out=root/'public/demos/port-lucky'
out.mkdir(parents=True,exist_ok=True)
(out/'game.js').write_text('const CSS='+json.dumps(css)+';\nconst HTML='+json.dumps(html)+';\n'+head+code)
print('Extracted approved suite-only module:',out/'game.js')
