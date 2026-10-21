// Case study videos play only while they are on screen. Any <video data-inview> pauses when it scrolls out of view
// and picks up again when it comes back, unless the visitor paused it themselves.
(function(){
  var vids=document.querySelectorAll('video[data-inview]');if(!vids.length||!('IntersectionObserver' in window))return;
  var io=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;
    if(e.isIntersecting&&e.intersectionRatio>=.5){if(v._auto){v._auto=false;v.play().catch(function(er){if(er.name==='NotAllowedError'){v.muted=true;v.play().catch(function(){})}})}}
    else if(!v.paused){v._auto=true;v._us=true;v.pause()}
  })},{threshold:[0,.5]});
  vids.forEach(function(v){
    v.addEventListener('pause',function(){if(v._us)v._us=false;else v._auto=false});
    v.addEventListener('play',function(){v._auto=false});
    io.observe(v);
  });
  // Reduce motion switched on mid page (menu switch or device setting): stop every video and show its cover again,
  // not the frame it stopped on. Play still works after that (Vishal 2026-10-13)
  var r=document.documentElement,os=matchMedia('(prefers-reduced-motion: reduce)');
  var still=function(){if(!os.matches&&!r.classList.contains('calm'))return;vids.forEach(function(v){v._auto=false;if(!v.paused||v.currentTime>0){v._us=true;v.pause();v.load()}})};
  var sw=document.getElementById('calm');if(sw)sw.addEventListener('click',function(){setTimeout(still)});
  os.addEventListener('change',still);
})();
