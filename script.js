const revealItems = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, { threshold: 0.12 });

revealItems.forEach((item) => revealObserver.observe(item));

const filters = document.querySelectorAll(".filter");
const projects = document.querySelectorAll(".project");

filters.forEach((filter) => {
  filter.addEventListener("click", () => {
    filters.forEach((f) => f.classList.remove("active"));
    filter.classList.add("active");

    const selected = filter.dataset.filter;

    projects.forEach((project) => {
      const categories = project.dataset.category;
      const shouldShow = selected === "all" || categories.includes(selected);
      project.classList.toggle("hidden", !shouldShow);
    });
  });
});

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

navToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});




// Layout-linked smart installment calculators
function formatRub(value) {
  const n = Math.max(Math.round(Number(value) || 0), 0);
  return n.toLocaleString("ru-RU") + " ₽";
}

function getSmartPrice(area, down, minDown, maxPrice, fullPrice) {
  const fullPaymentTotal = area * fullPrice;

  if (down <= minDown) return maxPrice;
  if (down >= fullPaymentTotal) return fullPrice;

  const progress = (down - minDown) / Math.max(fullPaymentTotal - minDown, 1);
  const price = maxPrice - progress * (maxPrice - fullPrice);

  return Math.round(price / 1000) * 1000;
}

function setAnimatedText(el, text) {
  if (!el) return;
  if (el.textContent !== text) {
    el.textContent = text;
    el.classList.remove("number-pop");
    void el.offsetWidth;
    el.classList.add("number-pop");
    setTimeout(() => el.classList.remove("number-pop"), 260);
  }
}

function updateCalc(calcBox) {
  const area = Number(calcBox.querySelector(".calc-area")?.value || 0);
  let down = Number(calcBox.querySelector(".calc-down")?.value || 0);
  const term = Math.max(Number(calcBox.querySelector(".calc-term")?.value || 1), 1);

  const maxPrice = Number(calcBox.dataset.currentMaxprice || calcBox.dataset.defaultPrice || 0);
  const fullPrice = Number(calcBox.dataset.currentFullprice || calcBox.dataset.defaultFullprice || 0);
  const minDown = Number(calcBox.dataset.currentMindown || 0);

  const smartPrice = getSmartPrice(area, down, minDown, maxPrice, fullPrice);
  const priceInput = calcBox.querySelector(".calc-price");
  if (priceInput) priceInput.value = smartPrice;

  const total = area * smartPrice;
  if (down > total) {
    down = total;
    const downInput = calcBox.querySelector(".calc-down");
    if (downInput) downInput.value = Math.round(down);
  }

  const rest = Math.max(total - down, 0);
  const monthly = rest / term;
  const fullTotal = area * fullPrice;

  setAnimatedText(calcBox.querySelector(".calc-total"), formatRub(total));
  setAnimatedText(calcBox.querySelector(".calc-rest"), formatRub(rest));
  setAnimatedText(calcBox.querySelector(".calc-monthly"), formatRub(monthly) + "/мес");
  setAnimatedText(calcBox.querySelector(".calc-full"), formatRub(fullTotal));

  const project = calcBox.querySelector(".calc-project")?.textContent.trim() || "";
  const plan = calcBox.querySelector(".calc-plan-title")?.textContent.trim() || "";
  const msg = `Здравствуйте! Хочу отправить расчет с сайта VetraEstate.
Объект: ${project}
Планировка: ${plan}
Площадь: ${area} м²
Цена за м²: ${formatRub(smartPrice)}
Первый взнос: ${formatRub(down)}
Срок рассрочки: ${term} мес.
Стоимость квартиры: ${formatRub(total)}
Остаток: ${formatRub(rest)}
Ежемесячный платеж: ${formatRub(monthly)}/мес.`;
  const sendBtn = calcBox.querySelector(".calc-send-wa");
  if (sendBtn) sendBtn.href = "https://wa.me/79894702263?text=" + encodeURIComponent(msg);

}

function selectPlan(card, shouldScroll = true) {
  const section = card.closest(".calculator-section");
  const calcBox = section.querySelector(".calc-box");
  if (!calcBox) return;

  section.querySelectorAll(".plan-calc-card").forEach((c) => c.classList.remove("active"));
  card.classList.add("active");

  const project = card.dataset.project;
  const type = card.dataset.type;
  const area = card.dataset.area;
  const price = card.dataset.price;
  const fullprice = card.dataset.fullprice;
  const down = card.dataset.down;
  const minDown = card.dataset.mindown || down;
  const term = card.dataset.term;

  calcBox.dataset.currentMaxprice = price;
  calcBox.dataset.currentFullprice = fullprice;
  calcBox.dataset.currentMindown = minDown;

  calcBox.querySelector(".calc-project").textContent = project;
  calcBox.querySelector(".calc-plan-title").textContent = `${type} • ${area} м²`;
  calcBox.querySelector(".calc-area").value = area;
  calcBox.querySelector(".calc-down").value = down;
  calcBox.querySelector(".calc-term").value = term;

  updateCalc(calcBox);

  if (shouldScroll) {
    calcBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

document.querySelectorAll(".calculator-section").forEach((section) => {
  const firstCard = section.querySelector(".plan-calc-card");
  const calcBox = section.querySelector(".calc-box");

  section.querySelectorAll(".plan-calc-card").forEach((card) => {
    card.addEventListener("click", () => selectPlan(card, true));
  });

  if (calcBox) {
    calcBox.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => updateCalc(calcBox));
    });
  }

  // Initial selection without jumping down the page
  if (firstCard) selectPlan(firstCard, false);
});


