"use client";

import { useState } from "react";
import { ArrowRight, LogIn } from "lucide-react";
import type { PatientProfile, AppLanguage } from "@/lib/types";
import { KNOWN_CONDITIONS } from "@/lib/types";
import { usePatientProfile } from "@/hooks/usePatientProfile";

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

export default function PatientIntake({ onStart }: Props) {
  const { profile, setProfile, loading, saveProfile, email, setEmail, password, setPassword, authError, signUpOrIn } =
    usePatientProfile();
  const [lang, setLang] = useState<AppLanguage>("en");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleStart() {
    await saveProfile(profile);
    onStart(profile, lang);
  }

  async function handleSaveAccount() {
    if (!email || !password) return;
    setSaving(true);
    const ok = await signUpOrIn(email, password);
    setSaving(false);
    if (ok) setSaved(true);
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
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#14241c]">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M7 1.5V12.5M1.5 7H12.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-[#14241c]">PreCare · Intake</span>
          </div>
          <h1 className="font-display text-3xl font-medium leading-tight text-[#14241c]">
            Before we begin, <br />
            <em className="font-serif-display text-[#1e6a47]">tell Asha about you.</em>
          </h1>
          <p className="mt-2 text-sm text-[#3c4a43]">
            All fields are optional. The more context you share, the more accurate the triage.
          </p>
        </div>

        {/* Language */}
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

        {/* Basic info */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#6f7a73]">
              Age
            </label>
            <input
              type="number"
              min={1}
              max={120}
              placeholder="e.g. 34"
              value={profile.age ?? ""}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, age: e.target.value ? Number(e.target.value) : null }))
              }
              className="w-full rounded-lg border border-[#d3e5d9] bg-white px-3 py-2.5 text-sm text-[#14241c] placeholder-[#a8b5ad] focus:border-[#1e6a47] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#6f7a73]">
              Gender
            </label>
            <select
              value={profile.gender ?? ""}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  gender: (e.target.value || null) as PatientProfile["gender"],
                }))
              }
              className="w-full rounded-lg border border-[#d3e5d9] bg-white px-3 py-2.5 text-sm text-[#14241c] focus:border-[#1e6a47] focus:outline-none"
            >
              <option value="">Select</option>
              {GENDER_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Known conditions */}
        <div className="mb-6">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#6f7a73]">
            Known conditions
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {KNOWN_CONDITIONS.map((c) => {
              const checked = profile.knownConditions.includes(c);
              return (
                <label
                  key={c}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                    checked
                      ? "border-[#1e6a47] bg-[#edf4ee] text-[#1e6a47]"
                      : "border-[#d3e5d9] bg-white text-[#3c4a43] hover:border-[#1e6a47]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCondition(c)}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                      checked ? "border-[#1e6a47] bg-[#1e6a47]" : "border-[#a8b5ad]"
                    }`}
                  >
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

        {/* Medications & Allergies */}
        <div className="mb-6 grid gap-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#6f7a73]">
              Current medications
            </label>
            <input
              type="text"
              placeholder="e.g. Metformin 500mg, Aspirin 75mg"
              value={profile.currentMedications}
              onChange={(e) => setProfile((prev) => ({ ...prev, currentMedications: e.target.value }))}
              className="w-full rounded-lg border border-[#d3e5d9] bg-white px-3 py-2.5 text-sm text-[#14241c] placeholder-[#a8b5ad] focus:border-[#1e6a47] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#6f7a73]">
              Known allergies
            </label>
            <input
              type="text"
              placeholder="e.g. Penicillin, Sulfa drugs"
              value={profile.knownAllergies}
              onChange={(e) => setProfile((prev) => ({ ...prev, knownAllergies: e.target.value }))}
              className="w-full rounded-lg border border-[#d3e5d9] bg-white px-3 py-2.5 text-sm text-[#14241c] placeholder-[#a8b5ad] focus:border-[#1e6a47] focus:outline-none"
            />
          </div>
        </div>

        {/* Optional vitals */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#6f7a73]">
              Last BP (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 130/85"
              value={profile.lastBp}
              onChange={(e) => setProfile((prev) => ({ ...prev, lastBp: e.target.value }))}
              className="w-full rounded-lg border border-[#d3e5d9] bg-white px-3 py-2.5 text-sm text-[#14241c] placeholder-[#a8b5ad] focus:border-[#1e6a47] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#6f7a73]">
              Blood sugar (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 110 mg/dL"
              value={profile.bloodSugar}
              onChange={(e) => setProfile((prev) => ({ ...prev, bloodSugar: e.target.value }))}
              className="w-full rounded-lg border border-[#d3e5d9] bg-white px-3 py-2.5 text-sm text-[#14241c] placeholder-[#a8b5ad] focus:border-[#1e6a47] focus:outline-none"
            />
          </div>
        </div>

        {/* Save with email + password */}
        <div className="mb-6 rounded-xl border border-[#d3e5d9] bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[#14241c]">Save your profile</p>
              <p className="text-xs text-[#6f7a73]">Create an account to access your history from any device.</p>
            </div>
            <button
              onClick={() => setShowEmailForm((v) => !v)}
              className="shrink-0 text-xs font-medium text-[#1e6a47] underline underline-offset-2 hover:no-underline"
            >
              {showEmailForm ? "Cancel" : "Set up"}
            </button>
          </div>
          {showEmailForm && (
            <div className="mt-3 space-y-2">
              {saved ? (
                <p className="text-sm font-medium text-[#1e6a47]">Account saved — your profile is linked.</p>
              ) : (
                <>
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
                    className="w-full rounded-lg border border-[#d3e5d9] px-3 py-2 text-sm text-[#14241c] placeholder-[#a8b5ad] focus:border-[#1e6a47] focus:outline-none"
                  />
                  {authError && <p className="text-xs text-red-600">{authError}</p>}
                  <button
                    onClick={() => void handleSaveAccount()}
                    disabled={saving || !email || !password}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#14241c] py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    {saving ? "Saving…" : "Sign up / Sign in"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Start button */}
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
