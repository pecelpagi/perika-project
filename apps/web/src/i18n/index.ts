import { formatCompact, formatDate, formatMoney, formatMonth, formatNumber } from "../data/format";
import type { Lang, Localized, Rupiah } from "../data/types";
import { createStore } from "../lib/create-store";
import { readItem, writeItem } from "../lib/storage";
import { en, type Dict } from "./en";
import { id } from "./id";

const KEY = "perika.lang";
const dictionaries: Record<Lang, Dict> = { en, id };
const isLang = (value: unknown): value is Lang => value === "en" || value === "id";

function firstLang(): Lang {
  const saved = readItem("local", KEY);
  if (isLang(saved)) return saved;
  return navigator.languages.map((l) => l.slice(0, 2).toLowerCase()).find(isLang) ?? "en";
}

const store = createStore({ lang: firstLang() });
document.documentElement.lang = store.get().lang;

export function setLang(lang: Lang) {
  writeItem("local", KEY, lang);
  document.documentElement.lang = lang;
  store.set({ lang });
}

export function useI18n() {
  const { lang } = store.use();
  return {
    lang,
    t: dictionaries[lang],
    money: (value: Rupiah) => formatMoney(value, lang),
    compact: (value: Rupiah) => formatCompact(value, lang),
    number: (value: number, digits?: number) => formatNumber(value, lang, digits),
    date: (iso: string) => formatDate(iso, lang),
    month: (iso: string) => formatMonth(iso, lang),
    pick: (text: string | Localized) => (typeof text === "string" ? text : text[lang]),
  };
}
