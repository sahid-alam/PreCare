"use client";

import type { Session } from "@/lib/types";

interface Props {
  sessions: Session[];
}

export default function ActiveCallsBanner({ sessions }: Props) {
  const count = sessions.filter((s) => s.status === "active").length;

  if (count === 0) {
    return (
      <p className="text-sm text-muted-foreground">No active calls right now.</p>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
      </span>
      <span className="text-sm font-medium text-green-700">
        {count} active call{count !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
