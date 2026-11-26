export type Lang = "en" | "id";
export type Rupiah = number; // whole rupiah
export type Localized = { en: string; id: string };
export type Category = { id: string; name: Localized; budget: Rupiah };
export type TxnKind = "spending" | "income" | "gold";

export type Txn = {
  id: string;
  date: string; // YYYY-MM-DD
  kind: TxnKind;
  amount: Rupiah;
  note: string;
  categoryId?: string;
  grams?: number;
  source: "text" | "photo";
};

export type Draft = Omit<Txn, "id"> & { confidence: number; duplicateOf?: string };
export type GoldPrice = { buybackPerGram: Rupiah; source: string; date: string };

export type Projection = {
  withInflation: boolean;
  target: Rupiah;
  reach10y: Rupiah;
  freedomDate: string;
  range: [string, string];
  series: { year: number; value: Rupiah }[];
  assumptions: Localized[];
};

export type ChatMessage = {
  id: string;
  role: "user" | "coach";
  text: string | Localized; // user text is a string
  sources?: { title: string; date: string; url?: string }[];
  approval?: "pending" | "approved" | "rejected";
  action?: { categoryId: string; budget: Rupiah }; // applied when approved
};
