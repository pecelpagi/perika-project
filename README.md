# perika

Hello-world pnpm monorepo.

- `apps/api`: Hono API on port 3000 (`GET /api/hello`)
- `apps/web`: Vite, React, TanStack Router, Tailwind on port 5173
- `packages/shared`: types and constants for the API

## Run

```sh
pnpm install
pnpm dev
```

Open http://localhost:5173.

API docs (Scalar): http://localhost:3000/api/docs. OpenAPI spec: http://localhost:3000/api/openapi.json.

## Web app

Frontend only: all data is fake and in memory, and resets on reload. Plan: [docs/ui-plan.md](docs/ui-plan.md).

- Log in with any valid email and a password. No real account is created.
- UI: shadcn/ui components, dnd-kit for tab reordering, Motion for transitions.
- Desktop (768px and wider): in-app tabs, drag or Space and arrow keys to reorder. Mobile: bottom navigation.
- Light, dark and system themes; English and Indonesian.
- Try `kopi 25rb` or `beli emas 2 gram 5,2jt` on the Record page.

Add a shadcn component from `apps/web`:

```sh
pnpm dlx shadcn@latest add <name>
```

## Check

```sh
pnpm build
pnpm typecheck
```

Run `pnpm build` before `pnpm typecheck` after adding routes: the build generates `routeTree.gen.ts`.
