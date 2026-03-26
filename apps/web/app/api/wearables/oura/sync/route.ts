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
    console.log(`[sync] cron start — day_key: ${dayKey}`)

    // Idempotent guard: skip if fresh daily_state already exists for today
    const { data: existingState } = await supabase
      .from('daily_state')
      .select('state, computed_at')
      .eq('user_id', USER_ID)
      .eq('day_key', dayKey)
      .maybeSingle()

    if (existingState?.computed_at) {
      const ageMinutes = (Date.now() - new Date(existingState.computed_at).getTime()) / 60000
      if (ageMinutes < 60) {
        console.log(`[sync] skipped — fresh daily_state exists (${Math.round(ageMinutes)}min old, state: ${existingState.state})`)
        // Return 'ok' with existing state so UI can use it directly — not 'skipped'
        return NextResponse.json({
          status: 'ok',
          reason: 'fresh_state_exists',
          day_key: dayKey,
          state: existingState.state,
          age_minutes: Math.round(ageMinutes),
          state_verified: true,
        })
      }
    }

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

    // Sleep completeness guard (Manju v1)
    // Do not compute final state if sleep looks incomplete:
    // - sleep_duration_hours < 6
    // - AND current Oslo hour < 07:30
    const osloParts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Oslo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date())
    const osloH = parseInt(osloParts.find(p => p.type === 'hour')?.value ?? '0', 10)
    const osloM = parseInt(osloParts.find(p => p.type === 'minute')?.value ?? '0', 10)
    const osloHour = osloH + osloM / 60
    const sleepHours = data.sleep_duration_hours ?? 0
    const sleepIncomplete = sleepHours < 6 && osloHour < 7.5

    if (sleepIncomplete) {
      console.log(`[sync] sleep guard: ${sleepHours}h sleep at ${osloHour} Oslo — skipping state compute`)
      return NextResponse.json({
        status: 'sleep_incomplete',
        day_key: dayKey,
        sleep_duration_hours: sleepHours,
        oslo_hour: osloHour,
        message: 'Sleep data not yet complete — state not computed',
      })
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

    const { error: stateError } = await supabase
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

    if (stateError) {
      console.error('[sync] daily_state write failed', stateError.message)
      return NextResponse.json(
        { status: 'error', error: 'daily_state write failed', detail: stateError.message },
        { status: 500 }
      )
    }

    // Self-verify: confirm daily_state row exists
    const { data: verify } = await supabase
      .from('daily_state')
      .select('state, confidence, final_score')
      .eq('user_id', USER_ID)
      .eq('day_key', dayKey)
      .maybeSingle()

    if (!verify) {
      console.error('[sync] self-verify failed: daily_state row missing after upsert')
      return NextResponse.json(
        { status: 'error', error: 'self_verify_failed', detail: 'daily_state row missing after upsert' },
        { status: 500 }
      )
    }

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
      state_verified: true,
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
