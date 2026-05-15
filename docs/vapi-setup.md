# Vapi Dashboard Setup

The Vapi assistant is configured entirely through the [Vapi dashboard](https://dashboard.vapi.ai), not via API. Code only references the resulting `assistantId`. Steps below.

## 1. Create the assistant

Dashboard → **Assistants** → **Create Assistant** → Blank template.

Name it `triage-assistant-v1`.

## 2. Model

| Field | Value |
|---|---|
| Provider | OpenAI |
| Model | `gpt-4o-mini` *(fast, cheap, good enough for triage)* |
| Temperature | `0.3` *(deterministic clinical behavior)* |
| Max tokens | `500` *(short turns)* |
| System prompt | **paste from your prompt — see `docs/vapi-prompt-scaffold.md` for structure** |

> Optionally try `gpt-4o` if free credit allows — the reasoning is noticeably tighter on edge cases. Keep `gpt-4o-mini` as fallback.

## 3. Voice

| Field | Value |
|---|---|
| Provider | 11labs |
| Voice | `Sarah` *(or `Rachel`, `Jessica` — pick one neutral, calm, medical-sounding)* |
| Stability | `0.5` |
| Similarity boost | `0.75` |

For the Hindi toggle, the language is switched inside the system prompt based on the `{{language}}` variable. 11labs handles Hindi natively for some voices; if accuracy drops, swap to Azure for Hindi.

## 4. Transcriber

| Field | Value |
|---|---|
| Provider | Deepgram |
| Model | `nova-2-medical` *(domain-tuned, accurate on medical terms)* |
| Language | `en-IN` *(India-English accent handling)* |
| Smart format | on |
| Endpointing | 300ms |

## 5. First message

Paste verbatim:

```
Hi, I'm an AI triage assistant. I'll ask you a few questions about your symptoms to recommend the right level of care. Before we begin, please remember this is not a diagnostic tool and does not replace a doctor. What is the main reason you're reaching out today?
```

Set **First message mode** to `assistant-speaks-first`.

## 6. Server URL (the webhook)

| Field | Value |
|---|---|
| Server URL | `https://<your-deploy>.vercel.app/api/vapi/webhook` |
| Server URL Secret | Generate a random string. Save as `VAPI_WEBHOOK_SECRET` in `.env.local`. |

For local development with `ngrok`, set the URL to `https://<ngrok-id>.ngrok.io/api/vapi/webhook` and switch it back to Vercel before demo.

### Server events to enable

In the assistant's **Server Messages** section, enable:

- [x] `transcript` — needed for live admin dashboard
- [x] `function-call` — needed for tool calls
- [x] `status-update` — track call lifecycle
- [x] `end-of-call-report` — final session close
- [ ] `hang` — not needed
- [ ] `speech-update` — not needed (noisy)
- [ ] `conversation-update` — not needed (redundant with transcript)

## 7. Call settings

| Field | Value |
|---|---|
| Max duration | `600` seconds (10 min) |
| Silence timeout | `30` seconds |
| Background sound | `off` |
| Voicemail detection | `off` *(browser calls don't have voicemail)* |
| End call function enabled | `on` |
| End call phrases | `goodbye`, `thank you that's all`, `end the call`, `that will be all` |

## 8. Tools

Add two custom tools. In the dashboard: **Tools** → **Create Tool** → **Function**.

### Tool 1 — `log_symptom`

| Field | Value |
|---|---|
| Name | `log_symptom` |
| Description | Record a symptom the patient mentioned. Call this each time a distinct symptom is identified during the interview. Do not call for the same symptom twice. |
| Async | `true` *(don't block the conversation while it logs)* |
| Server URL | leave blank — inherits the assistant's server URL |

JSON schema for parameters:

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Symptom name in clinical English (e.g. 'chest pain', 'dyspnea', 'fever')."
    },
    "severity": {
      "type": "string",
      "enum": ["mild", "moderate", "severe"],
      "description": "Patient-reported severity."
    },
    "duration": {
      "type": "string",
      "description": "How long the patient has had this symptom (e.g. '2 days', '3 hours', 'since yesterday')."
    },
    "notes": {
      "type": "string",
      "description": "Clinically relevant detail (e.g. 'radiates to left arm', 'worse on exertion', 'with diaphoresis')."
    }
  },
  "required": ["name"]
}
```

### Tool 2 — `submit_triage_assessment`

| Field | Value |
|---|---|
| Name | `submit_triage_assessment` |
| Description | Submit the final triage classification. Call this exactly once at the end of the interview, after all symptoms have been logged. The response from this tool tells you the FINAL tier (which may differ from your submission due to server-side safety overrides). Read out the final tier to the patient. |
| Async | `false` *(must wait for server response with possible override)* |
| Server URL | leave blank |

JSON schema:

```json
{
  "type": "object",
  "properties": {
    "tier": {
      "type": "string",
      "enum": ["home", "clinic", "er"],
      "description": "Recommended care tier."
    },
    "chief_complaint": {
      "type": "string",
      "description": "Single-sentence summary of the primary issue."
    },
    "reasoning": {
      "type": "string",
      "description": "2-3 sentences explaining why this tier was chosen. Cite specific symptoms and any red flags."
    },
    "recommended_actions": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Bullet-list of next steps the patient should take."
    },
    "red_flags_present": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Any emergency indicators noted during the interview (e.g. 'chest pain with radiation', 'FAST positive')."
    }
  },
  "required": ["tier", "chief_complaint", "reasoning", "recommended_actions"]
}
```

The server may override the `tier` field. The assistant should be prompted (see scaffold) to read out the value returned by the tool, not the one it submitted.

## 9. Variable values (assistant overrides at call start)

The Web SDK passes runtime values per call. These are injected into the system prompt via `{{variable}}` placeholders.

Reserved variable names this app uses:

| Variable | Type | Used for |
|---|---|---|
| `sessionId` | string (uuid) | Joining webhook events to DB rows |
| `patientAge` | number | Contextualizing risk |
| `patientGender` | string | Contextualizing risk |
| `language` | string (`en` \| `hi`) | Switches assistant language |

Reference these in the system prompt with `{{sessionId}}`, `{{patientAge}}`, etc.

## 10. Get the credentials

After saving the assistant:

1. Copy the **Assistant ID** → `NEXT_PUBLIC_VAPI_ASSISTANT_ID`
2. Dashboard → **Account** → **API Keys** → copy **Public Key** → `NEXT_PUBLIC_VAPI_PUBLIC_KEY`
3. The webhook secret you set in step 6 → `VAPI_WEBHOOK_SECRET`

## 11. Test in the playground

Before wiring the Web SDK, use the **Test Call** button in the Vapi dashboard. Speak through your laptop mic, run all three demo scenarios (Home / Clinic / ER). Check:

- Both tools fire
- Server URL receives the webhook events (check Vercel logs or ngrok inspector)
- The override behavior works when you describe chest pain + radiation

If any of this fails, fix it in the dashboard before touching app code.

## 12. Commit a snapshot

After the assistant is stable, export its JSON config from the dashboard and commit to `docs/vapi-assistant-snapshot.json` so the repo has a reference of what was configured. This is for documentation only — the source of truth remains the dashboard.
