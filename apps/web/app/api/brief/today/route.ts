// apps/web/app/api/brief/today/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, isAuthError } from "@/lib/auth";
import { MonkBrief } from "@themunk/core";

export async function GET(req: NextRequest) {
  const auth = getAuthContext(req);
  if (isAuthError(auth)) return auth;

  const today = new Date().toISOString().slice(0, 10);

  // TODO Phase 2: fetch real records from Supabase,
  //   run computeTrendReport + classifyState, build real brief.

  const mockBrief: MonkBrief = {
    brief_version:    "1.0",
    day_key:          today,
    generated_at:     new Date().toISOString(),
    state:            "YELLOW",
    state_confidence: 0.6,
    signals_summary: {
      sleep_score:             72,
      readiness_score:         65,
      activity_score:          70,
      hrv_balance_score_0_100: 58,
    },
    trend: {
      sleep_7d_avg:    74,
      readiness_7d_avg: 66,
      direction:       "stable",
    },
    one_action: {
      category:    "recovery",
      instruction: "Prioritér 8 timer søvn i natt og unngå skjermer etter 22:00.",
      rationale:   "HRV og readiness er under baseline. Kroppen trenger restitusjon.",
    },
    data_quality_summary: "partial",
  };

  return NextResponse.json({ ok: true, data: mockBrief });
}
