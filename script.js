'use strict';

/* ══════════════════════════════════════
   PRELOADER
══════════════════════════════════════ */
window.addEventListener('load', function() {
  var pl = document.getElementById('preloader');
  if (!pl) {
    document.body.classList.add('hero-in');
    return;
  }
  setTimeout(function() {
    pl.classList.add('hidden');
    document.body.classList.add('hero-in');
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
   HERO CANVAS — Ночной город у моря
   (генеративный скайлайн, тёплые окна,
   луна, звёзды, отражения, параллакс)
══════════════════════════════════════ */
(function() {
  var canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W, H, horizonY, layers, stars, reflections;
  var mx = 0, my = 0, smx = 0, smy = 0;

  // Слои скайлайна: от дальнего к ближнему
  var LAYER_CONF = [
    { depth: 0.15, drift: 4,  maxH: 0.34, minH: 0.16, body: '#0D1526', win: [120, 140, 180], winAlpha: 0.35, density: 0.9 },
    { depth: 0.35, drift: 9,  maxH: 0.46, minH: 0.22, body: '#0A111F', win: [217, 179, 106], winAlpha: 0.5,  density: 0.75 },
    { depth: 0.7,  drift: 16, maxH: 0.6,  minH: 0.3,  body: '#070C17', win: [255, 200, 120], winAlpha: 0.85, density: 0.6 }
  ];

  function rand(a, b) { return a + Math.random() * (b - a); }

  // Слой пререндерится в офскрин-канвас, мерцающие окна рисуются поверх
  function buildLayer(conf) {
    var spanW = Math.ceil(W * 1.6);
    var off = document.createElement('canvas');
    off.width = spanW;
    off.height = H;
    var octx = off.getContext('2d');
    var twinkles = [];

    var x = -rand(0, 60);
    while (x < spanW) {
      var bw = rand(34, 96);
      var bh = H * rand(conf.minH, conf.maxH);
      var top = horizonY - bh;

      octx.fillStyle = conf.body;
      octx.fillRect(x, top, bw, bh + 2);

      // Иногда — парапет или шпиль
      var r = Math.random();
      if (r < 0.25) {
        octx.fillRect(x + bw * 0.3, top - 8, bw * 0.4, 8);
      } else if (r < 0.4) {
        octx.fillRect(x + bw / 2 - 1, top - rand(10, 26), 2, 26);
      }

      // Сетка окон
      var ww = 3, wh = 5, gx = 9, gy = 12;
      var cols = Math.floor((bw - 10) / gx);
      var rows = Math.floor((bh - 14) / gy);
      for (var c = 0; c < cols; c++) {
        for (var rr = 0; rr < rows; rr++) {
          if (Math.random() > conf.density * 0.45) continue;
          var wx = x + 6 + c * gx;
          var wy = top + 8 + rr * gy;
          var a = conf.winAlpha * rand(0.35, 1);
          octx.fillStyle = 'rgba(' + conf.win[0] + ',' + conf.win[1] + ',' + conf.win[2] + ',' + a.toFixed(2) + ')';
          octx.fillRect(wx, wy, ww, wh);
          if (Math.random() < 0.06 && twinkles.length < 70) {
            twinkles.push({ x: wx, y: wy, phase: rand(0, Math.PI * 2), speed: rand(0.3, 1.2) });
          }
        }
      }
      x += bw + rand(4, 26);
    }
    return { canvas: off, spanW: spanW, conf: conf, twinkles: twinkles };
  }

  function build() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    horizonY = H * 0.82;
    layers = LAYER_CONF.map(buildLayer);

    stars = [];
    for (var i = 0; i < 110; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * horizonY * 0.7,
        size: rand(0.4, 1.4),
        phase: rand(0, Math.PI * 2),
        speed: rand(0.5, 1.5)
      });
    }

    reflections = [];
    for (var j = 0; j < 46; j++) {
      reflections.push({
        x: Math.random() * W,
        y: horizonY + rand(4, Math.max(6, H - horizonY - 6)),
        len: rand(14, 70),
        gold: Math.random() < 0.6,
        phase: rand(0, Math.PI * 2),
        speed: rand(0.4, 1.4)
      });
    }
  }
  build();
  window.addEventListener('resize', build);

  window.addEventListener('mousemove', function(e) {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  var t = 0;
  function draw() {
    t += reduceMotion ? 0 : 0.016;
    smx += (mx - smx) * 0.04;
    smy += (my - smy) * 0.04;

    // Небо
    var sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#04070E');
    sky.addColorStop(0.55, '#081020');
    sky.addColorStop(0.82, '#0B1428');
    sky.addColorStop(1, '#04070E');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Луна с ореолом
    var moonX = W * 0.76 - smx * 18;
    var moonY = H * 0.2 - smy * 10;
    var halo = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, H * 0.38);
    halo.addColorStop(0, 'rgba(240,217,166,0.16)');
    halo.addColorStop(0.35, 'rgba(217,179,106,0.05)');
    halo.addColorStop(1, 'rgba(217,179,106,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, W, H);
    ctx.beginPath();
    ctx.arc(moonX, moonY, 26, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(240,228,200,0.92)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(moonX - 9, moonY - 6, 24, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(8,14,26,0.18)';
    ctx.fill();

    // Звёзды
    stars.forEach(function(s) {
      var a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      ctx.fillStyle = 'rgba(230,235,245,' + a.toFixed(2) + ')';
      ctx.fillRect(s.x, s.y, s.size, s.size);
    });

    // Скайлайн: 3 слоя параллакса с медленным дрейфом
    layers.forEach(function(l) {
      var shift = (t * l.conf.drift + smx * l.conf.depth * 46) % l.spanW;
      if (shift < 0) shift += l.spanW;
      ctx.drawImage(l.canvas, -shift, 0);
      ctx.drawImage(l.canvas, l.spanW - shift, 0);
      l.twinkles.forEach(function(wn) {
        var a = 0.5 + 0.5 * Math.sin(t * wn.speed + wn.phase);
        if (a < 0.35) return;
        var wx = wn.x - shift;
        if (wx < -4) wx += l.spanW;
        ctx.fillStyle = 'rgba(255,214,140,' + (a * l.conf.winAlpha).toFixed(2) + ')';
        ctx.fillRect(wx, wn.y, 3, 5);
      });
    });

    // Море
    var sea = ctx.createLinearGradient(0, horizonY, 0, H);
    sea.addColorStop(0, '#0A1322');
    sea.addColorStop(1, '#03060C');
    ctx.fillStyle = sea;
    ctx.fillRect(0, horizonY, W, H - horizonY);

    // Линия горизонта
    ctx.fillStyle = 'rgba(217,179,106,0.18)';
    ctx.fillRect(0, horizonY, W, 1);

    // Лунная дорожка
    var trail = ctx.createLinearGradient(0, horizonY, 0, H);
    trail.addColorStop(0, 'rgba(240,217,166,0.14)');
    trail.addColorStop(1, 'rgba(240,217,166,0)');
    ctx.fillStyle = trail;
    var tw = 60 + 16 * Math.sin(t * 0.7);
    ctx.fillRect(moonX - tw / 2, horizonY, tw, H - horizonY);

    // Отражения огней на воде
    reflections.forEach(function(rf) {
      var a = 0.05 + 0.1 * (0.5 + 0.5 * Math.sin(t * rf.speed + rf.phase));
      ctx.fillStyle = rf.gold
        ? 'rgba(217,179,106,' + a.toFixed(3) + ')'
        : 'rgba(110,160,200,' + (a * 0.8).toFixed(3) + ')';
      ctx.fillRect(rf.x - rf.len / 2, rf.y, rf.len, 1);
    });

    // Виньетка под контент
    var vgrd = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.1, W / 2, H * 0.45, H * 0.9);
    vgrd.addColorStop(0, 'rgba(4,7,14,0.35)');
    vgrd.addColorStop(0.55, 'rgba(4,7,14,0)');
    vgrd.addColorStop(1, 'rgba(4,7,14,0.5)');
    ctx.fillStyle = vgrd;
    ctx.fillRect(0, 0, W, H);

    var bottom = ctx.createLinearGradient(0, H * 0.8, 0, H);
    bottom.addColorStop(0, 'rgba(6,10,20,0)');
    bottom.addColorStop(1, 'rgba(6,10,20,0.96)');
    ctx.fillStyle = bottom;
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
    ctx.strokeStyle = 'rgba(217,179,106,0.04)';
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
        ctx.fillStyle = 'rgba(217,179,106,' + (0.15 * pulse) + ')';
        ctx.fill();
      }
    }

    // Flowing line
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(217,179,106,0.12)';
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
    '#D9B36A','#C2964B','#E5C685','#A8853E',
    '#F0D9A6','#8F6F33','#F5E3B8','#CCA052'
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
    sky.addColorStop(0, '#050A14');
    sky.addColorStop(0.6, '#0A1020');
    sky.addColorStop(1, '#0E1626');
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
    ctx.fillStyle = '#101828';
    ctx.fillRect(0, CH - 40, CW, 40);
    ctx.fillStyle = 'rgba(217,179,106,0.15)';
    ctx.fillRect(0, CH - 42, CW, 2);

    // Draw stacked blocks
    stack.forEach(function(b) { drawBlock(b); });

    // Draw moving block
    if (moving && state === 'playing') {
      drawBlock(moving);

      // Guide line (subtle)
      var last = stack[stack.length - 1];
      ctx.strokeStyle = 'rgba(217,179,106,0.08)';
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

/* ══════════════════════════════════════
   HERO — Пробуквенное появление заголовка
══════════════════════════════════════ */
(function() {
  var delay = 0.35;
  var charStep = 0.045;

  document.querySelectorAll('.hero-title [data-split]').forEach(function(el) {
    var text = el.textContent;
    el.setAttribute('aria-label', text);
    el.textContent = '';
    Array.prototype.forEach.call(text, function(ch) {
      var s = document.createElement('span');
      s.className = 'ht-char';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = ch;
      s.style.setProperty('--d', delay.toFixed(2) + 's');
      delay += charStep;
      el.appendChild(s);
    });
  });

  // Остальные элементы hero выходят следом
  var after = delay + 0.15;
  document.querySelectorAll('.hero-stagger').forEach(function(el, i) {
    el.style.setProperty('--d', (el.classList.contains('hero-tag') ? 0.1 : after + i * 0.12).toFixed(2) + 's');
  });
})();

/* ══════════════════════════════════════
   HERO — Параллакс-выход при скролле
══════════════════════════════════════ */
(function() {
  var content = document.getElementById('heroContent');
  var hero = document.getElementById('hero');
  if (!content || !hero) return;
  var ticking = false;

  function update() {
    ticking = false;
    var y = window.scrollY;
    var h = hero.offsetHeight || 1;
    if (y > h) return;
    content.style.transform = 'translateY(' + (y * 0.35) + 'px)';
    content.style.opacity = Math.max(0, 1 - y / (h * 0.55));
  }
  window.addEventListener('scroll', function() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
})();

/* ══════════════════════════════════════
   SCROLL PROGRESS BAR
══════════════════════════════════════ */
(function() {
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  var ticking = false;

  function update() {
    ticking = false;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
  }
  window.addEventListener('scroll', function() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();

/* ══════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════ */
(function() {
  if (!window.matchMedia || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var dot = document.createElement('div');
  var ring = document.createElement('div');
  dot.className = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  var x = -100, y = -100, rx = -100, ry = -100, shown = false;

  document.addEventListener('mousemove', function(e) {
    x = e.clientX; y = e.clientY;
    if (!shown) { shown = true; document.body.classList.add('has-cursor'); }
    dot.style.transform = 'translate(' + x + 'px,' + y + 'px) translate(-50%,-50%)';
  });
  document.addEventListener('mouseleave', function() {
    shown = false;
    document.body.classList.remove('has-cursor');
  });

  document.addEventListener('mouseover', function(e) {
    if (e.target.closest('a, button, .project-card, .gallery-item, input, select, textarea')) {
      ring.classList.add('is-link');
    } else {
      ring.classList.remove('is-link');
    }
  });

  (function follow() {
    rx += (x - rx) * 0.16;
    ry += (y - ry) * 0.16;
    ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
    requestAnimationFrame(follow);
  })();
})();

/* ══════════════════════════════════════
   PROJECT CARDS — 3D-наклон + блик
══════════════════════════════════════ */
(function() {
  if (!window.matchMedia || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('.project-card').forEach(function(card) {
    var glare = document.createElement('div');
    glare.className = 'card-glare';
    card.appendChild(glare);

    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width;
      var py = (e.clientY - rect.top) / rect.height;
      var ry = (px - 0.5) * 10;
      var rx = (0.5 - py) * 8;
      card.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-4px)';
      card.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
    });
    card.addEventListener('mouseleave', function() {
      card.style.transform = '';
    });
  });
})();

/* ══════════════════════════════════════
   GALLERY — Параллакс при скролле
══════════════════════════════════════ */
(function() {
  var items = document.querySelectorAll('.gallery-item');
  if (!items.length) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var ticking = false;

  function update() {
    ticking = false;
    var vh = window.innerHeight;
    items.forEach(function(item, i) {
      var rect = item.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      var progress = (rect.top + rect.height / 2 - vh / 2) / vh; // -0.5..0.5
      var speed = (i % 3 === 0) ? 26 : (i % 3 === 1) ? -18 : 12;
      item.style.setProperty('--py', (progress * speed).toFixed(1) + 'px');
    });
  }
  window.addEventListener('scroll', function() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();
