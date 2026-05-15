"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import StatsDonut from "./StatsDonut";
import ActiveCallsBanner from "./ActiveCallsBanner";
import LiveQueue from "./LiveQueue";
import SessionsTable from "./SessionsTable";
import type { Session } from "@/lib/types";

interface Props {
  initialSessions: Session[];
}

export default function AdminDashboard({ initialSessions }: Props) {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel("admin-sessions")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sessions" },
        (payload) => {
          const newSession = payload.new as unknown as Session;
          setSessions((prev) => [newSession, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "sessions" },
        (payload) => {
          const updated = payload.new as unknown as Session;
          setSessions((prev) =>
            prev.map((s) => (s.id === updated.id ? updated : s))
          );
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Triage Distribution
          </h2>
          <StatsDonut sessions={sessions} />
        </div>
        <div className="md:col-span-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Live Queue
          </h2>
          <ActiveCallsBanner sessions={sessions} />
          <div className="mt-3">
            <LiveQueue sessions={sessions} />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          All Sessions
        </h2>
        <SessionsTable sessions={sessions} />
      </div>
    </div>
  );
}
