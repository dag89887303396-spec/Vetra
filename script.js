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

/* ═══ HERO SWITCHER: выбор ЖК + день/вечер ═══ */
(function () {
  const hero = document.querySelector(".hero");
  const layers = document.querySelectorAll(".hero-layer");
  if (!hero || !layers.length) return;

  // вспышка при смене дня/ночи
  const flash = document.createElement("div");
  flash.className = "hero-flash";
  hero.querySelector(".hero-bgs")?.appendChild(flash);

  // слой свечения и световая волна для «оживления» фона
  const glow = hero.querySelector(".hero-glow");
  const sweep = hero.querySelector(".hero-sweep");
  const heroVideos = hero.querySelectorAll(".hero-video");

  function syncGlow(layer) {
    if (glow && layer) glow.style.backgroundImage = getComputedStyle(layer).backgroundImage;
  }

  // живой видео-фон показываем только для соответствующего состояния (ЖК + вечер)
  function syncVideo(key) {
    let anyOn = false;
    heroVideos.forEach(v => {
      const on = v.dataset.for === key;
      v.classList.toggle("is-active", on);
      if (on) {
        anyOn = true;
        if (!v.dataset.loaded) { v.load(); v.dataset.loaded = "1"; }
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      } else if (!v.paused) {
        v.pause();
      }
    });
    hero.classList.toggle("hero--video", anyOn);
  }

  let project = "horizon";
  let time = "day";

  function apply(withFlash) {
    const key = project + "-" + time;
    const prev = document.querySelector(".hero-layer.is-active");
    layers.forEach(l => {
      l.classList.remove("iris", "iris-under");
      l.classList.toggle("is-active", l.dataset.bg === key);
    });
    const next = document.querySelector(".hero-layer.is-active");
    syncGlow(next);
    syncVideo(key);

    // мягкое световое раскрытие при смене день/вечер
    if (withFlash && prev && next && prev !== next) {
      const toggle = document.querySelector(".dn-toggle");
      if (toggle) {
        const tr = toggle.getBoundingClientRect();
        const hr = hero.getBoundingClientRect();
        // общий центр свечения для фона, волны и слоя-вспышки
        hero.style.setProperty("--iris-x", (((tr.left + tr.width / 2) - hr.left) / hr.width * 100).toFixed(1) + "%");
        hero.style.setProperty("--iris-y", (((tr.top + tr.height / 2) - hr.top) / hr.height * 100).toFixed(1) + "%");
      }
      prev.classList.add("iris-under");
      next.classList.add("iris");
      setTimeout(() => {
        prev.classList.remove("iris-under");
        next.classList.remove("iris");
      }, 1650);
    }
    document.querySelectorAll(".proj-dot").forEach(b =>
      b.classList.toggle("is-active", b.dataset.project === project));
    document.querySelectorAll(".dn-btn").forEach(b =>
      b.classList.toggle("is-active", b.dataset.time === time));
    document.querySelector(".dn-toggle")?.classList.toggle("is-night", time === "night");
    hero.classList.toggle("hero--night", time === "night");

    if (withFlash) {
      flash.classList.remove("run");
      sweep?.classList.remove("run");
      void flash.offsetWidth; // перезапуск анимации
      flash.classList.add("run");
      sweep?.classList.add("run");
    }
  }

  // инициализируем свечение для стартового фона
  syncGlow(document.querySelector(".hero-layer.is-active"));

  document.querySelectorAll(".proj-dot").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.project === project) return;
      project = btn.dataset.project;
      apply(false);
    });
  });

  document.querySelectorAll(".dn-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      stopAutoCycle();
      if (btn.dataset.time === time) return;
      time = btn.dataset.time;
      apply(true);
    });
  });

  /* ── автоматическая смена дня и ночи ──
     плавно листает день/вечер, пока посетитель сам
     не воспользуется переключателем */
  let autoTimer = null;
  let heroVisible = true;

  function stopAutoCycle() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(entries => {
        heroVisible = entries[0].isIntersecting;
      }, { threshold: 0.25 }).observe(hero);
    }
    autoTimer = setInterval(() => {
      if (!heroVisible || document.hidden) return;
      time = time === "day" ? "night" : "day";
      apply(true);
    }, 7000);
    document.querySelectorAll(".proj-dot").forEach(b =>
      b.addEventListener("click", stopAutoCycle));
  }

  // предзагрузка всех фонов после загрузки страницы
  window.addEventListener("load", () => {
    const mobile = window.matchMedia("(max-width: 900px)").matches;
    const suffix = mobile ? "-m.jpg" : "-d.jpg";
    ["horizon-day","horizon-night","moscow-day","moscow-night","alye-day","alye-night"]
      .forEach(k => { const img = new Image(); img.src = "images/hero-" + k + suffix; });
  });
})();
