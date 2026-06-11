'use strict';

/* ══════════════════════════════════════
   PRELOADER
══════════════════════════════════════ */
window.addEventListener('load', function() {
  var pl = document.getElementById('preloader');
  if (!pl) return;
  setTimeout(function() {
    pl.classList.add('hidden');
    setTimeout(function() { pl.style.display = 'none'; }, 700);
  }, 1600);
});

/* ══════════════════════════════════════
   NAVBAR
══════════════════════════════════════ */
(function() {
  var nav = document.getElementById('navbar');
  var burger = document.getElementById('navBurger');
  var mobile = document.getElementById('navMobile');

  window.addEventListener('scroll', function() {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  if (burger && mobile) {
    burger.addEventListener('click', function() {
      mobile.classList.toggle('open');
    });
    mobile.querySelectorAll('.nm-link').forEach(function(link) {
      link.addEventListener('click', function() {
        mobile.classList.remove('open');
      });
    });
  }
})();

/* ══════════════════════════════════════
   HERO CANVAS — Aurora Animation
══════════════════════════════════════ */
(function() {
  var canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  var blobs = [];
  var colors = [
    [201, 168, 76],
    [120, 80, 20],
    [180, 130, 60],
    [60, 40, 10],
    [220, 190, 100],
  ];

  for (var i = 0; i < 6; i++) {
    var c = colors[i % colors.length];
    blobs.push({
      x: Math.random(),
      y: Math.random(),
      r: 0.25 + Math.random() * 0.35,
      vx: (Math.random() - 0.5) * 0.0003,
      vy: (Math.random() - 0.5) * 0.0002,
      phase: Math.random() * Math.PI * 2,
      color: c
    });
  }

  var particles = [];
  for (var j = 0; j < 60; j++) {
    particles.push({
      x: Math.random(),
      y: Math.random(),
      size: 0.5 + Math.random() * 1.5,
      speed: 0.00015 + Math.random() * 0.0003,
      opacity: 0.2 + Math.random() * 0.6
    });
  }

  var t = 0;
  function draw() {
    t += 0.005;
    ctx.clearRect(0, 0, W, H);

    // Dark base
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, W, H);

    // Aurora blobs
    ctx.globalCompositeOperation = 'screen';
    blobs.forEach(function(b) {
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < -0.2) b.x = 1.2;
      if (b.x > 1.2) b.x = -0.2;
      if (b.y < -0.2) b.y = 1.2;
      if (b.y > 1.2) b.y = -0.2;

      var pulse = 0.85 + 0.15 * Math.sin(t + b.phase);
      var rx = b.r * W * pulse;
      var ry = b.r * H * 0.6 * pulse;
      var cx = b.x * W;
      var cy = b.y * H;

      var grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
      var alpha = (0.04 + 0.03 * Math.sin(t * 0.7 + b.phase)).toFixed(3);
      grd.addColorStop(0, 'rgba(' + b.color[0] + ',' + b.color[1] + ',' + b.color[2] + ',' + alpha + ')');
      grd.addColorStop(1, 'rgba(' + b.color[0] + ',' + b.color[1] + ',' + b.color[2] + ',0)');

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(rx / Math.max(rx, ry), ry / Math.max(rx, ry));
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(rx, ry), 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.restore();
    });
    ctx.globalCompositeOperation = 'source-over';

    // Particles
    particles.forEach(function(p) {
      p.y -= p.speed;
      if (p.y < -0.01) p.y = 1.01;
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, p.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(201,168,76,' + (p.opacity * (0.7 + 0.3 * Math.sin(t * 2 + p.x * 10))) + ')';
      ctx.fill();
    });

    // Horizontal shimmer line
    var y = H * 0.6 + 30 * Math.sin(t * 0.5);
    var shimmer = ctx.createLinearGradient(0, y - 1, W, y + 1);
    shimmer.addColorStop(0, 'rgba(201,168,76,0)');
    shimmer.addColorStop(0.3, 'rgba(201,168,76,0.06)');
    shimmer.addColorStop(0.5, 'rgba(201,168,76,0.12)');
    shimmer.addColorStop(0.7, 'rgba(201,168,76,0.06)');
    shimmer.addColorStop(1, 'rgba(201,168,76,0)');
    ctx.fillStyle = shimmer;
    ctx.fillRect(0, y - 1, W, 2);

    // Bottom vignette
    var vgrd = ctx.createLinearGradient(0, H * 0.7, 0, H);
    vgrd.addColorStop(0, 'rgba(8,8,8,0)');
    vgrd.addColorStop(1, 'rgba(8,8,8,0.95)');
    ctx.fillStyle = vgrd;
    ctx.fillRect(0, 0, W, H);

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════ */
(function() {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function(el) { el.classList.add('visible'); });
    return;
  }
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var delay = entry.target.dataset.delay || 0;
        setTimeout(function() {
          entry.target.classList.add('visible');
        }, parseInt(delay));
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(function(el) { io.observe(el); });
})();

/* ══════════════════════════════════════
   STATS COUNTER
══════════════════════════════════════ */
(function() {
  var nums = document.querySelectorAll('.stat-num');
  if (!nums.length) return;
  var started = false;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function runCounters() {
    if (started) return;
    started = true;
    nums.forEach(function(el) {
      var target = parseInt(el.dataset.target, 10);
      var duration = 2000;
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        el.textContent = Math.round(easeOut(progress) * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    });
  }

  var io = new IntersectionObserver(function(entries) {
    if (entries.some(function(e) { return e.isIntersecting; })) runCounters();
  }, { threshold: 0.3 });
  var statsBar = document.querySelector('.stats-bar');
  if (statsBar) io.observe(statsBar);
})();

/* ══════════════════════════════════════
   LAYOUTS / FLOOR PLANS
══════════════════════════════════════ */
(function() {
  var data = {
    horizon: {
      1: { img: 'images/horizon-new-layout-11.jpg', title: '1-комнатная квартира', area: '36 м²', floor: '3–17', ceil: '2.9 м', price: 'от 4.2 млн ₽', finish: 'Чистовая', status: 'В продаже' },
      2: { img: 'images/horizon-new-layout-13.jpg', title: '2-комнатная квартира', area: '58 м²', floor: '3–17', ceil: '2.9 м', price: 'от 6.8 млн ₽', finish: 'Чистовая', status: 'В продаже' },
      3: { img: 'images/horizon-new-layout-15.jpg', title: '3-комнатная квартира', area: '78 м²', floor: '5–17', ceil: '2.9 м', price: 'от 9.1 млн ₽', finish: 'Чистовая', status: 'Ограниченно' }
    },
    alye: {
      1: { img: 'images/alye-layout-11.jpg', title: '1-комнатная квартира', area: '42 м²', floor: '2–14', ceil: '3.0 м', price: 'от 5.8 млн ₽', finish: 'Под ключ', status: 'В продаже' },
      2: { img: 'images/alye-layout-14.jpg', title: '2-комнатная квартира', area: '68 м²', floor: '2–14', ceil: '3.0 м', price: 'от 8.9 млн ₽', finish: 'Под ключ', status: 'В продаже' },
      3: { img: 'images/alye-layout-18.jpg', title: '3-комнатная квартира', area: '95 м²', floor: '3–14', ceil: '3.0 м', price: 'от 12.5 млн ₽', finish: 'Под ключ', status: 'В продаже' }
    },
    moscow: {
      1: { img: 'images/moscow-layout-25.jpg', title: '1-комнатная квартира', area: '32 м²', floor: '2–12', ceil: '2.8 м', price: 'от 3.5 млн ₽', finish: 'Черновая', status: 'В продаже' },
      2: { img: 'images/moscow-layout-26.jpg', title: '2-комнатная квартира', area: '52 м²', floor: '2–12', ceil: '2.8 м', price: 'от 5.6 млн ₽', finish: 'Черновая', status: 'Ограниченно' },
      3: { img: 'images/moscow-layout-28.jpg', title: '3-комнатная квартира', area: '72 м²', floor: '2–12', ceil: '2.8 м', price: 'от 7.8 млн ₽', finish: 'Черновая', status: 'Последние' }
    }
  };

  var currentProject = 'horizon';
  var currentType = 1;

  var img = document.getElementById('layoutImg');
  var specTitle = document.getElementById('specTitle');
  var specArea = document.getElementById('specArea');
  var specFloor = document.getElementById('specFloor');
  var specCeil = document.getElementById('specCeil');
  var specPrice = document.getElementById('specPrice');
  var specFinish = document.getElementById('specFinish');
  var specStatus = document.getElementById('specStatus');

  function updateLayout() {
    var info = data[currentProject][currentType];
    if (!info) return;

    img.classList.add('fading');
    setTimeout(function() {
      img.src = info.img;
      img.onload = function() { img.classList.remove('fading'); };
      img.onerror = function() { img.classList.remove('fading'); };
    }, 200);

    specTitle.textContent = info.title;
    specArea.textContent = info.area;
    specFloor.textContent = info.floor;
    specCeil.textContent = info.ceil;
    specPrice.textContent = info.price;
    specFinish.textContent = info.finish;
    specStatus.textContent = info.status;
  }

  var projectBtns = document.querySelectorAll('.lp-btn');
  projectBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      projectBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentProject = btn.dataset.project;
      updateLayout();
    });
  });

  var typeBtns = document.querySelectorAll('.lt-btn');
  typeBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      typeBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentType = parseInt(btn.dataset.type, 10);
      updateLayout();
    });
  });

  // Init
  updateLayout();
})();

