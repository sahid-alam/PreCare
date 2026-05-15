"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Session, CareTier } from "@/lib/types";

interface Props {
  sessions: Session[];
}

const tierConfig: Record<CareTier, { label: string; cls: string }> = {
  home: { label: "Home", cls: "bg-green-100 text-green-800 border-green-200" },
  clinic: { label: "Clinic", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  er: { label: "ER", cls: "bg-red-100 text-red-800 border-red-200" },
};

const statusCls: Record<string, string> = {
  active: "bg-blue-100 text-blue-800 border-blue-200",
  complete: "bg-gray-100 text-gray-800 border-gray-200",
  failed: "bg-red-100 text-red-800 border-red-200",
};

function formatDuration(s: number | null): string {
  if (!s) return "—";
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SessionsTable({ sessions }: Props) {
  const router = useRouter();

  if (sessions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        No sessions yet. Start a triage call from the patient page.
      </p>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            {["Session", "Status", "Tier", "Lang", "Duration", "Started"].map(
              (h, i) => (
                <th
                  key={h}
                  className={cn(
                    "text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase",
                    i >= 3 && "hidden md:table-cell",
                    i >= 5 && "hidden lg:table-cell"
                  )}
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y">
          {sessions.map((session) => {
            const tierCfg = session.final_tier
              ? tierConfig[session.final_tier]
              : null;
            const sCls =
              statusCls[session.status] ??
              "bg-gray-100 text-gray-800 border-gray-200";
            return (
              <tr
                key={session.id}
                className="hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => router.push(`/admin/${session.id}`)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">
                      {session.id.slice(0, 8)}
                    </span>
                    {session.red_flag_triggered && (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={cn("text-xs capitalize", sCls)}
                  >
                    {session.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {tierCfg ? (
                    <Badge
                      variant="outline"
                      className={cn("text-xs", tierCfg.cls)}
                    >
                      {tierCfg.label}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs uppercase hidden md:table-cell">
                  {session.language}
                </td>
                <td className="px-4 py-3 text-xs hidden md:table-cell">
                  {formatDuration(session.duration_seconds)}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                  {formatDate(session.started_at)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