// Premium layout modal
document.querySelectorAll(".layouts-grid").forEach((grid) => {
  const imgs = Array.from(grid.querySelectorAll(".zoomable-layout"));
  if (!imgs.length) return;

  const modal = document.querySelector(".layout-modal");
  if (!modal) return;

  const modalImg = modal.querySelector("img");
  const closeBtn = modal.querySelector(".layout-modal-close");
  const prevBtn = modal.querySelector(".layout-prev");
  const nextBtn = modal.querySelector(".layout-next");
  let index = 0;

  function openModal(i) {
    index = i;
    modalImg.src = imgs[index].src;
    modalImg.alt = imgs[index].alt || "Планировка";
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function move(step) {
    index = (index + step + imgs.length) % imgs.length;
    modalImg.src = imgs[index].src;
    modalImg.alt = imgs[index].alt || "Планировка";
  }

  imgs.forEach((img, i) => img.addEventListener("click", () => openModal(i)));
  closeBtn?.addEventListener("click", closeModal);
  prevBtn?.addEventListener("click", () => move(-1));
  nextBtn?.addEventListener("click", () => move(1));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("open")) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft") move(-1);
    if (e.key === "ArrowRight") move(1);
  });
});

// Range slider sync and golden price highlight
document.querySelectorAll(".calc-box").forEach((calcBox) => {
  const downInput = calcBox.querySelector(".calc-down");
  const range = calcBox.querySelector(".calc-down-range");
  const priceInput = calcBox.querySelector(".calc-price");

  function syncRangeFromInputs() {
    const area = Number(calcBox.querySelector(".calc-area")?.value || 0);
    const maxPrice = Number(calcBox.dataset.currentMaxprice || calcBox.dataset.defaultPrice || 0);
    const maxTotal = Math.max(area * maxPrice, 1000000);

    if (range) {
      range.max = Math.round(maxTotal);
      range.value = Number(downInput?.value || 0);
    }

    if (priceInput) {
      const currentPrice = Number(priceInput.value || 0);
      const fullPrice = Number(calcBox.dataset.currentFullprice || calcBox.dataset.defaultFullprice || 0);
      priceInput.classList.toggle("good-price", currentPrice <= fullPrice + 5000);
    }
  }

  if (range && downInput) {
    range.addEventListener("input", () => {
      downInput.value = range.value;
      if (typeof updateCalc === "function") updateCalc(calcBox);
      syncRangeFromInputs();
    });

    downInput.addEventListener("input", () => {
      if (typeof updateCalc === "function") updateCalc(calcBox);
      syncRangeFromInputs();
    });

    calcBox.querySelector(".calc-area")?.addEventListener("input", syncRangeFromInputs);
  }

  setTimeout(syncRangeFromInputs, 100);
});

// Patch selectPlan to keep range updated after choosing a plan
if (typeof selectPlan === "function" && !window.__vetraSelectPlanPatched) {
  window.__vetraSelectPlanPatched = true;
  const originalSelectPlan = selectPlan;
  selectPlan = function(card, shouldScroll = true) {
    originalSelectPlan(card, shouldScroll);
    const calcBox = card.closest(".calculator-section")?.querySelector(".calc-box");
    if (!calcBox) return;
    const downInput = calcBox.querySelector(".calc-down");
    const range = calcBox.querySelector(".calc-down-range");
    if (range && downInput) {
      const area = Number(calcBox.querySelector(".calc-area")?.value || 0);
      const maxPrice = Number(calcBox.dataset.currentMaxprice || calcBox.dataset.defaultPrice || 0);
      range.max = Math.round(Math.max(area * maxPrice, 1000000));
      range.value = downInput.value;
    }
  };
}


// Final WhatsApp send calculation updater
function vetraUpdateSendButton(calcBox) {
  if (!calcBox) return;

  const area = Number(calcBox.querySelector(".calc-area")?.value || 0);
  const price = Number(calcBox.querySelector(".calc-price")?.value || 0);
  const down = Number(calcBox.querySelector(".calc-down")?.value || 0);
  const term = Math.max(Number(calcBox.querySelector(".calc-term")?.value || 1), 1);

  const total = area * price;
  const rest = Math.max(total - down, 0);
  const monthly = rest / term;

  const project = calcBox.querySelector(".calc-project")?.textContent.trim() || "";
  const plan = calcBox.querySelector(".calc-plan-title")?.textContent.trim() || "";

  const msg = `Здравствуйте! Хочу отправить расчет с сайта VetraEstate.

Объект: ${project}
Планировка: ${plan}
Площадь: ${area} м²
Цена за м²: ${formatRub(price)}
Первый взнос: ${formatRub(down)}
Срок рассрочки: ${term} мес.

Стоимость квартиры: ${formatRub(total)}
Остаток после взноса: ${formatRub(rest)}
Ежемесячный платеж: ${formatRub(monthly)}/мес.`;

  const btn = calcBox.querySelector(".calc-send-wa");
  if (btn) btn.href = "https://wa.me/79894702263?text=" + encodeURIComponent(msg);
}

