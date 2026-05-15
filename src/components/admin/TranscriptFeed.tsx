"use client";

import { useEffect, useRef } from "react";
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
    <ScrollArea className="h-[400px] rounded-lg border bg-muted/20">
      <div className="flex flex-col gap-2 p-3">
        {transcripts.length === 0 && (
          <p className="text-sm text-muted-foreground text-center mt-10">
            No transcript available yet
          </p>
        )}
        {transcripts.map((entry) => (
          <div
            key={entry.id}
            className={cn(
              "max-w-[85%] rounded-lg px-3 py-2 text-sm",
              entry.role === "user"
                ? "self-end bg-blue-600 text-white"
                : "self-start bg-white text-foreground border shadow-sm"
            )}
          >
            <p className="text-[10px] font-semibold mb-0.5 opacity-60 uppercase tracking-wide">
              {entry.role === "user" ? "Patient" : "Asha"}
            </p>
            {entry.content}
          </div>
        ))}
        {isActive && (
          <div className="self-start bg-white border shadow-sm rounded-lg px-3 py-2 text-sm text-muted-foreground flex gap-1 items-center">
            <span className="animate-bounce inline-block">●</span>
            <span
              className="animate-bounce inline-block"
              style={{ animationDelay: "150ms" }}
            >
              ●
            </span>
            <span
              className="animate-bounce inline-block"
              style={{ animationDelay: "300ms" }}
            >
              ●
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
