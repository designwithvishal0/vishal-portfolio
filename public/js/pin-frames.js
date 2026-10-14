/* Maps the .iph / .lap phone and laptop frames (Basil, Beauty PDP, CosIQ) onto the shared pin-screen.js markup,
   so their screens scroll fully before the page moves (Vishal 2026-10-14). Load it before /js/pin-screen.js.
   Frames inside a sideways carousel are left alone: sticky cannot pin inside a horizontal scroller. */
(()=>{
  const sideways=el=>{for(let p=el.parentElement;p&&p!==document.body;p=p.parentElement){const o=getComputedStyle(p).overflowX;if(o==='auto'||o==='scroll')return true}return false};
  document.querySelectorAll('.iph>.sc,.lap>.sc').forEach(s=>{
    const f=s.parentElement;if(f.closest('li')||sideways(f))return;
    let row=f.closest('figure');
    if(!row){row=document.createElement('div');f.before(row);row.append(f)}
    row.classList.add('screen');f.classList.add('pm');s.classList.add('pm-scr');
  });
})();