document.querySelectorAll(".calc-box").forEach((calcBox) => {
  const update = () => setTimeout(() => vetraUpdateSendButton(calcBox), 30);
  calcBox.querySelectorAll("input").forEach((input) => input.addEventListener("input", update));
  update();
});

document.querySelectorAll(".plan-calc-card").forEach((card) => {
  card.addEventListener("click", () => {
    const calcBox = card.closest(".calculator-section")?.querySelector(".calc-box");
    setTimeout(() => vetraUpdateSendButton(calcBox), 80);
  });
});


// Final reliable send calculation button
function vetraFinalFormatRub(value) {
  const n = Math.max(Math.round(Number(value) || 0), 0);
  return n.toLocaleString("ru-RU") + " ₽";
}

function vetraFinalSendCalc(calcBox) {
  if (!calcBox) return;

  const area = Number(calcBox.querySelector(".calc-area")?.value || 0);
  const price = Number(calcBox.querySelector(".calc-price")?.value || 0);
  const down = Number(calcBox.querySelector(".calc-down")?.value || 0);
  const term = Math.max(Number(calcBox.querySelector(".calc-term")?.value || 1), 1);

  const total = area * price;
  const rest = Math.max(total - down, 0);
  const monthly = rest / term;

  const project = calcBox.querySelector(".calc-project")?.textContent.trim() || "";
  const plan = calcBox.querySelector(".calc-plan-title")?.textContent.trim() || "";

  const msg = `Здравствуйте! Хочу отправить расчет с сайта VetraEstate.

Объект: ${project}
Планировка: ${plan}
Площадь: ${area} м²
Цена за м²: ${vetraFinalFormatRub(price)}
Первый взнос: ${vetraFinalFormatRub(down)}
Срок рассрочки: ${term} мес.

Стоимость квартиры: ${vetraFinalFormatRub(total)}
Остаток после взноса: ${vetraFinalFormatRub(rest)}
Ежемесячный платеж: ${vetraFinalFormatRub(monthly)}/мес.`;

  const btn = calcBox.querySelector(".calc-send-wa");
  if (btn) btn.href = "https://wa.me/79894702263?text=" + encodeURIComponent(msg);
}

function vetraBindSendButtons() {
  document.querySelectorAll(".calc-box").forEach((calcBox) => {
    const update = () => setTimeout(() => vetraFinalSendCalc(calcBox), 50);
    calcBox.querySelectorAll("input").forEach((input) => input.addEventListener("input", update));
    update();
  });

  document.querySelectorAll(".plan-calc-card").forEach((card) => {
    card.addEventListener("click", () => {
      const calcBox = card.closest(".calculator-section")?.querySelector(".calc-box");
      setTimeout(() => vetraFinalSendCalc(calcBox), 120);
    });
  });
}

document.addEventListener("DOMContentLoaded", vetraBindSendButtons);
vetraBindSendButtons();


// Send current calculator result to WhatsApp
function formatRubVetra(value) {
  const n = Math.max(Math.round(Number(value) || 0), 0);
  return n.toLocaleString("ru-RU") + " ₽";
}

function sendCurrentCalcToWhatsAppVetra(calcBox) {
  if (!calcBox) return;

  const area = Number(calcBox.querySelector(".calc-area")?.value || 0);
  const price = Number(calcBox.querySelector(".calc-price")?.value || 0);
  const down = Number(calcBox.querySelector(".calc-down")?.value || 0);
  const term = Math.max(Number(calcBox.querySelector(".calc-term")?.value || 1), 1);

  const total = area * price;
  const rest = Math.max(total - down, 0);
  const monthly = rest / term;

  const project = calcBox.querySelector(".calc-project")?.textContent.trim() || "";
  const plan = calcBox.querySelector(".calc-plan-title")?.textContent.trim() || "";

  const message = `Здравствуйте! Хочу отправить расчет с сайта VetraEstate.

Объект: ${project}
Планировка: ${plan}
Площадь: ${area} м²
Цена за м²: ${formatRubVetra(price)}
Первый взнос: ${formatRubVetra(down)}
Срок рассрочки: ${term} мес.

Стоимость квартиры: ${formatRubVetra(total)}
Остаток после взноса: ${formatRubVetra(rest)}
Ежемесячный платеж: ${formatRubVetra(monthly)}/мес.`;

  const btn = calcBox.querySelector(".calc-send-wa");
  if (btn) {
    btn.href = "https://wa.me/79894702263?text=" + encodeURIComponent(message);
  }
}

