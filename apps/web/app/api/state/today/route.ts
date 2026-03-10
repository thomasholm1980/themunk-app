export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import { computeStateV2 } from '@themunk/core/state/compute-state-v2'
import { computeIntervention } from '@themunk/core/state/intervention'
import { buildDecisionContract } from '@themunk/core/state/decision-contract'

function getOsloDayKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Oslo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const day = parts.find((p) => p.type === 'day')?.value
  const month = parts.find((p) => p.type === 'month')?.value
  const year = parts.find((p) => p.type === 'year')?.value

  if (!year || !month || !day) {
    throw new Error('Failed to generate Oslo day_key')
  }

  return `${year}-${month}-${day}`
}

export async function GET() {
  try {
    const day_key = getOsloDayKey()

    const { data: manualLog } = await supabase
      .from('manual_logs')
      .select('*')
      .eq('day_key', day_key)
      .eq('user_id', 'thomas')
      .maybeSingle()

    const { data: wearableLog } = await supabase
      .from('wearable_logs')
      .select('hrv_rmssd, resting_hr, sleep_score, readiness_score, activity_score, sleep_duration_hours, updated_at')
      .eq('day_key', day_key)
      .eq('user_id', 'thomas')
      .maybeSingle()

    if (!manualLog && !wearableLog) {
      return NextResponse.json(
        { error: 'No data available for today' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const manualInput = manualLog
      ? {
          energy: manualLog.energy,
          mood: manualLog.mood,
          stress: manualLog.stress,
          created_at: manualLog.created_at,
        }
      : null

    const wearableInput = wearableLog
      ? {
          hrv: wearableLog.hrv_rmssd,
          resting_hr: wearableLog.resting_hr,
          sleep_score: wearableLog.sleep_score,
          readiness_score: wearableLog.readiness_score,
          activity_score: wearableLog.activity_score,
          sleep_duration_minutes: wearableLog.sleep_duration_hours
            ? Math.round(wearableLog.sleep_duration_hours * 60)
            : null,
          source: 'oura' as const,
          day_key: day_key,
          synced_at: wearableLog.updated_at ?? new Date().toISOString(),
        }
      : null

    const result = computeStateV2({ manualInput, wearableInput })
    const intervention = computeIntervention(result.state)
    const contract = buildDecisionContract(result, intervention)

    const computed_at = new Date().toISOString()

    const { error: upsertError } = await supabase
      .from('daily_state')
      .upsert(
        {
          user_id: 'thomas',
          day_key,
          state: result.state,
          confidence: result.confidence,
          final_score: result.final_score,
          state_trace: { rationale_code: result.rationale_code },
          sleep_score: wearableLog?.sleep_score ?? null,
          recovery_score: wearableLog?.readiness_score ?? null,
          hrv: wearableLog?.hrv_rmssd ?? null,
          rhr: wearableLog?.resting_hr ?? null,
          computed_at,
          updated_at: computed_at,
        },
        { onConflict: 'user_id,day_key' }
      )

    if (upsertError) {
      console.error('[state/today] upsert error', { error: upsertError.message })
      return NextResponse.json(
        { error: 'Failed to persist state' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    console.log('[state/today]', {
      day_key,
      state: result.state,
      confidence: result.confidence,
      final_score: result.final_score,
      sleep_score: wearableLog?.sleep_score,
      readiness_score: wearableLog?.readiness_score,
      hrv: wearableLog?.hrv_rmssd,
      rhr: wearableLog?.resting_hr,
      computed_at,
    })

    return NextResponse.json(
      {
        state: result.state,
        confidence: result.confidence,
        final_score: result.final_score,
        intervention,
        contract,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error('[state/today] unexpected error', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
