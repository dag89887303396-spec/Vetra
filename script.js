'use strict';
/* VetraEstate — script v3 */

/* ══════════════════════════════════════
   PRELOADER
══════════════════════════════════════ */
(function initLoader() {
  const loader = document.getElementById('page-loader');
  const pct = document.getElementById('loaderPct');
  if (!loader) return;
  let p = 0;
  const iv = setInterval(() => {
    p = Math.min(p + Math.random() * 18, 99);
    if (pct) pct.textContent = Math.floor(p) + '%';
  }, 80);
  window.addEventListener('load', () => {
    clearInterval(iv);
    if (pct) pct.textContent = '100%';
    setTimeout(() => loader.classList.add('hidden'), 400);
  });
  setTimeout(() => loader.classList.add('hidden'), 2600);
})();

/* ══════════════════════════════════════
   HERO CANVAS — Aurora / Nebula
══════════════════════════════════════ */
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, t = 0;

  const blobs = [
    { x: 0.2, y: 0.3, r: 420, color: 'rgba(10,20,80,0.70)', vx: 0.00015, vy: 0.0001, phase: 0 },
    { x: 0.75, y: 0.4, r: 380, color: 'rgba(50,10,80,0.50)', vx: -0.00012, vy: 0.00018, phase: 1.2 },
    { x: 0.5, y: 0.65, r: 460, color: 'rgba(5,40,50,0.40)', vx: 0.0001, vy: -0.00015, phase: 2.5 },
    { x: 0.15, y: 0.7, r: 320, color: 'rgba(80,55,5,0.30)', vx: 0.00018, vy: 0.0001, phase: 0.8 },
    { x: 0.85, y: 0.6, r: 350, color: 'rgba(10,20,80,0.55)', vx: -0.00016, vy: -0.00012, phase: 3.2 },
    { x: 0.5, y: 0.2, r: 300, color: 'rgba(60,20,5,0.25)', vx: 0.00008, vy: 0.00022, phase: 1.8 },
  ];

  const particles = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    particles.length = 0;
    const count = Math.min(Math.floor(W * H / 9000), 80);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.5,
        vy: -(Math.random() * 0.3 + 0.05),
        vx: (Math.random() - 0.5) * 0.1,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0C0C0C';
    ctx.fillRect(0, 0, W, H);

    // Blobs
    blobs.forEach(b => {
      const bx = (b.x + Math.sin(t * b.vx * 1000 + b.phase) * 0.18) * W;
      const by = (b.y + Math.cos(t * b.vy * 1000 + b.phase) * 0.14) * H;
      const grad = ctx.createRadialGradient(bx, by, 0, bx, by, b.r * (W / 1440));
      grad.addColorStop(0, b.color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(bx, by, b.r * (W / 1440), 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    // Vignette overlay
    const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.1, W / 2, H / 2, W * 0.75);
    vig.addColorStop(0, 'rgba(12,12,12,0)');
    vig.addColorStop(1, 'rgba(12,12,12,0.85)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    // Particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${p.alpha})`;
      ctx.fill();
    });

    t++;
    requestAnimationFrame(draw);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement || document.body);
  resize();
  draw();
})();

