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

  /* ---------- portfolio: auto-loads assets/portfolio/1.jpg, 2.jpg, 3.jpg... ----------
     To add or update portfolio photos: just drop numbered files (1.jpg, 2.jpg, 3.jpg...)
     into the assets/portfolio/ folder and push to GitHub — no code changes needed.
     Shows the first 8 by default; "View All Work" reveals the rest, if any exist. */
  (function(){
    var PORTFOLIO_MAX_CHECK = 60;   // highest number it will look for
    var PORTFOLIO_PREVIEW_COUNT = 8; // how many show before "View All Work"
    var grid = document.getElementById('portfolioGrid');
    var viewAllBtn = document.getElementById('portfolioViewAll');
    if(!grid || !viewAllBtn) return;

    var checks = [];
    for(var i = 1; i <= PORTFOLIO_MAX_CHECK; i++){
      checks.push(new Promise(function(resolve){
        var n = i;
        var img = new Image();
        img.onload = function(){ resolve(n); };
        img.onerror = function(){ resolve(null); };
        img.src = 'assets/portfolio/' + n + '.jpg';
      }));
    }

    Promise.all(checks).then(function(results){
      var found = results.filter(function(n){ return n !== null; }).sort(function(a,b){ return a-b; });
      if(found.length === 0) return; // no real photos uploaded yet — keep placeholder cards as-is

      grid.innerHTML = '';
      found.forEach(function(n, idx){
        var article = document.createElement('article');
        article.className = 'portfolio-item reveal in-view';
        if(idx >= PORTFOLIO_PREVIEW_COUNT) article.classList.add('is-hidden');
        article.innerHTML =
          '<div class="framed"><img class="portfolio-photo" src="assets/portfolio/' + n + '.jpg" alt="Divine Tattoo portfolio piece" loading="lazy">' +
          '<span class="corner c-tl"></span><span class="corner c-br"></span></div>';
        grid.appendChild(article);
      });

      if(found.length > PORTFOLIO_PREVIEW_COUNT){
        document.getElementById('portfolioMoreWrap').style.display = '';
        viewAllBtn.addEventListener('click', function(){
          grid.querySelectorAll('.portfolio-item.is-hidden').forEach(function(item){
            item.classList.remove('is-hidden');
          });
          viewAllBtn.style.display = 'none';
        });
      }
    });
  })();

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
