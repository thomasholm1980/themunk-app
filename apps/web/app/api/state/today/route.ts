import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import { computeState } from "../../../../../../packages/core/state/pipeline";

function getUserId(req: NextRequest): string {
  return req.headers.get("x-user-id") ?? "anonymous";
}

function getRequestId(req: NextRequest): string {
  return req.headers.get("x-request-id") ?? crypto.randomUUID();
}

function getTodayOslo(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Oslo" });
}

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  const requestId = getRequestId(req);
  const today = getTodayOslo();

  const { data: existing } = await supabase
    .from("daily_state")
    .select("state, confidence, reasons, state_trace, created_at")
    .eq("user_id", userId)
    .eq("day_key", today)
    .single();

  const { data: latestLog } = await supabase
    .from("manual_logs")
    .select("created_at")
    .eq("user_id", userId)
    .eq("day_key", today)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const hasNewInput = !existing
    || !latestLog
    || new Date(latestLog.created_at) > new Date(existing.created_at);

  if (existing && !hasNewInput) {
    console.log(JSON.stringify({
      event: "state_request_cached",
      request_id: requestId,
      user_id: userId,
      day_key: today,
      state: existing.state,
      confidence: existing.confidence,
      reason: "no_new_inputs",
    }));

    return NextResponse.json({
      state: existing.state,
      confidence: existing.confidence,
      reasons: existing.reasons,
      meta: {
        ...(existing.state_trace?.inputs ?? {}),
        cached: true,
      },
    });
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const fromDate = sevenDaysAgo.toISOString().slice(0, 10);

  const { data: logs, error } = await supabase
    .from("manual_logs")
    .select("day_key, energy, mood, stress, created_at")
    .eq("user_id", userId)
    .gte("day_key", fromDate)
    .lte("day_key", today)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  const byDay = new Map<string, { day_key: string; energy: number; mood: number; stress: number }>();
  for (const log of logs ?? []) {
    if (!byDay.has(log.day_key)) {
      byDay.set(log.day_key, {
        day_key: log.day_key,
        energy: log.energy,
        mood: log.mood,
        stress: log.stress,
      });
    }
  }
  const deduped = Array.from(byDay.values());

  const result = computeState(deduped);

  const gating = {
    had_existing_state: !!existing,
    recomputed: true,
    reason: existing
      ? "New input detected since last computation"
      : "No existing state for today",
  };

  const stateTrace = {
    ...result.trace,
    gating,
  };

  const { error: upsertError } = await supabase.from("daily_state").upsert(
    {
      user_id: userId,
      day_key: today,
      state: result.state,
      confidence: result.confidence,
      reasons: result.reasons,
      state_trace: stateTrace,
      created_at: new Date().toISOString(),
    },
    { onConflict: "user_id,day_key" }
  );

  if (upsertError) {
    console.error("Supabase upsert error:", upsertError);
  }

  console.log(JSON.stringify({
    event: "state_computed",
    request_id: requestId,
    user_id: userId,
    day_key: today,
    state: result.state,
    confidence: result.confidence,
    days_of_data: result.days_with_data,
    avg_energy_7d: result.avg_energy_7d,
    avg_stress_7d: result.avg_stress_7d,
    avg_mood_7d: result.avg_mood_7d,
  }));

  return NextResponse.json({
    state: result.state,
    confidence: result.confidence,
    reasons: result.reasons,
    meta: {
      avg_energy_7d: result.avg_energy_7d,
      avg_stress_7d: result.avg_stress_7d,
      avg_mood_7d: result.avg_mood_7d,
      days_with_data: result.days_with_data,
      cached: false,
    },
  });
}
