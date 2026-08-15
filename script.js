/* ==========================================================
   DIVINE TATTOO — behavior
   ========================================================== */
(function(){
  "use strict";

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- header visibility on scroll ---------- */
  var header = document.getElementById('siteHeader');
  var SHOW_AFTER = 120; // px scrolled before the floating header fades in
  function onScroll(){
    if(window.scrollY > SHOW_AFTER){ header.classList.add('is-visible'); }
    else{ header.classList.remove('is-visible'); }
  }
  document.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  /* ---------- mobile nav ---------- */
  var hamburger = document.getElementById('hamburger');
  var mainNav = document.getElementById('mainNav');
  hamburger.addEventListener('click', function(){
    var open = mainNav.classList.toggle('is-open');
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  mainNav.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      mainNav.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- portfolio filters ---------- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var portfolioItems = document.querySelectorAll('.portfolio-item');
  filterBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      filterBtns.forEach(function(b){ b.classList.remove('is-active'); b.setAttribute('aria-selected','false'); });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected','true');
      var filter = btn.getAttribute('data-filter');
      portfolioItems.forEach(function(item){
        var match = filter === 'all' || item.getAttribute('data-category') === filter;
        item.classList.toggle('is-hidden', !match);
      });
    });
  });

  /* ---------- reviews carousel (native touch/scroll + button nudge) ---------- */
  var reviewsTrack = document.getElementById('reviewsTrack');
  var revPrev = document.getElementById('revPrev');
  var revNext = document.getElementById('revNext');
  if(reviewsTrack && revPrev && revNext){
    function scrollByCard(dir){
      var card = reviewsTrack.querySelector('.review-card');
      var step = card ? (card.getBoundingClientRect().width + 20) : 320;
      reviewsTrack.scrollBy({ left: dir * step, behavior: reducedMotion ? 'auto' : 'smooth' });
    }
    revPrev.addEventListener('click', function(){ scrollByCard(-1); });
    revNext.addEventListener('click', function(){ scrollByCard(1); });
  }

  /* ---------- consultation form — submits to FormSubmit.co, emails Masanka420@gmail.com ---------- */
  var form = document.getElementById('consultForm');
  var note = document.getElementById('formNote');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var submitBtn = form.querySelector('button[type="submit"]');
    var formData = new FormData(form);

    note.textContent = 'Sending...';
    submitBtn.disabled = true;

    fetch('https://formsubmit.co/ajax/Masanka420@gmail.com', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData
    })
    .then(function(res){ return res.ok ? res.json() : Promise.reject(res); })
    .then(function(){
      note.textContent = 'Thank you — we\'ll be in touch shortly to confirm your consultation.';
      form.reset();
    })
    .catch(function(){
      note.textContent = 'Something went wrong sending that. Please WhatsApp us instead — link above.';
    })
    .finally(function(){
      submitBtn.disabled = false;
    });
  });

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if(reducedMotion || !('IntersectionObserver' in window)){
    revealEls.forEach(function(el){ el.classList.add('in-view'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.12, rootMargin:'0px 0px -40px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  }

  /* ---------- ambient cursor-tracking spotlight (desktop only) ---------- */
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var spotlight = document.querySelector('.ambient-spotlight');
  if(canHover && spotlight && !reducedMotion){
    var OFFSCREEN = -600;
    var targetX = OFFSCREEN, targetY = OFFSCREEN;
    var curX = OFFSCREEN, curY = OFFSCREEN;

    window.addEventListener('mousemove', function(e){
      targetX = e.clientX;
      targetY = e.clientY;
    }, { passive:true });

    window.addEventListener('mouseleave', function(){
      targetX = OFFSCREEN;
      targetY = OFFSCREEN;
    });

    (function loop(){
      curX += (targetX - curX) * 0.14;
      curY += (targetY - curY) * 0.14;
      spotlight.style.setProperty('--mx', curX.toFixed(1) + 'px');
      spotlight.style.setProperty('--my', curY.toFixed(1) + 'px');
      requestAnimationFrame(loop);
    })();
  }

})();
