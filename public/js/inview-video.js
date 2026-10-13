// Case study videos play only while they are on screen. Any <video data-inview> pauses when it scrolls out of view
// and picks up again when it comes back, unless the visitor paused it themselves.
(function(){
  var vids=document.querySelectorAll('video[data-inview]');if(!vids.length||!('IntersectionObserver' in window))return;
  var io=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;
    if(e.isIntersecting&&e.intersectionRatio>=.5){if(v._auto){v._auto=false;v.play().catch(function(){})}}
    else if(!v.paused){v._auto=true;v._us=true;v.pause()}
  })},{threshold:[0,.5]});
  vids.forEach(function(v){
    v.addEventListener('pause',function(){if(v._us)v._us=false;else v._auto=false});
    v.addEventListener('play',function(){v._auto=false});
    io.observe(v);
  });
})();
