import type { Lang, Rupiah } from "./types";

const locale = (lang: Lang) => (lang === "id" ? "id-ID" : "en-GB");

export const formatNumber = (value: number, lang: Lang, digits = 2) =>
  new Intl.NumberFormat(locale(lang), { maximumFractionDigits: digits }).format(value);

export const formatMoney = (value: Rupiah, lang: Lang) =>
  `${value < 0 ? "−" : ""}Rp ${formatNumber(Math.abs(value), lang, 0)}`;

export function formatCompact(value: Rupiah, lang: Lang) {
  const size = Math.abs(value);
  if (size < 1e6) return formatMoney(value, lang);
  const billion = size >= 1e9;
  const unit = billion ? (lang === "id" ? "miliar" : "billion") : lang === "id" ? "juta" : "million";
  const amount = formatNumber(size / (billion ? 1e9 : 1e6), lang);
  return `${value < 0 ? "−" : ""}Rp ${amount} ${unit}`;
}

export function toIsoDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export const todayIso = () => toIsoDate(new Date());

// Parse as local time; `new Date("YYYY-MM-DD")` would be UTC.
export function fromIsoDate(iso: string) {
  const [year = 0, month = 1, day = 1] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export const formatDate = (iso: string, lang: Lang) =>
  new Intl.DateTimeFormat(locale(lang), { day: "numeric", month: "short", year: "numeric" }).format(fromIsoDate(iso));

/** Accepts "2026-11" or a full date. */
export const formatMonth = (iso: string, lang: Lang) =>
  new Intl.DateTimeFormat(locale(lang), { month: "long", year: "numeric" }).format(fromIsoDate(iso));
