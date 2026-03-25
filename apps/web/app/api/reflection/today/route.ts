// apps/web/app/api/reflection/today/route.ts
// Reflection Memory V1 — GET + POST
// Stores: body_feeling, brief_accuracy, day_direction
// Does NOT affect computeStateV2 or daily_state.

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const USER_ID = "thomas";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getOsloDayKey(): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Oslo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const VALID_BODY_FEELING   = ["rolig", "urolig", "tung", "presset"] as const;
const VALID_BRIEF_ACCURACY = ["ja", "delvis", "nei"] as const;
const VALID_DAY_DIRECTION  = ["bedre", "likt", "verre"] as const;

export async function GET() {
  try {
    const supabase = getServiceClient();
    const day_key  = getOsloDayKey();

    const { data, error } = await supabase
      .from("reflection_memory")
      .select("body_feeling, brief_accuracy, day_direction, source, updated_at")
      .eq("user_id", USER_ID)
      .eq("day_key", day_key)
      .maybeSingle();

    if (error) {
      console.error("[reflection/today GET] db error:", error.message);
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
    console.error("[reflection/today GET] unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getServiceClient();
    const body     = await req.json();

    const day_key        = body.day_key        ?? getOsloDayKey();
    const body_feeling   = body.body_feeling;
    const brief_accuracy = body.brief_accuracy;
    const day_direction  = body.day_direction;
    const source         = body.source ?? "daily_brief";

    // Validate — only reject if a provided value is invalid
    if (body_feeling   && !VALID_BODY_FEELING.includes(body_feeling))
      return NextResponse.json({ error: "Invalid body_feeling" },   { status: 400 });
    if (brief_accuracy && !VALID_BRIEF_ACCURACY.includes(brief_accuracy))
      return NextResponse.json({ error: "Invalid brief_accuracy" }, { status: 400 });
    if (day_direction  && !VALID_DAY_DIRECTION.includes(day_direction))
      return NextResponse.json({ error: "Invalid day_direction" },  { status: 400 });

    // Build upsert payload — only include fields that are present
    const upsertData: Record<string, unknown> = {
      user_id:    USER_ID,
      day_key,
      source,
      updated_at: new Date().toISOString(),
    };
    if (body_feeling   !== undefined) upsertData.body_feeling   = body_feeling;
    if (brief_accuracy !== undefined) upsertData.brief_accuracy = brief_accuracy;
    if (day_direction  !== undefined) upsertData.day_direction  = day_direction;

    const { data, error } = await supabase
      .from("reflection_memory")
      .upsert(upsertData, { onConflict: "user_id,day_key" })
      .select()
      .single();

    if (error) {
      console.error("[reflection/today POST] db error:", error.message);
      return NextResponse.json(
        { error: "Failed to save reflection" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    console.log("[reflection/today POST] saved:", { day_key, body_feeling, brief_accuracy, day_direction });

    return NextResponse.json(
      { saved: true, reflection: data },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[reflection/today POST] unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
