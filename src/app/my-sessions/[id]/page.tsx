"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle,
  Mic, Bot, Clock, Activity, ShieldAlert,
} from "lucide-react";
import { usePatientProfile } from "@/hooks/usePatientProfile";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import type { Session, Transcript, Symptom } from "@/lib/types";

// ── Tier config ───────────────────────────────────────────────────────────────

const TIER = {
  home: {
    label: "Home Care",
    sub: "Rest at home — monitor symptoms",
    color: "#2f8b5e",
    bg: "#edf4ee",
    border: "#d7e8dc",
    badge: "Low acuity",
  },
  clinic: {
    label: "Clinic Visit",
    sub: "See a GP within 24–72 hours",
    color: "#d4a03c",
    bg: "#faefd5",
    border: "#e9c58a",
    badge: "Moderate",
  },
  er: {
    label: "Emergency Room",
    sub: "Call 108 — seek immediate care",
    color: "#c8473b",
    bg: "#fbe5e1",
    border: "#e59a92",
    badge: "High risk",
  },
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtDuration(secs: number | null) {
  if (!secs) return null;
  const m = Math.floor(secs / 60), s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

const SEVERITY_COLOR: Record<string, string> = {
  mild: "text-green-700 bg-green-50 border-green-200",
  moderate: "text-amber-700 bg-amber-50 border-amber-200",
  severe: "text-red-700 bg-red-50 border-red-200",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = usePatientProfile();

  const [session, setSession] = useState<Session | null>(null);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Redirect to sign-in if not authenticated once auth is resolved
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/my-sessions");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    const supabase = getSupabaseBrowserClient();

    void Promise.all([
      supabase.from("sessions").select("*").eq("id", id).single(),
      supabase.from("transcripts").select("*").eq("session_id", id).order("created_at"),
      supabase.from("symptoms").select("*").eq("session_id", id).order("created_at"),
    ]).then(([sessionRes, txRes, symRes]) => {
      if (sessionRes.error || !sessionRes.data) { setNotFound(true); }
      else { setSession(sessionRes.data as unknown as Session); }
      setTranscripts((txRes.data ?? []) as unknown as Transcript[]);
      setSymptoms((symRes.data ?? []) as unknown as Symptom[]);
      setPageLoading(false);
    });
  }, [isAuthenticated, id]);

  if (authLoading || pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f1e9]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1e6a47] border-t-transparent" />
      </div>
    );
  }

  if (notFound || !session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f4f1e9]">
        <p className="text-sm text-[#6f7a73]">Session not found or you don&apos;t have access.</p>
        <Link href="/my-sessions" className="text-sm font-medium text-[#1e6a47] hover:underline">
          ← Back to My Sessions
        </Link>
      </div>
    );
  }

  const tier = session.final_tier ? TIER[session.final_tier] : null;

  return (
    <div className="min-h-screen bg-[#f4f1e9] text-[#14241c]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-[#d7e8dc] bg-[#f4f1e9]/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-[#14241c]">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#14241c]">
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                <path d="M7 1.5V12.5M1.5 7H12.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            PreCare
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/my-sessions"
              className="flex items-center gap-1.5 rounded-full border border-[#d7e8dc] bg-white/60 px-4 py-1.5 text-xs font-medium text-[#3c4a43] hover:bg-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> My Sessions
            </Link>
            <Link
              href="/triage"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#1e6a47] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#185c3d]"
            >
              New triage <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        {/* ── Session meta ── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#6f7a73]">Triage session</p>
            <p className="mt-0.5 text-sm text-[#3c4a43]">{fmt(session.started_at)}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#a8b5ad]">
            <Clock className="h-3.5 w-3.5" />
            {fmtDuration(session.duration_seconds) ?? "—"}
            <span
              className="rounded-full border border-[#e8e5dc] px-2 py-0.5 text-[10px] uppercase tracking-wide"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {session.status}
            </span>
          </div>
        </div>

        {/* ── Tier result card ── */}
        {tier ? (
          <div
            className="relative overflow-hidden rounded-2xl border p-6"
            style={{ background: tier.bg, borderColor: tier.border }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: tier.color }} />
            <div
              className="mb-3 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] uppercase"
              style={{ background: "white", borderColor: tier.border, color: tier.color, fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: tier.color }} />
              {tier.badge}
            </div>
            <h2 className="font-display mb-0.5 text-2xl font-semibold" style={{ color: tier.color }}>
              {tier.label}
            </h2>
            <p className="text-sm font-medium" style={{ color: tier.color, opacity: 0.8 }}>{tier.sub}</p>

            {session.chief_complaint && (
              <div className="mt-4 rounded-xl border border-white/60 bg-white/50 px-4 py-3">
                <p className="mb-0.5 text-[10px] uppercase tracking-widest text-[#6f7a73]" style={{ fontFamily: "var(--font-mono)" }}>Chief complaint</p>
                <p className="text-sm text-[#14241c]">{session.chief_complaint}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#e8e5dc] bg-white px-6 py-4">
            <p className="text-sm text-[#6f7a73]">Assessment not yet completed.</p>
          </div>
        )}

        {/* ── Red flag alert ── */}
        {session.red_flag_triggered && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-semibold text-red-800">Safety override applied</p>
              <p className="text-xs text-red-700">
                Emergency red flags were detected. Your care tier was automatically escalated to Emergency Room by the server-side safety system.
                {session.red_flag_categories && session.red_flag_categories.length > 0 && (
                  <> Categories: {session.red_flag_categories.join(", ")}.</>
                )}
              </p>
            </div>
          </div>
        )}

        {/* ── Reasoning ── */}
        {session.reasoning && (
          <div className="rounded-2xl border border-[#e8e5dc] bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#2f8b5e]" />
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#6f7a73]" style={{ fontFamily: "var(--font-mono)" }}>
                Asha&apos;s reasoning
              </h3>
            </div>
            <p className="text-sm leading-6 text-[#3c4a43]">{session.reasoning}</p>
          </div>
        )}

        {/* ── Recommended actions ── */}
        {session.recommended_actions && session.recommended_actions.length > 0 && (
          <div className="rounded-2xl border border-[#e8e5dc] bg-white p-5">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#6f7a73]" style={{ fontFamily: "var(--font-mono)" }}>
              Recommended actions
            </h3>
            <ul className="space-y-2">
              {session.recommended_actions.map((action, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[#3c4a43]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2f8b5e]" />
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Symptoms ── */}
        {symptoms.length > 0 && (
          <div className="rounded-2xl border border-[#e8e5dc] bg-white p-5">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#6f7a73]" style={{ fontFamily: "var(--font-mono)" }}>
              Symptoms logged ({symptoms.length})
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {symptoms.map((s) => (
                <div key={s.id} className="rounded-xl border border-[#e8e5dc] bg-[#faf8f1] px-4 py-3">
                  <p className="text-sm font-medium text-[#14241c] capitalize">{s.name}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {s.severity && (
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${SEVERITY_COLOR[s.severity] ?? ""}`}>
                        {s.severity}
                      </span>
                    )}
                    {s.duration && (
                      <span className="rounded-full border border-[#e8e5dc] bg-white px-2 py-0.5 text-[10px] text-[#6f7a73]">
                        {s.duration}
                      </span>
                    )}
                  </div>
                  {s.notes && <p className="mt-1.5 text-xs text-[#6f7a73]">{s.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Transcript ── */}
        {transcripts.length > 0 && (
          <div className="rounded-2xl border border-[#e8e5dc] bg-white p-5">
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-[#6f7a73]" style={{ fontFamily: "var(--font-mono)" }}>
              Conversation transcript ({transcripts.length} turns)
            </h3>
            <div className="space-y-3">
              {transcripts.map((t) => (
                <div
                  key={t.id}
                  className={`flex gap-2.5 ${t.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${t.role === "assistant" ? "bg-[#1e6a47]" : "bg-[#3c4a43]"}`}>
                    {t.role === "assistant"
                      ? <Bot className="h-3.5 w-3.5" />
                      : <Mic className="h-3.5 w-3.5" />}
                  </div>
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                      t.role === "assistant"
                        ? "rounded-tl-sm bg-[#edf4ee] text-[#14241c]"
                        : "rounded-tr-sm bg-[#14241c] text-white"
                    }`}
                  >
                    {t.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Disclaimer ── */}
        <p className="pb-4 text-center text-[11px] leading-5 text-[#a8b5ad]">
          This was an AI-assisted triage, not a medical diagnosis. If your condition worsens, call 108 or visit the nearest emergency room.
        </p>
      </main>
    </div>
  );
}
