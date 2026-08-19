/* ==========================================================
   DIVINE TATTOO — behavior
   ========================================================== */
(function(){
  "use strict";

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- gold-frame lightbox: click a photo to view it enlarged ---------- */
  function initLightbox(root){
    (root || document).querySelectorAll('.gold-frame').forEach(function(frame){
      var img = frame.querySelector('img');
      if(!img || frame.dataset.lightboxBound) return;
      frame.dataset.lightboxBound = 'true';
      frame.addEventListener('click', function(){
        var overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';
        var boxFrame = document.createElement('div');
        boxFrame.className = 'gold-frame';
        var bigImg = document.createElement('img');
        bigImg.src = img.currentSrc || img.src;
        bigImg.alt = img.alt;
        boxFrame.appendChild(bigImg);
        var closeBtn = document.createElement('button');
        closeBtn.className = 'lightbox-close';
        closeBtn.setAttribute('aria-label', 'Close');
        closeBtn.innerHTML = '&times;';
        overlay.appendChild(boxFrame);
        overlay.appendChild(closeBtn);
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(function(){ overlay.classList.add('is-open'); });

        function close(){
          overlay.classList.remove('is-open');
          document.body.style.overflow = '';
          setTimeout(function(){ overlay.remove(); }, 300);
          document.removeEventListener('keydown', onKey);
        }
        function onKey(e){ if(e.key === 'Escape') close(); }
        overlay.addEventListener('click', function(e){ if(e.target === overlay) close(); });
        closeBtn.addEventListener('click', close);
        document.addEventListener('keydown', onKey);
      });
    });
  }
  initLightbox(document);

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
  hamburger.addEventListener('click', function(e){
    e.stopPropagation();
    var open = mainNav.classList.toggle('is-open');
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  mainNav.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      mainNav.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
  // click anywhere outside the open menu closes it
  document.addEventListener('click', function(e){
    if(mainNav.classList.contains('is-open') && !mainNav.contains(e.target) && e.target !== hamburger){
      mainNav.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && mainNav.classList.contains('is-open')){
      mainNav.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
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
          '<div class="gold-frame"><img class="portfolio-photo" src="assets/portfolio/' + n + '.jpg" alt="Divine Tattoo portfolio piece" loading="lazy"></div>';
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
      initLightbox(grid);
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

  /* ---------- hero stat animations: count-up numbers + letter-scramble ---------- */
  function animateCountUp(el){
    var target = parseInt(el.dataset.target, 10) || 0;
    var suffix = el.dataset.suffix || '';
    if(reducedMotion){ el.textContent = target + suffix; return; }
    var duration = 1400;
    var startTime = null;
    function tick(now){
      if(startTime === null) startTime = now;
      var progress = Math.min((now - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if(progress < 1){ requestAnimationFrame(tick); }
    }
    requestAnimationFrame(tick);
  }

  var SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function animateScramble(el){
    var final = el.dataset.final || el.textContent;
    if(reducedMotion){ el.textContent = final; return; }
    var duration = 900;
    var startTime = null;
    function tick(now){
      if(startTime === null) startTime = now;
      var progress = Math.min((now - startTime) / duration, 1);
      var revealCount = Math.floor(progress * final.length);
      var out = '';
      for(var i = 0; i < final.length; i++){
        if(final[i] === ' '){ out += ' '; }
        else if(i < revealCount){ out += final[i]; }
        else{ out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]; }
      }
      el.textContent = out;
      if(progress < 1){ requestAnimationFrame(tick); }
      else{ el.textContent = final; }
    }
    requestAnimationFrame(tick);
  }

  var statEls = document.querySelectorAll('.count-up, .scramble-text');
  if(statEls.length){
    if(!('IntersectionObserver' in window)){
      statEls.forEach(function(el){
        el.classList.contains('count-up') ? animateCountUp(el) : animateScramble(el);
      });
    } else {
      var statIO = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            var el = entry.target;
            el.classList.contains('count-up') ? animateCountUp(el) : animateScramble(el);
            statIO.unobserve(el);
          }
        });
      }, { threshold:0.5 });
      statEls.forEach(function(el){ statIO.observe(el); });
    }
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
