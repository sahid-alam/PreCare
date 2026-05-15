"use client";

import dynamic from "next/dynamic";

// ssr:false must live in a Client Component — not allowed in Server Components
export const HeroCard = dynamic(
  () => import("./HeroCard").then((m) => m.HeroCard),
  { ssr: false }
);
