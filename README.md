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
Next.js Frontend            (future – separate service)
   │
REST API
   │
   ▼
NestJS Backend              (this project, port 3000)
   │
OAuth 2.0 Password Grant + REST API
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
├── .env.example              # Root env reference (Docker Compose)
├── docker-compose.yml        # Backend service
├── backend/
│   ├── Dockerfile            # Multi-stage build
│   ├── .env.example          # Backend env reference (local dev)
│   ├── src/
│   │   ├── main.ts           # Global ValidationPipe, CORS, exception filter
│   │   ├── app.module.ts     # Config + feature modules
│   │   ├── config/configuration.ts   # Typed env + startup validation
│   │   ├── common/
│   │   │   ├── filters/http-exception.filter.ts
│   │   │   └── health/health.controller.ts
│   │   ├── auth/auth.module.ts        # Stub – auth is out of scope
│   │   ├── salesforce/                 # All Salesforce integration lives here
│   │   │   ├── oauth.service.ts        # OAuth 2.0 Password Grant
│   │   │   ├── token-cache.ts          # In-memory token cache (60s margin)
│   │   │   ├── salesforce.client.ts    # Authorized fetch + 401 retry
│   │   │   ├── salesforce.service.ts   # Query/create + response mapping
│   │   │   ├── salesforce.errors.ts    # Salesforce → app error translation
│   │   └── accounts/
│   │       ├── accounts.controller.ts  # Thin: GET/POST /api/accounts
│   │       ├── accounts.service.ts     # Delegates to SalesforceService
│   │       ├── dto/create-account.dto.ts
│   │       └── types/account.ts
│   └── test files
└── frontend/                 # Built separately (out of scope here)
```

---

## Prerequisites

- Node.js >= 18 (uses the native `fetch` and `Response` globals)
- npm
- Docker + Docker Compose

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` for local development, and the root
`.env.example` to `.env` for Docker Compose. **Never commit real credentials.**

| Variable            | Description                                    |
| ------------------- | ---------------------------------------------- |
| `SF_LOGIN_URL`      | Salesforce login host (e.g. `https://login.salesforce.com`) |
| `SF_CLIENT_ID`      | Connected App Client Id                        |
| `SF_CLIENT_SECRET`  | Connected App Client Secret                    |
| `SF_USERNAME`       | Salesforce user username                       |
| `SF_PASSWORD`       | Salesforce user password                     |
| `SF_SECURITY_TOKEN` | Salesforce security token (appended to password) |
| `SF_API_VERSION`    | Salesforce REST API version (e.g. `60.0`)      |
| `CORS_ORIGIN`       | Allowed frontend origin                        |
| `PORT`              | Backend listen port (e.g. `3000`)              |

A missing required variable prevents the application from starting with a clear error message.

---

## Authentication Decision (OAuth 2.0 – Password Grant)

This is an interview assignment for a **server-to-server** integration. The backend
authenticates to Salesforce using the OAuth 2.0 **user-password grant**: the password
is sent as `password + security token`. The resulting access token and instance URL are
cached in memory for reuse, refreshed on expiry (60-second safety margin) and on `401`
responses.

> The Password Grant is used only because this assignment has no interactive user login
> flow. For a production system with real end users, switch to the Authorization Code /
> PKCE flow so credentials never touch the backend.

---

## Running

### With Docker Compose (recommended)

```bash
cp .env.example .env     # edit with real Salesforce credentials
docker compose up --build
```

The backend is reachable at `http://localhost:3000`.

### Locally

```bash
cd backend
cp .env.example .env     # edit with real credentials
npm install
npm run start:dev
```

### Health

```bash
curl http://localhost:3000/api/health
# ***REMOVED***"status":"ok"***REMOVED***
```

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
