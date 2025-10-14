// --- Owner settings for the coffee line (edit to your real info) ---
const OWNER = { role: "teacher", salaryEUR: 40000, hoursPerWeek: 40 };

// --- Data (EUR base, illustrative) ---
const BILLIONAIRES = [
  { id: "bezos",  name: "Jeff Bezos",      netWorthEUR: 200_000_000_000, estAnnualIncomeEUR: 8_000_000_000,  estHoursPerWeek: 60, company: "amazon" },
  { id: "musk",   name: "Elon Musk",       netWorthEUR: 220_000_000_000, estAnnualIncomeEUR: 10_000_000_000, estHoursPerWeek: 70, company: "tesla" },
  { id: "arnault",name: "Bernard Arnault", netWorthEUR: 190_000_000_000, estAnnualIncomeEUR: 5_000_000_000,  estHoursPerWeek: 55, company: "n/a" },
  { id: "oprah",  name: "Oprah Winfrey",   netWorthEUR: 2_500_000_000,   estAnnualIncomeEUR: 120_000_000,    estHoursPerWeek: 50, company: "n/a" },
];

// Typical roles (annual wage) — placeholders; edit freely
const ROLE_WAGE = {
  teacher: 36000,
  nurse: 42000,
  firefighter: 38000,
  accountant: 48000,
  warehouse: 30000,
  driver: 32000,
};

// Preset items (prices) — placeholders; edit freely
const ITEM_PRESETS = {
  300000: "House (mid-market)",
  30000: "Car (new compact)",
  1500: "Laptop",
  50: "Grocery shop",
  3: "Coffee",
};

// FX (illustrative) — 1 EUR equals:
const FX_RATES = { EUR:1, USD:1.08, GBP:0.86, AUD:1.62, CAD:1.47, JPY:170.0, INR:89.0 };
const LOCALE_FOR = { EUR:"en-IE", USD:"en-US", GBP:"en-GB", AUD:"en-AU", CAD:"en-CA", JPY:"ja-JP", INR:"en-IN" };

const fmtInt = (n) => new Intl.NumberFormat('en-IE').format(n);
function makeFormatters(currency){
  const locale = LOCALE_FOR[currency] || 'en-IE';
  return {
    c0: new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }),
    c2: new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }),
    symbol: new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).formatToParts(0).find(p=>p.type==='currency')?.value || ''
  };
}
const convertEUR = (amountEUR, toCurrency) => (amountEUR * (FX_RATES[toCurrency] || 1));

function secondsToHuman(sec) {
  if (sec < 1) return `${(sec*1000).toFixed(0)} ms`;
  if (sec < 60) return `${sec.toFixed(2)} s`;
  const m = Math.floor(sec/60), s = sec % 60;
  if (m < 60) return `${m}m ${s.toFixed(0)}s`;
  const h = Math.floor(m/60), mm = m % 60;
  if (h < 24) return `${h}h ${mm}m`;
  const d = Math.floor(h/24), hh = h % 24;
  return `${d}d ${hh}h`;
}
function yearsToHuman(years) {
  if (!isFinite(years)) return "∞";
  if (years < 1) return `${(years*12).toFixed(1)} months`;
  if (years < 100) return `${years.toFixed(1)} years`;
  return `${new Intl.NumberFormat('en-IE').format(Number(years.toFixed(0)))} years`;
}
function onReady(fn){ if(document.readyState!=="loading"){ fn(); } else { document.addEventListener("DOMContentLoaded", fn); } }

