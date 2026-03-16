content = '''export const dynamic = \'force-dynamic\'
export const revalidate = 0

import { NextResponse } from \'next/server\'
import { createClient } from \'@supabase/supabase-js\'
import { computeIntervention } from \'@themunk/core/state/intervention\'
import { buildDecisionContract } from \'@themunk/core/state/decision-contract\'
import { guidanceEngineV1 } from \'@themunk/core/state/guidance-engine\'
import { detectPatterns, applyInsightFrequencyGuard } from \'@themunk/core/state/pattern-engine-v1\'
import type { ComputeStateV2Result } from \'@themunk/core\'
import type { DailyStateSnapshot } from \'@themunk/core/state/pattern-engine-v1\'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function getOsloDayKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat(\'en-GB\', {
    timeZone: \'Europe/Oslo\',
    year: \'numeric\',
    month: \'2-digit\',
    day: \'2-digit\',
  }).formatToParts(date)

  const day   = parts.find((p) => p.type === \'day\')?.value
  const month = parts.find((p) => p.type === \'month\')?.value
  const year  = parts.find((p) => p.type === \'year\')?.value

  if (!year || !month || !day) throw new Error(\'Failed to generate Oslo day_key\')
  return `${year}-${month}-${day}`
}

export async function GET() {
  try {
    const supabase = getServiceClient()
    const day_key  = getOsloDayKey()

    // Fetch today
    const { data, error } = await supabase
      .from(\'daily_state\')
      .select(\'day_key, state, confidence, final_score, state_trace, sleep_score, recovery_score, hrv, rhr, computed_at, updated_at\')
      .eq(\'user_id\', \'thomas\')
      .eq(\'day_key\', day_key)
      .maybeSingle()

    if (error) {
      console.error(\'[state/today] db error\', error.message)
      return NextResponse.json(
        { error: \'Internal server error\' },
        { status: 500, headers: { \'Cache-Control\': \'no-store\' } }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: \'No data available for today\' },
        { status: 404, headers: { \'Cache-Control\': \'no-store\' } }
      )
    }

    // Fetch last 8 days for pattern engine + frequency guard
    // 8 days = 7 for detection window + 1 extra so guard can evaluate "yesterday"
    const { data: history } = await supabase
      .from(\'daily_state\')
      .select(\'day_key, state, hrv, rhr, sleep_score, recovery_score\')
      .eq(\'user_id\', \'thomas\')
      .order(\'day_key\', { ascending: false })
      .limit(8)

    const snapshots: DailyStateSnapshot[] = (history ?? []).map((row) => ({
      day_key:         row.day_key,
      state:           row.state as \'GREEN\' | \'YELLOW\' | \'RED\',
      hrv:             row.hrv ?? null,
      resting_hr:      row.rhr ?? null,
      sleep_score:     row.sleep_score ?? null,
      readiness_score: row.recovery_score ?? null,
    }))

    const candidate      = detectPatterns(snapshots)
    const morningInsight = applyInsightFrequencyGuard(candidate, snapshots)

    const state      = data.state as \'GREEN\' | \'YELLOW\' | \'RED\'
    const confidence = data.confidence as \'HIGH\' | \'MEDIUM\' | \'LOW\'

    const result: ComputeStateV2Result = {
      state,
      confidence,
      final_score:       data.final_score,
      rationale_code:    data.state_trace?.rationale_code ?? \'wearable_only\',
      manual_score:      null,
      wearable_score:    data.final_score,
      disagreement_flag: false,
      inputs_used:       { manual: false, wearable: true },
      signal_flags:      [],
    }

    const intervention = computeIntervention(state)
    const contract     = buildDecisionContract(result, intervention, morningInsight)
    const guidance     = guidanceEngineV1(state)

    console.log(\'[state/today] serving from daily_state\', {
      day_key:        data.day_key,
      state,
      confidence,
      final_score:    data.final_score,
      candidate:      candidate?.insight ?? null,
      morningInsight: morningInsight?.insight ?? null,
    })

    return NextResponse.json(
      {
        state,
        confidence,
        final_score:     data.final_score,
        day_key:         data.day_key,
        hrv_rmssd:       data.hrv,
        resting_hr:      data.rhr,
        sleep_score:     data.sleep_score,
        readiness_score: data.recovery_score,
        computed_at:     data.computed_at,
        contract,
        intervention,
        guidance,
      },
      { headers: { \'Cache-Control\': \'no-store\' } }
    )
  } catch (err) {
    console.error(\'[state/today] unexpected error\', err)
    return NextResponse.json(
      { error: \'Internal server error\' },
      { status: 500, headers: { \'Cache-Control\': \'no-store\' } }
    )
  }
}
'''

with open('/Users/thomas/Desktop/The_Munk_Health/themunk_app/apps/web/app/api/state/today/route.ts', 'w') as f:
    f.write(content)

print("route.ts updated with frequency guard (8-day window)")
