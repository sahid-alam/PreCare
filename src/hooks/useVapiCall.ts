"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import type {
  CareTier,
  RiskLevel,
  SymptomEntry,
  SubmitTriageAssessmentPayload,
  TranscriptEntry,
  PatientProfile,
  AppLanguage,
} from "@/lib/types";

export type CallStatus = "idle" | "connecting" | "active" | "ended" | "error";

export interface VapiCallState {
  status: CallStatus;
  isMuted: boolean;
  transcript: TranscriptEntry[];
  symptoms: SymptomEntry[];
  riskLevel: RiskLevel | null;
  classification: SubmitTriageAssessmentPayload | null;
  sessionId: string | null;
  startCall: (lang: AppLanguage, profile?: PatientProfile, patientId?: string | null) => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  error: string | null;
}

export function useVapiCall(): VapiCallState {
  const vapiRef = useRef<Vapi | null>(null);
  const [status, setStatus] = useState<CallStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [riskLevel, setRiskLevel] = useState<RiskLevel | null>(null);
  const [classification, setClassification] =
    useState<SubmitTriageAssessmentPayload | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      vapiRef.current?.stop();
    };
  }, []);

  const startCall = useCallback(async (lang: AppLanguage, profile?: PatientProfile, patientId?: string | null) => {
    setStatus("connecting");
    setError(null);
    setTranscript([]);
    setSymptoms([]);
    setRiskLevel(null);
    setClassification(null);

    let sid: string;
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: lang,
          patient_id: patientId ?? undefined,
          patient_age: profile?.age ?? undefined,
          patient_gender: profile?.gender ?? undefined,
        }),
      });
      const data = (await res.json()) as { sessionId?: string };
      if (!data.sessionId) throw new Error("No session ID returned");
      sid = data.sessionId;
      setSessionId(sid);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Failed to create session");
      return;
    }

    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ?? "");
    vapiRef.current = vapi;

    vapi.on("call-start", () => setStatus("active"));
    vapi.on("call-end", () => {
      setStatus("ended");
      // Reconcile with server — red-flag override may have changed the tier
      void fetch(`/api/sessions/${sid}`)
        .then((r) => r.ok ? r.json() : null)
        .then((session: { final_tier?: string; red_flag_triggered?: boolean } | null) => {
          if (!session?.final_tier) return;
          const serverTier = session.final_tier as CareTier;
          setClassification((prev) =>
            prev && prev.tier !== serverTier
              ? { ...prev, tier: serverTier, red_flag_triggered: session.red_flag_triggered ?? false }
              : prev
          );
          const tierToRisk: Record<CareTier, RiskLevel> = { home: "low", clinic: "medium", er: "er" };
          setRiskLevel(tierToRisk[serverTier]);
        })
        .catch(() => undefined);
    });
    vapi.on("error", (e: unknown) => {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Call error");
    });

    vapi.on("message", (msg: Record<string, unknown>) => {
      if (msg["type"] === "transcript") {
        if (msg["transcriptType"] !== "final") return;
        const role =
          msg["role"] === "assistant" ? "assistant" : "user";
        const text = String(msg["transcript"] ?? "");
        setTranscript((prev) => [...prev, { role, text, ts: Date.now() }]);
        return;
      }

      let name: string | undefined;
      let params: Record<string, unknown> = {};

      if (msg["type"] === "tool-calls") {
        const list = msg["toolCallList"] as
          | Array<Record<string, unknown>>
          | undefined;
        const item = list?.[0];
        if (!item) return;
        const fn = item["function"] as Record<string, unknown> | undefined;
        name =
          typeof item["name"] === "string"
            ? item["name"]
            : typeof fn?.["name"] === "string"
            ? (fn["name"] as string)
            : undefined;
        const rawArgs = item["parameters"] ?? fn?.["arguments"];
        if (typeof rawArgs === "string") {
          try {
            params = JSON.parse(rawArgs) as Record<string, unknown>;
          } catch { /* malformed args */ }
        } else if (rawArgs && typeof rawArgs === "object") {
          params = rawArgs as Record<string, unknown>;
        }
      } else if (msg["type"] === "function-call") {
        const fc = msg["functionCall"] as
          | { name?: string; parameters?: Record<string, unknown> }
          | undefined;
        name = fc?.name;
        params = fc?.parameters ?? {};
      }

      if (!name) return;

      if (name === "log_symptom") {
        setSymptoms((prev) => [
          ...prev,
          {
            name: String(params["name"] ?? ""),
            severity: String(params["severity"] ?? "unknown"),
            duration:
              typeof params["duration"] === "string"
                ? params["duration"]
                : undefined,
          },
        ]);
      } else if (name === "update_risk_score") {
        const level = String(params["level"] ?? "");
        if (
          level === "low" ||
          level === "medium" ||
          level === "high" ||
          level === "er"
        ) {
          setRiskLevel(level as RiskLevel);
        }
      } else if (name === "submit_triage_assessment") {
        const tier = String(params["tier"] ?? "home") as CareTier;
        setClassification({
          tier,
          chief_complaint:
            typeof params["chief_complaint"] === "string"
              ? params["chief_complaint"]
              : undefined,
          reasoning:
            typeof params["reasoning"] === "string"
              ? params["reasoning"]
              : undefined,
          recommended_actions: Array.isArray(params["recommended_actions"])
            ? (params["recommended_actions"] as string[])
            : [],
          red_flag_triggered: params["red_flag_triggered"] === true,
        });
        const tierToRisk: Record<CareTier, RiskLevel> = {
          home: "low",
          clinic: "medium",
          er: "er",
        };
        setRiskLevel(tierToRisk[tier]);
      }
    });

    try {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID, {
        variableValues: {
          sessionId: sid,
          language: lang,
          age: String(profile?.age ?? ""),
          gender: profile?.gender ?? "",
          conditions: profile?.knownConditions.join(", ") || "none reported",
          medications: profile?.currentMedications || "none reported",
          allergies: profile?.knownAllergies || "none reported",
          last_bp: profile?.lastBp || "not provided",
          blood_sugar: profile?.bloodSugar || "not provided",
        },
      });
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Failed to start call");
    }
  }, []);

  const endCall = useCallback(() => {
    vapiRef.current?.stop();
  }, []);

  const toggleMute = useCallback(() => {
    if (!vapiRef.current) return;
    const next = !isMuted;
    vapiRef.current.setMuted(next);
    setIsMuted(next);
  }, [isMuted]);

  return {
    status,
    isMuted,
    transcript,
    symptoms,
    riskLevel,
    classification,
    sessionId,
    startCall,
    endCall,
    toggleMute,
    error,
  };
}
