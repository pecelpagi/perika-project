import { data, setTxnCategory } from "../data/store";
import type { Txn } from "../data/types";
import { useI18n } from "../i18n";
import { Select } from "../ui";

/** Money color always comes with a sign. */
export function Amount({ txn }: { txn: Txn }) {
  const { money } = useI18n();
  const income = txn.kind === "income";
  return <span className={`tabular-nums ${income ? "text-positive" : ""}`}>{income ? `+${money(txn.amount)}` : money(txn.amount)}</span>;
}

export function CategorySelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { t, pick } = useI18n();
  const { categories } = data.use();
  return (
    <Select
      label={t.common.category}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={categories.map((c) => ({ value: c.id, label: pick(c.name) }))}
    />
  );
}

export const TxnCategorySelect = ({ txn }: { txn: Txn }) => (
  <CategorySelect value={txn.categoryId ?? "other"} onChange={(id) => setTxnCategory(txn.id, id)} />
);

/** Category name for spending, else the record type. */
export function useTxnLabel() {
  const { t, pick } = useI18n();
  const { categories } = data.use();
  return (txn: Txn) => {
    const category = categories.find((c) => c.id === txn.categoryId);
    return category ? pick(category.name) : t.common.kind[txn.kind];
  };
}
