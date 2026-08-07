# Salesforce Account Manager — Implementation Plan

## Goal
Production-quality web app that lists and creates Salesforce `Account` records.
Browser → Next.js → NestJS → Salesforce REST API (frontend never talks to Salesforce directly).

## Architecture
```
Browser ──► Next.js (App Router, TS, Tailwind, shadcn/ui)
              │  REST / JSON  (NEXT_PUBLIC_API_URL)
              ▼
          NestJS (TS)  [auth, salesforce, accounts]
              │  OAuth 2.0 password grant + REST
              ▼
          Salesforce REST API  (/services/data/v58.0)
```

- Controllers thin; business logic in `AccountsService`; Salesforce HTTP/OAuth/token logic isolated in `SalesforceModule`.
- `AccountsService` is the only consumer of `SalesforceService`.
- **Auth module = minimal stub.** No real login/JWT guarding the happy path. Structure exists per AGENTS.md; Salesforce credentials stay server-side. (Confirmed with stakeholder.)

## Repo layout (monorepo, no Turborepo)
```
SalesforceManagement/
├── AGENTS.md
├── README.md
├── .gitignore
├── .env.example
├── docker-compose.yml
├── backend/
└── frontend/
```

## Backend — `backend/` (NestJS)
```
backend/
├── package.json  tsconfig.json  tsconfig.build.json  nest-cli.json  eslint.config.js
├── .env.example
├── Dockerfile
└── src/
    ├── main.ts                 # global ValidationPipe, CORS, exception filter
    ├── app.module.ts           # ConfigModule.forRoot(***REMOVED***isGlobal***REMOVED***), feature modules
    ├── config/configuration.ts
    ├── common/filters/http-exception.filter.ts
    ├── auth/auth.module.ts     # minimal stub (no guard on routes)
    ├── salesforce/
    │   ├── salesforce.module.ts
    │   ├── salesforce.service.ts      # list (SOQL) + create + mapping
    │   ├── salesforce.client.ts       # authorized fetch + single 401 retry/refresh
    │   ├── oauth.service.ts           # token fetch/refresh
    │   ├── token-cache.ts             # in-memory cache w/ expiry + safety margin
    │   ├── salesforce.errors.ts       # error classification/translation
    │   └── types/salesforce.interfaces.ts
    └── accounts/
        ├── accounts.module.ts
        ├── accounts.controller.ts     # GET /accounts, POST /accounts
        ├── accounts.service.ts
        ├── dto/create-account.dto.ts  # class-validator
        └── types/account.ts
```

## Frontend — `frontend/` (Next.js App Router)
```
frontend/
├── package.json  next.config.mjs  tsconfig.json  tailwind.config.ts
├── postcss.config.mjs  components.json
├── .env.example  Dockerfile
└── src/
    ├── app/layout.tsx  app/page.tsx  app/globals.css
    ├── components/ui/            # shadcn primitives (button, input, table, label, sonner)
    ├── components/accounts/      # accounts-table, account-row, create-account-form,
    │                             #   accounts-skeleton, accounts-empty-state,
    │                             #   accounts-error-state, success-toast
    ├── hooks/use-accounts.ts  hooks/use-create-account.ts
    ├── lib/api/client.ts  lib/api/accounts.ts  lib/utils.ts
    └── types/account.ts
```

## API contract
Base: `http://backend:3000` (docker) / `http://localhost:3000` (local). Frontend uses `NEXT_PUBLIC_API_URL`.

Field mapping:
| App | Salesforce |
|-----|-----------|
| id | Id |
| name | Name (required) |
| phone | Phone (optional) |
| website | Website (optional) |
| industry | Industry (optional) |

- `GET /api/accounts` → `200` `***REMOVED*** data: Account[], meta: ***REMOVED*** total, limit, offset ***REMOVED*** ***REMOVED***` (`data: []` when empty)
- `POST /api/accounts` body `***REMOVED*** name, phone?, website?, industry? ***REMOVED***`, whitelist + forbid non-whitelisted. `name` required (1–255 trimmed); `website` valid URL if present. → `201` `***REMOVED*** data: Account ***REMOVED***`
- Error shape (global filter): `***REMOVED*** statusCode, message, errors? ***REMOVED***` (`errors` list for validation failures)
- Codes: 200 list, 201 create, 400 validation, 502 SF auth/upstream, 503 SF unavailable, 500 unexpected. No raw SF payloads, no stack traces, no secrets.

