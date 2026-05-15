"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (signInError) {
      setError(signInError.message);
    } else {
      router.push("/admin");
    }
  }

  return (
    <main className="grid min-h-screen bg-white text-[#14241c] lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden overflow-hidden bg-[#14241c] p-10 text-[#bfc8c2] lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_90%_100%,rgba(47,139,94,0.3)_0%,rgba(47,139,94,0)_65%),radial-gradient(40%_60%_at_10%_10%,rgba(155,201,172,0.1)_0%,rgba(155,201,172,0)_60%)]" />
        <div className="relative pc-brand text-white">
          <div className="pc-mark h-[30px] w-[30px]">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1.5V12.5M1.5 7H12.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            PreCare
            <small className="block text-[11px] font-normal text-[#6f8079]">Clinical operations</small>
          </div>
        </div>

        <div className="relative">
          <blockquote className="font-display max-w-[22ch] text-[30px] font-medium leading-tight text-white">
            Live triage oversight for every{" "}
            <em className="font-serif-display text-[#9bc9ac]">safety-critical</em> call.
          </blockquote>
          <div className="mt-4 text-[11px] uppercase text-[#6f8079]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>
            Red-flag audit console
          </div>
        </div>

        <div className="relative border-t border-white/10 pt-6">
          <div className="mb-4 flex items-center gap-2 text-[10px] uppercase text-[#6f8079]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.14em" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-[#2f8b5e] shadow-[0_0_0_3px_rgba(47,139,94,0.2)]" />
            Live system
          </div>
          <div className="grid grid-cols-3 gap-5">
            {[
              ["8", "active"],
              ["37", "red flags"],
              ["4:12", "avg min"],
            ].map(([value, label]) => (
              <div key={label}>
                <div className="text-[10px] uppercase text-[#6f8079]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}>
                  {label}
                </div>
                <div className="font-display mt-1 text-2xl font-medium text-white">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center bg-white px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="pc-eyebrow mb-5">Secure access</div>
          <h1 className="font-display text-[36px] font-medium leading-tight">
            Sign in to the <em className="font-serif-display text-[#1e6a47]">admin console.</em>
          </h1>
          <p className="mt-3 max-w-[42ch] text-sm leading-6 text-[#3c4a43]">
            Review live sessions, transcripts, red-flag overrides, and triage outcomes from the PreCare operations dashboard.
          </p>

          <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-4">
          <div className="grid gap-1.5">
            <label htmlFor="email" className="text-[10px] uppercase text-[#6f7a73]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}>
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="rounded-[10px] border border-[#dad6cb] bg-white px-3.5 py-3 text-sm outline-none transition-shadow focus:border-[#2f8b5e] focus:shadow-[0_0_0_3px_rgba(47,139,94,0.15)]"
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="password" className="text-[10px] uppercase text-[#6f7a73]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="rounded-[10px] border border-[#dad6cb] bg-white px-3.5 py-3 text-sm outline-none transition-shadow focus:border-[#2f8b5e] focus:shadow-[0_0_0_3px_rgba(47,139,94,0.15)]"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-[#e59a92] bg-[#fbe5e1] px-3 py-2 text-sm text-[#9f2d24]">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#1e6a47] px-4 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#0f3a26] disabled:pointer-events-none disabled:opacity-50"
            disabled={loading || !email || !password}
          >
            {loading ? "Signing in…" : "Sign in"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

          <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-[#e8e5dc] pt-5 text-[11px] text-[#97a199]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
            <LockKeyhole className="h-3.5 w-3.5" />
            Supabase Auth
            <span className="h-1 w-1 rounded-full bg-[#97a199]" />
            Audit protected
          </div>
      </div>
      </section>
    </main>
  );
}
