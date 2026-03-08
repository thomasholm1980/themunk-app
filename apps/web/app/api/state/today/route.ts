import { createClient } from '@supabase/supabase-js'
import { computeStateV2 as computeState } from '@themunk/core/state/compute-state-v2'
import { buildDecisionContract } from '@themunk/core/state/decision'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getOsloDateKey(): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Oslo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export async function GET() {
  try {
    const userId = 'thomas'
    const dayKey = getOsloDateKey()

    // 1. Fetch latest log for today
    const { data: log, error: logError } = await supabase
      .from('manual_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('day_key', dayKey)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (logError) {
      console.error('[state/today] log fetch error', { error: logError.message })
      return NextResponse.json(
        { error: 'Failed to fetch log' },
        {
          status: 500,
          headers: { 'Cache-Control': 'no-store' },
        }
      )
    }

    // 2. No log yet — return empty state
    if (!log) {
      return NextResponse.json(
        { state: null, contract: null, day_key: dayKey },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const signals = {
      energy: log.energy ?? 3,
      mood: log.mood ?? 3,
      stress: log.stress ?? 3,
    }

    // 3. Compute deterministic state
    const stateResult = computeState(signals)

    // 4. Build Decision Contract v1
    const contract = buildDecisionContract(stateResult.state, signals)

    // 5. Upsert to daily_state
    const { error: upsertError } = await supabase
      .from('daily_state')
      .upsert(
        {
          user_id: userId,
          day_key: dayKey,
          state: stateResult.state,
          state_trace: stateResult.trace,
          contract_version: 'decision_v1',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,day_key' }
      )

    if (upsertError) {
      console.error('[state/today] upsert error', { error: upsertError.message })
    }

    console.info('[state/today] contract built', {
      day_key: dayKey,
      state: contract.state,
      protocol_id: contract.protocol_id,
      confidence: contract.confidence,
    })

    return NextResponse.json(
      { state: stateResult.state, contract, day_key: dayKey },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error('[state/today] unexpected error', { err })
    return NextResponse.json(
      { error: 'Internal server error' },
      {
        status: 500,
        headers: { 'Cache-Control': 'no-store' },
      }
    )
  }
}
