"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SymptomEntry } from "@/lib/types";

interface Props {
  symptoms: SymptomEntry[];
}

const severityStyles: Record<string, string> = {
  mild: "bg-green-100 text-green-800 border-green-200",
  moderate: "bg-yellow-100 text-yellow-800 border-yellow-200",
  severe: "bg-red-100 text-red-800 border-red-200",
};

export default function SymptomCards({ symptoms }: Props) {
  if (symptoms.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Symptoms will appear here as they are identified
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {symptoms.map((s, i) => (
        <div
          key={i}
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <Badge
            variant="outline"
            className={cn(
              "px-3 py-1 text-sm font-medium capitalize",
              severityStyles[s.severity] ??
                "bg-gray-100 text-gray-700 border-gray-200"
            )}
          >
            {s.name}
            {s.duration && (
              <span className="ml-1 opacity-70 text-xs">· {s.duration}</span>
            )}
          </Badge>
        </div>
      ))}
    </div>
  );
}
