"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { TranscriptEntry } from "@/lib/types";
import type { CallStatus } from "@/hooks/useVapiCall";

interface Props {
  transcript: TranscriptEntry[];
  status: CallStatus;
}

export default function TranscriptPanel({ transcript, status }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  return (
    <div className="pc-card overflow-hidden">
      <div className="pc-card-head">
        <strong className="font-medium text-[#14241c]">Conversation transcript</strong>
        <span>{transcript.length} turns</span>
      </div>
      <ScrollArea className="h-[420px]">
      <div className="grid gap-4 p-5">
        {transcript.length === 0 && (
          <div className="py-12 text-center text-[11px] uppercase text-[#97a199]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>
            Your conversation will appear here
          </div>
        )}
        {transcript.map((entry, i) => (
          <div
            key={i}
            className={cn(
              "grid grid-cols-[70px_1fr] items-baseline gap-3 text-sm leading-6",
              entry.role === "assistant" ? "text-[#14241c]" : "text-[#3c4a43]"
            )}
          >
            <span className="pt-1 text-[10.5px] text-[#97a199]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>
              {new Date(entry.ts).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <div>
              <span
                className={cn(
                  "mb-1 inline-block rounded px-2 py-0.5 text-[10px] uppercase",
                  entry.role === "assistant"
                    ? "bg-[#edf4ee] text-[#1e6a47]"
                    : "bg-[#faf8f1] text-[#3c4a43]"
                )}
                style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.14em" }}
              >
                {entry.role === "user" ? "Patient" : "Asha"}
              </span>
              <p>{entry.text}</p>
            </div>
          </div>
        ))}
        {status === "active" && (
          <div className="grid grid-cols-[70px_1fr] items-center gap-3 text-sm text-[#6f7a73]">
            <span className="text-[10.5px] text-[#97a199]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>
              live
            </span>
            <div className="flex items-center gap-3 rounded-lg border border-[#e8e5dc] bg-white px-3 py-2">
              <div className="flex h-5 items-center gap-[3px]">
                {[10, 16, 8, 14, 6].map((peak, index) => (
                  <span
                    key={index}
                    className="block w-[3px] rounded-full bg-[#2f8b5e]"
                    style={{
                      "--peak": `${peak}px`,
                      animation: "pc-wave 1.4s ease-in-out infinite",
                      animationDelay: `${index * 90}ms`,
                    } as CSSProperties}
                  />
                ))}
              </div>
              <span>Asha is listening</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      </ScrollArea>
    </div>
  );
}
