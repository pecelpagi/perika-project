import { CalendarIcon, ChartAreaIcon, ListChecksIcon } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";
import { Details, Page, Segmented, SectionCard } from "@/components/page";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { LEAK_COST, MONTHLY_GAP, projections } from "../data/seed";
import type { Projection } from "../data/types";
import { useI18n } from "../i18n";

function PathChart({ projection }: { projection: Projection }) {
  const { t, compact } = useI18n();
  const { series, target } = projection;
  const top = Math.max(target, ...series.map((p) => p.value)) * 1.05;
  const end = series.at(-1);
  const config = { value: { label: t.freedom.chart, color: "var(--chart-2)" } } satisfies ChartConfig;

  return (
    <figure>
      <ChartContainer
        config={config}
        role="img"
        aria-label={`${t.freedom.chart}: ${compact(end?.value ?? 0)} / ${compact(target)}`}
        className="aspect-auto h-56 w-full"
      >
        {/* Recharts' own animation stays off: Motion handles transitions. */}
        <AreaChart accessibilityLayer={false} data={series} margin={{ top: 8, right: 24, bottom: 0, left: 24 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="year" tickLine={false} axisLine={false} ticks={[0, series.length - 1]} interval={0} tickFormatter={t.freedom.year} />
          <YAxis hide domain={[0, top]} />
          <Area dataKey="value" type="linear" stroke="var(--color-value)" strokeWidth={2} fill="var(--chart-1)" fillOpacity={0.4} isAnimationActive={false} />
          <ReferenceLine y={target} stroke="var(--muted-foreground)" strokeDasharray="6 4" />
        </AreaChart>
      </ChartContainer>
      <figcaption className="mt-2 mb-2 flex flex-wrap gap-x-4 text-xs text-muted-foreground">
        <span><span className="text-chart-2">━</span> {t.freedom.chart}: {compact(end?.value ?? 0)}</span>
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
      {/* Figures fade when the view changes. */}
      <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
        <SectionCard title={t.freedom.date} icon={CalendarIcon}>
          <p className="text-4xl">{month(freedomDate)}</p>
          <p className="text-muted-foreground">{t.freedom.range(month(range[0]), month(range[1]))}</p>
        </SectionCard>
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <SectionCard title={t.freedom.chart} icon={ChartAreaIcon}>
            <PathChart projection={projection} />
            <Details
              rows={[
                [t.freedom.target, compact(target)],
                [t.freedom.reach, `${compact(reach10y)} (${number((reach10y / target) * 100, 0)}%)`],
              ]}
            />
          </SectionCard>
          <SectionCard title={t.freedom.assumptions} icon={ListChecksIcon}>
            <ul className="list-disc space-y-2 pl-5">
              {assumptions.map((item) => (
                <li key={item.en}>{pick(item)}</li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </motion.div>
      <SectionCard>
        <p>{t.freedom.gap(compact(MONTHLY_GAP))}</p>
        <p className="mt-2">{t.freedom.leak(compact(LEAK_COST))}</p>
      </SectionCard>
      <p className="text-sm text-muted-foreground">{t.freedom.note}</p>
    </Page>
  );
}
