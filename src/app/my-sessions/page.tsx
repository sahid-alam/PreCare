"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Clock, LogIn, LogOut, UserPlus, ChevronRight, Bell, Stethoscope } from "lucide-react";
import { usePatientProfile } from "@/hooks/usePatientProfile";
import MedicationReminders from "@/components/patient/MedicationReminders";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

interface Session {
  id: string;
  started_at: string;
  ended_at: string | null;
  status: string;
  final_tier: string | null;
  chief_complaint: string | null;
  duration_seconds: number | null;
}

const TIER_STYLES: Record<string, string> = {
  home: "bg-green-100 text-green-800 border-green-200",
  clinic: "bg-amber-100 text-amber-800 border-amber-200",
  er: "bg-red-100 text-red-800 border-red-200",
};
const TIER_LABELS: Record<string, string> = {
  home: "Home Care",
  clinic: "Clinic Visit",
  er: "Emergency",
};
const TIER_DOT: Record<string, string> = {
  home: "bg-green-500",
  clinic: "bg-amber-500",
  er: "bg-red-500",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}
function formatDuration(secs: number | null) {
  if (!secs) return null;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function MySessionsPage() {
  const {
    userId, userEmail, isAuthenticated, loading,
    email, setEmail, password, setPassword, authError,
    signIn, signUp, signOut,
  } = usePatientProfile();

  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [submitting, setSubmitting] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setSessionsLoading(true);
    const supabase = getSupabaseBrowserClient();
    void supabase
      .from("sessions")
      .select("id, started_at, ended_at, status, final_tier, chief_complaint, duration_seconds")
      .order("started_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setSessions(data as Session[]);
        setSessionsLoading(false);
      });
  }, [isAuthenticated]);

  async function handleAuth() {
    if (!email || !password) return;
    setSubmitting(true);
    authMode === "signin" ? await signIn(email, password) : await signUp(email, password);
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f1e9]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1e6a47] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f1e9] text-[#14241c]">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-[#d7e8dc] bg-[#f4f1e9]/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-[#14241c]">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#14241c]">
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                <path d="M7 1.5V12.5M1.5 7H12.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            PreCare
          </Link>
          <div className="flex items-center gap-3">
            {isAuthenticated && <MedicationReminders userId={userId} />}
            <Link
              href="/triage"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#1e6a47] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#185c3d]"
            >
              New triage
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-display mb-1 text-2xl font-medium">My Sessions</h1>
        <p className="mb-6 text-sm text-[#6f7a73]">Your triage history and medication reminders.</p>

        {/* Auth gate */}
        {!isAuthenticated ? (
          <div className="rounded-xl border border-[#d3e5d9] bg-white p-6">
            <p className="mb-4 text-sm font-medium text-[#14241c]">Sign in to view your sessions.</p>

            {/* Mode toggle */}
            <div className="mb-3 flex rounded-lg border border-[#d3e5d9] p-0.5">
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setAuthMode(m)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-colors ${
                    authMode === m ? "bg-[#14241c] text-white" : "text-[#6f7a73] hover:text-[#14241c]"
                  }`}
                >
                  {m === "signin" ? <LogIn className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}
                  {m === "signin" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <input
                type="email" placeholder="Email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#d3e5d9] px-3 py-2 text-sm placeholder-[#a8b5ad] focus:border-[#1e6a47] focus:outline-none"
              />
              <input
                type="password" placeholder="Password (min. 6 characters)"
                value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void handleAuth()}
                className="w-full rounded-lg border border-[#d3e5d9] px-3 py-2 text-sm placeholder-[#a8b5ad] focus:border-[#1e6a47] focus:outline-none"
              />
              {authError && <p className="text-xs text-red-600">{authError}</p>}
              <button
                onClick={() => void handleAuth()}
                disabled={submitting || !email || !password}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#14241c] py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {submitting ? "Please wait…" : authMode === "signin" ? "Sign in" : "Create account"}
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Account info */}
            <div className="mb-5 flex items-center justify-between rounded-xl border border-[#d3e5d9] bg-white px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-[#14241c]">{userEmail}</p>
                <p className="text-xs text-[#6f7a73]">Signed in</p>
              </div>
              <button
                onClick={() => void signOut()}
                className="flex items-center gap-1 text-xs text-[#a8b5ad] hover:text-red-500 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>

            {/* Sessions list */}
            {sessionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1e6a47] border-t-transparent" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="rounded-xl border border-[#d7e8dc] bg-white px-6 py-12 text-center">
                <Stethoscope className="mx-auto mb-3 h-8 w-8 text-[#a8b5ad]" />
                <p className="text-sm font-medium text-[#14241c]">No sessions yet</p>
                <p className="mt-1 text-xs text-[#6f7a73]">Start a triage call to see your history here.</p>
                <Link
                  href="/triage"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#1e6a47] px-4 py-2 text-xs font-medium text-white hover:bg-[#185c3d]"
                >
                  Start triage <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {sessions.map((s) => (
                  <li key={s.id} className="rounded-xl border border-[#e8e5dc] bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#a8b5ad]" />
                        <div>
                          <p className="text-sm font-medium text-[#14241c]">
                            {formatDate(s.started_at)}{" "}
                            <span className="font-normal text-[#6f7a73]">at {formatTime(s.started_at)}</span>
                          </p>
                          {s.chief_complaint && (
                            <p className="mt-0.5 text-xs text-[#3c4a43]">{s.chief_complaint}</p>
                          )}
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[10px] text-[#a8b5ad] uppercase tracking-wide"
                              style={{ fontFamily: "var(--font-mono)" }}>
                              {s.status}
                            </span>
                            {s.duration_seconds && (
                              <>
                                <span className="text-[#d3e5d9]">·</span>
                                <span className="text-[10px] text-[#a8b5ad]">{formatDuration(s.duration_seconds)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {s.final_tier ? (
                        <span className={`shrink-0 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${TIER_STYLES[s.final_tier] ?? ""}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${TIER_DOT[s.final_tier] ?? ""}`} />
                          {TIER_LABELS[s.final_tier] ?? s.final_tier}
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full border border-[#e8e5dc] px-2.5 py-1 text-[10px] text-[#a8b5ad]">
                          In progress
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  );
}
