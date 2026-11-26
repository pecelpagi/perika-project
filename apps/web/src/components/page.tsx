// Small compositions of shadcn parts that several screens share.
import { cn } from "cn";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function Page({ children, className = "max-w-5xl" }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto flex w-full flex-col gap-4 p-4 md:gap-6 md:p-8", className)}>{children}</div>;
}

export function SectionCard({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <Card className={cn("min-w-0 md:[--card-spacing:--spacing(6)]", className)}>
      {title && (
        <CardHeader className="-mb-2">
          <CardTitle>
            <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function Meter({ value, max, label, over }: { value: number; max: number; label: string; over?: boolean }) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : value > 0 ? 100 : 0;
  return (
    <Progress
      aria-label={label}
      value={Math.round(percent)}
      className={cn("h-2", over && "*:data-[slot=progress-indicator]:bg-destructive")}
    />
  );
}

export function Details({ rows }: { rows: [label: string, value: ReactNode][] }) {
  return (
    <Table>
      <TableBody>
        {rows.map(([label, value]) => (
          <TableRow key={label} className="hover:bg-transparent">
            <TableHead scope="row" className="h-auto py-3 pl-0 font-normal whitespace-normal text-muted-foreground">
              {label}
            </TableHead>
            <TableCell className="py-3 pr-0 text-right break-words whitespace-normal tabular-nums">{value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <Empty className="py-12">
      <EmptyHeader>
        <EmptyDescription>{children}</EmptyDescription>
      </EmptyHeader>
    </Empty>
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
      className="max-w-full border bg-background p-0.5"
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className="flex-auto text-muted-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
