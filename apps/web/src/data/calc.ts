import { fromIsoDate } from "./format";
import type { Category, GoldPrice, Txn } from "./types";

export const NISAB_GRAMS = 85;
const OLD_PRICE_DAYS = 7;

export const spentIn = (txns: Txn[], month: string, categoryId?: string) =>
  txns
    .filter((t) => t.kind === "spending" && t.date.startsWith(month))
    .filter((t) => categoryId === undefined || t.categoryId === categoryId)
    .reduce((sum, t) => sum + t.amount, 0);

export const moneyLeft = (categories: Category[], txns: Txn[], month: string) =>
  categories.reduce((sum, c) => sum + c.budget, 0) - spentIn(txns, month);

// Gold counts at buyback price. Buying gold is not spending.
export function goldSummary(txns: Txn[], price: GoldPrice) {
  const purchases = txns.filter((t) => t.kind === "gold");
  const grams = purchases.reduce((sum, t) => sum + (t.grams ?? 0), 0);
  const cost = purchases.reduce((sum, t) => sum + t.amount, 0);
  const value = Math.round(grams * price.buybackPerGram);
  const zakat = grams >= NISAB_GRAMS ? Math.round(value * 0.025) : 0;
  return { grams, cost, value, gain: value - cost, zakat, belowNisab: Math.max(0, NISAB_GRAMS - grams) };
}

export const isOldPrice = (price: GoldPrice, today: string) =>
  (fromIsoDate(today).getTime() - fromIsoDate(price.date).getTime()) / 86_400_000 > OLD_PRICE_DAYS;

export const newestFirst = (txns: Txn[]) => [...txns].sort((a, b) => b.date.localeCompare(a.date));
