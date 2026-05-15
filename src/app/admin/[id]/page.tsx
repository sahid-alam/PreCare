import { notFound } from "next/navigation";
import Link from "next/link";
import { getServiceClient } from "@/lib/supabase-server";
import SessionDetail from "@/components/admin/SessionDetail";
import type { Session, Transcript, Symptom, AuditLogEntry } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SessionDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = getServiceClient();

  const [sessionRes, transcriptsRes, symptomsRes, auditRes] = await Promise.all(
    [
      supabase.from("sessions").select("*").eq("id", id).single(),
      supabase
        .from("transcripts")
        .select("*")
        .eq("session_id", id)
        .order("created_at"),
      supabase
        .from("symptoms")
        .select("*")
        .eq("session_id", id)
        .order("created_at"),
      supabase
        .from("audit_log")
        .select("*")
        .eq("session_id", id)
        .order("created_at"),
    ]
  );

  if (sessionRes.error ?? !sessionRes.data) {
    notFound();
  }

  const session = sessionRes.data as unknown as Session;
  const transcripts = (transcriptsRes.data ?? []) as unknown as Transcript[];
  const symptoms = (symptomsRes.data ?? []) as unknown as Symptom[];
  const auditLog = (auditRes.data ?? []) as unknown as AuditLogEntry[];

  return (
    <div>
      <div className="border-b px-4 md:px-6 py-3">
        <Link
          href="/admin"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← All Sessions
        </Link>
      </div>
      <SessionDetail
        sessionId={id}
        initialSession={session}
        initialTranscripts={transcripts}
        initialSymptoms={symptoms}
        initialAuditLog={auditLog}
      />
    </div>
  );
}
