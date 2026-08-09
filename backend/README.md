# Salesforce Account Manager Backend

NestJS REST API that keeps Salesforce credentials server-side and exposes the
account list and create operations to the frontend.

## Setup

```bash
cp .env.example .env
npm install
npm run start:dev
```

The application listens on `PORT` and allows requests from `CORS_ORIGIN`.
Required configuration is validated at startup. Salesforce authentication uses
the OAuth 2.0 `client_credentials` grant with `SF_CLIENT_ID` and
`SF_CLIENT_SECRET`; username, password, and security token variables are not
used.

## Commands

```bash
npm run build
npm run lint
npm run test
```

The unit tests mock native `fetch` and do not contact a live Salesforce org.

## API

- `GET /api/health`
- `GET /api/accounts?limit=50`
- `POST /api/accounts`

All Salesforce communication and token caching are isolated in
`src/salesforce`. Validation failures and upstream failures are returned using
the global ` statusCode, message, errors? ` error shape.
