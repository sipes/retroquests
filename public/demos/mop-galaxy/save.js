// Scene 1 raw v2 save validator/projection. The bridge owns the separate
// {version:1, revision, data} CAS envelope; pass only envelope.data here.
const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const fields = new Set(['v','ownerId','chapter','room','inv','flags','scored','score','hintsUsed','revealed','px','py','dir','started','clock','checkpoint','done']);
const items = new Set(['mop','mymop','badge','coin','snakpak','wrapper','wrench','granules']);
const flags = new Set(['lookedArm','gotBadge','sawBoarders','sawWrench','shelfWedged','gotWrench','vended','grilleOpen','mopChuted','tookMymop','leftDeck9']);
const points = {'look-arm':1,badge:2,vent:3,'shelf-look':1,'coin-vend':2,wrench:3,bolts:3,'mop-chute':3,climb:2};
const bit = v => typeof v === 'boolean' || v === 0 || v === 1;
function valid(s, checkpoint = false) {
  if (!object(s) || !Object.keys(s).every(k => fields.has(k))) return false;
  if (s.v !== 2 || s.chapter !== 1 || !['closet','deck9'].includes(s.room)) return false;
  if (s.ownerId !== undefined && (typeof s.ownerId !== 'string' || !s.ownerId || s.ownerId.length > 128)) return false;
  if (!Array.isArray(s.inv) || s.inv.length > items.size || new Set(s.inv).size !== s.inv.length || !s.inv.every(i => items.has(i))) return false;
  if (!object(s.flags) || !Object.entries(s.flags).every(([k,v]) => flags.has(k) && bit(v))) return false;
  if (!object(s.scored) || !Object.entries(s.scored).every(([k,v]) => Object.hasOwn(points,k) && bit(v))) return false;
  if (!Number.isInteger(s.score) || s.score < 0 || s.score > 20 || s.score !== Object.entries(s.scored).reduce((n,[k,v]) => n + (v ? points[k] : 0),0)) return false;
  if (s.hintsUsed !== 0 || !object(s.revealed) || Object.keys(s.revealed).length) return false;
  if (!['px','py'].every(k => Number.isFinite(s[k]) && s[k] >= 0 && s[k] <= (k === 'px' ? 320 : 180))) return false;
  if (![1,-1].includes(s.dir) || typeof s.started !== 'boolean' || s.clock !== null || s.done !== false) return false;
  if (s.checkpoint != null && (checkpoint || !valid(s.checkpoint,true) || (s.ownerId && s.checkpoint.ownerId && s.ownerId !== s.checkpoint.ownerId))) return false;
  return true;
}
export const validDemoSave = s => valid(s);
export function demoSave(s) {
  if (!validDemoSave(s)) throw new Error('Unsupported or invalid save retained. No automatic reset; contact the platform owner.');
  const out = {v:2,chapter:1,room:s.room,inv:[...s.inv],flags:{...s.flags},scored:{...s.scored},score:s.score,hintsUsed:0,revealed:{},px:s.px,py:s.py,dir:s.dir,started:s.started,clock:null,checkpoint:null,done:false};
  if (s.ownerId !== undefined) out.ownerId = s.ownerId;
  if (s.checkpoint != null) out.checkpoint = demoSave(s.checkpoint);
  return out;
}
