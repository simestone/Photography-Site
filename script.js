// script.js
// Restored: Gallery lightbox + Article reveal-on-scroll (with container support)

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add("fade-in");
  
  /* ============================
   *  LIGHTBOX FOR GALLERY IMAGES
   * ============================ 
   * Required HTML:
   *   <div class="lightbox" id="lightbox" aria-hidden="true">
   *     <button class="lightbox-close" aria-label="Close">&times;</button>
   *     <img id="lightbox-img" alt="">
   *   </div>
   *   <img class="gallery-img" src="..." data-full="..." alt="...">
   */

  const lb    = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const closeBtn = document.querySelector('.lightbox-close');

  function openLightbox(src, alt) {
    if (!lb || !lbImg) return;
    lbImg.src = src;
    lbImg.alt = alt || '';
    lb.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    if (!lb || !lbImg) return;
    lb.setAttribute('aria-hidden', 'true');
    // Clear src so large images unload when closed
    lbImg.src = '';
  }

  // Bind clicks on gallery thumbnails
  document.querySelectorAll('.gallery-img').forEach(img => {
    img.addEventListener('click', () => {
      const src = img.dataset.full || img.src;
      openLightbox(src, img.alt);
    });
  });

  // Close handlers
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (lb) {
    // click on the dim backdrop closes (but not on the image itself)
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });


  /* ============================================
   *  ARTICLE FADE-IN WHEN SCROLLING PAST IMAGE
   * ============================================
   * Required HTML:
   *   <img id="mainImage" ...>
   *   <div id="ar-trigger" aria-hidden="true"></div>  <!-- sentinel just after image -->
   *   <article id="ar" class="reveal"> ... </article>
   * Required CSS:
   *   .reveal { opacity:0; transform:translateY(18px); transition: opacity 800ms, transform 800ms; }
   *   .reveal.is-visible { opacity:1; transform:none; }
   */

  const article  = document.getElementById('ar');
  const trigger  = document.getElementById('ar-trigger');

  // Utility: find the nearest scrollable ancestor (handles container scrolling)
  function getScrollParent(el) {
    let p = el && el.parentElement;
    while (p) {
      const { overflowY } = getComputedStyle(p);
      if (/(auto|scroll|overlay)/.test(overflowY)) return p;
      p = p.parentElement;
    }
    return null; // fall back to viewport
  }

  function revealArticle() {
    if (article && !article.classList.contains('is-visible')) {
      article.classList.add('is-visible');
    }
  }

  if (article) {
    // Ensure base class exists (in case it's missing)
    article.classList.add('reveal');
  }

  if (article && trigger && 'IntersectionObserver' in window) {
    const rootEl = getScrollParent(trigger);

    const io = new IntersectionObserver((entries, obs) => {
      const entry = entries[0];
      if (entry && entry.isIntersecting) {
        revealArticle();
        obs.disconnect(); // run once
      }
    }, {
      root: rootEl || null,     // container scroll or viewport
      threshold: 0,             // fire as soon as sentinel touches the root
      // Negative bottom margin waits until you've scrolled further down
      rootMargin: '0px 0px -35% 0px'
    });

    io.observe(trigger);
  } else if (article && !('IntersectionObserver' in window)) {
    // Fallback for very old browsers
    revealArticle();
  }

  /* ======================
   * OPTIONAL ALT TRIGGERS:
   * ======================
   * If you prefer not to rely on scroll, uncomment any of these:
   */

  // A) Reveal when the hero image finishes loading (no scroll needed)
  // const hero = document.getElementById('mainImage');
  // if (hero) {
  //   const onReady = () => setTimeout(revealArticle, 150);
  //   if (hero.complete && hero.naturalWidth > 0) onReady();
  //   else hero.addEventListener('load', onReady, { once: true });
  // }

  // B) Reveal after a fixed delay (e.g., 2 seconds after DOM ready)
  // setTimeout(revealArticle, 2000);

  // C) Reveal on first user interaction (click or Enter/Space)
  // const onFirstClick = () => { revealArticle(); document.removeEventListener('click', onFirstClick); };
  // const onFirstKey = (e) => { if (e.key === 'Enter' || e.key === ' ') { revealArticle(); document.removeEventListener('keydown', onFirstKey); } };
  // document.addEventListener('click', onFirstClick, { once: true });
  // document.addEventListener('keydown', onFirstKey);
});


    // Fade out before leaving
    document.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", function (e) {
        if (link.hostname === window.location.hostname) { // only internal links
          e.preventDefault();
          document.body.classList.remove("fade-in");
          document.body.classList.add("fade-out");
          setTimeout(() => {
            window.location = link.href;
          }, 300); // match transition duration
        }
      });
    });


  // Add the overlay once
  (function setupOverlay(){
    const el = document.createElement('div');
    el.id = 'transition-overlay';
    document.documentElement.appendChild(el);
  })();

  // Fade/flash when navigating to internal links
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a');
    if (!a) return;

    // ignore new window, downloads, external, tel/mailto, hash-only
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const href = a.getAttribute('href') || '';
    if (href.startsWith('mailto:') || href.startsWith('tel:')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.hash && url.pathname === location.pathname && url.search === location.search) return;

    e.preventDefault();
    const overlay = document.getElementById('transition-overlay');
    const ms = parseFloat(getComputedStyle(document.documentElement)
                .getPropertyValue('--flash-ms')) || 120;

    // Trigger the flash
    overlay.classList.add('flash');

    // Navigate just after the flash peaks
    setTimeout(() => { window.location.href = a.href; }, ms);
  });

  // Scroll reveal with IntersectionObserver

  // Mark page as ready (handles normal load + back/forward cache)
  function makeReady(){
    document.body.classList.remove('is-leaving');
    document.body.classList.add('is-ready');
  }
  window.addEventListener('DOMContentLoaded', makeReady);
  window.addEventListener('pageshow', e => { if (e.persisted) makeReady(); });

  // Intercept internal links for a smooth fade OUT, then navigate
  document.addEventListener('click', function(e){
    const a = e.target.closest('a');
    if(!a) return;

    // Skip new windows/downloads/external links/anchors
    if(a.target === '_blank' || a.hasAttribute('download')) return;
    const href = a.getAttribute('href') || '';
    if(href.startsWith('mailto:') || href.startsWith('tel:')) return;
    const url = new URL(a.href, location.href);
    if(url.origin !== location.origin) return;
    if(url.hash && url.pathname === location.pathname && url.search === location.search) return;

    e.preventDefault();

    const ms = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--xfade-ms')
    ) || 350;

    document.body.classList.remove('is-ready');
    document.body.classList.add('is-leaving');

    // Navigate right after the fade completes
    setTimeout(() => { window.location.href = a.href; }, ms);
  });

  // Scroll-reveal: auto-tag direct children of <main> if not manually tagged
  (function setupReveal(){
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('main > *:not(script):not(style)').forEach(el=>{
      if(!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal','');
    });

    if(reduce){
      document.querySelectorAll('[data-reveal]').forEach(el=>el.classList.add('reveal-in'));
      return;
    }

    const io = new IntersectionObserver((entries)=>{
      for(const entry of entries){
        if(entry.isIntersecting){
          entry.target.classList.add('reveal-in');
          io.unobserve(entry.target);
        }
      }
    }, { root: null, threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

    document.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el));
  })();


