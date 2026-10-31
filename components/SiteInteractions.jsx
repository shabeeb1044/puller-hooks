'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Ports js/main.js site interactions for the App Router.
 * Re-binds on route change so client navigations keep the same behavior.
 */
export default function SiteInteractions() {
  const pathname = usePathname();

  useEffect(() => {
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups = [];

    const WHATSAPP_NUMBER = '919539470261';
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      'Hello PULLER, I would like to inquire about your fishing tackle.'
    )}`;
    $$('[data-whatsapp]').forEach((link) => {
      link.href = whatsappUrl;
    });

    const header = $('.site-header');
    if (header) {
      const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener('scroll', onScroll));
    }

    const toggle = $('#navToggle');
    const nav = $('#mainNav');
    if (toggle && nav) {
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

      const onToggle = () => setMenu(toggle.getAttribute('aria-expanded') !== 'true');
      toggle.addEventListener('click', onToggle);
      cleanups.push(() => toggle.removeEventListener('click', onToggle));

      const navLinks = $$('a', nav);
      const onNavLink = () => setMenu(false);
      navLinks.forEach((a) => a.addEventListener('click', onNavLink));
      cleanups.push(() => navLinks.forEach((a) => a.removeEventListener('click', onNavLink)));

      const plusBtns = $$('.nav-plus', nav);
      const onPlus = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const btn = e.currentTarget;
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
      };
      plusBtns.forEach((btn) => btn.addEventListener('click', onPlus));
      cleanups.push(() => plusBtns.forEach((btn) => btn.removeEventListener('click', onPlus)));

      const onKey = (e) => {
        if (e.key !== 'Escape') return;
        if (nav.classList.contains('is-open')) {
          setMenu(false);
          toggle.focus();
        } else closeDropdowns();
      };
      document.addEventListener('keydown', onKey);
      cleanups.push(() => document.removeEventListener('keydown', onKey));

      const onDocClick = (e) => {
        if (!nav.contains(e.target)) closeDropdowns();
      };
      document.addEventListener('click', onDocClick);
      cleanups.push(() => document.removeEventListener('click', onDocClick));

      const onResize = () => {
        if (window.innerWidth > 820) setMenu(false);
      };
      window.addEventListener('resize', onResize);
      cleanups.push(() => window.removeEventListener('resize', onResize));

      const desktopNav = () => window.matchMedia('(min-width: 821px)').matches;
      const closeTimers = new WeakMap();
      $$('.has-dropdown', nav).forEach((item) => {
        const setOpen = (open) => {
          item.classList.toggle('is-open', open);
          const btn = item.querySelector(':scope > .nav-item > .nav-plus');
          if (btn) btn.setAttribute('aria-expanded', String(open));
        };
        const onEnter = () => {
          if (!desktopNav()) return;
          const pending = closeTimers.get(item);
          if (pending) clearTimeout(pending);
          setOpen(true);
        };
        const onLeave = () => {
          if (!desktopNav()) return;
          const pending = setTimeout(() => setOpen(false), 320);
          closeTimers.set(item, pending);
        };
        item.addEventListener('mouseenter', onEnter);
        item.addEventListener('mouseleave', onLeave);
        cleanups.push(() => {
          item.removeEventListener('mouseenter', onEnter);
          item.removeEventListener('mouseleave', onLeave);
        });
      });

      cleanups.push(() => {
        setMenu(false);
        document.body.classList.remove('nav-open');
      });
    }

    /* In-page hash scrolling */
    const normalizePath = (p) => {
      const path = (p || '/').replace(/\/index\.html$/i, '/');
      return path.endsWith('/') ? path : path + '/';
    };
    const samePage = (url) =>
      url.origin === location.origin && normalizePath(url.pathname) === normalizePath(location.pathname);
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
    const onHashClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target.closest('a[href]');
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
      const raw = link.getAttribute('href');
      if (!raw || /^(mailto:|tel:|javascript:)/i.test(raw)) return;
      let url;
      try {
        url = new URL(raw, location.href);
      } catch {
        return;
      }
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
    };
    document.addEventListener('click', onHashClick);
    cleanups.push(() => document.removeEventListener('click', onHashClick));
    const onPop = () => applyHash('auto');
    window.addEventListener('popstate', onPop);
    window.addEventListener('hashchange', onPop);
    cleanups.push(() => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('hashchange', onPop);
    });
    if (location.hash) {
      requestAnimationFrame(() => applyHash('auto'));
    }

    /* Hero slider */
    const hero = $('#hero');
    if (hero) {
      const slides = $$('.hero-slide', hero);
      const dots = $$('.hero-dot', hero);
      const copy = $('.hero-copy', hero);
      const counter = $('#heroCurrent');
      const SLIDE_TIMES = [10000, 6500, 6500];
      const heroFiles = [
        ['/images/hero-1-d.webp', '/images/hero-1-m.webp'],
        ['/images/hero-2.webp', '/images/hero-2-mobile.webp'],
        ['/images/hero-3.webp', '/images/hero-3-mobile.webp'],
      ];
      let index = 0;
      let timer = null;
      let paused = false;

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
        {
          eyebrow: 'Manufacturer & Exporter',
          title: '<span class="line">Fishing Hooks.</span><span class="accent">Lures & Jigs.</span>',
          text: 'PULLER Co., Ltd. makes high-carbon and stainless steel hooks, FLASH STRIKER hard-body lures, metal lures and jigs for saltwater and freshwater — commercial and sport fishing.',
          href: '/#products',
        },
        {
          eyebrow: 'Flash Striker Series',
          title: '<span class="line">Hard-Body Lures.</span><span class="accent">Ready to Strike.</span>',
          text: 'Trolling and casting lures in more than 100 colour patterns. Strong, durable and built to perform in both saltwater and freshwater.',
          href: '/products/flash-striker',
        },
        {
          eyebrow: 'Puller Hooks',
          title: '<span class="line">Strength You</span><span class="accent">Can Trust.</span>',
          text: 'High-strength hooks for commercial, recreational and sport fishing — dependable performance when the strike comes.',
          href: '/products/hooks',
        },
      ];
      const cta = $('#heroCta');
      const applyCta = (i) => {
        if (cta && content[i]?.href) cta.setAttribute('href', content[i].href);
      };
      applyCta(0);

      const stop = () => clearTimeout(timer);
      const restart = () => {
        stop();
        const bar = dots[index]?.querySelector('span');
        if (bar) {
          bar.style.display = 'none';
          void bar.offsetWidth;
          bar.style.display = '';
        }
        start();
      };
      const start = () => {
        if (reduceMotion || paused) return;
        stop();
        timer = setTimeout(() => go(index + 1), SLIDE_TIMES[index]);
      };

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
        if (counter) counter.textContent = String(index + 1).padStart(2, '0');
        setSlideTime(index);

        if (copy) {
          copy.classList.add('is-changing');
          setTimeout(() => {
            const c = content[index];
            const eyebrow = $('[data-eyebrow]', copy);
            const title = $('[data-title]', copy);
            const text = $('[data-text]', copy);
            if (eyebrow) eyebrow.textContent = c.eyebrow;
            if (title) title.innerHTML = c.title;
            if (text) text.textContent = c.text;
            applyCta(index);
            copy.classList.remove('is-changing');
          }, reduceMotion ? 0 : 450);
        } else {
          applyCta(index);
        }
        restart();
      };

      const nextBtn = $('#heroNext');
      const prevBtn = $('#heroPrev');
      if (nextBtn) {
        const fn = () => go(index + 1);
        nextBtn.addEventListener('click', fn);
        cleanups.push(() => nextBtn.removeEventListener('click', fn));
      }
      if (prevBtn) {
        const fn = () => go(index - 1);
        prevBtn.addEventListener('click', fn);
        cleanups.push(() => prevBtn.removeEventListener('click', fn));
      }
      dots.forEach((d, i) => {
        const fn = () => go(i);
        d.addEventListener('click', fn);
        cleanups.push(() => d.removeEventListener('click', fn));
      });

      const pause = () => {
        paused = true;
        hero.classList.add('is-paused');
        stop();
      };
      const resume = () => {
        paused = false;
        hero.classList.remove('is-paused');
        restart();
      };
      hero.addEventListener('mouseenter', pause);
      hero.addEventListener('mouseleave', resume);
      hero.addEventListener('focusin', pause);
      const onFocusOut = (e) => {
        if (!hero.contains(e.relatedTarget)) resume();
      };
      hero.addEventListener('focusout', onFocusOut);
      cleanups.push(() => {
        hero.removeEventListener('mouseenter', pause);
        hero.removeEventListener('mouseleave', resume);
        hero.removeEventListener('focusin', pause);
        hero.removeEventListener('focusout', onFocusOut);
      });

      const onKeyHero = (e) => {
        if (e.key === 'ArrowRight') go(index + 1);
        if (e.key === 'ArrowLeft') go(index - 1);
      };
      hero.addEventListener('keydown', onKeyHero);
      cleanups.push(() => hero.removeEventListener('keydown', onKeyHero));

      let startX = 0;
      let startY = 0;
      const onTouchStart = (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      };
      const onTouchEnd = (e) => {
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
      };
      hero.addEventListener('touchstart', onTouchStart, { passive: true });
      hero.addEventListener('touchend', onTouchEnd, { passive: true });
      cleanups.push(() => {
        hero.removeEventListener('touchstart', onTouchStart);
        hero.removeEventListener('touchend', onTouchEnd);
      });

      const onVis = () => {
        if (document.hidden) stop();
        else if (!paused) restart();
      };
      document.addEventListener('visibilitychange', onVis);
      cleanups.push(() => document.removeEventListener('visibilitychange', onVis));

      start();
      cleanups.push(() => {
        stop();
        hero.classList.remove('is-ready', 'is-paused');
      });
    }

    /* Reveal on scroll
     * Immediate in-view check covers App Router remounts / Strict Mode, where
     * IntersectionObserver can miss the initial callback and leave opacity:0.
     */
    const isInView = (el) => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight || 0;
      return r.bottom > 0 && r.top < vh * 0.98;
    };
    const revealer = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting || en.intersectionRatio > 0) {
            en.target.classList.add('is-visible');
            revealer.unobserve(en.target);
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px -4% 0px' }
    );
    $$('.reveal').forEach((el) => {
      if (isInView(el)) {
        el.classList.add('is-visible');
        return;
      }
      revealer.observe(el);
    });
    // Second pass after layout/paint (banner images, fonts, client nav)
    const revealRaf = requestAnimationFrame(() => {
      $$('.reveal:not(.is-visible)').forEach((el) => {
        if (isInView(el)) {
          el.classList.add('is-visible');
          revealer.unobserve(el);
        }
      });
    });
    cleanups.push(() => {
      cancelAnimationFrame(revealRaf);
      revealer.disconnect();
    });

    /* Newsletter */
    const newsletterForm = $('#newsletterForm');
    const newsletterStatus = $('#newsletterStatus');
    if (newsletterForm && newsletterStatus) {
      const onSubmit = (e) => {
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
      };
      newsletterForm.addEventListener('submit', onSubmit);
      cleanups.push(() => newsletterForm.removeEventListener('submit', onSubmit));
    }

    const yearEl = $('#year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    /* Re-init contact/dealer widgets after client navigations */
    if (typeof window !== 'undefined' && window.PullerCountrySelect?.initAll) {
      window.PullerCountrySelect.initAll();
    }
    if (typeof window !== 'undefined' && window.PullerPhoneInput?.initAll) {
      window.PullerPhoneInput.initAll();
      if (window.PullerPhoneInput.wireCountryToPhone) {
        $$('form').forEach((form) => window.PullerPhoneInput.wireCountryToPhone(form));
      }
    }
    if (typeof window !== 'undefined' && window.PullerForms?.init) {
      window.PullerForms.init();
    }

    /* Catalog search (flash listing) */
    const search = $('#catalogSearch');
    const grid = $('#catalogGrid');
    if (search && grid) {
      const cards = $$('.catalog-card', grid);
      const empty = $('#catalogEmpty');
      const onInput = () => {
        const q = search.value.trim().toLowerCase();
        let visible = 0;
        cards.forEach((card) => {
          const hay = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
          const show = !q || hay.includes(q);
          card.hidden = !show;
          if (show) visible += 1;
        });
        if (empty) empty.hidden = visible > 0;
      };
      search.addEventListener('input', onInput);
      cleanups.push(() => search.removeEventListener('input', onInput));
    }

    return () => cleanups.forEach((fn) => fn());
  }, [pathname]);

  return null;
}
