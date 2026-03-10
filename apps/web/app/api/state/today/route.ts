export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { computeStateV2 } from '@themunk/core/state/compute-state-v2'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
      .maybeSingle()

    const { data: wearableLog } = await supabase
      .from('wearable_logs')
      .select('hrv_rmssd, resting_hr, sleep_score, readiness_score, activity_score, sleep_duration_hours')
      .eq('day_key', day_key)
      .maybeSingle()

    if (!manualLog && !wearableLog) {
      return NextResponse.json(
        { error: 'No data available for today' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const manualInput = manualLog
      ? { energy: manualLog.energy, mood: manualLog.mood, stress: manualLog.stress, created_at: manualLog.created_at }
      : null

    const wearableInput = wearableLog
      ? {
          hrv_rmssd: wearableLog.hrv_rmssd,
          resting_hr: wearableLog.resting_hr,
          sleep_score: wearableLog.sleep_score,
          readiness_score: wearableLog.readiness_score,
          activity_score: wearableLog.activity_score,
          sleep_duration_hours: wearableLog.sleep_duration_hours,
        }
      : null

    const result = computeStateV2({ manualInput, wearableInput })

    const { error: upsertError } = await supabase
      .from('daily_state')
      .upsert(
        {
          day_key,
          state: result.state,
          score: result.score,
          state_trace: result.trace,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'day_key' }
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
      score: result.score,
      has_manual: !!manualInput,
      has_wearable: !!wearableInput,
    })

    return NextResponse.json(
      { state: result.state, score: result.score, trace: result.trace },
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
