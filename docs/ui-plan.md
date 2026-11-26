# Perika frontend UI plan

Frontend only, fake data, no API calls. Stack: React 19, TanStack Router, Tailwind v4.

## 1. Layout

One breakpoint: `768px` (Tailwind `md`). At or above it: desktop. Below it: mobile. `useIsDesktop()` reads `matchMedia`.

Desktop (`[L|D|S]`: Light, Dark, System):

```
+----------+------------------------------------------------------+
| Perika   | [Home] [Budget ×] [Gold ×] [Txn: Kopi ×]  >>    [⋯] |
|----------+------------------------------------------------------|
| Home     |                                                      |
| Record   |   Active page (own scroll area)                      |
| Txns     |                                                      |
| Budget   |   +-------------+  +-------------+  +-------------+  |
| Gold     |   | Money left  |  | Gold        |  | Freedom     |  |
| Kompas   |   +-------------+  +-------------+  +-------------+  |
| Coach    |   [ table / chart / chat ]                           |
| [L|D|S]  |                                                      |
| [EN|ID]  |                                                      |
| Log out  |                                                      |
+----------+------------------------------------------------------+
```

Mobile (375px):

```
+-----------------------------+   +-----------------------------+   +-----------------------------+
| <  Budget                   |   |        (dimmed page)        |   | <  More                     |
|-----------------------------|   |-----------------------------|   |-----------------------------|
| Food         Rp 1.200.000 > |   | ---   Confirm record        |   | Transactions              > |
| Transport      Rp 450.000 > |   | Kopi            Rp 25.000   |   | Gold                      > |
| Bills        Rp 2.100.000 > |   | Category: Food (not sure)   |   | Kompas Merdeka            > |
|      (scrolls vertically)   |   | [ Change ]      [ Save ]    |   | Theme   [Light|Dark|System] |
|-----------------------------|   +-----------------------------+   | Language [EN|ID]    Log out |
| Home Budget (+) Coach More  |    bottom sheet                     | Home Budget (+) Coach More  |
+-----------------------------+                                     +-----------------------------+
```

## 2. Design system

Minimalist: generous whitespace, one accent, neutral surfaces, thin borders, little shadow.

| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` | `#FAFAF9` | `#0C0A09` | Page |
| `surface` | `#FFFFFF` | `#1C1917` | Cards, sidebar, sheets |
| `text` | `#1C1917` | `#F5F5F4` | Main text |
| `muted` | `#57534E` | `#A8A29E` | Secondary text |
| `border` | `#E7E5E4` | `#292524` | Decorative dividers and card edges |
| `control` | `#78716C` | `#78716C` | Input and control outlines |
| `accent` | `#4338CA` | `#A5B4FC` | Actions, active tab, focus, chart |
| `on-accent` | `#FFFFFF` | `#1E1B4B` | Text on accent |
| `positive` | `#15803D` | `#4ADE80` | Income, gain |
| `negative` | `#B91C1C` | `#F87171` | Overspent, loss |
| `warning` | `#92400E` | `#FBBF24` | Old price, not sure |

Text colors are at least 4.8:1 on `bg` and `surface`; `on-accent` on `accent` at least 7.9:1; `control` at least 3.6:1.
Money colors carry money meaning only, always with a sign, icon or label.

| Item | Rule |
|---|---|
| Type | System font; 12, 14, 16, 20, 28, 36px; weights 400, 500, 600; `tabular-nums` for money |
| Spacing | 4, 8, 12, 16, 24, 32, 48px; page padding 16px mobile, 32px desktop |
| Radius | Controls 8px, cards 12px, sheet top 16px |
| Shadow | None on cards; one soft shadow for sheet, dialog, menu and toast |
| Motion | 150ms hover and tabs, 200ms sheet and dialog; off with `prefers-reduced-motion` |
| Base components | Button, Input, Card, Money, Progress, Segmented, ListRow, Table, Sheet, Dialog, Toast, EmptyState; 2px accent focus ring |

- Theme: Light, Dark, System (default), saved in `localStorage` as `perika.theme`. Blocked storage or an invalid value means System.
- Tokens are CSS variables in `styles.css`, mapped with Tailwind `@theme inline`. `data-theme` on `<html>` selects the set and `color-scheme`.
- A small inline script in the `index.html` head sets `data-theme` and the `theme-color` meta (`bg` value) before first paint, so nothing flashes. Both update on change; System follows OS changes live.

## 3. Navigation

