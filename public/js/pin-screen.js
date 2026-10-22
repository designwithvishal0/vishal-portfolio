/* Pinned phone screens (Vishal 2026-10-14): when a screen row fits in the window, the row holds still
   and the page scroll moves the phone screen inside its frame. Once the screen reaches its end, the page carries on.
   Rows taller than the window, and single screen mockups (.pm.one), keep the normal scroll inside the frame.
   Works on any page that uses the .screen > .pm > .pm-scr mockup markup. */
(()=>{
  const rows=[...document.querySelectorAll('.screen')].filter(r=>r.querySelector('.pm:not(.one) .pm-scr'));
  if(!rows.length)return;
  const items=rows.map(r=>{const w=document.createElement('div');w.className='pin-wrap';r.before(w);w.append(r);return{r,w,s:r.querySelector('.pm-scr'),d:0,top:0,on:false}});
  const headH=()=>{const h=document.querySelector('header.bar');return h?Math.max(0,Math.min(h.getBoundingClientRect().bottom,120)):64};
  const layout=()=>{
    const vh=innerHeight,hh=headH();
    for(const it of items){
      const {r,w,s}=it;
      r.style.position='';r.style.top='';w.style.height='';s.style.overflow='';
      const rh=r.offsetHeight,d=s.scrollHeight-s.clientHeight;
      it.on=d>8&&rh<=vh-hh-24;
      if(!it.on)continue;
      it.d=d;it.top=Math.max(hh+12,Math.round((vh-rh+hh)/2));
      w.style.height=(rh+d)+'px';r.style.position='sticky';r.style.top=it.top+'px';s.style.overflow='hidden';
    }
    tick();
  };
  const tick=()=>{for(const it of items){if(!it.on)continue;const p=it.top-it.w.getBoundingClientRect().top;it.s.scrollTop=Math.max(0,Math.min(it.d,p))}};
  let q=0;addEventListener('scroll',()=>{if(!q){q=requestAnimationFrame(()=>{q=0;tick()})}},{passive:true});
  let t,vw=innerWidth,vh0=innerHeight;
  addEventListener('resize',()=>{if(innerWidth===vw&&Math.abs(innerHeight-vh0)<120)return;vw=innerWidth;vh0=innerHeight;clearTimeout(t);t=setTimeout(layout,150)});
  items.forEach(it=>it.s.querySelectorAll('img').forEach(i=>{i.loading='eager';if(!i.complete)i.addEventListener('load',layout,{once:true})}));
  layout();addEventListener('load',layout);
})();