function bindVetraCalcWhatsAppButtons() {
  document.querySelectorAll(".calc-box").forEach((calcBox) => {
    const update = () => setTimeout(() => sendCurrentCalcToWhatsAppVetra(calcBox), 50);

    calcBox.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", update);
      input.addEventListener("change", update);
    });

    update();
  });

  document.querySelectorAll(".plan-calc-card").forEach((card) => {
    card.addEventListener("click", () => {
      const calcBox = card.closest(".calculator-section")?.querySelector(".calc-box");
      setTimeout(() => sendCurrentCalcToWhatsAppVetra(calcBox), 150);
    });
  });
}

document.addEventListener("DOMContentLoaded", bindVetraCalcWhatsAppButtons);
bindVetraCalcWhatsAppButtons();


// Link top layout option cards to calculator
function vetraScrollToCalculator(calcBox) {
  if (!calcBox) return;
  const y = calcBox.getBoundingClientRect().top + window.pageYOffset - 115;
  window.scrollTo({ top: y, behavior: "smooth" });
}

function vetraChooseCalculatorPlanByIndex(section, index) {
  const calculatorSection = document.querySelector(".calculator-section");
  if (!calculatorSection) return;

  const cards = calculatorSection.querySelectorAll(".plan-calc-card");
  const card = cards[index] || cards[0];
  if (!card) return;

  if (typeof selectPlan === "function") {
    selectPlan(card, false);
  } else {
    card.click();
  }

  document.querySelectorAll(".layout-calc-trigger").forEach((el) => el.classList.remove("active"));
  const trigger = document.querySelector(`.layout-calc-trigger[data-plan-index="${index}"]`);
  if (trigger) trigger.classList.add("active");

  const calcBox = calculatorSection.querySelector(".calc-box");
  setTimeout(() => vetraScrollToCalculator(calcBox), 80);
}

document.querySelectorAll(".layout-calc-trigger").forEach((trigger) => {
  const run = () => {
    const index = Number(trigger.dataset.planIndex || 0);
    vetraChooseCalculatorPlanByIndex(trigger.closest(".section"), index);
  };

  trigger.addEventListener("click", run);
  trigger.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      run();
    }
  });
});

// Make existing calculator cards scroll to calculator top clearly
document.querySelectorAll(".plan-calc-card").forEach((card) => {
  card.addEventListener("click", () => {
    const calcBox = card.closest(".calculator-section")?.querySelector(".calc-box");
    setTimeout(() => vetraScrollToCalculator(calcBox), 100);
  });
});


// FIX: top layout cards select calculator plan and scroll to calculator
function vetraCalcScrollToBox(calcBox) {
  if (!calcBox) return;
  const y = calcBox.getBoundingClientRect().top + window.pageYOffset - 110;
  window.scrollTo({ top: y, behavior: "smooth" });
}

function vetraSelectCalcPlanByIndex(index) {
  const calculatorSection = document.querySelector(".calculator-section");
  if (!calculatorSection) return;

  const cards = Array.from(calculatorSection.querySelectorAll(".plan-calc-card"));
  const card = cards[index] || cards[0];
  if (!card) return;

  if (typeof selectPlan === "function") {
    selectPlan(card, false);
  } else {
    card.click();
  }

  document.querySelectorAll(".layout-calc-trigger").forEach((el) => el.classList.remove("active"));
  const trigger = document.querySelector(`.layout-calc-trigger[data-plan-index="${index}"]`);
  if (trigger) trigger.classList.add("active");

  const calcBox = calculatorSection.querySelector(".calc-box");
  setTimeout(() => vetraCalcScrollToBox(calcBox), 90);
}

document.querySelectorAll(".layout-calc-trigger").forEach((trigger) => {
  const run = () => vetraSelectCalcPlanByIndex(Number(trigger.dataset.planIndex || 0));
  trigger.addEventListener("click", run);
  trigger.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      run();
    }
  });
});


/* ===== Imported calculator logic from “Калькулятор берем” ===== */
function fmt(n) {
  return Math.max(Math.round(n || 0), 0).toLocaleString('ru-RU') + ' ₽';
}

function smartPrice(area, down, minDown, prMax, prFull) {
  const full = area * prFull;
  if (down <= minDown) return prMax;
  if (down >= full)    return prFull;
  const r = (down - minDown) / Math.max(full - minDown, 1);
  return Math.round((prMax - r * (prMax - prFull)) / 500) * 500;
}

function anim(el, text) {
  if (!el || el.textContent === text) return;
  el.classList.remove('npop');
  void el.offsetWidth;
  el.textContent = text;
  el.classList.add('npop');
}

function fillRange(r) {
  if (!r) return;
  const p = ((+r.value - +r.min) / Math.max(+r.max - +r.min, 1) * 100).toFixed(1) + '%';
  r.style.setProperty('--p', p);
}

