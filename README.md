# AI Triage Assistant

> An AI-powered healthcare triage assistant that conducts a spoken interview in the browser and classifies cases into Home Care, Clinic Visit, or Emergency Room — with a server-side red-flag override layer for safety.

Built for the BMSIT AI Fusion Challenge (Problem Statement 2: AI Triage Assistant for Doctor Shortage Crisis).

⚠️ **This is a triage assistant, not a diagnostic tool. It is not a replacement for a licensed medical professional.** See the disclaimer page in the app.

---

## Live demo

- App: `https://<your-vercel-url>`
- Admin login: `https://<your-vercel-url>/admin/login` (request access)
- Demo video: `<youtube-link>`

## What's inside

- **Patient interface** at `/` — anonymous, accepts a disclaimer, starts a voice call in the browser, shows a live transcript + extracted symptoms + final classification
- **Admin dashboard** at `/admin` — auth-gated, shows live and historical sessions with full transcripts, reasoning, and a red-flag audit log
- **Browser-native voice** via Vapi Web SDK — no phone number, no telephony, works on any modern browser with mic access
- **Hard-coded red-flag override** — server-side detector that escalates known emergency presentations to the ER tier regardless of LLM output

## Architecture

See [docs/architecture.md](docs/architecture.md) for the full system diagram, data flow, and ethics notes.

```
Browser ──[Vapi Web SDK]──→ Vapi Cloud (STT + LLM + TTS + tools)
   │                            │
   │ client events              │ server webhook
   ▼                            ▼
Patient UI                 /api/vapi/webhook ──→ Supabase
                                                    │
Admin UI ←──[Supabase Realtime]──────────────────────┘
```

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Voice | Vapi Web SDK (`@vapi-ai/web`) |
| Database | Supabase (Postgres + Realtime + Auth) |
| Hosting | Vercel |

## Setup

### Prerequisites

- Node 20+
- A Vapi account ([vapi.ai](https://vapi.ai))
- A Supabase project ([supabase.com](https://supabase.com))

### Steps

1. Clone and install:
   ```bash
   git clone <repo-url>
   cd ai-triage
   pnpm install
   ```

2. Copy `.env.example` to `.env.local` and fill in values (see comments inside).

3. Run the Supabase migration:
   ```bash
   # In the Supabase SQL editor, paste and run:
   # supabase/migrations/0001_init.sql
   ```

4. Configure the Vapi assistant in the Vapi dashboard following [docs/vapi-setup.md](docs/vapi-setup.md). Paste your `assistantId` and public key into `.env.local`.

5. Run locally:
   ```bash
   pnpm dev
   ```

6. Expose the webhook for local testing (Vapi needs a public URL):
   ```bash
   ngrok http 3000
   # Set the Vapi assistant's server URL to https://<ngrok-id>.ngrok.io/api/vapi/webhook
   ```

7. Open `http://localhost:3000`, accept the disclaimer, click **Start Triage Call**.

## Ethics, privacy, safety

- All sessions logged for audit; transcripts retained for review
- Red-flag override is server-side and cannot be bypassed by the model
- Disclaimer shown before every call and on the final classification card
- No PII required from patients; age and gender are optional self-reported fields
- Service role keys are server-only; never exposed to the browser
- This is a hackathon prototype. Production deployment would require RLS policies, HIPAA/local compliance review, and a clinical advisory board.

## License

MIT
