import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SelectField, TextField } from "@/components/fields";
import { ListRow, RowList } from "@/components/list";
import { EmptyState, Page, SectionCard } from "@/components/page";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { newestFirst } from "../data/calc";
import { data } from "../data/store";
import type { Txn, TxnKind } from "../data/types";
import { useI18n } from "../i18n";
import { useIsDesktop } from "../lib/use-is-desktop";
import { useNav } from "../shell/nav";
import { transactionPath } from "../shell/pages";
import { Amount, useTxnLabel } from "./shared";

const KINDS: TxnKind[] = ["spending", "income", "gold"];
const ALL = "all"; // Select items cannot have an empty value.
const MotionRow = motion.create(TableRow);

export function Transactions() {
  const { t, date, month: monthName } = useI18n();
  const { go } = useNav();
  const { txns } = data.use();
  const desktop = useIsDesktop();
  const label = useTxnLabel();
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState(ALL);
  const [month, setMonth] = useState(ALL);

  const months = [...new Set(newestFirst(txns).map((x) => x.date.slice(0, 7)))];
  const shown = newestFirst(txns).filter(
    (x) =>
      x.note.toLowerCase().includes(search.trim().toLowerCase()) &&
      (kind === ALL || x.kind === kind) &&
      (month === ALL || x.date.startsWith(month)),
  );
  const days = shown.reduce((map, txn) => map.set(txn.date, [...(map.get(txn.date) ?? []), txn]), new Map<string, Txn[]>());

  return (
    <Page>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-[1fr_12rem_14rem]">
        <div className="col-span-2 md:col-span-1">
          <TextField label={t.transactions.search} hideLabel placeholder={t.transactions.search} type="search" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <SelectField
          label={t.common.type}
          hideLabel
          value={kind}
          onChange={setKind}
          options={[{ value: ALL, label: `${t.common.type}: ${t.common.all}` }, ...KINDS.map((k) => ({ value: k, label: t.common.kind[k] }))]}
        />
        <SelectField
          label={t.transactions.month}
          hideLabel
          value={month}
          onChange={setMonth}
          options={[{ value: ALL, label: `${t.transactions.month}: ${t.common.all}` }, ...months.map((m) => ({ value: m, label: monthName(m) }))]}
        />
      </div>

      {shown.length === 0 ? (
        <EmptyState>{t.transactions.empty}</EmptyState>
      ) : desktop ? (
        <SectionCard>
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-32 pl-0 lg:pl-0">{t.common.date}</TableHead>
                <TableHead>{t.common.note}</TableHead>
                <TableHead className="w-36">{t.common.category}</TableHead>
                <TableHead className="w-40 pr-0 lg:pr-0 text-right">{t.common.amount}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence initial={false}>
                {shown.map((txn) => (
                  <MotionRow
                    key={txn.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => go(transactionPath(txn.id))}
                    className="cursor-pointer"
                  >
                    <TableCell className="pl-0 lg:pl-0">{date(txn.date)}</TableCell>
                    <TableCell>
                      <Button variant="link" size="lg" className="w-full justify-start px-0 text-foreground">
                        <span className="truncate">{txn.note}</span>
                      </Button>
                    </TableCell>
                    <TableCell className="truncate">{label(txn)}</TableCell>
                    <TableCell className="pr-0 lg:pr-0 text-right"><Amount txn={txn} /></TableCell>
                  </MotionRow>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </SectionCard>
      ) : (
        [...days].map(([day, list]) => (
          <motion.section key={day} layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="mb-2 px-5 text-sm text-muted-foreground">{date(day)}</h2>
            <SectionCard className="py-2 md:py-2">
              <RowList>
                {list.map((txn) => (
                  <ListRow key={txn.id} title={txn.note} detail={label(txn)} end={<Amount txn={txn} />} onClick={() => go(transactionPath(txn.id))} />
                ))}
              </RowList>
            </SectionCard>
          </motion.section>
        ))
      )}
    </Page>
  );
}
