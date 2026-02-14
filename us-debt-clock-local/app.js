const numberFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const moneyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const ratioFmt = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const baselineIso = "2026-02-14T00:00:00Z";
const baselineSec = Date.parse(baselineIso) / 1000;

const liveSeed = {
  debt: { base: 35800000000000, perSecond: 90200 },
  gdp: { base: 29900000000000, perSecond: 2500 },
  population: { base: 341000000, perSecond: 0.076 },
  federalRevenue: { base: 5300000000000, perSecond: 168000 },
  federalSpending: { base: 6900000000000, perSecond: 219000 },
  interestExpense: { base: 1220000000000, perSecond: 39000 },
  medicare: { base: 910000000000, perSecond: 28900 },
  medicaid: { base: 630000000000, perSecond: 20000 },
  socialSecurity: { base: 1460000000000, perSecond: 46300 },
  defense: { base: 962000000000, perSecond: 30500 },
};

const metrics = [
  { key: "population", category: "DEMOGRAPHICS", label: "U.S. Population", type: "number" },
  { key: "households", category: "DEMOGRAPHICS", label: "U.S. Households (Est.)", derived: (s) => s.population / 2.55, type: "number" },
  { key: "debtPerCitizen", category: "BURDEN", label: "Debt Per Citizen", derived: (s) => s.debt / s.population, type: "money" },
  { key: "debtPerTaxpayer", category: "BURDEN", label: "Debt Per Taxpayer", derived: (s) => s.debt / (s.population * 0.6), type: "money" },
  { key: "debtPerHousehold", category: "BURDEN", label: "Debt Per Household", derived: (s) => s.debt / (s.population / 2.55), type: "money" },
  { key: "federalRevenue", category: "BUDGET", label: "Federal Revenue", type: "money", flow: true },
  { key: "federalSpending", category: "BUDGET", label: "Federal Spending", type: "money", flow: true },
  { key: "annualDeficit", category: "BUDGET", label: "Annual Deficit", derived: (s) => s.federalSpending - s.federalRevenue, type: "money" },
  { key: "interestExpense", category: "DEBT SERVICE", label: "Net Interest Expense", type: "money", flow: true },
  { key: "interestShare", category: "DEBT SERVICE", label: "Interest / Spending", derived: (s) => (s.interestExpense / s.federalSpending) * 100, type: "percent" },
  { key: "socialSecurity", category: "PROGRAMS", label: "Social Security Outlays", type: "money", flow: true },
  { key: "medicare", category: "PROGRAMS", label: "Medicare Outlays", type: "money", flow: true },
  { key: "medicaid", category: "PROGRAMS", label: "Medicaid Outlays", type: "money", flow: true },
  { key: "defense", category: "PROGRAMS", label: "Defense Outlays", type: "money", flow: true },
  { key: "debtToRevenue", category: "RATIO", label: "Debt / Revenue", derived: (s) => s.debt / s.federalRevenue, type: "ratio" },
  { key: "debtToGdpPct", category: "RATIO", label: "Debt / GDP", derived: (s) => (s.debt / s.gdp) * 100, type: "percent" },
  { key: "spendingToGdp", category: "RATIO", label: "Spending / GDP", derived: (s) => (s.federalSpending / s.gdp) * 100, type: "percent" },
  { key: "revenueToGdp", category: "RATIO", label: "Revenue / GDP", derived: (s) => (s.federalRevenue / s.gdp) * 100, type: "percent" },
  { key: "debtDeltaDay", category: "TREND", label: "Debt Added Today (Est.)", derived: (s) => s.debtRateDay, type: "money" },
  { key: "debtDeltaYear", category: "TREND", label: "Debt Added Yearly Pace", derived: (s) => s.debtRateYear, type: "money" },
];

const board = document.querySelector("#board");
const template = document.querySelector("#metricTemplate");

const refs = new Map();
for (const metric of metrics) {
  const node = template.content.firstElementChild.cloneNode(true);
  node.querySelector(".category").textContent = metric.category;
  node.querySelector(".name").textContent = metric.label;
  node.dataset.key = metric.key;
  board.appendChild(node);
  refs.set(metric.key, {
    value: node.querySelector(".value"),
    sub: node.querySelector(".sub"),
  });
}

const debtMain = document.querySelector("#debtMain");
const gdpMain = document.querySelector("#gdpMain");
const debtToGdp = document.querySelector("#debtToGdp");
const debtPerSecond = document.querySelector("#debtPerSecond");
const gdpPerSecond = document.querySelector("#gdpPerSecond");
const nowTime = document.querySelector("#nowTime");
const lastUpdate = document.querySelector("#lastUpdate");

function valueAtNow(base, perSecond, nowSec) {
  return base + (nowSec - baselineSec) * perSecond;
}

function format(type, value) {
  if (type === "money") return moneyFmt.format(value);
  if (type === "number") return numberFmt.format(value);
  if (type === "percent") return `${ratioFmt.format(value)}%`;
  if (type === "ratio") return `${ratioFmt.format(value)}x`;
  return String(value);
}

function updateClock() {
  const now = new Date();
  const nowSec = now.getTime() / 1000;

  const state = {
    debt: valueAtNow(liveSeed.debt.base, liveSeed.debt.perSecond, nowSec),
    gdp: valueAtNow(liveSeed.gdp.base, liveSeed.gdp.perSecond, nowSec),
    population: valueAtNow(liveSeed.population.base, liveSeed.population.perSecond, nowSec),
    federalRevenue: valueAtNow(liveSeed.federalRevenue.base, liveSeed.federalRevenue.perSecond, nowSec),
    federalSpending: valueAtNow(liveSeed.federalSpending.base, liveSeed.federalSpending.perSecond, nowSec),
    interestExpense: valueAtNow(liveSeed.interestExpense.base, liveSeed.interestExpense.perSecond, nowSec),
    medicare: valueAtNow(liveSeed.medicare.base, liveSeed.medicare.perSecond, nowSec),
    medicaid: valueAtNow(liveSeed.medicaid.base, liveSeed.medicaid.perSecond, nowSec),
    socialSecurity: valueAtNow(liveSeed.socialSecurity.base, liveSeed.socialSecurity.perSecond, nowSec),
    defense: valueAtNow(liveSeed.defense.base, liveSeed.defense.perSecond, nowSec),
    debtRateDay: liveSeed.debt.perSecond * 86400,
    debtRateYear: liveSeed.debt.perSecond * 86400 * 365,
  };

  debtMain.textContent = moneyFmt.format(state.debt);
  gdpMain.textContent = moneyFmt.format(state.gdp);
  debtToGdp.textContent = `${ratioFmt.format((state.debt / state.gdp) * 100)}%`;
  debtPerSecond.textContent = `Debt speed: +${moneyFmt.format(liveSeed.debt.perSecond)} / sec`;
  gdpPerSecond.textContent = `GDP speed: +${moneyFmt.format(liveSeed.gdp.perSecond)} / sec`;

  for (const metric of metrics) {
    const value = metric.derived ? metric.derived(state) : state[metric.key];
    const ref = refs.get(metric.key);
    ref.value.textContent = format(metric.type, value);
    if (metric.flow && liveSeed[metric.key]) {
      ref.sub.textContent = `+${moneyFmt.format(liveSeed[metric.key].perSecond)} / sec`;
    } else {
      ref.sub.textContent = "Realtime estimate";
    }
  }

  nowTime.textContent = now.toLocaleString("en-US", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  lastUpdate.textContent = `Baseline: ${baselineIso} | Refresh: 100ms`;
}

updateClock();
setInterval(updateClock, 100);
