# PreCare — AI Voice Triage Assistant

> A browser-native AI healthcare triage assistant. Speak your symptoms, get an instant care-tier recommendation — Home Care, Clinic Visit, or Emergency Room — backed by a server-side red-flag safety layer the LLM cannot bypass.

Built for the **BMSIT AI Fusion Challenge** (Problem Statement 2: AI Triage Assistant for Doctor Shortage Crisis).

**⚠️ Medical disclaimer:** This is an AI triage assistant, not a diagnostic tool. It does not replace a licensed medical professional. If you believe you are experiencing a medical emergency, call **108** immediately.

---

## Live demo

| | |
|---|---|
| Patient app | `https://precare-lyart.vercel.app` |
| Admin dashboard | `https://precare-lyart.vercel.app/admin/login` |
| My Sessions | `https://precare-lyart.vercel.app/my-sessions` |

---

## What it does

A patient opens the app, accepts a medical disclaimer, and clicks **Start Triage**. An AI voice assistant named **Asha** conducts a structured symptom interview in the browser — no phone number, no app download. At the end of the call, a care tier is shown:

| Tier | Meaning |
|---|---|
| 🟢 Home Care | Minor, self-limiting symptoms — rest, fluids, watch-outs |
| 🟡 Clinic Visit | Moderate symptoms — see a GP within 24–72 hours |
| 🔴 Emergency Room | Red-flag symptoms — call 108, do not wait |

The final tier is checked by a **server-side red-flag detector** before being shown. If the AI under-triages a known emergency presentation, the server overrides it to ER and logs an audit event. The LLM cannot bypass this.

---

## Routes

| Route | Auth | Description |
|---|---|---|
| `/` | public | Animated landing page |
| `/triage` | public | Patient flow: disclaimer → voice call → live transcript → classification |
| `/my-sessions` | optional | Patient session history; auth required to view |
| `/my-sessions/[id]` | required | Session detail: tier, reasoning, symptoms, transcript |
| `/admin/login` | public | Staff login (Supabase magic link) |
| `/admin` | staff | Live queue, sessions table, tier analytics |
| `/admin/[id]` | staff | Full session detail with audit log and realtime transcript |
| `/api/vapi/webhook` | signature | Receives all Vapi server events |
| `/api/sessions` | public | POST — creates a session row before call start |
| `/api/auth/signup` | public | Server-side user creation (bypasses email confirmation) |

---

## Architecture

```
Browser ──[Vapi Web SDK]──→  Vapi Cloud (STT + LLM + TTS)
   │                              │
   │ client-side events           │ server webhook events
   ▼                              ▼
Patient UI               /api/vapi/webhook
  · transcript                 ├─ transcript → DB
  · symptom cards              ├─ log_symptom tool → symptoms table
  · risk meter                 ├─ submit_triage_assessment tool
  · tier card                  │     └─ red-flag detector → sessions table
                               ├─ status-update → sessions.status
                               └─ end-of-call-report → sessions.ended_at

Admin UI ←──[Supabase Realtime]──────────────────────── Supabase DB
```

### Red-flag override (safety layer)

When `submit_triage_assessment` fires, the webhook:

1. Fetches the full transcript from the database
2. Runs it through the keyword detector in `src/lib/red-flags.ts`
3. Checks 9 clinical categories: cardiac, stroke, respiratory, anaphylaxis, hemorrhage, neurological, psychiatric, sepsis, obstetric
4. Handles negation — "no chest pain" is not flagged
5. If any flag matches **and** the AI submitted `home` or `clinic`, overrides to `er`
6. Writes an `audit_log` row with `event_type = "red_flag_override"`, the original tier, matched categories, and a transcript excerpt

This logic is server-only TypeScript. The LLM result is discarded if it contradicts the override.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Voice | `@vapi-ai/web` — browser Web SDK, no telephony |
| Database | Supabase (Postgres + Realtime + Auth) |
| ORM | `@supabase/ssr` + typed client |
| Hosting | Vercel |
| Package manager | pnpm |

---

## Key features

### Patient side
- **Voice triage** — browser mic, no phone number required; works on desktop and mobile
- **Live transcript** — scrolling conversation as it happens
- **Symptom cards** — extracted via `log_symptom` tool call during the call
- **Risk meter** — real-time risk indicator that updates during the interview
- **Classification card** — final tier with reasoning and recommended actions
- **Session history** — sign in to review all past triage calls at `/my-sessions`
- **Session detail** — transcript replay, symptom chips, reasoning, and red-flag notice
- **Medication reminders** — slide-in panel to manage medication times (signed-in users)
- **Multilingual** — English and Hindi (same assistant, language passed at call start)

