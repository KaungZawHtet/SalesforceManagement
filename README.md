# Salesforce Account Manager

A production-quality web application that integrates with Salesforce via the Salesforce REST API. The backend (NestJS) acts as the single, trusted intermediary between the browser and Salesforce — **the frontend never contacts Salesforce directly**.

Users can:

- View existing Salesforce Account records (`GET /api/accounts`)
- Create new Salesforce Account records (`POST /api/accounts`)

---

## Architecture

```
Browser
   │
   ▼
Next.js Frontend            (port 3001)
   │
REST API
   │
   ▼
NestJS Backend              (this project, port 3000)
   │
OAuth 2.0 client credentials + REST API
   │
   ▼
Salesforce REST API
```

All Salesforce credentials, access tokens, and API calls live exclusively on the backend.

---

## Tech Stack

| Layer            | Technology                              |
| ---------------- | --------------------------------------- |
| Backend          | NestJS 11, TypeScript, native `fetch`   |
| Validation       | `class-validator` + `class-transformer` |
| Configuration    | `@nestjs/config` + environment variables |
| Containerization | Docker + Docker Compose               |

No database, JWT, Redis, or user-management libraries are used — keeping the dependency surface minimal.

---

## Repository Layout

```
.
├── AGENTS.md                 # Project objective, scope & conventions
├── README.md                 # This file
├── .env.example              # Root env reference (Docker Compose)
├── docker-compose.yml        # Backend + Frontend services
├── backend/
│   ├── Dockerfile
│   ├── .env.example          # Backend env reference (local dev)
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── config/configuration.ts
│       ├── common/
│       │   ├── filters/http-exception.filter.ts
│       │   └── health/health.controller.ts
│       ├── auth/auth.module.ts        # Stub – auth is out of scope
│       ├── salesforce/                 # All Salesforce integration lives here
│       └── accounts/
│           ├── accounts.controller.ts
│           ├── accounts.service.ts
│           ├── dto/create-account.dto.ts
│           └── types/account.ts
│   └── test/
├── frontend/
│   ├── Dockerfile
│   ├── .env.example
│   ├── components.json
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── globals.css
│       ├── components/
│       │   ├── ui/ (button, input, label, table, sonner)
│       │   └── accounts/ (accounts-view, accounts-table, account-row, create-account-form)
│       ├── hooks/ (use-accounts)
│       ├── lib/ (api/client.ts, api/accounts.ts, utils.ts)
│       └── types/ (account.ts)
└── docs/                     # OpenAPI spec, deployment notes (if needed)
```

---

## Prerequisites

- Node.js >= 18 (uses the native `fetch` and `Response` globals)
- npm
- Docker + Docker Compose
- GitHub CLI (`gh`) for one-command AWS deployment
- AWS CLI with the `salesforce-manager` profile for local secret synchronization

---

## Environment Variables

### Backend (`backend/.env` or Docker secret)

Copy `backend/.env.example` to `backend/.env` for local development:

| Variable             | Description                                       |
| -------------------- | ------------------------------------------------- |
| `SF_LOGIN_URL`       | Salesforce login host (e.g. `https://login.salesforce.com`, `https://test.salesforce.com` for sandboxes) |
| `SF_CLIENT_ID`       | Connected App Client Id (from Salesforce Setup → App Manager) |
| `SF_CLIENT_SECRET`   | Connected App Client Secret                       |
| `SF_API_VERSION`     | Salesforce REST API version (e.g. `60.0` – check [developer docs](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_versions.htm)) |
| `CORS_ORIGIN`        | Allowed frontend origin (e.g. `http://localhost:3001`) |
| `PORT`               | Backend listen port (default `3000`)              |

Copy root `.env.example` to `.env` for Docker Compose (contains same vars).

> **Important**: A missing or malformed required variable prevents the application from starting with a clear error message. The Connected App must support the OAuth `client_credentials` grant and the Salesforce API scope required by the integration.

> **Security**: Any Salesforce credentials that were previously committed to Git must be rotated or revoked in Salesforce. Removing a secret from the working tree does not remove it from Git history.

### Frontend (`frontend/.env.local`)

Copy `frontend/.env.example` to `frontend/.env.local` for local development:

