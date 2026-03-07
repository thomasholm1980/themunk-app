// apps/web/app/api/brief/v2/today/route.ts
// Layer 9 — DailyBrief V2 endpoint
// v1.0.0
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { composeBriefV2 } from '@themunk/core';

const OSLO_TZ = 'Europe/Oslo';

function getOsloDateKey(): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: OSLO_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export async function GET() {
  const userId = 'thomas';
  const dayKey = getOsloDateKey();

  try {
    // 1. Fetch state (required)
    const { data: stateRow, error: stateError } = await supabase
      .from('daily_state')
      .select('state, confidence, rationale_code, signal_flags')
      .eq('user_id', userId)
      .eq('day_key', dayKey)
      .single();

    if (stateError || !stateRow) {
      return NextResponse.json(
        { error: 'No state for today', day_key: dayKey },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // 2. Fetch protocol (required)
    const { data: protocolRow } = await supabase
      .from('daily_protocol')
      .select('cognitive_load, training_recommendation, nervous_system_mode, deep_work_minutes, recovery_minutes, protocol_version')
      .eq('user_id', userId)
      .eq('day_key', dayKey)
      .single();

    // 3. Fetch schedule (optional)
    const { data: scheduleRow } = await supabase
      .from('protocol_schedule')
      .select('deep_work_window_start, deep_work_window_end, training_window_start, training_window_end, recovery_window_start, recovery_window_end')
      .eq('user_id', userId)
      .eq('day_key', dayKey)
      .single();

    // 4. Fetch explanation (optional)
    const { data: briefRow } = await supabase
      .from('daily_briefs')
      .select('what_it_might_mean')
      .eq('user_id', userId)
      .eq('day_key', dayKey)
      .single();

    // 5. Fetch drift (optional)
    const { data: driftRow } = await supabase
      .from('nervous_system_drift')
      .select('drift_status, drift_flag')
      .eq('user_id', userId)
      .eq('window_days', 7)
      .order('computed_at', { ascending: false })
      .limit(1)
      .single();

    // 6. Fetch adherence (optional)
    const { data: adherenceRow } = await supabase
      .from('protocol_adherence')
      .select('adherence_score')
      .eq('user_id', userId)
      .eq('day_key', dayKey)
      .single();

    // 7. Compose
    const brief = composeBriefV2({
      day_key: dayKey,
      state: {
        state: stateRow.state,
        confidence: stateRow.confidence ?? 'LOW',
        rationale_code: stateRow.rationale_code ?? 'UNKNOWN',
        signal_flags: stateRow.signal_flags ?? [],
      },
      protocol: protocolRow ?? {
        cognitive_load: 'low',
        training_recommendation: 'recovery',
        nervous_system_mode: 'downregulate',
        deep_work_minutes: 0,
        recovery_minutes: 30,
        protocol_version: '1.0.0',
      },
      schedule: scheduleRow ?? null,
      explanation: briefRow?.what_it_might_mean
        ? { what_it_might_mean: briefRow.what_it_might_mean }
        : null,
      adherence: adherenceRow ?? null,
      drift: driftRow
        ? { status: driftRow.drift_status ?? 'insufficient_data', drift_detected: driftRow.drift_flag }
        : { status: 'insufficient_data' },
    });

    return NextResponse.json(brief, {
      headers: { 'Cache-Control': 'no-store' },
    });

  } catch (err) {
    console.error('[brief/v2/today] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
