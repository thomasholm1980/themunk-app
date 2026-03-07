import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { resolveUserId, getOsloDateKey } from '../../../../lib/request-utils';
import { buildLongitudinalSummary } from '@themunk/core';
import type { DriftSummaryInput, DailyStateRow, WearableLogRow, NervousSystemDriftRow, ProtocolAdherenceRow } from '@themunk/core';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function subtractDays(dateKey: string, days: number): string {
  const d = new Date(dateKey + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const userId     = resolveUserId(req);
  const computedAt = new Date().toISOString();
  const todayKey   = getOsloDateKey();
  const from14d    = subtractDays(todayKey, 14);

  try {
    const { data: stateRows, error: stateErr } = await supabase
      .from('daily_state')
      .select('day_key, state, confidence')
      .eq('user_id', userId)
      .gte('day_key', from14d)
      .lte('day_key', todayKey)
      .order('day_key', { ascending: true });
    if (stateErr) throw new Error(`daily_state: ${stateErr.message}`);

    const { data: wearableRows, error: wearableErr } = await supabase
      .from('wearable_logs')
      .select('day_key, hrv_rmssd, resting_hr, sleep_score, readiness_score')
      .eq('user_id', userId)
      .gte('day_key', from14d)
      .lte('day_key', todayKey)
      .order('day_key', { ascending: true });
    if (wearableErr) throw new Error(`wearable_logs: ${wearableErr.message}`);

    const { data: driftRows } = await supabase
      .from('nervous_system_drift')
      .select('computed_at, window_days, hrv_trend, drift_score')
      .eq('user_id', userId)
      .gte('computed_at', new Date(from14d + 'T00:00:00Z').toISOString())
      .order('computed_at', { ascending: true });

    const { data: adherenceRows } = await supabase
      .from('protocol_adherence')
      .select('day_key, adherence_score')
      .eq('user_id', userId)
      .gte('day_key', from14d)
      .lte('day_key', todayKey)
      .order('day_key', { ascending: true });

    const input: DriftSummaryInput = {
      userId,
      computedAt,
      dailyStates:        (stateRows ?? []) as DailyStateRow[],
      wearableLogs:       (wearableRows ?? []) as WearableLogRow[],
      nervousSystemDrift: (driftRows ?? []) as NervousSystemDriftRow[],
      protocolAdherence:  (adherenceRows ?? []) as ProtocolAdherenceRow[],
    };

    const result = buildLongitudinalSummary(input);
    const { window_7d: w7, window_14d: w14 } = result;

    const baseRecord = {
      user_id:     userId,
      day_key:     todayKey,
      computed_at: computedAt,
      trajectory:  result.trajectory,
      summary_code: result.summary_code,
      flags:       result.flags,
      version:     result.version,
    };

    const record7d = {
      ...baseRecord,
      window_type:        '7d',
      status:             w7.status,
      confidence:         w7.confidence,
      driver_codes:       w7.driver_codes,
      state_distribution: w7.metrics.state_distribution,
      days_available:     w7.metrics.days_available,
      avg_hrv_rmssd:      w7.metrics.avg_hrv_rmssd,
      avg_resting_hr:     w7.metrics.avg_resting_hr,
      avg_sleep_score:    w7.metrics.avg_sleep_score,
      avg_readiness_score: w7.metrics.avg_readiness_score,
      avg_adherence_score: w7.metrics.avg_adherence_score,
      summary_payload:    w7,
    };

    const record14d = {
      ...baseRecord,
      window_type:        '14d',
      status:             w14.status,
      confidence:         w14.confidence,
      driver_codes:       w14.driver_codes,
      state_distribution: w14.metrics.state_distribution,
      days_available:     w14.metrics.days_available,
      avg_hrv_rmssd:      w14.metrics.avg_hrv_rmssd,
      avg_resting_hr:     w14.metrics.avg_resting_hr,
      avg_sleep_score:    w14.metrics.avg_sleep_score,
      avg_readiness_score: w14.metrics.avg_readiness_score,
      avg_adherence_score: w14.metrics.avg_adherence_score,
      summary_payload:    w14,
    };

    const { error: err7 } = await supabase
      .from('longitudinal_summary')
      .upsert(record7d, { onConflict: 'user_id,day_key,window_type' });
    if (err7) throw new Error(`upsert 7d: ${err7.message}`);

    const { error: err14 } = await supabase
      .from('longitudinal_summary')
      .upsert(record14d, { onConflict: 'user_id,day_key,window_type' });
    if (err14) throw new Error(`upsert 14d: ${err14.message}`);

    console.log('[longitudinal/compute]', {
      userId, summary_code: result.summary_code,
      trajectory: result.trajectory, version: result.version,
    });

    return NextResponse.json({
      ok: true,
      summary_code:      result.summary_code,
      trajectory:        result.trajectory,
      window_7d_status:  w7.status,
      window_14d_status: w14.status,
      flags:             result.flags,
      computed_at:       computedAt,
    }, { headers: { 'Cache-Control': 'no-store' } });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[longitudinal/compute] error', { userId, message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
