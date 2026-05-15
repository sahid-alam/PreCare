import { getServiceClient } from "@/lib/supabase-server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  const db = getServiceClient();

  const { data, error } = await db
    .from("sessions")
    .select("id, final_tier, red_flag_triggered, status")
    .eq("id", id)
    .single();

  if (error) {
    return Response.json({ ok: false }, { status: 404 });
  }

  return Response.json(data);
}

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
