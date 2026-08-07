# Frontend Implementation Plan (Phase 3)

Build the Next.js (App Router) frontend that talks ONLY to the NestJS backend, per `skills/nextjs-frontend/SKILL.md`. This plan was produced by the frontend-engineer agent during a read-only review (the session was in plan mode, so no files were written). It incorporates fixes for four defects found in the original brief, verified against actual backend source.

## Verified backend API contract (source of truth)
- Base URL from `NEXT_PUBLIC_API_URL` (browser-reachable origin). Routes under global `/api` prefix.
- `GET /api/accounts?limit=<n>` → `200` `***REMOVED*** data: Account[], meta: ***REMOVED*** total, limit, offset ***REMOVED*** ***REMOVED***`. `data: []` when empty.
- `POST /api/accounts` body `***REMOVED*** name, phone?, website?, industry? ***REMOVED***` → `201` `***REMOVED*** data: Account ***REMOVED***`.
- Validation failure → `400` `***REMOVED*** statusCode, message: "Bad request", errors: string[] ***REMOVED***` (e.g. `"Account name is required"`, `"Website must be a valid URL"`).
- `GET /api/health` → `200` `***REMOVED*** status: "ok" ***REMOVED***`.
- Generic error shape: `***REMOVED*** statusCode, message, errors? ***REMOVED***`.
- CORS: allowed origin `CORS_ORIGIN` (default `http://localhost:3001`), `credentials: true`; frontend runs on port 3001.
- `Account = ***REMOVED*** id: string; name: string; phone?: string; website?: string; industry?: string ***REMOVED***`.

## Defects found & fixes (decisive defaults)
1. **`NEXT_PUBLIC_API_URL=http://backend:3000` is broken** — `NEXT_PUBLIC_*` is inlined at build time (compose `environment:` has no effect), and `backend` is a Docker-internal hostname the browser cannot resolve. **Fix:** value must be browser-reachable `http://localhost:3000` and passed as a **Docker build ARG** (not runtime env). Local dev uses `http://localhost:3000` directly. CORS origin stays `http://localhost:3001`.
2. **Root `.dockerignore` excludes `frontend`** (lines 31–32). **Fix:** frontend Docker build uses `context: ./frontend` (not `.`), plus a `frontend/.dockerignore`. Root ignore then only affects the backend context (intended).
3. **Tailwind v4 (no `tailwind.config.ts`)** — `create-next-app --tailwind` now ships Tailwind v4 (CSS-first, `@import "tailwindcss"`, `@tailwindcss/postcss`). **Fix:** use v4; do NOT create `tailwind.config.ts`. Adapt the documented structure accordingly.
4. **Empty optional strings fail `400`** — class-validator `@IsOptional` skips only `null`/`undefined`, not `""`. Submitting `website: ""` fails `@IsUrl`. **Fix:** the API client MUST omit empty optional fields before POST.

## Frontend structure (`frontend/`)
```
frontend/
├── package.json  next.config.mjs  tsconfig.json  postcss.config.mjs
├── eslint.config.mjs  components.json  .gitignore  .dockerignore
├── .env.example                       # NEXT_PUBLIC_API_URL=http://localhost:3000
├── Dockerfile                         # multi-stage, build-arg NEXT_PUBLIC_API_URL, standalone output, expose 3001
├── public/.gitkeep
└── src/
    ├── app/***REMOVED***layout.tsx, page.tsx, globals.css***REMOVED***
    ├── components/ui/***REMOVED***button,input,label,table,sonner***REMOVED***.tsx   # shadcn primitives (hand-write if CLI offline)
    ├── components/accounts/
    │   ├── accounts-view.tsx          # "use client" — wires hook → presentation
    │   ├── accounts-table.tsx         # props: accounts, loading, error, onRetry
    │   ├── account-row.tsx
    │   ├── create-account-form.tsx    # "use client" — fields, validation, submit
    │   ├── accounts-skeleton.tsx
    │   ├── accounts-empty-state.tsx
    │   └── accounts-error-state.tsx
    ├── hooks/use-accounts.ts          # "use client" — owns state; getAccounts/createAccount; reload after create
    ├── lib/api/***REMOVED***client.ts, accounts.ts***REMOVED***
    ├── lib/utils.ts                   # cn()
    └── types/account.ts               # Account, AccountFormValues, ApiError, list/create response types
```
Modified (infra only — no backend source): `docker-compose.yml` (add `frontend` service, `context: ./frontend`, build arg, port 3001, `depends_on: backend`).

## Key implementation details
- `lib/api/client.ts`: read `NEXT_PUBLIC_API_URL` (throw `ApiError` if missing); `fetchJson<T>()` sets JSON headers, `cache: "no-store"`; on non-2xx normalizes to a single `ApiError ***REMOVED*** statusCode, message, errors? ***REMOVED***` (user-friendly message; never leak internals/stack). Network/DNS errors → friendly message.
- `lib/api/accounts.ts`: `getAccounts(limit?)` → `AccountListResponse`; `createAccount(values)` strips empty optionals (`toPayload` keeps only non-empty `name/phone/website/industry`) → `AccountCreateResponse.data`. Client appends `/api/accounts`.
- `hooks/use-accounts.ts`: holds `accounts/isLoading/error`; exposes `reload()` and `create()`; on create success reloads list before resolving; `CreateResult = ***REMOVED***ok:true;account***REMOVED*** | ***REMOVED***ok:false;message;errors?***REMOVED***`; guards superseded async responses.
- `create-account-form.tsx`: client validation mirrors DTO (name required ≤255; website valid http/https URL; phone/industry ≤255); maps server `errors[]` back to fields best-effort; a11y labels/`aria-invalid`/`role="alert"`; disabled+`aria-busy` while pending; success/error toast via `sonner`.
- `app/page.tsx`: thin server shell rendering `AccountsView` (client). `layout.tsx` includes `<Toaster />`.
- Strong typing, no `any`. Import alias `@/*`.

## Decisions (defaults chosen)
- Build-arg for `NEXT_PUBLIC_API_URL` (simpler than a Next rewrite proxy; keeps CORS meaningful).
- Tailwind v4 (CSS-first).
- Keep `sonner` for toasts (standard shadcn primitive).
- No pagination UI (backend `meta` available; default `limit=100` sufficient).

## Verification (must pass before review)
- `npm install` in `frontend/`.
- `npx tsc --noEmit` — no type errors, no `any`.
- `npm run lint` — clean.
- `npm run build` (next build) — success.
- Boot check: app renders loading/empty states against an unreachable backend without crashing; stub-server check that `fetchJson` parses `ApiError` (incl. 400 `errors[]`).
- `frontend/.env.example` documents `NEXT_PUBLIC_API_URL`.

## Post-implementation (coordinator)
- Review against this plan + API contract.
- Summarize files/decisions/assumptions; stop for user approval before the final project review (reviewer agent).
