import { useState } from "react";
import { LEAK_COST, MONTHLY_GAP, projections } from "../data/seed";
import type { Projection } from "../data/types";
import { useI18n } from "../i18n";
import { Card, Details, Page, Segmented } from "../ui";

function Chart({ projection }: { projection: Projection }) {
  const { t, compact } = useI18n();
  const { series, target } = projection;
  const top = Math.max(target, ...series.map((p) => p.value)) * 1.05;
  const x = (year: number) => (year / (series.length - 1)) * 100;
  const y = (value: number) => 100 - (value / top) * 100;
  const line = series.map((p) => `${x(p.year)},${y(p.value)}`).join(" ");
  const end = series.at(-1);

  return (
    <figure>
      <svg
        role="img"
        aria-label={`${t.freedom.chart}: ${compact(end?.value ?? 0)} / ${compact(target)}`}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-56 w-full overflow-visible"
      >
        <polygon points={`0,100 ${line} 100,100`} className="fill-accent/15" />
        <polyline points={line} fill="none" vectorEffect="non-scaling-stroke" strokeWidth={2} className="stroke-accent" />
        <line x1={0} x2={100} y1={y(target)} y2={y(target)} vectorEffect="non-scaling-stroke" strokeDasharray="6 4" className="stroke-muted" />
        <line x1={0} x2={100} y1={100} y2={100} vectorEffect="non-scaling-stroke" className="stroke-border" />
      </svg>
      <div className="mt-1 flex justify-between text-xs text-muted">
        <span>{t.freedom.year(0)}</span>
        <span>{t.freedom.year(series.length - 1)}</span>
      </div>
      <figcaption className="mt-2 flex flex-wrap gap-x-4 text-xs text-muted">
        <span><span className="text-accent">━</span> {t.freedom.chart}: {compact(end?.value ?? 0)}</span>
        <span>┅ {t.freedom.target}: {compact(target)}</span>
      </figcaption>
    </figure>
  );
}

export function Freedom() {
  const { t, compact, month, number, pick } = useI18n();
  const [view, setView] = useState<keyof typeof projections>("today");
  const projection = projections[view];
  const { reach10y, target, freedomDate, range, assumptions } = projection;

  return (
    <Page>
      <div>
        <Segmented
          label={t.freedom.chart}
          value={view}
          onChange={setView}
          options={[
            { value: "today", label: t.freedom.today },
            { value: "inflated", label: t.freedom.inflated },
          ]}
        />
      </div>
      <Card title={t.freedom.date}>
        <p className="text-4xl font-semibold">{month(freedomDate)}</p>
        <p className="text-muted">{t.freedom.range(month(range[0]), month(range[1]))}</p>
      </Card>
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card title={t.freedom.chart}>
          <Chart projection={projection} />
          <Details
            rows={[
              [t.freedom.target, compact(target)],
              [t.freedom.reach, `${compact(reach10y)} (${number((reach10y / target) * 100, 0)}%)`],
            ]}
          />
        </Card>
        <Card title={t.freedom.assumptions}>
          <ul className="list-disc space-y-2 pl-5 text-sm">
            {assumptions.map((item) => (
              <li key={item.en}>{pick(item)}</li>
            ))}
          </ul>
        </Card>
      </div>
      <Card>
        <p>{t.freedom.gap(compact(MONTHLY_GAP))}</p>
        <p className="mt-2">{t.freedom.leak(compact(LEAK_COST))}</p>
      </Card>
      <p className="text-sm text-muted">{t.freedom.note}</p>
    </Page>
  );
}
