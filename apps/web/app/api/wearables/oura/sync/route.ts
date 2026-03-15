export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { OuraAdapter } from '@themunk/core'
import { computeStateV2 } from '@themunk/core/state/compute-state-v2'
import { makeOuraTokenStore } from '../../../../../lib/oura-token'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const WEARABLES_ENABLED = process.env.WEARABLES_ENABLED === 'true'
const USER_ID = 'thomas'

function todayOslo(): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Oslo',
  }).format(new Date())
}

export async function POST() {
  if (!WEARABLES_ENABLED) {
    return NextResponse.json(
      { status: 'disabled', message: 'Wearables feature flag is off' },
      { status: 200 }
    )
  }

  const supabase = getServiceClient()
  const start = Date.now()
  const dayKey = todayOslo()
  const tokenStore = makeOuraTokenStore()

  const adapter = new OuraAdapter({
    getAccessToken: (userId) => tokenStore.getAccessTokenWithRefresh(userId),
  })

  try {
    const data = await adapter.fetchDay(USER_ID, dayKey)

    if (!data) {
      return NextResponse.json({ status: 'no_data', day_key: dayKey }, { status: 200 })
    }

    const { error } = await supabase
      .from('wearable_logs')
      .upsert(
        {
          user_id: data.user_id,
          day_key: data.day_key,
          hrv_rmssd: data.hrv_rmssd,
          resting_hr: data.resting_hr,
          sleep_score: data.sleep_score,
          readiness_score: data.readiness_score,
          activity_score: data.activity_score,
          sleep_duration_hours: data.sleep_duration_hours,
          raw_snapshot: data.raw_snapshot,
          source: data.source,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,day_key,source' }
      )

    if (error) {
      const latency = Date.now() - start
      await supabase.from('wearable_sync_events').insert({
        user_id: USER_ID,
        day_key: dayKey,
        source: adapter.source,
        success: false,
        records_upserted: 0,
        latency_ms: latency,
        error_code: error.code ?? null,
      })
      return NextResponse.json({ status: 'error', error: error.message }, { status: 500 })
    }

    // Compute state and write to daily_state
    const wearableInput = {
      hrv: data.hrv_rmssd,
      resting_hr: data.resting_hr,
      sleep_score: data.sleep_score,
      readiness_score: data.readiness_score,
      activity_score: data.activity_score,
      sleep_duration_minutes: data.sleep_duration_hours
        ? Math.round(data.sleep_duration_hours * 60)
        : null,
      source: 'oura' as const,
      day_key: dayKey,
      synced_at: new Date().toISOString(),
    }

    const result = computeStateV2({ manualInput: null, wearableInput })

    await supabase
      .from('daily_state')
      .upsert(
        {
          user_id: USER_ID,
          day_key: dayKey,
          state: result.state,
          confidence: result.confidence,
          final_score: result.final_score,
          state_trace: { rationale_code: result.rationale_code },
          sleep_score: data.sleep_score,
          recovery_score: data.readiness_score,
          hrv: data.hrv_rmssd,
          rhr: data.resting_hr,
          computed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,day_key' }
      )

    const latency = Date.now() - start

    await supabase.from('wearable_sync_events').insert({
      user_id: USER_ID,
      day_key: dayKey,
      source: adapter.source,
      success: true,
      records_upserted: 1,
      latency_ms: latency,
      error_code: null,
    })

    return NextResponse.json({
      status: 'ok',
      day_key: dayKey,
      source: adapter.source,
      state: result.state,
      confidence: result.confidence,
      final_score: result.final_score,
      latency_ms: latency,
    })

  } catch (err: unknown) {
    const latency = Date.now() - start
    const message = err instanceof Error ? err.message : 'unknown'

    await getServiceClient().from('wearable_sync_events').insert({
      user_id: USER_ID,
      day_key: dayKey,
      source: adapter.source,
      success: false,
      records_upserted: 0,
      latency_ms: latency,
      error_code: 'EXCEPTION',
    })

    return NextResponse.json({ status: 'error', error: message }, { status: 500 })
  }
}

// Vercel cron calls GET
export { POST as GET }
