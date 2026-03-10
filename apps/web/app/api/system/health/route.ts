export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function GET() {
  const { data: token } = await supabase
    .from('oura_tokens')
    .select('updated_at')
    .eq('user_id', 'thomas')
    .maybeSingle()

  const { data: lastState } = await supabase
    .from('daily_state')
    .select('computed_at, engine_version')
    .eq('user_id', 'thomas')
    .order('computed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: lastSync } = await supabase
    .from('wearable_logs')
    .select('updated_at')
    .eq('user_id', 'thomas')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return NextResponse.json(
    {
      oura_connected: !!token,
      last_sync: lastSync?.updated_at ?? null,
      last_state_compute: lastState?.computed_at ?? null,
      engine_version: lastState?.engine_version ?? 'compute_state_v2',
    },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
