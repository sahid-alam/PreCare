"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, LogIn, UserPlus, LogOut, Clock, ChevronRight, History } from "lucide-react";
import type { PatientProfile, AppLanguage } from "@/lib/types";
import { KNOWN_CONDITIONS } from "@/lib/types";
import { usePatientProfile } from "@/hooks/usePatientProfile";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

interface PastSession {
  id: string;
  started_at: string;
  status: string;
  final_tier: string | null;
  duration_seconds: number | null;
}

interface Props {
  onStart: (profile: PatientProfile, lang: AppLanguage) => void;
}

const LANG_OPTIONS: { value: AppLanguage; label: string; native: string }[] = [
  { value: "en", label: "English", native: "English" },
  { value: "hi", label: "Hindi", native: "हिन्दी" },
  { value: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
];

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const TIER_STYLES: Record<string, string> = {
  home: "bg-green-100 text-green-800",
  clinic: "bg-amber-100 text-amber-800",
  er: "bg-red-100 text-red-800",
};

const TIER_LABELS: Record<string, string> = {
  home: "Home Care",
  clinic: "Clinic Visit",
  er: "Emergency",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function PatientIntake({ onStart }: Props) {
  const {
    userEmail, isAuthenticated, profile, setProfile, loading,
    saveProfile, email, setEmail, password, setPassword, authError,
    signIn, signUp, signOut,
  } = usePatientProfile();

  const [lang, setLang] = useState<AppLanguage>("en");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pastSessions, setPastSessions] = useState<PastSession[]>([]);

  // Load past sessions when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    const supabase = getSupabaseBrowserClient();
    void supabase
      .from("sessions")
      .select("id, started_at, status, final_tier, duration_seconds")
      .order("started_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setPastSessions(data as PastSession[]);
      });
  }, [isAuthenticated]);

  async function handleAuth() {
    if (!email || !password) return;
    setSubmitting(true);
    const ok = authMode === "signin" ? await signIn(email, password) : await signUp(email, password);
    setSubmitting(false);
    if (ok) setShowAuthForm(false);
  }

  async function handleStart() {
    await saveProfile(profile);
    onStart(profile, lang);
  }

  function toggleCondition(c: string) {
    setProfile((prev) => ({
      ...prev,
      knownConditions: prev.knownConditions.includes(c)
        ? prev.knownConditions.filter((x) => x !== c)
        : [...prev.knownConditions, c],
    }));
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f4f1e9]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1e6a47] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f4f1e9]">
      <div className="mx-auto max-w-xl px-4 py-10">

        {/* Header */}
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#14241c]">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M7 1.5V12.5M1.5 7H12.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-[#14241c]">PreCare · Intake</span>
          </div>
          <h1 className="font-display text-3xl font-medium leading-tight text-[#14241c]">
            {isAuthenticated ? (
              <>Welcome back, <em className="font-serif-display text-[#1e6a47]">let&apos;s begin.</em></>
            ) : (
              <>Before we begin, <br /><em className="font-serif-display text-[#1e6a47]">tell Asha about you.</em></>
            )}
          </h1>
        </div>

        {/* ── Account section ───────────────────────────────────────────── */}
        {isAuthenticated ? (
          // Signed-in state
          <div className="mb-6 rounded-xl border border-[#d3e5d9] bg-white p-4">
            {/* Account row */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#14241c]">{userEmail}</p>
                <p className="text-xs text-[#6f7a73]">Profile saved to your account</p>
              </div>
              <button
                onClick={() => void signOut()}
                className="flex items-center gap-1 text-xs text-[#a8b5ad] hover:text-red-500 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>

            {/* Past sessions preview */}
            <div className="mt-4 border-t border-[#f0ede4] pt-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6f7a73]">
                  Recent sessions
                </p>
                <Link
                  href="/my-sessions"
                  className="flex items-center gap-1 text-[11px] font-medium text-[#1e6a47] hover:underline"
                >
                  <History className="h-3 w-3" />
                  View all
                </Link>
              </div>

              {pastSessions.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-lg bg-[#f4f1e9] px-4 py-5 text-center">
                  <p className="text-xs text-[#6f7a73]">No sessions yet — fill in your profile below and start your first call.</p>
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {pastSessions.map((s) => (
                    <li key={s.id} className="flex items-center justify-between rounded-lg bg-[#f4f1e9] px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 shrink-0 text-[#6f7a73]" />
                        <span className="text-xs text-[#3c4a43]">{formatDate(s.started_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.final_tier && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TIER_STYLES[s.final_tier] ?? ""}`}>
                            {TIER_LABELS[s.final_tier] ?? s.final_tier}
                          </span>
                        )}
                        <span className="text-[10px] text-[#a8b5ad]">{s.status}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Prominent sessions link */}
              <Link
                href="/my-sessions"
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#d3e5d9] py-2 text-xs font-medium text-[#1e6a47] transition-colors hover:bg-[#edf4ee]"
              >
                <History className="h-3.5 w-3.5" />
                Go to My Sessions
              </Link>
            </div>
          </div>
        ) : (
          // Guest state — sign in / sign up
          <div className="mb-6 rounded-xl border border-[#d3e5d9] bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[#14241c]">Have an account?</p>
                <p className="text-xs text-[#6f7a73]">Sign in to load your profile and see past sessions.</p>
              </div>
              <button
                onClick={() => setShowAuthForm((v) => !v)}
                className="shrink-0 text-xs font-medium text-[#1e6a47] underline underline-offset-2 hover:no-underline"
              >
                {showAuthForm ? "Cancel" : "Sign in / Sign up"}
              </button>
            </div>

            {showAuthForm && (
              <div className="mt-3 space-y-2">
                {/* Mode toggle */}
                <div className="flex rounded-lg border border-[#d3e5d9] p-0.5">
                  {(["signin", "signup"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => { setAuthMode(m); }}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors ${
                        authMode === m ? "bg-[#14241c] text-white" : "text-[#6f7a73] hover:text-[#14241c]"
                      }`}
                    >
                      {m === "signin" ? <LogIn className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}
                      {m === "signin" ? "Sign in" : "Create account"}
                    </button>
                  ))}
                </div>

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#d3e5d9] px-3 py-2 text-sm text-[#14241c] placeholder-[#a8b5ad] focus:border-[#1e6a47] focus:outline-none"
                />
                <input
                  type="password"
                  placeholder="Password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void handleAuth()}
                  className="w-full rounded-lg border border-[#d3e5d9] px-3 py-2 text-sm text-[#14241c] placeholder-[#a8b5ad] focus:border-[#1e6a47] focus:outline-none"
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
            )}
          </div>
        )}

        {/* ── Language ──────────────────────────────────────────────────── */}
        <div className="mb-6">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#6f7a73]">Language</p>
          <div className="flex gap-2">
            {LANG_OPTIONS.map((l) => (
              <button
                key={l.value}
                onClick={() => setLang(l.value)}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-center text-sm font-medium transition-colors ${
                  lang === l.value
                    ? "border-[#1e6a47] bg-[#1e6a47] text-white"
                    : "border-[#d3e5d9] bg-white text-[#14241c] hover:border-[#1e6a47]"
                }`}
              >
                <span className="block">{l.native}</span>
                <span className="block text-[10px] font-normal opacity-70">{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Basic info ────────────────────────────────────────────────── */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#6f7a73]">Age</label>
            <input
              type="number" min={1} max={120} placeholder="e.g. 34"
              value={profile.age ?? ""}
              onChange={(e) => setProfile((prev) => ({ ...prev, age: e.target.value ? Number(e.target.value) : null }))}
              className="w-full rounded-lg border border-[#d3e5d9] bg-white px-3 py-2.5 text-sm text-[#14241c] placeholder-[#a8b5ad] focus:border-[#1e6a47] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#6f7a73]">Gender</label>
            <select
              value={profile.gender ?? ""}
              onChange={(e) => setProfile((prev) => ({ ...prev, gender: (e.target.value || null) as PatientProfile["gender"] }))}
              className="w-full rounded-lg border border-[#d3e5d9] bg-white px-3 py-2.5 text-sm text-[#14241c] focus:border-[#1e6a47] focus:outline-none"
            >
              <option value="">Select</option>
              {GENDER_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
        </div>

        {/* ── Known conditions ──────────────────────────────────────────── */}
        <div className="mb-6">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#6f7a73]">Known conditions</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {KNOWN_CONDITIONS.map((c) => {
              const checked = profile.knownConditions.includes(c);
              return (
                <label
                  key={c}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                    checked ? "border-[#1e6a47] bg-[#edf4ee] text-[#1e6a47]" : "border-[#d3e5d9] bg-white text-[#3c4a43] hover:border-[#1e6a47]"
                  }`}
                >
                  <input type="checkbox" checked={checked} onChange={() => toggleCondition(c)} className="sr-only" />
                  <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border transition-colors ${checked ? "border-[#1e6a47] bg-[#1e6a47]" : "border-[#a8b5ad]"}`}>
                    {checked && (
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {c}
                </label>
              );
            })}
          </div>
        </div>

        {/* ── Medications & Allergies ───────────────────────────────────── */}
        <div className="mb-6 grid gap-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#6f7a73]">Current medications</label>
            <input
              type="text" placeholder="e.g. Metformin 500mg, Aspirin 75mg"
              value={profile.currentMedications}
              onChange={(e) => setProfile((prev) => ({ ...prev, currentMedications: e.target.value }))}
              className="w-full rounded-lg border border-[#d3e5d9] bg-white px-3 py-2.5 text-sm text-[#14241c] placeholder-[#a8b5ad] focus:border-[#1e6a47] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#6f7a73]">Known allergies</label>
            <input
              type="text" placeholder="e.g. Penicillin, Sulfa drugs"
              value={profile.knownAllergies}
              onChange={(e) => setProfile((prev) => ({ ...prev, knownAllergies: e.target.value }))}
              className="w-full rounded-lg border border-[#d3e5d9] bg-white px-3 py-2.5 text-sm text-[#14241c] placeholder-[#a8b5ad] focus:border-[#1e6a47] focus:outline-none"
            />
          </div>
        </div>

        {/* ── Optional vitals ───────────────────────────────────────────── */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#6f7a73]">Last BP (optional)</label>
            <input
              type="text" placeholder="e.g. 130/85"
              value={profile.lastBp}
              onChange={(e) => setProfile((prev) => ({ ...prev, lastBp: e.target.value }))}
              className="w-full rounded-lg border border-[#d3e5d9] bg-white px-3 py-2.5 text-sm text-[#14241c] placeholder-[#a8b5ad] focus:border-[#1e6a47] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#6f7a73]">Blood sugar (optional)</label>
            <input
              type="text" placeholder="e.g. 110 mg/dL"
              value={profile.bloodSugar}
              onChange={(e) => setProfile((prev) => ({ ...prev, bloodSugar: e.target.value }))}
              className="w-full rounded-lg border border-[#d3e5d9] bg-white px-3 py-2.5 text-sm text-[#14241c] placeholder-[#a8b5ad] focus:border-[#1e6a47] focus:outline-none"
            />
          </div>
        </div>

        {/* ── Start button ──────────────────────────────────────────────── */}
        <button
          onClick={() => void handleStart()}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1e6a47] py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(30,106,71,0.5)] transition-all hover:bg-[#185c3d] active:scale-[0.98]"
        >
          Start Triage with Asha
          <ArrowRight className="h-4 w-4" />
        </button>
        <p className="mt-3 text-center text-xs text-[#a8b5ad]">
          This is not a substitute for professional medical advice. Call 108 in an emergency.
        </p>
      </div>
    </div>
  );
}
