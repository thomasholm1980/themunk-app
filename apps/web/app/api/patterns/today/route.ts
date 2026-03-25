// apps/web/app/api/patterns/today/route.ts
// Personal Pattern Memory V1 — GET
// Computes on request from daily_state + reflection_memory
// Stores daily snapshot. Does NOT affect computeStateV2.

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { computePatternMemory } from '@themunk/core/state/pattern-memory-v1'
import type { DailyStateRow, ReflectionRow } from '@themunk/core/state/pattern-memory-v1'

const USER_ID = 'thomas'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
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

function logTelemetry(event: string, meta?: Record<string, unknown>): void {
  try {
    console.log('[pattern-memory]', { event, ...meta })
  } catch { /* never throws */ }
}

export async function GET() {
  try {
    const supabase = getServiceClient()
    const day_key  = getOsloDayKey()

    // Fetch last 7 days of daily_state
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 7)
    const cutoffKey = cutoff.toISOString().slice(0, 10)

    const { data: stateRows, error: stateError } = await supabase
      .from('daily_state')
      .select('day_key, state')
      .eq('user_id', USER_ID)
      .gte('day_key', cutoffKey)
      .order('day_key', { ascending: false })

    if (stateError) {
      console.error('[patterns/today] state fetch error:', stateError.message)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // Fetch last 7 days of reflection_memory
    const { data: reflectionRows } = await supabase
      .from('reflection_memory')
      .select('day_key, body_feeling, brief_accuracy, day_direction')
      .eq('user_id', USER_ID)
      .gte('day_key', cutoffKey)
      .order('day_key', { ascending: false })

    const states:      DailyStateRow[] = (stateRows ?? []).map(r => ({
      day_key: r.day_key,
      state:   r.state as 'GREEN' | 'YELLOW' | 'RED',
    }))

    const reflections: ReflectionRow[] = (reflectionRows ?? []).map(r => ({
      day_key:        r.day_key,
      body_feeling:   r.body_feeling   ?? null,
      brief_accuracy: r.brief_accuracy ?? null,
      day_direction:  r.day_direction  ?? null,
    }))

    const result = computePatternMemory(states, reflections)

    // Telemetry
    if (!result.sufficient_data) {
      logTelemetry('pattern_memory_insufficient_data', { observed: states.length })
    } else if (result.patterns.length > 0) {
      logTelemetry('pattern_memory_available', {
        patterns: result.patterns.map(p => p.code),
      })
    } else {
      logTelemetry('pattern_memory_computed', { patterns: 0 })
    }

    // Store daily snapshot — upsert, non-blocking
    try {
      await supabase
        .from('pattern_memory')
        .upsert(
          {
            user_id:         USER_ID,
            day_key,
            window_days:     result.window_days,
            sufficient_data: result.sufficient_data,
            pattern_codes:   result.patterns.map(p => p.code),
            pattern_payload: result.patterns,
          },
          { onConflict: 'user_id,day_key' }
        )
    } catch (snapErr) {
      // Non-fatal — snapshot failure does not block response
      console.error('[patterns/today] snapshot write error:', snapErr)
    }

    console.log('[patterns/today] computed:', {
      day_key,
      sufficient_data: result.sufficient_data,
      patterns: result.patterns.map(p => p.code),
    })

    return NextResponse.json(
      result,
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error('[patterns/today] unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
