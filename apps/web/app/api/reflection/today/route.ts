// apps/web/app/api/reflection/today/route.ts
// Reflection Layer v1.1 — GET handler (three dimensions)

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getOsloDayKey(): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Oslo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const day_key = getOsloDayKey();
    const user_id = "00000000-0000-0000-0000-000000000001";

    const { data, error } = await supabase
      .from("reflection_logs")
      .select("energy, stress, focus")
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
