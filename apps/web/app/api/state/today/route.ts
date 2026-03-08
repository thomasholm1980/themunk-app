import { createClient } from '@supabase/supabase-js'
import { computeStateV2 } from '@themunk/core/state/compute-state-v2'
import { buildDecisionContract } from '@themunk/core/state/decision'
import { normalizeStateResult } from '@themunk/core/state/normalize'
import { computePatterns } from '@themunk/core/state/pattern'
import { computePatternsV2 } from '@themunk/core/state/patterns-v2'
import type { StateHistoryEntry } from '@themunk/core/state/patterns-v2'
import { computeLanguageLayer } from '@themunk/core/state/language'
import type { DaySignals } from '@themunk/core/state/pattern'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
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

    // 1. Fetch today's log
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
        { state: null, contract: null, pattern_engine: null, day_key: dayKey },
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

    // 2. Fetch recent days for pattern engine (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoKey = sevenDaysAgo.toISOString().slice(0, 10)

    const { data: recentLogs } = await supabase
      .from('manual_logs')
      .select('energy, mood, stress, day_key')
      .eq('user_id', userId)
      .gte('day_key', sevenDaysAgoKey)
      .order('day_key', { ascending: true })

    const recentDays: DaySignals[] = (recentLogs ?? []).map((r: DaySignals) => ({
      energy: r.energy ?? 3,
      mood: r.mood ?? 3,
      stress: r.stress ?? 3,
      day_key: r.day_key,
    }))

    // 3. Compute state
    const raw = computeStateV2({ manualInput, wearableInput: null })
    const normalized = normalizeStateResult(raw)

    // 4. Build Decision Contract v1
    const contract = buildDecisionContract(normalized.state, manualInput)

    // 5. Compute patterns
    const pattern_engine = computePatterns(recentDays)

    // 6. Compute language layer
    const language_layer = computeLanguageLayer(pattern_engine.pattern_codes)

    // 7. Upsert to daily_state
    const { error: upsertError } = await supabase
      .from('daily_state')
      .upsert(
        {
          user_id: userId,
          day_key: dayKey,
        pattern_engine_v2,
          state: normalized.state,
          state_trace: normalized.trace,
          contract_version: 'decision_v1',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,day_key' }
      )

    // 8. Fetch daily_state history for Pattern Engine v2
    const { data: stateHistory } = await supabase
      .from('daily_state')
      .select('day_key, state, sleep_score, recovery_score')
      .eq('user_id', userId)
      .order('day_key', { ascending: false })
      .limit(7)

    const historyEntries: StateHistoryEntry[] = (stateHistory ?? []).map((r: StateHistoryEntry) => ({
      day_key: r.day_key,
      state: r.state,
      sleep_score: r.sleep_score ?? null,
      recovery_score: r.recovery_score ?? null,
    }))

    // 9. Compute Pattern Engine v2
    const pattern_engine_v2 = computePatternsV2(historyEntries)

    if (upsertError) {
      console.error('[state/today] upsert error', { error: upsertError.message })
    }

    console.info('[state/today] contract built', {
      day_key: dayKey,
      state: contract.state,
      protocol_id: contract.protocol_id,
      confidence: contract.confidence,
      pattern_codes: pattern_engine.pattern_codes,
    })

    return NextResponse.json(
      {
        state: normalized.state,
        contract: {
          ...contract,
          pattern_engine,
          language_layer,
        },
        day_key: dayKey,
        pattern_engine_v2,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error ? err.stack : undefined
    console.error('[state/today] unexpected error', { message, stack })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
