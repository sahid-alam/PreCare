import { getServiceClient } from "@/lib/supabase-server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  const db = getServiceClient();

  const { error } = await db.from("sessions").delete().eq("id", id);

  if (error) {
    console.error("[sessions DELETE]", error.message);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
