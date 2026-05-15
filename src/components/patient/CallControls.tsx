"use client";

import { Mic, MicOff, PhoneOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CallStatus } from "@/hooks/useVapiCall";

interface Props {
  status: CallStatus;
  isMuted: boolean;
  lang: "en" | "hi";
  onStart: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
}

export default function CallControls({
  status,
  isMuted,
  onStart,
  onEnd,
  onToggleMute,
}: Props) {
  if (status === "idle") {
    return (
      <Button
        size="lg"
        className="bg-green-600 hover:bg-green-700 text-white gap-2"
        onClick={onStart}
      >
        <Mic className="w-5 h-5" />
        Start Consultation
      </Button>
    );
  }

  if (status === "connecting") {
    return (
      <Button size="lg" disabled className="gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        Connecting…
      </Button>
    );
  }

  if (status === "active") {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleMute}
          className={
            isMuted ? "border-amber-400 text-amber-600" : ""
          }
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={onEnd}
          className="gap-2"
        >
          <PhoneOff className="w-4 h-4" />
          End Call
        </Button>
      </div>
    );
  }

  if (status === "ended") {
    return (
      <p className="text-sm text-muted-foreground">Consultation Complete</p>
    );
  }

  // error state
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={onStart}
      className="border-red-400 text-red-600 gap-2"
    >
      Try Again
    </Button>
  );
}
