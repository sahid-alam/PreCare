"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DISCLAIMER_TEXT } from "@/lib/constants";

interface Props {
  onAccept: (lang: "en" | "hi") => void;
}

export default function DisclaimerGate({ onAccept }: Props) {
  const [checked, setChecked] = useState(false);
  const [lang, setLang] = useState<"en" | "hi">("en");

  useEffect(() => {
    const stored = localStorage.getItem("asha_lang");
    if (stored === "en" || stored === "hi") setLang(stored);
  }, []);

  function toggleLang() {
    const next = lang === "en" ? "hi" : "en";
    setLang(next);
    localStorage.setItem("asha_lang", next);
  }

  function handleContinue() {
    if (!checked) return;
    localStorage.setItem("asha_lang", lang);
    onAccept(lang);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Asha — AI Triage Assistant</CardTitle>
            <button
              onClick={toggleLang}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              {lang === "en" ? "English / हिन्दी" : "हिन्दी / English"}
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm leading-relaxed text-muted-foreground border-l-4 border-amber-400 pl-3 py-1">
            {DISCLAIMER_TEXT}
          </p>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border border-gray-300 accent-black cursor-pointer"
            />
            <span className="text-sm leading-relaxed">
              I understand this is not a substitute for professional medical
              advice
            </span>
          </label>
          <Button
            className="w-full"
            disabled={!checked}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
