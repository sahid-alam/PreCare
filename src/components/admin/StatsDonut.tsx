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
  { key: "home" as const, color: "#22c55e", label: "Home" },
  { key: "clinic" as const, color: "#f59e0b", label: "Clinic" },
  { key: "er" as const, color: "#ef4444", label: "ER" },
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
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg width="120" height="120" viewBox="0 0 100 100">
          {total === 0 ? (
            <circle
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="14"
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
                  strokeWidth="14"
                  strokeDasharray={`${seg.len} ${C - seg.len}`}
                  transform={`rotate(${seg.rotation}, ${CX}, ${CY})`}
                />
              ) : null
            )
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold leading-none">{total}</span>
          <span className="text-xs text-muted-foreground">total</span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {TIERS.map((tier) => (
          <div key={tier.key} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: tier.color }}
            />
            <span className="text-xs text-muted-foreground">{tier.label}</span>
            <span className="text-xs font-bold">{counts[tier.key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
