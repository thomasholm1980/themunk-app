export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function getOsloDayKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Oslo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const day   = parts.find((p) => p.type === 'day')?.value
  const month = parts.find((p) => p.type === 'month')?.value
  const year  = parts.find((p) => p.type === 'year')?.value

  if (!year || !month || !day) throw new Error('Failed to generate Oslo day_key')
  return `${year}-${month}-${day}`
}

export async function GET() {
  try {
    const supabase = getServiceClient()
    const day_key  = getOsloDayKey()

    const { data, error } = await supabase
      .from('daily_state')
      .select('day_key, state, confidence, final_score, state_trace, sleep_score, recovery_score, hrv, rhr, computed_at, updated_at')
      .eq('user_id', 'thomas')
      .eq('day_key', day_key)
      .maybeSingle()

    if (error) {
      console.error('[state/today] db error', error.message)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'No data available for today' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    console.log('[state/today] serving from daily_state', {
      day_key: data.day_key,
      state:   data.state,
      confidence: data.confidence,
      final_score: data.final_score,
    })

    return NextResponse.json(
      {
        state:       data.state,
        confidence:  data.confidence,
        final_score: data.final_score,
        day_key:     data.day_key,
        hrv:         data.hrv,
        rhr:         data.rhr,
        sleep_score: data.sleep_score,
        readiness_score: data.recovery_score,
        computed_at: data.computed_at,
        updated_at:  data.updated_at,
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