```ts
type PageId = "home" | "record" | "transactions" | "transaction"
  | "budget" | "gold" | "freedom" | "coach" | "more";
type Tab = { path: string; pageId: PageId; params: { id?: string }; scrollTop: number };
type TabsState = { tabs: Tab[] }; // the active tab is always derived from the URL
```

| Topic | Design |
|---|---|
| Router | One route file per path with no component. `__root.tsx` renders `AppShell`, which matches the URL to a page in `pages.ts` and opens or focuses its tab. |
| Rendering | `TabPanels` renders every open tab inside React `<Activity mode="visible\|hidden">`. No `<Outlet>` for pages. |
| Params | Screens get params as props. They do not read router params or location, because hidden screens would see the active URL. |
| Page state | `<Activity>` keeps component state and DOM. Each panel saves `scrollTop` and restores it when shown. |
| Effects | Hidden pages lose their effects. Fake delays (photo reading, coach reply) run in the data store. |
| Refresh | Tab list is saved in `sessionStorage`. The URL picks the active tab. Form input and filters reset. |
| Store | `useReducer` plus context. No library. |
| Resize | Only the chrome (sidebar, tab bar, header, bottom nav) swaps. `TabPanels` stays at the same tree position, so nothing remounts. |
| Desktop to mobile | Same tab list. Mobile hides the tab bar; visited pages become kept-alive views. |
| Mobile history | Home to a section: push. Section to section: replace. Detail page: push. Back therefore returns to Home. |
| Header back | Hidden on Home. Uses history back if possible, else goes to Home. |
| Bottom sheets | Opening pushes a history entry with the sheet id in history state, so browser back closes it. A refresh drops the sheet. |
| Auth gate | `/login` and `/signup` render outside `AppShell`: no tabs, sidebar or bottom nav. `__root.tsx` redirects signed-out visitors to `/login?redirect=<path>` and signed-in visitors on auth pages to Home. |
| Session | Fake: `{ email }` in `localStorage` (`perika.session`); passwords are never stored. Login replaces history, then opens the redirect path (in-app paths only) or Home. Logout clears session, saved tabs and fake data, keeps theme and language. |

Desktop tabs: Home has no close button. Right-click or the `⋯` button gives Close, Close others, Close all (Home stays). The tab bar scrolls horizontally and scrolls the active tab into view.

Drag and drop (desktop only), with native HTML drag and drop:

- Drag a tab to reorder it. A line shows the drop position. Dragging near either end scrolls the bar.
- Home stays first: it cannot be dragged, and nothing can be dropped before it.
- Dropping changes only the order of `tabs`, so the URL, active tab and page state stay. The order is saved with the tab list.
- Dropping outside the tab bar, or pressing Esc, cancels.
- `TabPanels` renders in a fixed order, keyed by path, so reordering does not move panel DOM or reset scroll.

| Edge case | Behaviour |
|---|---|
| Open an open page | Focus its tab. No duplicate. |
| Close the active tab | Replace the URL with the right neighbour, else the left one. |
| Close an inactive tab | URL does not change. |
| Browser back to a closed tab | The tab opens again with fresh state. |
| Deep link | Opens Home plus that page. |
| Unknown URL | Redirect to Home. |
| Unknown transaction id | "Record not found" inside the tab. |
| Broken or old saved tabs | Drop invalid entries; Home is always present. |
| Invalid saved session | Treated as signed out. |

## 4. Screens

All screens use design tokens and dictionary text. Layouts allow longer Indonesian labels.

| Screen, path | Purpose and main elements | Actions | PRD item | Desktop / mobile |
|---|---|---|---|---|
| Home `/` | Money left, recent records, gold and freedom summary cards | Open a section, start a record | Summary of MVP features | Card grid / stacked cards |
| Record `/record` | One input box, photo button, result card with money left | Save, confirm if unsure or double, change category, Undo | Text and photo records | Centered panel, Enter saves / input fixed above nav, camera capture, sheet to confirm |
| Transactions `/transactions` | Records with search, type and month filters | Filter, open detail | Records | Table / list grouped by day |
| Detail `/transactions/$id` | Amount, date, category, source, grams if gold | Change category, delete with confirm | Records | New tab / pushed full screen |
| Budget `/budget` | Categories with budget, spent, left, progress bar | Edit budget amount | Budgets | Table with inline edit / list, edit in sheet |
| Gold `/gold` | Grams, buyback value, gain or loss, 20% target progress, zakat estimate, price source, date, old-price warning | Add purchase (always confirm), confirm new price | Gold wallet, zakat reminder | Two columns / one column |
| Kompas Merdeka `/freedom` | Freedom date, range, target, 10-year SVG chart, assumptions, education note | Toggle with or without inflation | Freedom page with inflation | Chart beside assumptions / chart first |
| Coach `/coach` | Chat, sources under answers, "I don't know" reply, approval card, education note | Send, tap a sample question, approve or reject | Coach chat | Centered column / full-screen chat, input above keyboard |
| More `/more` | Links to Transactions, Gold, Kompas Merdeka; theme and language switches, log out | Open page, switch theme or language, log out | Navigation | Not in desktop menu (switches sit at sidebar bottom) / bottom nav item |
| Login `/login` | Email, password, link to sign up, theme and language switches | Log in | Separate users (risk) | Centered card / full screen |
| Sign up `/signup` | Email, password (8 characters or more), link to login, switches | Create account | Separate users (risk) | Centered card / full screen |

