/* ============================================================
   SJ LANDSCAPES — MAIN JAVASCRIPT
   GSAP + ScrollTrigger for animations
   Nav scroll behaviour, counter animation, lightbox, mobile menu
   ============================================================ */

/* ── NAV: transparent → solid on scroll ── */
(function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  // Inner pages start with scrolled class — keep it pinned solid always
  const pinned = nav.classList.contains('scrolled');

  function updateNav() {
    if (pinned) return; // inner pages: always solid, never transparent
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
})();

/* ── MOBILE MENU ── */
(function () {
  const burger  = document.querySelector('.nav__burger');
  const mobile  = document.querySelector('.nav__mobile');
  const close   = document.querySelector('.nav__mobile-close');
  if (!burger || !mobile) return;

  burger.addEventListener('click', () => mobile.classList.add('open'));
  if (close) close.addEventListener('click', () => mobile.classList.remove('open'));

  // close on link click
  mobile.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobile.classList.remove('open'));
  });
})();

/* ── GSAP ANIMATIONS ── */
(function () {
  // Only run if GSAP is available
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  /* Hero entrance (Landing Page only, nav & announcement strip stay static) */
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.2 });

  heroTl
    .from('.hero__eyebrow-clean', { opacity: 0, y: 18, duration: 0.55 })
    .from('.hero__heading',        { opacity: 0, y: 22, duration: 0.65 }, '-=0.35')
    .from('.hero__sub',            { opacity: 0, y: 18, duration: 0.55 }, '-=0.4')
    .from('.hero__feature-item',   { opacity: 0, x: -20, duration: 0.5, stagger: 0.08 }, '-=0.3')
    .from('.hero-quote-card',      { opacity: 0, y: 24, scale: 0.98, duration: 0.7 }, '-=0.45')
    .from('.hero__scroll',         { opacity: 0, duration: 0.4 }, '-=0.2');

  /* Ken Burns on static image fallback */
  const heroBgImg = document.querySelector('.hero__bg img');
  if (heroBgImg) {
    gsap.fromTo(heroBgImg,
      { scale: 1 },
      { scale: 1.06, duration: 10, ease: 'none', repeat: -1, yoyo: true }
    );
  }

  /* Generic scroll reveals */
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.65,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none'
      }
    });
  });

  gsap.utils.toArray('.reveal-left').forEach(el => {
    gsap.to(el, {
      opacity: 1,
      x: 0,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none'
      }
    });
  });

  gsap.utils.toArray('.reveal-right').forEach(el => {
    gsap.to(el, {
      opacity: 1,
      x: 0,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none'
      }
    });
  });

  /* Staggered card reveals */
  gsap.utils.toArray('.stagger-group').forEach(group => {
    const cards = group.querySelectorAll('.stagger-item');
    gsap.from(cards, {
      opacity: 0,
      y: 40,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: group,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  });

  /* Section headings */
  gsap.utils.toArray('.section-heading').forEach(el => {
    gsap.from(el, {
      opacity: 0,
      y: 30,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        toggleActions: 'play none none none'
      }
    });
  });

})();

/* ── ANIMATED STAT COUNTERS ── */
(function () {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateCounter(el) {
    const target   = parseInt(el.getAttribute('data-count'), 10);
    const suffix   = el.getAttribute('data-suffix') || '';
    const duration = 1500; // ms
    const start    = performance.now();

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    if (prefersReduced) {
      el.textContent = target + suffix;
    } else {
      requestAnimationFrame(update);
    }
  }

  // Use IntersectionObserver to trigger when stats bar comes into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        counters.forEach(animateCounter);
        observer.disconnect();
      }
    });
  }, { threshold: 0.4 });

  const statsBar = document.querySelector('.stats-bar');
  if (statsBar) observer.observe(statsBar);
})();

/* ── LIGHTBOX ── */
(function () {
  const lightbox   = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox__img');
  const closeBtn   = document.querySelector('.lightbox__close');
  if (!lightbox || !lightboxImg) return;

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lightboxImg.src = ''; }, 300);
  }

  // Open on gallery item click
  document.querySelectorAll('[data-lightbox]').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-lightbox');
      const alt = item.getAttribute('data-alt') || '';
      openLightbox(src, alt);
    });
  });

  // Close
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });
})();

/* ── CONTACT FORM ── */
/* Handled by Formspree AJAX library in contact.html
(function () {
  const form = document.getElementById('enquiryForm');
  if (!form) return;

  const successMessage = document.querySelector('.form-success');
  const submitBtn = form.querySelector('[type="submit"]');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Disable button and show loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending... <span class="loader"></span>';
    }

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Success
        form.style.display = 'none';
        if (successMessage) {
          successMessage.style.display = 'block';
          successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        // Server error
        const data = await response.json();
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert(error.message || 'There was an issue sending your enquiry. Please call us directly.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Enquiry';
      }
    }
  });
})();
*/

/* ── GALLERY FILTER (gallery page) ── */
(function () {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const items      = document.querySelectorAll('.gallery-full-item');
  if (!filterBtns.length || !items.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      items.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
})();

/* ── SET ACTIVE NAV LINK ── */
(function () {
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav__links a, .nav__mobile a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && currentPath.endsWith(href)) {
      link.classList.add('active');
    }
  });
})();

/* ── HERO VIDEO: speed up + freeze on last frame ── */
(function () {
  const video = document.querySelector('.hero__video');
  if (!video) return;

  // 2x speed turns a ~5s video into ~2.5s
  video.playbackRate = 2;

  video.addEventListener('ended', function () {
    video.pause();
  });
})();

/* ── DYNAMIC MOBILE FAB (Call Button) ── */
/* Disabled: replaced by .mobile-cta-bar which has Call/WhatsApp/Quote */

/* ── PAGE TRANSITIONS ── removed: was blocking every link 350ms ── */

/* ── BACK TO TOP BUTTON ── */
(function () {
  const btn = document.createElement('div');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
