/* VetraEstate — полная логика v2 */
'use strict';

// ══ PAGE LOADER ══
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('page-loader');
    if (loader) loader.classList.add('hidden');
  }, 2200);
});

// ══ HERO CANVAS — particles ══
(function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.min(Math.floor(W * H / 8000), 120);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.6 + 0.2,
        color: Math.random() > 0.6 ? '#00D4FF' : Math.random() > 0.5 ? '#7B5FFF' : '#FFB800'
      });
    }
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,212,255,${0.08 * (1 - dist / 130)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawLines();
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
    requestAnimationFrame(animate);
  }

  resize(); createParticles(); animate();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); createParticles(); }, 200);
  });
})();

// ══ ABOUT CANVAS — animated building construction ══
(function initAboutCanvas() {
  const canvas = document.getElementById('about-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, t = 0;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function drawBuilding(x, targetH, color, progress) {
    const h = targetH * Math.min(progress, 1);
    const floors = Math.floor(h / 20);
    // Main body
    ctx.fillStyle = color;
    ctx.fillRect(x, H - h, 40, h);
    // Windows
    ctx.fillStyle = 'rgba(0,212,255,0.4)';
    for (let f = 0; f < floors; f++) {
      for (let w = 0; w < 2; w++) {
        const wy = H - h + f * 20 + 4;
        const wx = x + 4 + w * 18;
        if (Math.random() > 0.3) {
          ctx.fillStyle = Math.random() > 0.7 ? 'rgba(255,184,0,0.6)' : 'rgba(0,212,255,0.5)';
          ctx.fillRect(wx, wy, 8, 10);
        }
      }
    }
    // Crane on top
    if (progress < 1.2) {
      ctx.strokeStyle = '#FFB800';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 20, H - h);
      ctx.lineTo(x + 20, H - h - 30);
      ctx.lineTo(x + 55, H - h - 30);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 20, H - h - 30);
      ctx.lineTo(x + 5, H - h - 20);
      ctx.stroke();
      // Hanging rope
      const ropeX = x + 55 - (t % 50) * 0.8;
      ctx.beginPath();
      ctx.moveTo(ropeX, H - h - 30);
      ctx.lineTo(ropeX, H - h - 10 + Math.sin(t * 0.05) * 5);
      ctx.stroke();
    }
  }

  function animate() {
    t++;
    ctx.clearRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = 'rgba(0,212,255,0.05)';
    ctx.lineWidth = 1;
    for (let y = 0; y < H; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    const phase = t / 120;
    drawBuilding(20, 140, 'rgba(0,212,255,0.15)', phase);
    drawBuilding(80, 200, 'rgba(123,95,255,0.15)', phase - 0.3);
    drawBuilding(150, 160, 'rgba(0,212,255,0.12)', phase - 0.6);
    drawBuilding(220, 220, 'rgba(255,184,0,0.10)', phase - 0.9);

    // Ground line
    ctx.strokeStyle = 'rgba(0,212,255,0.20)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(W, H); ctx.stroke();

    // Floating particles
    for (let i = 0; i < 8; i++) {
      const px = (t * 0.5 + i * 40) % W;
      const py = H * 0.3 + Math.sin(t * 0.02 + i) * 40;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,212,255,0.3)';
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  resize(); animate();
  window.addEventListener('resize', resize);
})();

// ══ NAVBAR ══
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

navToggle?.addEventListener('click', () => {
  const open = navbar.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('.nav-links a').forEach(a =>
  a.addEventListener('click', () => navbar.classList.remove('open'))
);

// ══ REVEAL ON SCROLL ══
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 60);
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ══ COUNTER ANIMATION ══
function animateCounter(el) {
  const target = parseInt(el.dataset.target) || 0;
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  let current = 0;
  const step = Math.max(1, Math.floor(target / 60));
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = prefix + current.toLocaleString('ru') + suffix;
    if (current >= target) clearInterval(timer);
  }, 30);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      counterObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num[data-target]').forEach(el => counterObserver.observe(el));

// ══ FILTER BAR ══
document.querySelectorAll('.filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.project').forEach(card => {
      const match = filter === 'all' || (card.dataset.category || '').includes(filter);
      card.style.transition = 'opacity .35s, transform .35s';
      card.style.opacity = match ? '1' : '0.25';
      card.style.transform = match ? '' : 'scale(0.96)';
      card.style.pointerEvents = match ? '' : 'none';
    });
  });
});

// ══ LIGHTBOX ══
function openLightbox(src) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  img.src = src;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
window.openLightbox = openLightbox;

