"use client";

import { AlertTriangle, Download } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DISCLAIMER_TEXT } from "@/lib/constants";
import type { SubmitTriageAssessmentPayload } from "@/lib/types";

interface Props {
  classification: SubmitTriageAssessmentPayload | null;
  sessionId: string | null;
}

const tierConfig = {
  home: {
    label: "Home Care",
    badge: "border-[#d7e8dc] bg-[#edf4ee] text-[#1e6a47]",
    border: "border-[#d7e8dc]",
    accent: "#2f8b5e",
    printBg: "#dcfce7",
    printColor: "#166534",
    printBorder: "#86efac",
  },
  clinic: {
    label: "Clinic Visit",
    badge: "border-[#e9c58a] bg-[#faefd5] text-[#8a5a12]",
    border: "border-[#e9c58a]",
    accent: "#d4a03c",
    printBg: "#fef3c7",
    printColor: "#92400e",
    printBorder: "#fcd34d",
  },
  er: {
    label: "Emergency Room",
    badge: "border-[#e59a92] bg-[#fbe5e1] text-[#9f2d24]",
    border: "border-[#e59a92]",
    accent: "#c8473b",
    printBg: "#fee2e2",
    printColor: "#991b1b",
    printBorder: "#fca5a5",
  },
} as const;

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildReportHTML(
  c: SubmitTriageAssessmentPayload,
  sessionId: string | null
): string {
  const cfg = tierConfig[c.tier];
  const now = new Date().toLocaleString("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const actionsRows = c.recommended_actions
    .map((a) => `<li>${esc(a)}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Asha — Triage Report</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;max-width:640px;margin:0 auto;padding:40px 32px}
.header{border-bottom:1px solid #e5e7eb;padding-bottom:20px;margin-bottom:24px}
.app-name{font-size:22px;font-weight:800;letter-spacing:-.5px}
.app-sub{font-size:13px;color:#6b7280;margin-top:2px}
.meta{font-size:12px;color:#9ca3af;margin-top:6px}
.tier{display:inline-block;padding:8px 20px;border-radius:8px;border:1px solid;font-size:15px;font-weight:800;letter-spacing:.05em;margin:20px 0 8px;background:${cfg.printBg};color:${cfg.printColor};border-color:${cfg.printBorder}}
.rf{display:inline-block;margin-left:8px;padding:4px 10px;border-radius:6px;background:#fef2f2;color:#991b1b;border:1px solid #fca5a5;font-size:11px;font-weight:700;vertical-align:middle}
.emergency{background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:12px 16px;margin:16px 0;color:#991b1b;font-weight:700;font-size:14px}
.section{margin-top:18px}
.label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#6b7280;margin-bottom:5px}
.value{font-size:14px;line-height:1.6;color:#1f2937}
ul{padding-left:18px}
li{font-size:14px;line-height:1.9;color:#1f2937}
.disclaimer{font-size:11px;color:#9ca3af;border-top:1px solid #f3f4f6;margin-top:28px;padding-top:16px;line-height:1.7}
@media print{button{display:none}}
</style>
</head>
<body>
<div class="header">
  <div class="app-name">Asha</div>
  <div class="app-sub">AI Healthcare Triage Assistant</div>
  <div class="meta">Report generated: ${esc(now)}${sessionId ? ` &nbsp;·&nbsp; Session: ${esc(sessionId.slice(0, 8))}` : ""}</div>
</div>

<div class="tier">${esc(cfg.label)}</div>${c.red_flag_triggered ? '<span class="rf">Red Flag Override</span>' : ""}

${c.tier === "er" ? '<div class="emergency">⚠ CALL 112 IMMEDIATELY — This is a medical emergency</div>' : ""}

${c.chief_complaint ? `<div class="section"><div class="label">Chief Complaint</div><div class="value">${esc(c.chief_complaint)}</div></div>` : ""}
${c.reasoning ? `<div class="section"><div class="label">Assessment</div><div class="value">${esc(c.reasoning)}</div></div>` : ""}
${actionsRows ? `<div class="section"><div class="label">Recommended Actions</div><ul>${actionsRows}</ul></div>` : ""}

<div class="disclaimer">${esc(DISCLAIMER_TEXT)}</div>
</body>
</html>`;
}

export default function ClassificationCard({ classification, sessionId }: Props) {
  if (!classification) return null;

  const cfg = tierConfig[classification.tier];

  function handleDownload() {
    if (!classification) return;
    const html = buildReportHTML(classification, sessionId);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) {
      win.addEventListener("load", () => {
        win.print();
        URL.revokeObjectURL(url);
      });
    } else {
      URL.revokeObjectURL(url);
    }
  }

  return (
    <Card className={cn("overflow-hidden rounded-[16px] bg-white", cfg.border)}>
      <CardHeader className="border-b border-[#e8e5dc] bg-[#faf8f1] pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn("rounded-full px-3 py-1 text-[10.5px] font-medium uppercase", cfg.badge)}
              style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}
            >
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.accent }} />
              {cfg.label}
            </Badge>
            {classification.red_flag_triggered && (
              <Badge variant="destructive" className="rounded-full text-xs">
                Red Flag Override
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-full border-[#dad6cb] bg-white text-xs text-[#3c4a43] hover:bg-[#faf8f1]"
            onClick={handleDownload}
          >
            <Download className="w-3.5 h-3.5" />
            Report
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {classification.tier === "er" && (
          <div className="flex items-start gap-3 rounded-lg border border-[#e59a92] bg-[#fbe5e1] p-3">
            <AlertTriangle className="w-5 h-5 text-[#c8473b] shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-[#9f2d24]">
              CALL 108 IMMEDIATELY — This is a medical emergency
            </p>
          </div>
        )}

        {classification.chief_complaint && (
          <div>
            <p className="mb-1 text-[10px] uppercase text-[#6f7a73]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}>
              Chief Complaint
            </p>
            <p className="text-sm text-[#14241c]">{classification.chief_complaint}</p>
          </div>
        )}

        {classification.reasoning && (
          <div>
            <p className="mb-1 text-[10px] uppercase text-[#6f7a73]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}>
              Assessment
            </p>
            <p className="text-sm leading-6 text-[#3c4a43]">{classification.reasoning}</p>
          </div>
        )}

        {classification.recommended_actions.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] uppercase text-[#6f7a73]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}>
              Recommended Actions
            </p>
            <ul className="space-y-1">
              {classification.recommended_actions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#3c4a43]">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: cfg.accent }} />
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}

        {sessionId && (
          <p className="text-xs text-[#6f7a73]">
            Session: {sessionId.slice(0, 8)}
          </p>
        )}

        <p className="border-t border-[#e8e5dc] pt-3 text-xs leading-5 text-[#6f7a73]">
          {DISCLAIMER_TEXT}
        </p>
      </CardContent>
    </Card>
  );
}
