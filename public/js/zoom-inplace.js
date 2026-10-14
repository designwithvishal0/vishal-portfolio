/* Vishal 2026-10-14 04:41, standing rule: any full screen view opens in the current tab, never a second tab.
   Links to a full size image (a.zoom-in) open it in a full screen viewer on top of the page; Esc, the Close button or a tap outside closes it. */
(()=>{
  const links=document.querySelectorAll('a.zoom-in');if(!links.length)return;
  const d=document.createElement('dialog');d.className='zv';d.setAttribute('aria-label','Full size image');
  d.innerHTML='<button type="button" class="zv-x">Close</button><div class="zv-s"><img alt=""></div>';
  const st=document.createElement('style');
  st.textContent='.zv{position:fixed;inset:0;width:100vw;height:100dvh;max-width:none;max-height:none;margin:0;padding:0;border:0;background:rgba(10,10,12,.94)}.zv::backdrop{background:rgba(10,10,12,.94)}.zv-s{height:100%;overflow:auto;overscroll-behavior:contain;display:flex;justify-content:center;padding:64px 16px 32px}.zv-s img{display:block;width:min(1600px,100%);height:auto;align-self:flex-start;border-radius:12px}.zv-x{position:fixed;top:16px;right:16px;z-index:1;height:40px;padding:0 18px;border:0;border-radius:999px;background:#F2F1EC;color:#0C0C0E;font:600 15px/1 inherit;cursor:pointer}.zv-x:focus-visible{outline:2px solid #fff;outline-offset:3px}';
  document.head.append(st);document.body.append(d);
  const img=d.querySelector('img');
  d.querySelector('.zv-x').onclick=()=>d.close();
  d.addEventListener('click',e=>{if(e.target===d||e.target.classList.contains('zv-s'))d.close()});
  links.forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const i=a.querySelector('img');img.src=a.getAttribute('href');img.alt=i?i.alt:'';d.showModal();d.querySelector('.zv-s').scrollTop=0}));
})();
