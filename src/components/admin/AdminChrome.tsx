"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "./SignOutButton";

export default function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f4f1e9] text-[#14241c]">
      <div className="pc-instrument no-print">
        <span>PreCare · Admin</span>
        <span className="pc-live">Realtime feed connected</span>
        <span>Asha v1</span>
        <span>India production</span>
        <Link href="/triage" className="ml-auto text-[#bfc8c2] transition-colors hover:text-white">
          View triage
        </Link>
      </div>
      <header className="mx-auto flex max-w-[1440px] items-center gap-4 border-b border-[#e8e5dc] bg-white px-6 py-3.5">
        <Link href="/admin" className="pc-brand text-base">
          <div className="pc-mark">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1.5V12.5M1.5 7H12.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            PreCare
            <small className="block text-[11px] font-normal text-[#6f7a73]">Admin</small>
          </div>
        </Link>
        <span className="hidden text-[11px] text-[#6f7a73] sm:inline" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
          / <strong className="font-medium text-[#14241c]">Sessions</strong>
        </span>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-2 text-sm sm:flex">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#d7e8dc] text-[11px] font-medium text-[#1e6a47]" style={{ fontFamily: "var(--font-mono)" }}>
              SI
            </div>
            <div>
              <strong className="block text-sm leading-4">Triage Lead</strong>
              <small className="text-[10px] uppercase text-[#6f7a73]" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>
                Admin
              </small>
            </div>
          </div>
          <SignOutButton />
        </div>
      </header>
      <div>{children}</div>
    </div>
  );
}
