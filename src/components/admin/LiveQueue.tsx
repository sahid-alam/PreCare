"use client";

import { useRouter } from "next/navigation";
import type { Session } from "@/lib/types";

interface Props {
  sessions: Session[];
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes === 1) return "1 min ago";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "1 hr ago";
  return `${hours} hr ago`;
}

export default function LiveQueue({ sessions }: Props) {
  const router = useRouter();
  const active = sessions.filter((s) => s.status === "active");

  if (active.length === 0) {
    return (
      <p className="py-4 text-sm text-[#6f7a73]">
        No active sessions in queue.
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      {active.map((session) => (
        <button
          type="button"
          key={session.id}
          className="flex items-center justify-between rounded-[10px] border border-[#e8e5dc] bg-[#faf8f1] px-4 py-3 text-left transition-colors hover:bg-white"
          onClick={() => router.push(`/admin/${session.id}`)}
        >
          <div>
              <p className="text-sm font-medium text-[#14241c]" style={{ fontFamily: "var(--font-mono)" }}>
                {session.id.slice(0, 8)}…
              </p>
              <p className="text-[10px] uppercase text-[#6f7a73]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>
                {session.language}
              </p>
            </div>
            <p className="text-xs text-[#6f7a73]">
              {relativeTime(session.started_at)}
            </p>
        </button>
      ))}
    </div>
  );
}
