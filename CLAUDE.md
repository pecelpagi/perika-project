# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run from the repository root. Use pnpm only: `devEngines` makes `npm` and `npx` fail inside the repo (use `pnpm dlx`).

```sh
pnpm install
pnpm dev            # API (port 3000) and web (port 5173)
pnpm dev:web        # web only
pnpm dev:api        # API only
pnpm build
pnpm typecheck
pnpm --filter @perika/web typecheck   # one package
```

- Run `pnpm build` before `pnpm typecheck` after adding a route: the web build generates `routeTree.gen.ts`.
- No linter or test runner is configured. Verify with build, typecheck and the browser, at widths above and below 768px, in both themes and both languages.
- Add a shadcn component from `apps/web`: `pnpm dlx shadcn@latest add <name>`.

## Packages

- `apps/web`: Vite, React 19, TanStack Router, Tailwind v4, shadcn/ui (Radix), dnd-kit, Motion.
- `apps/api`: Hono with `@hono/zod-openapi`, run through `tsx`. Only `GET /api/hello`; docs at `/api/docs`.
- `packages/shared`: types and constants used by the API, consumed as TypeScript source.

The web app is frontend only. All data is fake, in memory, and resets on reload; it makes no API calls, although Vite proxies `/api` to port 3000.

[docs/ui-plan.md](docs/ui-plan.md) specifies the web app's behaviour, edge cases and design decisions. Read it before changing behaviour, and update it with the change.

## Web architecture

### Routing and tabs

The router drives the URL, not rendering. Files in `src/routes/` declare paths only. `__root.tsx` handles the auth redirect and renders either `AuthScreen` or `AppShell`; there is no `<Outlet>`.

- `shell/pages.ts` matches the URL to a `PageId`. `shell/tabs-store.tsx` opens or focuses a tab for it. The active tab is always derived from the URL.
- `shell/tabs.ts` holds the pure tab list operations. Home is always first. Only tab paths are saved (`sessionStorage`).
- `shell/TabPanels.tsx` renders every open page inside React `<Activity>`.

Adding a page touches `routes/`, `PageId` and `PATHS` in `pages.ts`, `SCREENS` in `TabPanels.tsx`, `shell/icons.ts`, `pages` in both dictionaries, and the desktop or mobile menu.

### Rules that follow from keep-alive pages

- Screens take `path` and `params` as props. They must not read the router location, because hidden screens would see the active URL.
- Hidden pages keep state and DOM but lose their effects. Delays that must finish in the background live in `data/store.ts`.
- Keep `TabPanels` at the same tree position in both layouts, and render panels in fixed order. Moving or remounting a panel loses scroll and input.
- Portal content must not outlive its visible tab. Use `components/modal.tsx`, `SelectField`, or `useShown()`.

### History

Dialogs and drawers are opened with `useSheet(id)` (`shell/nav.ts`), which pushes a history entry so browser Back closes them. Do not hold their open state locally. `nav.ts` also holds the mobile push and replace rules.

### Responsive layout

One breakpoint, 768px, read with `useIsDesktop()`. `hooks/use-mobile.ts` belongs to the shadcn sidebar. `Modal` is a dialog on desktop and a drawer on mobile, so keep form state outside it to survive a resize.

### Data, language, theme

- `lib/create-store.ts` is the only store primitive, used by data, theme and language. `data/` holds seed data, calculations, the fake text parser and the coach replies.
- All UI text goes through `useI18n()`. `i18n/en.ts` defines the `Dict` type and `id.ts` must match it. Stores keep keys or `{ en, id }` values, never translated text. Format money and dates with the helpers from `useI18n()`.
- Dark mode is the `.dark` class on `<html>`. The theme script in `index.html`, `theme/theme.ts` (`BAR_COLOR`) and `--background` in `styles.css` must stay in sync.

## UI conventions

- Use a shadcn component when one exists. Shared compositions live in `src/components/`; `src/components/ui/` is generated code, edited only for tokens, 44px touch targets below 768px, or motion.
- shadcn `Button` sets no `type`: set `type="button"` for non-submit buttons inside forms.
- The `@/*` alias is declared twice, in `tsconfig.json` (`paths`, no `baseUrl` in TypeScript 7) and `vite.config.ts`.
- Motion handles app transitions. Do not add it on top of the built-in animations of shadcn components, drawer or toast. Recharts animation stays off.
- In `shell/desktop/TabBar.tsx`, React owns the order during a drag (`onDragOver` calls `preventDefault`), and `DragDropProvider` is keyed by language because dnd-kit reads its screen reader text once.

## Design system

Follow DESIGN.md and apps/web/src/components/ui/_overrides.md. Use only tokens from apps/web/src/globals.css

The app has not been migrated to this system yet. Nothing imports `globals.css`, so its new tokens (such as `bg-brand`) have no effect; the live tokens are still in `apps/web/src/styles.css`. `DESIGN.md` also expects the stylesheet at `src/styles/globals.css` and relies on packages that are not installed. Where these files conflict with `docs/ui-plan.md` or the conventions above, the design system wins for visual style; ask before changing behaviour.
