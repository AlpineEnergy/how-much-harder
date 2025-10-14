// --- Simple, editable dataset in EUR (illustrative only) ---
const BILLIONAIRES = [
  { id: "bezos",  name: "Jeff Bezos",      netWorthEUR: 200_000_000_000, estAnnualIncomeEUR: 8_000_000_000,  estHoursPerWeek: 60 },
  { id: "musk",   name: "Elon Musk",       netWorthEUR: 220_000_000_000, estAnnualIncomeEUR: 10_000_000_000, estHoursPerWeek: 70 },
  { id: "arnault",name: "Bernard Arnault", netWorthEUR: 190_000_000_000, estAnnualIncomeEUR: 5_000_000_000,  estHoursPerWeek: 55 },
  { id: "oprah",  name: "Oprah Winfrey",   netWorthEUR: 2_500_000_000,   estAnnualIncomeEUR: 120_000_000,    estHoursPerWeek: 50 },
];

// --- FX rates (very rough; for satire only). 1 EUR equals: ---
const FX_RATES = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.86,
  AUD: 1.62,
  CAD: 1.47,
  JPY: 170.0,
  INR: 89.0,
};

// Locale to use per currency
const LOCALE_FOR = {
  EUR: "en-IE",
  USD: "en-US",
  GBP: "en-GB",
  AUD: "en-AU",
  CAD: "en-CA",
  JPY: "ja-JP",
  INR: "en-IN",
};

// Helpers
const fmtInt = (n) => new Intl.NumberFormat('en-IE').format(n);

function makeFormatters(currency){
  const locale = LOCALE_FOR[currency] || 'en-IE';
  return {
    c0: new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }),
    c2: new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }),
    symbol: new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).formatToParts(0).find(p=>p.type==='currency')?.value || ''
  };
}

function convertEUR(amountEUR, toCurrency){
  const rate = FX_RATES[toCurrency] || 1;
  return amountEUR * rate;
}

