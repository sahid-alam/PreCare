"use client";

import { useState } from "react";
import DisclaimerGate from "@/components/patient/DisclaimerGate";
import CallControls from "@/components/patient/CallControls";
import TranscriptPanel from "@/components/patient/TranscriptPanel";
import SymptomCards from "@/components/patient/SymptomCards";
import RiskMeter from "@/components/patient/RiskMeter";
import ClassificationCard from "@/components/patient/ClassificationCard";
import { useVapiCall } from "@/hooks/useVapiCall";

export default function PatientPage() {
  const [accepted, setAccepted] = useState(false);
  const [lang, setLang] = useState<"en" | "hi">("en");

  const {
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
  } = useVapiCall();

  function handleAccept(selectedLang: "en" | "hi") {
    setLang(selectedLang);
    setAccepted(true);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {!accepted && <DisclaimerGate onAccept={handleAccept} />}

      {/* Top bar */}
      <header className="border-b px-4 py-3 flex items-center justify-between gap-4">
        <h1 className="text-lg font-bold tracking-tight shrink-0">Asha</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {lang === "en" ? "English" : "हिन्दी"}
          </span>
          <CallControls
            status={status}
            isMuted={isMuted}
            lang={lang}
            onStart={() => void startCall(lang)}
            onEnd={endCall}
            onToggleMute={toggleMute}
          />
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Main layout */}
      <main className="flex-1 flex flex-col md:flex-row gap-4 p-4 overflow-hidden">
        {/* Left — transcript */}
        <div className="flex-1 flex flex-col min-h-[300px] md:min-h-0">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Conversation
          </h2>
          <div className="flex-1">
            <TranscriptPanel transcript={transcript} status={status} />
          </div>
        </div>

        {/* Right — symptoms + risk */}
        <div className="md:w-80 flex flex-col gap-4">
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Symptoms Identified
            </h2>
            <SymptomCards symptoms={symptoms} />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Risk Level
            </h2>
            <RiskMeter level={riskLevel} />
          </div>
        </div>
      </main>

      {/* Classification result */}
      {classification && (
        <div className="px-4 pb-4">
          <ClassificationCard
            classification={classification}
            sessionId={sessionId}
          />
        </div>
      )}
    </div>
  );
}
