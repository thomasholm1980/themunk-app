import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import { computeState } from "../../../../../../packages/core/state/pipeline";

const DUPLICATE_WINDOW_MS = 6 * 60 * 60 * 1000;

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

  if (existing) {
    const createdAt = new Date(existing.created_at).getTime();
    const age = Date.now() - createdAt;

    if (age < DUPLICATE_WINDOW_MS) {
      console.log(JSON.stringify({
        event: "state_request_cached",
        request_id: requestId,
        user_id: userId,
        day_key: today,
        state: existing.state,
        confidence: existing.confidence,
        age_minutes: Math.round(age / 60000),
      }));

      return NextResponse.json({
        state: existing.state,
        confidence: existing.confidence,
        reasons: existing.reasons,
        meta: {
          ...(existing.state_trace?.inputs ?? {}),
          cached: true,
          age_minutes: Math.round(age / 60000),
        },
      });
    }
  }

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

  if (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  const byDay = new Map<string, (typeof logs)[0]>();
  for (const log of logs ?? []) {
    if (!byDay.has(log.day_key)) byDay.set(log.day_key, log);
  }
  const deduped = Array.from(byDay.values());

  const result = computeState(deduped);

  const gating = {
    duplicate_found: !!existing,
    recomputed: true,
    reason: existing
      ? "Existing state older than 6h recomputed"
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
