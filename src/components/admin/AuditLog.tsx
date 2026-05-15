"use client";

import { AlertTriangle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditLogEntry } from "@/lib/types";

interface Props {
  entries: AuditLogEntry[];
}

const EVENT_CONFIG = {
  red_flag_override: {
    Icon: AlertTriangle,
    label: "Red Flag Override",
    wrapCls: "border-[#e59a92] bg-[#fbe5e1]",
    iconCls: "text-[#c8473b]",
    textCls: "text-[#9f2d24]",
  },
  admin_review: {
    Icon: Info,
    label: "Admin Review",
    wrapCls: "border-[#d7e8dc] bg-[#edf4ee]",
    iconCls: "text-[#1e6a47]",
    textCls: "text-[#1e6a47]",
  },
  error: {
    Icon: XCircle,
    label: "Error",
    wrapCls: "border-[#e8e5dc] bg-[#faf8f1]",
    iconCls: "text-[#6f7a73]",
    textCls: "text-[#3c4a43]",
  },
} as const;

const FALLBACK = EVENT_CONFIG.error;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function AuditLog({ entries }: Props) {
  return (
    <div className="pc-card overflow-hidden">
      <div className="pc-card-head">
        <strong className="font-medium text-[#14241c]">Audit log</strong>
        <span>{entries.length} events</span>
      </div>
      <div className="grid gap-2 p-4">
      {entries.length === 0 && (
        <p className="py-4 text-sm text-[#6f7a73]">No audit events yet.</p>
      )}
      {entries.map((entry) => {
        const cfg =
          EVENT_CONFIG[entry.event_type as keyof typeof EVENT_CONFIG] ??
          FALLBACK;
        const { Icon } = cfg;
        return (
          <div
            key={entry.id}
            className={cn("space-y-2 rounded-lg border p-3", cfg.wrapCls)}
          >
            <div className="flex items-center gap-2">
              <Icon className={cn("w-4 h-4 shrink-0", cfg.iconCls)} />
              <span className={cn("text-xs font-semibold", cfg.textCls)}>
                {cfg.label}
              </span>
              <span className="ml-auto text-xs opacity-60">
                {formatTime(entry.created_at)}
              </span>
            </div>
            {entry.details && (
              <pre className="overflow-x-auto whitespace-pre-wrap break-all text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                {JSON.stringify(entry.details, null, 2)}
              </pre>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}