### Admin side
- **Live queue** — new sessions appear instantly via Supabase Realtime
- **Sessions table** — sortable, filterable list of all calls with tier badges
- **Tier analytics** — donut chart breakdown of home/clinic/er distribution
- **Session detail** — full transcript, symptom log, reasoning, red-flag audit entries
- **Active calls banner** — shows how many calls are currently in progress

---

## Data model

Four tables in `supabase/migrations/0001_init.sql`:

| Table | Description |
|---|---|
| `sessions` | One row per call — status, tier, chief complaint, reasoning, red_flag_triggered |
| `transcripts` | Utterances per session (role + content) — synced from conversation-update and end-of-call-report |
| `symptoms` | Extracted symptoms per session — name, severity, duration, notes |
| `audit_log` | Red-flag override events — original tier, matched categories, transcript excerpt |

Realtime is enabled on `sessions`, `transcripts`, and `symptoms`.

---

## Setup

### Prerequisites

- Node.js 20+
- pnpm (`npm i -g pnpm`)
- A [Vapi](https://vapi.ai) account
- A [Supabase](https://supabase.com) project

### 1 — Clone and install

```bash
git clone <repo-url>
cd PreCare
pnpm install
```

### 2 — Environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # server-only, never in browser

# Vapi
NEXT_PUBLIC_VAPI_PUBLIC_KEY=<vapi-public-key>
NEXT_PUBLIC_VAPI_ASSISTANT_ID=<assistant-id>
VAPI_WEBHOOK_SECRET=<webhook-signing-secret>

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3 — Run the database migration

In the Supabase SQL editor, paste and run:

```
supabase/migrations/0001_init.sql
```

This creates all four tables and enables Realtime on them.

### 4 — Configure the Vapi assistant

Follow [docs/vapi-setup.md](docs/vapi-setup.md) to create the assistant in the Vapi dashboard. The assistant ID and public key go into `.env.local`.

Two tools must be configured in the dashboard: `log_symptom` and `submit_triage_assessment`. Their JSON schemas are in the setup guide.

### 5 — Run locally

```bash
pnpm dev
```

### 6 — Expose the webhook for local testing

Vapi needs a public URL to send events to. Use ngrok or any tunnel:

```bash
ngrok http 3000
```

Set the Vapi assistant's **Server URL** to:
```
https://<ngrok-id>.ngrok.io/api/vapi/webhook
```

### 7 — Test

Open `http://localhost:3000`, start a triage, and watch Supabase tables populate in real time.

To verify the webhook and red-flag override without a live call, run:
```bash
# (in a separate terminal with the dev server running)
# See .claude/commands/test-webhook.md for the full curl payloads
```

---

## Project structure

```
src/
├── app/
│   ├── page.tsx                      # Landing page (animated)
│   ├── triage/page.tsx               # Patient triage flow
│   ├── my-sessions/
│   │   ├── page.tsx                  # Session history (auth-gated)
│   │   └── [id]/page.tsx             # Session detail
│   ├── admin/
│   │   ├── login/page.tsx
│   │   ├── page.tsx                  # Live dashboard
│   │   └── [id]/page.tsx             # Admin session detail
│   └── api/
│       ├── vapi/webhook/route.ts     # Vapi event handler + red-flag override
│       ├── sessions/route.ts         # Session creation
│       └── auth/signup/route.ts      # Server-side user creation
├── components/
│   ├── patient/                      # Triage UI components
│   ├── admin/                        # Dashboard components
│   └── landing/                      # Animated landing page components
├── hooks/
│   ├── useVapiCall.ts                # Vapi Web SDK wrapper
│   ├── usePatientProfile.ts          # Auth + patient profile state
│   ├── useSessionRealtime.ts         # Supabase Realtime subscription
│   └── useReminders.ts              # Medication reminder state
└── lib/
    ├── red-flags.ts                  # Server-side red-flag detector
    ├── webhook-verify.ts             # HMAC-SHA256 signature verification
    ├── supabase-client.ts            # Browser Supabase client (anon key)
    ├── supabase-server.ts            # Server Supabase client (service role)
    └── types.ts                      # Shared TypeScript types
```

---

## Security and privacy

| Concern | Approach |
|---|---|
| Server secrets | `SUPABASE_SERVICE_ROLE_KEY` and `VAPI_WEBHOOK_SECRET` are server-only; never imported into client code |
| Webhook authenticity | Every incoming Vapi event is verified against HMAC-SHA256 before processing |
| Patient data | No PII required — age and gender are optional self-reported fields |
| Session access | Patient session pages redirect to sign-in; admin pages require staff auth |
| Red-flag override | Server-side TypeScript; the LLM output is overridden if it contradicts safety rules |
| Audit trail | Every override is logged in `audit_log` with the original tier and matched categories |

> **Hackathon note:** RLS policies are not enforced on all tables (service role is used server-side). A production deployment would require per-row RLS, HIPAA / local data-residency compliance review, and a clinical advisory board sign-off.

---

## License

MIT
