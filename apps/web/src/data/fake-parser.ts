import type { Draft, Rupiah, Txn } from "./types";

export type ParseResult = { draft: Draft } | { error: "amount" | "grams" };

const MULTIPLIERS: Record<string, number> = { rb: 1e3, ribu: 1e3, k: 1e3, jt: 1e6, juta: 1e6, m: 1e6 };

const CATEGORY_WORDS: Record<string, RegExp> = {
  food: /\b(kopi|coffee|makan|food|lunch|dinner|breakfast|sarapan|nasi|snack|jajan)\b/,
  transport: /\b(gojek|grab|ojek|taxi|taksi|bensin|fuel|parkir|parking|transport|tol|toll|kereta|train)\b/,
  housing: /\b(sewa|rent|kos|kost)\b/,
  bills: /\b(listrik|electricity|internet|pulsa|air|water|bill|tagihan)\b/,
  fun: /\b(film|movie|bioskop|cinema|game|netflix|konser|concert)\b/,
};

const GRAMS = /(\d+(?:[.,]\d+)?)\s*(?:grams?|gr|g)\b/i;
const WITH_UNIT = /(?:rp\.?\s*)?(\d+(?:[.,]\d+)*)\s*(rb|ribu|k|jt|juta|m)\b/i;
const PLAIN = /(?:rp\.?\s*)?(\d{1,3}(?:[.,]\d{3})+|\d{4,})\b/i;

const isGrouped = (text: string) => /^\d{1,3}(?:[.,]\d{3})+$/.test(text);

function findAmount(text: string): { amount: Rupiah; match: string } | null {
  const unit = WITH_UNIT.exec(text);
  if (unit) {
    const [match, digits = "", suffix = ""] = unit;
    const value = isGrouped(digits) ? Number(digits.replace(/[.,]/g, "")) : Number(digits.replace(",", "."));
    const amount = Math.round(value * (MULTIPLIERS[suffix.toLowerCase()] ?? 1));
    return amount > 0 ? { amount, match } : null;
  }
  const plain = PLAIN.exec(text);
  if (!plain) return null;
  const amount = Number((plain[1] ?? "").replace(/[.,]/g, ""));
  return amount > 0 ? { amount, match: plain[0] } : null;
}

/** Amount typed into a form field: "2500000", "2.500.000", "2,5jt" or "0". */
export function parseAmount(text: string): Rupiah | null {
  const value = text.trim();
  if (/^\d+$/.test(value)) return Number(value);
  const found = findAmount(value);
  return found && found.match.length === value.length ? found.amount : null;
}

export function parseInput(input: string, today: string, existing: Txn[]): ParseResult {
  const text = input.trim();
  const lower = text.toLowerCase();
  const isGold = /\b(emas|gold)\b/.test(lower);
  const gramsMatch = isGold ? GRAMS.exec(text) : null;
  const found = findAmount(gramsMatch ? text.replace(gramsMatch[0], " ") : text);
  if (!found) return { error: "amount" };

  const grams = gramsMatch ? Number((gramsMatch[1] ?? "").replace(",", ".")) : undefined;
  if (isGold && !grams) return { error: "grams" };

  const rest = text.replace(found.match, " ").replace(/\s+/g, " ").trim();
  const note = rest ? rest.charAt(0).toUpperCase() + rest.slice(1) : text;
  const isIncome = /\b(gaji|gajian|salary|income|bonus)\b/.test(lower);
  const kind = isGold ? "gold" : isIncome ? "income" : "spending";
  const category = kind === "spending" ? Object.entries(CATEGORY_WORDS).find(([, words]) => words.test(lower))?.[0] : undefined;
  const duplicate = existing.find(
    (t) => t.date === today && t.kind === kind && t.amount === found.amount && t.note.toLowerCase() === note.toLowerCase(),
  );

  return {
    draft: {
      date: today,
      kind,
      amount: found.amount,
      note,
      categoryId: kind === "spending" ? (category ?? "other") : undefined,
      grams,
      source: "text",
      confidence: kind === "spending" && !category ? 0.4 : 0.95,
      duplicateOf: duplicate?.id,
    },
  };
}

/** Gold always asks; so do unsure and double records. */
export const needsConfirm = (draft: Draft) =>
  draft.kind === "gold" || draft.confidence < 0.8 || draft.duplicateOf !== undefined;
