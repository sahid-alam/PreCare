"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <button
      type="button"
      className="rounded-full border border-[#dad6cb] bg-white px-3 py-1.5 text-xs text-[#3c4a43] transition-colors hover:bg-[#faf8f1]"
      onClick={() => void handleSignOut()}
    >
      Sign out
    </button>
  );
}
