"use client";

import { useMemo } from "react";
import type { Session } from "@/lib/types";

interface Props {
  sessions: Session[];
}

const R = 40;
const CX = 50;
const CY = 50;
const C = 2 * Math.PI * R;

const TIERS = [
  { key: "home" as const, color: "#2f8b5e", label: "Home Care" },
  { key: "clinic" as const, color: "#d4a03c", label: "Clinic Visit" },
  { key: "er" as const, color: "#c8473b", label: "Emergency" },
] as const;

export default function StatsDonut({ sessions }: Props) {
  const counts = useMemo(
    () => ({
      home: sessions.filter((s) => s.final_tier === "home").length,
      clinic: sessions.filter((s) => s.final_tier === "clinic").length,
      er: sessions.filter((s) => s.final_tier === "er").length,
    }),
    [sessions]
  );

  const total = sessions.length;

  const segments = useMemo(() => {
    if (total === 0) return [];
    let cumulativeLen = 0;
    return TIERS.map((tier) => {
      const count = counts[tier.key];
      const len = (count / total) * C;
      const rotation = -90 + (cumulativeLen / C) * 360;
      cumulativeLen += len;
      return { ...tier, count, len, rotation };
    });
  }, [counts, total]);

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        <svg width="110" height="110" viewBox="0 0 100 100">
          {total === 0 ? (
            <circle
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
          ) : (
            segments.map((seg) =>
              seg.len > 0 ? (
                <circle
                  key={seg.key}
                  cx={CX}
                  cy={CY}
                  r={R}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="8"
                  strokeDasharray={`${seg.len} ${C - seg.len}`}
                  transform={`rotate(${seg.rotation}, ${CX}, ${CY})`}
                />
              ) : null
            )
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-display text-lg font-medium leading-none">{total}</span>
          <span className="text-[8px] uppercase text-[#6f7a73]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
            Sessions
          </span>
        </div>
      </div>

      <div className="grid flex-1 gap-2">
        {TIERS.map((tier) => (
          <div key={tier.key} className="flex items-center gap-2 text-sm text-[#3c4a43]">
            <div
              className="h-2 w-2 shrink-0 rounded-sm"
              style={{ backgroundColor: tier.color }}
            />
            <span>{tier.label}</span>
            <span className="ml-auto text-xs font-medium text-[#14241c]" style={{ fontFamily: "var(--font-mono)" }}>
              {total ? Math.round((counts[tier.key] / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
