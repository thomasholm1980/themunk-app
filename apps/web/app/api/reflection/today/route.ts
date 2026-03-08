// apps/web/app/api/reflection/today/route.ts
// Reflection Layer v1 — GET handler

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { toZonedTime, format } from "date-fns-tz";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const now = toZonedTime(new Date(), "Europe/Oslo");
    const day_key = format(now, "yyyy-MM-dd", { timeZone: "Europe/Oslo" });
    const user_id = "00000000-0000-0000-0000-000000000001";

    const { data, error } = await supabase
      .from("reflection_logs")
      .select("*")
      .eq("user_id", user_id)
      .eq("day_key", day_key)
      .maybeSingle();

    if (error) {
      console.error("[reflection/today] Supabase error:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch reflection" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { reflection: data ?? null, day_key },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[reflection/today] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
