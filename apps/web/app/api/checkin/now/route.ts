export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { computeStressNow, inferTimeOfDay } from '@themunk/core/state/stress-now'
import type { MorningState, SelfReport } from '@themunk/core/state/stress-now'

const USER_ID = 'thomas'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function getOsloHour(): number {
  return parseInt(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Oslo',
      hour: 'numeric',
      hour12: false,
    }).format(new Date()),
    10
  )
}

function getOsloDayKey(): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Oslo',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date())
  const d = parts.find(p => p.type === 'day')?.value
  const m = parts.find(p => p.type === 'month')?.value
  const y = parts.find(p => p.type === 'year')?.value
  if (!d || !m || !y) throw new Error('Failed to generate day_key')
  return `${y}-${m}-${d}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const self_report: SelfReport = body.self_report

    const validReports: SelfReport[] = ['rolig', 'spent', 'tung', 'presset']
    if (!validReports.includes(self_report)) {
      return NextResponse.json(
        { error: 'Invalid self_report value' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // Fetch today's morning state
    const supabase  = getServiceClient()
    const day_key   = getOsloDayKey()
    const osloHour  = getOsloHour()
    const time_of_day = inferTimeOfDay(osloHour)

    const { data, error } = await supabase
      .from('daily_state')
      .select('state')
      .eq('user_id', USER_ID)
      .eq('day_key', day_key)
      .maybeSingle()

    if (error) {
      console.error('[checkin/now] db error', error.message)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // Fallback: if no morning state, use YELLOW as neutral baseline
    const morning: MorningState = (data?.state as MorningState) ?? 'YELLOW'

    const result = computeStressNow(morning, self_report, time_of_day)

    console.log('[checkin/now]', { morning, self_report, time_of_day, level: result.stress_now_level })

    return NextResponse.json(
      { ...result, day_key, time_of_day, morning_baseline: morning },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error('[checkin/now] unexpected error', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
