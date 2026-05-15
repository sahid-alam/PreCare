"use client";

import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/types";

interface Props {
  level: RiskLevel | null;
}

const levelLabels: Record<RiskLevel, string> = {
  low: "Home care",
  medium: "Clinic visit",
  high: "High risk",
  er: "Emergency",
};

const scores: Record<RiskLevel, number> = {
  low: 24,
  medium: 54,
  high: 76,
  er: 94,
};

const colors: Record<RiskLevel, string> = {
  low: "#2f8b5e",
  medium: "#d4a03c",
  high: "#d4a03c",
  er: "#c8473b",
};

export default function RiskMeter({ level }: Props) {
  const score = level ? scores[level] : 0;
  const stroke = level ? colors[level] : "#97a199";
  const circumference = 2 * Math.PI * 86;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="w-full max-w-[220px]">
      <div className="relative aspect-square w-full">
        <svg viewBox="0 0 220 220" className="h-full w-full -rotate-90">
          <circle cx="110" cy="110" r="86" fill="none" stroke="#f3f1ea" strokeWidth="14" />
          <circle
            cx="110"
            cy="110"
            r="86"
            fill="none"
            stroke={stroke}
            strokeLinecap="round"
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn("transition-all duration-700", level === "er" && "animate-pulse")}
          />
          <g stroke="#dad6cb" strokeWidth="1">
            <path d="M110 18v12" />
            <path d="M110 190v12" />
            <path d="M18 110h12" />
            <path d="M190 110h12" />
          </g>
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="font-display text-[48px] font-medium leading-none text-[#14241c]">
              {score}
            </div>
            <div className="mt-1 text-[10px] uppercase text-[#6f7a73]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.16em" }}>
              Risk score
            </div>
            <div className="font-serif-display mt-1 text-lg italic" style={{ color: stroke }}>
              {level ? levelLabels[level] : "pending"}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-[10px] border border-[#e8e5dc] text-[10px] uppercase" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
        {[
          ["low", "Home", "#2f8b5e"],
          ["medium", "Clinic", "#d4a03c"],
          ["er", "ER", "#c8473b"],
        ].map(([id, label, color]) => (
          <div
            key={id}
            className={cn(
              "flex items-center justify-between border-r border-[#e8e5dc] bg-[#faf8f1] px-3 py-2 text-[#6f7a73] last:border-r-0",
              level === id && "bg-white text-[#14241c]"
            )}
          >
            <span>{label}</span>
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
          </div>
        ))}
      </div>
    </div>
  );
}
