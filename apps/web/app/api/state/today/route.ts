import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import { computeState } from "../../../../../../packages/core/state/pipeline";

function getUserId(req: NextRequest): string {
  return req.headers.get("x-user-id") ?? "anonymous";
}

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const fromDate = sevenDaysAgo.toISOString().slice(0, 10);

  const { data: logs, error } = await supabase
    .from("manual_logs")
    .select("day_key, energy, mood, stress")
    .eq("user_id", userId)
    .gte("day_key", fromDate)
    .lte("day_key", today)
    .order("day_key", { ascending: false });

  if (error)
    return NextResponse.json({ error: "Database error" }, { status: 500 });

  const byDay = new Map<string, typeof logs[0]>();
  for (const log of logs ?? []) {
    if (!byDay.has(log.day_key)) byDay.set(log.day_key, log);
  }
  const deduped = Array.from(byDay.values());
  const result = computeState(deduped);

  await supabase.from("daily_state").upsert({
    user_id: userId,
    day_key: today,
    state: result.state,
    confidence: result.confidence,
    reasons: result.reasons,
  }, { onConflict: "user_id,day_key" });

  return NextResponse.json({
    state: result.state,
    confidence: result.confidence,
    reasons: result.reasons,
    meta: {
      avg_energy_7d: result.avg_energy_7d,
      avg_stress_7d: result.avg_stress_7d,
      days_with_data: result.days_with_data,
    },
  });
}
