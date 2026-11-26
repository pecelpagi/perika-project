import { goldSummary, moneyLeft, newestFirst, spentIn } from "../data/calc";
import { todayIso } from "../data/format";
import { GOLD_TARGET, projections } from "../data/seed";
import { data } from "../data/store";
import { useI18n } from "../i18n";
import { useNav } from "../shell/nav";
import { PATHS, transactionPath } from "../shell/pages";
import { Button, Card, ListRow, Page, Progress } from "../ui";
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
      value: money(left),
      detail: t.home.spentOf(money(spent), money(budget)),
      progress: { value: spent, max: budget, over: left < 0 },
      path: PATHS.budget,
    },
    {
      title: t.home.gold,
      value: `${number(gold.grams)} g`,
      detail: t.home.goldTarget(number(goldShare, 0)),
      progress: { value: gold.value, max: GOLD_TARGET },
      path: PATHS.gold,
    },
    {
      title: t.home.freedom,
      value: compact(reach10y),
      detail: t.home.freedomShare(number(freedomShare, 0), compact(target)),
      progress: { value: reach10y, max: target },
      path: PATHS.freedom,
    },
  ];

  return (
    <Page>
      <Button onClick={() => go(PATHS.record)} className="self-stretch md:self-start">
        {t.home.record}
      </Button>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summary.map((card) => (
          <button key={card.path} type="button" onClick={() => go(card.path)} className="min-w-0 rounded-xl text-left">
            <Card title={card.title} className="h-full transition hover:border-accent">
              <p className="text-3xl font-semibold tabular-nums">{card.value}</p>
              <p className="mt-1 mb-3 text-sm text-muted">{card.detail}</p>
              <Progress label={card.title} {...card.progress} />
            </Card>
          </button>
        ))}
      </div>
      <Card title={t.home.recent}>
        <ul>
          {newestFirst(txns).slice(0, 5).map((txn) => (
            <ListRow
              key={txn.id}
              title={txn.note}
              detail={date(txn.date)}
              end={<Amount txn={txn} />}
              onClick={() => go(transactionPath(txn.id))}
            />
          ))}
        </ul>
        <Button variant="ghost" onClick={() => go(PATHS.transactions)}>
          {t.common.viewAll}
        </Button>
      </Card>
    </Page>
  );
}
