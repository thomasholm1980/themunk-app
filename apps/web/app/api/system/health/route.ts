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

  const { data: token } = await supabase
    .from('oura_tokens')
    .select('updated_at')
    .eq('user_id', 'thomas')
    .maybeSingle()

  const { data: lastState } = await supabase
    .from('daily_state')
    .select('state, confidence, final_score, computed_at, engine_version')
    .eq('user_id', 'thomas')
    .eq('day_key', dayKey)
    .maybeSingle()

  const { data: lastSync } = await supabase
    .from('wearable_logs')
    .select('updated_at')
    .eq('user_id', 'thomas')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const todayStatePresent = !!lastState

  return NextResponse.json(
    {
      oura_connected: !!token,
      today_state_present: todayStatePresent,
      today_state: lastState ?? null,
      last_sync: lastSync?.updated_at ?? null,
      last_state_compute: lastState?.computed_at ?? null,
      engine_version: lastState?.engine_version ?? 'compute_state_v2',
      pipeline_ok: !!token && todayStatePresent,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
