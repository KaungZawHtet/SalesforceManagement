# Salesforce Account Manager Frontend

Next.js App Router frontend for viewing and creating Salesforce Accounts. It
only calls the NestJS backend and never receives Salesforce credentials.

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev -- --port 3001
```

Set `NEXT_PUBLIC_API_URL` to the browser-reachable backend base URL, normally
`http://localhost:3000`. Do not append `/api`; the account API client adds that
path. `NEXT_PUBLIC_*` values are public and are inlined into the browser build.

## Commands

```bash
npm run lint
npm run build
npx playwright test
```

The Playwright suite starts the frontend automatically and mocks backend API
responses for deterministic UI coverage.
