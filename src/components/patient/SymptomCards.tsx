"use client";

import { cn } from "@/lib/utils";
import type { SymptomEntry } from "@/lib/types";

interface Props {
  symptoms: SymptomEntry[];
}

const severityStyles: Record<string, { wrap: string; dot: string; score: string }> = {
  mild: { wrap: "border-[#e8e5dc] bg-[#faf8f1]", dot: "bg-[#2f8b5e]", score: "1" },
  moderate: { wrap: "border-[#e9c58a] bg-[#faefd5]", dot: "bg-[#d4a03c]", score: "2" },
  severe: { wrap: "border-[#e59a92] bg-[#fbe5e1]", dot: "bg-[#c8473b]", score: "3" },
};

export default function SymptomCards({ symptoms }: Props) {
  return (
    <div className="pc-card overflow-hidden">
      <div className="pc-card-head">
        <strong className="font-medium text-[#14241c]">Symptoms identified</strong>
        <span>{symptoms.length} found</span>
      </div>
      <div className="grid max-h-[380px] gap-2 overflow-auto p-3.5">
        {symptoms.length === 0 && (
          <div className="px-4 py-10 text-center text-[11px] uppercase text-[#97a199]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>
            Symptoms will appear here as they are identified
          </div>
        )}
        {symptoms.map((s, i) => {
          const style = severityStyles[s.severity] ?? {
            wrap: "border-[#e8e5dc] bg-[#faf8f1]",
            dot: "bg-[#97a199]",
            score: "·",
          };
          return (
            <div
              key={`${s.name}-${i}`}
              className={cn(
                "grid grid-cols-[36px_1fr_auto] items-start gap-3 rounded-[10px] border p-3.5 animate-in fade-in slide-in-from-bottom-2 duration-300",
                style.wrap
              )}
            >
              <div className={cn("grid h-9 w-9 place-items-center rounded-full text-[11px] font-medium text-white", style.dot)} style={{ fontFamily: "var(--font-mono)" }}>
                {style.score}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium capitalize text-[#14241c]">{s.name}</div>
                {s.duration && (
                  <div className="font-serif-display mt-0.5 text-[13px] italic text-[#6f7a73]">
                    {s.duration}
                  </div>
                )}
              </div>
              <div className="text-right text-[9.5px] uppercase text-[#97a199]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>
                {s.severity || "seen"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