## Salesforce integration
- OAuth 2.0 **password grant** (server-to-server service account): `SF_CLIENT_ID`, `SF_CLIENT_SECRET`, `SF_USERNAME`, `SF_PASSWORD`, `SF_SECURITY_TOKEN`, `SF_LOGIN_URL`, `SF_API_VERSION=v58.0`.
- Token cached in-memory (single NestJS instance); reuse until `expires_at - 60s`; authenticate at most once per token lifetime.
- List: `GET ***REMOVED***instance***REMOVED***/services/data/v58.0/query?q=SELECT Id, Name, Phone, Website, Industry FROM Account ORDER BY Name` (fixed limit ~200).
- Create: `POST ***REMOVED***instance***REMOVED***/services/data/v58.0/sobjects/Account` with non-empty fields; on `201`, re-SELECT the record by Id to return a complete object.
- 401 handling: clear token, re-auth once, retry once; never loop.
- Error translation: `INVALID_SESSION_ID`/`INVALID_LOGIN` → auth; `REQUEST_LIMIT_EXCEEDED` → 429/503; record-level → 400; `API_DISABLED`/`INSUFFICIENT_ACCESS` → 403; unknown → 502.
- HTTP client: native `fetch` (Node 18+), no axios. Never log tokens/passwords/secrets.

## Frontend details
- Server Components by default; Client Components only for interactive table/form.
- API calls isolated in `lib/api/*`; components never call `fetch` directly.
- Account list: name, phone, website, industry. Loading skeleton, empty state, error state.
- Create form: validates, disables on submit, success toast, error toast, refreshes list after create.
- Responsive; shadcn/ui only for primitives actually used; no state library.

## Env vars
`.env.example` at root, `backend/.env.example`, `frontend/.env.example`.
- Backend: `SF_*`, `CORS_ORIGIN`, `PORT=3000`
- Frontend: `NEXT_PUBLIC_API_URL`
Secrets only via env; `.env.*` gitignored; `.env.example` committed.

## Development phases
1. **Phase 0 — Scaffolding**: root README/.gitignore/.env.example; scaffold `backend/` (nest new) and `frontend/` (create-next-app, TS, Tailwind, shadcn). Ports: backend 3000, frontend 3001.
2. **Phase 1 — Backend**: config → salesforce module (oauth/token-cache/client/service/errors) → accounts module (dto/controller/service) → auth stub → exception filter + validation pipe.
3. **Phase 2 — Backend verify**: unit tests with mocked fetch/SF (no live org) for oauth, token-cache, salesforce.service, accounts.service; `lint`, `test`, `build` green.
4. **Phase 3 — Frontend**: lib/api + types → shadcn ui → account components + hooks → page.tsx composition.
5. **Phase 4 — Frontend verify**: `next build`, lint, manual happy + error paths.
6. **Phase 5 — Docker**: `backend/Dockerfile`, `frontend/Dockerfile`, root `docker-compose.yml` (backend:3000, frontend:3001, healthchecks, env passthrough, service networking `frontend → http://backend:3000`).
7. **Phase 6 — README + polish**: Salesforce connected-app setup steps, env tables, `docker compose up`, local dev, test commands; full lint/test/build pass both apps.

## Modeling of work (sub-agents)
- **Architect** (done): produced proposal above.
- **Backend engineer** → Phases 1, 2 (uses `nestjs-backend` + `salesforce-integration` skills).
- **Frontend engineer** → Phases 3, 4 (uses `nextjs-frontend` skill).
- **Reviewer** → post-build review, prioritized issues.
Incremental: backend merchant builds after scaffold; frontend after backend contract is fixed; reviewer after integration; coordinator resolves issues.

## Risks / decisions
- **OAuth password grant may be disabled** in target org (CDO/policy) → document Connected App setup precisely; keep token logic abstracted so grant type can swap to JWT-bearer/client-credentials.
- **No live org for demo** → unit tests mock SF; env-driven config for real creds.
- **Secret leakage** → strict env usage, gitignored `.env*`, sanitized logging, never echo tokens/SF payloads.
- **Pagination** → minimal (fixed LIMIT + meta); no UI pagination (out of scope).
- **Token cache** → in-memory single-instance (fine for interview); multi-instance Redis out of scope.
- **Read-back after create** → re-SELECT by Id for a complete record.
- **No Turborepo, no axios, no state library** — keep dependencies minimal.

## Definition of Done
- View + create Salesforce accounts working.
- Frontend only talks to backend; backend talks to SF; secrets via env.
- Runs via Docker; README covers setup/usage.
- Both apps pass lint/test/build; reviewer passes; code clean/reviewable.
