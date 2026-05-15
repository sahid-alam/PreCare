import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Mic,
  ShieldCheck,
} from "lucide-react";
import { HeroCard } from "@/components/landing/HeroCard";
import { FadeIn } from "@/components/landing/FadeIn";
import { PageLoader } from "@/components/landing/PageLoader";

const tiers = [
  {
    tone: "green",
    label: "Home Care",
    badge: "Low acuity",
    description: "Minor, self-limiting symptoms with no red flags.",
    items: ["Rest and fluids", "Clear watch-outs", "Escalate if symptoms persist"],
    color: "#2f8b5e",
    bg: "#edf4ee",
    border: "#d7e8dc",
  },
  {
    tone: "amber",
    label: "Clinic Visit",
    badge: "Moderate",
    description: "Symptoms that need clinician review, but not immediate emergency care.",
    items: ["GP within 24-72 hours", "Case summary ready", "ER triggers explained"],
    color: "#d4a03c",
    bg: "#faefd5",
    border: "#e9c58a",
  },
  {
    tone: "red",
    label: "Emergency Room",
    badge: "High risk",
    description: "Red-flag patterns that need immediate medical attention.",
    items: ["Call 108 now", "Do not drive yourself", "Server-side override audit"],
    color: "#c8473b",
    bg: "#fbe5e1",
    border: "#e59a92",
  },
];

const steps = [
  {
    icon: Mic,
    title: "Talk to Asha",
    copy: "Speak symptoms naturally. Asha asks one focused follow-up at a time and logs each distinct symptom.",
  },
  {
    icon: Activity,
    title: "Screen for red flags",
    copy: "The interview checks cardiac, stroke, respiratory, bleeding, neurological, sepsis, obstetric, and safety signals.",
  },
  {
    icon: ShieldCheck,
    title: "Get a care tier",
    copy: "A server-side safety layer can override unsafe low-acuity answers before the final recommendation is shown.",
  },
];

