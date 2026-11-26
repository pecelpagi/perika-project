// Prewritten coach replies. Numbers come from the fake data, never from a model.
import { moneyLeft, spentIn } from "./calc";
import { formatMoney, todayIso } from "./format";
import type { Category, ChatMessage, Lang, Localized, Txn } from "./types";

export const sampleQuestions: Localized[] = [
  { en: "Can I buy a Rp 3 million phone?", id: "Bolehkah saya beli HP Rp 3 juta?" },
  { en: "How is my food budget?", id: "Bagaimana anggaran makan saya?" },
  { en: "Raise my food budget to Rp 2.8 million", id: "Naikkan anggaran makan saya jadi Rp 2,8 juta" },
  { en: "What will gold cost next year?", id: "Berapa harga emas tahun depan?" },
];

type Reply = Omit<ChatMessage, "id" | "role">;

const both = (write: (lang: Lang) => string): Localized => ({ en: write("en"), id: write("id") });

export function coachReply(question: string, categories: Category[], txns: Txn[]): Reply {
  const text = question.toLowerCase();
  const month = todayIso().slice(0, 7);
  const sources = [
    { title: "Aturan uang saya (sample)", date: todayIso() },
    { title: "OJK: Perencanaan Keuangan (sample)", date: "2025-03-01" },
  ];
  const food = categories.find((c) => c.id === "food");

  if (/\b(raise|increase|naikkan|tambah)\b/.test(text) && food) {
    const budget = 2_800_000;
    return {
      text: both((l) =>
        l === "en"
          ? `I can change the Food budget from ${formatMoney(food.budget, l)} to ${formatMoney(budget, l)}. I need your approval first.`
          : `Saya bisa mengubah anggaran Makanan dari ${formatMoney(food.budget, l)} menjadi ${formatMoney(budget, l)}. Saya perlu persetujuan Anda dulu.`,
      ),
      approval: "pending",
      action: { categoryId: "food", budget },
    };
  }
  if (/\b(buy|beli)\b/.test(text) && !/\b(gold|emas)\b/.test(text)) {
    const left = moneyLeft(categories, txns, month);
    return {
      text: both((l) =>
        l === "en"
          ? `You have ${formatMoney(left, l)} left in this month's budgets. A purchase above your Fun and Other budgets would delay your freedom target, so plan it first.`
          : `Sisa anggaran bulan ini ${formatMoney(left, l)}. Pembelian di atas anggaran Hiburan dan Lainnya akan menunda target kebebasan Anda, jadi rencanakan dulu.`,
      ),
      sources,
    };
  }
  if (/\b(food|makan|makanan)\b/.test(text) && food) {
    const spent = spentIn(txns, month, "food");
    return {
      text: both((l) =>
        l === "en"
          ? `Food: ${formatMoney(spent, l)} spent of ${formatMoney(food.budget, l)}. ${formatMoney(food.budget - spent, l)} left.`
          : `Makanan: terpakai ${formatMoney(spent, l)} dari ${formatMoney(food.budget, l)}. Sisa ${formatMoney(food.budget - spent, l)}.`,
      ),
      sources: sources.slice(0, 1),
    };
  }
  return {
    text: {
      en: "I don't know. I don't have enough proof to answer that, and I don't forecast prices.",
      id: "Saya tidak tahu. Bukti saya tidak cukup untuk menjawabnya, dan saya tidak meramal harga.",
    },
  };
}
