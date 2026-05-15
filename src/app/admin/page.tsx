export const dynamic = "force-dynamic";

import { getServiceClient } from "@/lib/supabase-server";
import AdminDashboard from "@/components/admin/AdminDashboard";
import type { Session } from "@/lib/types";

export default async function AdminPage() {
  const supabase = getServiceClient();
  const { data } = await supabase
    .from("sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const sessions = (data ?? []) as unknown as Session[];

  return <AdminDashboard initialSessions={sessions} />;
}
