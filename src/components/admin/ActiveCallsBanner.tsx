"use client";

import type { Session } from "@/lib/types";

interface Props {
  sessions: Session[];
}

export default function ActiveCallsBanner({ sessions }: Props) {
  const count = sessions.filter((s) => s.status === "active").length;

  if (count === 0) {
    return (
      <span className="text-[11px] normal-case text-[#6f7a73]" style={{ fontFamily: "var(--font-mono)" }}>
        no active calls
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2f8b5e]" />
      </span>
      <span className="text-[11px] normal-case text-[#1e6a47]" style={{ fontFamily: "var(--font-mono)" }}>
        {count} active call{count !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
