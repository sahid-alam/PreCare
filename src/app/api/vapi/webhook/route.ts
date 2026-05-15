import { getServiceClient } from "@/lib/supabase-server";
import { verifyVapiSignature } from "@/lib/webhook-verify";
import { detectRedFlags } from "@/lib/red-flags";
import type { CareTier, RedFlagCategory } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function ok(body: Record<string, unknown> = { ok: true }): Response {
  return Response.json(body);
}

function missingSession(): Response {
  console.warn("[webhook] event received with no sessionId — ignoring");
  return Response.json({ ok: false, reason: "no session id" });
}

function extractSessionId(message: Record<string, unknown>): string | null {
  const call = message["call"] as Record<string, unknown> | undefined;
  const overrides = call?.["assistantOverrides"] as
    | Record<string, unknown>
    | undefined;
  const vars = overrides?.["variableValues"] as
    | Record<string, unknown>
    | undefined;
  const id = vars?.["sessionId"];
  return typeof id === "string" && id.length > 0 ? id : null;
}

// ── Tool-call business logic (shared between function-call + tool-calls) ──────

async function handleLogSymptom(
  params: Record<string, unknown>,
  sessionId: string
): Promise<void> {
  const db = getServiceClient();
  await db.from("symptoms").insert({
    session_id: sessionId,
    name: String(params["name"] ?? ""),
    severity:
      params["severity"] === "mild" ||
      params["severity"] === "moderate" ||
      params["severity"] === "severe"
        ? params["severity"]
        : null,
    duration:
      typeof params["duration"] === "string" ? params["duration"] : null,
    notes: typeof params["notes"] === "string" ? params["notes"] : null,
  });
}

