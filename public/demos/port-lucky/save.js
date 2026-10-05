// Safe free-scene schema. Contains no paid-room names or hint/solution text.
const object=v=>v!==null && typeof v==='object' && !Array.isArray(v);
const flags=new Set(['minibarOpen','gotCrackers','goatFed','gotTicket','leftSuite','calledDesk']);
const scored=new Set(['feed','arm','minibar','crackers','ticket','tuba','desk','door']);
export function validDemoSave(s){
 return object(s) && s.room==='suite' && (s.v===undefined || s.v===2)
  && (s.chapter===undefined || s.chapter===1) && Array.isArray(s.inv)
  && s.inv.every(i=>['crackers','keycard','ticket'].includes(i))
  && object(s.flags) && Object.entries(s.flags).every(([k,v])=>flags.has(k)&&(typeof v==='boolean'||v===0||v===1))
  && (s.scored===undefined || (object(s.scored)&&Object.entries(s.scored).every(([k,v])=>scored.has(k)&&(typeof v==='boolean'||v===0||v===1))))
  && Number.isFinite(s.score) && s.score>=0 && s.score<=25
  && (s.revealed===undefined || (object(s.revealed)&&Object.keys(s.revealed).length===0))
  && (s.hintsUsed===undefined || s.hintsUsed===0)
  && ['px','py'].every(k=>s[k]===undefined || (Number.isFinite(s[k])&&s[k]>=0&&s[k]<=(k==='px'?320:180)))
  && (s.dir===undefined || s.dir===1 || s.dir===-1)
  && (!s.checkpoint || validDemoSave({...s.checkpoint,checkpoint:null}));
}
export function demoSave(s){
 if(!validDemoSave(s))throw new Error('Unsupported or invalid save retained. No automatic reset; contact the platform owner.');
 // Keep the legacy shape consumed by the unchanged full-game migration.
 return {room:'suite',inv:[...s.inv],flags:{...s.flags},scored:{...s.scored},score:s.score,hintsUsed:0,revealed:{},px:s.px??150,py:s.py??160,dir:s.dir??1,started:!!s.started};
}
