/* fx.js — Eagle Review Bench (Awwwards GSAP 3.13 Engine)
   7-act choreography on the home page + cohesive transitions and reveals across all subpages:
   1. Split-shutter calibration preloader (17.2% -> 2.7%, replayable)
   2. 3D perspective calibration dot-field canvas with live cursor threshold & constellation lines
   3. Interactive 3D-tilting Optical Specimen Chamber with tabs, specular lighting & auto-cycle
   4. Scrubbed aperture reveal on #gate + clickable queue rows + alert polarity
   5. Pinned kinetic typographic manifesto (#method: outline -> solid ink scrub)
   6. Velocity-coupled pinned horizontal showcase (#fieldgate, #longhaul, #knowledge):
      - Fieldgate OCR scanbeam & interactive marks
      - Longhaul scrubbed SVG stroke drawing + hover point tooltip
      - Knowledge staggered cards + interactive Approve note toggle
      - Clickable chapter bar + automatic dark/light polarity morphing
   7. Audit ledger hairline reveals, glass tool cells, cursor-spotlight EAGLE closing mark,
      smart contextual reticle cursor, magnetic buttons, floating index dock & telemetry HUD. */
(() => {
  const root = document.documentElement;
  const isZh = (root.lang || '').toLowerCase().startsWith('zh');
  const T = isZh ? {
    preMeta: 'FIELDGATE // 保留測試集 · N=200',
    preBusy: '校準通過門檻中…',
    preDone: '已認證 · 誤審率 ≤ 5%',
    preSub: '保留收據誤審率下降幅度',
    eyebrow: '00 // AI 驗證系統 · 實測基準',
    scrollCue: '向下捲動探索',
    specHead: ['樣本 01/03 · FIELDGATE', '樣本 02/03 · LONGHAUL', '樣本 03/03 · KNOWLEDGE'],
    specTabs: [
      { k: '01 · 0.98', n: '收據審核' },
      { k: '02 · $1.84', n: 'Agent 成本' },
      { k: '03 · 5/5', n: '引用驗證' },
    ],
    pause: '暫停輪播', play: '繼續輪播',
    dock: [
      { href: '#top', label: '01 基準' },
      { href: '#gate', label: '02 佇列' },
      { href: '#fieldgate', label: '03 專案' },
      { href: '#questions', label: '04 問答' },
    ],
    chaps: ['01 FIELDGATE', '02 LONGHAUL', '03 KNOWLEDGE'],
    replay: '重播校準',
    wipeLbl: '載入頁面…',
    curInspect: '檢視', curDrag: '拖曳門檻', curOpen: '開啟 ↗', curClick: '點擊切換', curApprove: '核准',
    fieldCut: '門檻', fieldPass: '通過', fieldErr: '估計誤差',
    approved: '已核准',
  } : {
    preMeta: 'FIELDGATE // HELD-OUT RECEIPTS · N=200',
    preBusy: 'CALIBRATING PASS MARK…',
    preDone: 'CERTIFIED · ≤5% ERROR TARGET',
    preSub: 'Wrong approvals on 200 held-out receipts',
    eyebrow: '00 // VERIFICATION SYSTEMS · MEASURED',
    scrollCue: 'Scroll to inspect',
    specHead: ['SPECIMEN 01/03 · FIELDGATE', 'SPECIMEN 02/03 · LONGHAUL', 'SPECIMEN 03/03 · KNOWLEDGE'],
    specTabs: [
      { k: '01 · 0.98', n: 'Receipt' },
      { k: '02 · $1.84', n: 'Shift cost' },
      { k: '03 · 5/5', n: 'Quote check' },
    ],
    pause: 'Pause specimens', play: 'Resume specimens',
    dock: [
      { href: '#top', label: '01 Bench' },
      { href: '#gate', label: '02 Queue' },
      { href: '#fieldgate', label: '03 Work' },
      { href: '#questions', label: '04 Audit' },
    ],
    chaps: ['01 FIELDGATE', '02 LONGHAUL', '03 KNOWLEDGE'],
    replay: 'Replay',
    wipeLbl: 'TRANSITIONING…',
    curInspect: 'INSPECT', curDrag: 'DRAG CUT', curOpen: 'OPEN ↗', curClick: 'SWITCH', curApprove: 'APPROVE',
    fieldCut: 'CUT', fieldPass: 'PASS', fieldErr: 'EST ERR',
    approved: 'Approved',
  };

  const store = {
    get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch {} },
    del: (k) => { try { sessionStorage.removeItem(k); } catch {} },
  };
  const mk = (tag, cls, hidden = true) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (hidden) n.setAttribute('aria-hidden', 'true');
    return n;
  };

  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) {
    root.classList.remove('fx-intro', 'fx-wiping');
    return;
  }
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const hero = document.querySelector('.hero--fx');
  const REEL = ['fieldgate', 'longhaul', 'knowledge'];
  let reelTween = null;
  let playIntroNow = null;

  /* ---------- atmospheric layers: film grain, hairline rails & section crosshairs ---------- */
  function atmosphere() {
    if (!document.querySelector('.fx-grain')) document.body.append(mk('div', 'fx-grain'));
    if (!document.querySelector('.fx-rails')) {
      const rails = mk('div', 'fx-rails');
      rails.innerHTML = '<div class="fx-rails__inner"></div>';
      document.body.append(rails);
    }
    document.querySelectorAll('main > section, .fx-reel__track > section').forEach((sec) => {
      if (sec.classList.contains('hero') || sec.querySelector('.fx-cross')) return;
      sec.append(mk('span', 'fx-cross fx-cross--tl'), mk('span', 'fx-cross fx-cross--tr'));
    });
  }

  /* ---------- ACT II-A: 3D Perspective Calibration Field Canvas ---------- */
  function field() {
    const cv = hero && hero.querySelector('.fx-field');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0, H = 0, dpr = 1, dots = [], mark = 0.56, target = 0.56;
    let pointer = false, running = true, raf = 0, px = -1e4, py = -1e4;
    const mono = getComputedStyle(root).getPropertyValue('--font-mono').trim() || 'monospace';

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      const count = Math.round(Math.min(760, Math.max(240, (W * H) / 1650)));
      dots = Array.from({ length: count }, (_, i) => {
        const s = Math.random();
        const depth = 0.4 + Math.random() * 0.9; // parallax & size weight
        const wrong = Math.random() < (s > 0.8 ? 0.04 : 0.28);
        return {
          x: Math.random() * W,
          y: H * (0.06 + 0.88 * (1 - s)) + (Math.random() - 0.5) * 64,
          s, depth, wrong,
          ph: (i * 0.37) % 6.283,
          r: (0.85 + depth * 1.15),
          k: 0,
        };
      });
    };

    const draw = (t) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // Subtle architectural calibration horizon grid
      ctx.strokeStyle = 'rgba(198, 241, 157, 0.032)';
      ctx.lineWidth = 1;
      const cols = W > 900 ? 12 : 6;
      const rows = 8;
      ctx.beginPath();
      for (let c = 1; c < cols; c++) {
        const gx = Math.round((W / cols) * c) + 0.5;
        ctx.moveTo(gx, 0); ctx.lineTo(gx, H);
      }
      for (let r = 1; r < rows; r++) {
        const gy = Math.round((H / rows) * r) + 0.5;
        ctx.moveTo(0, gy); ctx.lineTo(W, gy);
      }
      ctx.stroke();

      if (!pointer && !still) target = 0.50 + 0.16 * Math.sin(t * 0.00038);
      mark += (target - mark) * (still ? 1 : 0.085);
      const ly = mark * H;

      // Soft luminous field glow above the pass-mark plane
      const grad = ctx.createLinearGradient(0, Math.max(0, ly - 140), 0, ly);
      grad.addColorStop(0, 'rgba(198, 241, 157, 0)');
      grad.addColorStop(1, 'rgba(198, 241, 157, 0.065)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, Math.max(0, ly - 140), W, Math.min(140, ly));

      const on = new Path2D(), off = new Path2D();
      const near = [];
      let passed = 0, wrongPass = 0;

      for (const d of dots) {
        let x = d.x + (still ? 0 : Math.cos(t * 0.00042 + d.ph) * 3.5 * d.depth);
        let y = d.y + (still ? 0 : Math.sin(t * 0.00065 + d.ph) * 6.0 * d.depth);

        const ex = x - px, ey = y - py, e2 = ex * ex + ey * ey;
        if (e2 < 19600) { // 140px interaction radius
          const dist = Math.sqrt(e2);
          const push = (1 - dist / 140) * 30 / (dist + 1);
          x += ex * push; y += ey * push;
          if (near.length < 14 && dist < 125) near.push([x, y, 1 - dist / 125]);
        }

        const isAbove = y < ly;
        if (isAbove) { passed++; if (d.wrong) wrongPass++; }
        d.k += ((isAbove ? 1 : 0) - d.k) * (still ? 1 : 0.16);

        const p = d.k > 0.5 ? on : off;
        p.moveTo(x + d.r, y); p.arc(x, y, d.r, 0, 6.283);
      }

      // Draw optical verification constellation near pointer
      if (near.length && pointer) {
        ctx.lineWidth = 0.85;
        for (const [nx, ny, a] of near) {
          ctx.strokeStyle = `rgba(198, 241, 157, ${(a * 0.34).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(px, py); ctx.lineTo(nx, ny);
          ctx.stroke();
        }
      }

      ctx.fillStyle = 'rgba(198, 241, 157, 0.72)';
      ctx.fill(on);
      ctx.strokeStyle = 'rgba(143, 157, 143, 0.32)';
      ctx.lineWidth = 0.9;
      ctx.stroke(off);

      // Laser pass-mark beam + live calculated telemetry pill
      const yy = Math.round(ly) + 0.5;
      ctx.fillStyle = 'rgba(198, 241, 157, 0.14)';
      ctx.fillRect(0, yy - 3, W, 7);
      ctx.fillStyle = 'rgba(198, 241, 157, 0.88)';
      ctx.fillRect(0, yy, W, 1);

      const cutScore = Math.max(0.05, Math.min(0.99, 1 - (ly / H - 0.06) / 0.88));
      const passPct = dots.length ? Math.round((passed / dots.length) * 100) : 0;
      const errPct = passed ? ((wrongPass / passed) * 100).toFixed(1) : '0.0';
      const readout = `${T.fieldCut} ${cutScore.toFixed(2)}  ·  ${T.fieldPass} ${passPct}%  ·  ${T.fieldErr} ${errPct}%`;

      ctx.font = `500 11px ${mono}`;
      const tw = ctx.measureText(readout).width;
      // Keep full telemetry pill cleanly at top-left of canvas (never occluded by Specimen Chamber)
      const leftPad = W >= 1100 ? Math.max(24, (W - 1280) / 2 + 12) : 20;
      const bx = leftPad;
      const by = 32;
      ctx.fillStyle = 'rgba(7, 16, 8, 0.84)';
      ctx.fillRect(bx - 10, by - 13, tw + 20, 24);
      ctx.strokeStyle = 'rgba(198, 241, 157, 0.32)';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx - 10, by - 13, tw + 20, 24);
      ctx.fillStyle = '#c6f19d';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(readout, bx, by - 1);

      // Compact threshold score tick right on the laser beam in the open left gutter
      const scoreTag = cutScore.toFixed(2);
      const stw = ctx.measureText(scoreTag).width;
      const ty = Math.max(58, Math.min(H - 22, yy - 12));
      ctx.fillStyle = 'rgba(7, 16, 8, 0.88)';
      ctx.fillRect(10, ty - 10, stw + 14, 18);
      ctx.strokeStyle = 'rgba(198, 241, 157, 0.48)';
      ctx.strokeRect(10, ty - 10, stw + 14, 18);
      ctx.fillStyle = '#c6f19d';
      ctx.fillText(scoreTag, 17, ty - 1);
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
        pointer = true;
        target = Math.min(0.92, Math.max(0.10, (e.clientY - r.top) / r.height));
        px = e.clientX - r.left; py = e.clientY - r.top;
      }, { passive: true });
      hero.addEventListener('pointerleave', () => { pointer = false; px = py = -1e4; });
      new IntersectionObserver(([en]) => { running = en.isIntersecting; }).observe(hero);
    }
  }

  /* ---------- ACT II-B: Interactive 3D Optical Specimen Chamber ---------- */
  function chamber() {
    const box = hero && hero.querySelector('.fx-chamber');
    if (!box) return () => {};
    const stage = box.querySelector('.fx-chamber__stage');
    const sets = [...stage.querySelectorAll('.ly-collage__set')];
    if (!sets.length) return () => {};

    // Build top telemetry header + interactive bottom tab bar once
    let head = box.querySelector('.fx-chamber__head');
    if (!head) {
      head = mk('div', 'fx-chamber__head', false);
      head.innerHTML = `<span class="fx-chamber__tag"><i></i><span data-spec-title>${T.specHead[0]}</span></span><span>LIVE SPECIMEN</span>`;
      box.prepend(head);
    }
    let bar = box.querySelector('.fx-chamber__bar');
    if (!bar) {
      bar = mk('div', 'fx-chamber__bar', false);
      bar.innerHTML = T.specTabs.map((tab, i) =>
        `<button type="button" class="fx-chamber__tab${i === 0 ? ' is-on' : ''}" data-spec="${i}" data-cursor="click">${tab.k}<span>${tab.n}</span></button>`
      ).join('') + `<button type="button" class="fx-chamber__pause" aria-label="${T.pause}" aria-pressed="false" data-cursor="click"><svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><rect x="2" y="1.5" width="2.8" height="9" rx="0.6"/><rect x="7.2" y="1.5" width="2.8" height="9" rx="0.6"/></svg></button>`;
      box.append(bar);
    }

    const titleEl = head.querySelector('[data-spec-title]');
    const tabs = [...bar.querySelectorAll('.fx-chamber__tab')];
    const pauseBtn = bar.querySelector('.fx-chamber__pause');
    let cur = 0, paused = false, progTween = null;
    const CYCLE = 4.6;

    const showSet = (idx, animate = true) => {
      if (idx === cur && animate) return;
      const prev = sets[cur], next = sets[idx];
      cur = idx;
      titleEl.textContent = T.specHead[idx] || '';
      tabs.forEach((b, k) => {
        b.classList.toggle('is-on', k === idx);
        b.style.setProperty('--prog', k === idx ? '0' : '0');
      });

      if (animate && prev && prev !== next) {
        gsap.to(prev, {
          autoAlpha: 0, scale: 0.96, duration: 0.38, ease: 'power2.inOut',
          onComplete: () => { prev.classList.remove('is-on'); prev.setAttribute('aria-hidden', 'true'); },
        });
      } else {
        sets.forEach((s, k) => {
          s.classList.toggle('is-on', k === idx);
          s.setAttribute('aria-hidden', String(k !== idx));
          gsap.set(s, { autoAlpha: k === idx ? 1 : 0, scale: 1 });
        });
      }

      next.classList.add('is-on');
      next.removeAttribute('aria-hidden');
      const pieces = next.querySelectorAll('.ly-piece');
      if (animate) {
        gsap.set(next, { autoAlpha: 1, scale: 1 });
        gsap.fromTo(pieces,
          { y: 26, autoAlpha: 0, scale: 0.94 },
          { y: 0, autoAlpha: 1, scale: 1, duration: 0.68, ease: 'expo.out', stagger: 0.065, overwrite: 'auto' }
        );
      }
      scheduleNext();
    };

    const scheduleNext = () => {
      if (progTween) progTween.kill();
      const activeTab = tabs[cur];
      if (paused || matchMedia('(prefers-reduced-motion: reduce)').matches) {
        if (activeTab) activeTab.style.setProperty('--prog', '1');
        return;
      }
      const p = { v: 0 };
      progTween = gsap.to(p, {
        v: 1, duration: CYCLE, ease: 'none',
        onUpdate: () => { if (activeTab) activeTab.style.setProperty('--prog', p.v.toFixed(3)); },
        onComplete: () => showSet((cur + 1) % sets.length, true),
      });
    };

    const setPauseIcon = () => {
      pauseBtn.setAttribute('aria-pressed', String(paused));
      pauseBtn.setAttribute('aria-label', paused ? T.play : T.pause);
      pauseBtn.innerHTML = paused
        ? '<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M2.5 1.5L10.5 6L2.5 10.5Z"/></svg>'
        : '<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><rect x="2" y="1.5" width="2.8" height="9" rx="0.6"/><rect x="7.2" y="1.5" width="2.8" height="9" rx="0.6"/></svg>';
    };

    tabs.forEach((btn, i) => btn.addEventListener('click', () => showSet(i, true)));
    pauseBtn.addEventListener('click', () => { paused = !paused; setPauseIcon(); scheduleNext(); });

    // 3D tilt + specular sheen on desktop fine pointer
    const offs = [];
    if (matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)').matches) {
      const rx = gsap.quickTo(box, 'rotationX', { duration: 0.55, ease: 'power3.out' });
      const ry = gsap.quickTo(box, 'rotationY', { duration: 0.55, ease: 'power3.out' });
      gsap.set(box, { transformPerspective: 1100 });
      const onMove = (e) => {
        if (e.pointerType !== 'mouse') return;
        const r = box.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width;
        const ny = (e.clientY - r.top) / r.height;
        rx((0.5 - ny) * 8);
        ry((nx - 0.5) * 10);
        box.style.setProperty('--sx', `${(nx * 100).toFixed(1)}%`);
        box.style.setProperty('--sy', `${(ny * 100).toFixed(1)}%`);
        box.style.setProperty('--s-op', '1');
      };
      const onLeave = () => { rx(0); ry(0); box.style.setProperty('--s-op', '0'); };
      const onEnter = () => { if (progTween) progTween.pause(); };
      const onOut = () => { if (progTween && !paused) progTween.resume(); };
      box.addEventListener('pointermove', onMove, { passive: true });
      box.addEventListener('pointerleave', onLeave);
      box.addEventListener('pointerenter', onEnter);
      box.addEventListener('pointerleave', onOut);
      offs.push(() => {
        box.removeEventListener('pointermove', onMove);
        box.removeEventListener('pointerleave', onLeave);
        box.removeEventListener('pointerenter', onEnter);
        box.removeEventListener('pointerleave', onOut);
      });
    }

    showSet(0, false);
    return () => { if (progTween) progTween.kill(); offs.forEach((f) => f()); };
  }

  /* ---------- ACT I & II-C: Split-Shutter Preloader + Hero SplitText & Parallax ---------- */
  function heroIn(wipe) {
    if (!hero) {
      // Subpage arrival wipe & H1 reveal
      const h1 = document.querySelector('main h1');
      const runSub = () => {
        if (!h1) return;
        const sp = SplitText.create(h1, { type: 'lines', mask: 'lines' });
        gsap.from(sp.lines, { yPercent: 110, duration: 0.95, ease: 'expo.out', stagger: 0.08, onComplete: () => sp.revert() });
      };
      if (root.classList.contains('fx-wiping')) {
        gsap.set(wipe, { yPercent: 0, visibility: 'visible' });
        root.classList.remove('fx-wiping');
        store.del('fx-wipe');
        gsap.to(wipe, { yPercent: -100, duration: 0.85, ease: 'expo.inOut', delay: 0.04, onComplete: () => gsap.set(wipe, { yPercent: 100, visibility: 'hidden' }) });
        gsap.delayedCall(0.35, runSub);
      } else {
        runSub();
      }
      return () => {};
    }

    // Inject telemetry eyebrow + scroll cue cleanly into hero
    const copy = hero.querySelector('.hero__copy');
    if (copy && !copy.querySelector('.fx-eyebrow')) {
      const eb = mk('div', 'fx-eyebrow', false);
      eb.innerHTML = `<span class="fx-eyebrow__pulse" aria-hidden="true"></span><span>${T.eyebrow}</span>`;
      copy.prepend(eb);
    }
    const cta = hero.querySelector('.hero__cta');
    if (cta && !cta.querySelector('.fx-scroll-cue')) {
      const cue = mk('span', 'fx-scroll-cue');
      cue.innerHTML = `<i></i><span>${T.scrollCue}</span>`;
      cta.append(cue);
    }

    const h1 = hero.querySelector('h1');
    const split = SplitText.create(h1, { type: 'lines,words,chars', mask: 'lines' });
    const chamberEl = hero.querySelector('.fx-chamber');
    const pieces = hero.querySelectorAll('.fx-chamber .ly-collage__set.is-on .ly-piece');

    const tl = gsap.timeline({ paused: true, onComplete: () => split.revert() });
    tl.from(hero.querySelectorAll('.fx-eyebrow'), { y: 18, autoAlpha: 0, duration: 0.65, ease: 'power3.out' })
      .from(split.chars, { yPercent: 120, rotateX: -36, transformOrigin: '0% 100%', duration: 1.05, ease: 'expo.out', stagger: 0.018 }, '-=0.4')
      .from(hero.querySelectorAll('.hero__lead, .hero__cta'), { y: 26, autoAlpha: 0, duration: 0.85, ease: 'power3.out', stagger: 0.09 }, '-=0.78')
      .from(chamberEl, { y: 48, scale: 0.94, autoAlpha: 0, duration: 1.0, ease: 'expo.out' }, '<-0.15')
      .from(pieces, { y: 34, autoAlpha: 0, duration: 0.78, ease: 'expo.out', stagger: 0.07 }, '-=0.62');

    // Precision Split-Shutter Calibration Curtain
    const runPreloader = (onOpen) => {
      const L = mk('div', 'fx-loader');
      L.innerHTML = `
        <div class="fx-loader__plate fx-loader__plate--top"></div>
        <div class="fx-loader__plate fx-loader__plate--bot"></div>
        <div class="fx-loader__bar"></div>
        <div class="fx-loader__hud">
          <div class="fx-loader__meta">
            <span>${T.preMeta}</span>
            <span class="fx-loader__status"><span class="fx-loader__dot"></span><span data-pre-st>${T.preBusy}</span></span>
          </div>
          <div class="fx-loader__center">
            <span class="fx-loader__n"><span class="v">17.2</span><i>%</i></span>
            <span class="fx-loader__sub">${T.preSub}</span>
          </div>
        </div>`;
      document.body.append(L);
      root.classList.remove('fx-intro');
      const v = { n: 17.2 };
      const out = L.querySelector('.v');
      const st = L.querySelector('[data-pre-st]');
      const bar = L.querySelector('.fx-loader__bar');
      const hud = L.querySelector('.fx-loader__hud');
      const topP = L.querySelector('.fx-loader__plate--top');
      const botP = L.querySelector('.fx-loader__plate--bot');

      gsap.timeline({ onComplete: () => { L.remove(); store.set('fx-seen', '1'); } })
        .to(v, { n: 2.7, duration: 1.32, ease: 'power3.inOut', onUpdate: () => { out.textContent = v.n.toFixed(1); } })
        .to(bar, { scaleX: 1, duration: 1.32, ease: 'power3.inOut' }, 0)
        .add(() => { st.textContent = T.preDone; })
        .to([hud, bar], { autoAlpha: 0, duration: 0.28, ease: 'power2.in' }, '+=0.18')
        .to(topP, { yPercent: -102, duration: 0.92, ease: 'expo.inOut' }, '-=0.08')
        .to(botP, { yPercent: 102, duration: 0.92, ease: 'expo.inOut' }, '<')
        .add(() => { if (onOpen) onOpen(); }, '-=0.58');
    };

    playIntroNow = () => runPreloader(null);

    if (root.classList.contains('fx-intro')) {
      runPreloader(() => tl.play());
    } else if (root.classList.contains('fx-wiping')) {
      gsap.set(wipe, { yPercent: 0, visibility: 'visible' });
      root.classList.remove('fx-wiping');
      store.del('fx-wipe');
      gsap.to(wipe, { yPercent: -100, duration: 0.88, ease: 'expo.inOut', delay: 0.05, onComplete: () => gsap.set(wipe, { yPercent: 100, visibility: 'hidden' }) });
      gsap.delayedCall(0.4, () => tl.play());
    } else {
      tl.play();
    }

    // Hero scroll-scrubbed parallax handoff into #gate (desktop)
    let para = null;
    if (matchMedia('(min-width: 1024px)').matches) {
      para = gsap.timeline({
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      })
        .to(hero.querySelector('.fx-field'), { scale: 1.08, ease: 'none' }, 0)
        .to(hero.querySelector('.hero__copy'), { y: -72, autoAlpha: 0.25, ease: 'none' }, 0)
        .to(chamberEl, { y: -38, ease: 'none' }, 0);
    }

    return () => { tl.kill(); split.revert(); if (para) para.kill(); };
  }

  /* ---------- ACT III: Scrubbed Aperture Review Desk (#gate) + Clickable Queue Rows ---------- */
  function reviewDesk() {
    const gate = document.getElementById('gate');
    const app = document.getElementById('gate-app');
    const cut = document.getElementById('gate-cut');
    const verdict = document.getElementById('gate-verdict');
    if (!gate || !app) return () => {};

    const scrub = gsap.fromTo(app,
      { y: 44, scale: 0.955, clipPath: 'inset(5% 2% 5% 2% round 10px)' },
      {
        y: 0, scale: 1, clipPath: 'inset(0% 0% 0% 0% round 6px)', ease: 'none',
        scrollTrigger: { trigger: gate, start: 'top 84%', end: 'top 24%', scrub: 0.65 },
      }
    );

    const syncPolarity = () => {
      if (!verdict) return;
      const isPass = verdict.classList.contains('ui-chip--accent');
      app.classList.toggle('is-alert', !isPass);
    };
    if (cut) {
      cut.setAttribute('data-cursor', 'drag');
      cut.addEventListener('input', syncPolarity);
      syncPolarity();
    }

    // Click any row in the left queue -> smoothly animate pass mark to test that exact field
    const rows = [...document.querySelectorAll('#gate-rows [data-score]')];
    const rowHandlers = [];
    rows.forEach((row) => {
      row.setAttribute('data-cursor', 'inspect');
      const onClick = () => {
        if (!cut) return;
        const sc = Math.max(+cut.min, Math.min(+cut.max, +row.dataset.score));
        rows.forEach((r) => r.classList.toggle('is-selected', r === row));
        const obj = { v: +cut.value };
        gsap.to(obj, {
          v: sc, duration: 0.55, ease: 'power3.out',
          onUpdate: () => {
            cut.value = obj.v.toFixed(2);
            cut.dispatchEvent(new Event('input', { bubbles: true }));
          },
        });
      };
      row.addEventListener('click', onClick);
      rowHandlers.push(() => row.removeEventListener('click', onClick));
    });

    return () => {
      scrub.kill();
      if (cut) cut.removeEventListener('input', syncPolarity);
      rowHandlers.forEach((f) => f());
    };
  }

  /* ---------- ACT IV: Pinned Kinetic Typographic Manifesto (#method) ---------- */
  function manifesto() {
    const sec = document.getElementById('method');
    if (!sec) return () => {};
    const h = sec.querySelector('h2');
    const sub = sec.querySelector('.mo-la__sub');
    if (!h) return () => {};

    const origHTML = h.innerHTML;
    const raw = h.textContent.trim();
    const parts = isZh ? [...raw] : raw.split(/\s+/);
    const accentIdx = parts.length - 1;
    h.innerHTML = parts.map((w, i) =>
      `<span class="fx-manifesto__word${i === accentIdx ? ' is-accent' : ''}">${w}<span aria-hidden="true">${w}</span></span>`
    ).join(isZh ? '' : ' ');

    const rule = mk('div', 'fx-manifesto__rule');
    rule.innerHTML = '<i></i>';
    h.after(rule);

    const fills = h.querySelectorAll('.fx-manifesto__word > span');
    const bar = rule.querySelector('i');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sec,
        pin: true,
        start: 'top top',
        end: () => '+=' + Math.round(window.innerHeight * 1.15),
        scrub: 0.65,
        anticipatePin: 1,
      },
    });
    tl.to(fills, { clipPath: 'inset(-18% 0% -28% 0)', ease: 'none', stagger: 0.14, duration: 0.65 }, 0)
      .to(bar, { scaleX: 1, ease: 'none', duration: 0.7 }, 0.1)
      .from(sub, { y: 26, autoAlpha: 0, ease: 'power2.out', duration: 0.35 }, 0.45);

    return () => {
      tl.kill();
      rule.remove();
      h.innerHTML = origHTML;
    };
  }

  /* ---------- ACT V: Velocity-Coupled Pinned Horizontal Showcase ---------- */
  function reel() {
    const secs = REEL.map((id) => document.getElementById(id)).filter(Boolean);
    if (secs.length < 2) return null;

    const box = mk('div', 'fx-reel', false);
    const track = mk('div', 'fx-reel__track', false);
    secs[0].before(box);
    box.append(track);
    track.append(...secs);

    const ui = mk('div', 'fx-reel__ui', false);
    ui.innerHTML = `<div class="wrap">
      <div class="fx-reel__chapters" role="tablist" aria-label="Featured projects">
        ${T.chaps.map((lbl, i) => `<button type="button" class="fx-reel__chap${i === 0 ? ' is-on' : ''}" data-reel-idx="${i}" data-cursor="click">${lbl}</button>`).join('')}
      </div>
      <span class="fx-reel__bar"><i></i></span>
      <span class="fx-reel__count"><span class="fx-reel__n">01</span> / 0${secs.length}</span>
    </div>`;
    box.append(ui);

    const num = ui.querySelector('.fx-reel__n');
    const bar = ui.querySelector('.fx-reel__bar i');
    const chapBtns = [...ui.querySelectorAll('.fx-reel__chap')];
    const dist = () => secs[secs.length - 1].offsetLeft;

    // Velocity-coupled skew on visual frames
    const tiltEls = secs.map((s) => s.querySelector('.frame, .grid:last-child')).filter(Boolean);
    tiltEls.forEach((t) => t.classList.add('fx-tilt-target'));
    const skewSetters = tiltEls.map((t) => gsap.quickTo(t, 'skewX', { duration: 0.42, ease: 'power3.out' }));

    reelTween = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: box,
        pin: true,
        start: 'top top',
        end: () => '+=' + (secs.length - 1) * window.innerHeight * 1.6,
        scrub: 0.78,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        snap: { snapTo: 1 / (secs.length - 1), inertia: false, duration: { min: 0.28, max: 0.72 }, delay: 0.08, ease: 'power2.inOut' },
        onToggle: (self) => {
          root.classList.toggle('fx-in-reel', self.isActive);
          if (!self.isActive) {
            root.classList.remove('fx-on-light');
            skewSetters.forEach((fn) => fn(0));
          }
        },
        onUpdate: (self) => {
          bar.style.transform = `scaleX(${self.progress})`;
          const idx = Math.round(self.progress * (secs.length - 1));
          num.textContent = '0' + (idx + 1);
          chapBtns.forEach((b, k) => b.classList.toggle('is-on', k === idx));
          // Polarity inversion smoothly tracks when #longhaul (panel 1) dominates the viewport
          const onLight = self.isActive && self.progress > 0.27 && self.progress < 0.73;
          root.classList.toggle('fx-on-light', onLight);
          const v = gsap.utils.clamp(-3.2, 3.2, self.getVelocity() / -650);
          skewSetters.forEach((fn) => fn(v));
        },
      },
    });

    // Per-panel entrance choreography via containerAnimation
    secs.forEach((s, i) => {
      const h = s.querySelector('h2');
      const at = i === 0
        ? { trigger: box, start: 'top 76%' }
        : { containerAnimation: reelTween, trigger: s, start: 'left 65%' };
      if (h) {
        SplitText.create(h, {
          type: 'lines', mask: 'lines', autoSplit: true,
          onSplit: (self) => gsap.from(self.lines, {
            yPercent: 108, duration: 1.0, ease: 'expo.out', stagger: 0.085,
            scrollTrigger: { ...at, once: true },
          }),
        });
      }
      if (i > 0) {
        const wrap = s.querySelector(':scope > .wrap');
        if (wrap) {
          gsap.fromTo(wrap, { x: 96 }, {
            x: 0, ease: 'none',
            scrollTrigger: { containerAnimation: reelTween, trigger: s, start: 'left right', end: 'left left', scrub: true },
          });
        }
      }
    });

    // Panel 02 (#longhaul): progressive SVG stroke drawing scrubbed via containerAnimation
    const lh = document.getElementById('longhaul');
    if (lh) {
      const paths = [...lh.querySelectorAll('.lh-chart svg path.s-go, .lh-chart svg path.s-hold, .lh-chart svg path.s-aux')].filter((p) => (p.getAttribute('d') || '').includes('L'));
      const dots = [...lh.querySelectorAll('.lh-chart svg circle')];
      paths.forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(p, {
          strokeDashoffset: 0, ease: 'none',
          scrollTrigger: { containerAnimation: reelTween, trigger: lh, start: 'left 78%', end: 'left 18%', scrub: true },
        });
      });
      if (dots.length) {
        gsap.from(dots, {
          scale: 0, transformOrigin: 'center center', stagger: 0.025, duration: 0.45, ease: 'back.out(2)',
          scrollTrigger: { containerAnimation: reelTween, trigger: lh, start: 'left 55%', once: true },
        });
      }
    }

    // Panel 03 (#knowledge): staggered 3D card cascade
    const kn = document.getElementById('knowledge');
    if (kn) {
      const cards = kn.querySelectorAll('.card');
      if (cards.length) {
        gsap.from(cards, {
          y: 48, autoAlpha: 0, duration: 0.85, ease: 'expo.out', stagger: 0.12,
          scrollTrigger: { containerAnimation: reelTween, trigger: kn, start: 'left 68%', once: true },
        });
      }
    }

    const jump = (id, smooth) => {
      const i = REEL.indexOf(id), st = reelTween && reelTween.scrollTrigger;
      if (i < 0 || !st) return false;
      window.scrollTo({
        top: st.start + (st.end - st.start) * (i / (secs.length - 1)) + 1,
        behavior: smooth ? 'smooth' : 'instant',
      });
      return true;
    };

    chapBtns.forEach((b) => b.addEventListener('click', () => jump(REEL[+b.dataset.reelIdx], true)));

    const click = (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (a && jump(a.getAttribute('href').slice(1), true)) {
        e.preventDefault();
        history.replaceState(null, '', a.getAttribute('href'));
      }
    };
    document.addEventListener('click', click, true);
    if (REEL.includes(location.hash.slice(1))) {
      ScrollTrigger.addEventListener('refresh', function once() {
        ScrollTrigger.removeEventListener('refresh', once);
        requestAnimationFrame(() => jump(location.hash.slice(1), false));
      });
    }

    return () => {
      document.removeEventListener('click', click, true);
      root.classList.remove('fx-in-reel', 'fx-on-light');
      reelTween = null;
      box.before(...secs);
      box.remove();
      secs.forEach((s) => {
        const w = s.querySelector(':scope > .wrap');
        if (w) w.style.removeProperty('transform');
      });
    };
  }

  /* ---------- Interactive Panel Craft (works on BOTH desktop reel & mobile stack) ---------- */
  function panelInteractions() {
    // 1. Fieldgate: OCR scanbeam + interactive receipt marks
    const fgPage = document.querySelector('#fieldgate .ui-doc__page');
    if (fgPage && !fgPage.querySelector('.fx-ocr-beam')) {
      fgPage.append(mk('div', 'fx-ocr-beam'));
    }
    const marks = [...document.querySelectorAll('#fieldgate .ui-doc__mark')];
    const kindEl = document.querySelector('#fieldgate [data-doc-kind]');
    const msgEl = document.querySelector('#fieldgate [data-doc-msg]');
    const whereEl = document.querySelector('#fieldgate [data-doc-where]');
    if (marks.length && kindEl && msgEl && whereEl) {
      const defaults = { kind: kindEl.textContent, msg: msgEl.textContent, where: whereEl.textContent };
      marks.forEach((m, i) => {
        m.setAttribute('data-cursor', 'inspect');
        m.addEventListener('click', () => {
          marks.forEach((x) => x.classList.toggle('is-on', x === m));
          kindEl.textContent = i === 0 ? defaults.kind : (m.dataset.kind || defaults.kind);
          msgEl.textContent = i === 0 ? defaults.msg : (m.dataset.msg || defaults.msg);
          whereEl.textContent = i === 0 ? defaults.where : (m.dataset.where || defaults.where);
          const note = document.querySelector('#fieldgate .ui-doc__note');
          if (note) gsap.fromTo(note, { y: 6, scale: 0.98 }, { y: 0, scale: 1, duration: 0.35, ease: 'power3.out' });
        });
      });
    }

    // 2. Longhaul: interactive SVG chart hover tooltip
    const lhFrame = document.querySelector('#longhaul .frame');
    const lhSvg = lhFrame && lhFrame.querySelector('.lh-chart svg');
    if (lhFrame && lhSvg && !lhFrame.querySelector('.fx-chart-tip')) {
      const tip = mk('div', 'fx-chart-tip');
      lhFrame.append(tip);
      lhSvg.querySelectorAll('circle').forEach((c) => {
        const title = c.querySelector('title');
        if (!title) return;
        const txt = title.textContent;
        c.setAttribute('data-cursor', 'inspect');
        c.addEventListener('pointerenter', () => {
          const fr = lhFrame.getBoundingClientRect();
          const cr = c.getBoundingClientRect();
          tip.textContent = txt;
          tip.style.left = `${cr.left - fr.left + cr.width / 2}px`;
          tip.style.top = `${cr.top - fr.top}px`;
          tip.classList.add('is-on');
        });
        c.addEventListener('pointerleave', () => tip.classList.remove('is-on'));
      });
    }

    // 3. Knowledge: interactive "Approve note" button in diff review
    const applyBtn = document.querySelector('#knowledge [data-diff-apply]');
    const actWrap = document.querySelector('#knowledge [data-diff-act]');
    if (applyBtn && actWrap) {
      applyBtn.removeAttribute('tabindex');
      applyBtn.setAttribute('data-cursor', 'approve');
      applyBtn.addEventListener('click', () => {
        actWrap.classList.add('is-approved');
        const done = actWrap.querySelector('.ui-diff__done');
        if (done) gsap.fromTo(done, { scale: 0.85, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.4, ease: 'back.out(2)' });
        setTimeout(() => actWrap.classList.remove('is-approved'), 4200);
      });
    }

    // 4. Questions: wrap tool icons in glass micro-cells with tooltips
    const toolsWrap = document.querySelector('#questions .tools');
    if (toolsWrap && !toolsWrap.querySelector('.fx-tool-cell')) {
      [...toolsWrap.querySelectorAll('img')].forEach((img) => {
        const cell = document.createElement('span');
        cell.className = 'fx-tool-cell';
        cell.setAttribute('data-name', img.alt || '');
        img.before(cell);
        cell.append(img);
      });
    }
  }

  /* ---------- Section Headings & Subpage Card Reveals ---------- */
  function headings() {
    document.querySelectorAll('main h2, footer.closing h2').forEach((h) => {
      if (h.closest('#method') || (reelTween && h.closest('.fx-reel'))) return;
      SplitText.create(h, {
        type: 'lines', mask: 'lines', autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, {
          yPercent: 108, duration: 0.98, ease: 'expo.out', stagger: 0.085,
          scrollTrigger: { trigger: h, start: 'top 88%', once: true },
        }),
      });
    });

    // Questions audit ledger rows
    const faqs = document.querySelectorAll('#questions .faq__item');
    if (faqs.length) {
      gsap.from(faqs, {
        y: 28, autoAlpha: 0, duration: 0.72, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: '#questions .faq', start: 'top 84%', once: true },
      });
    }

    // Subpage cards (projects.html & case studies)
    if (!hero) {
      document.querySelectorAll('main section').forEach((sec) => {
        const cards = sec.querySelectorAll('.card, .proj-card, .case-card, .soar__card');
        if (cards.length) {
          gsap.from(cards, {
            y: 34, autoAlpha: 0, duration: 0.75, ease: 'expo.out', stagger: 0.075,
            scrollTrigger: { trigger: sec, start: 'top 82%', once: true },
          });
        }
      });
    }
  }

  /* ---------- ACT VII: Monumental Cursor-Spotlight EAGLE Wordmark ---------- */
  function footerMark() {
    const f = document.querySelector('footer.closing');
    if (!f) return null;
    const base = mk('div', 'fx-mark');
    const lit = mk('div', 'fx-mark fx-mark--lit');
    const letters = [...'Eagle'].map((c) => `<span class="fx-ch">${c}</span>`).join('');
    base.innerHTML = letters;
    lit.innerHTML = letters;
    f.append(base, lit);

    const anim = gsap.from([base.children, lit.children], {
      yPercent: 112, ease: 'none', stagger: 0.08,
      scrollTrigger: { trigger: f, start: 'top 86%', end: 'bottom bottom', scrub: 0.6 },
    });

    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = lit.getBoundingClientRect();
      lit.style.setProperty('--fx', `${(e.clientX - r.left).toFixed(0)}px`);
      lit.style.setProperty('--fy', `${(e.clientY - r.top).toFixed(0)}px`);
    };
    f.addEventListener('pointermove', onMove, { passive: true });

    return () => { anim.kill(); f.removeEventListener('pointermove', onMove); base.remove(); lit.remove(); };
  }

  /* ---------- Floating Index Dock & Corner Telemetry HUD (Home Desktop) ---------- */
  function hud() {
    if (!hero) return () => {};
    const wrap = mk('div', 'fx-hud', false);
    wrap.innerHTML = `
      <div class="fx-hud__corner fx-hud__corner--left">
        <span>BENCH <b data-hud-pct>00%</b></span>
        <button type="button" class="fx-hud__replay" data-cursor="click">${T.replay}</button>
      </div>
      <nav class="fx-hud__dock" aria-label="Section index">
        ${T.dock.map((d, i) => `<a href="${d.href}"${i === 0 ? ' class="is-on"' : ''}>${d.label}</a>`).join('')}
      </nav>
      <div class="fx-hud__corner fx-hud__corner--right" aria-hidden="true">
        <span>VEL <b data-hud-vel>00.0</b> PX/F</span>
      </div>`;
    document.body.append(wrap);

    const pctEl = wrap.querySelector('[data-hud-pct]');
    const velEl = wrap.querySelector('[data-hud-vel]');
    const dockLinks = [...wrap.querySelectorAll('.fx-hud__dock a')];
    const replayBtn = wrap.querySelector('.fx-hud__replay');

    replayBtn.addEventListener('click', () => {
      if (playIntroNow) playIntroNow();
    });

    let lastY = scrollY, vel = 0;
    const tick = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const pct = Math.round(Math.min(100, Math.max(0, (scrollY / max) * 100)));
      pctEl.textContent = String(pct).padStart(2, '0') + '%';
      const dy = Math.abs(scrollY - lastY);
      lastY = scrollY;
      vel += (dy - vel) * 0.22;
      velEl.textContent = Math.min(99.9, vel).toFixed(1).padStart(4, '0');
    };
    gsap.ticker.add(tick);

    // Track active section in dock accurately across hero, queue/manifesto, reel, and audit/footer
    const setActive = (idx) => dockLinks.forEach((a, k) => a.classList.toggle('is-on', k === idx));
    const pairs = [
      [hero, 0],
      [document.getElementById('gate'), 1],
      [document.getElementById('method'), 1],
      [document.querySelector('.fx-reel') || document.getElementById('fieldgate'), 2],
      [document.getElementById('questions'), 3],
      [document.querySelector('footer.closing'), 3],
    ];
    const triggers = pairs.map(([el, idx]) => {
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 45%',
        onEnter: () => setActive(idx),
        onEnterBack: () => setActive(idx),
      });
    }).filter(Boolean);

    return () => {
      gsap.ticker.remove(tick);
      triggers.forEach((t) => t.kill());
      wrap.remove();
    };
  }

  /* ---------- Smart Contextual Reticle Cursor & Magnetic Buttons ---------- */
  function cursor() {
    const ring = mk('div', 'fx-cursor');
    ring.innerHTML = '<span class="fx-cursor__lbl"></span>';
    const lbl = ring.querySelector('.fx-cursor__lbl');
    const dot = mk('div', 'fx-cursor-dot');
    document.body.append(ring, dot);

    const rx = gsap.quickTo(ring, 'x', { duration: 0.42, ease: 'power3' });
    const ry = gsap.quickTo(ring, 'y', { duration: 0.42, ease: 'power3' });
    const dx = gsap.quickTo(dot, 'x', { duration: 0.08 });
    const dy = gsap.quickTo(dot, 'y', { duration: 0.08 });

    const labelMap = {
      inspect: T.curInspect,
      drag: T.curDrag,
      open: T.curOpen,
      click: T.curClick,
      approve: T.curApprove,
    };

    const move = (e) => {
      if (e.pointerType !== 'mouse') return;
      rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY);
      root.classList.add('fx-has-cursor');
    };
    const over = (e) => {
      const custom = e.target.closest && e.target.closest('[data-cursor]');
      const ext = e.target.closest && e.target.closest('a[href^="http"], .proj-card a, .link');
      const interactive = e.target.closest && e.target.closest('a, button, [role="slider"], input, select, summary, label');

      const mode = custom ? custom.dataset.cursor : (ext ? 'open' : null);
      if (mode && labelMap[mode]) {
        lbl.textContent = labelMap[mode];
        ring.classList.add('is-label');
        ring.classList.remove('is-link');
      } else {
        ring.classList.remove('is-label');
        ring.classList.toggle('is-link', !!interactive);
      }
    };
    const out = () => root.classList.remove('fx-has-cursor');

    addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', over);
    document.addEventListener('pointerleave', out);
    return () => {
      removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', over);
      document.removeEventListener('pointerleave', out);
      ring.remove(); dot.remove();
      root.classList.remove('fx-has-cursor');
    };
  }

  function magnets() {
    const offs = [];
    document.querySelectorAll('.btn').forEach((b) => {
      const move = (e) => {
        if (e.pointerType !== 'mouse') return;
        const r = b.getBoundingClientRect();
        gsap.to(b, {
          '--mx': ((e.clientX - r.left - r.width / 2) * 0.24).toFixed(1) + 'px',
          '--my': ((e.clientY - r.top - r.height / 2) * 0.34).toFixed(1) + 'px',
          duration: 0.38, ease: 'power3.out', overwrite: 'auto',
        });
      };
      const leave = () => gsap.to(b, { '--mx': '0px', '--my': '0px', duration: 0.85, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });
      b.addEventListener('pointermove', move);
      b.addEventListener('pointerleave', leave);
      offs.push(() => {
        b.removeEventListener('pointermove', move);
        b.removeEventListener('pointerleave', leave);
        b.style.removeProperty('--mx'); b.style.removeProperty('--my');
      });
    });
    return () => offs.forEach((f) => f());
  }

  /* ---------- Two-Way Lime Page Wipe ---------- */
  function exits(wipe) {
    const click = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search)) return;
      if (/\.(pdf|zip|png|jpe?g|webp|svg)$/i.test(u.pathname)) return;
      e.preventDefault();
      store.set('fx-wipe', String(Date.now()));
      gsap.fromTo(wipe, { yPercent: 100, visibility: 'visible' }, {
        yPercent: 0, duration: 0.58, ease: 'expo.in',
        onComplete: () => { location.href = u.href; },
      });
    };
    document.addEventListener('click', click);
    return () => document.removeEventListener('click', click);
  }

  /* ---------- Bootstrap (strictly top-to-bottom ScrollTrigger order) ---------- */
  function start() {
    atmosphere();
    const wipe = mk('div', 'fx-wipe');
    wipe.textContent = T.wipeLbl;
    document.body.append(wipe);
    gsap.set(wipe, { yPercent: 100 });
    addEventListener('pageshow', (e) => { if (e.persisted) gsap.set(wipe, { yPercent: 100, visibility: 'hidden' }); });

    field();
    panelInteractions();

    const motion = '(prefers-reduced-motion: no-preference)';
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: reduce)', () => {
      root.classList.remove('fx-intro', 'fx-wiping');
      return chamber();
    });

    mm.add(motion, () => {
      root.classList.add('fx');
      const offs = [chamber(), heroIn(wipe), reviewDesk(), exits(wipe)];
      return () => { offs.forEach((f) => f && f()); root.classList.remove('fx'); };
    });

    // Desktop-only pinned acts created strictly top -> bottom: #method then #reel
    mm.add(`${motion} and (min-width: 1024px)`, () => {
      const mOff = manifesto();
      const rOff = reel();
      const hOff = hud();
      return () => { if (hOff) hOff(); if (rOff) rOff(); if (mOff) mOff(); };
    });

    mm.add(motion, () => {
      headings();
      return footerMark();
    });

    mm.add(`${motion} and (hover: hover) and (pointer: fine)`, () => {
      const cOff = cursor(), mOff = magnets();
      return () => { cOff(); mOff(); };
    });

    addEventListener('load', () => ScrollTrigger.refresh());
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start);
})();
