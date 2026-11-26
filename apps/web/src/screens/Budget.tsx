import { useState, type FormEvent } from "react";
import { spentIn } from "../data/calc";
import { parseAmount } from "../data/fake-parser";
import { todayIso } from "../data/format";
import { data, setBudget } from "../data/store";
import type { Category } from "../data/types";
import { useI18n } from "../i18n";
import { useIsDesktop } from "../lib/use-is-desktop";
import { useSheet } from "../shell/nav";
import { Button, Card, Input, Modal, Page, Progress } from "../ui";

/** Amount field that saves a valid value on submit, and on blur if `inline`. */
function BudgetForm({ category, inline, onSaved }: { category: Category; inline?: boolean; onSaved?: () => void }) {
  const { t, number, pick } = useI18n();
  const [draft, setDraft] = useState<string>(); // undefined: show the saved value
  const [invalid, setInvalid] = useState(false);

  function commit() {
    if (draft === undefined) return true;
    const amount = parseAmount(draft);
    setInvalid(amount === null);
    if (amount === null) return false;
    if (amount !== category.budget) setBudget(category.id, amount);
    setDraft(undefined);
    return true;
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (commit()) onSaved?.();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Input
        label={inline ? `${t.budget.budget}: ${pick(category.name)}` : t.budget.budget}
        hideLabel={inline}
        inputMode="decimal"
        className="tabular-nums"
        value={draft ?? number(category.budget, 0)}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={inline ? commit : undefined}
        error={invalid ? t.common.invalidAmount : undefined}
      />
      {!inline && <Button type="submit">{t.common.save}</Button>}
    </form>
  );
}

export function Budget() {
  const { t, money, pick } = useI18n();
  const { categories, txns } = data.use();
  const desktop = useIsDesktop();
  const sheet = useSheet("budget-edit");
  const [editing, setEditing] = useState<string>();
  const month = todayIso().slice(0, 7);
  const rows = categories.map((category) => {
    const spent = spentIn(txns, month, category.id);
    return { category, spent, left: category.budget - spent };
  });
  const totalBudget = categories.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = spentIn(txns, month);
  const selected = categories.find((c) => c.id === editing);

  const leftText = (left: number) => (
    <span className={`tabular-nums ${left < 0 ? "text-negative" : ""}`}>
      {left < 0 && `⚠ ${t.budget.over}: `}
      {money(left)}
    </span>
  );

  return (
    <Page>
      <Card title={t.budget.total}>
        <p className="mb-3 text-3xl font-semibold">{leftText(totalBudget - totalSpent)}</p>
        <Progress label={t.budget.total} value={totalSpent} max={totalBudget} over={totalSpent > totalBudget} />
      </Card>
      {desktop ? (
        <Card>
          <table className="w-full table-fixed text-left text-sm">
            <thead className="text-muted">
              <tr className="border-b border-border">
                <th className="py-2 font-medium">{t.common.category}</th>
                <th className="w-40 py-2 font-medium">{t.budget.budget}</th>
                <th className="py-2 text-right font-medium">{t.budget.spent}</th>
                <th className="py-2 text-right font-medium">{t.budget.left}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ category, spent, left }) => (
                <tr key={category.id} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4">
                    <p className="mb-2 truncate">{pick(category.name)}</p>
                    <Progress label={pick(category.name)} value={spent} max={category.budget} over={left < 0} />
                  </td>
                  <td className="py-3"><BudgetForm category={category} inline /></td>
                  <td className="py-3 text-right tabular-nums">{money(spent)}</td>
                  <td className="py-3 text-right">{leftText(left)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map(({ category, spent, left }) => (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => {
                  setEditing(category.id);
                  sheet.show();
                }}
                className="w-full rounded-xl border border-border bg-surface p-4 text-left"
              >
                <span className="mb-2 flex justify-between gap-3">
                  <span className="truncate font-medium">{pick(category.name)}</span>
                  <span className="shrink-0 tabular-nums">{money(category.budget)}</span>
                </span>
                <Progress label={pick(category.name)} value={spent} max={category.budget} over={left < 0} />
                <span className="mt-2 block text-sm text-muted">
                  {left < 0 ? leftText(left) : t.budget.leftOf(money(left))}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {sheet.open && selected && (
        <Modal title={t.budget.editTitle(pick(selected.name))} onClose={sheet.hide}>
          <BudgetForm key={selected.id} category={selected} onSaved={sheet.hide} />
        </Modal>
      )}
    </Page>
  );
}
