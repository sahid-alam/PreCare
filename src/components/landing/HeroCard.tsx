"use client";

import { useEffect, useRef, useState } from "react";

const BARS = [6, 18, 10, 24, 8, 20, 5, 22, 14, 18, 7, 26, 11, 19, 6, 23, 12, 17, 9, 21];

const DURATIONS = [0.9, 0.75, 1.05, 0.8, 1.1, 0.7, 0.95, 0.85, 1.0, 0.78,
                   0.88, 0.72, 1.02, 0.83, 0.97, 0.76, 0.91, 0.86, 1.08, 0.74];

const QUOTE = `“I’ve had chest pressure for the last hour, and I feel dizzy.”`;

const tiers = [
  { color: "#2f8b5e", bg: "#edf4ee", border: "#d7e8dc", label: "Home Care",       action: "—" },
  { color: "#d4a03c", bg: "#faefd5", border: "#e9c58a", label: "Clinic Visit",    action: "—" },
  { color: "#c8473b", bg: "#fbe5e1", border: "#e59a92", label: "Emergency Room",  action: "Call 108" },
];

function fmtTime(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function HeroCard() {
  const [seconds, setSeconds] = useState(4 * 60 + 21);
  const [typed, setTyped] = useState("");
  const [cursorOn, setCursorOn] = useState(true);
  const typingDone = useRef(false);

  // Timer
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Typewriter
  useEffect(() => {
    let i = 0;
    const tick = () => {
      i++;
      setTyped(QUOTE.slice(0, i));
      if (i < QUOTE.length) {
        setTimeout(tick, 28 + Math.random() * 18);
      } else {
        typingDone.current = true;
      }
    };
    const start = setTimeout(tick, 600);
    return () => clearTimeout(start);
  }, []);

  // Cursor blink
  useEffect(() => {
    const id = setInterval(() => setCursorOn((c) => !c), 520);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="lp-float w-[420px] rounded-[20px] border border-[#14241c]/10 bg-white/70 p-5 shadow-[0_40px_80px_-30px_rgba(20,36,28,0.22)] backdrop-blur">
      {/* Header row */}
      <div
        className="mb-4 flex items-center justify-between text-xs text-[#6f7a73]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <span>SESSION · {fmtTime(seconds)}</span>
        <span className="inline-flex items-center gap-1.5 text-[#1e6a47]">
          <span
            className="h-2 w-2 rounded-full bg-[#2f8b5e]"
            style={{ animation: "lp-live-ring 1.4s ease-out infinite" }}
          />
          LIVE
        </span>
      </div>

      {/* You said */}
      <div className="font-display text-[15px] leading-snug text-[#14241c]">
        <span
          className="mb-1 block text-[10px] uppercase text-[#6f7a73]"
          style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}
        >
          You said
        </span>
        <span>
          {typed}
          <span
            className="inline-block w-[2px] h-[1em] align-middle bg-[#1e6a47] rounded-full ml-[1px]"
            style={{ opacity: cursorOn ? 1 : 0, transition: "opacity 0.1s" }}
          />
        </span>
      </div>

      {/* Animated waveform */}
      <div className="my-4 flex h-[30px] items-center gap-[3px]">
        {BARS.map((peak, i) => (
          <span
            key={i}
            className="w-[3px] rounded-full bg-[#2f8b5e]"
            style={{
              ["--peak" as string]: `${peak}px`,
              animation: `lp-wave-bar ${DURATIONS[i]}s ease-in-out infinite`,
              animationDelay: `${(i * 0.07).toFixed(2)}s`,
            }}
          />
        ))}
      </div>

      {/* Asha label */}
      <div
        className="mb-3 flex items-center gap-2 text-[10px] uppercase text-[#6f7a73]"
        style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full bg-[#2f8b5e]"
          style={{ animation: "pc-pulse 1.6s ease-in-out infinite" }}
        />
        Asha is analysing
        <span style={{ animation: "lp-blink 1s step-end infinite" }}>…</span>
      </div>

      {/* Tier cards */}
      <div className="grid gap-2">
        {tiers.map((tier, i) => (
          <div
            key={tier.label}
            className="flex items-center gap-3 rounded-xl border p-3 text-sm"
            style={{
              borderColor: i === 2 ? "rgba(200,71,59,0.4)" : "#e8e5dc",
              background: i === 2 ? tier.bg : "#ffffff",
              boxShadow: i === 2 ? "0 0 0 3px rgba(200,71,59,0.07)" : "none",
              animation: `lp-tier-slide 0.5s cubic-bezier(.22,1,.36,1) both`,
              animationDelay: `${0.9 + i * 0.15}s`,
            }}
          >
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: tier.color }}
            />
            <span className="font-medium text-[#14241c]">{tier.label}</span>
            <span
              className="ml-auto text-[11px]"
              style={{
                fontFamily: "var(--font-mono)",
                color: i === 2 ? tier.color : "#6f7a73",
                fontWeight: i === 2 ? 600 : 400,
              }}
            >
              {tier.action}
            </span>
          </div>
        ))}
      </div>

      {/* Safety badge */}
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#edf4ee] px-3 py-2 text-[11px] text-[#1e6a47]"
        style={{ animation: "lp-fade-up 0.5s cubic-bezier(.22,1,.36,1) both", animationDelay: "1.4s" }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#2f8b5e]" />
        <span style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>
          Server-side red-flag check passed
        </span>
      </div>
    </div>
  );
}
