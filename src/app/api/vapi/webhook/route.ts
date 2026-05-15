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

// Check multiple paths Vapi uses to forward variable values
function extractSessionId(message: Record<string, unknown>): string | null {
  const call = message["call"] as Record<string, unknown> | undefined;

  // Path 1 (primary): variableValues set via vapi.start() assistantOverrides
  const overrides = call?.["assistantOverrides"] as Record<string, unknown> | undefined;
  const vars = overrides?.["variableValues"] as Record<string, unknown> | undefined;
  const id1 = vars?.["sessionId"];
  if (typeof id1 === "string" && id1.length > 0) return id1;

  // Path 2: call.metadata (some Vapi versions / tool-call events)
  const callMeta = call?.["metadata"] as Record<string, unknown> | undefined;
  const id2 = callMeta?.["sessionId"];
  if (typeof id2 === "string" && id2.length > 0) return id2;

  // Path 3: top-level message metadata
  const msgMeta = message["metadata"] as Record<string, unknown> | undefined;
  const id3 = msgMeta?.["sessionId"];
  if (typeof id3 === "string" && id3.length > 0) return id3;

  return null;
}

// ── Tool-call business logic ──────────────────────────────────────────────────

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

  await db
    .from("sessions")
    .update({
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
    })
    .eq("id", sessionId);

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

// Vapi sends conversation-update (not transcript) — full history on every turn.
// Sync strategy: delete existing rows and reinsert from the latest snapshot.
async function handleConversationUpdate(
  message: Record<string, unknown>,
  sessionId: string | null
): Promise<Response> {
  if (!sessionId) return missingSession();

  const conversation = message["conversation"] as
    | Array<{ role?: string; message?: string; content?: string }>
    | undefined;

  if (!Array.isArray(conversation) || conversation.length === 0) return ok();

  const turns = conversation.filter(
    (t) => t.role === "user" || t.role === "bot" || t.role === "assistant"
  );
  if (turns.length === 0) return ok();

  const db = getServiceClient();

  // Delete then reinsert — idempotent on retries; latest snapshot wins
  await db.from("transcripts").delete().eq("session_id", sessionId);
  await db.from("transcripts").insert(
    turns.map((turn) => ({
      session_id: sessionId,
      role:
        turn.role === "bot" || turn.role === "assistant"
          ? ("assistant" as const)
          : ("user" as const),
      content: turn.message ?? turn.content ?? "",
    }))
  );

  return ok();
}

// Handles legacy "function-call" events
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

// Handles new-style "tool-calls" events (OpenAI format).
// function.arguments is a JSON-encoded string.
async function handleToolCalls(
  message: Record<string, unknown>,
  sessionId: string | null
): Promise<Response> {
  const toolList = message["toolCallList"] as
    | Array<{
        id?: string;
        type?: string;
        function?: { name?: string; arguments?: string };
        name?: string;
        parameters?: Record<string, unknown>;
      }>
    | undefined;

  const toolCall = toolList?.[0];
  if (!toolCall) return ok();

  const name: string = toolCall.function?.name ?? toolCall.name ?? "";
  const toolCallId = toolCall.id ?? "";

  let params: Record<string, unknown> = {};
  const rawArgs = toolCall.function?.arguments;
  if (typeof rawArgs === "string" && rawArgs.trim()) {
    try {
      params = JSON.parse(rawArgs) as Record<string, unknown>;
    } catch {
      console.warn("[webhook:tool-calls] bad arguments JSON:", rawArgs.slice(0, 200));
    }
  } else if (toolCall.parameters && typeof toolCall.parameters === "object") {
    params = toolCall.parameters;
  }

  console.log(`[webhook:tool-calls] name=${name} id=${toolCallId} sid=${sessionId ?? "null"}`);

  // Always respond in Vapi's expected results format — even on error — so the
  // assistant doesn't hang on "No result returned".
  if (name === "log_symptom") {
    if (!sessionId) {
      console.warn("[webhook:tool-calls] no sessionId for log_symptom");
      return Response.json({ results: [{ toolCallId, name, result: "ok" }] });
    }
    await handleLogSymptom(params, sessionId);
    return Response.json({ results: [{ toolCallId, name, result: "ok" }] });
  }

  if (name === "submit_triage_assessment") {
    if (!sessionId) {
      console.warn("[webhook:tool-calls] no sessionId for submit_triage_assessment");
      // Return the LLM's own tier so it can continue the call
      const fallbackTier = (params["tier"] as string | undefined) ?? "home";
      return Response.json({ results: [{ toolCallId, name, result: fallbackTier }] });
    }
    const finalTier = await handleSubmitTriage(params, sessionId);
    return Response.json({ results: [{ toolCallId, name, result: finalTier }] });
  }

  console.log(`[webhook:tool-calls] unknown tool "${name}" — ignoring`);
  return ok();
}

async function handleStatusUpdate(
  message: Record<string, unknown>,
  sessionId: string | null
): Promise<Response> {
  if (!sessionId) return missingSession();

  const vapiStatus = message["status"] as string | undefined;
  const dbStatus =
    vapiStatus === "ended"
      ? "complete"
      : vapiStatus === "in-progress"
      ? "active"
      : "active";

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

  // Extract conversation turns from artifact.messages or top-level messages
  const artifact = message["artifact"] as Record<string, unknown> | undefined;
  const rawMessages =
    (artifact?.["messages"] as unknown[] | undefined) ??
    (message["messages"] as unknown[] | undefined) ??
    [];

  type VapiMsg = { role?: string; message?: string; content?: string };
  const turns = (rawMessages as VapiMsg[]).filter(
    (t) => t.role === "user" || t.role === "bot" || t.role === "assistant"
  );

  const db = getServiceClient();

  // Persist transcript: overwrite any partial conversation-update rows with the
  // authoritative full transcript from the end-of-call report
  if (turns.length > 0) {
    await db.from("transcripts").delete().eq("session_id", sessionId);
    await db.from("transcripts").insert(
      turns.map((turn) => ({
        session_id: sessionId,
        role:
          turn.role === "bot" || turn.role === "assistant"
            ? ("assistant" as const)
            : ("user" as const),
        content: turn.message ?? turn.content ?? "",
      }))
    );
    console.log(`[webhook:end-of-call] wrote ${turns.length} transcript rows for ${sessionId}`);
  }

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

  const secret = process.env["VAPI_WEBHOOK_SECRET"] ?? "";
  if (secret) {
    const sig = request.headers.get("x-vapi-signature");
    if (!verifyVapiSignature(rawBody, sig, secret)) {
      return Response.json({ ok: false, reason: "invalid signature" }, { status: 401 });
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

  console.log(`[webhook] type=${type} sid=${sessionId ?? "null"}`);

  switch (type) {
    case "transcript":
      return handleTranscript(message, sessionId);
    case "conversation-update":
      return handleConversationUpdate(message, sessionId);
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
