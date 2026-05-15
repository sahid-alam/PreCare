"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Transcript } from "@/lib/types";

interface Props {
  transcripts: Transcript[];
  isActive: boolean;
}

export default function TranscriptFeed({ transcripts, isActive }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts]);

  return (
    <div className="pc-card overflow-hidden">
      <div className="pc-card-head">
        <strong className="font-medium text-[#14241c]">Full transcript · {transcripts.length} turns</strong>
        <span>{isActive ? "live" : "stored"}</span>
      </div>
      <ScrollArea className="h-[620px]">
      <div className="grid gap-4 p-5">
        {transcripts.length === 0 && (
          <p className="py-10 text-center text-sm text-[#6f7a73]">
            No transcript available yet
          </p>
        )}
        {transcripts.map((entry) => (
          <div
            key={entry.id}
            className={cn(
              "grid grid-cols-[70px_1fr] items-baseline gap-3 text-sm leading-6",
              entry.role === "user" ? "text-[#3c4a43]" : "text-[#14241c]"
            )}
          >
            <span className="pt-1 text-[10.5px] text-[#97a199]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>
              {new Date(entry.created_at).toLocaleTimeString("en-IN", {
                minute: "2-digit",
                second: "2-digit",
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
              <p>{entry.content}</p>
            </div>
          </div>
        ))}
        {isActive && (
          <div className="grid grid-cols-[70px_1fr] items-center gap-3 text-sm text-[#6f7a73]">
            <span className="text-[10.5px] text-[#97a199]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>
              live
            </span>
            <div className="flex items-center gap-3 rounded-lg border border-[#e8e5dc] bg-white px-3 py-2">
              <div className="flex h-5 items-center gap-[3px]">
                {[10, 16, 8, 14, 6].map((peak, index) => (
                  <span
                    key={peak + index}
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
