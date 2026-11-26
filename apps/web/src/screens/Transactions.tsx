import { useState } from "react";
import { newestFirst } from "../data/calc";
import { data } from "../data/store";
import type { Txn, TxnKind } from "../data/types";
import { useI18n } from "../i18n";
import { useIsDesktop } from "../lib/use-is-desktop";
import { useNav } from "../shell/nav";
import { transactionPath } from "../shell/pages";
import { Card, EmptyState, Input, ListRow, Page, Select } from "../ui";
import { Amount, useTxnLabel } from "./shared";

const KINDS: TxnKind[] = ["spending", "income", "gold"];

export function Transactions() {
  const { t, date, month: monthName } = useI18n();
  const { go } = useNav();
  const { txns } = data.use();
  const desktop = useIsDesktop();
  const label = useTxnLabel();
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("");
  const [month, setMonth] = useState("");

  const months = [...new Set(newestFirst(txns).map((x) => x.date.slice(0, 7)))];
  const shown = newestFirst(txns).filter(
    (x) =>
      x.note.toLowerCase().includes(search.trim().toLowerCase()) &&
      (!kind || x.kind === kind) &&
      (!month || x.date.startsWith(month)),
  );
  const days = shown.reduce((map, txn) => map.set(txn.date, [...(map.get(txn.date) ?? []), txn]), new Map<string, Txn[]>());

  return (
    <Page>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-[1fr_12rem_14rem]">
        <div className="col-span-2 md:col-span-1">
          <Input label={t.transactions.search} hideLabel placeholder={t.transactions.search} type="search" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select
          label={t.common.type}
          hideLabel
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          options={[{ value: "", label: `${t.common.type}: ${t.common.all}` }, ...KINDS.map((k) => ({ value: k, label: t.common.kind[k] }))]}
        />
        <Select
          label={t.transactions.month}
          hideLabel
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          options={[{ value: "", label: `${t.transactions.month}: ${t.common.all}` }, ...months.map((m) => ({ value: m, label: monthName(m) }))]}
        />
      </div>

      {shown.length === 0 ? (
        <EmptyState>{t.transactions.empty}</EmptyState>
      ) : desktop ? (
        <Card>
          <table className="w-full table-fixed text-left text-sm">
            <thead className="text-muted">
              <tr className="border-b border-border">
                <th className="w-32 py-2 font-medium">{t.common.date}</th>
                <th className="py-2 font-medium">{t.common.note}</th>
                <th className="w-36 py-2 font-medium">{t.common.category}</th>
                <th className="w-40 py-2 text-right font-medium">{t.common.amount}</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((txn) => (
                <tr key={txn.id} onClick={() => go(transactionPath(txn.id))} className="cursor-pointer border-b border-border last:border-0 hover:bg-text/5">
                  <td className="py-1">{date(txn.date)}</td>
                  <td className="py-1">
                    <button type="button" className="min-h-10 w-full truncate text-left">{txn.note}</button>
                  </td>
                  <td className="truncate py-1">{label(txn)}</td>
                  <td className="py-1 text-right"><Amount txn={txn} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        [...days].map(([day, list]) => (
          <section key={day}>
            <h2 className="mb-1 text-sm font-medium text-muted">{date(day)}</h2>
            <Card className="py-0">
              <ul>
                {list.map((txn) => (
                  <ListRow key={txn.id} title={txn.note} detail={label(txn)} end={<Amount txn={txn} />} onClick={() => go(transactionPath(txn.id))} />
                ))}
              </ul>
            </Card>
          </section>
        ))
      )}
    </Page>
  );
}
