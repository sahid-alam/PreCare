"use client";

import { Mic, MicOff, PhoneOff, Loader2 } from "lucide-react";
import type { CallStatus } from "@/hooks/useVapiCall";

interface Props {
  status: CallStatus;
  isMuted: boolean;
  lang: "en" | "hi";
  onStart: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
}

export default function CallControls({
  status,
  isMuted,
  onStart,
  onEnd,
  onToggleMute,
}: Props) {
  if (status === "idle") {
    return (
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full bg-[#2f8b5e] px-5 py-2.5 text-sm font-semibold text-[#14241c] transition-colors hover:bg-[#9bc9ac]"
        onClick={onStart}
      >
        <Mic className="w-5 h-5" />
        Start call
      </button>
    );
  }

  if (status === "connecting") {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm text-[#bfc8c2]"
      >
        <Loader2 className="w-5 h-5 animate-spin" />
        Connecting
      </button>
    );
  }

  if (status === "active") {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-2 text-xs uppercase text-[#bfc8c2] sm:flex" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>
          <span className="h-2 w-2 rounded-full bg-[#2f8b5e] shadow-[0_0_0_3px_rgba(47,139,94,0.3)]" />
          Live
        </span>
        <span className="h-5 w-px bg-white/10" />
        <button
          type="button"
          onClick={onToggleMute}
          className={
            isMuted
              ? "grid h-9 w-9 place-items-center rounded-full bg-[#d4a03c] text-[#14241c]"
              : "grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/15"
          }
          aria-label={isMuted ? "Unmute call" : "Mute call"}
        >
          {isMuted ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>
        <button
          type="button"
          onClick={onEnd}
          className="inline-flex items-center gap-2 rounded-full bg-[#9f2d24] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7c1f18]"
        >
          <PhoneOff className="w-4 h-4" />
          End Call
        </button>
      </div>
    );
  }

  if (status === "ended") {
    return (
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full bg-[#2f8b5e] px-5 py-2.5 text-sm font-semibold text-[#14241c] transition-colors hover:bg-[#9bc9ac]"
        onClick={onStart}
      >
        <Mic className="w-5 h-5" />
        New call
      </button>
    );
  }

  // error state
  return (
    <button
      type="button"
      onClick={onStart}
      className="inline-flex items-center gap-2 rounded-full border border-[#e59a92] bg-[#fbe5e1] px-5 py-2.5 text-sm font-semibold text-[#9f2d24]"
    >
      Try Again
    </button>
  );
}
