/* Phones only (Vishal 21 Oct, his yes): the home page's Book a call + Resume bar on case studies.
   Shows once the hero is passed, steps aside for the closing (it has its own buttons), over phone screens and while the Contents sheet is open. */
(()=>{
  if(!matchMedia('(max-width:759px)').matches)return;
  const b=document.createElement('nav');b.className='csbar';b.setAttribute('aria-label','Get in touch');
  b.innerHTML='<a class="cb p" href="https://cal.com/designwvishal" target="_blank" rel="noopener">Book a call</a><a class="cb" href="/Vishal_Yadav_Resume.pdf" target="_blank" rel="noopener">Resume</a>';
  document.body.append(b);
  const hero=document.querySelector('header.hero'),end=document.querySelector('.endsec,footer.closing'),sheet=document.getElementById('tocsheet');
  let past=false,atEnd=false;
  /* never over a phone screen: steps aside while a framed screen reaches the bottom of the window, like the chapter bar */
  const frames=[...document.querySelectorAll('.iph,.pframe,.lap,.shot.phone,.pm')];
  const overFrame=()=>{const h=innerHeight;return frames.some(e=>{const r=e.getBoundingClientRect();return r.width&&r.top<h-8&&r.bottom>h-90})};
  const set=()=>b.classList.toggle('on',past&&!atEnd&&!overFrame()&&!(sheet&&sheet.matches(':popover-open')));
  let q=0;addEventListener('scroll',()=>{if(!q)q=requestAnimationFrame(()=>{q=0;set()})},{passive:true});
  if(hero)new IntersectionObserver(([e])=>{past=!e.isIntersecting&&e.boundingClientRect.top<0;set()}).observe(hero);else past=true;
  if(end)new IntersectionObserver(([e])=>{atEnd=e.isIntersecting;set()}).observe(end);
  if(sheet)sheet.addEventListener('toggle',set);
  set();
})();
