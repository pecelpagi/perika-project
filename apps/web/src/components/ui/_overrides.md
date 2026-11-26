# shadcn overrides

How to use: run the `add` command, then replace the `variants` / `className` parts shown below. Keep shadcn logic (Radix, props, refs) as is.
Rule: every interactive control is a **pill** (`rounded-full`). Every container is `rounded-3xl` (card) or `rounded-2xl` (inner tile).

Install once:
```bash
npx shadcn@latest init
npm i @fontsource-variable/outfit   # font from the images
npx shadcn@latest add button badge card tabs toggle-group input textarea select checkbox switch dialog dropdown-menu table sonner avatar progress separator skeleton tooltip chart form sidebar
```
Extra libraries:
- `recharts` (comes with `chart`): segmented donut + future charts.
- `react-hook-form` + `zod` (come with `form`): form validation.

---

## button
```ts
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full text-base font-normal transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 [&_svg]:shrink-0 focus-visible:ring-[3px] focus-visible:ring-ring aria-invalid:ring-destructive/30",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",                  // "Transfer Balance"
        brand: "bg-brand text-brand-foreground hover:bg-brand-strong",                       // FAB ↗, approve ✓
        outline: "border border-primary bg-transparent text-primary hover:bg-primary/5",     // "Request Balance"
        secondary: "border border-border bg-card text-foreground hover:bg-muted",            // icon circles, "April", search/bell
        soft: "bg-secondary text-foreground hover:bg-input",                                 // eye toggle
        inverse: "bg-inverse text-inverse-foreground hover:bg-inverse/90",                   // mobile search
        ghost: "text-foreground hover:bg-muted",                                             // "•••"
        link: "h-auto p-0 text-primary underline-offset-4 hover:underline",                  // "View transactions ↗"
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",   // (derived)
      },
      size: {
        sm: "h-9 px-4 text-sm",
        default: "h-11 px-5",          // 44px
        lg: "h-12 px-6",
        icon: "size-11",               // 44px circle
        "icon-sm": "size-9",
        "icon-lg": "size-12",
        fab: "size-22 [&_svg:not([class*='size-'])]:size-8", // 88px lime ↗
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)
```

## badge
```ts
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-normal whitespace-nowrap [&>svg]:size-4",
  {
    variants: {
      variant: {
        default: "bg-brand text-brand-foreground",
        surface: "bg-card text-success",                       // "+40% this month" on lime card
        outline: "border border-border bg-card text-foreground", // "Rent spending is up 8.4%"
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        destructive: "bg-destructive/10 text-destructive",
        priority: "h-12 gap-3 bg-primary pl-6 pr-1.5 text-lg tracking-wider uppercase text-primary-foreground", // PRIORITY pill; put an icon circle (size-9 rounded-full bg-brand text-primary) at the end
        dot: "size-2.5 p-0 bg-destructive ring-2 ring-card",  // notification dot
      },
    },
    defaultVariants: { variant: "default" },
  }
)
```

## card
Change classes only:
```tsx
Card:        "flex flex-col gap-6 rounded-3xl bg-card p-6 text-card-foreground"  // NO border, NO shadow
CardHeader:  "flex flex-row items-center gap-4 p-0"
CardTitle:   "text-xl font-normal"
CardDescription: "text-sm text-muted-foreground"
CardAction:  "ml-auto"
CardContent: "p-0"
CardFooter:  "flex items-center gap-3 p-0"
```
New variant (add a `variant` prop with cva):
```ts
variant: {
  default: "bg-card",
  brand: "relative overflow-hidden bg-brand text-brand-foreground", // rewards card
  tile: "gap-2 rounded-2xl bg-brand-soft p-5 text-brand-foreground", // "Delibix Points" tile
  muted: "bg-muted",
}
```