function calc(box) {
  const area  = parseFloat(box.querySelector('.c-area')?.value)  || 0;
  let   down  = parseFloat(box.querySelector('.c-down')?.value)  || 0;
  const term  = Math.max(parseInt(box.querySelector('.c-term')?.value) || 1, 1);
  const prMax = parseFloat(box.dataset.prMax  || 0);
  const prFul = parseFloat(box.dataset.prFull || 0);
  const minDn = parseFloat(box.dataset.minDn  || 0);

  const price   = smartPrice(area, down, minDn, prMax, prFul);
  const prEl    = box.querySelector('.c-price');
  if (prEl) prEl.value = price;

  const total   = area * price;
  if (down > total) { down = total; const d = box.querySelector('.c-down'); if (d) d.value = Math.round(down); }
  const rest    = Math.max(total - down, 0);
  const monthly = rest / term;
  const fullAmt = area * prFul;
  const saving  = total - fullAmt;

  anim(box.querySelector('.c-monthly'), fmt(monthly) + '/мес');
  anim(box.querySelector('.c-total'),   fmt(total));
  anim(box.querySelector('.c-rest'),    fmt(rest));
  const fe = box.querySelector('.c-full');
  if (fe) { fe.textContent = fmt(fullAmt); fe.classList.toggle('good-val', fullAmt < total * 0.985); }

  const sv = box.querySelector('.savings');
  if (sv) { sv.textContent = `Экономия при полной оплате: ${fmt(saving)}`; sv.classList.toggle('show', saving > 5000); }

  const rng = box.querySelector('.crange');
  if (rng) {
    const mx = Math.ceil(total / 10000) * 10000 || 1000000;
    rng.max = mx; rng.value = down; fillRange(rng);
  }

  buildWA(box, area, price, down, term, total, rest, monthly);
}

function buildWA(box, area, price, down, term, total, rest, monthly) {
  const btn = box.querySelector('.wa-btn');
  if (!btn) return;
  const proj = box.querySelector('.calc-title')?.textContent?.trim() || '';
  const plan = box.querySelector('.calc-sub')?.textContent?.trim()   || '';
  btn.href = `https://wa.me/79894702263?text=${encodeURIComponent(
    `Здравствуйте! Расчёт с сайта VetraEstate:\n\n` +
    `Объект: ${proj}\nПланировка: ${plan}\n` +
    `Площадь: ${area} м²\nЦена за м²: ${fmt(price)}\n` +
    `Первый взнос: ${fmt(down)}\nСрок: ${term} мес.\n\n` +
    `Стоимость: ${fmt(total)}\nОстаток: ${fmt(rest)}\nПлатёж: ${fmt(monthly)}/мес.`
  )}`;
}

function activatePlan(card, scroll) {
  const sec = card.closest('.calc-section');
  if (!sec) return;
  sec.querySelectorAll('.cplan').forEach(c => c.classList.remove('on'));
  card.classList.add('on');

  const box = sec.querySelector('.calc-box');
  if (!box) return;

  box.dataset.prMax  = card.dataset.price;
  box.dataset.prFull = card.dataset.fullprice;
  box.dataset.minDn  = card.dataset.mindown || card.dataset.down;

  const ttl = box.querySelector('.calc-title');
  const sub = box.querySelector('.calc-sub');
  if (ttl) ttl.textContent = card.dataset.project || '';
  if (sub) sub.textContent = (card.querySelector('strong')?.textContent || '') + ' · ' + (card.dataset.area || '') + ' м²';

  const ai = box.querySelector('.c-area'), ti = box.querySelector('.c-term'), di = box.querySelector('.c-down');
  if (ai) ai.value = card.dataset.area  || '';
  if (ti) ti.value = card.dataset.term  || '';
  if (di) di.value = card.dataset.down  || 0;

  box.querySelectorAll('.tbtn').forEach(b => b.classList.toggle('on', b.dataset.val === card.dataset.term));

  calc(box);

  const sl = box.querySelector('.crange');
  if (sl) {
    sl.classList.remove('vibe'); void sl.offsetWidth; sl.classList.add('vibe');
    setTimeout(() => sl.classList.remove('vibe'), 320);
    if (navigator.vibrate) navigator.vibrate([18, 6, 12]);
  }

  if (scroll) setTimeout(() => {
    window.scrollTo({ top: box.getBoundingClientRect().top + scrollY - 110, behavior: 'smooth' });
  }, 60);
}

/* Init plan cards */
document.querySelectorAll('.cplan').forEach(c => c.addEventListener('click', () => activatePlan(c, true)));
document.querySelectorAll('.calc-section').forEach(sec => {
  const first = sec.querySelector('.cplan.on') || sec.querySelector('.cplan');
  if (first) activatePlan(first, false);
});

/* Calc inputs */
document.querySelectorAll('.calc-box').forEach(box => {
  const ai = box.querySelector('.c-area'), di = box.querySelector('.c-down'), ti = box.querySelector('.c-term');
  const sl = box.querySelector('.crange');
  [ai, di, ti].forEach(i => i?.addEventListener('input', () => calc(box)));
  if (sl && di) {
    sl.addEventListener('input', () => { di.value = sl.value; fillRange(sl); calc(box); });
    di.addEventListener('input', () => { sl.value = di.value; fillRange(sl); });
    fillRange(sl);
  }
  box.querySelectorAll('.tbtn').forEach(b => b.addEventListener('click', () => {
    box.querySelectorAll('.tbtn').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    if (ti) { ti.value = b.dataset.val; calc(box); }
  }));
});

