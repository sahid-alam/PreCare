"use client";

import { useState } from "react";
import type { Session, Transcript, Symptom } from "@/lib/types";

export interface SessionRealtimeState {
  session: Session | null;
  transcripts: Transcript[];
  symptoms: Symptom[];
}

export function useSessionRealtime(sessionId: string): SessionRealtimeState {
  const [session, setSession] = useState<Session | null>(null);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);

  // TODO: subscribe to Supabase Realtime in Phase 4
  void sessionId;
  void setSession;
  void setTranscripts;
  void setSymptoms;

  return { session, transcripts, symptoms };
}
