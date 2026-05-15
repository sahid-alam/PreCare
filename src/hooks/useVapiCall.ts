"use client";

import { useState } from "react";
import type { CareTier, Symptom, Transcript } from "@/lib/types";

export interface VapiCallState {
  isConnected: boolean;
  isAssistantSpeaking: boolean;
  transcripts: Transcript[];
  symptoms: Symptom[];
  finalTier: CareTier | null;
  sessionId: string | null;
  start: (opts: { sessionId: string; age?: number; gender?: string; language?: string }) => Promise<void>;
  stop: () => void;
}

export function useVapiCall(): VapiCallState {
  const [isConnected, setIsConnected] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [finalTier, setFinalTier] = useState<CareTier | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Suppress unused-variable warnings until implementation in Phase 1
  void setIsConnected;
  void setIsAssistantSpeaking;
  void setTranscripts;
  void setSymptoms;
  void setFinalTier;

  async function start(opts: { sessionId: string; age?: number; gender?: string; language?: string }) {
    setSessionId(opts.sessionId);
    // TODO: wire Vapi Web SDK in Phase 1
  }

  function stop() {
    // TODO: wire Vapi Web SDK in Phase 1
  }

  return { isConnected, isAssistantSpeaking, transcripts, symptoms, finalTier, sessionId, start, stop };
}
