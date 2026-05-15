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
    wrapCls: "border-red-200 bg-red-50",
    iconCls: "text-red-600",
    textCls: "text-red-700",
  },
  admin_review: {
    Icon: Info,
    label: "Admin Review",
    wrapCls: "border-blue-200 bg-blue-50",
    iconCls: "text-blue-600",
    textCls: "text-blue-700",
  },
  error: {
    Icon: XCircle,
    label: "Error",
    wrapCls: "border-gray-200 bg-gray-50",
    iconCls: "text-gray-600",
    textCls: "text-gray-700",
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
    <div className="space-y-2">
      {entries.map((entry) => {
        const cfg =
          EVENT_CONFIG[entry.event_type as keyof typeof EVENT_CONFIG] ??
          FALLBACK;
        const { Icon } = cfg;
        return (
          <div
            key={entry.id}
            className={cn("rounded-lg border p-3 space-y-2", cfg.wrapCls)}
          >
            <div className="flex items-center gap-2">
              <Icon className={cn("w-4 h-4 shrink-0", cfg.iconCls)} />
              <span className={cn("text-xs font-semibold", cfg.textCls)}>
                {cfg.label}
              </span>
              <span className="text-xs opacity-60 ml-auto">
                {formatTime(entry.created_at)}
              </span>
            </div>
            {entry.details && (
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-all font-mono">
                {JSON.stringify(entry.details, null, 2)}
              </pre>
            )}
          </div>
        );
      })}
    </div>
  );
}
