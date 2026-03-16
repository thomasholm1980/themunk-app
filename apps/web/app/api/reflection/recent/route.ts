// apps/web/app/api/reflection/recent/route.ts
// Reflection Memory Layer — GET last 14 days
// Read-only. Does not affect computeStateV2.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const USER_ID = "00000000-0000-0000-0000-000000000001";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("reflection_logs")
      .select("day_key, energy, stress, focus, created_at")
      .eq("user_id", USER_ID)
      .order("day_key", { ascending: false })
      .limit(14);

    if (error) {
      console.error("[reflection/recent] Supabase error:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch reflection history" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { ok: true, reflections: data ?? [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[reflection/recent] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
