"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import type { Session, Transcript, Symptom, AuditLogEntry } from "@/lib/types";

interface InitialData {
  session: Session | null;
  transcripts: Transcript[];
  symptoms: Symptom[];
  auditLog: AuditLogEntry[];
}

export interface SessionRealtimeState {
  session: Session | null;
  transcripts: Transcript[];
  symptoms: Symptom[];
  auditLog: AuditLogEntry[];
}

export function useSessionRealtime(
  sessionId: string,
  initial: InitialData
): SessionRealtimeState {
  const [session, setSession] = useState<Session | null>(initial.session);
  const [transcripts, setTranscripts] = useState<Transcript[]>(
    initial.transcripts
  );
  const [symptoms, setSymptoms] = useState<Symptom[]>(initial.symptoms);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(initial.auditLog);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`session-detail-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          setSession(payload.new as unknown as Session);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transcripts",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setTranscripts((prev) => [
            ...prev,
            payload.new as unknown as Transcript,
          ]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "symptoms",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setSymptoms((prev) => [...prev, payload.new as unknown as Symptom]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "audit_log",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setAuditLog((prev) => [
            ...prev,
            payload.new as unknown as AuditLogEntry,
          ]);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return { session, transcripts, symptoms, auditLog };
}
