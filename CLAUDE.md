# AI Triage Assistant — Project Brief

You are building a browser-based AI healthcare triage assistant for a 24-hour hackathon (BMSIT AI Fusion Challenge, Problem Statement 2). Solo developer. Demo on a projector. Judges may test from their own laptops.

## What the product does

A patient opens the home page, accepts a disclaimer, clicks **Start Triage Call**, and has a spoken conversation with an AI in the browser. The AI conducts a structured symptom interview, then classifies the case into one of three care tiers:

- **Home Care** — minor symptoms, self-monitor
- **Clinic Visit** — moderate symptoms, see a GP within 24h
- **Emergency Room** — high-risk symptoms, call emergency services now

A second dashboard at `/admin` shows all sessions live, lets staff drill into any session's transcript, and surfaces analytics. The patient side is anonymous, the admin side is auth-gated.

There is **no phone number, no telephony, no SMS**. Voice runs entirely through the browser via the Vapi Web SDK.

## Tech stack — locked, do not deviate

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Voice:** `@vapi-ai/web` (Vapi Web SDK)
- **Backend:** Next.js route handlers
- **Database:** Supabase (Postgres + Realtime + Auth) via `@supabase/ssr`
- **Hosting:** Vercel
- **Package manager:** pnpm (or npm if pnpm not available)

## Vapi setup

**The Vapi assistant is configured in the Vapi dashboard, not in code.** The system prompt, voice, model, transcriber, tools, and webhook URL are all set via dashboard. Code only:

1. Reads `NEXT_PUBLIC_VAPI_PUBLIC_KEY` and `NEXT_PUBLIC_VAPI_ASSISTANT_ID` from env
2. Calls `vapi.start(assistantId, { variableValues: {...} })` from the browser
3. Subscribes to client-side events to update the UI
4. Receives server webhook events at `/api/vapi/webhook` and writes to Supabase

See `docs/vapi-setup.md` for the dashboard configuration steps. Do not create the assistant via API.

## Routes

| Route | Auth | Purpose |
|---|---|---|
| `/` | none | Patient flow: disclaimer → start call → live UI → classification |
| `/admin/login` | none | Supabase magic-link login |
| `/admin` | required | Live queue + sessions table + stats |
| `/admin/[id]` | required | Single session detail: transcript, symptoms, reasoning, audit log |
| `/api/vapi/webhook` | signature | Receives all Vapi server events |
| `/api/sessions` | none | POST to create a session row before call start |

## File structure (target)

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                     # patient flow
│   ├── admin/
│   │   ├── login/page.tsx
│   │   ├── page.tsx                 # queue + table
│   │   └── [id]/page.tsx            # session detail
│   └── api/
│       ├── vapi/webhook/route.ts
│       └── sessions/route.ts
├── components/
│   ├── patient/
│   │   ├── DisclaimerGate.tsx
│   │   ├── CallControls.tsx
│   │   ├── TranscriptPanel.tsx
│   │   ├── SymptomCards.tsx
│   │   ├── RiskMeter.tsx
│   │   └── ClassificationCard.tsx
│   ├── admin/
│   │   ├── LiveQueue.tsx
│   │   ├── SessionsTable.tsx
│   │   ├── StatsDonut.tsx
│   │   └── SessionDetail.tsx
│   └── ui/                          # shadcn components
├── lib/
│   ├── vapi-client.ts               # singleton browser Vapi instance
│   ├── supabase-client.ts           # browser client (anon key)
│   ├── supabase-server.ts           # server client (service role)
│   ├── red-flags.ts                 # detector + keyword data
│   ├── webhook-verify.ts            # signature verification
│   └── types.ts                     # shared types
└── hooks/
    ├── useVapiCall.ts
    └── useSessionRealtime.ts
