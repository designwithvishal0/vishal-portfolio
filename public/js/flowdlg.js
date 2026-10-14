/* Vishal 2026-10-14 04:41, standing rule: any full screen view opens in the current tab, never a second tab.
   The same full screen dialog as Split's user flow (.flowdlg, commit ddee5d5), shared so the site has one viewer:
   links with class zoom-in open their image here. Close button or Esc closes; double click or double tap zooms. */
(()=>{
  const links=document.querySelectorAll('a.zoom-in');if(!links.length)return;
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
.flowdlg.tall.page.zoom .flowpan img{width:min(2400px,200%)}`;
  document.head.append(st);
  const d=document.createElement('dialog');d.className='flowdlg';d.setAttribute('aria-label','Full screen');
  d.innerHTML='<button type="button" class="flowx" aria-label="Close full screen"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button><div class="flowpan"><img alt=""></div><p class="flowhint"></p>';
  document.body.append(d);
  const pan=d.querySelector('.flowpan'),di=pan.querySelector('img'),hint=d.querySelector('.flowhint'),fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  const show=(src,alt,w,h)=>{di.src=src;di.alt=alt;di.width=w;di.height=h;d.classList.toggle('tall',h>w*1.3);d.classList.toggle('page',w>=1200);hint.textContent=fine?'Double click to zoom, Esc to close':'Pinch or double tap to zoom'};
  const open=e=>{if(e)e.preventDefault();d.classList.remove('zoom');d.showModal();pan.scrollTop=0;document.documentElement.style.overflow='hidden'};
  links.forEach(z=>{z.removeAttribute('target');z.addEventListener('click',e=>{const i=z.querySelector('img');show(z.getAttribute('href'),i?i.alt:'',+(i&&i.getAttribute('width'))||1600,+(i&&i.getAttribute('height'))||1000);open(e)})});
  d.addEventListener('close',()=>{document.documentElement.style.overflow=''});d.querySelector('.flowx').onclick=()=>d.close();
  let t=0;pan.addEventListener('click',e=>{const n=Date.now();if(n-t<320){const r=pan.getBoundingClientRect(),fx=(e.clientX-r.left+pan.scrollLeft)/pan.scrollWidth,fy=(e.clientY-r.top+pan.scrollTop)/pan.scrollHeight;d.classList.toggle('zoom');pan.scrollLeft=fx*pan.scrollWidth-r.width/2;pan.scrollTop=fy*pan.scrollHeight-r.height/2;t=0}else t=n});
  pan.addEventListener('dblclick',e=>e.preventDefault());
})();
