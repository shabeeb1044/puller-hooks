/* PULLER – site interactions (no dependencies) */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Digits only, with country code. Example: 971501234567 */
  const WHATSAPP_NUMBER = '919539470261';
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello PULLER, I would like to inquire about your fishing tackle.')}`;
  $$('[data-whatsapp]').forEach((link) => { link.href = whatsappUrl; });

  /* ---------- Header stays put after scroll, without a second painted copy ---------- */
  const header = $('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  const toggle = $('#navToggle');
  const nav = $('#mainNav');
  const closeDropdowns = (root = nav) => {
    $$('.has-dropdown.is-open', root).forEach((item) => {
      item.classList.remove('is-open');
      const btn = item.querySelector(':scope > .nav-item > .nav-plus');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  };
  let menuScrollY = 0;
  const preventBackgroundScroll = (e) => {
    if (nav.contains(e.target) && nav.scrollHeight > nav.clientHeight) return;
    e.preventDefault();
  };
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    if (open) {
      menuScrollY = window.scrollY;
      document.addEventListener('touchmove', preventBackgroundScroll, { passive: false });
      document.addEventListener('wheel', preventBackgroundScroll, { passive: false });
    } else {
      document.removeEventListener('touchmove', preventBackgroundScroll);
      document.removeEventListener('wheel', preventBackgroundScroll);
      closeDropdowns();
      if (Math.abs(window.scrollY - menuScrollY) > 1) window.scrollTo(0, menuScrollY);
    }
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  $$('.nav-plus', nav).forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const item = btn.closest('.has-dropdown');
      const open = !item.classList.contains('is-open');
      [...item.parentElement.children].forEach((sib) => {
        if (sib !== item && sib.classList.contains('has-dropdown')) {
          sib.classList.remove('is-open');
          const other = sib.querySelector(':scope > .nav-item > .nav-plus');
          if (other) other.setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
    else closeDropdowns();
  });
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeDropdowns();
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 820) setMenu(false); });

  /* Keep the submenu open while the pointer travels into it */
  const desktopNav = () => window.matchMedia('(min-width: 821px)').matches;
  const closeTimers = new WeakMap();
  $$('.has-dropdown', nav).forEach((item) => {
    const setOpen = (open) => {
      item.classList.toggle('is-open', open);
      const btn = item.querySelector(':scope > .nav-item > .nav-plus');
      if (btn) btn.setAttribute('aria-expanded', String(open));
    };
    item.addEventListener('mouseenter', () => {
      if (!desktopNav()) return;
      const pending = closeTimers.get(item);
      if (pending) clearTimeout(pending);
      setOpen(true);
    });
    item.addEventListener('mouseleave', () => {
      if (!desktopNav()) return;
      const pending = setTimeout(() => setOpen(false), 320);
      closeTimers.set(item, pending);
    });
  });

  /* ---------- Active menu link (top-level only) ---------- */
  const topLinks = $$('.nav-list > li > a, .nav-list > .has-dropdown > .nav-item > a');
  /* Only same-page hashes — paths like ../index.html#top are invalid querySelectors and would abort this script. */
  const sections = topLinks
    .map((l) => {
      const href = l.getAttribute('href') || '';
      if (!href.startsWith('#')) return null;
      return $(href);
    })
    .filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        topLinks.forEach((l) => l.classList.toggle('is-current', l.getAttribute('href') === '#' + en.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => spy.observe(s));

  /* ---------- In-page links: home clears the hash; #contact always scrolls ---------- */
  const normalizePath = (pathname) => {
    const path = (pathname || '/').replace(/\/index\.html$/i, '/');
    return path.endsWith('/') ? path : path + '/';
  };
  const samePage = (url) => url.origin === location.origin && normalizePath(url.pathname) === normalizePath(location.pathname);
  const scrollToId = (id, behavior = reduceMotion ? 'auto' : 'smooth') => {
    if (!id || id === 'top') {
      window.scrollTo({ top: 0, behavior });
      return true;
    }
    const el = document.getElementById(id);
    if (!el) return false;
    el.scrollIntoView({ behavior, block: 'start' });
    return true;
  };
  const applyHash = (behavior = 'auto') => {
    const id = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (id) scrollToId(id, behavior);
  };
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = e.target.closest('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
    const raw = link.getAttribute('href');
    if (!raw || /^(mailto:|tel:|javascript:)/i.test(raw)) return;
    let url;
    try { url = new URL(raw, location.href); } catch { return; }
    if (!samePage(url)) return;
    const id = decodeURIComponent(url.hash.replace(/^#/, ''));
    if (!url.hash) {
      e.preventDefault();
      const next = url.pathname + url.search;
      if (location.pathname + location.search + location.hash !== next) history.pushState(null, '', next);
      scrollToId('top');
      return;
    }
    if (!scrollToId(id)) return;
    e.preventDefault();
    if (location.hash !== '#' + id) history.pushState(null, '', '#' + id);
  });
  window.addEventListener('popstate', () => applyHash('auto'));
  window.addEventListener('hashchange', () => applyHash('auto'));
  if (location.hash) {
    requestAnimationFrame(() => applyHash('auto'));
    window.addEventListener('load', () => applyHash('auto'));
  }

  /* ---------- Hero slider ---------- */
  const hero = $('#hero');
  if (hero) {
  const slides = $$('.hero-slide', hero);
  const dots = $$('.hero-dot', hero);
  const copy = $('.hero-copy', hero);
  const counter = $('#heroCurrent');
  const SLIDE_TIMES = [10000, 6500, 6500];
  const heroFiles = [
    ['images/hero-1-d.webp', 'images/hero-1-m.webp'],
    ['images/hero-2.webp', 'images/hero-2-mobile.webp'],
    ['images/hero-3.webp', 'images/hero-3-mobile.webp'],
  ];
  const paintSlide = (i) => {
    if (i === 0) return;
    const bg = slides[i]?.querySelector('.hero-bg');
    if (!bg || bg.dataset.ready) return;
    const mobile = window.matchMedia('(max-width: 820px)').matches;
    const url = heroFiles[i][mobile ? 1 : 0];
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      bg.style.backgroundImage = `url("${url}")`;
      bg.dataset.ready = '1';
    };
    img.src = url;
  };
  const setSlideTime = (i) => hero.style.setProperty('--slide-time', SLIDE_TIMES[i] + 'ms');
  setSlideTime(0);
  requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-ready')));

  const content = [
    { eyebrow: 'Manufacturer & Exporter', title: '<span class="line">Fishing Hooks.</span><span class="accent">Lures & Jigs.</span>',
      text: 'PULLER Co., Ltd. makes high-carbon and stainless steel hooks, FLASH STRIKER hard-body lures, metal lures and jigs for saltwater and freshwater — commercial and sport fishing.',
      href: '#products' },
    { eyebrow: 'Flash Striker Series', title: '<span class="line">Hard-Body Lures.</span><span class="accent">Ready to Strike.</span>',
      text: 'Trolling and casting lures in more than 100 colour patterns. Strong, durable and built to perform in both saltwater and freshwater.',
      href: 'products/flash-striker.html' },
    { eyebrow: 'Puller Hooks', title: '<span class="line">Strength You</span><span class="accent">Can Trust.</span>',
      text: 'High-strength hooks for commercial, recreational and sport fishing — dependable performance when the strike comes.',
      href: 'products/hooks.html' },
  ];
  const cta = $('#heroCta');
  const applyCta = (i) => {
    if (cta && content[i]?.href) cta.setAttribute('href', content[i].href);
  };
  applyCta(0);

  let index = 0;
  let timer = null;
  let paused = false;

  const go = (next) => {
    next = (next + slides.length) % slides.length;
    if (next === index) return;
    slides[index].classList.remove('is-active');
    slides[index].setAttribute('aria-hidden', 'true');
    dots[index].classList.remove('is-active');
    dots[index].setAttribute('aria-selected', 'false');

    index = next;
    paintSlide(index);
    paintSlide((index + 1) % slides.length);
    slides[index].classList.add('is-active');
    slides[index].removeAttribute('aria-hidden');
    dots[index].classList.add('is-active');
    dots[index].setAttribute('aria-selected', 'true');
    counter.textContent = String(index + 1).padStart(2, '0');
    setSlideTime(index);

    // swap text with a soft fade
    copy.classList.add('is-changing');
    setTimeout(() => {
      const c = content[index];
      $('[data-eyebrow]', copy).textContent = c.eyebrow;
      $('[data-title]', copy).innerHTML = c.title;
      $('[data-text]', copy).textContent = c.text;
      applyCta(index);
      copy.classList.remove('is-changing');
    }, reduceMotion ? 0 : 450);

    restart();
  };

  const start = () => {
    if (reduceMotion || paused) return;
    stop();
    timer = setTimeout(() => go(index + 1), SLIDE_TIMES[index]);
  };
  const stop = () => clearTimeout(timer);
  const restart = () => {
    stop();
    // restart dot progress animation
    const bar = dots[index].querySelector('span');
    bar.style.display = 'none'; void bar.offsetWidth; bar.style.display = '';
    start();
  };

  $('#heroNext').addEventListener('click', () => go(index + 1));
  $('#heroPrev').addEventListener('click', () => go(index - 1));
  dots.forEach((d, i) => d.addEventListener('click', () => go(i)));

  // Pause on hover / focus for accessibility
  const pause = () => { paused = true; hero.classList.add('is-paused'); stop(); };
  const resume = () => { paused = false; hero.classList.remove('is-paused'); restart(); };
  hero.addEventListener('mouseenter', pause);
  hero.addEventListener('mouseleave', resume);
  hero.addEventListener('focusin', pause);
  hero.addEventListener('focusout', (e) => { if (!hero.contains(e.relatedTarget)) resume(); });

  // Keyboard arrows when the hero has focus
  hero.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') go(index + 1);
    if (e.key === 'ArrowLeft') go(index - 1);
  });

  // Touch swipe
  let startX = 0, startY = 0;
  hero.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; }, { passive: true });
  hero.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
  }, { passive: true });

  // Pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (!paused) restart();
  });

  start();
  }
  /* Later slides load with the first change, not during the opening view. */
  /* ---------- Reveal on scroll ---------- */
  const revealer = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-visible'); revealer.unobserve(en.target); }
    });
  }, { threshold: 0.15 });
  $$('.reveal').forEach((el) => revealer.observe(el));

  /* ---------- Newsletter form (Footer) ---------- */
  const newsletterForm = $('#newsletterForm');
  const newsletterStatus = $('#newsletterStatus');
  if (newsletterForm && newsletterStatus) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('#newsletterEmail', newsletterForm);
      const email = input ? input.value.trim() : '';
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!valid) {
        newsletterStatus.style.color = '#ff4b4b';
        newsletterStatus.textContent = 'Please enter a valid email address.';
        return;
      }
      newsletterStatus.style.color = '#f7ed22';
      newsletterStatus.textContent = "🎣 You're hooked! Watch your inbox for pro gear drops.";
      newsletterForm.reset();
      setTimeout(() => {
        newsletterStatus.textContent = '';
      }, 5000);
    });
  }

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