## tabs (top nav, mobile chips, segmented currency)
```ts
// TabsList
const tabsListVariants = cva("inline-flex items-center", {
  variants: {
    variant: {
      nav: "gap-2 bg-transparent",                       // desktop: Overview / Wealth / Cards
      chips: "gap-2 overflow-x-auto bg-transparent",     // mobile: white pills
      segmented: "gap-1 rounded-full bg-secondary p-1",  // USD / IDR / MYR
    },
  },
  defaultVariants: { variant: "nav" },
})
// TabsTrigger
const tabsTriggerVariants = cva(
  "inline-flex items-center gap-2 rounded-full whitespace-nowrap transition-colors duration-200 disabled:opacity-50",
  {
    variants: {
      variant: {
        nav: "h-12 px-6 text-base text-muted-foreground hover:text-foreground data-[state=active]:bg-brand data-[state=active]:text-brand-foreground",
        chips: "h-12 px-5 bg-card text-foreground data-[state=active]:bg-brand data-[state=active]:text-brand-foreground",
        segmented: "h-10 px-5 text-base text-foreground data-[state=active]:bg-card data-[state=active]:shadow-xs",
      },
    },
    defaultVariants: { variant: "nav" },
  }
)
```
Pass the same `variant` to `TabsList` and each `TabsTrigger`.

## input / textarea / select trigger (derived — no forms in images, styled to match pills)
```ts
Input:         "h-11 w-full rounded-full border border-input bg-card px-5 text-base placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 aria-invalid:border-destructive"
Textarea:      "min-h-28 w-full rounded-2xl border border-input bg-card px-5 py-3 text-base placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
SelectTrigger: "h-11 rounded-full border border-input bg-card px-5 text-base data-[placeholder]:text-muted-foreground"
SelectContent: "rounded-2xl border border-border bg-popover p-1.5"
SelectItem:    "rounded-full px-4 py-2 text-base focus:bg-muted"
```

## checkbox / switch (derived)
```ts
Checkbox: "size-5 rounded-md border border-input data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
Switch root:  "h-7 w-12 rounded-full bg-input data-[state=checked]:bg-primary"
Switch thumb: "size-6 rounded-full bg-card data-[state=checked]:translate-x-5 data-[state=checked]:bg-brand"
```

## progress (Earning bars)
```ts
Progress root:      "relative h-2 w-full overflow-visible rounded-full bg-track"
Progress indicator: "h-full rounded-full bg-chart-3 transition-all duration-500 ease-smooth"
```
Add a `tone` prop: `neutral: "bg-chart-3"`, `brand: "bg-brand"`, `warning: "bg-warning"` (goal bar).
Value bubble ("51%"): absolutely positioned at `left: {value}%`, `-translate-x-1/2 -translate-y-1/2 top-1/2`, classes `rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground`. Light version: `bg-card border-2 border-brand text-foreground`.

## dialog
```ts
DialogOverlay: "bg-inverse/40 backdrop-blur-sm"
DialogContent: "rounded-3xl border-0 bg-card p-6 gap-6 sm:max-w-md"
DialogTitle:   "text-xl font-normal"
DialogFooter:  "gap-3"  // buttons: default + outline, both rounded-full
```

## dropdown-menu (for "•••")
```ts
DropdownMenuContent: "min-w-44 rounded-2xl border border-border bg-popover p-1.5"
DropdownMenuItem:    "rounded-full px-4 py-2 text-base focus:bg-muted [&_svg]:size-4"
DropdownMenuSeparator: "my-1 bg-border"
```

## table (derived from transaction list rows)
```ts
Table:      "w-full text-base"
TableHeader:"[&_tr]:border-0"
TableHead:  "h-10 px-4 text-left text-sm font-normal text-muted-foreground"
TableRow:   "border-b border-border last:border-0 hover:bg-muted/50"
TableCell:  "px-4 py-4 align-middle"
```
Wrap the table in `Card`. Amount cells: `text-right num`, colour by sign (see DESIGN.md).

