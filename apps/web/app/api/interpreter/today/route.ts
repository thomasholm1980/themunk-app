export const dynamic = "force-dynamic"
export const revalidate = 0

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { callOpenAI } from "../../../../lib/openai-provider"
import { buildInterpreterPrompt } from "../../../../lib/interpreter-prompt"
import { guidanceEngineV1 } from "@themunk/core/state/guidance-engine"
import { patternEngineV1 } from "@themunk/core/state/pattern-engine-v1"

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function todayOslo(): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Oslo",
  }).format(new Date())
}

export async function GET() {
  const supabase = getServiceClient()
  const dayKey = todayOslo()

  // Get today state
  const { data, error } = await supabase
    .from("daily_state")
    .select("state, confidence, final_score, sleep_score, recovery_score, hrv, rhr")
    .eq("user_id", "thomas")
    .eq("day_key", dayKey)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json(
      { error: "No state available for today" },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    )
  }

  const state = data.state as "GREEN" | "YELLOW" | "RED"

  // Get last 5 days of states for pattern detection
  const { data: recentRows } = await supabase
    .from("daily_state")
    .select("state, day_key")
    .eq("user_id", "thomas")
    .order("day_key", { ascending: false })
    .limit(5)

  const recentStates = (recentRows ?? []).map((r: { state: string }) => r.state)

  // Run pattern engine
  const pattern = patternEngineV1({
    state,
    sleep_score: data.sleep_score ?? null,
    recent_states: recentStates,
    context_tags: [],
  })

  // Build AI prompt
  const prompt = buildInterpreterPrompt({
    state,
    confidence: data.confidence,
    final_score: data.final_score,
    hrv: data.hrv ?? null,
    resting_hr: data.rhr ?? null,
    sleep_score: data.sleep_score ?? null,
    readiness_score: data.recovery_score ?? null,
  })

  const aiResult = await callOpenAI(prompt)

  // Use pattern insight if detected, otherwise empty
  const insight = pattern.pattern_detected ? pattern.insight : ""

  if (aiResult) {
    return NextResponse.json(
      {
        explanation: aiResult.explanation,
        guidance: aiResult.guidance,
        insight,
        pattern_id: pattern.pattern_id ?? null,
        source: "ai",
        state,
        day_key: dayKey,
      },
      { headers: { "Cache-Control": "no-store" } }
    )
  }

  // Fallback
  const fallback = guidanceEngineV1(state)
  const stressLabel = state === "GREEN" ? "low" : state === "YELLOW" ? "moderate" : "high"

  return NextResponse.json(
    {
      explanation: "Your stress level is " + stressLabel + " today.",
      guidance: fallback.body,
      insight,
      pattern_id: pattern.pattern_id ?? null,
      source: "fallback",
      state,
      day_key: dayKey,
    },
    { headers: { "Cache-Control": "no-store" } }
  )
}