```

## Data model

Schema is in `supabase/migrations/0001_init.sql`. Run it as the first step. Four tables:

- `sessions` — one row per call (status, tier, reasoning, red_flag_triggered, etc.)
- `transcripts` — streaming utterances (role + content + session_id)
- `symptoms` — extracted via `log_symptom` tool call
- `audit_log` — red-flag overrides and admin events

Realtime is enabled on `sessions`, `transcripts`, `symptoms`.

## Webhook contract — `/api/vapi/webhook`

The webhook receives Vapi server messages. Switch on `message.type`:

| Vapi event | Action |
|---|---|
| `transcript` with `transcriptType === "final"` | Insert into `transcripts` table |
| `function-call` name `log_symptom` | Insert into `symptoms`, return `{ result: "ok" }` |
| `function-call` name `submit_triage_assessment` | Run red-flag detector → possibly override → update `sessions` → log audit → return final tier |
| `status-update` | Update `sessions.status` |
| `end-of-call-report` | Mark `status = 'complete'`, save duration, ended_at |
| anything else | Ignore (200 OK) |

Verify the signature against `VAPI_WEBHOOK_SECRET` before processing. Reject with 401 if invalid.

The `sessionId` is passed at call start via `assistantOverrides.variableValues.sessionId` and arrives on every webhook event under `message.call.assistantOverrides.variableValues.sessionId`. Use that to map events to rows.

## Red-flag detector — hard requirement

This is the **liability shield** and the answer to every ethics question. It must:

1. Live server-side in `src/lib/red-flags.ts`
2. Accept the full session transcript (concatenated `transcripts.content`) as input
3. Scan against the keyword categories in `docs/red-flags.md` (cardiac, stroke, respiratory, anaphylaxis, hemorrhage, neuro, psych, sepsis, obstetric)
4. Handle negation — do not flag "no chest pain" or "denies headache"
5. Return an array of matched categories (or empty)
6. Be invoked inside the `submit_triage_assessment` webhook handler

If any red flag is matched AND the assistant's submitted tier is `home` or `clinic`, the server **must** override to `er` and insert a row into `audit_log` with `event_type = 'red_flag_override'` and `details: { original_tier, matched_categories, transcript_excerpt }`.

The LLM cannot bypass this. The override is hard-coded server logic. State this in the README and in the Q&A talking points.

## Realtime requirements

- `/admin` subscribes to `sessions` table — see new sessions appear and status change live
- `/admin/[id]` subscribes to `transcripts` and `symptoms` filtered by `session_id` — see a call happen in real time
- Patient page (`/`) updates from Vapi client-side events, not Supabase (lower latency, no double-write)

## UI conventions

- Color system: green (home), amber (clinic), red (er) — use as accents on cards/meters/badges, not full backgrounds
- shadcn defaults; do not introduce a second component library
- Mobile responsive — judges may test on phones
- Dark mode optional, not a priority
- Disclaimer must be visible (a) before the call starts and (b) on the final classification card. Required wording is in `docs/architecture.md`.
- Auto-scroll transcript, fade-in animation when new symptom card appears

## Out of scope (do not build)

- SMS / Twilio
- Phone number / telephony
- EHR integration
- PDF generation beyond a simple html2pdf nice-to-have
- Mental health module (will trigger ethics red flags from judges; punt to roadmap)
- Predictive outbreak analysis
- Wearable / vitals integration
- Multilingual STT/TTS — Hindi is a UI toggle only (it just changes the `language` variable passed to Vapi, which the assistant uses to switch language)
- User accounts on the patient side — anonymous is fine
- RLS policies — service role on the server is acceptable for the hackathon. Add a note in README.

## Build order (suggested)

1. `npx create-next-app@latest` with TS, Tailwind, App Router, src/ dir
2. Install deps: `@vapi-ai/web @supabase/ssr @supabase/supabase-js`, then `npx shadcn@latest init`
3. Create Supabase project, run `supabase/migrations/0001_init.sql`, copy keys to `.env.local`
4. Configure the Vapi assistant in the dashboard per `docs/vapi-setup.md`, copy `assistantId` and public key to `.env.local`
5. Build `/api/vapi/webhook` route handler + red-flag detector. Test with curl using sample payloads.
6. Build `/` patient page: disclaimer gate → call start → live UI components
7. Wire Vapi Web SDK in a `useVapiCall` hook; render TranscriptPanel, SymptomCards, RiskMeter from its state
8. Build `/admin/login` and `/admin` with Supabase Auth + Realtime subscription
9. Build `/admin/[id]` session detail page
10. Polish: animations, mobile, copy, disclaimer placement
11. Seed 3 demo scenarios (Home, Clinic, ER) — keep them as a markdown checklist in `docs/demo-scenarios.md`
12. Deploy to Vercel, point Vapi server URL at the production webhook
13. Update README + take screenshots

## Rules and conventions

- **Always run `npx tsc --noEmit` after substantive changes** to catch type errors before they hit the demo
- **Never invent Vapi API shapes from memory** — open https://docs.vapi.ai/server-url/events and the Web SDK reference. Their event payloads change; verify before parsing
- **Server-only secrets** (`SUPABASE_SERVICE_ROLE_KEY`, `VAPI_WEBHOOK_SECRET`) must never be imported into client code. Use `"server-only"` package imports if you want a hard guard.
- **Webhook handler must be idempotent** — Vapi can retry events; use upserts where possible
- **No placeholder data in production paths** — if you stub something for testing, mark with `// TODO: replace before demo` and grep for those before deploying
- **Disclaimer text is required wording, not flavor** — see `docs/architecture.md` § Ethics. Do not paraphrase.
- **Commit small and often** — feature-sized commits with clear messages
- **Mermaid diagrams in docs/** — judges read them. Keep them up to date.

## Deliverables checklist (per the hackathon PS)

- [x] Working web app — both dashboards
- [x] Project documentation — see `docs/` folder, especially `architecture.md`
- [x] Demo video (≤3 min) — record after build
- [x] Public GitHub repo with README + setup
- [x] Public deployment link (Vercel)

## Slash commands available

These are project-scoped commands defined in `.claude/commands/`:

- `/check` — typecheck + lint + build. Run after every meaningful change.
- `/test-webhook` — fire sample Vapi payloads at the local webhook to verify routing, signature, red-flag override.
- `/commit` — generate a conventional commit message from the diff, show for approval, then commit.

Use them. They save more time than they cost to learn.

## Permissions

The project's `.claude/settings.json` allowlist permits `pnpm`, `npx`, `git`, file ops, `curl` to localhost/ngrok/vercel, and `supabase`/`vercel` CLIs without prompting. It denies destructive operations (`rm -rf`, `--force` pushes, db resets, reading `.env*` files). If a command keeps prompting, either it's outside the allowlist (add it if it's safe) or it matches a deny rule (in which case stop and check with me).

## Key reference docs in this repo

- `docs/architecture.md` — system design, sequence diagram, ethics, disclaimer wording
- `docs/vapi-setup.md` — step-by-step Vapi dashboard configuration + tool JSON
- `docs/vapi-prompt-scaffold.md` — system prompt structure (sections to write yourself)
- `docs/red-flags.md` — clinical keyword reference for the detector
- `docs/demo-scenarios.md` — three rehearsed scripts for stage demo (create during build)
