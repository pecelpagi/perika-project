// In-memory fake data. Resets on reload and logout.
// Fake delays live here because hidden pages lose their effects.
import { createStore } from "../lib/create-store";
import { coachReply } from "./coach";
import { todayIso } from "./format";
import * as seed from "./seed";
import type { Category, ChatMessage, Draft, GoldPrice, Txn } from "./types";

export type ToastKey = "saved" | "deleted" | "undone" | "budgetSaved" | "priceSaved";

type State = {
  categories: Category[];
  txns: Txn[];
  goldPrice: GoldPrice;
  chat: ChatMessage[];
  coachBusy: boolean;
  photo: { status: "idle" | "reading" } | { status: "ready"; draft: Draft };
  toast: { key: ToastKey; undoId?: string } | null;
};

const initial = (): State => ({
  categories: seed.categories,
  txns: seed.txns,
  goldPrice: seed.goldPrice,
  chat: [],
  coachBusy: false,
  photo: { status: "idle" },
  toast: null,
});

export const data = createStore<State>(initial());

let nextId = 1;
const timers = new Set<ReturnType<typeof setTimeout>>();
let toastTimer: ReturnType<typeof setTimeout> | undefined;

function later(ms: number, run: () => void) {
  const timer = setTimeout(() => {
    timers.delete(timer);
    run();
  }, ms);
  timers.add(timer);
  return timer;
}

export function resetData() {
  timers.forEach(clearTimeout);
  timers.clear();
  data.set(initial());
}

export function showToast(key: ToastKey, undoId?: string) {
  clearTimeout(toastTimer);
  data.set({ toast: { key, undoId } });
  toastTimer = later(5000, () => data.set({ toast: null }));
}

export const dismissToast = () => data.set({ toast: null });

export function addTxn({ confidence: _confidence, duplicateOf: _duplicateOf, ...txn }: Draft) {
  const id = `n${Date.now().toString(36)}-${nextId++}`;
  data.set({ txns: [{ ...txn, id }, ...data.get().txns] });
  showToast("saved", id);
  return id;
}

export function removeTxn(id: string, toast: ToastKey = "deleted") {
  data.set({ txns: data.get().txns.filter((t) => t.id !== id) });
  showToast(toast);
}

export const undoTxn = (id: string) => removeTxn(id, "undone");

export function setTxnCategory(id: string, categoryId: string) {
  data.set({ txns: data.get().txns.map((t) => (t.id === id ? { ...t, categoryId } : t)) });
}

export function setBudget(categoryId: string, budget: number) {
  data.set({ categories: data.get().categories.map((c) => (c.id === categoryId ? { ...c, budget } : c)) });
  showToast("budgetSaved");
}

export function setGoldPrice(goldPrice: GoldPrice) {
  data.set({ goldPrice });
  showToast("priceSaved");
}

export function readPhoto() {
  data.set({ photo: { status: "reading" } });
  later(900, () =>
    data.set({
      photo: {
        status: "ready",
        draft: {
          date: todayIso(),
          kind: "spending",
          amount: 48_000,
          note: "Struk kedai kopi",
          categoryId: "food",
          source: "photo",
          confidence: 0.7,
        },
      },
    }),
  );
}

export const clearPhoto = () => data.set({ photo: { status: "idle" } });

const message = (value: Omit<ChatMessage, "id">): ChatMessage => ({ ...value, id: `c${nextId++}` });

/** `text` is a plain string for typed input; sample questions pass both languages. */
export function sendChat(text: ChatMessage["text"]) {
  if (data.get().coachBusy) return;
  const question = typeof text === "string" ? text : text.en;
  data.set({ chat: [...data.get().chat, message({ role: "user", text })], coachBusy: true });
  later(700, () => {
    const { chat, categories, txns } = data.get();
    data.set({ chat: [...chat, message({ role: "coach", ...coachReply(question, categories, txns) })], coachBusy: false });
  });
}

export function resolveApproval(id: string, approval: "approved" | "rejected") {
  const target = data.get().chat.find((m) => m.id === id);
  if (target?.approval !== "pending") return;
  data.set({ chat: data.get().chat.map((m) => (m.id === id ? { ...m, approval } : m)) });
  if (approval === "approved" && target.action) setBudget(target.action.categoryId, target.action.budget);
}
