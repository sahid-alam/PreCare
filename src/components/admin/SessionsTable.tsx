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
  home: { label: "Home", cls: "bg-[#edf4ee] text-[#1e6a47] border-[#d7e8dc]" },
  clinic: { label: "Clinic", cls: "bg-[#faefd5] text-[#8a5a12] border-[#e9c58a]" },
  er: { label: "Emergency", cls: "bg-[#fbe5e1] text-[#9f2d24] border-[#e59a92]" },
};

const statusCls: Record<string, string> = {
  active: "bg-[#edf4ee] text-[#1e6a47] border-[#d7e8dc]",
  complete: "bg-[#faf8f1] text-[#3c4a43] border-[#e8e5dc]",
  failed: "bg-[#fbe5e1] text-[#9f2d24] border-[#e59a92]",
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
      <div className="rounded-xl border border-[#e8e5dc] bg-white p-10 text-center text-sm text-[#6f7a73]">
        No sessions yet. Start a triage call from the patient page.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#e8e5dc] bg-white">
      <div className="flex items-center justify-between border-b border-[#e8e5dc] px-4 py-3 text-[11px] uppercase text-[#6f7a73]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>
        <strong className="font-medium text-[#14241c]">Recent sessions</strong>
        <span>{sessions.length} loaded</span>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-[#faf8f1]">
          <tr>
            {["Session ID", "Status", "Tier", "Lang", "Duration", "Started", ""].map(
              (h, i) => (
                <th
                  key={h}
                  className={cn(
                    "border-b border-[#e8e5dc] px-4 py-3 text-left text-[10px] font-medium uppercase text-[#6f7a73]",
                    i >= 3 && i < 6 && "hidden md:table-cell",
                    i >= 5 && i < 6 && "hidden lg:table-cell"
                  )}
                  style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
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
                className="cursor-pointer border-b border-[#e8e5dc] transition-colors last:border-b-0 hover:bg-[#faf8f1]"
                onClick={() => router.push(`/admin/${session.id}`)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#14241c]" style={{ fontFamily: "var(--font-mono)" }}>
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
                    className={cn("rounded-full text-[10.5px] capitalize", sCls)}
                  >
                    {session.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {tierCfg ? (
                    <Badge
                      variant="outline"
                      className={cn("rounded-full text-[10.5px]", tierCfg.cls)}
                    >
                      {tierCfg.label}
                    </Badge>
                  ) : (
                    <span className="text-xs text-[#97a199]">—</span>
                  )}
                </td>
                <td className="hidden px-4 py-3 text-xs uppercase text-[#3c4a43] md:table-cell">
                  {session.language}
                </td>
                <td className="hidden px-4 py-3 text-xs text-[#3c4a43] md:table-cell" style={{ fontFamily: "var(--font-mono)" }}>
                  {formatDuration(session.duration_seconds)}
                </td>
                <td className="hidden px-4 py-3 text-xs text-[#6f7a73] lg:table-cell">
                  {formatDate(session.started_at)}
                </td>
                <td className="px-4 py-3 text-right text-[#97a199] transition-colors group-hover:text-[#1e6a47]">
                  →
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