| Variable               | Description                                            |
| -------------------- | ------------------------------------------------------ |
| `NEXT_PUBLIC_API_URL`  | Backend API base URL (e.g. `http://localhost:3000`)    |

> `NEXT_PUBLIC_*` variables are inlined at build time — they become static in the client bundle. Do not include secrets here.

---

## Authentication Decision (OAuth 2.0 – Client Credentials)

This is an interview assignment for a **server-to-server** integration. The backend
authenticates to Salesforce using the OAuth 2.0 **client credentials grant**. Only the
Connected App client ID and secret are used. The resulting access token and instance
URL are cached in memory for reuse, refreshed on expiry (60-second safety margin) and
on `401` responses.

No Salesforce credentials are sent to the browser, and no interactive user authentication
is implemented because that is outside this assignment's scope.

---

## Running

### With Docker Compose (recommended)

```bash
cp .env.example .env     # edit with REAL Salesforce credentials (never commit)
docker compose up --build
```

The full stack:
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:3001`

```bash
# Verify backend health
curl http://localhost:3000/api/health
# ***REMOVED***"status":"ok"***REMOVED***
```

### Locally (backend only)

```bash
cd backend
cp .env.example .env     # edit with real credentials
npm install
npm run start:dev
```

### Locally (frontend only)

```bash
cd frontend
cp .env.example .env.local  # edit NEXT_PUBLIC_API_URL
npm install
npm run dev -- --port 3001  # http://localhost:3001
```

### AWS deployment

The AWS deployment is executed by GitHub Actions. The local deploy script uses the AWS CLI only to synchronize the server-side Salesforce values from `backend/.env`; Terraform and ECS operations still run in GitHub Actions through OIDC:

```bash
# Deploy the pushed main branch: Terraform apply, image build/push, ECS deploy, smoke tests
./scripts/deploy.sh

# Destroy the Terraform-managed dev environment after confirmation
./scripts/destroy.sh
```

Before the first deployment, complete the one-time setup in `infra/README.md`: create the remote Terraform state bucket, configure the GitHub OIDC role and repository variables, configure the `salesforce-manager` AWS CLI profile, and create `backend/.env` from its example. When the dev infrastructure is absent, `deploy.sh` runs the Terraform bootstrap apply automatically before syncing the Salesforce values. The script requires a clean local `main` branch whose commit matches `origin/main`.

The destroy command preserves the Terraform state bucket and GitHub OIDC resources. Use `./scripts/destroy.sh --yes` only for an intentional non-interactive teardown.

---

## API Contract

### `GET /api/health`
- `200` → `***REMOVED*** "status": "ok" ***REMOVED***`

### `GET /api/accounts?limit=50`
- `200` → `***REMOVED*** "data": Account[], "meta": ***REMOVED*** "total", "limit", "offset" ***REMOVED*** ***REMOVED***`
- `limit` is optional (default `100`, max `2000`).

### `POST /api/accounts`
- Body: `***REMOVED*** "name": "Acme", "phone"?: "...", "website"?: "https://...", "industry"?: "..." ***REMOVED***`
- `201` → `***REMOVED*** "data": Account ***REMOVED***`
- `400` on validation failure → `***REMOVED*** "statusCode": 400, "message": "Bad request", "errors": [...] ***REMOVED***`
- Unknown properties are rejected (`forbidNonWhitelisted`).

`Account = ***REMOVED*** id, name, phone?, website?, industry? ***REMOVED***`, mapped from Salesforce
`Id/Name/Phone/Website/Industry`.

### Error Shape (global filter)
All errors return `***REMOVED*** statusCode, message, errors? ***REMOVED***`. `errors` is an array of
messages for validation failures only.

| Condition               | Status |
| ----------------------- | ------ |
| Validation failure      | 400    |
| Salesforce auth failure | 401    |
| Insufficient access     | 403    |
| Salesforce upstream/auth| 502    |
| Salesforce unavailable  | 503    |
| Unexpected server error | 500    |

Raw Salesforce responses and secrets are never leaked to clients; details are logged
server-side only.

---

## Development

```bash
cd backend
npm install
npm run build      # type-check + compile
npm run lint       # eslint
npm run test       # unit tests (fetch is mocked; no live Salesforce)
npm run test:watch
```

Tests mock the global `fetch` and the `SalesforceClient`/`SalesforceService` — they
never depend on a live Salesforce org.