/* Plan trigger cards */
document.querySelectorAll('.ptrig, .layout-calc-trigger').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ptrig').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const idx = +btn.dataset.planIndex || 0;
    const cards = [...document.querySelectorAll('.cplan')];
    const t = cards[idx] || cards[0];
    if (!t) return;
    activatePlan(t, false);
    const s = document.querySelector('.calc-section');
    if (s) setTimeout(() => window.scrollTo({ top: s.getBoundingClientRect().top + scrollY - 96, behavior: 'smooth' }), 60);
  });
});




// MY MONEY FEATURE V2 — bottom drawer budget finder
(function(){
  const plans = [
    { project:"ЖК Новый Горизонт", type:"1К", area:47, price:85000, fullPrice:60000, minDown:150000, term:60, page:"new-horizon.html", photo:"images/horizon-new-photo-1.jpg" },
    { project:"ЖК Новый Горизонт", type:"2К", area:70, price:85000, fullPrice:60000, minDown:200000, term:60, page:"new-horizon.html", photo:"images/horizon-new-photo-4.jpg" },
    { project:"ЖК Новый Горизонт", type:"2К", area:76, price:85000, fullPrice:60000, minDown:200000, term:60, page:"new-horizon.html", photo:"images/horizon-new-photo-6.jpg" },
    { project:"АК Алые Паруса", type:"Студия", area:32, price:90000, fullPrice:50000, minDown:150000, term:42, page:"alye-parusa.html", photo:"images/alye-photo-2.jpg" },
    { project:"АК Алые Паруса", type:"Евро 2К", area:55, price:90000, fullPrice:50000, minDown:150000, term:42, page:"alye-parusa.html", photo:"images/alye-photo-3.jpg" },
    { project:"ЖК Московский", type:"1К", area:39, price:85000, fullPrice:70000, minDown:500000, term:70, page:"moskovskiy.html", photo:"images/moscow-photo-1.jpg" },
    { project:"ЖК Московский", type:"1К", area:53, price:85000, fullPrice:70000, minDown:500000, term:70, page:"moskovskiy.html", photo:"images/moscow-photo-2.jpg" },
    { project:"ЖК Московский", type:"2К", area:77, price:85000, fullPrice:70000, minDown:500000, term:70, page:"moskovskiy.html", photo:"images/moscow-photo-5.jpg" }
  ];

  const rub = (v) => Math.max(Math.round(Number(v)||0),0).toLocaleString("ru-RU") + " ₽";
  const $ = (s) => document.querySelector(s);

  function monthly(plan, money) {
    return Math.max(plan.area * plan.price - money, 0) / plan.term;
  }

  function open() {
    $(".money-drawer-v2")?.classList.add("open");
    $(".money-drawer-v2")?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => $(".money-input-v2")?.focus(), 120);
  }

  function close() {
    $(".money-drawer-v2")?.classList.remove("open");
    $(".money-drawer-v2")?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function render() {
    const input = $(".money-input-v2");
    const summary = $(".money-summary-v2");
    const results = $(".money-results-v2");
    const wa = $(".money-whatsapp-v2");
    if (!input || !summary || !results || !wa) return;

    const money = Number(input.value || 0);
    const suitable = plans
      .filter(p => money >= p.minDown)
      .map(p => ({ ...p, total: p.area * p.price, monthly: monthly(p, money), userDown: money }))
      .sort((a,b) => a.monthly - b.monthly);

    if (!money) {
      summary.innerHTML = "Введите сумму или выберите быстрый вариант.";
      results.innerHTML = "";
      wa.classList.remove("show");
      return;
    }

    summary.innerHTML = `<strong>У вас: ${rub(money)}</strong><br>Подходящих вариантов: ${suitable.length}`;

    if (!suitable.length) {
      results.innerHTML = `<div class="money-empty-v2">Пока нет вариантов под эту сумму. Минимальный взнос начинается от ${rub(150000)}. Напишите нам — подберём горящие предложения или альтернативы.</div>`;
      wa.classList.add("show");
      wa.href = "https://wa.me/79894702263?text=" + encodeURIComponent(`Здравствуйте! У меня есть ${rub(money)} на первоначальный взнос. Подберите, пожалуйста, варианты.`);
      return;
    }

    results.innerHTML = suitable.map(p => `
      <article class="money-card-v2">
        <div class="money-card-photo-wrap">
          <img class="money-card-photo-v2" src="${p.photo}" alt="${p.project}" loading="lazy">
          <span class="money-card-badge-v2">✓ Подходит</span>
          <div class="money-card-photo-title">
            <h3>${p.project}</h3>
            <p>${p.type} · ${p.area} м²</p>
          </div>
        </div>
        <div class="money-card-body-v2">
          <div class="money-card-top-v2">
            <div>
              <h3>${p.project}</h3>
              <p>${p.type} • ${p.area} м²</p>
            </div>
            <span class="money-card-badge-old">✓ Подходит</span>
          </div>

          <div class="money-info-v2">
            <div><small>Цена за м²</small><strong>${rub(p.price)}</strong></div>
            <div><small>Ваш взнос</small><strong>${rub(p.userDown)}</strong></div>
            <div><small>Срок</small><strong>${p.term} мес.</strong></div>
            <div><small>Платёж</small><strong>≈ ${rub(p.monthly)}/мес</strong></div>
          </div>

          <a href="${p.page}#calculator">Открыть калькулятор</a>
        </div>
      </article>
    `).join("");

    const msg = `Здравствуйте! Хочу отправить подборку по функции «Мои деньги».

У меня есть: ${rub(money)}

Подходящие варианты:
${suitable.map(p => `• ${p.project} — ${p.type}, ${p.area} м², взнос ${rub(p.userDown)}, срок ${p.term} мес., платёж ≈ ${rub(p.monthly)}/мес.`).join("\n")}`;

    wa.classList.add("show");
    wa.href = "https://wa.me/79894702263?text=" + encodeURIComponent(msg);
  }

  function bind() {
    $(".money-mini-v2")?.addEventListener("click", open);
    $(".money-close-v2")?.addEventListener("click", close);
    $(".money-drawer-bg-v2")?.addEventListener("click", close);
    $(".money-run-v2")?.addEventListener("click", render);
    $(".money-input-v2")?.addEventListener("input", render);
    $(".money-input-v2")?.addEventListener("keydown", e => {
      if (e.key === "Enter") render();
    });
    document.querySelectorAll(".money-chips-v2 button").forEach(btn => {
      btn.addEventListener("click", () => {
        const input = $(".money-input-v2");
        if (input) input.value = btn.dataset.money;
        render();
      });
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && $(".money-drawer-v2")?.classList.contains("open")) close();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();

/* ═══ HERO v4: выбор ЖК + кинематографичный день↔ночь + живой фон ═══ */
(function () {
  const hero = document.querySelector(".hero");
  const stage = document.querySelector(".hero-bgs");
  if (!hero || !stage) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const layerEls = {};
  document.querySelectorAll(".hero-layer").forEach((l) => {
    layerEls[l.dataset.bg] = l;
    l._op = parseFloat(getComputedStyle(l).opacity) || 0;
  });

  const grade = stage.querySelector(".hero-grade");
  const fx = stage.querySelector(".hero-fx");
  const ctx = fx ? fx.getContext("2d") : null;

  let project = "horizon";
  let time = "day";
  let night = 0;        // текущее «количество ночи» 0..1
  let targetNight = 0;  // цель

  /* ── геометрия эффектов (доли кадра) ── */
  let W = 0, H = 0, dpr = 1;
  let stars = [], windows = [], streaks = [], motes = [];

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function buildFx() {
    if (!fx) return;
    const r = stage.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = r.width; H = r.height;
    fx.width = Math.round(W * dpr);
    fx.height = Math.round(H * dpr);
    fx.style.width = W + "px";
    fx.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // звёзды — в верхней трети неба
    stars = Array.from({ length: 70 }, () => ({
      x: rnd(0, W), y: rnd(0, H * 0.36),
      r: rnd(0.4, 1.4), ph: rnd(0, Math.PI * 2), sp: rnd(0.6, 1.8),
    }));
    // окна — по «телу» зданий
    windows = Array.from({ length: 130 }, () => ({
      x: rnd(0, W), y: rnd(H * 0.26, H * 0.74),
      w: rnd(2, 4), h: rnd(2.5, 5),
      ph: rnd(0, Math.PI * 2), sp: rnd(0.3, 1.3),
      always: Math.random() < 0.45,
    }));
    // фары машин — в нижней дорожной полосе
    streaks = Array.from({ length: 7 }, () => spawnStreak(true));
    // плавающие искры/боке — по всему кадру
    motes = Array.from({ length: 26 }, () => ({
      x: rnd(0, W), y: rnd(0, H),
      r: rnd(0.6, 2.2), sp: rnd(4, 14),
      drift: rnd(-6, 6), ph: rnd(0, Math.PI * 2), a: rnd(0.05, 0.22),
    }));
  }

  function spawnStreak(initial) {
    const dir = Math.random() < 0.5 ? 1 : -1;
    const tail = Math.random() < 0.5; // задние (красные) или передние (белые) фары
    const y = rnd(H * 0.74, H * 0.96);
    return {
      dir,
      x: initial ? rnd(0, W) : (dir > 0 ? -rnd(40, 240) : W + rnd(40, 240)),
      y,
      len: rnd(40, 120),
      sp: rnd(120, 260),
      tail,
      wait: initial ? 0 : rnd(0, 3),
    };
  }

  /* ── управление слоями ── */
  function refreshLive() {
    const dk = project + "-day", nk = project + "-night";
    Object.entries(layerEls).forEach(([k, el]) => {
      el.classList.toggle("live", k === dk || k === nk);
    });
  }

  function targetOpacity(key) {
    if (key === project + "-day") return 1 - night;
    if (key === project + "-night") return night;
    return 0;
  }

  /* ── рендер-цикл ── */
  let last = performance.now();
  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    night += (targetNight - night) * (reduce ? 1 : 0.05);
    if (Math.abs(targetNight - night) < 0.002) night = targetNight;

    // opacity слоёв
    Object.entries(layerEls).forEach(([k, el]) => {
      const t = targetOpacity(k);
      el._op += (t - el._op) * (reduce ? 1 : 0.08);
      if (Math.abs(t - el._op) < 0.003) el._op = t;
      el.style.opacity = el._op.toFixed(3);
    });

    // градуировка «золотой час» во время перехода
    if (grade) {
      const heat = 4 * night * (1 - night); // пик на середине перехода
      grade.style.opacity = (heat * 0.55).toFixed(3);
      grade.style.setProperty("--grade-top", "rgba(255,168,86,1)");
      grade.style.setProperty("--grade-bot", "rgba(255,104,44,1)");
    }

    if (ctx && !reduce) drawFx(dt, now / 1000);

    requestAnimationFrame(loop);
  }

  function drawFx(dt, t) {
    ctx.clearRect(0, 0, W, H);
    const n = night;

    // боке-искры
    motes.forEach((m) => {
      m.y -= m.sp * dt;
      m.x += Math.sin(t + m.ph) * m.drift * dt;
      if (m.y < -6) { m.y = H + 6; m.x = rnd(0, W); }
      const tw = 0.6 + 0.4 * Math.sin(t * 1.5 + m.ph);
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${n > 0.5 ? "150,180,230" : "255,225,170"},${(m.a * tw).toFixed(3)})`;
      ctx.fill();
    });

    // звёзды (только ночью)
    if (n > 0.02) {
      stars.forEach((s) => {
        const a = (0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph))) * n;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(235,240,255,${a.toFixed(3)})`;
        ctx.fill();
      });
    }

    // окна — загораются к ночи
    const winBase = 0.04;
    windows.forEach((wd) => {
      let lit;
      if (wd.always) lit = 0.55 + 0.25 * Math.sin(t * wd.sp + wd.ph);
      else lit = Math.max(0, Math.sin(t * wd.sp + wd.ph) - 0.45) * 1.6;
      const a = winBase * (1 - n) + lit * n * 0.9;
      if (a <= 0.01) return;
      ctx.fillStyle = `rgba(255,206,128,${a.toFixed(3)})`;
      ctx.fillRect(wd.x, wd.y, wd.w, wd.h);
      // мягкое свечение
      ctx.fillStyle = `rgba(255,196,120,${(a * 0.25).toFixed(3)})`;
      ctx.fillRect(wd.x - 1.5, wd.y - 1.5, wd.w + 3, wd.h + 3);
    });

    // фары машин
    const bright = 0.4 + 0.6 * n;
    streaks.forEach((s, i) => {
      if (s.wait > 0) { s.wait -= dt; return; }
      s.x += s.dir * s.sp * dt;
      if ((s.dir > 0 && s.x - s.len > W) || (s.dir < 0 && s.x + s.len < 0)) {
        streaks[i] = spawnStreak(false);
        return;
      }
      const x0 = s.x, x1 = s.x - s.dir * s.len;
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      const col = s.tail ? "255,70,50" : "255,238,200";
      g.addColorStop(0, `rgba(${col},${(0.7 * bright).toFixed(3)})`);
      g.addColorStop(1, `rgba(${col},0)`);
      ctx.strokeStyle = g;
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x0, s.y);
      ctx.lineTo(x1, s.y + s.dir * 3);
      ctx.stroke();
    });
  }

  /* ── переключение ── */
  function setProject(p) {
    if (p === project) return;
    project = p;
    refreshLive();
    document.querySelectorAll(".proj-dot").forEach((b) =>
      b.classList.toggle("is-active", b.dataset.project === project));
  }

  function setTime(tm) {
    time = tm;
    targetNight = tm === "night" ? 1 : 0;
    document.querySelectorAll(".dn-btn").forEach((b) =>
      b.classList.toggle("is-active", b.dataset.time === time));
    document.querySelector(".dn-toggle")?.classList.toggle("is-night", time === "night");
    hero.classList.toggle("hero--night", time === "night");
  }

  document.querySelectorAll(".proj-dot").forEach((btn) => {
    btn.addEventListener("click", () => { stopAuto(); setProject(btn.dataset.project); });
  });
  document.querySelectorAll(".dn-btn").forEach((btn) => {
    btn.addEventListener("click", () => { stopAuto(); if (btn.dataset.time !== time) setTime(btn.dataset.time); });
  });

  /* ── авто-смена дня и ночи ── */
  let autoTimer = null, heroVisible = true;
  function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }
  if (!reduce) {
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((e) => { heroVisible = e[0].isIntersecting; },
        { threshold: 0.25 }).observe(hero);
    }
    autoTimer = setInterval(() => {
      if (!heroVisible || document.hidden) return;
      setTime(time === "day" ? "night" : "day");
    }, 8000);
  }

  /* ── инициализация ── */
  buildFx();
  refreshLive();
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(buildFx, 200); });
  requestAnimationFrame(loop);

  // предзагрузка фонов
  window.addEventListener("load", () => {
    const mobile = window.matchMedia("(max-width: 900px)").matches;
    const suffix = mobile ? "-m.jpg" : "-d.jpg";
    ["horizon-day", "horizon-night", "moscow-day", "moscow-night", "alye-day", "alye-night"]
      .forEach((k) => { const img = new Image(); img.src = "images/hero-" + k + suffix; });
  });
})();

