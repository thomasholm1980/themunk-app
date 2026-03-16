// apps/web/app/api/trajectory/route.ts
// Trajectory Layer v1 — GET /api/trajectory
// Read-only, deterministic, no influence on state engine

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { computeTrajectory } from "@themunk/core/state/trajectory";

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

function subtractDays(dayKey: string, days: number): string {
  const date = new Date(`${dayKey}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const today    = getOsloDayKey();
    const sevenAgo = subtractDays(today, 7);
    const user_id  = "thomas";

    const { data, error } = await supabase
      .from("daily_memory")
      .select("day_key, state")
      .eq("user_id", user_id)
      .gte("day_key", sevenAgo)
      .lte("day_key", today)
      .order("day_key", { ascending: true });

    if (error) {
      console.error("[trajectory/GET] Supabase error:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch trajectory data" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    const result = computeTrajectory(data ?? []);

    return NextResponse.json(
      { trajectory: result },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[trajectory/GET] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
