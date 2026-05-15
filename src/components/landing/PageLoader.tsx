"use client";

import { useEffect, useState } from "react";

export function PageLoader() {
  const [phase, setPhase] = useState<"filling" | "done" | "gone">("filling");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("done"), 700);
    const t2 = setTimeout(() => setPhase("gone"), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-[2px] bg-[#2f8b5e]"
      style={{
        width: phase === "filling" ? "72%" : "100%",
        opacity: phase === "done" ? 0 : 1,
        transition:
          phase === "filling"
            ? "width 0.65s cubic-bezier(.4,0,.2,1)"
            : "width 0.2s ease, opacity 0.35s ease 0.05s",
        boxShadow: "0 0 8px rgba(47,139,94,0.6)",
      }}
    />
  );
}