Auth is fake: any valid email and password is accepted and shows the same seed data. Real authentication comes with the backend.

Not UI work: `perika-mcp`, evals, Lens.

Mobile rules: touch targets at least 44px, `env(safe-area-inset-*)`, input text at least 16px (stops iOS zoom), no horizontal scroll.
Install: `manifest.webmanifest` (`display: standalone`, shortcut to `/record`), 192px and 512px icons, Apple touch icon, `theme-color`, `viewport-fit=cover`. No service worker.

## 5. Internationalization

| Topic | Design |
|---|---|
| Languages | English (`en`), Indonesian (`id`) |
| First visit | First supported entry in `navigator.languages`, else English |
| Saved | `localStorage` key `perika.lang`; blocked or invalid falls back to first-visit rule |
| Switching | Context provider above `AppShell`, no reload, no remount: tabs and page state stay |
| Files | `i18n/en.ts`, `i18n/id.ts`, `i18n/index.tsx` (`useI18n()`) |
| Dictionary | Nested by screen. `en` defines `type Dict = typeof en` (no `as const`); `id: Dict` fails the typecheck if a key is missing |
| Variables and plurals | Functions, for example `moneyLeft: (amount: string) => string` |
| Page language | `<html lang>` and document title follow the choice |
| Tab titles | Computed at render from page id and params, never saved |
| Formatting | `Intl` with `en-GB` or `id-ID`: `Rp 25,000` / `Rp 25.000`, `Rp 2.4 billion` / `Rp 2,4 miliar`, localized dates |
| Needs both languages | UI text, validation and toasts (store keys, not text), category names, projection assumptions, coach sample questions, replies, approval and education notes |
| Not translated | User input and transaction notes, source titles, "Kompas Merdeka", "Perika" |

## 6. Fake data

Files in `apps/web/src/data/`: `types.ts`, `seed.ts`, `store.ts`, `fake-parser.ts`, `format.ts`. Data stays in memory and resets on refresh.

```ts
type Rupiah = number; // whole rupiah
type Localized = { en: string; id: string };
type Category = { id: string; name: Localized; budget: Rupiah };
type Txn = { id: string; date: string; kind: "spending" | "income" | "gold"; amount: Rupiah;
  note: string; categoryId?: string; grams?: number; source: "text" | "photo" };
type Draft = Omit<Txn, "id"> & { confidence: number; duplicateOf?: string };
type GoldPrice = { buybackPerGram: Rupiah; source: string; date: string };
type Projection = { withInflation: boolean; target: Rupiah; reach10y: Rupiah; freedomDate: string;
  range: [string, string]; series: { year: number; value: Rupiah }[]; assumptions: Localized[] };
type ChatMessage = { id: string; role: "user" | "coach"; text: string | Localized; // user text is a string
  sources?: { title: string; date: string; url?: string }[]; approval?: "pending" | "approved" | "rejected" };
```

- Seed follows Raka: income Rp 20 million, spending Rp 8 million, target Rp 2.4 billion, gold target Rp 480 million, Rp 1.73 billion (72%) in 10 years, Rp 4.3 million monthly gap, Rp 1 million leak costing Rp 154 million.
- Growth above inflation: savings 5%, gold 0%. Projections are hardcoded; the freedom date and inflation view are invented.
- Dates, including `freedomDate`, are stored as ISO strings and formatted at render.
- `fake-parser.ts` accepts both languages in either UI language: `rb`/`ribu`/`k`, `jt`/`juta`/`m`, `gram`/`g`, `emas`/`gold`, comma or dot decimals, and category words. Unknown words give low confidence.
- Parser examples: `kopi 25rb`, `coffee 25k`, `beli emas 2 gram 5,2jt`, `buy gold 2 grams 5.2m`.