onReady(() => {
  // DOM
  const selectEl = document.getElementById('billionaireSelect');
  const currencyEl = document.getElementById('currencySelect');
  const currencyPrefix = document.getElementById('currencyPrefix');
  const salaryEl = document.getElementById('salary');
  const hoursEl = document.getElementById('hoursPerWeek');
  const formEl = document.getElementById('inputForm');

  const resultsEl = document.getElementById('results');
  const placeholderEl = document.getElementById('placeholder');

  const youPerHourEl = document.getElementById('youPerHour');
  const billPerHourEl = document.getElementById('billPerHour');
  const workMultiplierEl = document.getElementById('workMultiplier');
  const timeToYourSalaryEl = document.getElementById('timeToYourSalary');

  const requiredHoursAnnualEl = document.getElementById('requiredHoursAnnual');
  const requiredAnnualNoteEl = document.getElementById('requiredAnnualNote');
  const youEquivalentsAnnualEl = document.getElementById('youEquivalentsAnnual');
  const grindTo168Btn = document.getElementById('grindTo168');

  const billSinceLoadEl = document.getElementById('billSinceLoad');
  const youSinceLoadEl = document.getElementById('youSinceLoad');
  const presetOut = document.getElementById('presetOut');

  const hoursSlider = document.getElementById('hoursSlider');
  const hoursLabel = document.getElementById('hoursLabel');
  const lockHourlyEl = document.getElementById('lockHourly');
  const simYouPerHourEl = document.getElementById('simYouPerHour');
  const simWorkMultiplierEl = document.getElementById('simWorkMultiplier');
  const simNoteEl = document.getElementById('simNote');
  const yearsToNetWorthEl = document.getElementById('yearsToNetWorth');
  const grindBtn = document.getElementById('grindBtn');
  const grindInfo = document.getElementById('grindInfo');

  const nameTitle = document.getElementById('billionaireNameTitle');
  const nameA = document.getElementById('billionaireNameA');
  const nameB = document.getElementById('billionaireNameB');
  const nameC = document.getElementById('billionaireNameC');
  const nameD = document.getElementById('billionaireNameD');

  const yearEl = document.getElementById('year');
  const shareBtn = document.getElementById('shareBtn');
  const resetLink = document.getElementById('resetLink');
  const simulatorSection = document.getElementById('simulator');

  const companySelect = document.getElementById('companySelect');
  const roleSelect = document.getElementById('roleSelect');
  const fairWageEl = document.getElementById('fairWage');
  const currencyPrefixFW = document.getElementById('currencyPrefixFW');
  const workersAnnualEl = document.getElementById('workersAnnual');
  const workersHourlyEl = document.getElementById('workersHourly');

  const itemSelect = document.getElementById('itemSelect');
  const itemPriceEl = document.getElementById('itemPrice');
  const currencyPrefixItem = document.getElementById('currencyPrefixItem');
  const billTimeToItemEl = document.getElementById('billTimeToItem');
  const youTimeToItemEl = document.getElementById('youTimeToItem');

  const taxRateEl = document.getElementById('taxRate');
  const afterTaxIncomeEl = document.getElementById('afterTaxIncome');
  const afterTaxDeltaEl = document.getElementById('afterTaxDelta');

  const coffeeBtn = document.getElementById('coffeeBtn');
  const coffeeMsg = document.getElementById('coffeeMsg');

  yearEl.textContent = new Date().getFullYear();

  // Populate selects
  BILLIONAIRES.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b.id;
    opt.textContent = b.name;
    selectEl.appendChild(opt);
  });
  selectEl.value = "bezos";

  // Set default role wage
  roleSelect.value = "teacher";
  fairWageEl.value = ROLE_WAGE[roleSelect.value];

  const LS_KEY = "hmh-state-v6";
  let state = {
    selected: BILLIONAIRES[0],
    salary: 0,
    hoursPerWeek: 40,
    startEpoch: performance.now(),
    perSecondYouEUR: 0,
    perSecondTheyEUR: 0,
    currency: currencyEl.value,
    fmt: makeFormatters(currencyEl.value),
    grind: false
  };

  function updateNames(b) {
    nameTitle.textContent = b.name;
    nameA.textContent = b.name;
    nameB.textContent = b.name;
    nameC.textContent = b.name;
    nameD.textContent = b.name;
    companySelect.value = b.company || "amazon";
  }
  function recalcPrefixes(){
    const sym = state.fmt.symbol || state.currency;
    currencyPrefix.textContent = sym;
    currencyPrefixFW.textContent = sym;
    currencyPrefixItem.textContent = sym;
  }

  (function bootstrap(){
    const params = new URLSearchParams(location.search);
    const ls = (() => { try { return JSON.parse(localStorage.getItem(LS_KEY) || "null"); } catch(e){ return null; } })();
    const fromURL = params.has('salary') || params.has('b') || params.has('hours') || params.has('cur');
    const src = fromURL ? params : ls;

    if (src) {
      const bId = (fromURL ? src.get('b') : src.b) || "bezos";
      state.selected = BILLIONAIRES.find(x => x.id === bId) || BILLIONAIRES[0];
      selectEl.value = state.selected.id;

      const maybeCur = fromURL ? src.get('cur') : src.cur;
      if (maybeCur) { state.currency = String(maybeCur).toUpperCase(); currencyEl.value = state.currency; }
      state.fmt = makeFormatters(state.currency);

      const maybeSal = fromURL ? src.get('salary') : src.salary;
      const maybeHrs = fromURL ? src.get('hours') : src.hours;
      if (maybeSal) { state.salary = Number(maybeSal) || 0; salaryEl.value = state.salary; }
      if (maybeHrs) { state.hoursPerWeek = Number(maybeHrs) || 40; hoursEl.value = state.hoursPerWeek; }
    }
    updateNames(state.selected);
    recalcPrefixes();
    if (state.salary > 0 && state.hoursPerWeek > 0) {
      resultsEl.classList.remove('hidden');
      placeholderEl.classList.add('hidden');
      computeAll(); startTicker();
    }
  })();

  function persistState() {
    const params = new URLSearchParams({
      b: state.selected.id,
      salary: String(state.salary),
      hours: String(state.hoursPerWeek),
      cur: state.currency
    });
    history.replaceState(null, "", `${location.pathname}?${params.toString()}`);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        b: state.selected.id, salary: state.salary, hours: state.hoursPerWeek, cur: state.currency
      }));
    } catch(e){}
  }

  function computeAll() {
    const b = state.selected;
    const salaryEUR = Number(state.salary) / (FX_RATES[state.currency] || 1);
    const yourHourlyEUR = salaryEUR / (state.hoursPerWeek * 52);
    const theirHourlyEUR = b.estAnnualIncomeEUR / (b.estHoursPerWeek * 52);

    state.perSecondYouEUR = salaryEUR / (365*24*3600);
    state.perSecondTheyEUR = b.estAnnualIncomeEUR / (365*24*3600);

    youPerHourEl.textContent = state.fmt.c2.format(convertEUR(yourHourlyEUR, state.currency));
    billPerHourEl.textContent = state.fmt.c2.format(convertEUR(theirHourlyEUR, state.currency));
    workMultiplierEl.textContent = isFinite(theirHourlyEUR / yourHourlyEUR) ? `${fmtInt(Number((theirHourlyEUR/yourHourlyEUR).toFixed(0)))}×` : "—";

    const secsForYourSalary = salaryEUR / state.perSecondTheyEUR;
    timeToYourSalaryEl.textContent = isFinite(secsForYourSalary) ? secondsToHuman(secsForYourSalary) : "—";

    // Required hours/week to match their ANNUAL income at your hourly
    const requiredHoursAnnual = (b.estAnnualIncomeEUR / yourHourlyEUR) / 52;
    requiredHoursAnnualEl.textContent = isFinite(requiredHoursAnnual) ? `${requiredHoursAnnual.toFixed(1)} h/week` : "—";
    const peopleEq = requiredHoursAnnual / 40;
    const peopleText = isFinite(peopleEq) ? `≈ ${fmtInt(Number(peopleEq.toFixed(0)))} people at 40h/week.` : "";
    requiredAnnualNoteEl.textContent = `Shown for scale. ${peopleText}`;

    // “How many of you” (annual income basis)
    const youEqAnnual = b.estAnnualIncomeEUR / (salaryEUR || Infinity);
    youEquivalentsAnnualEl.textContent = isFinite(youEqAnnual) ? `${fmtInt(Number(youEqAnnual.toFixed(0)))}` : "—";

    // Workforce equivalents
    const wageEUR = (Number(fairWageEl.value) / (FX_RATES[state.currency] || 1)) || ROLE_WAGE[roleSelect.value] || 35000;
    const workersYr = b.estAnnualIncomeEUR / wageEUR;
    const workersHr = theirHourlyEUR / (wageEUR / (40*52)); // 40h/week baseline
    workersAnnualEl.textContent = isFinite(workersYr) ? fmtInt(Number(workersYr.toFixed(0))) : "—";
    workersHourlyEl.textContent = isFinite(workersHr) ? workersHr.toFixed(1) : "—";

    // Item price timers
    const priceInput = Number(itemPriceEl.value) || 0;
    const priceSelect = Number(itemSelect.value) || 0;
    const price = priceInput > 0 ? priceInput : priceSelect;
    const priceEUR = price / (FX_RATES[state.currency] || 1);
    if (priceEUR > 0) {
      const tBill = priceEUR / state.perSecondTheyEUR;
      const tYou  = priceEUR / state.perSecondYouEUR;
      billTimeToItemEl.textContent = secondsToHuman(tBill);
      youTimeToItemEl.textContent = secondsToHuman(tYou);
    } else {
      billTimeToItemEl.textContent = "—";
      youTimeToItemEl.textContent = "—";
    }

    // Tax parity experiment
    const taxRate = Number(taxRateEl.value) || 0;
    const afterTax = b.estAnnualIncomeEUR * (1 - taxRate/100);
    afterTaxIncomeEl.textContent = state.fmt.c2.format(convertEUR(afterTax, state.currency));
    const delta = afterTax - b.estAnnualIncomeEUR;
    afterTaxDeltaEl.textContent = `${delta >= 0 ? "+" : ""}${state.fmt.c2.format(convertEUR(delta, state.currency))} vs. our current estimate.`;

    simulatorSection.classList.remove('hidden');
    hoursSlider.value = state.hoursPerWeek;
    hoursLabel.textContent = state.hoursPerWeek;
    updateSimulator();
    persistState();
    updateCoffeeMsg();
  }

  function updateSimulator() {
    const b = state.selected;
    const newHours = Number(hoursSlider.value);
    hoursLabel.textContent = newHours;

    const salaryEUR = Number(state.salary) / (FX_RATES[state.currency] || 1);
    const baseHourlyEUR = salaryEUR / (state.hoursPerWeek * 52);
    const theirHourlyEUR = b.estAnnualIncomeEUR / (b.estHoursPerWeek * 52);

    let simAnnualEUR, simHourlyEUR;
    if (lockHourlyEl.checked) {
      // Keep your hourly constant, change annual with hours.
      simHourlyEUR = baseHourlyEUR;
      simAnnualEUR = simHourlyEUR * (newHours * 52);
      simYouPerHourEl.textContent = state.fmt.c2.format(convertEUR(simHourlyEUR, state.currency));
      simNoteEl.textContent = `Implied annual salary: ${state.fmt.c2.format(convertEUR(simAnnualEUR, state.currency))}`;
    } else {
      // Keep salary constant, hourly changes with hours.
      simAnnualEUR = salaryEUR;
      simHourlyEUR = salaryEUR / (newHours * 52);
      simYouPerHourEl.textContent = state.fmt.c2.format(convertEUR(simHourlyEUR, state.currency));
      simNoteEl.textContent = ``;
    }
    simWorkMultiplierEl.textContent = isFinite(theirHourlyEUR/simHourlyEUR) ? `${fmtInt(Number((theirHourlyEUR/simHourlyEUR).toFixed(0)))}×` : '—';

    // Years to net worth based on the simulated annual
    const years = (b.netWorthEUR) / (simAnnualEUR || 1/0);
    yearsToNetWorthEl.textContent = isFinite(years) ? yearsToHuman(years) : '—';

    // Grind info
    if (state.grind) {
      const yourGrindHourlyEUR = salaryEUR / (168 * 52);
      const ratio = theirHourlyEUR / yourGrindHourlyEUR;
      grindInfo.classList.remove('hidden');
      grindInfo.textContent = `Grind Mode: at 168 h/week your hourly is ${state.fmt.c2.format(convertEUR(yourGrindHourlyEUR, state.currency))}. Shortfall vs. theirs: ${fmtInt(Number(ratio.toFixed(0)))}×.`;
    } else {
      grindInfo.classList.add('hidden');
      grindInfo.textContent = '';
    }
  }

  // Ticker
  let tickerRAF;
  function startTicker() {
    cancelAnimationFrame(tickerRAF);
    state.startEpoch = performance.now();
    const loop = (now) => {
      const seconds = (now - state.startEpoch) / 1000;
      billSinceLoadEl.textContent = state.fmt.c2.format(convertEUR(state.perSecondTheyEUR * seconds, state.currency));
      youSinceLoadEl.textContent = state.fmt.c2.format(convertEUR(state.perSecondYouEUR * seconds, state.currency));
      tickerRAF = requestAnimationFrame(loop);
    };
    tickerRAF = requestAnimationFrame(loop);
  }

  // Presets
  function showPreset(mins){
    const seconds = mins * 60;
    const they = convertEUR(state.perSecondTheyEUR * seconds, state.currency);
    const you  = convertEUR(state.perSecondYouEUR  * seconds, state.currency);
    presetOut.textContent = `${state.selected.name} in ${mins} min: ${state.fmt.c2.format(they)} • You: ${state.fmt.c2.format(you)}`;
  }
  document.querySelectorAll('.quick-actions button').forEach(btn => btn.addEventListener('click', () => showPreset(Number(btn.dataset.mins))));

  // Events
  selectEl.addEventListener('change', () => {
    const selected = BILLIONAIRES.find(b => b.id === selectEl.value);
    if (selected) { state.selected = selected; updateNames(selected); if (state.salary > 0 && state.hoursPerWeek > 0) { computeAll(); startTicker(); } }
  });
  currencyEl.addEventListener('change', () => {
    state.currency = currencyEl.value; state.fmt = makeFormatters(state.currency); recalcPrefixes();
    if (state.salary > 0 && state.hoursPerWeek > 0) { computeAll(); startTicker(); }
  });
  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    state.salary = Number(salaryEl.value);
    state.hoursPerWeek = Number(hoursEl.value);
    if (state.salary <= 0 || state.hoursPerWeek <= 0) return;
    resultsEl.classList.remove('hidden');
    placeholderEl.classList.add('hidden');
    computeAll(); startTicker();
  });

  hoursSlider.addEventListener('input', updateSimulator);
  lockHourlyEl.addEventListener('change', updateSimulator);
  grindBtn.addEventListener('click', (e) => { e.preventDefault(); state.grind = true; hoursSlider.value = 168; updateSimulator(); });
  grindTo168Btn.addEventListener('click', (e) => { e.preventDefault(); state.grind = true; hoursSlider.value = 168; updateSimulator(); window.scrollTo({ top: simulatorSection.offsetTop - 20, behavior: 'smooth' }); });

  companySelect.addEventListener('change', computeAll);
  roleSelect.addEventListener('change', () => { fairWageEl.value = ROLE_WAGE[roleSelect.value] || ''; computeAll(); });
  fairWageEl.addEventListener('input', computeAll);

  itemSelect.addEventListener('change', computeAll);
  itemPriceEl.addEventListener('input', computeAll);

  taxRateEl.addEventListener('input', computeAll);

  shareBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const url = location.href;
    const text = `${state.selected.name} hourly vs. mine: ${workMultiplierEl.textContent} multiplier; time to earn my salary: ${timeToYourSalaryEl.textContent}.`;
    if (navigator.share) {
      try { await navigator.share({ title: document.title, text, url }); } catch(e) {}
    } else {
      try { await navigator.clipboard.writeText(url); alert('Link copied.'); } catch(e){ alert(url); }
    }
  });
  resetLink.addEventListener('click', (e) => {
    e.preventDefault();
    try { localStorage.removeItem(LS_KEY); } catch(e){}
    history.replaceState(null, "", location.pathname);
    alert('State cleared. You can keep editing or refresh to start clean.');
  });

  function updateCoffeeMsg(){
    // Use OWNER constants, not visitor inputs
    const b = state.selected;
    const ownerHourly = OWNER.salaryEUR / (OWNER.hoursPerWeek * 52);
    const theirHourly = b.estAnnualIncomeEUR / (b.estHoursPerWeek * 52);
    const mult = theirHourly / ownerHourly;
    const multText = isFinite(mult) ? `${fmtInt(Number(mult.toFixed(0)))}×` : "—";
    coffeeMsg.textContent = `As a ${OWNER.role}, I'm apparently ${multText} times 'lazier' than ${b.name} — if this made you think, I'd love a coffee.`;
  }
  coffeeBtn.addEventListener('click', () => {
    alert('Thanks! Add your tip link in app.js (coffeeBtn handler).');
  });

  recalcPrefixes();
});