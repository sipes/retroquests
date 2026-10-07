"""Extract only supplier Scene 1; never import owned modules in the browser.

Pinned source hashes make the reviewed, explicit slices fail closed on supplier
changes. --check compares bytes without creating/updating any files. Port Lucky
is deliberately not read or written. The game-local engine is platform glue;
its demo copy additionally removes all hint API calls and paid advancement.
"""
from pathlib import Path
import argparse
import hashlib
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'public/games/mop-galaxy'
OUTPUT = ROOT / 'public/demos/mop-galaxy'
HASHES = {
    'data.js': '777ecd1b566bae3d039ecef2c8f48243ebe89d2003b7e5b43c4a907ec9d5ef76',
    'script.js': '7787ea43d8896c732433dddaa76c66313dfe3e5f03f288d2d7b0b10c2de164a5',
    'rooms.js': '552d9b8daa26fb70dd59263260b2d522f783e8c9e48f1523fd23825678d36937',
    'art.js': '2ed04c1c2e62e56b15a8f69a62deab3a43ab5633fff738a1d3e44c9d391c3637',
}
BANNER = '// Generated Scene 1 only; scripts/extract-mop-free-scene.py --check.\n'


def extract():
    sources = {}
    for name, expected in HASHES.items():
        raw = (SOURCE / name).read_bytes()
        if name == 'rooms.js': raw = raw.split(b'\n// Approved presentation-only contextual actions (mobile-context-v1).')[0]
        if hashlib.sha256(raw).hexdigest() != expected:
            raise ValueError(f'{name}: source changed; re-review free-scene slices before extracting')
        text = raw.decode()
        # Reviewed runtime-only insertion; preserve supplier slice line numbers.
        if name == 'script.js': text = text.replace("    if (n === 1 && opts.fresh) give('mop');\n", '')
        sources[name] = text.splitlines(keepends=True)

    def part(name, first, last):
        return ''.join(sources[name][first - 1:last])

    data = part('data.js', 1, 17) + '};\n'
    data += "export const CHAPTERS = [{n:1,title:'Deck 9, Custodial'}];\nexport const ROOM_CHAPTER = {closet:1, deck9:1};\nexport const PUZZLES = {\n"
    data += part('data.js', 66, 71) + '};\nPUZZLES.deck9 = PUZZLES.closet;\n'
    data += 'export const POINTS = {\n' + part('data.js', 121, 121).rstrip().rstrip(',') + '\n};\n'

    rooms = part('rooms.js', 1, 45).rstrip().rstrip(',') + '\n};\n'
    rooms += '\n// Approved presentation-only contextual actions (mobile-context-v1).\nconst CONTEXT_PRESENTATION = {"closet":{"me":{"kind":"self","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"coverall":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"hook":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"vent":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"shelves":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"wrench":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"cage":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Open","verb":"use"},{"label":"Walk to","verb":"walk"}]},"granules":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"bucket":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"mymop":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"timeclock":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"chute":{"kind":"exit","actions":[{"label":"Look","verb":"look"},{"label":"Go","verb":"use"},{"label":"Walk to","verb":"walk"}]},"door":{"kind":"exit","actions":[{"label":"Look","verb":"look"},{"label":"Go","verb":"use"},{"label":"Walk to","verb":"walk"}]},"mopbot":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]}},"deck9":{"me":{"kind":"self","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"vending":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"coinslot":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"dock":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"intercom":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"blastdoor":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"fountain":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"bolts":{"kind":"object","actions":[{"label":"Look","verb":"look"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"grille":{"kind":"exit","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Go","verb":"use"},{"label":"Walk to","verb":"walk"}]},"ladder":{"kind":"exit","actions":[{"label":"Look","verb":"look"},{"label":"Go","verb":"use"},{"label":"Walk to","verb":"walk"}]},"axe":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"firecab":{"kind":"portable","actions":[{"label":"Look","verb":"look"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]},"closetdoor":{"kind":"exit","actions":[{"label":"Look","verb":"look"},{"label":"Go","verb":"use"},{"label":"Walk to","verb":"walk"}]},"mopbot":{"kind":"npc","actions":[{"label":"Look","verb":"look"},{"label":"Talk","verb":"talk"},{"label":"Take","verb":"take"},{"label":"Use","verb":"use"},{"label":"Walk to","verb":"walk"}]}}};\nfor (const [id, room] of Object.entries(ROOMS)) for (const spot of room.spots) Object.assign(spot, CONTEXT_PRESENTATION[id][spot.id]);\n'

    rooms += '''
// Ordinary portable targets only; fixed containers/bots retain their original
// Use/Open/Go semantics and receive no misleading Take action.
const portable = {closet:['wrench','granules','bucket','mymop','coverall'],deck9:['axe']};
for (const [id, room] of Object.entries(ROOMS)) for (const spot of room.spots) {
  const take = portable[id].includes(spot.id);
  spot.actions = spot.actions.filter(a => a.verb !== 'take');
  if (take) spot.actions.splice(1, 0, {label:'Take',verb:'take'});
  if (spot.kind === 'portable' && !take) spot.kind = 'object';
}
ROOMS.closet.spots.find(s=>s.id==='shelves').actions.splice(1,0,{label:'Search',verb:'take'});
'''
    art = part('art.js', 1, 28) + part('art.js', 54, 60) + part('art.js', 65, 96)
    art += 'export const ART = {closet:{bg:closetBg,props:closetProps},deck9:{bg:deck9Bg,props:deck9Props}};\n'

    script = "import {ITEMS, POINTS, SAVE_VERSION} from './data.js';\nimport {demoSave} from './save.js';\n"
    script += "const CH_POS = {1:['closet',150,160,1]};\n"
    script += "export function CHAPTER_START(n) { if (n !== 1) throw new Error('Scene boundary'); return {v:SAVE_VERSION,chapter:1,room:'closet',inv:['mop'],flags:{},scored:{},score:0,hintsUsed:0,revealed:{},px:150,py:160,dir:1,started:true,clock:null,checkpoint:null,done:false}; }\n"
    script += 'export function migrateSave(s) { return demoSave(s); }\n'
    script += part('script.js', 60, 66)
    script += "  function startChapter(n, opts = {}) {\n    if (n !== 1) throw new Error('Scene boundary');\n"
    script += part('script.js', 80, 81).replace('n === 8 ? CLOCK_START : null', 'null')
    script += "    if (opts.fresh) give('mop');\n" + part('script.js', 86, 91) + '  }\n'
    script += "  function onRestart() { say('You wake up on the sack of granules. Again. Mop is still very excited about the delivery.'); }\n"
    script += "  const WALK_USE = {closet:['door','chute'],deck9:['closetdoor','ladder','grille']};\n  const walkAction = id => (WALK_USE[G().room] || []).includes(id);\n  const itemLook = id => ITEMS[id].look;\n  const itemLabel = () => null;\n  const HANDLERS = {};\n"
    script += part('script.js', 148, 155).replace("    if (v !== 'look' && tickTimers()) return;\n", '').replace("    if (g.room === 'collar' && v !== 'look') F().tick = (F().tick || 0) + 1;\n", '')
    script += '  }\n' + part('script.js', 157, 159)
    reflection = part('script.js', 160, 160).split(', cryo:')[0] + ' };\n'
    script += reflection + part('script.js', 161, 164) + part('script.js', 167, 171)
    script += '    const R = {\n' + part('script.js', 174, 175) + '    };\n' + part('script.js', 188, 193)
    script += part('script.js', 199, 199) + part('script.js', 206, 208)
    chapter = part('script.js', 210, 348)
    paid_transition = "if (E.ent.game) startChapter(2); else { E.persist(); E.showPaywall(); }"
    if chapter.count(paid_transition) != 1:
        raise ValueError('Scene 1 terminal callback changed')
    script += chapter.replace(paid_transition, 'E.persist(); E.showPaywall();')
    script += '  return {act,combine,walkAction,itemLook,itemLabel,startChapter,onRestart};\n}\n'

    engine = (SOURCE / 'engine.js').read_text()
    a = engine.index('  // ---------- Hint drawer ----------')
    b = engine.index('  // ---------- Inventory sheet (phones) ----------')
    engine = engine[:a] + "  // Demo contains no hint API, hint text or paid puzzle metadata.\n  openDrawer() { this.toast('Walkthrough is available in the full game. No hints are included in this demo.'); }\n  closeDrawer() {}\n  renderDrawer() {}\n\n" + engine[b:]
    old = "if (this.ent.game) this.script.startChapter(2); else this.showPaywall();"
    if engine.count(old) != 1:
        raise ValueError('Engine chapter boundary changed')
    engine = engine.replace(old, 'this.showPaywall();')
    engine = engine.replace("this.ent = { game: owned.includes(this.D.SKU_GAME), walk: owned.includes(this.D.SKU_WALK) };", 'this.ent = {game:false, walk:false};')

    game = """import {Engine} from './engine.js';
import {template} from './template.js';
import {GAME_ID, SKU_GAME, SKU_WALK, MAX_SCORE, SAVE_VERSION, PAL, ITEMS, PUZZLES, POINTS} from './data.js';
import {ROOMS} from './rooms.js';
import {ART, drawPlayer} from './art.js';
import {createScript, CHAPTER_START, migrateSave} from './script.js';
import {validDemoSave} from './save.js';
export {GAME_ID, SKU_GAME, SKU_WALK, MAX_SCORE, SAVE_VERSION} from './data.js';
export const DEFINITION = {
  demo:true, validateSave:validDemoSave,
  GAME_ID, SKU_GAME, SKU_WALK, MAX_SCORE, SAVE_VERSION, PAL, ITEMS, PUZZLES, POINTS,
  ROOMS, ART, drawPlayer, createScript, CHAPTER_START, migrateSave, template,
  rankFor:()=>'Scene 1 complete', startRoom:'closet', startPos:[150,160], chapter1DoneFlag:'leftDeck9', clock:null,
  texts:{title:'Mop & Galaxy', gate:'Sign up free to save your progress.', placeholder:'Type a command, e.g. talk to mop', rotate:'Mop & Galaxy plays best in landscape, with the room filling your screen.', paywall:'Two thousand colonists are asleep and a floor-polishing robot signed them away. Unlock the full game to keep playing. Check your save status before leaving.', help:'Type simple commands: LOOK, LOOK AT MOP, TAKE COVERALL, USE COIN ON VENDING MACHINE, INVENTORY. Or click a verb, then click the room.'}
};
export async function mount(container, adapter, options={}) {
  if (!container || typeof adapter?.getState !== 'function') throw new Error('Container and adapter required.');
  if (!document.querySelector('link[data-mop-css="demo"]')) {
    const link=document.createElement('link'); link.rel='stylesheet'; link.href=new URL('./game.css',import.meta.url).href; link.dataset.mopCss='demo'; document.head.appendChild(link);
  }
  const engine=new Engine(DEFINITION,container,adapter,options);
  try { await engine.mount(); } catch (error) { engine.unmount({save:false}); throw error; }
  return {unmount:()=>engine.unmount(),refresh:()=>engine.onPlatformChange(),get state(){return engine.game?structuredClone(engine.game):null;},engine};
}
"""
    # Public demo carries only its own objective and attribution, never owned goals.
    scenes = "export const SCENES = " + json.dumps({'1':{'max':20,'name':'Deck 9, Custodial','objective':'Find out what has changed aboard the Hyacinth and leave Deck 9.','keys':['look-arm','badge','vent','shelf-look','coin-vend','wrench','bolts','mop-chute','climb']}}) + ';\n'
    engine = re.sub(r'export const SCENES = .*?;\n', scenes, engine, count=1, flags=re.S)
    engine = re.sub(r'^allocateSceneScores\(.*?\);\n', '', engine, flags=re.M)
    engine = engine.replace('roomChapter:ROOM_CHAPTER}', "roomChapter:ROOM_CHAPTER,completedFlag:'leftDeck9'}")
    outputs = {'data.js':data, 'rooms.js':rooms, 'art.js':art, 'script.js':script, 'engine.js':engine, 'game.js':game}
    for name, text in outputs.items():
        for forbidden in ['startChapter(2)', 'HANDLERS.cryo', 'HANDLERS.gallery', 'Keypad code for return: 4471', 'gumbo1', 'codecard', 'revealHint(', 'listHints(', '../_shared/', '../games/', '/games/mop-galaxy/']:
            if forbidden in text:
                raise ValueError(f'{name}: forbidden paid content/reference {forbidden!r}')
    outputs = {name:BANNER+text for name,text in outputs.items()}
    for name in ['template.js','pixels.js','game.css']:
        outputs[name] = (SOURCE / name).read_text()
    return outputs


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='verify generated bytes without writing')
    args = parser.parse_args()
    outputs = extract()
    mismatched = []
    for name, text in sorted(outputs.items()):
        path = OUTPUT / name
        raw = text.encode()
        if args.check:
            if not path.is_file() or path.read_bytes() != raw:
                mismatched.append(str(path.relative_to(ROOT)))
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(raw)
    if mismatched:
        print('Stale/missing demo files: ' + ', '.join(mismatched), file=sys.stderr)
        return 1
    print(('Verified' if args.check else 'Extracted') + f' Mop Scene 1: {len(outputs)} deterministic files; no paid module imports.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