function secondsToHuman(sec) {
  if (sec < 1) return `${(sec*1000).toFixed(0)} ms`;
  if (sec < 60) return `${sec.toFixed(2)} s`;
  const m = Math.floor(sec/60);
  const s = sec % 60;
  if (m < 60) return `${m}m ${s.toFixed(0)}s`;
  const h = Math.floor(m/60);
  const mm = m % 60;
  if (h < 24) return `${h}h ${mm}m`;
  const d = Math.floor(h/24);
  const hh = h % 24;
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

  const billSinceLoadEl = document.getElementById('billSinceLoad');
  const youSinceLoadEl = document.getElementById('youSinceLoad');

  const hoursSlider = document.getElementById('hoursSlider');
  const hoursLabel = document.getElementById('hoursLabel');
  const simYouPerHourEl = document.getElementById('simYouPerHour');
  const simWorkMultiplierEl = document.getElementById('simWorkMultiplier');
  const yearsToNetWorthEl = document.getElementById('yearsToNetWorth');

  const grindBtn = document.getElementById('grindBtn');
  const grindMsg = document.getElementById('grindMsg');
  const salarySecondsEl = document.getElementById('salarySeconds');

  const nameTitle = document.getElementById('billionaireNameTitle');
  const nameA = document.getElementById('billionaireNameA');
  const nameB = document.getElementById('billionaireNameB');
  const nameC = document.getElementById('billionaireNameC');
  const nameD = document.getElementById('billionaireNameD');

  const yearEl = document.getElementById('year');
  const shareBtn = document.getElementById('shareBtn');
  const simulatorSection = document.getElementById('simulator');

  yearEl.textContent = new Date().getFullYear();

  // Populate billionaire select
  BILLIONAIRES.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b.id;
    opt.textContent = b.name;
    selectEl.appendChild(opt);
  });
  selectEl.value = "bezos";

  // State
  let state = {
    selected: BILLIONAIRES[0],
    salary: 0,              // user-entered, in chosen currency (converted internally to EUR)
    hoursPerWeek: 40,
    startEpoch: performance.now(),
    perSecondYouEUR: 0,     // stored in EUR
    perSecondTheyEUR: 0,    // stored in EUR
    currency: currencyEl.value,
    fmt: makeFormatters(currencyEl.value),
  };

  function updateNames(b) {
    nameTitle.textContent = b.name;
    nameA.textContent = b.name;
    nameB.textContent = b.name;
    nameC.textContent = b.name;
    nameD.textContent = b.name;
  }
  updateNames(state.selected);

  function recalcPrefix(){
    // Update the prefix symbol next to the salary input
    currencyPrefix.textContent = state.fmt.symbol || state.currency;
  }

  function computeAll() {
    const b = state.selected;

    // Convert user's salary to EUR internally
    // If user typed salary in selected currency, convert to EUR:
    const salaryEUR = Number(state.salary) / (FX_RATES[state.currency] || 1);

    // Hourly rates:
    const yourHourlyEUR = salaryEUR / (state.hoursPerWeek * 52);
    const theirHourlyEUR = b.estAnnualIncomeEUR / (b.estHoursPerWeek * 52);

    // Ticker base rates (EUR/sec)
    state.perSecondYouEUR = salaryEUR / (365*24*3600);
    state.perSecondTheyEUR = b.estAnnualIncomeEUR / (365*24*3600);

    // Display in chosen currency
    youPerHourEl.textContent = state.fmt.c2.format(convertEUR(yourHourlyEUR, state.currency));
    billPerHourEl.textContent = state.fmt.c2.format(convertEUR(theirHourlyEUR, state.currency));

    const workMultiplier = theirHourlyEUR / yourHourlyEUR;
    workMultiplierEl.textContent = isFinite(workMultiplier) ? `${new Intl.NumberFormat('en-IE').format(Number(workMultiplier.toFixed(0)))}×` : "—";

    const secsForYourSalary = salaryEUR / state.perSecondTheyEUR;
    timeToYourSalaryEl.textContent = isFinite(secsForYourSalary) ? secondsToHuman(secsForYourSalary) : "—";
    salarySecondsEl.textContent = isFinite(secsForYourSalary) ? secondsToHuman(secsForYourSalary) : "—";

    simulatorSection.classList.remove('hidden');
    hoursSlider.value = state.hoursPerWeek;
    hoursLabel.textContent = state.hoursPerWeek;
    updateSimulator();
  }

  function updateSimulator() {
    const b = state.selected;
    const newHours = Number(hoursSlider.value);
    hoursLabel.textContent = newHours;

    const salaryEUR = Number(state.salary) / (FX_RATES[state.currency] || 1);
    const yourNewHourlyEUR = salaryEUR / (newHours * 52);
    simYouPerHourEl.textContent = state.fmt.c2.format(convertEUR(yourNewHourlyEUR, state.currency));

    const theirHourlyEUR = b.estAnnualIncomeEUR / (b.estHoursPerWeek * 52);
    const newMultiplier = theirHourlyEUR / yourNewHourlyEUR;
    simWorkMultiplierEl.textContent = isFinite(newMultiplier) ? `${new Intl.NumberFormat('en-IE').format(Number(newMultiplier.toFixed(0)))}×` : "—";

    // Years to reach net worth (assumes saving 100% of salary; satire)
    const years = b.netWorthEUR / salaryEUR;
    yearsToNetWorthEl.textContent = isFinite(years) ? yearsToHuman(years) : "—";
  }

  let tickerRAF;
  function startTicker() {
    cancelAnimationFrame(tickerRAF);
    state.startEpoch = performance.now();
    const loop = (now) => {
      const seconds = (now - state.startEpoch) / 1000;
      // Convert at display time:
      billSinceLoadEl.textContent = state.fmt.c2.format(convertEUR(state.perSecondTheyEUR * seconds, state.currency));
      youSinceLoadEl.textContent = state.fmt.c2.format(convertEUR(state.perSecondYouEUR * seconds, state.currency));
      tickerRAF = requestAnimationFrame(loop);
    };
    tickerRAF = requestAnimationFrame(loop);
  }

  // Events
  selectEl.addEventListener('change', () => {
    const selected = BILLIONAIRES.find(b => b.id === selectEl.value);
    if (selected) {
      state.selected = selected;
      updateNames(selected);
      if (state.salary > 0 && state.hoursPerWeek > 0) {
        computeAll();
        startTicker();
      }
    }
  });

  currencyEl.addEventListener('change', () => {
    state.currency = currencyEl.value;
    state.fmt = makeFormatters(state.currency);
    recalcPrefix();
    if (state.salary > 0 && state.hoursPerWeek > 0) {
      computeAll();
      startTicker();
    } else {
      // update only the prefix
      startTicker && cancelAnimationFrame(tickerRAF);
    }
  });

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    state.salary = Number(salaryEl.value);
    state.hoursPerWeek = Number(hoursEl.value);
    if (state.salary <= 0 || state.hoursPerWeek <= 0) return;

    resultsEl.classList.remove('hidden');
    placeholderEl.classList.add('hidden');

    computeAll();
    startTicker();
  });

  hoursSlider.addEventListener('input', updateSimulator);
  grindBtn.addEventListener('click', () => { grindMsg.classList.remove('hidden'); });

  shareBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const text = `According to this site, ${state.selected.name} “works” ${workMultiplierEl.textContent} harder than me and earns my yearly salary in ${timeToYourSalaryEl.textContent}.`;
    const url = location.href;
    if (navigator.share) {
      try { await navigator.share({ title: document.title, text, url }); } catch(e) {}
    } else {
      try { await navigator.clipboard.writeText(url); } catch(e){}
      alert('Link copied! Share it with your friends.');
    }
  });

  // initial UI
  recalcPrefix();
});
