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

function todayOslo(): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Oslo',
  }).format(new Date())
}

export async function GET() {
  const supabase = getServiceClient()
  const dayKey = todayOslo()
  const checks: Record<string, boolean> = {}

  const { data: wearable } = await supabase
    .from('wearable_logs')
    .select('day_key')
    .eq('user_id', 'thomas')
    .eq('day_key', dayKey)
    .maybeSingle()
  checks.wearable_logs = !!wearable

  const { data: state } = await supabase
    .from('daily_state')
    .select('state, confidence, final_score')
    .eq('user_id', 'thomas')
    .eq('day_key', dayKey)
    .maybeSingle()
  checks.daily_state = !!state
  checks.state_valid = !!state && ['GREEN', 'YELLOW', 'RED'].includes(state.state)

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.themunk.ai'
    const res = await fetch(baseUrl + '/api/state/today')
    checks.endpoint_ok = res.ok
  } catch {
    checks.endpoint_ok = false
  }

  const allPassing = Object.values(checks).every(Boolean)
  console.log('[smoke] pipeline check', { day_key: dayKey, checks, allPassing })

  return NextResponse.json(
    {
      status: allPassing ? 'ok' : 'degraded',
      day_key: dayKey,
      checks,
      state: state ?? null,
    },
    {
      status: allPassing ? 200 : 500,
      headers: { 'Cache-Control': 'no-store' },
    }
  )
}
