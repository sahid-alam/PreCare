"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight, Clock, LogIn, UserPlus, ChevronRight,
  Bell, BellRing, Stethoscope, Plus, Trash2, X, ShieldCheck,
} from "lucide-react";
import { usePatientProfile } from "@/hooks/usePatientProfile";
import { useReminders } from "@/hooks/useReminders";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

interface Session {
  id: string;
  started_at: string;
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
  home: "Home Care", clinic: "Clinic Visit", er: "Emergency",
};
const TIER_DOT: Record<string, string> = {
  home: "bg-green-500", clinic: "bg-amber-500", er: "bg-red-500",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}
function formatDuration(secs: number | null) {
  if (!secs) return null;
  const m = Math.floor(secs / 60), s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function MySessionsPage() {
  const {
    userId, userEmail, isAuthenticated, loading,
    email, setEmail, password, setPassword, authError,
    signIn, signUp, signOut,
  } = usePatientProfile();

  const { reminders, dueNow, addReminder, deleteReminder, dismissDue } = useReminders(
    isAuthenticated ? userId : null
  );

  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [submitting, setSubmitting] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Side panel state
  const [panelOpen, setPanelOpen] = useState(false);

  // Add form state
  const [rName, setRName] = useState("");
  const [rDose, setRDose] = useState("");
  const [rTime1, setRTime1] = useState("08:00");
  const [rTime2, setRTime2] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setSessionsLoading(true);
    const supabase = getSupabaseBrowserClient();
    void supabase
      .from("sessions")
      .select("id, started_at, status, final_tier, chief_complaint, duration_seconds")
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

  async function handleAddReminder() {
    if (!rName.trim()) return;
    await addReminder({ name: rName.trim(), dose: rDose.trim(), times: [rTime1, rTime2].filter(Boolean) });
    setRName(""); setRDose(""); setRTime1("08:00"); setRTime2("");
    setShowAddForm(false);
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

      {/* ── Due-now toasts ─────────────────────────────── */}
      {dueNow.length > 0 && (
        <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-2">
          {dueNow.map((r) => (
            <div key={r.id} className="flex max-w-xs items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg">
              <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900">Time to take your medication</p>
                <p className="text-xs text-amber-700">{r.name}{r.dose ? ` — ${r.dose}` : ""}</p>
              </div>
              <button onClick={() => dismissDue(r)} className="text-amber-400 hover:text-amber-600 text-lg leading-none">×</button>
            </div>
          ))}
        </div>
      )}

      {/* ── Reminders slide panel ──────────────────────── */}
      {/* Backdrop */}
      <div
        onClick={() => setPanelOpen(false)}
        className={`fixed inset-0 z-30 bg-[#14241c]/30 backdrop-blur-sm transition-opacity duration-300 ${
          panelOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 z-40 flex h-full w-full max-w-sm flex-col bg-[#fefbf0] shadow-2xl transition-transform duration-300 ease-in-out ${
          panelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between border-b border-[#e8d5a0] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
              <Bell className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#14241c]">Medication Reminders</h2>
              <p className="text-[10px] text-[#6f7a73]">Notifies you within 15 min of each time</p>
            </div>
          </div>
          <button
            onClick={() => setPanelOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#a8b5ad] transition-colors hover:bg-[#f0ede4] hover:text-[#14241c]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Panel body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Due now highlight */}
          {dueNow.length > 0 && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                <BellRing className="h-3.5 w-3.5" /> {dueNow.length} reminder{dueNow.length > 1 ? "s" : ""} due now
              </p>
              {dueNow.map((r) => (
                <div key={r.id} className="flex items-center justify-between">
                  <span className="text-xs text-amber-700">{r.name}{r.dose ? ` — ${r.dose}` : ""}</span>
                  <button onClick={() => dismissDue(r)} className="text-[10px] text-amber-500 underline hover:no-underline">Dismiss</button>
                </div>
              ))}
            </div>
          )}

          {/* Reminders list */}
          {reminders.length === 0 && !showAddForm ? (
            <div className="mb-4 rounded-xl border border-dashed border-amber-200 bg-white px-4 py-8 text-center">
              <Bell className="mx-auto mb-2 h-7 w-7 text-amber-200" />
              <p className="text-sm font-medium text-[#6f7a73]">No reminders yet</p>
              <p className="mt-0.5 text-xs text-[#a8b5ad]">Add one below to get notified.</p>
            </div>
          ) : (
            <ul className="mb-4 divide-y divide-[#f0e8c8]">
              {reminders.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      {dueNow.some((d) => d.id === r.id) && (
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      )}
                      <p className="text-sm font-medium text-[#14241c]">
                        {r.name}
                        {r.dose && <span className="ml-1 text-xs font-normal text-[#6f7a73]">— {r.dose}</span>}
                      </p>
                    </div>
                    <p className="mt-0.5 text-xs text-[#a8b5ad]">{r.times.join(" · ")}</p>
                  </div>
                  <button onClick={() => void deleteReminder(r.id)} className="ml-3 shrink-0 text-[#c9b8b5] hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Add form */}
          {showAddForm ? (
            <div className="space-y-2.5 rounded-xl border border-amber-200 bg-white p-4">
              <input placeholder="Medication name *" value={rName} onChange={(e) => setRName(e.target.value)}
                className="w-full rounded-lg border border-[#e8d5a0] px-3 py-2 text-sm placeholder-[#a8b5ad] focus:border-amber-400 focus:outline-none" />
              <input placeholder="Dose (e.g. 500mg)" value={rDose} onChange={(e) => setRDose(e.target.value)}
                className="w-full rounded-lg border border-[#e8d5a0] px-3 py-2 text-sm placeholder-[#a8b5ad] focus:border-amber-400 focus:outline-none" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="mb-1 text-[10px] text-[#6f7a73]">Time 1</p>
                  <input type="time" value={rTime1} onChange={(e) => setRTime1(e.target.value)}
                    className="w-full rounded-lg border border-[#e8d5a0] px-2 py-2 text-sm focus:border-amber-400 focus:outline-none" />
                </div>
                <div>
                  <p className="mb-1 text-[10px] text-[#6f7a73]">Time 2 (opt.)</p>
                  <input type="time" value={rTime2} onChange={(e) => setRTime2(e.target.value)}
                    className="w-full rounded-lg border border-[#e8d5a0] px-2 py-2 text-sm focus:border-amber-400 focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => void handleAddReminder()} disabled={!rName.trim()}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-500 py-2 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-40">
                  <Plus className="h-3.5 w-3.5" /> Save
                </button>
                <button onClick={() => setShowAddForm(false)}
                  className="rounded-lg border border-[#e8d5a0] px-4 py-2 text-xs text-[#6f7a73] hover:border-amber-300">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddForm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white py-3 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-50">
              <Plus className="h-4 w-4" /> Add reminder
            </button>
          )}
        </div>
      </aside>

      {/* ── Header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-[#d7e8dc] bg-[#f4f1e9]/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-[#14241c]">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#14241c]">
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                <path d="M7 1.5V12.5M1.5 7H12.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            PreCare
          </Link>

          {/* Signed-in pill — sits right after the logo */}
          {isAuthenticated && (
            <div className="flex items-center gap-1.5 rounded-full border border-[#d3e5d9] bg-white px-3 py-1">
              <span className="max-w-[140px] truncate text-xs font-medium text-[#14241c]">{userEmail}</span>
              <span className="text-[#d3e5d9]">·</span>
              <button
                onClick={() => void signOut()}
                className="text-[10px] text-[#a8b5ad] transition-colors hover:text-red-500"
              >
                Sign out
              </button>
            </div>
          )}

          {/* Push actions to the right */}
          <div className="ml-auto flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={() => setPanelOpen(true)}
                className="relative flex items-center gap-1.5 rounded-full border border-[#e8d5a0] bg-[#fefbf0] px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50"
              >
                <Bell className="h-3.5 w-3.5" />
                Reminders
                {dueNow.length > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
                    {dueNow.length}
                  </span>
                )}
              </button>
            )}
            <Link
              href="/triage"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#1e6a47] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#185c3d]"
            >
              New triage <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────── */}
      <main className={`mx-auto px-4 py-8 ${isAuthenticated ? "max-w-2xl" : "max-w-4xl"}`}>
        <h1 className="font-display mb-1 text-2xl font-medium">My Sessions</h1>
        {!isAuthenticated && (
          <p className="mb-6 text-sm text-[#6f7a73]">Sign in to view your triage history and medication reminders.</p>
        )}
        {isAuthenticated && <p className="mb-8 text-sm text-[#6f7a73]">Your triage history. Use the Reminders button to manage medications.</p>}

        {/* Auth gate */}
        {!isAuthenticated ? (
          <div className="mt-2 grid gap-4 lg:grid-cols-[1fr_420px]">
            {/* Left — brand panel */}
            <div className="hidden overflow-hidden rounded-2xl bg-[#14241c] px-10 py-12 lg:flex lg:flex-col lg:justify-between">
              <div>
                <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1.5V12.5M1.5 7H12.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                <h2 className="font-display mb-3 text-[28px] font-semibold leading-tight text-white">
                  Your triage history,<br />
                  <em className="font-serif-display font-normal italic text-[#9bc9ac]">always with you.</em>
                </h2>
                <p className="text-sm leading-6 text-[#6f8079]">
                  Sign in to review past calls, see your care tier outcomes, and manage medication reminders.
                </p>
              </div>

              <div className="mt-10 space-y-2.5">
                {[
                  { dot: "#2f8b5e", label: "Home Care", sub: "Rest at home with watch-outs" },
                  { dot: "#d4a03c", label: "Clinic Visit", sub: "See a GP within 24–72 hours" },
                  { dot: "#c8473b", label: "Emergency Room", sub: "Call 108 — do not wait" },
                ].map((t) => (
                  <div key={t.label} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-4 py-3">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: t.dot }} />
                    <div>
                      <p className="text-sm font-medium text-white">{t.label}</p>
                      <p className="text-[11px] text-[#6f8079]">{t.sub}</p>
                    </div>
                  </div>
                ))}

                <div className="flex items-center gap-2.5 pt-2 text-[11px] text-[#6f8079]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#2f8b5e]" />
                  Server-side red-flag override — the AI cannot bypass emergency escalations
                </div>
              </div>
            </div>

            {/* Right — form */}
            <div className="rounded-2xl border border-[#d7e8dc] bg-white p-8 shadow-sm">
              {/* Mode toggle */}
              <div className="mb-7 flex rounded-xl border border-[#e8e5dc] bg-[#f4f1e9] p-1">
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setAuthMode(m)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                      authMode === m
                        ? "bg-white text-[#14241c] shadow-sm"
                        : "text-[#6f7a73] hover:text-[#14241c]"
                    }`}
                  >
                    {m === "signin" ? <LogIn className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
                    {m === "signin" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <h3 className="font-display text-xl font-semibold text-[#14241c]">
                  {authMode === "signin" ? "Welcome back" : "Create your account"}
                </h3>
                <p className="mt-1 text-sm text-[#6f7a73]">
                  {authMode === "signin"
                    ? "Sign in to view your triage history."
                    : "Free account — no credit card needed."}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#3c4a43]">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#d3e5d9] bg-[#fafaf8] px-4 py-3 text-sm text-[#14241c] placeholder-[#b0bdb5] transition-colors focus:border-[#1e6a47] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#3c4a43]">Password</label>
                  <input
                    type="password"
                    placeholder={authMode === "signup" ? "At least 6 characters" : "••••••••"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && void handleAuth()}
                    className="w-full rounded-xl border border-[#d3e5d9] bg-[#fafaf8] px-4 py-3 text-sm text-[#14241c] placeholder-[#b0bdb5] transition-colors focus:border-[#1e6a47] focus:bg-white focus:outline-none"
                  />
                </div>

                {authError && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                    <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                    <p className="text-xs text-red-700">{authError}</p>
                  </div>
                )}

                <button
                  onClick={() => void handleAuth()}
                  disabled={submitting || !email || !password}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e6a47] py-3 text-sm font-semibold text-white shadow-[0_4px_12px_-4px_rgba(30,106,71,0.5)] transition-all hover:bg-[#0f3a26] disabled:opacity-50 disabled:shadow-none"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Please wait…
                    </>
                  ) : (
                    <>
                      {authMode === "signin" ? "Sign in" : "Create account"}
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 border-t border-[#e8e5dc] pt-5 text-center">
                <p className="text-xs text-[#6f7a73]">
                  No account?{" "}
                  <Link href="/triage" className="font-medium text-[#1e6a47] hover:underline">
                    Start a triage without signing in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#6f7a73]">Triage History</h2>

            {sessionsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1e6a47] border-t-transparent" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="rounded-xl border border-[#d7e8dc] bg-white px-6 py-14 text-center">
                <Stethoscope className="mx-auto mb-3 h-8 w-8 text-[#a8b5ad]" />
                <p className="text-sm font-medium text-[#14241c]">No sessions yet</p>
                <p className="mt-1 text-xs text-[#6f7a73]">Start a triage call to see your history here.</p>
                <Link href="/triage" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#1e6a47] px-4 py-2 text-xs font-medium text-white hover:bg-[#185c3d]">
                  Start triage <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {sessions.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/my-sessions/${s.id}`}
                      className="group block rounded-xl border border-[#e8e5dc] bg-white p-4 transition-all hover:border-[#c5d9ca] hover:shadow-[0_4px_16px_-6px_rgba(20,36,28,0.1)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#a8b5ad]" />
                          <div>
                            <p className="text-sm font-medium text-[#14241c]">
                              {formatDate(s.started_at)}{" "}
                              <span className="font-normal text-[#6f7a73]">at {formatTime(s.started_at)}</span>
                            </p>
                            {s.chief_complaint && <p className="mt-0.5 text-xs text-[#3c4a43]">{s.chief_complaint}</p>}
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-[10px] uppercase tracking-wide text-[#a8b5ad]" style={{ fontFamily: "var(--font-mono)" }}>{s.status}</span>
                              {s.duration_seconds && (
                                <><span className="text-[#d3e5d9]">·</span><span className="text-[10px] text-[#a8b5ad]">{formatDuration(s.duration_seconds)}</span></>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {s.final_tier ? (
                            <span className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${TIER_STYLES[s.final_tier] ?? ""}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${TIER_DOT[s.final_tier] ?? ""}`} />
                              {TIER_LABELS[s.final_tier] ?? s.final_tier}
                            </span>
                          ) : (
                            <span className="rounded-full border border-[#e8e5dc] px-2.5 py-1 text-[10px] text-[#a8b5ad]">In progress</span>
                          )}
                          <ChevronRight className="h-4 w-4 text-[#c5d9ca] transition-transform group-hover:translate-x-0.5 group-hover:text-[#1e6a47]" />
                        </div>
                      </div>
                    </Link>
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
