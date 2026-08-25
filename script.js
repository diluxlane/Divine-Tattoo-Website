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

        requestAnimationFrame(function(){
          overlay.classList.add('is-open');
        });

        function close(){
          overlay.classList.remove('is-open');
          document.body.style.overflow = '';

          setTimeout(function(){
            overlay.remove();
          }, 300);

          document.removeEventListener('keydown', onKey);
        }

        function onKey(e){
          if(e.key === 'Escape') close();
        }

        overlay.addEventListener('click', function(e){
          if(e.target === overlay) close();
        });

        closeBtn.addEventListener('click', close);

        document.addEventListener('keydown', onKey);
      });
    });
  }

  initLightbox(document);


  /* ---------- header visibility on scroll ---------- */
  var header = document.getElementById('siteHeader');
  var SHOW_AFTER = 120;

  function onScroll(){
    if(window.scrollY > SHOW_AFTER){
      header.classList.add('is-visible');
    } else {
      header.classList.remove('is-visible');
    }
  }

  document.addEventListener('scroll', onScroll, { passive:true });
  onScroll();


  /* ---------- mobile nav ---------- */
  var hamburger = document.getElementById('hamburger');
  var mainNav = document.getElementById('mainNav');

  hamburger.addEventListener('click', function(e){
    e.stopPropagation();

    var open =
      mainNav.classList.toggle('is-open');

    hamburger.setAttribute(
      'aria-expanded',
      open ? 'true' : 'false'
    );
  });

  mainNav.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      mainNav.classList.remove('is-open');

      hamburger.setAttribute(
        'aria-expanded',
        'false'
      );
    });
  });

  document.addEventListener('click', function(e){
    if(
      mainNav.classList.contains('is-open') &&
      !mainNav.contains(e.target) &&
      e.target !== hamburger
    ){
      mainNav.classList.remove('is-open');

      hamburger.setAttribute(
        'aria-expanded',
        'false'
      );
    }
  });

  document.addEventListener('keydown', function(e){
    if(
      e.key === 'Escape' &&
      mainNav.classList.contains('is-open')
    ){
      mainNav.classList.remove('is-open');

      hamburger.setAttribute(
        'aria-expanded',
        'false'
      );
    }
  });


  /* ---------- scroll reveal ---------- */
  var revealSupported =
    !reducedMotion &&
    ('IntersectionObserver' in window);

  var revealIO =
    revealSupported
      ? new IntersectionObserver(function(entries){
          entries.forEach(function(entry){
            if(entry.isIntersecting){
              entry.target.classList.add('in-view');
              revealIO.unobserve(entry.target);
            }
          });
        }, {
          threshold:0.12,
          rootMargin:'0px 0px -40px 0px'
        })
      : null;

  function observeReveal(el){
    if(!revealSupported){
      el.classList.add('in-view');
      return;
    }

    revealIO.observe(el);
  }

  document
    .querySelectorAll('.reveal')
    .forEach(observeReveal);


  /* ==========================================================
     PORTFOLIO
     
     NEW:
     1. Try Supabase first.
     2. Only display published records.
     3. Respect display_order.
     4. Use public Storage URLs.
     5. If Supabase fails or has no published images,
        use the existing numbered GitHub portfolio.
     
     NOTHING ELSE ON THE WEBSITE IS CHANGED.
     ========================================================== */

  (function(){

    var PORTFOLIO_MAX_CHECK = 60;
    var PORTFOLIO_PREVIEW_COUNT = 8;

    var grid =
      document.getElementById('portfolioGrid');

    var viewAllBtn =
      document.getElementById('portfolioViewAll');

    if(!grid || !viewAllBtn) return;


    /* --------------------------------------------------------
       EXISTING GITHUB FALLBACK
       -------------------------------------------------------- */

    function loadGitHubPortfolio(){

      var checks = [];

      for(
        var i = 1;
        i <= PORTFOLIO_MAX_CHECK;
        i++
      ){

        checks.push(
          new Promise(function(resolve){

            var n = i;

            var img =
              new Image();

            img.onload =
              function(){
                resolve(n);
              };

            img.onerror =
              function(){
                resolve(null);
              };

            img.src =
              'assets/portfolio/' +
              n +
              '.jpg';
          })
        );
      }


      Promise.all(checks)
        .then(function(results){

          var found =
            results
              .filter(function(n){
                return n !== null;
              })
              .sort(function(a,b){
                return a - b;
              });


          if(found.length === 0){
            return;
          }


          renderPortfolioImages(
            found.map(function(n){
              return {
                url:
                  'assets/portfolio/' +
                  n +
                  '.jpg'
              };
            })
          );

        })
        .catch(function(error){

          console.error(
            'GitHub portfolio fallback error:',
            error
          );

        });
    }


    /* --------------------------------------------------------
       RENDER PORTFOLIO
       -------------------------------------------------------- */

    function renderPortfolioImages(items){

      if(!items || items.length === 0){
        return;
      }


      grid.innerHTML = '';


      items.forEach(function(item, idx){

        var article =
          document.createElement('article');

        article.className =
          'portfolio-item reveal';


        if(
          idx >= PORTFOLIO_PREVIEW_COUNT
        ){
          article.classList.add(
            'is-hidden'
          );
        }


        var frame =
          document.createElement('div');

        frame.className =
          'gold-frame';


        var img =
          document.createElement('img');

        img.className =
          'portfolio-photo';

        img.src =
          item.url;

        img.alt =
          'Divine Tattoo portfolio piece';

        img.loading =
          'lazy';


        frame.appendChild(img);
        article.appendChild(frame);

        grid.appendChild(article);

        observeReveal(article);
      });


      var moreWrap =
        document.getElementById(
          'portfolioMoreWrap'
        );


      if(
        items.length >
        PORTFOLIO_PREVIEW_COUNT
      ){

        if(moreWrap){
          moreWrap.style.display = '';
        }


        viewAllBtn.onclick =
          function(){

            grid
              .querySelectorAll(
                '.portfolio-item.is-hidden'
              )
              .forEach(function(item){

                item.classList.remove(
                  'is-hidden'
                );

              });


            viewAllBtn.style.display =
              'none';
          };

      } else {

        if(moreWrap){
          moreWrap.style.display =
            'none';
        }

        viewAllBtn.style.display =
          'none';
      }


      initLightbox(grid);
    }


    /* --------------------------------------------------------
       SUPABASE PORTFOLIO
       -------------------------------------------------------- */

    async function loadSupabasePortfolio(){

      try{

        var supabaseModule =
          await import(
            'https://esm.sh/@supabase/supabase-js@2'
          );


        var createClient =
          supabaseModule.createClient;


        var SUPABASE_URL =
          'https://igjsnwpcyjgjjhpmpkvi.supabase.co';


        var SUPABASE_PUBLISHABLE_KEY =
          'sb_publishable_NJdvsjVqLBXDkRyJhKp-WA_-M-w0UEX';


        var supabase =
          createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
          );


        var result =
          await supabase
            .from('portfolio')
            .select(
              'idid, image_path, published, display_order'
            )
            .eq(
              'published',
              true
            )
            .order(
              'display_order',
              {
                ascending:true
              }
            );


        if(result.error){

          console.error(
            'Supabase portfolio error:',
            result.error
          );

          return false;
        }


        var data =
          result.data || [];


        /*
         * If there are no published Supabase
         * images yet, use the old GitHub
         * portfolio instead.
         */

        if(data.length === 0){
          return false;
        }


        var items =
          data
            .filter(function(item){
              return (
                item.image_path &&
                item.published === true
              );
            })
            .map(function(item){

              var publicUrl =
                supabase.storage
                  .from('portfolio')
                  .getPublicUrl(
                    item.image_path
                  );


              return {
                id:
                  item.idid,

                url:
                  publicUrl.data.publicUrl,

                display_order:
                  item.display_order
              };

            });


        if(items.length === 0){
          return false;
        }


        /*
         * Supabase is now the live source.
         */

        renderPortfolioImages(
          items
        );


        return true;

      } catch(error){

        console.error(
          'Supabase portfolio loading failed:',
          error
        );

        return false;
      }
    }


    /* --------------------------------------------------------
       START PORTFOLIO LOADING
       -------------------------------------------------------- */

    loadSupabasePortfolio()
      .then(function(success){

        /*
         * If Supabase worked, stop here.
         *
         * If Supabase failed or has no published
         * records, safely use the existing GitHub
         * numbered portfolio.
         */

        if(!success){
          loadGitHubPortfolio();
        }

      });

  })();


  /* ---------- reviews carousel ---------- */
  var reviewsTrack =
    document.getElementById('reviewsTrack');

  var revPrev =
    document.getElementById('revPrev');

  var revNext =
    document.getElementById('revNext');

  if(
    reviewsTrack &&
    revPrev &&
    revNext
  ){

    function scrollByCard(dir){

      var card =
        reviewsTrack.querySelector(
          '.review-card'
        );

      var step =
        card
          ? (
              card.getBoundingClientRect().width +
              20
            )
          : 320;


      reviewsTrack.scrollBy({
        left:
          dir * step,

        behavior:
          reducedMotion
            ? 'auto'
            : 'smooth'
      });
    }


    revPrev.addEventListener(
      'click',
      function(){
        scrollByCard(-1);
      }
    );


    revNext.addEventListener(
      'click',
      function(){
        scrollByCard(1);
      }
    );
  }


  /* ---------- hero stat animations ---------- */
  function animateCountUp(el){

    var target =
      parseInt(
        el.dataset.target,
        10
      ) || 0;

    var suffix =
      el.dataset.suffix || '';


    if(reducedMotion){
      el.textContent =
        target + suffix;

      return;
    }


    var duration = 1400;
    var startTime = null;


    function tick(now){

      if(startTime === null){
        startTime = now;
      }


      var progress =
        Math.min(
          (now - startTime) /
          duration,
          1
        );


      var eased =
        1 -
        Math.pow(
          1 - progress,
          3
        );


      el.textContent =
        Math.round(
          target * eased
        ) + suffix;


      if(progress < 1){
        requestAnimationFrame(
          tick
        );
      }
    }


    requestAnimationFrame(
      tick
    );
  }


  var SCRAMBLE_CHARS =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ';


  function animateScramble(el){

    var final =
      el.dataset.final ||
      el.textContent;


    if(reducedMotion){
      el.textContent =
        final;

      return;
    }


    var duration = 900;
    var startTime = null;


    function tick(now){

      if(startTime === null){
        startTime = now;
      }


      var progress =
        Math.min(
          (now - startTime) /
          duration,
          1
        );


      var revealCount =
        Math.floor(
          progress *
          final.length
        );


      var out = '';


      for(
        var i = 0;
        i < final.length;
        i++
      ){

        if(final[i] === ' '){
          out += ' ';
        }

        else if(
          i < revealCount
        ){
          out += final[i];
        }

        else{
          out +=
            SCRAMBLE_CHARS[
              Math.floor(
                Math.random() *
                SCRAMBLE_CHARS.length
              )
            ];
        }
      }


      el.textContent =
        out;


      if(progress < 1){

        requestAnimationFrame(
          tick
        );

      } else {

        el.textContent =
          final;
      }
    }


    requestAnimationFrame(
      tick
    );
  }


  var statEls =
    document.querySelectorAll(
      '.count-up, .scramble-text'
    );


  if(statEls.length){

    if(
      !('IntersectionObserver' in window)
    ){

      statEls.forEach(
        function(el){

          el.classList.contains(
            'count-up'
          )
            ? animateCountUp(el)
            : animateScramble(el);

        }
      );

    } else {

      var statIO =
        new IntersectionObserver(
          function(entries){

            entries.forEach(
              function(entry){

                if(
                  entry.isIntersecting
                ){

                  var el =
                    entry.target;


                  el.classList.contains(
                    'count-up'
                  )
                    ? animateCountUp(el)
                    : animateScramble(el);


                  statIO.unobserve(el);
                }

              }
            );

          },
          {
            threshold:0.5
          }
        );


      statEls.forEach(
        function(el){
          statIO.observe(el);
        }
      );
    }
  }


  /* ---------- ambient cursor-tracking spotlight ---------- */
  var canHover =
    window.matchMedia(
      '(hover: hover) and (pointer: fine)'
    ).matches;

  var spotlight =
    document.querySelector(
      '.ambient-spotlight'
    );


  if(
    canHover &&
    spotlight &&
    !reducedMotion
  ){

    var OFFSCREEN = -600;

    var targetX =
      OFFSCREEN;

    var targetY =
      OFFSCREEN;

    var curX =
      OFFSCREEN;

    var curY =
      OFFSCREEN;


    window.addEventListener(
      'mousemove',
      function(e){

        targetX =
          e.clientX;

        targetY =
          e.clientY;

      },
      {
        passive:true
      }
    );


    window.addEventListener(
      'mouseleave',
      function(){

        targetX =
          OFFSCREEN;

        targetY =
          OFFSCREEN;

      }
    );


    (function loop(){

      curX +=
        (
          targetX -
          curX
        ) * 0.14;

      curY +=
        (
          targetY -
          curY
        ) * 0.14;


      spotlight.style.setProperty(
        '--mx',
        curX.toFixed(1) + 'px'
      );

      spotlight.style.setProperty(
        '--my',
        curY.toFixed(1) + 'px'
      );


      requestAnimationFrame(
        loop
      );

    })();
  }

})();