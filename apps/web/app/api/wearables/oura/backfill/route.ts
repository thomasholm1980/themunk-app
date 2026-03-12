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

const USER_ID = 'thomas'
const BACKFILL_DAYS = 7

function getOsloDayKeys(days: number): string[] {
  const keys: string[] = []
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const key = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Europe/Oslo',
    }).format(date)
    keys.push(key)
  }
  return keys
}

export async function POST() {
  console.log('[backfill] start')
  console.log('[backfill] user_id=thomas')
  console.log(`[backfill] days=${BACKFILL_DAYS}`)
  console.log(`[env] has_supabase_url=${!!process.env.NEXT_PUBLIC_SUPABASE_URL}`)
  console.log(`[env] has_service_role_key=${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`)
  console.log(`[env] has_oura_client_id=${!!process.env.OURA_CLIENT_ID}`)
  console.log(`[env] has_oura_client_secret=${!!process.env.OURA_CLIENT_SECRET}`)

  const supabase = getServiceClient()
  const start = Date.now()

  console.log('[backfill] creating token store')
  const tokenStore = makeOuraTokenStore()
  console.log('[backfill] token store created=true')

  console.log('[backfill] reading token for user=thomas')
  const tokenCheck = await tokenStore.getAccessTokenWithRefresh(USER_ID).catch(() => null)
  console.log(`[backfill] token found=${!!tokenCheck}`)

  const adapter = new OuraAdapter({
    getAccessToken: (userId) => tokenStore.getAccessTokenWithRefresh(userId),
  })

  const dayKeys = getOsloDayKeys(BACKFILL_DAYS)
  const results: { day_key: string; status: string }[] = []

  for (const day_key of dayKeys) {
    try {
      console.log(`[backfill] processing day=${day_key}`)
      console.log('[backfill] calling OuraAdapter')

      const data = await adapter.fetchDay(USER_ID, day_key)

      console.log(`[backfill] adapter returned has_data=${!!data}`)

      if (!data) {
        results.push({ day_key, status: 'no_data' })
        continue
      }

      const { error: wearableError } = await supabase
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

      if (wearableError) {
        results.push({ day_key, status: 'wearable_error' })
        continue
      }

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
        day_key,
        synced_at: new Date().toISOString(),
      }

      const result = computeStateV2({ manualInput: null, wearableInput })

      await supabase
        .from('daily_state')
        .upsert(
          {
            user_id: USER_ID,
            day_key,
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

      results.push({ day_key, status: 'ok' })

    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown'
      console.error(`[backfill] error on ${day_key}:`, message)
      results.push({ day_key, status: 'exception' })
    }
  }

  console.log('[backfill] complete', {
    user_id: USER_ID,
    days: BACKFILL_DAYS,
    results,
    latency_ms: Date.now() - start,
  })

  return NextResponse.json({
    status: 'complete',
    days_processed: results.length,
    results,
    latency_ms: Date.now() - start,
  }, { headers: { 'Cache-Control': 'no-store' } })
}