## avatar
```ts
Avatar:         "size-12 rounded-full border border-border bg-card"
AvatarImage:    "rounded-full object-cover"
AvatarFallback: "rounded-full bg-muted text-sm"
```
Sizes: user photo in header `size-14` (desktop) / `size-8` (inline greeting); transaction logo `size-12`.

## sonner
```tsx
<Toaster position="top-center" toastOptions={{ classNames: {
  toast: "rounded-full border border-border bg-card px-5 py-3 text-base text-foreground shadow-float font-sans",
  description: "text-sm text-muted-foreground",
  actionButton: "rounded-full bg-primary text-primary-foreground",
  success: "[&_[data-icon]]:text-success",
  error: "[&_[data-icon]]:text-destructive",
}}} />
```

## skeleton
```ts
Skeleton: "animate-pulse rounded-full bg-muted"   // use rounded-3xl for card blocks
```

## sidebar (derived — the images use a top nav; use sidebar only for apps with 6+ sections)
```ts
Sidebar container: "bg-sidebar border-r-0 p-4"
SidebarMenuButton: "h-11 rounded-full px-4 text-base text-muted-foreground hover:bg-sidebar-accent data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
SidebarGroupLabel: "px-4 text-xs uppercase tracking-wider text-muted-foreground"
```

## chart (Recharts donut)
```ts
const chartConfig = {
  spent: { label: "Spent", color: "var(--chart-1)" },
  rest:  { label: "Remaining", color: "var(--chart-3)" },
} satisfies ChartConfig
// <PieChart><Pie dataKey="value" innerRadius="82%" outerRadius="100%" paddingAngle={4} cornerRadius={99} startAngle={225} endAngle={-135} stroke="none" /></PieChart>
```
Gray part is split into 3–4 segments with gaps (see images). Center label: amount `text-3xl` + delta `text-sm`.

---

# Custom components (build in `src/components/app/`)

| Component | Built from | Spec |
|---|---|---|
| `IconCircle` | `div` | `flex size-12 items-center justify-center rounded-full border border-border bg-card [&_svg]:size-5`. Card-header icon. |
| `MoneyAmount` | `span` + Button `soft icon` | Props `value, currency, size: "hero"\|"lg"\|"md", hidden`. hero `text-5xl`, lg `text-4xl`, md `text-lg`. Eye toggle shows `••••••` when hidden. Always `num`. |
| `Delta` | `span` | `+18%` → `text-success`, negative → `text-destructive`. Followed by `text-muted-foreground` text ("vs last month"). |
| `CopyField` | text + Button `ghost icon-sm` | label `text-sm text-muted-foreground`, value `text-xl num`, `Copy` icon; toast "Copied" on click. |
| `TransactionItem` | Avatar + text | Row `flex items-center gap-4 py-4 border-b border-border last:border-0`. Title `text-base`, meta `text-xs text-muted-foreground`, amount `ml-auto text-lg num` coloured by sign. |
| `PendingTransactionItem` | TransactionItem | Wrapper `rounded-2xl border border-warning-border p-3`; meta `text-warning`; actions: Button `brand icon` (`Check`) + Button `secondary icon` (`X`). |
| `ProgressRow` | Progress | Label left `text-base`, value right `text-base num`; inactive rows `text-muted-foreground`. |
| `LegendItem` | `span` | `inline-flex items-center gap-2 text-base`; inactive `text-subtle-foreground`. |
| `NotificationButton` | Button `secondary` | pill `h-11 px-4` with `Bell` + count; `Badge variant="dot"` at top-right of icon. |
| `BottomNav` | `nav` | Mobile only. `fixed bottom-6 inset-x-0 mx-auto w-fit flex gap-2 rounded-full bg-inverse p-2 shadow-float`. Items: `size-14 rounded-full bg-inverse-muted text-inverse-foreground`; active `bg-brand text-brand-foreground`. |
| `BrandSparkle` | SVG | 4-point star, `absolute -right-10 -top-10 size-72 text-brand-strong pointer-events-none`, `aria-hidden`. Only on `Card variant="brand"`. |
