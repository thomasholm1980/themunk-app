export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callOpenAI } from '../../../../lib/openai-provider'
import { buildInterpreterPrompt } from '../../../../lib/interpreter-prompt'
import { guidanceEngineV1 } from '@themunk/core/state/guidance-engine'

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

  const { data, error } = await supabase
    .from('daily_state')
    .select('state, confidence, final_score, sleep_score, recovery_score, hrv, rhr')
    .eq('user_id', 'thomas')
    .eq('day_key', dayKey)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json(
      { error: 'No state available for today' },
      { status: 404, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  const state = data.state as 'GREEN' | 'YELLOW' | 'RED'

  const prompt = buildInterpreterPrompt({
    state,
    confidence: data.confidence,
    final_score: data.final_score,
    hrv: data.hrv ?? null,
    resting_hr: data.rhr ?? null,
    sleep_score: data.sleep_score ?? null,
    readiness_score: data.recovery_score ?? null,
  })

  const aiResult = await callOpenAI(prompt)

  if (aiResult) {
    return NextResponse.json(
      {
        explanation: aiResult.explanation,
        guidance: aiResult.guidance,
        insight: aiResult.insight,
        source: 'ai',
        state,
        day_key: dayKey,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }

  // Fallback to deterministic guidance
  const fallback = guidanceEngineV1(state)
  const stressLabel = state === 'GREEN' ? 'low' : state === 'YELLOW' ? 'moderate' : 'high'

  return NextResponse.json(
    {
      explanation: 'Your stress level is ' + stressLabel + ' today.',
      guidance: fallback.body,
      insight: '',
      source: 'fallback',
      state,
      day_key: dayKey,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
