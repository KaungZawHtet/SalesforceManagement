# Critical Issues Remediation Plan

## Goal

Resolve the previously identified security, authentication, configuration, frontend workflow, error-handling, CSS, and verification gaps while preserving the current simple Next.js/NestJS/Salesforce architecture.

## Scope and Constraints

- Keep Salesforce credentials server-side and remove all hard-coded credential material from tracked files.
- Standardize on the OAuth `client_credentials` flow already implemented in `OauthService`, unless live Salesforce configuration proves that flow unavailable.
- Do not add application authentication, a database, Redis, pagination infrastructure, Kubernetes, Terraform, or unrelated abstractions.
- Keep the frontend talking only to the NestJS API.
- Do not expose or reproduce the existing credential values. Rotation/revocation of any already exposed Salesforce secret remains an external Salesforce-account action and must be called out in the final report.

## Implementation Steps

### 1. Remove credential exposure and align environment documentation

Files:

- `test.http`
- Add a safe request template only if it is useful, with placeholders and no real values.
- `.env.example`
- `backend/.env.example`
- `backend/src/auth/auth.module.ts`
- `README.md`

Changes:

- Remove the tracked hard-coded Salesforce request credentials.
- Document `client_credentials` consistently and remove password-grant-only variables from the active configuration examples.
- State that any credentials previously present in Git must be rotated or revoked.
- Keep only non-secret defaults and placeholder values in examples.

### 2. Make backend configuration and OAuth types consistent

Files:

- `backend/src/config/configuration.ts`
- `backend/src/salesforce/oauth.service.ts`
- `backend/src/salesforce/types/salesforce.interfaces.ts`
- Related backend specs and README documentation.

Changes:

- Make the configuration contract represent the selected `client_credentials` flow rather than retaining unused username/password/security-token fields.
- Validate required client ID, client secret, login URL, API version, port, and CORS configuration.
- Validate successful token responses before caching them so malformed OAuth responses cannot produce requests with an empty token or instance URL.
- Preserve the existing token cache and 401 refresh behavior.

### 3. Correct frontend environment setup

Files:

- `.env.example`
- Add `frontend/.env.example`
- `README.md`
- `frontend/.dockerignore`

Changes:

- Use `http://localhost:3000` as the frontend API base URL, without `/api`.
- Add the missing frontend environment example.
- Document Docker build-time versus local-development configuration clearly.
- Ignore all frontend env files in the frontend Docker build context, including `.env.local`.

### 4. Fix account form validation and error notifications

Files:

- `frontend/src/components/accounts/create-account-form.tsx`
- `frontend/src/lib/api/accounts.ts`
- `frontend/src/types/account.ts`

Changes:

- Normalize blank optional inputs to `undefined` before URL and other optional validation, allowing a name-only account submission.
- Catch API failures in the form and show the existing friendly error message through `sonner`.
- Remove duplicate success notifications so one successful submission produces one notification.
- Preserve the existing backend-friendly error mapping and avoid exposing Salesforce internals.

### 5. Refresh the account list after creation

Files:

- `frontend/src/components/accounts/accounts-view.tsx`
- `frontend/src/components/accounts/create-account-form.tsx`

Changes:

- Centralize account loading in a reusable function.
- Perform a fresh `GET /api/accounts` after successful creation instead of only appending the local response.
- Keep the existing initial loading, empty, and error states.
- Avoid leaving stale data visible when a refresh fails.

### 6. Translate Salesforce request network failures correctly

Files:

- `backend/src/salesforce/salesforce.client.ts`
- `backend/src/salesforce/salesforce.errors.ts` if needed
- `backend/src/salesforce/salesforce.client.spec.ts`

Changes:

- Convert request timeouts and generic fetch/network failures into the existing application-level gateway or service-unavailable exceptions.
- Apply the same behavior to the refreshed-token retry path.
- Keep Salesforce response errors mapped through the existing error translator.
- Add regression tests for initial network failure, retry network failure, and timeout behavior.

### 7. Repair the Tailwind/PostCSS setup

Files:

- `frontend/postcss.config.cjs` or replace it with `frontend/postcss.config.mjs`
- `frontend/src/app/globals.css`
- `frontend/tailwind.config.js`
- `frontend/next.config.ts` / `frontend/next.config.mjs`
- Remove unreferenced generated CSS/test artifacts if confirmed unused.

Changes:

- Configure the installed Tailwind v4 PostCSS plugin.
- Use the active `globals.css` as the single CSS entry point with a valid Tailwind v4 import and theme color variables required by the existing shadcn-style classes.
- Remove the invalid or redundant Tailwind configuration and duplicate Next config, retaining one authoritative Next configuration.
- Remove obsolete generated CSS files rather than maintaining hand-generated utility subsets.

### 8. Improve regression coverage and verify the application

Tests and checks:

- Update backend specs for the selected OAuth configuration and network error behavior.
- Add frontend coverage for blank optional fields, create API failure notification, successful creation refresh, and account list failure handling using mocked API responses.
- Run backend unit tests, lint, TypeScript/build checks, frontend lint/build checks, and Playwright tests.
- Run a Docker Compose smoke test with safe local environment values and, where credentials are available, verify live Salesforce list/create behavior.
- Confirm `git status` contains only intended changes and no credential material.

## Expected Result

- No credentials remain in tracked files.
- OAuth code, environment examples, comments, and README documentation describe the same flow.
- Local frontend setup uses a correct browser-reachable API URL.
- Users can submit a name-only account, receive useful create errors, and see a freshly loaded account list after creation.
- Salesforce network failures produce appropriate upstream errors rather than generic 500 responses.
- Tailwind styling is produced by the configured build pipeline.
- Automated tests cover the critical assignment paths and the final runtime is validated.
