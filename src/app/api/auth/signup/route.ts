import { getServiceClient } from "@/lib/supabase-server";

export async function POST(req: Request): Promise<Response> {
  let email = "";
  let password = "";
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    email = body.email ?? "";
    password = body.password ?? "";
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!email || !password) {
    return Response.json({ error: "Email and password are required" }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Step 1: Create user confirmed, no password — avoids bcrypt variant issues in some Supabase versions
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  // Step 2: Set password separately so it is hashed through the correct path
  const { error: pwError } = await supabase.auth.admin.updateUserById(data.user.id, {
    password,
  });

  if (pwError) {
    return Response.json({ error: pwError.message }, { status: 400 });
  }

  return Response.json({ userId: data.user.id }, { status: 201 });
}
