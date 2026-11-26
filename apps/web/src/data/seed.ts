import { toIsoDate } from "./format";
import type { Category, GoldPrice, Projection, Txn } from "./types";

const now = new Date();

// Records stay inside the current month, whatever day the app is opened.
const thisMonth = (daysAgo: number) =>
  toIsoDate(new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - daysAgo)));
const monthsAgo = (months: number, day: number) =>
  toIsoDate(new Date(now.getFullYear(), now.getMonth() - months, day));
const yearsAhead = (years: number) => toIsoDate(new Date(now.getFullYear() + years, now.getMonth(), 1));
const daysAgo = (days: number) => toIsoDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - days));

export const categories: Category[] = [
  { id: "food", name: { en: "Food", id: "Makanan" }, budget: 2_500_000 },
  { id: "transport", name: { en: "Transport", id: "Transportasi" }, budget: 1_000_000 },
  { id: "housing", name: { en: "Housing", id: "Tempat tinggal" }, budget: 2_300_000 },
  { id: "bills", name: { en: "Bills", id: "Tagihan" }, budget: 1_000_000 },
  { id: "fun", name: { en: "Fun", id: "Hiburan" }, budget: 700_000 },
  { id: "other", name: { en: "Other", id: "Lainnya" }, budget: 500_000 },
];

type Row = [date: string, note: string, amount: number, categoryId: string];

const spending: Row[] = [
  [thisMonth(0), "Kopi susu", 28_000, "food"],
  [thisMonth(0), "Gojek ke kantor", 32_000, "transport"],
  [thisMonth(1), "Makan siang", 55_000, "food"],
  [thisMonth(1), "Netflix", 186_000, "fun"],
  [thisMonth(2), "Belanja mingguan", 640_000, "food"],
  [thisMonth(3), "Bensin", 300_000, "transport"],
  [thisMonth(4), "Listrik", 450_000, "bills"],
  [thisMonth(5), "Internet", 300_000, "bills"],
  [thisMonth(6), "Makan malam keluarga", 520_000, "food"],
  [thisMonth(8), "Bioskop", 120_000, "fun"],
  [thisMonth(9), "Sabun dan sampo", 175_000, "other"],
  [thisMonth(30), "Sewa kos", 2_300_000, "housing"],
  [monthsAgo(1, 25), "Belanja bulanan", 1_850_000, "food"],
  [monthsAgo(1, 12), "Servis motor", 420_000, "transport"],
  [monthsAgo(1, 1), "Sewa kos", 2_300_000, "housing"],
];

const gold: [date: string, grams: number, amount: number][] = [
  [monthsAgo(14, 5), 20, 40_000_000],
  [monthsAgo(7, 10), 15, 34_500_000],
  [monthsAgo(2, 20), 5, 12_500_000],
];

export const txns: Txn[] = [
  ...spending.map(([date, note, amount, categoryId], i): Txn => ({
    id: `s${i}`, date, note, amount, categoryId, kind: "spending", source: "text",
  })),
  ...gold.map(([date, grams, amount], i): Txn => ({
    id: `g${i}`, date, grams, amount, note: `Emas ${grams} gram`, kind: "gold", source: "text",
  })),
  { id: "i0", date: thisMonth(30), note: "Gaji", amount: 20_000_000, kind: "income", source: "text" },
  { id: "i1", date: monthsAgo(1, 1), note: "Gaji", amount: 20_000_000, kind: "income", source: "text" },
];

export const goldPrice: GoldPrice = { buybackPerGram: 2_450_000, source: "Pegadaian (sample)", date: daysAgo(10) };
export const newGoldPrice = (): GoldPrice => ({ buybackPerGram: 2_480_000, source: "Pegadaian (sample)", date: daysAgo(0) });

export const GOLD_TARGET = 480_000_000;
export const MONTHLY_GAP = 4_300_000;
export const LEAK_COST = 154_000_000;

const INFLATION = 1.03; // invented, for the inflation view only

function projection(withInflation: boolean): Projection {
  const price = (value: number, year: number) => Math.round(withInflation ? value * INFLATION ** year : value);
  const shape = (year: number) => (1.035 ** year - 1) / (1.035 ** 10 - 1);
  const assumptions = [
    { en: "Income Rp 20 million and spending Rp 8 million a month", id: "Pemasukan Rp 20 juta dan pengeluaran Rp 8 juta per bulan" },
    { en: "Freedom target: 25 × yearly spending", id: "Target kebebasan: 25 × pengeluaran tahunan" },
    { en: "Growth above inflation: savings 5%, gold 0%", id: "Pertumbuhan di atas inflasi: tabungan 5%, emas 0%" },
  ];
  if (withInflation) {
    assumptions.push({ en: "Inflation: 3% a year (sample figure)", id: "Inflasi: 3% per tahun (angka contoh)" });
  }
  return {
    withInflation,
    target: price(2_400_000_000, 10),
    reach10y: price(1_730_000_000, 10),
    freedomDate: yearsAhead(14),
    range: [yearsAhead(12), yearsAhead(17)],
    series: Array.from({ length: 11 }, (_, year) => ({ year, value: price(1_730_000_000 * shape(year), year) })),
    assumptions,
  };
}

export const projections = { today: projection(false), inflated: projection(true) };
