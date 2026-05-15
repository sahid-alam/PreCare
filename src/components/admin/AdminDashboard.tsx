"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import StatsDonut from "./StatsDonut";
import ActiveCallsBanner from "./ActiveCallsBanner";
import LiveQueue from "./LiveQueue";
import SessionsTable from "./SessionsTable";
import type { Session } from "@/lib/types";

interface Props {
  initialSessions: Session[];
}

export default function AdminDashboard({ initialSessions }: Props) {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel("admin-sessions")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sessions" },
        (payload) => {
          const newSession = payload.new as unknown as Session;
          setSessions((prev) => [newSession, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "sessions" },
        (payload) => {
          const updated = payload.new as unknown as Session;
          setSessions((prev) =>
            prev.map((s) => (s.id === updated.id ? updated : s))
          );
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const activeCount = sessions.filter((s) => s.status === "active").length;
  const erCount = sessions.filter((s) => s.final_tier === "er").length;
  const redFlagCount = sessions.filter((s) => s.red_flag_triggered).length;
  const completed = sessions.filter((s) => s.status === "complete");
  const avgDuration =
    completed.length === 0
      ? "—"
      : `${Math.floor(
          completed.reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0) /
            completed.length /
            60
        )}:${Math.round(
          (completed.reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0) /
            completed.length) %
            60
        )
          .toString()
          .padStart(2, "0")}`;

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-[30px] font-medium leading-tight">
          Sessions <em className="font-serif-display text-[#1e6a47]">overview.</em>
        </h1>
        <span className="pc-tier-pill border-[#d7e8dc] bg-[#edf4ee] text-[#1e6a47]">
          <span className="h-2 w-2 rounded-full bg-[#2f8b5e] shadow-[0_0_0_3px_rgba(47,139,94,0.2)]" />
          Live
        </span>
        <span className="text-[11px] text-[#6f7a73]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
          Last update <strong className="font-medium text-[#14241c]">now</strong>
        </span>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Sessions tracked", sessions.length.toLocaleString(), "Realtime Supabase feed", false],
          ["Active calls", activeCount.toLocaleString(), "Currently in intake", false],
          ["Red-flag overrides", redFlagCount.toLocaleString(), `${erCount} ER outcomes`, true],
          ["Avg duration", avgDuration, "Completed sessions", false],
        ].map(([label, value, delta, red]) => (
          <div
            key={label as string}
            className={`relative min-h-[116px] overflow-hidden rounded-xl border bg-white p-4 ${
              red ? "border-[#e59a92]/40 bg-gradient-to-b from-white to-[#fbf1ef]" : "border-[#e8e5dc]"
            }`}
          >
            <div className="text-[10px] uppercase text-[#6f7a73]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}>
              {label}
            </div>
            <div className="font-display mt-2 flex items-baseline gap-2 text-[32px] font-medium leading-none text-[#14241c]">
              {value}
            </div>
            <div className={`mt-2 text-[11px] ${red ? "text-[#9f2d24]" : "text-[#1e6a47]"}`} style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.02em" }}>
              {delta}
            </div>
            <svg className="absolute right-4 top-4 opacity-60" width="56" height="22" viewBox="0 0 56 22" aria-hidden="true">
              <polyline
                points={red ? "0,16 6,14 12,17 18,11 24,8 30,12 36,10 42,7 48,5 56,9" : "0,18 6,16 12,17 18,12 24,13 30,9 36,10 42,6 48,7 56,3"}
                fill="none"
                stroke={red ? "#c8473b" : "#1e6a47"}
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ))}
      </div>

      <div className="mb-4 grid gap-3 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-xl border border-[#e8e5dc] bg-white p-4">
          <div className="mb-3 flex items-center justify-between text-[11px] uppercase text-[#6f7a73]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>
            <strong className="font-medium text-[#14241c]">Volume — current window</strong>
            <span className="normal-case tracking-normal">Sessions / Red flags</span>
          </div>
          <svg viewBox="0 0 720 180" className="h-[200px] w-full" aria-hidden="true">
            <defs>
              <linearGradient id="admin-volume" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#1E6A47" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#1E6A47" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[45, 90, 135].map((y) => (
              <line key={y} x1="24" x2="696" y1={y} y2={y} stroke="#E8E5DC" strokeDasharray="2 3" />
            ))}
            <path d="M 24,156 L 24,140 L 80,144 L 136,152 L 192,128 L 248,82 L 304,52 L 360,58 L 416,38 L 472,28 L 528,18 L 584,40 L 640,66 L 696,90 L 696,156 Z" fill="url(#admin-volume)" />
            <path d="M 24,140 L 80,144 L 136,152 L 192,128 L 248,82 L 304,52 L 360,58 L 416,38 L 472,28 L 528,18 L 584,40 L 640,66 L 696,90" fill="none" stroke="#1E6A47" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 24,153 L 80,154 L 136,150 L 192,148 L 248,140 L 304,134 L 360,138 L 416,130 L 472,124 L 528,114 L 584,124 L 640,138 L 696,146" fill="none" stroke="#C8473B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="rounded-xl border border-[#e8e5dc] bg-white p-4">
          <div className="mb-4 text-[11px] uppercase text-[#6f7a73]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>
            Outcomes — loaded sessions
          </div>
          <StatsDonut sessions={sessions} />
        </div>
      </div>

      <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-xl border border-[#e8e5dc] bg-white p-4">
          <div className="mb-3 flex items-center justify-between text-[11px] uppercase text-[#6f7a73]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>
            <strong className="font-medium text-[#14241c]">Live queue</strong>
            <ActiveCallsBanner sessions={sessions} />
          </div>
          <LiveQueue sessions={sessions} />
        </div>
        <div>
        <SessionsTable sessions={sessions} />
        </div>
      </div>
    </div>
  );
}
