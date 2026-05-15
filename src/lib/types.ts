// ── Shared types ──────────────────────────────────────────────────────────────

export type CareTier = "home" | "clinic" | "er";

export type RedFlagCategory =
  | "cardiac"
  | "stroke"
  | "respiratory"
  | "anaphylaxis"
  | "hemorrhage"
  | "neuro"
  | "psych"
  | "sepsis"
  | "obstetric";

// ── Supabase row types (mirror 0001_init.sql) ─────────────────────────────────

export interface Session {
  id: string;
  vapi_call_id: string | null;
  status: "active" | "complete" | "failed";
  patient_age: number | null;
  patient_gender: "male" | "female" | "other" | "undisclosed" | null;
  language: "en" | "hi";
  chief_complaint: string | null;
  final_tier: CareTier | null;
  reasoning: string | null;
  recommended_actions: string[] | null;
  red_flag_triggered: boolean;
  red_flag_categories: RedFlagCategory[] | null;
  duration_seconds: number | null;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export interface Transcript {
  id: number;
  session_id: string;
  role: "assistant" | "user";
  content: string;
  created_at: string;
}

export interface Symptom {
  id: number;
  session_id: string;
  name: string;
  severity: "mild" | "moderate" | "severe" | null;
  duration: string | null;
  notes: string | null;
  created_at: string;
}

export interface AuditLogEntry {
  id: number;
  session_id: string | null;
  event_type: "red_flag_override" | "admin_review" | "error";
  details: Record<string, unknown> | null;
  created_at: string;
}

// ── Vapi message types (narrowed — only what we care about) ───────────────────

export interface VapiTranscriptMessage {
  type: "transcript";
  transcriptType: "partial" | "final";
  role: "assistant" | "user";
  transcript: string;
  call: VapiCallContext;
}

export interface VapiFunctionCallMessage {
  type: "function-call";
  call: VapiCallContext;
  functionCall: {
    name: string;
    parameters: Record<string, unknown>;
  };
}

export interface VapiStatusUpdateMessage {
  type: "status-update";
  status: string;
  call: VapiCallContext;
}

export interface VapiEndOfCallReportMessage {
  type: "end-of-call-report";
  durationSeconds: number;
  endedAt: string;
  call: VapiCallContext;
}

export interface VapiCallContext {
  id: string;
  assistantOverrides?: {
    variableValues?: {
      sessionId?: string;
      patientAge?: number;
      patientGender?: string;
      language?: string;
    };
  };
}

export type VapiServerMessage =
  | VapiTranscriptMessage
  | VapiFunctionCallMessage
  | VapiStatusUpdateMessage
  | VapiEndOfCallReportMessage;

// ── Patient UI types ──────────────────────────────────────────────────────────

export type RiskLevel = "low" | "medium" | "high" | "er";

export interface SymptomEntry {
  name: string;
  severity: string;
  duration?: string;
}

export interface SubmitTriageAssessmentPayload {
  tier: CareTier;
  chief_complaint?: string;
  reasoning?: string;
  recommended_actions: string[];
  red_flag_triggered?: boolean;
}

export interface TranscriptEntry {
  role: "user" | "assistant";
  text: string;
  ts: number;
}