export default function LandingPage() {
  return (
    <>
    <PageLoader />
    <main className="bg-[#ece9e1] p-2 text-[#14241c] sm:p-3.5">
      <section className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[28px] border border-[#14241c]/10 bg-[#fcfbf7] shadow-[0_30px_60px_-30px_rgba(20,36,28,0.18)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_18%_60%,rgba(155,201,172,0.55)_0%,rgba(155,201,172,0.32)_28%,rgba(155,201,172,0.1)_55%,rgba(155,201,172,0)_75%),radial-gradient(40%_50%_at_38%_90%,rgba(47,139,94,0.18)_0%,rgba(47,139,94,0)_60%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-50 mix-blend-multiply [background-image:radial-gradient(rgba(20,36,28,0.08)_1px,transparent_1px)] [background-size:18px_18px]" />

        <nav className="relative z-10 flex items-center justify-between gap-4 px-5 py-5 sm:px-9">
          <Link href="/" className="pc-brand text-[22px]">
            <div className="pc-mark h-7 w-7">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1.5V12.5M1.5 7H12.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              PreCare
              <small className="block text-[11px] font-normal text-[#6f7a73]">Health · Triage</small>
            </div>
          </Link>

          <div className="hidden gap-9 text-sm text-[#3c4a43] md:flex">
            <a href="#how" className="hover:text-[#14241c]">How it works</a>
            <a href="#tiers" className="hover:text-[#14241c]">Tiers</a>
            <a href="#safety" className="hover:text-[#14241c]">Safety</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/my-sessions"
              className="hidden rounded-full border border-[#14241c]/20 bg-white/50 px-4 py-2 text-sm font-medium backdrop-blur transition-colors hover:bg-white sm:inline-flex"
            >
              My Sessions
            </Link>
            <Link
              href="/admin/login"
              className="rounded-full border border-[#14241c]/20 bg-white/50 px-4 py-2 text-sm font-medium backdrop-blur transition-colors hover:bg-white"
            >
              Admin Login
            </Link>
          </div>
        </nav>

        <div className="relative z-10 grid min-h-[560px] items-end gap-10 px-6 pb-12 pt-12 sm:px-14 sm:pb-16 sm:pt-20 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <div
              className="lp-fade-up mb-8 inline-flex items-center gap-2 rounded-full border border-[#14241c]/10 bg-white/75 px-3.5 py-2 text-sm font-medium text-[#3c4a43] backdrop-blur"
              style={{ animationDelay: "0.05s" }}
            >
              <span
                className="h-2 w-2 rounded-full bg-[#2f8b5e]"
                style={{ animation: "lp-live-ring 1.4s ease-out infinite" }}
              />
              Asha v1 · Voice triage live
            </div>

            <h1
              className="lp-fade-up font-display max-w-4xl text-[42px] font-semibold leading-none text-[#14241c] sm:text-[64px] lg:text-[78px]"
              style={{ animationDelay: "0.15s" }}
            >
              Describe your symptoms. Get instant{" "}
              <em className="font-serif-display font-normal italic text-[#1e6a47]">triage</em>{" "}
              guidance.
            </h1>

            <p
              className="lp-fade-up mt-6 max-w-xl text-[17px] leading-7 text-[#3c4a43]"
              style={{ animationDelay: "0.28s" }}
            >
              Asha interviews you by voice, checks symptoms against emergency red flags, and tells you whether to rest at home, see a doctor, or go to the ER.
            </p>

            <div
              className="lp-fade-up mt-9 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "0.38s" }}
            >
              <Link
                href="/triage"
                className="inline-flex items-center gap-3 rounded-full bg-[#1e6a47] px-6 py-4 text-[15px] font-medium text-white shadow-[0_10px_24px_-8px_rgba(30,106,71,0.6)] transition-colors hover:bg-[#0f3a26]"
              >
                Start Triage
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-3 rounded-full border border-[#14241c]/20 px-5 py-4 text-[15px] font-medium text-[#14241c] transition-colors hover:bg-[#14241c]/5"
              >
                How it works
              </a>
            </div>

            <div
              className="lp-fade-up mt-4 flex flex-wrap items-center gap-2 text-sm text-[#6f7a73]"
              style={{ animationDelay: "0.48s" }}
            >
              <span>No account needed</span>
              <span className="h-1 w-1 rounded-full bg-[#6f7a73]" />
              <span>Anonymous</span>
              <span className="h-1 w-1 rounded-full bg-[#6f7a73]" />
              <span>Browser voice call</span>
            </div>
          </div>

          <div
            className="lp-slide-right hidden justify-self-end lg:block"
            style={{ animationDelay: "0.3s" }}
          >
            <HeroCard />
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto mt-3 max-w-[1440px] rounded-[28px] border border-[#14241c]/5 bg-[#fcfbf7] px-6 py-14 sm:px-14 sm:py-20">
        <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="pc-eyebrow mb-4">01 · Process</div>
            <h2 className="font-display max-w-lg text-[34px] font-medium leading-tight sm:text-[44px]">
              Three steps, five minutes, one{" "}
              <em className="font-serif-display font-normal italic text-[#1e6a47]">clear answer.</em>
            </h2>
          </div>
          <p className="max-w-md text-[15px] leading-6 text-[#3c4a43]">
            No forms, no waiting rooms. Asha walks through a structured intake and keeps the call focused.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <FadeIn key={step.title} delay={index * 0.1}>
                <article className="min-h-[280px] rounded-[18px] border border-[#e8e5dc] bg-[#faf8f1] p-7">
                  <div className="mb-7 text-xs text-[#6f7a73]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
                    STEP / {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl border border-[#dad6cb] bg-white text-[#1e6a47]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display mb-2 text-[22px] font-medium">{step.title}</h3>
                  <p className="text-[14.5px] leading-6 text-[#3c4a43]">{step.copy}</p>
                </article>
              </FadeIn>
            );
          })}
        </div>
      </section>

      <section id="tiers" className="mx-auto mt-3 max-w-[1440px] rounded-[28px] border border-[#14241c]/5 bg-[#fcfbf7] px-6 py-14 sm:px-14 sm:py-20">
        <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="pc-eyebrow mb-4">02 · Outcomes</div>
            <h2 className="font-display max-w-lg text-[34px] font-medium leading-tight sm:text-[44px]">
              A simple care tier with{" "}
              <em className="font-serif-display font-normal italic text-[#1e6a47]">specific next steps.</em>
            </h2>
          </div>
          <p className="max-w-md text-[15px] leading-6 text-[#3c4a43]">
            The final card uses the same green, amber, and red system used by staff in the admin dashboard.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {tiers.map((tier, i) => (
            <FadeIn key={tier.label} delay={i * 0.12}>
            <article
              className="relative min-h-[320px] overflow-hidden rounded-[20px] border bg-white p-7"
              style={{ borderColor: tier.border }}
            >
              <div className="absolute bottom-0 left-0 top-0 w-1" style={{ backgroundColor: tier.color }} />
              <div
                className="mb-6 inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-[11px] uppercase"
                style={{
                  backgroundColor: tier.bg,
                  borderColor: tier.border,
                  color: tier.color,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.12em",
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tier.color }} />
                {tier.badge}
              </div>
              <h3 className="font-display mb-2 text-[28px] font-medium">{tier.label}</h3>
              <p className="mb-6 text-sm leading-6 text-[#3c4a43]">{tier.description}</p>
              <ul className="grid gap-3">
                {tier.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-[#3c4a43]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: tier.color }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
            </FadeIn>
          ))}
        </div>
      </section>

      <section id="safety" className="mx-auto mt-3 flex max-w-[1440px] flex-col gap-4 rounded-[22px] border border-[#eedcae] bg-[#faefd5] p-6 text-[#4f3a0f] sm:flex-row sm:items-center sm:px-9">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f2dfa1] text-[#7a4f0b]">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <p className="text-sm leading-6">
          <strong className="font-semibold text-[#2d1f00]">Safety layer:</strong> final assessments are checked by server-side red-flag logic. The LLM cannot bypass emergency overrides.
        </p>
        <span className="rounded-full bg-[#2d1f00] px-4 py-2 text-xs uppercase text-[#faefd5] sm:ml-auto" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>
          Emergency? Call 108
        </span>
      </section>

      <footer className="mx-auto mt-3 grid max-w-[1440px] gap-8 rounded-[28px] bg-[#14241c] px-6 py-10 text-[#bfc8c2] sm:px-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="pc-brand text-white">
            <div className="pc-mark" />
            <div>
              PreCare
              <small className="block text-[11px] font-normal text-[#8c998f]">Health · Triage</small>
            </div>
          </div>
          <p className="font-display mt-5 max-w-sm text-xl leading-snug text-white">
            Browser voice triage with real-time clinical oversight.
          </p>
        </div>
        <div>
          <h4 className="mb-4 text-[11px] uppercase text-[#6f8079]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.14em" }}>
            Product
          </h4>
          <ul className="grid gap-2 text-sm">
            <li><Link href="/triage" className="hover:text-white">Start triage</Link></li>
            <li><Link href="/my-sessions" className="hover:text-white">My sessions</Link></li>
            <li><a href="#how" className="hover:text-white">How it works</a></li>
            <li><a href="#tiers" className="hover:text-white">Care tiers</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-[11px] uppercase text-[#6f8079]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.14em" }}>
            Staff
          </h4>
          <ul className="grid gap-2 text-sm">
            <li><Link href="/admin/login" className="hover:text-white">Admin login</Link></li>
            <li><Link href="/admin" className="hover:text-white">Live dashboard</Link></li>
          </ul>
        </div>
        <div className="border-t border-white/10 pt-6 text-xs text-[#6f8079] md:col-span-3">
          This is an AI triage assistant, not a diagnostic tool. If you believe you are experiencing a medical emergency, call 108 immediately.
        </div>
      </footer>
    </main>
    </>
  );
}
