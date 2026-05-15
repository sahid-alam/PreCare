import { getServiceClient } from "@/lib/supabase-server";

interface CreateSessionBody {
  id?: string;
  patient_age?: number;
  patient_gender?: string;
  language?: string;
}

export async function POST(request: Request): Promise<Response> {
  let body: CreateSessionBody = {};
  try {
    body = (await request.json()) as CreateSessionBody;
  } catch {
    // empty body is fine — all fields are optional
  }

  const lang = body.language === "hi" ? "hi" : "en";
  const age =
    typeof body.patient_age === "number" && body.patient_age > 0
      ? body.patient_age
      : null;
  const gender =
    typeof body.patient_gender === "string" ? body.patient_gender : null;

  const db = getServiceClient();

  const insertData = {
    language: lang,
    ...(age !== null && { patient_age: age }),
    ...(gender !== null && { patient_gender: gender }),
    ...(body.id ? { id: body.id } : {}),
  };

  const { data, error } = await db
    .from("sessions")
    .insert(insertData)
    .select("id")
    .single();

  if (error) {
    console.error("[sessions POST]", error.message);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  return Response.json({ sessionId: data.id }, { status: 201 });
}
