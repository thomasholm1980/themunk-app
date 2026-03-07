// apps/web/app/api/drift/compute/route.ts
// DriftDetectionEngine v1 — scheduled daily job endpoint
// Triggered after wearable sync, not on-demand from UI
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';
import { computeDrift } from '@themunk/core';

const WINDOWS = [7, 14] as const

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id') ?? 'thomas';

  const { data: rows, error } = await supabase
    .from('wearable_logs')
    .select('day_key, hrv_rmssd, resting_hr, sleep_score, readiness_score')
    .eq('user_id', userId)
    .order('day_key', { ascending: false })
    .limit(14)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const computedAt = new Date().toISOString().split('T')[0]
  const results = []

  for (const windowDays of WINDOWS) {
    const windowRows = (rows ?? []).slice(0, windowDays)
    const result = computeDrift(windowRows, windowDays)

    const { error: upsertError } = await supabase
      .from('nervous_system_drift')
      .upsert({
        user_id: userId,
        computed_at: computedAt,
        window_days: windowDays,
        drift_flag: result.drift_flag,
        drift_status: result.drift_status,
        hrv_change_pct: result.hrv_change_pct,
        rhr_change_pct: result.rhr_change_pct,
        sleep_score_change_pct: result.sleep_score_change_pct,
        readiness_change_pct: result.readiness_change_pct,
        signals_used: result.signals_used,
      }, { onConflict: 'user_id,computed_at,window_days' })

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }

    results.push(result)
  }

  return NextResponse.json(
    { status: 'ok', computed_at: computedAt, results },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
