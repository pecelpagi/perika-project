// Small compositions of shadcn parts that several screens share.
import { cn } from "cn";
import { InboxIcon, type LucideIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { BrandSparkle } from "@/components/app/brand-sparkle";
import { IconCircle } from "@/components/app/icon-circle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function Page({ children, className = "max-w-5xl" }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto flex w-full flex-col gap-4 p-4 md:p-6 lg:p-8", className)}>{children}</div>;
}

export function SectionCard({
  title,
  icon: Icon,
  brand,
  children,
  className,
}: {
  title?: string;
  icon?: LucideIcon;
  /** Lime highlight card: at most one per screen. */
  brand?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card variant={brand ? "brand" : "default"} className={cn("min-w-0 p-5 md:p-6", className)}>
      {brand && <BrandSparkle />}
      {title && (
        <CardHeader className="relative">
          {Icon && (
            <IconCircle>
              <Icon aria-hidden />
            </IconCircle>
          )}
          <CardTitle>
            <h2 className="text-xl">{title}</h2>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="relative">{children}</CardContent>
    </Card>
  );
}

export function Meter({
  value,
  max,
  label,
  over,
  tone = "brand",
  onBrand,
}: {
  value: number;
  max: number;
  label: string;
  over?: boolean;
  tone?: ComponentProps<typeof Progress>["tone"];
  /** Inside a lime card the lime bar would vanish. */
  onBrand?: boolean;
}) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : value > 0 ? 100 : 0;
  return (
    <Progress
      aria-label={label}
      value={Math.round(percent)}
      tone={tone}
      className={cn(
        onBrand && "bg-brand-foreground/20 *:data-[slot=progress-indicator]:bg-brand-foreground",
        over && "*:data-[slot=progress-indicator]:bg-destructive",
      )}
    />
  );
}

export function Details({ rows }: { rows: [label: string, value: ReactNode][] }) {
  return (
    <Table>
      <TableBody>
        {rows.map(([label, value]) => (
          <TableRow key={label} className="hover:bg-transparent">
            <TableHead scope="row" className="h-auto py-3 pl-0 whitespace-normal lg:pl-0">
              {label}
            </TableHead>
            <TableCell className="num py-3 pr-0 text-right break-words whitespace-normal lg:pr-0">{value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <Card>
      <Empty className="py-10">
        <EmptyHeader className="gap-4">
          <IconCircle>
            <InboxIcon aria-hidden />
          </IconCircle>
          <EmptyDescription>{children}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </Card>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      size="sm"
      spacing={1}
      aria-label={label}
      value={value}
      // An empty value means the active item was pressed again: keep it.
      onValueChange={(next) => next && onChange(next as T)}
      className="max-w-full"
    >
      {options.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value} className="flex-auto">
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
