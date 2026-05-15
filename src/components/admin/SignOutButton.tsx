"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <Button variant="outline" size="sm" onClick={() => void handleSignOut()}>
      Sign out
    </Button>
  );
}
