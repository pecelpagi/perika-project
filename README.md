# perika

Hello-world pnpm monorepo.

- `apps/api`: Hono API on port 3000 (`GET /api/hello`)
- `apps/web`: Vite, React, TanStack Router, Tailwind on port 5173
- `packages/shared`: types and constants used by both apps

## Run

```sh
pnpm install
pnpm dev
```

Open http://localhost:5173.

API docs (Scalar): http://localhost:3000/api/docs. OpenAPI spec: http://localhost:3000/api/openapi.json.

## Check

```sh
pnpm build
pnpm typecheck
```

Run `pnpm build` before `pnpm typecheck` after adding routes: the build generates `routeTree.gen.ts`.
