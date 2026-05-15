"use client";

import { useSessionRealtime } from "@/hooks/useSessionRealtime";
import TranscriptFeed from "./TranscriptFeed";
import SymptomsPanel from "./SymptomsPanel";
import AuditLog from "./AuditLog";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, FileDown, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Session, Transcript, Symptom, AuditLogEntry, CareTier } from "@/lib/types";

interface Props {
  sessionId: string;
  initialSession: Session;
  initialTranscripts: Transcript[];
  initialSymptoms: Symptom[];
  initialAuditLog: AuditLogEntry[];
}

const TIER_CONFIG: Record<CareTier, { label: string; cls: string }> = {
  home: { label: "Home Care", cls: "bg-[#edf4ee] text-[#1e6a47] border-[#d7e8dc]" },
  clinic: { label: "Clinic Visit", cls: "bg-[#faefd5] text-[#8a5a12] border-[#e9c58a]" },
  er: { label: "Emergency Room", cls: "bg-[#fbe5e1] text-[#9f2d24] border-[#e59a92]" },
};

const STATUS_CLS: Record<string, string> = {
  active: "border-blue-300 text-blue-700",
  complete: "border-gray-300 text-gray-700",
  failed: "border-red-300 text-red-700",
};

export default function SessionDetail({
  sessionId,
  initialSession,
  initialTranscripts,
  initialSymptoms,
  initialAuditLog,
}: Props) {
  const { session, transcripts, symptoms, auditLog } = useSessionRealtime(
    sessionId,
    {
      session: initialSession,
      transcripts: initialTranscripts,
      symptoms: initialSymptoms,
      auditLog: initialAuditLog,
    }
  );

  const tierCfg = session?.final_tier
    ? TIER_CONFIG[session.final_tier]
    : null;
  const statusCls =
    STATUS_CLS[session?.status ?? ""] ?? "border-gray-300 text-gray-700";

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
      <div className="mb-5 flex flex-wrap items-start gap-4">
        <div className="min-w-72 flex-1">
          <div className="pc-eyebrow mb-2">Session detail</div>
          <h1 className="font-display text-[32px] font-medium leading-tight">
            Session{" "}
            <span className="text-[22px] text-[#6f7a73]" style={{ fontFamily: "var(--font-mono)" }}>
              {sessionId.slice(0, 8)}
            </span>
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            {tierCfg && (
              <Badge variant="outline" className={cn("rounded-full text-[10.5px] font-medium uppercase", tierCfg.cls)} style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>
                {tierCfg.label}
              </Badge>
            )}
            {session?.status && (
              <Badge variant="outline" className={cn("rounded-full text-[10.5px] capitalize", statusCls)}>
                {session.status}
              </Badge>
            )}
            <span className="rounded-full border border-[#e8e5dc] px-2.5 py-1 text-[11px] text-[#6f7a73]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>
              {transcripts.length} turns
            </span>
            <span className="rounded-full border border-[#e8e5dc] px-2.5 py-1 text-[11px] text-[#6f7a73]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>
              {symptoms.length} symptoms
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 self-end">
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full border border-[#dad6cb] bg-white px-3 py-2 text-xs text-[#3c4a43] hover:bg-[#faf8f1]">
            <FileDown className="h-3.5 w-3.5" />
            Export PDF
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-full border border-[#dad6cb] bg-white px-3 py-2 text-xs text-[#3c4a43] hover:bg-[#faf8f1]">
            <Flag className="h-3.5 w-3.5" />
            Flag review
          </button>
        </div>
      </div>

      <div className={cn("mb-4 overflow-hidden rounded-2xl border bg-white p-5", session?.final_tier === "er" ? "border-[#e59a92] bg-gradient-to-b from-white to-[#fbf1ef]" : "border-[#e8e5dc]")}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-[28px] font-medium leading-tight">
            Recommendation:{" "}
            <em className={cn("font-serif-display", session?.final_tier === "er" ? "text-[#9f2d24]" : "text-[#1e6a47]")}>
              {tierCfg?.label ?? "Pending"}.
            </em>
          </h2>
          {session?.red_flag_triggered && (
            <span className="pc-tier-pill border-[#e59a92] bg-[#fbe5e1] text-[#9f2d24]">
              <AlertTriangle className="h-3.5 w-3.5" />
              Red-flag override
            </span>
          )}
        </div>
        <p className="max-w-[80ch] text-sm leading-6 text-[#3c4a43]">
          {session?.reasoning || session?.chief_complaint || "Assessment details will appear once Asha submits the final triage assessment."}
        </p>
        <div className="mt-4 grid gap-3 border-t border-[#e8e5dc] pt-4 sm:grid-cols-4">
          {[
            ["Status", session?.status ?? "pending"],
            ["Language", session?.language ?? "—"],
            ["Duration", session?.duration_seconds ? `${Math.floor(session.duration_seconds / 60)}:${(session.duration_seconds % 60).toString().padStart(2, "0")}` : "—"],
            ["Red flags", session?.red_flag_categories?.length?.toString() ?? "0"],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="mb-1 text-[10px] uppercase text-[#6f7a73]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}>
                {label}
              </div>
              <div className="font-display text-xl font-medium text-[#14241c]">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
        <TranscriptFeed
          transcripts={transcripts}
          isActive={session?.status === "active"}
        />
        <div className="grid content-start gap-4">
          <SymptomsPanel symptoms={symptoms} />
          <AuditLog entries={auditLog} />
        </div>
      </div>
    </div>
  );
}
