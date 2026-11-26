import { useState } from "react";
import { TextField } from "@/components/fields";
import { Modal, ModalHeader, useOpenKey } from "@/components/modal";
import { Meter, Page, SectionCard } from "@/components/page";
import { Button } from "@/components/ui/button";
import { Item, ItemFooter, ItemGroup, ItemHeader, ItemTitle } from "@/components/ui/item";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { spentIn } from "../data/calc";
import { parseAmount } from "../data/fake-parser";
import { todayIso } from "../data/format";
import { data, setBudget } from "../data/store";
import type { Category } from "../data/types";
import { useI18n } from "../i18n";
import { useIsDesktop } from "../lib/use-is-desktop";
import { useSheet } from "../shell/nav";

/** Amount field state. `commit` saves a valid value and says whether it was valid. */
function useBudgetDraft(category?: Category) {
  const { number } = useI18n();
  const [draft, setDraft] = useState<string>(); // undefined: show the saved value
  const [invalid, setInvalid] = useState(false);

  function commit() {
    if (draft === undefined || !category) return true;
    const amount = parseAmount(draft);
    setInvalid(amount === null);
    if (amount === null) return false;
    if (amount !== category.budget) setBudget(category.id, amount);
    setDraft(undefined);
    return true;
  }

  return { value: draft ?? (category ? number(category.budget, 0) : ""), setDraft, invalid, commit };
}

function BudgetInput({ label, field, inline }: { label: string; field: ReturnType<typeof useBudgetDraft>; inline?: boolean }) {
  const { t } = useI18n();
  return (
    <TextField
      label={label}
      hideLabel={inline}
      inputMode="decimal"
      className="tabular-nums"
      value={field.value}
      onChange={(e) => field.setDraft(e.target.value)}
      onBlur={inline ? field.commit : undefined}
      error={field.invalid ? t.common.invalidAmount : undefined}
    />
  );
}

/** Table cell form: saves on submit and on blur. */
function InlineBudgetForm({ category }: { category: Category }) {
  const { t, pick } = useI18n();
  const field = useBudgetDraft(category);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        field.commit();
      }}
    >
      <BudgetInput inline label={`${t.budget.budget}: ${pick(category.name)}`} field={field} />
    </form>
  );
}

// State lives outside the modal, so typed text survives the switch between drawer and dialog.
function BudgetModal({ category, open, onClose }: { category?: Category; open: boolean; onClose: () => void }) {
  const { t, pick } = useI18n();
  const field = useBudgetDraft(category);
  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader title={category ? t.budget.editTitle(pick(category.name)) : ""} />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (field.commit()) onClose();
        }}
        className="flex flex-col gap-4"
      >
        <BudgetInput label={t.budget.budget} field={field} />
        <Button type="submit" size="lg">
          {t.common.save}
        </Button>
      </form>
    </Modal>
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
  const editOpen = sheet.open && !!selected;
  const openKey = useOpenKey(editOpen);

  const leftText = (left: number) => (
    <span className={`tabular-nums ${left < 0 ? "text-destructive" : ""}`}>
      {left < 0 && `⚠ ${t.budget.over}: `}
      {money(left)}
    </span>
  );

  return (
    <Page>
      <SectionCard title={t.budget.total}>
        <p className="mb-3 text-3xl font-semibold">{leftText(totalBudget - totalSpent)}</p>
        <Meter label={t.budget.total} value={totalSpent} max={totalBudget} over={totalSpent > totalBudget} />
      </SectionCard>
      {desktop ? (
        <SectionCard>
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-0">{t.common.category}</TableHead>
                <TableHead className="w-44">{t.budget.budget}</TableHead>
                <TableHead className="text-right">{t.budget.spent}</TableHead>
                <TableHead className="pr-0 text-right">{t.budget.left}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ category, spent, left }) => (
                <TableRow key={category.id}>
                  <TableCell className="py-3 pr-4 pl-0">
                    <p className="mb-2 truncate">{pick(category.name)}</p>
                    <Meter label={pick(category.name)} value={spent} max={category.budget} over={left < 0} />
                  </TableCell>
                  <TableCell className="py-3">
                    <InlineBudgetForm category={category} />
                  </TableCell>
                  <TableCell className="py-3 text-right whitespace-normal tabular-nums">{money(spent)}</TableCell>
                  <TableCell className="py-3 pr-0 text-right whitespace-normal">{leftText(left)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>
      ) : (
        <ItemGroup className="gap-2">
          {rows.map(({ category, spent, left }) => (
            <div key={category.id} role="listitem">
              <Item asChild variant="outline" className="rounded-xl bg-card p-4 text-left">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(category.id);
                    sheet.show();
                  }}
                >
                  <ItemHeader>
                    <ItemTitle className="block min-w-0 truncate">{pick(category.name)}</ItemTitle>
                    <span className="shrink-0 tabular-nums">{money(category.budget)}</span>
                  </ItemHeader>
                  <Meter label={pick(category.name)} value={spent} max={category.budget} over={left < 0} />
                  <ItemFooter className="text-muted-foreground">
                    {left < 0 ? leftText(left) : t.budget.leftOf(money(left))}
                  </ItemFooter>
                </button>
              </Item>
            </div>
          ))}
        </ItemGroup>
      )}
      <BudgetModal key={openKey} category={selected} open={editOpen} onClose={sheet.hide} />
    </Page>
  );
}
