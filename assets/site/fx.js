/* fx.js: the GSAP layer of the 2026 redesign (hybrid). Loaded after gsap, ScrollTrigger and SplitText.
   Parts: the intro count, the hero's pass-mark field and headline, risen h2 lines, the cursor, buttons
   pulled toward the pointer, the project reel (desktop), the footer mark and the wipe between pages.
   Reduced motion gets the plain page with a still field; phones get no cursor and no reel. */
(() => {
  const root = document.documentElement;
  const store = {
    get: k => { try { return sessionStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch { /* private mode */ } },
    del: k => { try { sessionStorage.removeItem(k); } catch { /* private mode */ } },
  };
  const el = (tag, cls) => { const n = document.createElement(tag); n.className = cls; n.setAttribute('aria-hidden', 'true'); return n; };

  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) { root.classList.remove('fx-intro', 'fx-wiping'); return; }
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const hero = document.querySelector('.hero--fx');
  const REEL = ['fieldgate', 'longhaul', 'knowledge'];
  let reelTween = null;

  /* ---------- the pass-mark field: dots scored top to bottom, a line the pointer moves ---------- */
  function field() {
    const cv = hero && hero.querySelector('.fx-field');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0, H = 0, dpr = 1, dots = [], mark = 0.62, target = 0.62, pointer = false, running = true, raf = 0, px = -1e4, py = -1e4;
    const mono = getComputedStyle(root).getPropertyValue('--font-mono').trim() || 'monospace';
    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      const n = Math.round(Math.min(900, (W * H) / 1500));
      dots = Array.from({ length: n }, () => {
        const s = Math.random();
        return { x: Math.random() * W, y: H * (0.06 + 0.88 * (1 - s)) + (Math.random() - 0.5) * 70, ph: Math.random() * 6.283, r: 0.9 + Math.random() * 1.5, k: 0 };
      });
    };
    const draw = (t) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (!pointer && !still) target = 0.56 + 0.2 * Math.sin(t * 0.00035);
      mark += (target - mark) * (still ? 1 : 0.07);
      const ly = mark * H;
      const on = new Path2D(), off = new Path2D();
      for (const d of dots) {
        let x = d.x, y = d.y + (still ? 0 : Math.sin(t * 0.0007 + d.ph) * 5);
        // the pointer parts the field: dots within 110px lean away from it
        const ex = x - px, ey = y - py, e2 = ex * ex + ey * ey;
        if (e2 < 12100) { const f = (1 - Math.sqrt(e2) / 110) * 26 / (Math.sqrt(e2) + 1); x += ex * f; y += ey * f; }
        d.k += ((y < ly ? 1 : 0) - d.k) * (still ? 1 : 0.14);
        const p = d.k > 0.5 ? on : off;
        p.moveTo(x + d.r, y); p.arc(x, y, d.r, 0, 6.283);
      }
      ctx.fillStyle = 'rgba(198, 241, 157, .62)'; ctx.fill(on);
      ctx.strokeStyle = 'rgba(154, 163, 154, .32)'; ctx.lineWidth = 1; ctx.stroke(off);
      // the pass mark: a lit rule and the score it stands at (top of the field 1.00, foot 0.00)
      const yy = Math.round(ly);
      ctx.fillStyle = 'rgba(198, 241, 157, .16)'; ctx.fillRect(0, yy - 3, W, 7);
      ctx.fillStyle = 'rgba(198, 241, 157, .8)'; ctx.fillRect(0, yy, W, 1);
      ctx.font = `500 12px ${mono}`; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
      ctx.fillText(Math.max(0, Math.min(1, 1 - (ly / H - 0.06) / 0.88)).toFixed(2), W - 24, yy - 8);
    };
    const loop = (t) => { if (running) draw(t); raf = requestAnimationFrame(loop); };
    build();
    if (still) { draw(0); } else { raf = requestAnimationFrame(loop); }
    let rz = 0;
    addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { build(); if (still) draw(0); }, 150); });
    if (!still) {
      hero.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        const r = cv.getBoundingClientRect();
        pointer = true; target = Math.min(0.94, Math.max(0.08, (e.clientY - r.top) / r.height));
        px = e.clientX - r.left; py = e.clientY - r.top;
      }, { passive: true });
      hero.addEventListener('pointerleave', () => { pointer = false; px = py = -1e4; });
      new IntersectionObserver(([en]) => { running = en.isIntersecting; }).observe(hero);
    }
  }

  /* ---------- the hero: the count (first visit), then the headline builds letter by letter ---------- */
  function heroIn(wipe) {
    if (!hero) return;
    const h1 = hero.querySelector('h1');
    const split = SplitText.create(h1, { type: 'lines,words,chars', mask: 'lines' });
    const pieces = hero.querySelectorAll('.ly-collage__set:first-child .ly-piece');
    const tl = gsap.timeline({ paused: true, onComplete: () => split.revert() });
    tl.from(split.chars, { yPercent: 115, rotate: 8, duration: 1.15, ease: 'expo.out', stagger: 0.022 })
      .from(hero.querySelectorAll('.hero__lead, .hero__cta'), { y: 28, autoAlpha: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09 }, '-=0.85')
      .from(pieces, { y: 70, scale: 0.94, autoAlpha: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08 }, '<-0.25');

    if (root.classList.contains('fx-intro')) {
      const L = el('div', 'fx-loader');
      L.innerHTML = '<span class="fx-loader__n"><span class="v">17.2</span><i>%</i></span><span class="fx-loader__bar"></span>';
      document.body.append(L);
      root.classList.remove('fx-intro');
      const v = { n: 17.2 }, out = L.querySelector('.v');
      gsap.timeline({ onComplete: () => { L.remove(); store.set('fx-seen', '1'); } })
        .to(v, { n: 2.7, duration: 1.4, ease: 'power3.inOut', onUpdate: () => { out.textContent = v.n.toFixed(1); } })
        .to(L.querySelector('.fx-loader__bar'), { scaleX: 1, duration: 1.4, ease: 'power3.inOut' }, 0)
        .to(L, { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '+=0.2')
        .add(() => tl.play(), '-=0.5');
    } else if (root.classList.contains('fx-wiping')) {
      gsap.set(wipe, { yPercent: 0, visibility: 'visible' });
      root.classList.remove('fx-wiping');
      store.del('fx-wipe');
      gsap.to(wipe, { yPercent: -100, duration: 0.9, ease: 'expo.inOut', delay: 0.05, onComplete: () => gsap.set(wipe, { yPercent: 100, visibility: 'hidden' }) });
      gsap.delayedCall(0.45, () => tl.play());
    } else {
      tl.play();
    }
    return () => { tl.kill(); split.revert(); };
  }

  /* ---------- section headings: each line rises out of its own box, once ---------- */
  function headings() {
    document.querySelectorAll('main h2, footer.closing h2').forEach((h) => {
      if (h.closest('[data-moment]') || (reelTween && h.closest('.fx-reel'))) return;
      SplitText.create(h, {
        type: 'lines', mask: 'lines', autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, {
          yPercent: 108, duration: 1.05, ease: 'expo.out', stagger: 0.09,
          scrollTrigger: { trigger: h, start: 'top 88%', once: true },
        }),
      });
    });
  }

  /* ---------- the cursor: a dot on the pointer, a ring that trails and swells over links ---------- */
  function cursor() {
    const ring = el('div', 'fx-cursor'), dot = el('div', 'fx-cursor-dot');
    document.body.append(ring, dot);
    const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
    const dx = gsap.quickTo(dot, 'x', { duration: 0.08 }), dy = gsap.quickTo(dot, 'y', { duration: 0.08 });
    const move = (e) => { if (e.pointerType !== 'mouse') return; rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY); root.classList.add('fx-has-cursor'); };
    const over = (e) => {
      const t = e.target.closest && e.target.closest('a, button, [role="slider"], input, select, summary, label');
      ring.classList.toggle('is-link', !!t);
      gsap.to(ring, { scale: t ? 1.75 : 1, duration: 0.35, ease: 'power3.out', overwrite: 'auto' });
    };
    const out = () => root.classList.remove('fx-has-cursor');
    addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', over);
    document.addEventListener('pointerleave', out);
    return () => {
      removeEventListener('pointermove', move); document.removeEventListener('pointerover', over); document.removeEventListener('pointerleave', out);
      ring.remove(); dot.remove(); root.classList.remove('fx-has-cursor');
    };
  }

  /* ---------- buttons lean toward the pointer, then spring back ---------- */
  function magnets() {
    const offs = [];
    document.querySelectorAll('.btn').forEach((b) => {
      const move = (e) => {
        const r = b.getBoundingClientRect();
        gsap.to(b, { '--mx': (e.clientX - r.left - r.width / 2) * 0.22 + 'px', '--my': (e.clientY - r.top - r.height / 2) * 0.32 + 'px', duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
      };
      const leave = () => gsap.to(b, { '--mx': '0px', '--my': '0px', duration: 0.9, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });
      b.addEventListener('pointermove', move); b.addEventListener('pointerleave', leave);
      offs.push(() => { b.removeEventListener('pointermove', move); b.removeEventListener('pointerleave', leave); b.style.removeProperty('--mx'); b.style.removeProperty('--my'); });
    });
    return () => offs.forEach((f) => f());
  }

  /* ---------- the reel: three projects pinned side by side, moved by the vertical scroll ---------- */
  function reel() {
    const secs = REEL.map((id) => document.getElementById(id)).filter(Boolean);
    if (secs.length < 2) return null;
    const box = el('div', 'fx-reel'), track = el('div', 'fx-reel__track');
    box.removeAttribute('aria-hidden'); track.removeAttribute('aria-hidden');
    secs[0].before(box); box.append(track); track.append(...secs);
    const ui = el('div', 'fx-reel__ui');
    ui.innerHTML = `<div class="wrap"><span class="fx-reel__n">01</span><span class="fx-reel__bar"><i></i></span><span>0${secs.length}</span></div>`;
    box.append(ui);
    const num = ui.querySelector('.fx-reel__n'), bar = ui.querySelector('.fx-reel__bar i');
    const dist = () => secs[secs.length - 1].offsetLeft;
    // 1.5 screens of scroll a panel: a whole number of screens in all, so the sections after stay on the screen grid
    reelTween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: box, pin: true, start: 'top top', end: () => '+=' + (secs.length - 1) * window.innerHeight * 1.5, scrub: 0.7, invalidateOnRefresh: true, anticipatePin: 1,
        // inertia off: a nav jump lands on its own panel instead of being thrown past it
        snap: { snapTo: 1 / (secs.length - 1), inertia: false, duration: { min: 0.25, max: 0.7 }, delay: 0.08, ease: 'power2.inOut' },
        onUpdate: (self) => { bar.style.transform = `scaleX(${self.progress})`; num.textContent = '0' + (Math.round(self.progress * (secs.length - 1)) + 1); },
      },
    });
    secs.forEach((s, i) => {
      const h = s.querySelector('h2');
      const vis = s.querySelector('.frame, .proj, .grid.cards, .grid:last-child');
      const at = i === 0 ? { trigger: box, start: 'top 75%' } : { containerAnimation: reelTween, trigger: s, start: 'left 62%' };
      if (h) {
        SplitText.create(h, {
          type: 'lines', mask: 'lines', autoSplit: true,
          onSplit: (self) => gsap.from(self.lines, { yPercent: 108, duration: 1.05, ease: 'expo.out', stagger: 0.09, scrollTrigger: { ...at, once: true } }),
        });
      }
      if (i > 0) {
        gsap.fromTo(s.querySelector(':scope > .wrap'), { x: 120 }, { x: 0, ease: 'none', scrollTrigger: { containerAnimation: reelTween, trigger: s, start: 'left right', end: 'left left', scrub: true } });
        if (vis) gsap.fromTo(vis, { scale: 0.9, autoAlpha: 0.4 }, { scale: 1, autoAlpha: 1, ease: 'none', scrollTrigger: { containerAnimation: reelTween, trigger: s, start: 'left 85%', end: 'left 15%', scrub: true } });
      }
    });
    // the nav's #fieldgate, #longhaul and #knowledge land on their panel
    const jump = (id, smooth) => {
      const i = REEL.indexOf(id), st = reelTween && reelTween.scrollTrigger;
      if (i < 0 || !st) return false;
      window.scrollTo({ top: st.start + (st.end - st.start) * (i / (secs.length - 1)) + 1, behavior: smooth ? 'smooth' : 'instant' });
      return true;
    };
    const click = (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (a && jump(a.getAttribute('href').slice(1), true)) { e.preventDefault(); history.replaceState(null, '', a.getAttribute('href')); }
    };
    document.addEventListener('click', click, true);
    if (REEL.includes(location.hash.slice(1))) ScrollTrigger.addEventListener('refresh', function once() { ScrollTrigger.removeEventListener('refresh', once); requestAnimationFrame(() => jump(location.hash.slice(1), false)); });
    return () => {
      document.removeEventListener('click', click, true);
      reelTween = null;
      box.before(...secs); box.remove();
      secs.forEach((s) => { const w = s.querySelector(':scope > .wrap'); if (w) w.style.removeProperty('transform'); });
    };
  }

  /* ---------- the footer: the name rises across the closing screen as it scrolls in ---------- */
  function footerMark() {
    const f = document.querySelector('footer.closing');
    if (!f) return null;
    const m = el('div', 'fx-mark');
    m.innerHTML = [...'Eagle'].map((c) => `<span class="fx-ch">${c}</span>`).join('');
    f.append(m);
    gsap.from(m.children, { yPercent: 110, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: f, start: 'top 80%', end: 'bottom bottom', scrub: 0.6 } });
    return () => m.remove();
  }

  /* ---------- leaving for another page: the lime wipe covers the screen first ---------- */
  function exits(wipe) {
    const click = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search)) return;
      if (/\.(pdf|zip|png|jpe?g|webp|svg)$/i.test(u.pathname)) return;
      e.preventDefault();
      store.set('fx-wipe', String(Date.now()));  // honoured for 4 s, so a later reload never opens covered
      gsap.fromTo(wipe, { yPercent: 100, visibility: 'visible' }, { yPercent: 0, duration: 0.6, ease: 'expo.in', onComplete: () => { location.href = u.href; } });
    };
    document.addEventListener('click', click);
    return () => document.removeEventListener('click', click);
  }

  function start() {
    const wipe = el('div', 'fx-wipe');
    document.body.append(wipe);
    gsap.set(wipe, { yPercent: 100 });
    addEventListener('pageshow', (e) => { if (e.persisted) gsap.set(wipe, { yPercent: 100, visibility: 'hidden' }); });
    field();
    // separate contexts, created top to bottom, so crossing 1024px rebuilds only the reel
    const motion = '(prefers-reduced-motion: no-preference)';
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: reduce)', () => { root.classList.remove('fx-intro', 'fx-wiping'); });
    mm.add(motion, () => {
      root.classList.add('fx');
      const offs = [heroIn(wipe), exits(wipe)];
      return () => { offs.forEach((f) => f && f()); root.classList.remove('fx'); };
    });
    mm.add(`${motion} and (min-width: 1024px)`, () => reel());
    mm.add(motion, () => { headings(); return footerMark(); });
    mm.add(`${motion} and (hover: hover) and (pointer: fine)`, () => { const a = cursor(), b = magnets(); return () => { a(); b(); }; });
    addEventListener('load', () => ScrollTrigger.refresh());
  }

  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start);
})();
