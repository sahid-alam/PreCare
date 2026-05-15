"use client";

import { useState } from "react";
import { ArrowRight, Check, ShieldAlert } from "lucide-react";
import { DISCLAIMER_TEXT } from "@/lib/constants";

interface Props {
  onAccept: () => void;
}

export default function DisclaimerGate({ onAccept }: Props) {
  const [checked, setChecked] = useState(false);

  function handleContinue() {
    if (!checked) return;
    onAccept();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#14241c]/60 p-6 backdrop-blur-md">
      <div className="relative w-full max-w-xl overflow-hidden rounded-[18px] bg-white p-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] sm:p-9">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_100%_0%,rgba(155,201,172,0.32)_0%,rgba(155,201,172,0)_70%)]" />
        <div className="relative">
          <div className="mb-5">
            <span className="pc-eyebrow">Before we start</span>
          </div>

          <h1 className="font-display mb-3 text-[30px] font-medium leading-tight">
            Asha is here to help, not to{" "}
            <em className="font-serif-display text-[#1e6a47]">replace</em> a clinician.
          </h1>

          <p className="mb-4 text-sm leading-6 text-[#3c4a43]">
            {DISCLAIMER_TEXT}
          </p>

          <ul className="mb-5 grid gap-3 text-sm text-[#3c4a43]">
            {[
              "Asha does not diagnose, prescribe, or replace consultation with a licensed medical professional.",
              "The transcript is logged anonymously for quality review and red-flag auditing.",
              "If symptoms feel life-threatening, call emergency services now instead of waiting.",
            ].map((item) => (
              <li key={item} className="grid grid-cols-[18px_1fr] gap-3">
                <Check className="mt-1 h-3.5 w-3.5 text-[#1e6a47]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-[10px] border border-[#e8e5dc] bg-[#faf8f1] p-4 text-sm leading-6 text-[#14241c]">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-[#1e6a47]"
            />
            <span>
              I understand this is not a substitute for professional medical
              advice and agree to anonymous transcript review.
            </span>
          </label>

          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-[#1e6a47] px-5 py-3 text-sm font-medium text-white shadow-[0_10px_24px_-8px_rgba(30,106,71,0.45)] transition-colors hover:bg-[#0f3a26] disabled:pointer-events-none disabled:opacity-45"
              disabled={!checked}
              onClick={handleContinue}
            >
              Start call with Asha
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 flex items-center gap-2 border-t border-[#e8e5dc] pt-4 text-[11px] uppercase text-[#9f2d24]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
            <ShieldAlert className="h-3.5 w-3.5" />
            Emergency? Call 108 immediately.
          </div>
        </div>
      </div>
    </div>
  );
}
