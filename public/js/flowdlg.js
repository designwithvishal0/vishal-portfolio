/* Full screen viewer, one for the whole site: the same in-page dialog as Split's user flow (.flowdlg, commit ddee5d5).
   Vishal 2026-10-14 04:41: full screen opens on the page, in the current tab, never a second tab.
   Vishal 2026-10-15 14:53: every image in a case study gets a Full screen icon.
   Loading this file gives every content image on the page (alt text set, outside More work and the closing) a Full screen
   control: a round icon on desktop, a "Full screen" pill on phones, as on Split. Links with class zoom-in open here too.
   Close button or Esc closes; double click or double tap zooms. */
(()=>{
  const ico='<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>';
  const imgs=[...document.querySelectorAll('main img[alt]:not([alt=""]), article img[alt]:not([alt=""]), .wrap img[alt]:not([alt=""])')]
    .filter((i,n,a)=>a.indexOf(i)===n&&!i.closest('header,nav,footer,.endsec,.nextgrid,.protowait,.pwait,dialog,a:not(.zoom-in),button'));
  const links=document.querySelectorAll('a.zoom-in');
  if(!imgs.length&&!links.length)return;
  const st=document.createElement('style');
  st.textContent=`.flowdlg{position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:0;border:0;background:#0D0F17}
.flowdlg::backdrop{background:#0D0F17}
.flowpan{position:absolute;inset:0;overflow:auto;-webkit-overflow-scrolling:touch;touch-action:pan-x pan-y pinch-zoom;display:grid;place-items:center}
.flowpan img{display:block;width:100%;height:auto;max-width:none;transition:width .2s ease}
.flowdlg.zoom .flowpan{place-items:start}.flowdlg.zoom .flowpan img{width:260%}
.flowx{position:fixed;top:max(12px,env(safe-area-inset-top));right:12px;z-index:2;width:44px;height:44px;display:grid;place-items:center;border:0;border-radius:50%;background:rgba(13,15,23,.86);color:#F2F1EC;box-shadow:0 0 0 1px rgba(255,255,255,.18);cursor:pointer}
.flowhint{position:fixed;left:50%;transform:translateX(-50%);bottom:max(14px,env(safe-area-inset-bottom));margin:0;padding:9px 14px;border-radius:999px;background:rgba(13,15,23,.86);color:#F2F1EC;font:500 13px/1 system-ui,sans-serif;white-space:nowrap;pointer-events:none}
.flowdlg.tall .flowpan{place-items:start center}
.flowdlg.tall .flowpan img{width:min(480px,100%)}
.flowdlg.tall.zoom .flowpan img{width:min(960px,200%)}
.flowdlg.tall.page .flowpan img{width:min(1200px,100%)}
.flowdlg.tall.page.zoom .flowpan img{width:min(2400px,200%)}
.fsb,.zoom-in .zi{position:absolute;right:12px;top:12px;z-index:3;width:36px;height:36px;padding:0;border:0;border-radius:50%;display:grid;place-items:center;background:rgba(18,20,26,.72);color:#fff;box-shadow:0 0 0 1px rgba(255,255,255,.18);cursor:pointer;font:500 13px/1 system-ui,sans-serif}
.fsb,.fsb .lb{font:500 13px/1 system-ui,sans-serif!important;letter-spacing:0!important;color:#F2F1EC!important;opacity:1!important}
.fsb{box-shadow:0 0 0 1px rgba(255,255,255,.32),0 6px 18px rgba(0,0,0,.3)!important}
.fsb .lb{display:none}
.fsb:hover,.fsb:focus-visible{background:rgba(18,20,26,.9)}
@media (max-width:900px){.fsb{width:auto;height:auto;padding:9px 12px;gap:6px;display:inline-flex;align-items:center;border-radius:999px;background:rgba(13,15,23,.86);color:#F2F1EC;right:10px;top:10px}.fsb .lb{display:inline}}
a.zoom-in{position:relative;display:block}
/* tap area is 44px even though the control looks smaller */
.fsb::after{content:"";position:absolute;inset:-5px;border-radius:inherit}
.fsb.sm{width:32px;height:32px;padding:0;justify-content:center}.fsb.sm .lb{display:none!important}.fsb.sm::after{inset:-6px}
/* on a phone or laptop frame the control sits at the bottom corner, clear of the status bar and camera */
.iph>.fsb,.lap>.fsb,.pm>.fsb,.screen>.fsb{top:auto;bottom:14px;right:14px}
/* Vishal 2026-10-19: on phones a framed screen gets only the small round icon, so no pill sits over the screen */
@media (max-width:759px){.iph>.fsb,.lap>.fsb,.pm>.fsb,.screen>.fsb{width:32px;height:32px;padding:0;justify-content:center}.iph>.fsb .lb,.lap>.fsb .lb,.pm>.fsb .lb,.screen>.fsb .lb{display:none!important}.iph>.fsb::after,.lap>.fsb::after,.pm>.fsb::after,.screen>.fsb::after{inset:-6px}}`;
  document.head.append(st);
  const d=document.createElement('dialog');d.className='flowdlg';d.setAttribute('aria-label','Full screen');
  d.innerHTML='<button type="button" class="flowx" aria-label="Close full screen"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button><div class="flowpan"><img alt=""></div><p class="flowhint"></p>';
  document.body.append(d);
  const pan=d.querySelector('.flowpan'),di=pan.querySelector('img'),hint=d.querySelector('.flowhint'),fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  const show=(src,alt,w,h)=>{di.src=src;di.alt=alt;di.width=w;di.height=h;d.classList.toggle('tall',h>w*1.3);d.classList.toggle('page',w>=1200);hint.textContent=fine?'Double click to zoom, Esc to close':'Pinch or double tap to zoom'};
  const open=e=>{if(e){e.preventDefault();e.stopPropagation()}d.classList.remove('zoom');d.showModal();pan.scrollTop=0;document.documentElement.style.overflow='hidden'};
  const dims=i=>[+i.getAttribute('width')||i.naturalWidth||1600,+i.getAttribute('height')||i.naturalHeight||1000];
  links.forEach(z=>{z.removeAttribute('target');if(!z.querySelector('.zi'))z.insertAdjacentHTML('beforeend','<span class="zi" aria-hidden="true">'+ico+'</span>');z.addEventListener('click',e=>{const i=z.querySelector('img');const[w,h]=i?dims(i):[1600,1000];show(z.getAttribute('href'),i?i.alt:'',w,h);open(e)})});
  const done=new Set();
  imgs.forEach(i=>{if(i.closest('a.zoom-in'))return;
    /* screens that scroll inside a phone or laptop frame: the control sits on the frame, not on the moving screen */
    let host=i.closest('.sc')?.parentElement||i.parentElement;
    /* several pictures side by side in one box (a gallery): each gets its own wrapper so each gets its own control */
    if(!i.closest('.sc')&&host.querySelectorAll(':scope>img').length>1){const w=document.createElement('span');w.style.cssText='position:relative;display:block';i.before(w);w.append(i);host=w}
    if(done.has(host))return;done.add(host);
    const framed=!!i.closest('.sc');
    /* a box that scrolls sideways (a wide user flow on phones): the control sits on the box's parent so it stays put */
    let anchor=i;const sc=s=>/(auto|scroll)/.test(getComputedStyle(s).overflowX+getComputedStyle(s).overflowY);
    if(!framed&&sc(host)){anchor=host;host=host.parentElement}
    if(getComputedStyle(host).position==='static')host.style.position='relative';
    const b=document.createElement('button');b.type='button';b.className='fsb';b.setAttribute('aria-label','Open full screen: '+i.alt.slice(0,80));
    b.innerHTML=ico+'<span class="lb">Full screen</span>';
    b.addEventListener('click',e=>{const[w,h]=dims(i);show(i.currentSrc||i.src,i.alt,w,h);open(e)});host.append(b);
    /* Audit 2026-10-15: pin the control to the picture's own top right corner, not the card's, so it never sits on card text;
       on pictures narrower than 160px only the round icon shows */
    if(framed)return;
    const place=()=>{const a=anchor.getBoundingClientRect(),c=host.getBoundingClientRect();if(!a.width)return;
      b.classList.toggle('sm',a.width<160);
      b.style.top=(a.top-c.top+host.scrollTop+(a.width<160?6:10))+'px';b.style.right=(c.right-a.right+(a.width<160?6:10))+'px'};
    place();new ResizeObserver(place).observe(host);i.addEventListener('load',place);addEventListener('load',place);addEventListener('resize',place)});
  d.addEventListener('close',()=>{document.documentElement.style.overflow=''});d.querySelector('.flowx').onclick=()=>d.close();
  let t=0;pan.addEventListener('click',e=>{const n=Date.now();if(n-t<320){const r=pan.getBoundingClientRect(),fx=(e.clientX-r.left+pan.scrollLeft)/pan.scrollWidth,fy=(e.clientY-r.top+pan.scrollTop)/pan.scrollHeight;d.classList.toggle('zoom');pan.scrollLeft=fx*pan.scrollWidth-r.width/2;pan.scrollTop=fy*pan.scrollHeight-r.height/2;t=0}else t=n});
  pan.addEventListener('dblclick',e=>e.preventDefault());
})();
