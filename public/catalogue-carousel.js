// Scoped, focus-stable catalogue carousel. Manual navigation stays paused.
export function createCarousel(root,{interval=8000,onSelect=()=>{},blocked=()=>false}={}){
 const slides=[...root.querySelectorAll('[data-slide]')],dots=[...root.querySelectorAll('[data-dot]')],status=root.querySelector('[data-position]'),toggle=root.querySelector('[data-cycle]');
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 let index=0,manual=false,hover=false,focused=false,timer=null,pointer=null;
 function canCycle(){return !manual && !media.matches && !hover && !focused && !document.hidden && !blocked();}
 function sync(){clearTimeout(timer);timer=null;toggle.textContent=manual || media.matches?'Play':'Pause';toggle.setAttribute('aria-label',media.matches?'Automatic cycling disabled: reduced motion':manual?'Play automatic carousel':'Pause automatic carousel');toggle.disabled=media.matches;if(canCycle())timer=setTimeout(()=>{if(canCycle())select((index+1)%slides.length,false);else sync();},interval);}
 function select(next,interaction=true){index=(next+slides.length)%slides.length;if(interaction)manual=true;slides.forEach((s,i)=>{s.hidden=i!==index;s.inert=i!==index;});dots.forEach((d,i)=>{d.setAttribute('aria-current',i===index?'true':'false');});status.textContent=`${index+1} / ${slides.length}`;onSelect(slides[index].dataset.slide);sync();}
 root.querySelector('[data-prev]').onclick=()=>select(index-1);
 root.querySelector('[data-next]').onclick=()=>select(index+1);
 dots.forEach((d,i)=>d.onclick=()=>select(i));
 toggle.onclick=()=>{manual=!manual;sync();};
 const enter=()=>{hover=true;sync();},leave=()=>{hover=false;sync();},focus=()=>{focused=true;sync();},blur=()=>{queueMicrotask(()=>{focused=root.contains(document.activeElement);sync();});};
 root.addEventListener('mouseenter',enter);root.addEventListener('mouseleave',leave);root.addEventListener('focusin',focus);root.addEventListener('focusout',blur);
 root.addEventListener('keydown',e=>{if(e.altKey || e.ctrlKey || e.metaKey || (e.target!==root && !e.target.closest('.carousel-controls')))return;if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();select(e.key==='Home'?0:e.key==='End'?slides.length-1:index+(e.key==='ArrowRight'?1:-1));}});
 root.addEventListener('pointerdown',e=>{if(e.target.closest('[data-cycle]'))return;manual=true;pointer={x:e.clientX,y:e.clientY,id:e.pointerId};sync();});
 root.addEventListener('pointerup',e=>{if(!pointer || pointer.id!==e.pointerId)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer=null;if(Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)*1.5)select(index+(dx<0?1:-1));});
 root.addEventListener('pointercancel',()=>{pointer=null;});
 document.addEventListener('visibilitychange',sync);media.addEventListener('change',sync);
 select(0,false);
 return {selectGame(id){const n=slides.findIndex(s=>s.dataset.slide===id);if(n>=0)select(n);},pause(){manual=true;sync();},sync,get selected(){return slides[index].dataset.slide;}};
}
