"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ShieldAlert } from "lucide-react";
import DisclaimerGate from "@/components/patient/DisclaimerGate";
import PatientIntake from "@/components/patient/PatientIntake";
import MedicationReminders from "@/components/patient/MedicationReminders";
import CallControls from "@/components/patient/CallControls";
import TranscriptPanel from "@/components/patient/TranscriptPanel";
import SymptomCards from "@/components/patient/SymptomCards";
import RiskMeter from "@/components/patient/RiskMeter";
import ClassificationCard from "@/components/patient/ClassificationCard";
import { useVapiCall } from "@/hooks/useVapiCall";
import { usePatientProfile } from "@/hooks/usePatientProfile";
import type { PatientProfile, AppLanguage } from "@/lib/types";

type Step = "disclaimer" | "intake" | "call";

export default function PatientPage() {
  const [step, setStep] = useState<Step>("disclaimer");
  const [lang, setLang] = useState<AppLanguage>("en");

  const { userId } = usePatientProfile();

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

  const isWorkspaceVisible =
    status !== "idle" || transcript.length > 0 || symptoms.length > 0 || classification;

  const statusText =
    status === "active"
      ? "In session"
      : status === "connecting"
      ? "Connecting"
      : status === "ended"
      ? "Session ended"
      : status === "error"
      ? "Needs attention"
      : "Ready";

  function handleDisclaimerAccept() {
    setStep("intake");
  }

  async function handleIntakeStart(profile: PatientProfile, selectedLang: AppLanguage) {
    setLang(selectedLang);
    setStep("call");
    await startCall(selectedLang, profile, userId);
  }

  return (
    <div className="min-h-screen bg-[#f4f1e9] text-[#14241c]">
      {step === "disclaimer" && (
        <DisclaimerGate onAccept={() => handleDisclaimerAccept()} />
      )}
      {step === "intake" && (
        <PatientIntake onStart={(profile, l) => void handleIntakeStart(profile, l)} />
      )}

      {step === "call" && (
        <>
          <div className="pc-instrument no-print">
            <span>PreCare · Triage</span>
            <span className="pc-live">{statusText}</span>
            <span>Asha v1</span>
            <span>{lang === "en" ? "English" : lang === "hi" ? "Hindi" : "Kannada"}</span>
            <div className="ml-auto flex items-center gap-2">
              <MedicationReminders userId={userId} />
              <Link href="/admin" className="text-[#bfc8c2] transition-colors hover:text-white text-sm">
                Admin
              </Link>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 border-b border-[#e59a92] bg-[#fbe5e1] px-5 py-3 text-sm text-[#9f2d24]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <main className="mx-auto max-w-[1240px] px-4 pb-32 pt-4 sm:px-5">
            <div className="mb-5 flex flex-wrap items-center gap-4">
              <div className="pc-brand text-lg">
                <div className="pc-mark">
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M7 1.5V12.5M1.5 7H12.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  Asha
                  <small className="block text-[11px] font-normal text-[#6f7a73]">Voice triage</small>
                </div>
              </div>
              <div className="hidden gap-5 text-[11px] text-[#6f7a73] sm:flex" style={{ fontFamily: "var(--font-mono)" }}>
                <span>
                  Session <strong className="text-[#14241c]">{sessionId ? sessionId.slice(0, 8) : "pending"}</strong>
                </span>
                <span>
                  Transcript <strong className="text-[#14241c]">{transcript.length}</strong>
                </span>
                <span>
                  Symptoms <strong className="text-[#14241c]">{symptoms.length}</strong>
                </span>
              </div>
              <Link
                href="/"
                className="ml-auto hidden items-center gap-2 text-xs text-[#6f7a73] hover:text-[#14241c] sm:inline-flex"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                PreCare
              </Link>
            </div>

            {!isWorkspaceVisible ? (
              <section className="py-16 text-center">
                <div className="pc-eyebrow mb-5">Ready for intake</div>
                <h1 className="font-display mx-auto max-w-2xl text-[34px] font-medium leading-tight sm:text-[44px]">
                  Start a structured voice triage session with{" "}
                  <em className="font-serif-display text-[#1e6a47]">Asha.</em>
                </h1>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#3c4a43]">
                  Asha will collect symptoms one question at a time, screen for emergency red flags,
                  and route the case to home care, clinic, or emergency care.
                </p>
                <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#d7e8dc] bg-white px-4 py-2 text-xs text-[#1e6a47]">
                  <ShieldAlert className="h-4 w-4" />
                  Emergency symptoms should go directly to 108.
                </div>
              </section>
            ) : (
              <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
                <div>
                  <section className="pc-card relative overflow-hidden p-6 sm:p-7">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_90%_at_90%_0%,rgba(155,201,172,0.16)_0%,rgba(155,201,172,0)_60%)]" />
                    <div className="relative">
                      <div className="mb-6 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="pc-live text-[11px] uppercase tracking-[0.12em] text-[#1e6a47]">{statusText}</span>
                        </div>
                        <span className="pc-tier-pill border-[#d7e8dc] bg-[#edf4ee] text-[#1e6a47]">
                          <span className="h-2 w-2 rounded-full bg-[#2f8b5e]" />
                          Safety layer armed
                        </span>
                      </div>

                      <div className="grid items-center gap-7 md:grid-cols-[220px_1fr]">
                        <RiskMeter level={riskLevel} />
                        <div>
                          <div className="mb-2 text-[10.5px] uppercase text-[#6f7a73]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.14em" }}>
                            Current assessment
                          </div>
                          <h2 className="font-display mb-3 text-[26px] font-medium leading-tight">
                            {classification ? (
                              <>
                                Final recommendation is ready for{" "}
                                <em className="font-serif-display text-[#1e6a47]">review.</em>
                              </>
                            ) : status === "active" ? (
                              <>
                                Listening for symptoms and screening{" "}
                                <em className="font-serif-display text-[#1e6a47]">red flags.</em>
                              </>
                            ) : (
                              <>
                                Awaiting live clinical{" "}
                                <em className="font-serif-display text-[#1e6a47]">signal.</em>
                              </>
                            )}
                          </h2>
                          <p className="max-w-2xl text-sm leading-6 text-[#3c4a43]">
                            Patient UI updates from Vapi client events for low latency. The webhook writes
                            the same call to Supabase so staff can audit the transcript and server-side overrides.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="mt-4">
                    <TranscriptPanel transcript={transcript} status={status} />
                  </section>
                </div>

                <aside className="grid gap-4">
                  <SymptomCards symptoms={symptoms} />
                  <ClassificationCard classification={classification} sessionId={sessionId} />
                </aside>
              </div>
            )}
          </main>

          <div className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full bg-[#14241c] px-3 py-2 pl-4 text-white shadow-[0_24px_48px_-12px_rgba(20,36,28,0.5)] no-print">
            <CallControls
              status={status}
              isMuted={isMuted}
              lang={lang}
              onStart={() => void startCall(lang)}
              onEnd={endCall}
              onToggleMute={toggleMute}
            />
          </div>
        </>
      )}
    </div>
  );
}
