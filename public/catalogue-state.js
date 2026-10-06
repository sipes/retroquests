// Public summary metadata only: no paid modules, hints, migration or save writes.
// Contract references and transition audit: evidence/catalogue-v1/contracts.json.
const metadata=Object.freeze({
 'port-lucky':{chapters:[['suite'],['garage'],['bar','cage','alley'],['pier','arcade'],['dock','pontoon'],['corridor','hartwell'],['lawn','groomtent','altar'],['reception']],terminal:'leftSuite',finalRoom:'reception'},
 'mop-galaxy':{chapters:[['closet','deck9'],['cryo','gallery'],['galley','hydro'],['drive','reactor'],['hull1','hull2'],['ready','bridge'],['collar','hold','quarters','clamps'],['lift','gallery2','bridge2']],terminal:'leftDeck9',finalRoom:'bridge2'}
});
const object=v=>v!==null && typeof v==='object' && !Array.isArray(v);
const flag=v=>v===true || v===1;
export function cataloguePresentation(state,gameId){
 const user=state?.user,owned=!!(user?.id && user.verified===true && state.entitlements?.includes(gameId));
 const out={owned,action:owned?'Continue game':'Play scene 1 free',progress:'Progress unavailable'};
 if(!user?.id)return {...out,progress:'Sign in to see progress'};
 const m=metadata[gameId];if(!m)return out;
 const en=state.save_envelopes?.[gameId];if(en===undefined || en===null)return {...out,progress:`0 / ${m.chapters.length} scenes completed`};
 if(!object(en) || en.version!==1 || !Number.isSafeInteger(en.revision) || en.revision<0 || (en.ownerId!==undefined && en.ownerId!==user.id))return out;
 const d=en.data;
 if(!object(d) || !object(d.flags) || !Array.isArray(d.inv) || !d.inv.every(x=>typeof x==='string') || !Number.isFinite(d.score) || (d.v!==undefined && d.v!==2))return out;
 if((d.ownerId!==undefined && d.ownerId!==user.id) || (d.checkpoint?.ownerId!==undefined && d.checkpoint.ownerId!==user.id))return out;
 const roomChapter=m.chapters.findIndex(rooms=>rooms.includes(d.room))+1;
 if(!roomChapter)return out;
 // Port Lucky's original v1 had no v/chapter, only suite or garage. Its
 // demoDone was NOT the eight-chapter ending; migrateSave clears done.
 const legacy=d.v===undefined;
 if(legacy && gameId==='port-lucky' && (roomChapter>2 || (d.chapter!==undefined && d.chapter!==roomChapter)))return out;
 const chapter=d.chapter===undefined?roomChapter:d.chapter;
 if(!Number.isInteger(chapter) || chapter<1 || chapter>m.chapters.length || chapter!==roomChapter)return out;
 if(d.done!==undefined && typeof d.done!=='boolean')return out;
 const done=!(legacy && gameId==='port-lucky') && d.done===true;
 if(done && (chapter!==m.chapters.length || d.room!==m.finalRoom))return out;
 const terminal=d.flags[m.terminal];if(terminal!==undefined && ![true,false,0,1].includes(terminal))return out;
 const completed=done?m.chapters.length:chapter===1 && flag(terminal)?1:chapter-1;
 return {...out,progress:`${completed} / ${m.chapters.length} scenes completed`};
}
// A request started before a newer auth/ownership read cannot publish later.
export function createCatalogueReader(commit){
 let sequence=0;
 return {invalidate(){sequence++;commit({user:null,entitlements:[],save_envelopes:{}});},async refresh(read){const ticket=++sequence;const state=await read();if(ticket!==sequence)return null;commit(state);return state;}};
}