/* ══════════════════════════════════════
   MORTGAGE CALCULATOR
══════════════════════════════════════ */
(function() {
  var sliderPrice = document.getElementById('calcPrice');
  var sliderDown  = document.getElementById('calcDown');
  var sliderTerm  = document.getElementById('calcTerm');
  var sliderRate  = document.getElementById('calcRate');

  if (!sliderPrice) return;

  var valPrice   = document.getElementById('calcPriceVal');
  var valDown    = document.getElementById('calcDownVal');
  var valTerm    = document.getElementById('calcTermVal');
  var valRate    = document.getElementById('calcRateVal');
  var elMonthly  = document.getElementById('calcMonthly');
  var elLoan     = document.getElementById('crLoan');
  var elOverpay  = document.getElementById('crOverpay');
  var elTotal    = document.getElementById('crTotal');

  function fmt(n) {
    return Math.round(n).toLocaleString('ru-RU') + ' ₽';
  }

  function updateProgress(el) {
    var min = parseFloat(el.min);
    var max = parseFloat(el.max);
    var val = parseFloat(el.value);
    var pct = ((val - min) / (max - min) * 100).toFixed(1) + '%';
    el.style.setProperty('--progress', pct);
  }

  function calculate() {
    var price  = parseFloat(sliderPrice.value);
    var downPct = parseFloat(sliderDown.value);
    var term   = parseInt(sliderTerm.value, 10);
    var rate   = parseFloat(sliderRate.value);

    var downAmt = price * downPct / 100;
    var loan    = price - downAmt;
    var months  = term * 12;
    var r       = rate / 100 / 12;

    var monthly;
    if (r === 0) {
      monthly = loan / months;
    } else {
      monthly = loan * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
    }

    var totalPaid = monthly * months;
    var overpay   = totalPaid - loan;

    // Update labels
    valPrice.textContent  = Math.round(price).toLocaleString('ru-RU') + ' ₽';
    valDown.textContent   = Math.round(downAmt).toLocaleString('ru-RU') + ' ₽ (' + downPct + '%)';
    valTerm.textContent   = term + ' ' + (term === 1 ? 'год' : term < 5 ? 'года' : 'лет');
    valRate.textContent   = rate.toFixed(1) + '%';

    // Update results
    elMonthly.textContent = fmt(monthly);
    elLoan.textContent    = fmt(loan);
    elOverpay.textContent = fmt(overpay);
    elTotal.textContent   = fmt(totalPaid);

    // Update slider fill
    updateProgress(sliderPrice);
    updateProgress(sliderDown);
    updateProgress(sliderTerm);
    updateProgress(sliderRate);
  }

  sliderPrice.addEventListener('input', calculate);
  sliderDown.addEventListener('input', calculate);
  sliderTerm.addEventListener('input', calculate);
  sliderRate.addEventListener('input', calculate);

  calculate();
})();

