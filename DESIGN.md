# DESIGN.md — Lime Fintech design system

Stack: React + TypeScript · Tailwind v4 · shadcn/ui · lucide-react · sonner · recharts · react-hook-form + zod.
Files: `src/styles/globals.css` (tokens) · `src/components/ui/_overrides.md` (component variants) · this file (rules).

## 1. Style summary
- Light gray canvas (`bg-background`) with **white borderless cards** (`rounded-3xl`, no shadow). Depth comes from colour contrast, not shadows.
- **One loud accent:** lime (`brand`). Pair it with **dark green** (`primary`) for text and solid buttons. On lime surfaces the text is always dark green.
- **Everything interactive is a pill or a circle** (`rounded-full`). Icons sit inside 44–48px bordered circles.
- Geometric sans (Outfit), **regular weight (400)** even for big numbers. Hierarchy comes from size, not boldness.
- Numbers are the hero: very large, tabular figures, green for +, red for −, orange for "needs action".

## 2. Token map
| Job | Use |
|---|---|
| Page background | `bg-background` |
| Card / popover surface | `bg-card` / `bg-popover` |
| Highlight card (rewards, promo) | `Card variant="brand"` → `bg-brand text-brand-foreground` |
| Tile inside lime card | `Card variant="tile"` → `bg-brand-soft` |
| Primary solid action | `Button` default → `bg-primary text-primary-foreground` |
| Secondary action | `Button variant="outline"` |
| Positive / shortcut action (FAB, approve) | `Button variant="brand"` |
| Icon-only neutral button | `Button variant="secondary" size="icon"` |
| Active nav item | `bg-brand text-brand-foreground` |
| Inactive nav / labels | `text-muted-foreground` |
| Disabled / inactive legend | `text-subtle-foreground` |
| Body text | `text-foreground` |
| Positive money / % | `text-success` |
| Negative money / % | `text-destructive` |
| Pending / needs action | `text-warning`, `border-warning-border` |
| Progress track / donut track | `bg-track` / `--chart-3` |
| Hairlines, icon circles | `border-border` |
| Focus | `ring-ring` (lime) |
| Dark floating UI (bottom nav, mobile search) | `bg-inverse`, `bg-inverse-muted` |
| Charts | `--chart-1` lime · `--chart-2` dark green · `--chart-3` gray · `--chart-4` orange · `--chart-5` mid gray |

Type scale:
| Class | Size | Use |
|---|---|---|
| `text-5xl` | 48 | Hero balance, page greeting ("Good morning!") |
| `text-4xl` | 40 | Secondary amounts (rewards, earning) |
| `text-3xl` | 32 | Donut center value |
| `text-2xl` | 28 | Desktop greeting "Hello, Name" |
| `text-xl` | 22 | Card titles, account number |
| `text-lg` | 18 | List amounts, tile values |
| `text-base` | 16 | Body, buttons, nav, list titles |
| `text-sm` | 14 | Labels ("Active Balance"), badges |
| `text-xs` | 13 | Meta (dates, "vs last month") |

Weights: `font-normal` (400) everywhere. `font-medium` (500) only for very small text that must stand out. Never `font-bold`.

Radius: card `rounded-3xl` (32) · inner tile / pending row / dialog list `rounded-2xl` (24) · menus `rounded-2xl` · controls `rounded-full` · checkbox `rounded-md`.

Spacing (4px grid): card padding `p-6` (mobile `p-5`) · gap between cards `gap-4` · gap inside a card `gap-6` · header to content `gap-6` · list row `py-4` · icon-to-text `gap-4` · button group `gap-3`.

Icons: lucide-react, `strokeWidth={1.5}`, `size-5` default, `size-4` in badges, `size-8` in FAB. Common: `Eye`, `EyeOff`, `Copy`, `ArrowUpRight`, `Share`, `HandCoins`, `MoreHorizontal`, `Search`, `Bell`, `ShoppingBag`, `Wallet`, `ReceiptText`, `Target`, `Star`, `Ticket`, `Sparkle`, `Home`, `MessageCircle`, `ChartColumn`, `Settings`, `Check`, `X`.