document.getElementById('lightbox-close')?.addEventListener('click', () => {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
});
document.getElementById('lightbox')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    e.currentTarget.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ══ MORTGAGE CALCULATOR ══
function fmt(n) { return Math.round(n).toLocaleString('ru') + ' ₽'; }
function calcUpdate() {
  const price = parseInt(document.getElementById('r-price').value);
  const down  = parseInt(document.getElementById('r-down').value);
  const term  = parseInt(document.getElementById('r-term').value);
  const rest  = Math.max(0, price - down);
  const monthly = rest / term;
  document.getElementById('v-price').textContent = fmt(price);
  document.getElementById('v-down').textContent  = fmt(down);
  document.getElementById('v-term').textContent  = term + (term === 1 ? ' месяц' : term < 5 ? ' месяца' : ' месяцев');
  const el = document.getElementById('calc-monthly');
  el.style.transform = 'scale(1.08)';
  el.textContent = fmt(monthly);
  setTimeout(() => el.style.transform = '', 300);
  document.getElementById('cb-price').textContent = fmt(price);
  document.getElementById('cb-down').textContent  = fmt(down);
  document.getElementById('cb-rest').textContent  = fmt(rest);
  document.getElementById('cb-term').textContent  = term + ' мес.';
}
['r-price','r-down','r-term'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', calcUpdate);
});
calcUpdate();

// ══ MONEY WIDGET ══
const moneyDrawer = document.querySelector('.money-drawer-v2');
const moneyMini   = document.querySelector('.money-mini-v2');
const moneyClose  = document.querySelector('.money-close-v2');
const moneyBg     = document.querySelector('.money-drawer-bg-v2');

function openMoneyDrawer() {
  moneyDrawer.classList.add('open');
  moneyDrawer.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
}
function closeMoneyDrawer() {
  moneyDrawer.classList.remove('open');
  moneyDrawer.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}
moneyMini?.addEventListener('click', openMoneyDrawer);
moneyClose?.addEventListener('click', closeMoneyDrawer);
moneyBg?.addEventListener('click', closeMoneyDrawer);

const PROJECTS_DATA = [
  { name: 'ЖК «Новый Горизонт»', min: 100000, price: 'от 60 000 ₽/м²', img: 'images/horizon-5.jpeg', url: 'new-horizon.html' },
  { name: 'АК «Алые Паруса»',    min: 100000, price: 'от 50 000 ₽/м²', img: 'images/alye-photo-5.jpg',  url: 'alye-parusa.html' },
  { name: 'ЖК «Московский»',     min: 200000, price: 'от 70 000 ₽/м²', img: 'images/moscow-photo-2.jpg', url: 'moskovskiy.html' },
];

document.querySelectorAll('.money-chips-v2 button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.money-chips-v2 button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector('.money-input-v2').value = btn.dataset.money;
  });
});

document.querySelector('.money-run-v2')?.addEventListener('click', () => {
  const val = parseInt(document.querySelector('.money-input-v2').value) || 0;
  const results = PROJECTS_DATA.filter(p => val >= p.min);
  const summary = document.querySelector('.money-summary-v2');
  const resultsEl = document.querySelector('.money-results-v2');
  summary.textContent = val > 0 ? `При взносе ${val.toLocaleString('ru')} ₽ доступно: ${results.length} ЖК` : '';
  resultsEl.innerHTML = results.map(p => `
    <div class="money-result-card" onclick="window.location.href='${p.url}'">
      <img src="${p.img}" alt="${p.name}">
      <div class="money-result-info">
        <h4>${p.name}</h4>
        <span>Взнос от ${p.min.toLocaleString('ru')} ₽</span>
      </div>
      <span class="money-result-price">${p.price}</span>
    </div>`).join('') || '<p style="color:var(--text3);font-size:.82rem;text-align:center;padding:16px">Увеличьте сумму взноса</p>';
});

// ══ CONFETTI ══
function launchConfetti() {
  const container = document.getElementById('confetti-container');
  const colors = ['#00D4FF','#FFB800','#7B5FFF','#00E887','#FF4D6A','#FF8C00','#4DE8FF'];
  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.cssText = `
      left:${Math.random()*100}%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-duration:${1.5 + Math.random()*2}s;
      animation-delay:${Math.random()*0.6}s;
      transform:rotate(${Math.random()*360}deg);
      width:${6 + Math.random()*6}px;
      height:${8 + Math.random()*8}px;
    `;
    container.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove());
  }
}

