"use client";

import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/types";

interface Props {
  level: RiskLevel | null;
}

const segments = [
  { id: "low" as RiskLevel, label: "LOW", color: "bg-green-500", text: "text-green-700" },
  { id: "medium" as RiskLevel, label: "MEDIUM", color: "bg-yellow-400", text: "text-yellow-700" },
  { id: "high" as RiskLevel, label: "HIGH", color: "bg-orange-500", text: "text-orange-700" },
  { id: "er" as RiskLevel, label: "EMERGENCY", color: "bg-red-600", text: "text-red-700" },
];

const levelLabels: Record<RiskLevel, string> = {
  low: "Low Risk",
  medium: "Moderate Risk",
  high: "High Risk",
  er: "Emergency",
};

export default function RiskMeter({ level }: Props) {
  const activeIdx = level
    ? segments.findIndex((s) => s.id === level)
    : -1;

  return (
    <div className="space-y-2">
      <div className="flex gap-1 h-3 rounded-full overflow-hidden">
        {segments.map((seg, idx) => (
          <div
            key={seg.id}
            className={cn(
              "flex-1 transition-all duration-500",
              level === "er"
                ? cn("bg-red-600", idx === 3 && "animate-pulse")
                : activeIdx >= 0 && idx <= activeIdx
                ? seg.color
                : "bg-muted"
            )}
          />
        ))}
      </div>
      <div className="flex gap-1">
        {segments.map((seg, idx) => (
          <div
            key={seg.id}
            className={cn(
              "flex-1 text-center text-[9px] font-semibold",
              activeIdx >= 0 && idx <= activeIdx
                ? seg.text
                : "text-muted-foreground"
            )}
          >
            {seg.label}
          </div>
        ))}
      </div>
      <p
        className={cn(
          "text-center text-sm font-medium",
          level
            ? (segments.find((s) => s.id === level)?.text ?? "text-foreground")
            : "text-muted-foreground"
        )}
      >
        {level ? levelLabels[level] : "Awaiting assessment"}
      </p>
    </div>
  );
}