## 3. Layout
Breakpoints: Tailwind defaults. Mobile-first. `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280.

**App shell (default, from images): top nav**
```
<div class="min-h-dvh bg-background">
  <header class="mx-auto flex max-w-app items-center gap-4 px-4 py-4 lg:px-10 lg:py-6">
    Avatar + greeting (left) · Tabs variant="nav" (center, hidden < lg) · search + NotificationButton (right)
  </header>
  <main class="mx-auto max-w-app px-4 pb-28 lg:px-10 lg:pb-10">…</main>
  <BottomNav class="lg:hidden" />
</div>
```
- Mobile header: logo + app name left, NotificationButton right; then greeting (`text-base text-muted-foreground` "Hello, Name" + `text-5xl` title); then `Button inverse icon` search + `Tabs variant="chips"` (horizontal scroll).
- `pb-28` on mobile so content clears the floating BottomNav.

**Dashboard grid**
```
<div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
  hero card      lg:col-span-7   | highlight card lg:col-span-5
  3 stat cards   lg:col-span-4 each
</div>
```
Mobile: one column, order = highlight card → balance → transactions → spending → earning.

**App shell with sidebar (derived)** — only for apps with 6+ sections: shadcn `SidebarProvider` + `Sidebar` (width 16rem) + `SidebarInset class="bg-background"`; same `max-w-app` main.

**Marketing page (derived)**: `max-w-content mx-auto px-4 lg:px-8`; sections `py-16 lg:py-24`; hero title `text-5xl`; feature cards = `Card`; one `Card variant="brand"` CTA block per page.

## 4. Patterns

**Card header (every widget)**
`IconCircle` + `CardTitle` on the left; right side = `Button secondary` pill (period, e.g. "April"), `Button secondary icon` (`MoreHorizontal`), or a goal value.

**Money display**
Label (`text-sm text-muted-foreground`) → amount (`MoneyAmount`) → `Delta`. Always show an eye toggle on balances. Format with `Intl.NumberFormat(locale, { style: "currency", currency })`.

**Forms** (react-hook-form + zod + shadcn `Form`)
```tsx
const schema = z.object({ amount: z.coerce.number().positive(), note: z.string().max(140).optional() })
const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })
<Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
  <FormField name="amount" control={form.control} render={({ field }) => (
    <FormItem className="gap-2">
      <FormLabel className="text-sm text-muted-foreground">Amount</FormLabel>
      <FormControl><Input inputMode="decimal" {...field} /></FormControl>
      <FormMessage className="text-xs text-destructive" />
    </FormItem>)} />
  <Button type="submit" size="lg">Transfer</Button>
</form></Form>
```
One column. Labels above inputs. Primary submit button full width on mobile (`w-full sm:w-auto`). (derived)

**Lists / data tables**
- ≤ 10 rows in a widget: `TransactionItem` list inside `Card`, last row faded with `.fade-bottom` if clipped, "View all" as `Button variant="link"`.
- Full page: shadcn `Table` inside `Card`, filter row of `Tabs variant="segmented"` + `Input` search. Pending items always first, using `PendingTransactionItem`.

**Dashboards**: hero balance card + one `brand` card + 3 equal stat cards. Max one `brand` card per screen.

**Empty state (derived)**: inside the card: `IconCircle` (centered) → `text-base` title → `text-sm text-muted-foreground` hint → `Button variant="outline" size="sm"`. Padding `py-10`, centered.

**Loading**: same layout with `Skeleton`. Amount → `h-12 w-48`; list row → `size-12` circle + two `h-4` lines; card → `h-64 rounded-3xl`. Never show a spinner for whole cards.

**Feedback**: `toast.success("Transfer sent")` / `toast.error(...)`. Destructive confirm → `Dialog`.

## 5. Composition examples

**A. Balance card**
```tsx
<Card className="lg:col-span-7">
  <CardHeader className="justify-between">
    <Tabs defaultValue="USD"><TabsList variant="segmented">
      {["USD","IDR","MYR"].map(c => <TabsTrigger key={c} value={c} variant="segmented">{c}</TabsTrigger>)}
    </TabsList></Tabs>
    <CopyField label="Account Number" value="9034 0222 748" />
  </CardHeader>
  <CardContent className="flex flex-col gap-2">
    <span className="text-sm text-muted-foreground">Active Balance</span>
    <MoneyAmount value={92142.1} currency="USD" size="hero" />
  </CardContent>
  <CardFooter>
    <Button><Share />Transfer</Button>
    <Button variant="outline"><HandCoins />Request</Button>
    <Button variant="ghost" size="icon" aria-label="More"><MoreHorizontal /></Button>
    <Button variant="brand" size="fab" className="ml-auto hidden md:inline-flex" aria-label="Open"><ArrowUpRight /></Button>
  </CardFooter>