/* ══════════════════════════════════════
   ABOUT CANVAS — Building Animation
══════════════════════════════════════ */
(function() {
  var canvas = document.getElementById('aboutCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  var t = 0;
  function draw() {
    t += 0.008;
    ctx.clearRect(0, 0, W, H);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(201,168,76,0.04)';
    ctx.lineWidth = 1;
    for (var x = 0; x < W; x += 80) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (var y = 0; y < H; y += 80) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Pulsing dots at intersections
    for (var gx = 0; gx <= W; gx += 80) {
      for (var gy = 0; gy <= H; gy += 80) {
        var pulse = 0.5 + 0.5 * Math.sin(t + gx * 0.05 + gy * 0.03);
        ctx.beginPath();
        ctx.arc(gx, gy, 1.5 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(201,168,76,' + (0.15 * pulse) + ')';
        ctx.fill();
      }
    }

    // Flowing line
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(201,168,76,0.12)';
    ctx.lineWidth = 1;
    for (var i = 0; i <= W; i += 4) {
      var yw = H * 0.5 + 30 * Math.sin(i * 0.015 + t) + 15 * Math.sin(i * 0.03 - t * 1.3);
      if (i === 0) ctx.moveTo(i, yw);
      else ctx.lineTo(i, yw);
    }
    ctx.stroke();

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════════════════════════════════
   STACKING GAME
══════════════════════════════════════ */
(function() {
  var canvas = document.getElementById('gameCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var CW = 360;
  var CH = 500;
  canvas.width = CW;
  canvas.height = CH;

  var overlay    = document.getElementById('gameOverlay');
  var startBtn   = document.getElementById('gameStartBtn');
  var elFloors   = document.getElementById('gameFloors');
  var elBest     = document.getElementById('gameBest');
  var elAcc      = document.getElementById('gameAcc');
  var titleEl    = document.getElementById('gameOverlayTitle');
  var subEl      = document.getElementById('gameOverlaySub');

  var BLOCK_H    = 28;
  var BASE_W     = 240;
  var STACK_Y    = CH - 40;
  var MOVE_SPEED = 2.5;

  var state      = 'idle'; // idle | playing | over | win
  var best       = 0;
  var stack      = [];
  var moving     = null;
  var direction  = 1;
  var floors     = 0;
  var totalAcc   = 0;
  var animRaf    = null;

  var COLORS = [
    '#C9A84C','#b8962e','#d4b96a','#a07826',
    '#e2c47a','#8a6820','#f0d898','#c49a30'
  ];

  function initGame() {
    stack = [];
    floors = 0;
    totalAcc = 0;
    direction = 1;

    // Base block
    var bx = (CW - BASE_W) / 2;
    stack.push({ x: bx, y: STACK_Y - BLOCK_H, w: BASE_W, color: COLORS[0] });

    // Moving block
    spawnMoving();

    elFloors.textContent = '0';
    elAcc.textContent = '—';
    state = 'playing';
    overlay.classList.add('hidden');
    loop();
  }

  function spawnMoving() {
    var last = stack[stack.length - 1];
    var color = COLORS[(stack.length) % COLORS.length];
    moving = {
      x: -last.w,
      y: last.y - BLOCK_H,
      w: last.w,
      color: color
    };
    direction = 1;
  }

  function placeBlock() {
    if (state !== 'playing' || !moving) return;

    var last  = stack[stack.length - 1];
    var lx    = last.x;
    var lw    = last.w;
    var mx    = moving.x;
    var mw    = moving.w;

    // Overlap
    var ol = Math.max(lx, mx);
    var or_ = Math.min(lx + lw, mx + mw);
    var overlap = or_ - ol;

    if (overlap <= 0) {
      // Missed — game over
      state = 'over';
      showOverlay('Игра окончена', 'Вы набрали ' + floors + ' ' + floorWord(floors) + '. Попробуйте ещё раз!', 'Играть снова');
      return;
    }

    // Accuracy
    var acc = overlap / lw;
    totalAcc += acc;
    floors++;

    // Placed block
    var placed = { x: ol, y: moving.y, w: overlap, color: moving.color };
    stack.push(placed);

    elFloors.textContent = floors;
    elAcc.textContent = Math.round((totalAcc / floors) * 100) + '%';

    if (floors > best) {
      best = floors;
      elBest.textContent = best;
    }

    // Win condition
    if (floors >= 20) {
      state = 'over';
      showOverlay('Победа!', 'Небоскрёб построен на ' + floors + ' этажей. Отличная точность!', 'Играть снова');
      return;
    }

    // Scroll stack up if needed
    var topY = stack[stack.length - 1].y;
    if (topY < CH * 0.35) {
      var shift = CH * 0.35 - topY + BLOCK_H * 2;
      stack.forEach(function(b) { b.y += shift; });
    }

    // Speed up slightly
    MOVE_SPEED = Math.min(2.5 + floors * 0.07, 5.5);

    spawnMoving();
  }

  function showOverlay(title, sub, btn) {
    titleEl.textContent = title;
    subEl.textContent = sub;
    startBtn.textContent = btn;
    overlay.classList.remove('hidden');
  }

  function floorWord(n) {
    if (n % 10 === 1 && n % 100 !== 11) return 'этаж';
    if ([2,3,4].indexOf(n % 10) !== -1 && ![12,13,14].indexOf(n % 100) === -1) return 'этажа';
    return 'этажей';
  }

  function drawBlock(b) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(b.x + 4, b.y + 4, b.w, BLOCK_H);

    // Block face
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.w, BLOCK_H);

    // Top highlight
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(b.x, b.y, b.w, 3);

    // Windows
    if (b.w > 30) {
      var ww = 7, wh = 8, gap = 14;
      var cols = Math.floor((b.w - 10) / (ww + gap));
      var startX = b.x + (b.w - cols * (ww + gap) + gap) / 2;
      for (var i = 0; i < cols; i++) {
        var wx = startX + i * (ww + gap);
        var wy = b.y + 8;
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(wx, wy, ww, wh);
        // Random lit windows
        if ((b.y + i * 37) % 5 < 3) {
          ctx.fillStyle = 'rgba(255,240,180,0.7)';
          ctx.fillRect(wx + 1, wy + 1, ww - 2, wh - 2);
        }
      }
    }

    // Border
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(b.x, b.y, b.w, BLOCK_H);
  }

  function drawScene() {
    // Sky gradient
    var sky = ctx.createLinearGradient(0, 0, 0, CH);
    sky.addColorStop(0, '#060610');
    sky.addColorStop(0.6, '#0a0a18');
    sky.addColorStop(1, '#0f0f0a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CW, CH);

    // Stars
    ctx.fillStyle = 'rgba(255,255,220,0.6)';
    for (var s = 0; s < 40; s++) {
      var sx = (s * 137 + 23) % CW;
      var sy = (s * 61 + 11) % (CH * 0.6);
      var ss = 0.8 + (s % 3) * 0.4;
      ctx.beginPath();
      ctx.arc(sx, sy, ss, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground
    ctx.fillStyle = '#1a1a10';
    ctx.fillRect(0, CH - 40, CW, 40);
    ctx.fillStyle = 'rgba(201,168,76,0.15)';
    ctx.fillRect(0, CH - 42, CW, 2);

    // Draw stacked blocks
    stack.forEach(function(b) { drawBlock(b); });

    // Draw moving block
    if (moving && state === 'playing') {
      drawBlock(moving);

      // Guide line (subtle)
      var last = stack[stack.length - 1];
      ctx.strokeStyle = 'rgba(201,168,76,0.08)';
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(last.x, moving.y + BLOCK_H);
      ctx.lineTo(last.x + last.w, moving.y + BLOCK_H);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  function loop() {
    if (state !== 'playing') return;

    // Move block
    moving.x += MOVE_SPEED * direction;
    var last = stack[stack.length - 1];
    if (moving.x + moving.w > CW + 10) direction = -1;
    if (moving.x < -10) direction = 1;

    drawScene();
    animRaf = requestAnimationFrame(loop);
  }

  // Start / restart
  startBtn.addEventListener('click', function() {
    if (animRaf) cancelAnimationFrame(animRaf);
    MOVE_SPEED = 2.5;
    initGame();
  });

  // Click / tap on canvas
  canvas.addEventListener('click', function() {
    if (state === 'playing') placeBlock();
  });

  // Spacebar
  document.addEventListener('keydown', function(e) {
    if (e.code === 'Space' && state === 'playing') {
      e.preventDefault();
      placeBlock();
    }
  });

  // Initial draw
  drawScene();
})();

/* ══════════════════════════════════════
   CONTACT FORM
══════════════════════════════════════ */
(function() {
  var form  = document.getElementById('contactForm');
  var toast = document.getElementById('toast');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var name  = document.getElementById('fName');
    var phone = document.getElementById('fPhone');
    var ok = true;

    [name, phone].forEach(function(el) {
      el.style.borderColor = '';
      if (!el.value.trim()) {
        el.style.borderColor = '#ef4444';
        ok = false;
      }
    });
    if (!ok) return;

    var btn = form.querySelector('button[type=submit]');
    btn.textContent = 'Отправляем...';
    btn.disabled = true;

    setTimeout(function() {
      btn.textContent = 'Отправить заявку';
      btn.disabled = false;
      form.reset();
      // Show toast
      toast.classList.add('show');
      setTimeout(function() { toast.classList.remove('show'); }, 4000);
    }, 1200);
  });
})();