/* ══════════════════════════════════════
   ABOUT CANVAS — Building construction
══════════════════════════════════════ */
(function initAboutCanvas() {
  const canvas = document.getElementById('aboutCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, t = 0;

  function resize() {
    const p = canvas.parentElement;
    if (!p) return;
    W = canvas.width = p.offsetWidth;
    H = canvas.height = p.offsetHeight;
  }

  function drawBuilding() {
    ctx.clearRect(0, 0, W, H);

    const floors = Math.min(12, Math.floor(t / 60) + 2);
    const maxFloors = 12;
    const bw = W * 0.55;
    const bx = (W - bw) / 2;
    const floorH = (H * 0.7) / maxFloors;
    const baseY = H * 0.88;

    // Grid background
    ctx.strokeStyle = 'rgba(201,168,76,0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Ground
    ctx.fillStyle = 'rgba(201,168,76,0.15)';
    ctx.fillRect(bx - 20, baseY, bw + 40, 3);

    // Floors
    for (let f = 0; f < floors; f++) {
      const fy = baseY - (f + 1) * floorH;
      const alpha = 0.06 + (f / floors) * 0.06;
      ctx.fillStyle = `rgba(201,168,76,${alpha})`;
      ctx.fillRect(bx, fy, bw, floorH - 2);
      ctx.strokeStyle = 'rgba(201,168,76,0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, fy, bw, floorH - 2);

      // Windows
      const cols = 4;
      const ww = bw / (cols + 1) * 0.5;
      const wh = floorH * 0.45;
      for (let c = 0; c < cols; c++) {
        const wx = bx + (bw / (cols + 1)) * (c + 1) - ww / 2;
        const wy = fy + (floorH - wh) / 2;
        const lit = Math.sin(t * 0.02 + f * 0.4 + c * 0.7) > 0.2;
        ctx.fillStyle = lit ? 'rgba(232,201,122,0.4)' : 'rgba(201,168,76,0.05)';
        ctx.fillRect(wx, wy, ww, wh);
        ctx.strokeStyle = 'rgba(201,168,76,0.3)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(wx, wy, ww, wh);
      }
    }

    // Crane (top floor being built)
    if (floors < maxFloors) {
      const craneY = baseY - floors * floorH - 30;
      ctx.strokeStyle = 'rgba(201,168,76,0.5)';
      ctx.lineWidth = 2;
      // Vertical
      ctx.beginPath();
      ctx.moveTo(bx + bw * 0.8, baseY - floors * floorH);
      ctx.lineTo(bx + bw * 0.8, craneY - 40);
      ctx.stroke();
      // Horizontal arm
      ctx.beginPath();
      ctx.moveTo(bx + bw * 0.2, craneY - 40);
      ctx.lineTo(bx + bw * 1.1, craneY - 40);
      ctx.stroke();
      // Cable
      const cableX = bx + bw * 0.3 + Math.sin(t * 0.03) * 15;
      ctx.beginPath();
      ctx.moveTo(bx + bw * 0.35, craneY - 40);
      ctx.lineTo(cableX, craneY);
      ctx.stroke();
      // Block
      ctx.fillStyle = 'rgba(201,168,76,0.3)';
      ctx.fillRect(cableX - 10, craneY, 20, 14);
    }

    // Progress text
    ctx.fillStyle = 'rgba(201,168,76,0.45)';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Этаж ${floors} / ${maxFloors}`, W / 2, H * 0.95);

    t++;
    requestAnimationFrame(drawBuilding);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement || document.body);
  resize();
  drawBuilding();
})();

/* ══════════════════════════════════════
   NAVBAR
══════════════════════════════════════ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
    });
    links.addEventListener('click', e => {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        toggle.classList.remove('open');
      }
    });
  }
})();

/* ══════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════ */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
})();

/* ══════════════════════════════════════
   COUNTER ANIMATION
══════════════════════════════════════ */
(function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const dur = 1600;
      const step = dur / 60;
      let cur = 0;
      const iv = setInterval(() => {
        cur += target / (dur / step);
        if (cur >= target) { el.textContent = target; clearInterval(iv); }
        else el.textContent = Math.floor(cur);
      }, step);
    });
  }, { threshold: 0.4 });
  counters.forEach(c => obs.observe(c));
})();

/* ══════════════════════════════════════
   LIGHTBOX
══════════════════════════════════════ */
(function initLightbox() {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const close = document.getElementById('lightbox-close');
  if (!lb) return;

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      img.src = item.dataset.src || item.querySelector('img').src;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLb() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { img.src = ''; }, 300);
  }

  close.addEventListener('click', closeLb);
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
})();

/* ══════════════════════════════════════
   FILTER BAR
══════════════════════════════════════ */
(function initFilter() {
  const bar = document.querySelector('.filter-bar');
  const grid = document.getElementById('projectsGrid');
  if (!bar || !grid) return;

  bar.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    grid.querySelectorAll('.project-card:not(.project-card-more)').forEach(card => {
      const tags = card.dataset.tags || '';
      const show = filter === 'all' || tags.includes(filter);
      card.style.opacity = show ? '1' : '0';
      card.style.transform = show ? '' : 'scale(0.95)';
      card.style.pointerEvents = show ? '' : 'none';
      card.style.transition = 'opacity 0.4s, transform 0.4s';
    });
  });
})();

/* ══════════════════════════════════════
   MORTGAGE CALCULATOR
══════════════════════════════════════ */
(function initCalculator() {
  const priceEl = document.getElementById('priceSlider');
  const downEl = document.getElementById('downSlider');
  const termEl = document.getElementById('termSlider');
  if (!priceEl || !downEl || !termEl) return;

  function fmt(n) {
    return n.toLocaleString('ru-RU') + ' ₽';
  }

  function calc() {
    const price = parseInt(priceEl.value, 10);
    const down = parseInt(downEl.value, 10);
    const term = parseInt(termEl.value, 10);
    const rest = Math.max(price - down, 0);
    const monthly = term > 0 ? Math.ceil(rest / term) : rest;

    document.getElementById('priceVal').textContent = fmt(price);
    document.getElementById('downVal').textContent = fmt(down);
    document.getElementById('termVal').textContent = term + ' мес.';
    document.getElementById('monthlyVal').textContent = fmt(monthly);
    document.getElementById('tPrice').textContent = fmt(price);
    document.getElementById('tDown').textContent = fmt(down);
    document.getElementById('tRest').textContent = fmt(rest);
    document.getElementById('tTerm').textContent = term + ' мес.';
    document.getElementById('tOver').textContent = '0 ₽';

    // Update slider track fill
    [priceEl, downEl, termEl].forEach(sl => {
      const min = parseFloat(sl.min);
      const max = parseFloat(sl.max);
      const val = parseFloat(sl.value);
      const pct = ((val - min) / (max - min)) * 100;
      sl.style.background = `linear-gradient(to right, #C9A84C ${pct}%, #2A2A2A ${pct}%)`;
    });
  }

  [priceEl, downEl, termEl].forEach(el => el.addEventListener('input', calc));
  calc();
})();