// ══ GAME ══
(function initGame() {
  const modal       = document.getElementById('gameModal');
  const modalBg     = document.getElementById('gameModalBg');
  const closeBtn    = document.getElementById('gameClose');
  const startBtn    = document.getElementById('gameStartBtn');
  const canvas      = document.getElementById('game-canvas');
  const prizeBanner = document.getElementById('gamePrize');
  const hudScore    = document.getElementById('hud-score');
  const hudBest     = document.getElementById('hud-best');
  const hudLevel    = document.getElementById('hud-level');

  if (!modal || !canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  let state = 'idle'; // idle | playing | over | win
  let blocks = [], movingBlock = null, score = 0, best = 0, animId = null;

  const COLORS = ['#00D4FF','#7B5FFF','#00E887','#FFB800','#FF4D6A','#4DE8FF','#FF8C00'];
  const BLOCK_H = 22, CAMERA_SPEED = 1;
  let cameraY = 0, targetCameraY = 0;

  function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    prizeBanner.classList.remove('show');
    if (state === 'idle') drawIdle();
  }
  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    if (animId) { cancelAnimationFrame(animId); animId = null; }
  }

  document.getElementById('openGame')?.addEventListener('click', openModal);
  document.getElementById('openGameHero')?.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  modalBg?.addEventListener('click', closeModal);

  function drawIdle() {
    ctx.clearRect(0, 0, W, H);
    // Animated background
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#07091A');
    grad.addColorStop(1, '#0D1228');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(0,212,255,0.06)';
    ctx.lineWidth = 1;
    for (let y = 0; y < H; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    for (let x = 0; x < W; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }

    // Sample building
    ctx.fillStyle = 'rgba(0,212,255,0.08)';
    ctx.fillRect(W/2 - 30, H - 100, 60, 100);

    // Text
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px Cinzel, serif';
    ctx.fillStyle = '#00D4FF';
    ctx.fillText('🏗️ Стройка', W/2, H/2 - 20);
    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = 'rgba(232,240,255,.55)';
    ctx.fillText('Нажми «Начать игру» и стопи блоки!', W/2, H/2 + 10);
    ctx.fillText('Цель: построить 10 этажей', W/2, H/2 + 32);
  }

  function initGame() {
    state = 'playing';
    score = 0; cameraY = 0; targetCameraY = 0;
    prizeBanner.classList.remove('show');
    startBtn.textContent = '🔄 Начать заново';

    blocks = [{
      x: W/2 - 60, y: H - BLOCK_H, w: 120, color: COLORS[0], fixed: true
    }];

    spawnBlock();
    updateHUD();
    if (animId) cancelAnimationFrame(animId);
    loop();
  }

  function spawnBlock() {
    const color = COLORS[blocks.length % COLORS.length];
    const topBlock = blocks[blocks.length - 1];
    const maxW = topBlock.w + 20;
    const w = Math.min(maxW, 120);
    const dir = blocks.length % 2 === 0 ? 1 : -1;
    movingBlock = {
      x: dir > 0 ? -w : W,
      y: topBlock.y - BLOCK_H,
      w, color,
      dir,
      speed: 2.5 + blocks.length * 0.12
    };
  }

  function placeBlock() {
    if (!movingBlock || state !== 'playing') return;
    const top = blocks[blocks.length - 1];

    // Overlap calculation
    const overlapLeft  = Math.max(movingBlock.x, top.x);
    const overlapRight = Math.min(movingBlock.x + movingBlock.w, top.x + top.w);
    const overlap = overlapRight - overlapLeft;

    if (overlap <= 0) {
      // Miss — game over
      gameOver();
      return;
    }

    // Place block with trimmed width
    const placed = {
      x: overlapLeft, y: movingBlock.y,
      w: overlap, color: movingBlock.color, fixed: true
    };
    blocks.push(placed);
    score += Math.floor(overlap);
    updateHUD();

    // Perfect bonus
    if (Math.abs(overlap - top.w) < 4) {
      placed.x = top.x; placed.w = top.w; // snap perfect
      showPerfect(placed.x + placed.w/2, placed.y);
    }

    // Camera pan up
    targetCameraY = Math.max(0, (blocks.length - 10) * BLOCK_H);

    if (blocks.length - 1 >= 10) {
      winGame();
      return;
    }
    movingBlock = null;
    spawnBlock();
  }

  function showPerfect(x, y) {
    const fx = x, fy = y - cameraY;
    const perfObj = { x: fx, y: fy, alpha: 1, t: 0 };
    const draw = () => {
      if (perfObj.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = perfObj.alpha;
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillStyle = '#00E887';
      ctx.textAlign = 'center';
      ctx.fillText('✨ PERFECT!', perfObj.x, perfObj.y - perfObj.t);
      ctx.restore();
      perfObj.t += 1.5; perfObj.alpha -= 0.03;
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  function gameOver() {
    state = 'over';
    if (score > best) best = score;
    updateHUD();
    startBtn.textContent = '🔄 Играть снова';
    // Draw game over overlay
    setTimeout(() => {
      ctx.fillStyle = 'rgba(0,0,0,.6)';
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center';
      ctx.font = 'bold 22px Cinzel, serif';
      ctx.fillStyle = '#FF4D6A';
      ctx.fillText('Игра окончена!', W/2, H/2 - 16);
      ctx.font = '14px Inter, sans-serif';
      ctx.fillStyle = 'rgba(232,240,255,.7)';
      ctx.fillText(`Этажей: ${blocks.length - 1}  |  Рекорд: ${best}`, W/2, H/2 + 12);
    }, 100);
  }

  function winGame() {
    state = 'win';
    if (score > best) best = score;
    updateHUD();
    startBtn.textContent = '🔄 Играть снова';
    prizeBanner.classList.add('show');
    launchConfetti();
  }

  function updateHUD() {
    hudScore.textContent = score;
    hudBest.textContent = best;
    hudLevel.textContent = Math.max(0, blocks.length - 1);
  }

  function loop() {
    animId = requestAnimationFrame(loop);
    ctx.clearRect(0, 0, W, H);

    // Smooth camera
    cameraY += (targetCameraY - cameraY) * CAMERA_SPEED * 0.1;

    // BG
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#07091A'); grad.addColorStop(1, '#0D1228');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(0,212,255,0.05)'; ctx.lineWidth = 1;
    for (let y = 0; y < H; y += BLOCK_H) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Placed blocks
    blocks.forEach(b => {
      const sy = b.y - cameraY;
      const grad2 = ctx.createLinearGradient(b.x, sy, b.x, sy + BLOCK_H);
      grad2.addColorStop(0, b.color);
      grad2.addColorStop(1, b.color + '88');
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.roundRect(b.x + 1, sy + 1, b.w - 2, BLOCK_H - 2, 4);
      ctx.fill();
      // Glow
      ctx.shadowColor = b.color; ctx.shadowBlur = 8;
      ctx.strokeStyle = b.color + 'AA'; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(b.x + 1, sy + 1, b.w - 2, BLOCK_H - 2, 4);
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Moving block
    if (movingBlock && state === 'playing') {
      movingBlock.x += movingBlock.dir * movingBlock.speed;
      if (movingBlock.x + movingBlock.w > W + 20) movingBlock.dir = -1;
      if (movingBlock.x < -20) movingBlock.dir = 1;

      const sy = movingBlock.y - cameraY;
      ctx.fillStyle = movingBlock.color + 'CC';
      ctx.beginPath();
      ctx.roundRect(movingBlock.x + 1, sy + 1, movingBlock.w - 2, BLOCK_H - 2, 4);
      ctx.fill();
      // Glow
      ctx.shadowColor = movingBlock.color; ctx.shadowBlur = 12;
      ctx.strokeStyle = movingBlock.color; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(movingBlock.x + 1, sy + 1, movingBlock.w - 2, BLOCK_H - 2, 4);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Guide line from top block
      const top = blocks[blocks.length - 1];
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1; ctx.setLineDash([4,4]);
      ctx.beginPath();
      ctx.moveTo(top.x, top.y - cameraY);
      ctx.lineTo(top.x, sy + BLOCK_H);
      ctx.moveTo(top.x + top.w, top.y - cameraY);
      ctx.lineTo(top.x + top.w, sy + BLOCK_H);
      ctx.stroke(); ctx.setLineDash([]);
    }

    // Score overlay
    ctx.textAlign = 'left';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = 'rgba(232,240,255,.3)';
    ctx.fillText(`Цель: 10 этажей`, 10, 18);
  }

  function handleAction() {
    if (state === 'playing') placeBlock();
  }

  startBtn?.addEventListener('click', initGame);
  canvas.addEventListener('click', handleAction);
  canvas.addEventListener('touchend', (e) => { e.preventDefault(); handleAction(); }, { passive: false });
  document.addEventListener('keydown', (e) => {
    if (modal.classList.contains('open') && (e.code === 'Space' || e.code === 'Enter')) {
      e.preventDefault(); handleAction();
    }
  });

  drawIdle();
})();

// ══ KEYBOARD ESCAPE ══
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.getElementById('lightbox').classList.remove('open');
    document.getElementById('gameModal').classList.remove('open');
    document.querySelector('.money-drawer-v2').classList.remove('open');
    document.body.style.overflow = '';
  }
});
