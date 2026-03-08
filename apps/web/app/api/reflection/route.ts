// apps/web/app/api/reflection/route.ts
// Reflection Layer v1.1 — POST handler (three dimensions)

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateReflectionPayload } from "@themunk/core/state/reflection";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const body = await req.json();
    const validation = validateReflectionPayload(body);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const { payload } = validation;
    const user_id = "00000000-0000-0000-0000-000000000001";

    const { data, error } = await supabase
      .from("reflection_logs")
      .upsert(
        {
          user_id,
          day_key: payload!.day_key,
          energy: payload!.energy,
          stress: payload!.stress,
          focus: payload!.focus,
        },
        { onConflict: "user_id,day_key" }
      )
      .select()
      .single();

    if (error) {
      console.error("[reflection/POST] Supabase error:", error.message);
      return NextResponse.json(
        { error: "Failed to save reflection" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { ok: true, reflection: data },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[reflection/POST] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
