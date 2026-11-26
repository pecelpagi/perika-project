import { CoinsIcon, CompassIcon, PlusIcon, ReceiptTextIcon, WalletIcon } from "lucide-react";
import { ListRow, RowList } from "@/components/list";
import { Meter, Page, SectionCard } from "@/components/page";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import { goldSummary, moneyLeft, newestFirst, spentIn } from "../data/calc";
import { todayIso } from "../data/format";
import { GOLD_TARGET, projections } from "../data/seed";
import { data } from "../data/store";
import { useI18n } from "../i18n";
import { useNav } from "../shell/nav";
import { PATHS, transactionPath } from "../shell/pages";
import { Amount } from "./shared";

export function Home() {
  const { t, money, compact, number, date } = useI18n();
  const { go } = useNav();
  const { categories, txns, goldPrice } = data.use();
  const month = todayIso().slice(0, 7);
  const spent = spentIn(txns, month);
  const left = moneyLeft(categories, txns, month);
  const budget = left + spent;
  const gold = goldSummary(txns, goldPrice);
  const goldShare = (gold.value / GOLD_TARGET) * 100;
  const { reach10y, target } = projections.today;
  const freedomShare = (reach10y / target) * 100;

  const summary = [
    {
      title: t.home.moneyLeft,
      icon: WalletIcon,
      brand: true,
      value: money(left),
      detail: t.home.spentOf(money(spent), money(budget)),
      progress: { value: spent, max: budget, over: left < 0 },
      path: PATHS.budget,
    },
    {
      title: t.home.gold,
      icon: CoinsIcon,
      value: `${number(gold.grams)} g`,
      detail: t.home.goldTarget(number(goldShare, 0)),
      progress: { value: gold.value, max: GOLD_TARGET, tone: "warning" as const },
      path: PATHS.gold,
    },
    {
      title: t.home.freedom,
      icon: CompassIcon,
      value: compact(reach10y),
      detail: t.home.freedomShare(number(freedomShare, 0), compact(target)),
      progress: { value: reach10y, max: target, tone: "warning" as const },
      path: PATHS.freedom,
    },
  ];

  return (
    <Page>
      <Button size="lg" onClick={() => go(PATHS.record)} className="self-stretch md:self-start">
        <PlusIcon />
        {t.home.record}
      </Button>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summary.map((card) => (
          <Button
            key={card.path}
            variant="ghost"
            onClick={() => go(card.path)}
            className="h-auto w-full min-w-0 items-stretch rounded-3xl p-0 text-left whitespace-normal hover:bg-transparent"
          >
            <SectionCard
              title={card.title}
              icon={card.icon}
              brand={card.brand}
              className={cn("w-full transition-colors", card.brand ? "group-hover/button:bg-brand-strong" : "group-hover/button:bg-muted")}
            >
              <p className="num text-4xl break-words">{card.value}</p>
              <p className={cn("mt-1 mb-4", !card.brand && "text-muted-foreground")}>{card.detail}</p>
              <Meter label={card.title} onBrand={card.brand} {...card.progress} />
            </SectionCard>
          </Button>
        ))}
      </div>
      <SectionCard title={t.home.recent} icon={ReceiptTextIcon}>
        <RowList>
          {newestFirst(txns).slice(0, 5).map((txn) => (
            <ListRow
              key={txn.id}
              title={txn.note}
              detail={date(txn.date)}
              end={<Amount txn={txn} />}
              onClick={() => go(transactionPath(txn.id))}
            />
          ))}
        </RowList>
        <Button variant="link" size="lg" className="px-0" onClick={() => go(PATHS.transactions)}>
          {t.common.viewAll}
        </Button>
      </SectionCard>
    </Page>
  );
}
