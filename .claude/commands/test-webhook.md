---
description: Test the /api/vapi/webhook endpoint locally with sample payloads for each event type. Verifies that the webhook signature check, switch-case routing, and Supabase writes all work end-to-end before connecting Vapi.
---

Send sample Vapi webhook payloads to the local dev server and report what happened. Assume the dev server is already running on `http://localhost:3000`. If it isn't, tell me to start it — do not start it yourself (I want control of that process).

For each payload below, send a POST and report: HTTP status, response body, and whether a row appeared in the relevant Supabase table.

The signature header is `x-vapi-signature` — compute it as HMAC-SHA256 of the raw body using `VAPI_WEBHOOK_SECRET` from `.env.local`. If signature verification isn't implemented yet, send a placeholder header and note that.

Use a fixed test session ID: `00000000-0000-0000-0000-000000000001`. Create the session row first via:
```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"id":"00000000-0000-0000-0000-000000000001","language":"en"}'
```

Then send these four payloads in order:

### 1. `transcript` event
```json
{
  "message": {
    "type": "transcript",
    "transcriptType": "final",
    "role": "user",
    "transcript": "I have crushing chest pain that started 20 minutes ago.",
    "call": {
      "assistantOverrides": {
        "variableValues": { "sessionId": "00000000-0000-0000-0000-000000000001" }
      }
    }
  }
}
```
Expect: 200 OK, row in `transcripts` with role=user.

### 2. `function-call` log_symptom
```json
{
  "message": {
    "type": "function-call",
    "functionCall": {
      "name": "log_symptom",
      "parameters": {
        "name": "chest pain",
        "severity": "severe",
        "duration": "20 minutes",
        "notes": "radiates to left arm, with diaphoresis"
      }
    },
    "call": {
      "assistantOverrides": {
        "variableValues": { "sessionId": "00000000-0000-0000-0000-000000000001" }
      }
    }
  }
}
```
Expect: 200 OK with `{ "result": "ok" }`, row in `symptoms`.

### 3. `function-call` submit_triage_assessment (should trigger red-flag override)
```json
{
  "message": {
    "type": "function-call",
    "functionCall": {
      "name": "submit_triage_assessment",
      "parameters": {
        "tier": "clinic",
        "chief_complaint": "Chest pain with arm radiation",
        "reasoning": "Patient reports chest pain radiating to left arm with sweating, duration 20 minutes.",
        "recommended_actions": ["See a doctor within 24 hours"],
        "red_flags_present": []
      }
    },
    "call": {
      "assistantOverrides": {
        "variableValues": { "sessionId": "00000000-0000-0000-0000-000000000001" }
      }
    }
  }
}
```
Expect: 200 OK with `{ "result": "er" }` (override fired), `sessions.final_tier = 'er'`, `sessions.red_flag_triggered = true`, audit_log row with `event_type = 'red_flag_override'`.

### 4. `end-of-call-report`
```json
{
  "message": {
    "type": "end-of-call-report",
    "endedReason": "assistant-ended-call",
    "durationSeconds": 187,
    "call": {
      "assistantOverrides": {
        "variableValues": { "sessionId": "00000000-0000-0000-0000-000000000001" }
      }
    }
  }
}
```
Expect: 200 OK, `sessions.status = 'complete'`, `sessions.duration_seconds = 187`.

### After all four

Run the cleanup:
```bash
# Delete the test session and cascading rows
curl -X DELETE http://localhost:3000/api/sessions/00000000-0000-0000-0000-000000000001
```
(If no DELETE endpoint exists, just delete in Supabase SQL editor — note this in the report.)

Final report: pass/fail per step, any unexpected behavior, suggested fixes for any failures.
