"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
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
      <p className="text-sm text-muted-foreground py-2">
        No active sessions in queue.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {active.map((session) => (
        <Card
          key={session.id}
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => router.push(`/admin/${session.id}`)}
        >
          <CardContent className="py-3 px-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-mono font-medium">
                {session.id.slice(0, 8)}…
              </p>
              <p className="text-xs text-muted-foreground uppercase">
                {session.language}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {relativeTime(session.started_at)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
