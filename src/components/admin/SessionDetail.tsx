"use client";

import { useSessionRealtime } from "@/hooks/useSessionRealtime";
import TranscriptFeed from "./TranscriptFeed";
import SymptomsPanel from "./SymptomsPanel";
import AuditLog from "./AuditLog";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
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
  home: { label: "HOME CARE", cls: "bg-green-100 text-green-800 border-green-300" },
  clinic: { label: "CLINIC VISIT", cls: "bg-amber-100 text-amber-800 border-amber-300" },
  er: { label: "EMERGENCY ROOM", cls: "bg-red-100 text-red-800 border-red-300" },
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
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-sm text-muted-foreground">
          {sessionId.slice(0, 8)}
        </span>
        {session?.red_flag_triggered && (
          <div className="flex items-center gap-1 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-semibold">Red Flag Override</span>
          </div>
        )}
        {tierCfg && (
          <Badge variant="outline" className={cn("text-xs font-bold", tierCfg.cls)}>
            {tierCfg.label}
          </Badge>
        )}
        {session?.status && (
          <Badge variant="outline" className={cn("text-xs capitalize", statusCls)}>
            {session.status}
          </Badge>
        )}
      </div>

      {/* Chief complaint & reasoning */}
      {session?.chief_complaint && (
        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Chief Complaint
          </p>
          <p className="text-sm">{session.chief_complaint}</p>
          {session.reasoning && (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-3">
                Assessment
              </p>
              <p className="text-sm">{session.reasoning}</p>
            </>
          )}
        </div>
      )}

      {/* Three-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Transcript
          </h2>
          <TranscriptFeed
            transcripts={transcripts}
            isActive={session?.status === "active"}
          />
        </div>
        <div className="space-y-4">
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Symptoms
            </h2>
            <SymptomsPanel symptoms={symptoms} />
          </div>
          {auditLog.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Audit Log
              </h2>
              <AuditLog entries={auditLog} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
