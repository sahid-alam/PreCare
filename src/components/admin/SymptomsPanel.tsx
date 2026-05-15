"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Symptom } from "@/lib/types";

interface Props {
  symptoms: Symptom[];
}

const severityStyles: Record<string, string> = {
  mild: "bg-green-100 text-green-800 border-green-200",
  moderate: "bg-yellow-100 text-yellow-800 border-yellow-200",
  severe: "bg-red-100 text-red-800 border-red-200",
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SymptomsPanel({ symptoms }: Props) {
  if (symptoms.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No symptoms identified yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {symptoms.map((s) => (
        <div key={s.id} className="flex items-start justify-between gap-2">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium capitalize">{s.name}</span>
              {s.severity && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs capitalize px-2 py-0",
                    severityStyles[s.severity] ??
                      "bg-gray-100 text-gray-700 border-gray-200"
                  )}
                >
                  {s.severity}
                </Badge>
              )}
            </div>
            {s.duration && (
              <p className="text-xs text-muted-foreground">{s.duration}</p>
            )}
            {s.notes && (
              <p className="text-xs text-muted-foreground italic">{s.notes}</p>
            )}
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatTime(s.created_at)}
          </span>
        </div>
      ))}
    </div>
  );
}