</Card>
```

**B. Rewards (brand) card**
```tsx
<Card variant="brand" className="lg:col-span-5">
  <BrandSparkle />
  <CardHeader className="relative justify-between">
    <Badge variant="priority">Priority<span className="flex size-9 items-center justify-center rounded-full bg-brand text-primary"><Sparkle className="size-5 fill-current" /></span></Badge>
    <Button variant="ghost" size="icon" className="border border-brand-strong" aria-label="More"><MoreHorizontal /></Button>
  </CardHeader>
  <CardContent className="relative flex flex-col gap-2">
    <span className="text-base">Your Rewards</span>
    <div className="flex flex-wrap items-center gap-3">
      <MoneyAmount value={12172.07} currency="USD" size="lg" />
      <Badge variant="surface">+40% this month</Badge>
    </div>
  </CardContent>
  <div className="relative grid grid-cols-2 gap-3">
    <Card variant="tile"><span className="text-sm">Delibix Points</span><span className="flex items-center gap-2 text-lg num"><Star />4,780</span></Card>
    <Card variant="tile"><span className="text-sm">Voucher</span><span className="flex items-center gap-2 text-lg num"><Ticket />124</span></Card>
  </div>
</Card>
```

**C. Transactions card**
```tsx
<Card className="lg:col-span-4">
  <CardHeader>
    <IconCircle><ReceiptText /></IconCircle>
    <CardTitle>Transactions</CardTitle>
    <CardAction><Button variant="secondary" size="icon" aria-label="More"><MoreHorizontal /></Button></CardAction>
  </CardHeader>
  <CardContent className="flex flex-col">
    <PendingTransactionItem title="Asivest Subscriptions $300" meta="Payment confirmation" onApprove={approve} onReject={reject} />
    {items.map(t => <TransactionItem key={t.id} logo={t.logo} title={t.title} meta={t.date} amount={t.amount} />)}
  </CardContent>
</Card>
```

## 6. Accessibility
- Contrast: body text ≥ 4.5:1, large numbers ≥ 3:1. `text-subtle-foreground` is **decorative only** (inactive legend); never use it for the only copy of important info.
- Lime (`brand`) is a **background**, never a text colour on white. On lime, text = `text-brand-foreground`.
- Money colour is never the only signal: always keep the `+` / `−` sign.
- Focus: every control shows `ring-[3px] ring-ring` on `:focus-visible`. Do not remove outlines.
- Touch targets ≥ 44px (`h-11` / `size-11`). Bottom-nav items `size-14`.
- Icon-only buttons need `aria-label`. Decorative SVG (`BrandSparkle`) gets `aria-hidden`.
- Hidden balance: keep the real value out of the DOM when hidden; the eye button uses `aria-pressed`.
- Respect `motion-reduce:` — disable progress/donut animations.

## 7. Agent rules

**Do**
- Use only theme tokens (`bg-brand`, `text-muted-foreground`, `rounded-3xl`).
- Use `cn()` to merge classes; extend through cva variants from `_overrides.md`.
- Use shadcn components first, then the custom components in `_overrides.md`, and only then write new ones.
- Make every button, input, tab, badge and avatar `rounded-full`.
- Use `num` (tabular figures) on every amount, count and percent.
- Put `IconCircle` + title in every card header.
- Format money with `Intl.NumberFormat`.

**Don't**
- No raw hex/oklch or arbitrary colour values (`bg-[#B4EC72]`). The only allowed arbitrary class is the shadcn focus `ring-[3px]`.
- No borders or shadows on cards. No `shadow-*` except `shadow-xs` (segmented active) and `shadow-float` (floating nav, toasts).
- No `font-bold` / `font-semibold`.
- Max one `Card variant="brand"` per screen. Lime is never used for text on white.
- No square corners on controls. No `rounded-lg` on cards.
- Don't introduce new colours: success = green, destructive = red, warning = orange, that's all.
- Don't add new libraries without a one-line reason in the PR.
