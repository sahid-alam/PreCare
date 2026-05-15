"use client";

import { cn } from "@/lib/utils";
import type { Symptom } from "@/lib/types";

interface Props {
  symptoms: Symptom[];
}

const severityStyles: Record<string, { dot: string; score: string }> = {
  mild: { dot: "bg-[#2f8b5e]", score: "1" },
  moderate: { dot: "bg-[#d4a03c]", score: "2" },
  severe: { dot: "bg-[#c8473b]", score: "3" },
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SymptomsPanel({ symptoms }: Props) {
  return (
    <div className="pc-card overflow-hidden">
      <div className="pc-card-head">
        <strong className="font-medium text-[#14241c]">Symptoms extracted</strong>
        <span>{symptoms.length} found</span>
      </div>
      <div className="grid gap-0 p-4">
      {symptoms.length === 0 && (
        <p className="py-4 text-sm text-[#6f7a73]">No symptoms identified yet.</p>
      )}
      {symptoms.map((s) => (
        <div key={s.id} className="grid grid-cols-[28px_1fr_auto] gap-3 border-b border-dashed border-[#e8e5dc] py-3 text-sm last:border-b-0">
          <div className={cn("grid h-6 w-6 place-items-center rounded-full text-[10px] font-medium text-white", severityStyles[s.severity ?? ""]?.dot ?? "bg-[#97a199]")} style={{ fontFamily: "var(--font-mono)" }}>
            {severityStyles[s.severity ?? ""]?.score ?? "·"}
          </div>
          <div className="min-w-0">
            <div className="font-medium capitalize text-[#14241c]">{s.name}</div>
            {s.duration && (
              <p className="text-xs text-[#6f7a73]">{s.duration}</p>
            )}
            {s.notes && (
              <p className="font-serif-display text-xs italic text-[#6f7a73]">{s.notes}</p>
            )}
          </div>
          <span className="shrink-0 text-[10px] text-[#97a199]" style={{ fontFamily: "var(--font-mono)" }}>
            {formatTime(s.created_at)}
          </span>
        </div>
      ))}
      </div>
    </div>
  );
}
