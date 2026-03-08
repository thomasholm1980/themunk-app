import { createClient } from '@supabase/supabase-js'
import { computeStateV2 } from '@themunk/core/state/compute-state-v2'
import { buildDecisionContract } from '@themunk/core/state/decision'
import { normalizeStateResult } from '@themunk/core/state/normalize'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env vars missing')
  return createClient(url, key)
}

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
    const supabase = getSupabase()
    const userId = 'thomas'
    const dayKey = getOsloDateKey()

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
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    if (!log) {
      return NextResponse.json(
        { state: null, contract: null, day_key: dayKey },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const manualInput = {
      energy: log.energy ?? 3,
      mood: log.mood ?? 3,
      stress: log.stress ?? 3,
      notes: log.notes ?? null,
      created_at: log.created_at ?? new Date().toISOString(),
    }

    const raw = computeStateV2({ manualInput, wearableInput: null })
    const normalized = normalizeStateResult(raw)
    const contract = buildDecisionContract(normalized.state, manualInput)

    const { error: upsertError } = await supabase
      .from('daily_state')
      .upsert(
        {
          user_id: userId,
          day_key: dayKey,
          state: normalized.state,
          state_trace: normalized.trace,
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
      rationale_code: raw.rationale_code,
    })

    return NextResponse.json(
      { state: normalized.state, contract, day_key: dayKey },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error('[state/today] unexpected error', { err, message: err instanceof Error ? err.message : String(err), stack: err instanceof Error ? err.stack : undefined })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
