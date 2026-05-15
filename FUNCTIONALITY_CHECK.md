# Functionality Check

Checked on: 2026-05-15

## Checks That Pass

- TypeScript check: `pnpm exec tsc --noEmit`
- Unit tests: `pnpm test`
  - 1 test file passed
  - 26 tests passed
- Production build: `pnpm build`
- Public landing route: `/`
  - Returns 200
  - Contains landing page content and `Start Triage` link
- Patient triage route: `/triage`
  - Returns 200
  - Contains disclaimer gate and Asha triage UI
- Admin login route: `/admin/login`
  - Returns 200
  - Contains admin login UI
- Admin auth guard: `/admin`
  - Redirects unauthenticated requests to `/admin/login`
- Session API:
  - `POST /api/sessions` created a temporary test session
  - `GET /api/sessions/:id` returned the test session
  - `DELETE /api/sessions/:id` deleted the test session
  - Follow-up `GET` returned 404 after cleanup
- Vapi webhook routing:
  - `status-update` returned 200
  - `transcript` returned 200
  - `function-call` `log_symptom` returned `{ "result": "ok" }`
  - `function-call` `submit_triage_assessment` returned `{ "result": "er" }`
  - `end-of-call-report` returned 200
  - Final session state became `final_tier = "er"`, `red_flag_triggered = true`, `status = "complete"`

## Issues Found

### 1. `pnpm lint` Does Not Run Non-Interactively

`pnpm lint` runs `next lint`, which is deprecated and opens an interactive ESLint setup prompt in this Next.js version. This exits with code 1 instead of producing a lint result.

Recommended fix: migrate from `next lint` to the ESLint CLI configuration.

### 2. Webhook Signature Enforcement Is Not Active Locally

An unsigned webhook request returned 200, and a request with an invalid `x-vapi-signature` also returned 200.

This means `VAPI_WEBHOOK_SECRET` is either missing from the running environment or the current code intentionally skips verification when the secret is unset.

Recommended fix: fail closed in production if `VAPI_WEBHOOK_SECRET` is missing, and keep local test mode explicit.

### 3. Emergency Number / Disclaimer Text Is Inconsistent

The docs require the patient disclaimer to say emergency services `108 in India` and not be paraphrased. Current UI/constants still include `112` in some places:

- `src/lib/constants.ts`
- generated report HTML inside `src/components/patient/ClassificationCard.tsx`

Recommended fix: update `DISCLAIMER_TEXT` to match `docs/architecture.md` verbatim and use `108` consistently.

## Not Fully Tested

- Real Vapi browser call start, microphone permission flow, and live Web SDK events were not tested because that requires browser interaction and valid Vapi credentials.
- Admin sign-in with real credentials was not tested because credentials were not provided and `.env.local` was not read.
- Authenticated `/admin` dashboard data rendering was not tested through a logged-in browser session.
- Supabase Realtime subscription delivery was not directly tested; API writes and server reads were tested.