/* ══════════════════════════════════════
   FLOOR PLAN SELECTOR
══════════════════════════════════════ */
(function initFloorPlans() {
  const tabsEl = document.getElementById('fpTabs');
  const typesEl = document.getElementById('fpTypes');
  if (!tabsEl || !typesEl) return;

  const data = {
    horizon: {
      studio: { img: 'images/horizon-new-layout-11.jpg', area: '35 м²', price: 'от 4 800 000 ₽', monthly: 'от 80 000 ₽' },
      '1k':   { img: 'images/horizon-new-layout-13.jpg', area: '50 м²', price: 'от 6 500 000 ₽', monthly: 'от 108 000 ₽' },
      '2k':   { img: 'images/horizon-new-layout-15.jpg', area: '65 м²', price: 'от 8 200 000 ₽', monthly: 'от 137 000 ₽' },
    },
    alye: {
      studio: { img: 'images/alye-layout-11.jpg', area: '42 м²', price: 'от 5 500 000 ₽', monthly: 'от 92 000 ₽' },
      '1k':   { img: 'images/alye-layout-14.jpg', area: '55 м²', price: 'от 7 000 000 ₽', monthly: 'от 117 000 ₽' },
      '2k':   { img: 'images/alye-layout-18.jpg', area: '70 м²', price: 'от 9 500 000 ₽', monthly: 'от 158 000 ₽' },
    },
    moscow: {
      studio: { img: 'images/moscow-layout-25.jpg', area: '50 м²', price: 'от 6 200 000 ₽', monthly: 'от 103 000 ₽' },
      '1k':   { img: 'images/moscow-layout-26.jpg', area: '60 м²', price: 'от 7 800 000 ₽', monthly: 'от 130 000 ₽' },
      '2k':   { img: 'images/moscow-layout-28.jpg', area: '75 м²', price: 'от 10 200 000 ₽', monthly: 'от 170 000 ₽' },
    },
  };

  let currentProject = 'horizon';
  let currentType = 'studio';

  function update() {
    const d = data[currentProject][currentType];
    if (!d) return;
    const img = document.getElementById('fpImage');
    const area = document.getElementById('fpArea');
    const price = document.getElementById('fpPrice');
    const monthly = document.getElementById('fpMonthly');
    if (img) { img.style.opacity = '0'; setTimeout(() => { img.src = d.img; img.style.opacity = '1'; }, 150); }
    if (area) area.textContent = d.area;
    if (price) price.textContent = d.price;
    if (monthly) monthly.textContent = d.monthly;
  }

  tabsEl.addEventListener('click', e => {
    const btn = e.target.closest('.fp-tab');
    if (!btn) return;
    tabsEl.querySelectorAll('.fp-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentProject = btn.dataset.project;
    update();
  });

  typesEl.addEventListener('click', e => {
    const btn = e.target.closest('.fp-type');
    if (!btn) return;
    typesEl.querySelectorAll('.fp-type').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentType = btn.dataset.type;
    update();
  });
})();

/* ══════════════════════════════════════
   MONEY WIDGET
══════════════════════════════════════ */
(function initMoneyWidget() {
  const btn = document.getElementById('moneyWidgetBtn');
  const drawer = document.getElementById('moneyDrawer');
  const closeBtn = document.getElementById('closeMoneyDrawer');
  const findBtn = document.getElementById('findByBudget');
  const input = document.getElementById('budgetInput');
  const results = document.getElementById('moneyResults');
  if (!btn || !drawer) return;

  const projects = [
    { name: 'ЖК Новый Горизонт — Студия', price: 4800000, link: 'new-horizon.html' },
    { name: 'ЖК Новый Горизонт — 1К', price: 6500000, link: 'new-horizon.html' },
    { name: 'ЖК Новый Горизонт — 2К', price: 8200000, link: 'new-horizon.html' },
    { name: 'ЖК Алые Паруса — Студия', price: 5500000, link: 'alye-parusa.html' },
    { name: 'ЖК Алые Паруса — 1К', price: 7000000, link: 'alye-parusa.html' },
    { name: 'ЖК Алые Паруса — 2К', price: 9500000, link: 'alye-parusa.html' },
    { name: 'ЖК Московский — Студия', price: 6200000, link: 'moskovskiy.html' },
    { name: 'ЖК Московский — 1К', price: 7800000, link: 'moskovskiy.html' },
    { name: 'ЖК Московский — 2К', price: 10200000, link: 'moskovskiy.html' },
  ];

  btn.addEventListener('click', () => drawer.classList.toggle('open'));
  closeBtn.addEventListener('click', () => drawer.classList.remove('open'));
  document.addEventListener('click', e => {
    if (!drawer.contains(e.target) && e.target !== btn) drawer.classList.remove('open');
  });

  findBtn.addEventListener('click', () => {
    const budget = parseFloat(input.value);
    if (!budget || budget <= 0) {
      results.innerHTML = '<span style="color:rgba(245,240,232,0.4)">Введите сумму бюджета</span>';
      return;
    }
    const found = projects.filter(p => p.price <= budget);
    if (!found.length) {
      results.innerHTML = '<span style="color:rgba(245,240,232,0.4)">Нет подходящих квартир. Попробуйте увеличить бюджет.</span>';
      return;
    }
    results.innerHTML = found.map(p =>
      `<div class="money-result-item">
        <span class="money-result-name">${p.name}</span>
        <span>от ${p.price.toLocaleString('ru-RU')} ₽ · <a href="${p.link}" style="color:var(--gold)">Подробнее →</a></span>
      </div>`
    ).join('');
  });

  input.addEventListener('keydown', e => { if (e.key === 'Enter') findBtn.click(); });
})();

/* ══════════════════════════════════════
   GAME — Строитель (Stacking)
══════════════════════════════════════ */
(function initGame() {
  const openBtns = [
    document.getElementById('openGame'),
    document.getElementById('heroOpenGame'),
  ];
  const modal = document.getElementById('gameModal');
  const closeBtn = document.getElementById('closeGame');
  const canvas = document.getElementById('gameCanvas');
  if (!canvas || !modal) return;

  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  // UI refs
  const scoreEl = document.getElementById('gScore');
  const bestEl = document.getElementById('gBest');
  const floorEl = document.getElementById('gFloor');
  const overlay = document.getElementById('gameOverlay');
  const goIcon = document.getElementById('goIcon');
  const goTitle = document.getElementById('goTitle');
  const goSub = document.getElementById('goSub');
  const goStats = document.getElementById('goStats');
  const goBtn = document.getElementById('goBtn');
  const goWa = document.getElementById('goWa');
  const effectEl = document.getElementById('gameEffect');

  const BLOCK_H = 22;
  const BASE_Y = H - 30;
  const CAMERA_THRESH = 6;

  const COLORS = [
    ['#C9A84C', '#E8C97A'],
    ['#4A90D9', '#7EB8F7'],
    ['#9B59B6', '#C39BD3'],
    ['#27AE60', '#58D68D'],
    ['#E74C3C', '#F1948A'],
  ];

  let state = 'idle'; // idle | playing | over | win
  let score = 0;
  let best = parseInt(localStorage.getItem('ve_game_best') || '0', 10);
  let floor = 0;
  let cameraY = 0;
  let targetCameraY = 0;
  let blocks = [];
  let moving = null;
  let fallingPieces = [];
  let perfectStreak = 0;
  let raf = null;
  let effectTimeout = null;

  bestEl.textContent = best;

  function resetGame() {
    score = 0; floor = 0; cameraY = 0; targetCameraY = 0;
    blocks = []; fallingPieces = []; moving = null; perfectStreak = 0;
    scoreEl.textContent = 0; floorEl.textContent = 0;

    // Base block
    blocks.push({ x: W / 2 - 90, y: BASE_Y, w: 180, h: BLOCK_H, colorIdx: 0 });
    spawnMoving();
  }

  function spawnMoving() {
    const speed = Math.min(1.5 + floor * 0.18, 5.0);
    const colorIdx = floor % COLORS.length;
    const lastW = blocks[blocks.length - 1].w;
    const w = Math.max(lastW, 40);
    moving = {
      x: -w,
      y: BASE_Y - (floor + 1) * BLOCK_H,
      w,
      h: BLOCK_H,
      speed,
      dir: 1,
      colorIdx,
    };
  }

  function showEffect(text) {
    if (!effectEl) return;
    effectEl.textContent = text;
    effectEl.classList.add('show');
    clearTimeout(effectTimeout);
    effectTimeout = setTimeout(() => effectEl.classList.remove('show'), 900);
  }

  function placeBlock() {
    if (!moving || state !== 'playing') return;
    const last = blocks[blocks.length - 1];
    const overlapX = Math.max(0, Math.min(moving.x + moving.w, last.x + last.w) - Math.max(moving.x, last.x));
    if (overlapX < 10) {
      // Game over
      fallingPieces.push({
        x: moving.x, y: moving.y, w: moving.w, h: BLOCK_H,
        vy: 2, vx: moving.dir * 1.5, rot: 0, rotV: 0.05,
        colorIdx: moving.colorIdx,
      });
      state = 'over';
      if (score > best) { best = score; localStorage.setItem('ve_game_best', best); bestEl.textContent = best; }
      setTimeout(showGameOver, 1200);
      return;
    }

    const isPerfect = Math.abs(overlapX - last.w) < 3 || Math.abs(overlapX - moving.w) < 3;
    let newX, newW;
    if (isPerfect) {
      newX = last.x; newW = last.w;
      perfectStreak++;
      if (perfectStreak >= 3) { showEffect('КОМБО! 🔥'); }
      else { showEffect('✨ ИДЕАЛЬНО!'); }
    } else {
      newX = Math.max(moving.x, last.x);
      newW = overlapX;
      perfectStreak = 0;
      // Falling trimmed piece
      const trimX = moving.x < last.x ? moving.x : moving.x + overlapX;
      const trimW = moving.w - overlapX;
      if (trimW > 0) {
        fallingPieces.push({
          x: trimX, y: moving.y, w: trimW, h: BLOCK_H,
          vy: 1.5, vx: (trimX < newX ? -1 : 1) * 1.5, rot: 0, rotV: (Math.random() - 0.5) * 0.1,
          colorIdx: moving.colorIdx,
        });
      }
    }

    blocks.push({ x: newX, y: moving.y, w: newW, h: BLOCK_H, colorIdx: moving.colorIdx });
    floor++;
    score += isPerfect ? 15 : 10;
    scoreEl.textContent = score;
    floorEl.textContent = floor;

    // Move camera up
    if (floor > CAMERA_THRESH) {
      targetCameraY = (floor - CAMERA_THRESH) * BLOCK_H;
    }

    if (floor >= 10) {
      state = 'win';
      if (score > best) { best = score; localStorage.setItem('ve_game_best', best); bestEl.textContent = best; }
      setTimeout(showWin, 600);
    } else {
      spawnMoving();
    }
  }

  function showGameOver() {
    overlay.classList.remove('hidden');
    goIcon.textContent = '💥';
    goTitle.textContent = 'Игра окончена';
    goSub.textContent = `Этажей построено: ${floor}`;
    goStats.textContent = `Счёт: ${score} · Рекорд: ${best}`;
    goStats.style.display = 'block';
    goBtn.textContent = 'Ещё раз';
    goWa.style.display = 'none';
  }

  function showWin() {
    overlay.classList.remove('hidden');
    goIcon.textContent = '🎉';
    goTitle.textContent = '10 этажей!';
    goSub.textContent = 'Получите бонус при обращении сегодня!';
    goStats.textContent = `Счёт: ${score} · Рекорд: ${best}`;
    goStats.style.display = 'block';
    goBtn.textContent = 'Играть снова';
    goWa.style.display = 'flex';
    spawnConfetti();
  }

  goBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
    resetGame();
    state = 'playing';
    if (!raf) gameLoop();
  });

  function drawBlock(x, y, w, h, colorIdx, alpha) {
    const [c1, c2] = COLORS[colorIdx % COLORS.length];
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.save();
    ctx.globalAlpha = alpha || 1;
    ctx.shadowColor = c1;
    ctx.shadowBlur = 8;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, w, h, 4) : ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(x + 2, y + 2, w - 4, 4);
    ctx.restore();
  }

  function gameLoop() {
    ctx.clearRect(0, 0, W, H);

    // BG
    ctx.fillStyle = '#0C0C0C';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(201,168,76,0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Camera easing
    cameraY += (targetCameraY - cameraY) * 0.08;

    ctx.save();
    ctx.translate(0, cameraY);

    // Placed blocks
    blocks.forEach(b => drawBlock(b.x, b.y - cameraY * 0, b.w, b.h, b.colorIdx));

    // Moving block
    if (moving && state === 'playing') {
      moving.x += moving.speed * moving.dir;
      if (moving.x + moving.w >= W + 10) moving.dir = -1;
      if (moving.x <= -10) moving.dir = 1;
      drawBlock(moving.x, moving.y, moving.w, moving.h, moving.colorIdx, 0.85);
    }

    ctx.restore();

    // Falling pieces
    fallingPieces = fallingPieces.filter(fp => {
      fp.x += fp.vx;
      fp.y += fp.vy;
      fp.vy += 0.18;
      fp.rot += fp.rotV;
      if (fp.y - cameraY > H + 60) return false;
      ctx.save();
      ctx.translate(fp.x + fp.w / 2, fp.y - cameraY + fp.h / 2);
      ctx.rotate(fp.rot);
      drawBlock(-fp.w / 2, -fp.h / 2, fp.w, fp.h, fp.colorIdx, 0.7);
      ctx.restore();
      return true;
    });

    // Ground line
    ctx.strokeStyle = 'rgba(201,168,76,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, BASE_Y + BLOCK_H + 5 + cameraY);
    ctx.lineTo(W, BASE_Y + BLOCK_H + 5 + cameraY);
    ctx.stroke();

    if (state === 'playing' || state === 'over') {
      raf = requestAnimationFrame(gameLoop);
    } else {
      raf = null;
    }
  }

  // Input
  canvas.addEventListener('click', placeBlock);
  canvas.addEventListener('touchend', e => { e.preventDefault(); placeBlock(); }, { passive: false });

  function onKey(e) {
    if (!modal.classList.contains('open')) return;
    if (e.code === 'Space') { e.preventDefault(); placeBlock(); }
    if (e.code === 'Escape') closeModal();
  }
  document.addEventListener('keydown', onKey);

  function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    overlay.classList.remove('hidden');
    goIcon.textContent = '🏗️';
    goTitle.textContent = 'Строитель';
    goSub.textContent = 'Нажмите Начать, чтобы играть';
    goStats.style.display = 'none';
    goBtn.textContent = 'Начать';
    goWa.style.display = 'none';
    resetGame();
    ctx.fillStyle = '#0C0C0C';
    ctx.fillRect(0, 0, W, H);
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    state = 'idle';
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  }

  openBtns.forEach(b => { if (b) b.addEventListener('click', openModal); });
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
})();

/* ══════════════════════════════════════
   CONFETTI
══════════════════════════════════════ */
function spawnConfetti() {
  const container = document.getElementById('confetti-container');
  if (!container) return;
  const colors = ['#C9A84C', '#E8C97A', '#F5F0E8', '#4A90D9', '#27AE60'];
  for (let i = 0; i < 80; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      width: ${Math.random() * 8 + 4}px;
      height: ${Math.random() * 8 + 4}px;
      animation-duration: ${Math.random() * 2 + 2}s;
      animation-delay: ${Math.random() * 0.8}s;
    `;
    container.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}

/* ══════════════════════════════════════
   KEYBOARD GLOBAL
══════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('lightbox')?.classList.remove('open');
    document.body.style.overflow = '';
  }
});
