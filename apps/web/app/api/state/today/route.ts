import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import {
  computeStateV2,
  computeIntervention,
  computeProtocol,
  computeProtocolSchedule,
  buildDailyBrief,
} from '@themunk/core';
import type { ManualInput, WearableInput } from '@themunk/core';
import { resolveUserId, getOsloDateKey } from '../../../../lib/request-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const userId = resolveUserId(request);
  const dayKey = getOsloDateKey();

  const { data: logs } = await supabase
    .from('manual_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('day_key', dayKey)
    .order('created_at', { ascending: false })
    .limit(1);

  const latest = logs?.[0];

  const { data: wearableRow } = await supabase
    .from('wearable_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('day_key', dayKey)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  const manualInput: ManualInput | null = latest ? {
    energy:     latest.energy,
    mood:       latest.mood,
    stress:     latest.stress,
    notes:      latest.notes,
    created_at: latest.created_at,
  } : null;

  const wearableInput: WearableInput | null = wearableRow ? {
    hrv:                    wearableRow.hrv_rmssd,
    resting_hr:             wearableRow.resting_hr,
    sleep_score:            wearableRow.sleep_score,
    readiness_score:        wearableRow.readiness_score,
    activity_score:         wearableRow.activity_score,
    sleep_duration_minutes: wearableRow.sleep_duration_hours
      ? Math.round(wearableRow.sleep_duration_hours * 60)
      : null,
    source:    'oura',
    day_key:   wearableRow.day_key,
    synced_at: wearableRow.updated_at,
  } : null;

  if (!manualInput && !wearableInput) {
    return NextResponse.json(
      { state: null, message: 'No data for today' },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const result       = computeStateV2({ manualInput, wearableInput });
  const intervention = computeIntervention(result.state);
  const protocol     = computeProtocol(result.state, dayKey);

  let schedule = null;
  try {
    schedule = computeProtocolSchedule({
      state:              result.state,
      deep_work_minutes:  protocol.deep_work_minutes,
      recovery_minutes:   protocol.recovery_minutes,
      wake_time:          '07:00',
    });
  } catch {
    schedule = null;
  }

  // Fetch window_7d_status for trajectory text (optional)
  const { data: longitudinalRow } = await supabase
    .from('longitudinal_summary')
    .select('status')
    .eq('user_id', userId)
    .eq('day_key', dayKey)
    .eq('window_type', '7d')
    .maybeSingle();

  const daily_brief = buildDailyBrief({
    day_key:          dayKey,
    state:            result.state,
    confidence:       result.confidence,
    protocol_version: protocol.protocol_version,
    window_7d_status: longitudinalRow?.status ?? null,
  });

  // Input-change gating
  const { data: existing } = await supabase
    .from('daily_state')
    .select('*')
    .eq('user_id', userId)
    .eq('day_key', dayKey)
    .maybeSingle();

  let inputsChanged = true;
  if (existing) {
    inputsChanged =
      existing.state_trace?.manual_score  !== result.manual_score ||
      existing.state_trace?.wearable_score !== result.wearable_score;
  }

  if (!existing || inputsChanged) {
    await Promise.all([
      supabase.from('daily_state').upsert({
        user_id:          userId,
        day_key:          dayKey,
        state:            result.state,
        manual_score:     result.manual_score,
        wearable_score:   result.wearable_score,
        final_score:      result.final_score,
        confidence:       result.confidence,
        disagreement_flag: result.disagreement_flag,
        rationale_code:   result.rationale_code,
        signal_flags:     result.signal_flags,
        inputs_used:      result.inputs_used,
        state_trace:      result,
        updated_at:       new Date().toISOString(),
      }, { onConflict: 'user_id,day_key' }),
      supabase.from('daily_intervention').upsert({
        user_id:      userId,
        day_key:      dayKey,
        intervention,
      }, { onConflict: 'user_id,day_key' }),
      supabase.from('daily_protocol').upsert({
        user_id:                 userId,
        day_key:                 protocol.day_key,
        state:                   protocol.state,
        cognitive_load:          protocol.cognitive_load,
        training_recommendation: protocol.training_recommendation,
        nervous_system_mode:     protocol.nervous_system_mode,
        deep_work_minutes:       protocol.deep_work_minutes,
        recovery_minutes:        protocol.recovery_minutes,
        protocol_version:        protocol.protocol_version,
        generated_at:            protocol.generated_at,
      }, { onConflict: 'user_id,day_key' }),
      ...(schedule ? [supabase.from('protocol_schedule').upsert({
        user_id:  userId,
        day_key:  dayKey,
        ...schedule,
        generated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,day_key' })] : []),
    ]);
  }

  // Memory Engine v1 — non-blocking state snapshot
  try {
    await supabase.from('memory_snapshots').upsert(
      buildStateSnapshotRecord({
        user_id: userId,
        day_key: dayKey,
        state: result.state,
        trajectory: null,
      }),
      { onConflict: 'user_id,day_key' }
    );
  } catch {
    // non-blocking — memory failure does not affect API response
  }

  return NextResponse.json(
    { ...result, intervention, protocol, schedule, daily_brief },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