## 7. File structure (`apps/web/src/`)

| Path | Content | Used by |
|---|---|---|
| `routes/*.tsx` | Paths only | Both |
| `auth/` | Fake session, login and sign-up forms | Both |
| `shell/{AppShell,TabPanels,pages,tabs-store}` | Page registry, tabs, keep-alive | Both |
| `shell/desktop/{Sidebar,TabBar,TabMenu}` | Desktop chrome | Desktop |
| `shell/mobile/{AppHeader,BottomNav}` | Mobile chrome | Mobile |
| `screens/*.tsx` | One file per screen, with desktop and mobile variants inside | Both |
| `ui/` | Base components from section 2, `ResponsiveList`, `ThemeSwitch`, `LanguageSwitch`, icons; `Sheet` on mobile, `Dialog` on desktop | Both |
| `theme/` | Theme provider | Both |
| `i18n/` | See section 5 | Both |
| `data/` | See section 6 | Both |
| `styles.css`, `../index.html` | Tokens; theme script | Both |
| `../public/` | Manifest and icons | Both |

## 8. New dependencies

None. `<Activity>` ships with React; theming uses Tailwind v4 variables; translation uses typed dictionaries and `Intl`; chart and icons are inline SVG.

## 9. Build steps

Check each step at 1280px and 375px, with `pnpm build` and `pnpm typecheck` passing. From step 2 on, check every screen the step touches in light and dark, in English and Indonesian.

| # | Step | Check |
|---|---|---|
| 1 | Types, seed, store, formatters; replace the `/api/hello` call on Home | Build and typecheck pass; Home shows seeded money left; no `/api` requests |
| 2 | Tokens, theme, dictionaries, base components, both switches (shown on Home until steps 4 and 5 move them) | No flash on reload; System follows the OS; choices survive reload; removing an `id` key fails the typecheck |
| 3 | Routes, page registry, `AppShell`, `TabPanels` | Type in a page, switch and return: input and scroll remain |
| 4 | Desktop sidebar and tab bar, with drag to reorder and switches | No duplicates; all close actions work; 15 tabs scroll; drag reorders, Home stays first, page state stays; refresh restores tabs and order; tab titles change language |
| 5 | Mobile header, bottom nav, More with switches, history rules | Back returns Home; resize both ways keeps page and input; language switch keeps state; labels fit 375px |
| 6 | Login, sign up, auth gate, logout | Signed out: any URL goes to login, then back to it; validation shows in both languages; Back does not return to login; logout clears tabs |
| 7 | Record and fake parser, sheet, toast | All four parser examples work; unsure asks; Undo restores money left |
| 8 | Transactions, Detail, Budget | Table on desktop, list on mobile; edits show on Home; dates and money follow language |
| 9 | Gold and Kompas Merdeka | Old-price warning shows; inflation toggle changes figures; chart readable in both themes |
| 10 | Coach | Sources, "I don't know" and approval card each appear; earlier coach replies change language |
| 11 | Manifest, icons, safe areas | DevTools shows no manifest errors; opens standalone on a phone; status bar follows theme |
| 12 | Final pass; update `README.md` | Every screen in all theme and language pairs: no horizontal scroll, targets at least 44px, back closes sheets |

## 10. Decisions

No open questions.

| # | Topic | Decision |
|---|---|---|
| 1 | Bottom navigation | Home, Budget, Record (center), Coach, More |
| 2 | Settings screen (money rules, delete, export) | Not built; it is not in "MVP BUILDS" |
| 3 | UI language | English and Indonesian; keep "Kompas Merdeka" and "Coach" in both |
| 4 | Budget editing | Edit amounts only; no moving money between categories |
| 5 | Theme | Light, Dark, System (default) |
| 6 | Closing a tab with unsaved input | No warning |
| 7 | Current `/api/hello` call on Home | Removed in step 1; the API stays unchanged |
| 8 | Tab reordering | Drag and drop on desktop; Home fixed first; no new dependency |
| 9 | Visual style | Minimalist, indigo accent, tokens in section 2 |
| 10 | Theme and language controls | Desktop sidebar bottom; mobile "More"; no Settings screen |
| 11 | Login and sign up | Fake, outside the tab shell; logout in sidebar and "More" |