async function handleSubmitTriage(
  params: Record<string, unknown>,
  sessionId: string
): Promise<CareTier> {
  const db = getServiceClient();

  // Idempotency: if already classified, return existing tier
  const { data: existing } = await db
    .from("sessions")
    .select("final_tier")
    .eq("id", sessionId)
    .single();

  if (existing?.final_tier) {
    return existing.final_tier as CareTier;
  }

  // Fetch full transcript for red-flag detection
  const { data: rows } = await db
    .from("transcripts")
    .select("content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  const fullTranscript = (rows ?? []).map((r) => r.content).join(" ");
  const matched: RedFlagCategory[] = detectRedFlags(fullTranscript);

  const submittedTier = (params["tier"] as string | undefined) ?? "home";
  const isEscalatable = submittedTier === "home" || submittedTier === "clinic";
  const shouldOverride = matched.length > 0 && isEscalatable;
  const finalTier: CareTier = shouldOverride ? "er" : (submittedTier as CareTier);

  const recommendedActions =
    Array.isArray(params["recommended_actions"])
      ? (params["recommended_actions"] as string[])
      : null;

  await db.from("sessions").update({
    final_tier: finalTier,
    chief_complaint:
      typeof params["chief_complaint"] === "string"
        ? params["chief_complaint"]
        : null,
    reasoning:
      typeof params["reasoning"] === "string" ? params["reasoning"] : null,
    recommended_actions: recommendedActions,
    red_flag_triggered: shouldOverride,
    red_flag_categories: matched.length > 0 ? matched : null,
  }).eq("id", sessionId);

  if (shouldOverride) {
    await db.from("audit_log").insert({
      session_id: sessionId,
      event_type: "red_flag_override",
      details: {
        original_tier: submittedTier,
        matched_categories: matched,
        transcript_excerpt: fullTranscript.slice(0, 500),
      },
    });
  }

  return finalTier;
}

// ── Event handlers ────────────────────────────────────────────────────────────

async function handleTranscript(
  message: Record<string, unknown>,
  sessionId: string | null
): Promise<Response> {
  if (message["transcriptType"] !== "final") return ok();
  if (!sessionId) return missingSession();

  const db = getServiceClient();
  await db.from("transcripts").insert({
    session_id: sessionId,
    role:
      message["role"] === "assistant" || message["role"] === "user"
        ? message["role"]
        : "user",
    content: String(message["transcript"] ?? ""),
  });

  return ok();
}

// Handles old-style "function-call" event (Vapi legacy + still in serverMessages)
async function handleFunctionCall(
  message: Record<string, unknown>,
  sessionId: string | null
): Promise<Response> {
  const fc = message["functionCall"] as
    | { name?: string; parameters?: Record<string, unknown> }
    | undefined;
  if (!fc) return ok();

  const name = fc.name ?? "";
  const params = fc.parameters ?? {};

  if (name === "log_symptom") {
    if (!sessionId) return missingSession();
    await handleLogSymptom(params, sessionId);
    return Response.json({ result: "ok" });
  }

  if (name === "submit_triage_assessment") {
    if (!sessionId) return missingSession();
    const finalTier = await handleSubmitTriage(params, sessionId);
    return Response.json({ result: finalTier });
  }

  return ok();
}

// Handles new-style "tool-calls" event
async function handleToolCalls(
  message: Record<string, unknown>,
  sessionId: string | null
): Promise<Response> {
  const toolList = message["toolCallList"] as
    | Array<{ id?: string; name?: string; parameters?: Record<string, unknown> }>
    | undefined;

  const toolCall = toolList?.[0];
  if (!toolCall) return ok();

  const name = toolCall.name ?? "";
  const params = toolCall.parameters ?? {};
  const toolCallId = toolCall.id ?? "";

  let result: string;

  if (name === "log_symptom") {
    if (!sessionId) return missingSession();
    await handleLogSymptom(params, sessionId);
    result = "ok";
  } else if (name === "submit_triage_assessment") {
    if (!sessionId) return missingSession();
    result = await handleSubmitTriage(params, sessionId);
  } else {
    return ok();
  }

  return Response.json({
    results: [{ name, toolCallId, result }],
  });
}

async function handleStatusUpdate(
  message: Record<string, unknown>,
  sessionId: string | null
): Promise<Response> {
  if (!sessionId) return missingSession();

  const vapiStatus = message["status"] as string | undefined;
  // Map Vapi statuses → our enum: in-progress → active, ended → complete, else active
  const dbStatus =
    vapiStatus === "ended" ? "complete" :
    vapiStatus === "in-progress" ? "active" : "active";

  const db = getServiceClient();
  await db.from("sessions").update({ status: dbStatus }).eq("id", sessionId);

  return ok();
}

async function handleEndOfCall(
  message: Record<string, unknown>,
  sessionId: string | null
): Promise<Response> {
  if (!sessionId) return missingSession();

  const durationSeconds =
    typeof message["durationSeconds"] === "number"
      ? message["durationSeconds"]
      : null;

  const db = getServiceClient();
  // Idempotent: only update if not already complete
  await db
    .from("sessions")
    .update({
      status: "complete",
      duration_seconds: durationSeconds,
      ended_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .neq("status", "complete");

  return ok();
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();

  // Signature verification — skipped when no secret is configured
  const secret = process.env["VAPI_WEBHOOK_SECRET"] ?? "";
  if (secret) {
    const sig = request.headers.get("x-vapi-signature");
    if (!verifyVapiSignature(rawBody, sig, secret)) {
      return Response.json(
        { ok: false, reason: "invalid signature" },
        { status: 401 }
      );
    }
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return Response.json({ ok: false, reason: "invalid json" }, { status: 400 });
  }

  const message = (parsed as { message?: unknown })["message"] as
    | Record<string, unknown>
    | undefined;

  if (!message) return ok();

  const type = message["type"] as string | undefined;
  const sessionId = extractSessionId(message);

  switch (type) {
    case "transcript":
      return handleTranscript(message, sessionId);
    case "function-call":
      return handleFunctionCall(message, sessionId);
    case "tool-calls":
      return handleToolCalls(message, sessionId);
    case "status-update":
      return handleStatusUpdate(message, sessionId);
    case "end-of-call-report":
      return handleEndOfCall(message, sessionId);
    default:
      return ok();
  }
}
