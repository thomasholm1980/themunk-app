export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { computeIntervention } from '@themunk/core/state/intervention'
import { buildDecisionContract } from '@themunk/core/state/decision-contract'
import { guidanceEngineV1 } from '@themunk/core/state/guidance-engine'
import { detectPatterns, applyInsightFrequencyGuard } from '@themunk/core/state/pattern-engine-v1'
import { buildExplanationInput } from '@themunk/core/state/explanation'
import type { ExplanationContract } from '@themunk/core/state/explanation'
import type { ComputeStateV2Result } from '@themunk/core'
import type { DailyStateSnapshot } from '@themunk/core/state/pattern-engine-v1'

const USER_ID_TEXT = 'thomas'
const USER_ID_UUID = '00000000-0000-0000-0000-000000000001'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function getOsloDayKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Oslo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const day   = parts.find((p) => p.type === 'day')?.value
  const month = parts.find((p) => p.type === 'month')?.value
  const year  = parts.find((p) => p.type === 'year')?.value

  if (!year || !month || !day) throw new Error('Failed to generate Oslo day_key')
  return `${year}-${month}-${day}`
}

async function fetchRecentReflection(supabase: any)
  try {
    const { data } = await supabase
      .from('reflection_logs')
      .select('energy, stress, focus, day_key')
      .eq('user_id', USER_ID_UUID)
      .order('day_key', { ascending: false })
      .limit(3)

    if (!data || data.length < 2) return null

    const avg = (key: 'energy' | 'stress' | 'focus') =>
      Math.round(data.reduce((sum, r) => sum + (r[key] ?? 0), 0) / data.length)

    return { energy: avg('energy'), stress: avg('stress'), focus: avg('focus') }
  } catch {
    return null
  }
}

async function generateExplanation(
  input: ReturnType<typeof buildExplanationInput>
): Promise<ExplanationContract | null> {
  try {
    const llmEnabled = process.env.LLM_ENABLED === 'true'
    const apiKey = process.env.OPENAI_API_KEY
    if (!llmEnabled || !apiKey) return null

    const stateLabel = { GREEN: 'well-recovered', YELLOW: 'moderately stressed', RED: 'under high stress' }
    const patternLine = input.strongest_pattern
      ? `The strongest detected pattern is: ${input.strongest_pattern}.`
      : 'No strong pattern detected.'
    const reflectionLine = input.reflection_context
      ? `Recent self-reported data: energy ${input.reflection_context.energy}/3, stress ${input.reflection_context.stress}/3, focus ${input.reflection_context.focus}/3.`
      : 'No recent self-reported data available.'
    const lowConfidenceRule = input.confidence === 'low'
      ? 'This is a low-confidence explanation. Keep summary minimal and non-speculative. Omit context entirely.'
      : ''

    const prompt = `You are a calm, body-first health interpreter for a stress regulation app.
You receive physiological state data. Explain what the body is doing in plain language.

Rules:
- Never diagnose or give medical advice
- Never use medical terminology
- Never override or question the state value
- Never mention raw numbers unless they clarify meaning
- Keep summary under 2 sentences
- Keep driver under 1 sentence
- Tone: calm, human, grounded
- Return only valid JSON, no markdown, no preamble
${lowConfidenceRule}

State: ${input.state} (${stateLabel[input.state]})
HRV: ${input.hrv ?? 'unavailable'}
Resting HR: ${input.rhr ?? 'unavailable'}
Sleep score: ${input.sleep_score ?? 'unavailable'}
Readiness: ${input.readiness ?? 'unavailable'}
${patternLine}
${reflectionLine}
Confidence level: ${input.confidence}

Return JSON:
{
  "summary": "...",
  "driver": "...",
  "context": "..." or null,
  "confidence": "${input.confidence}"
}`

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 300,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      console.error('[explanation] OpenAI error:', res.status)
      return null
    }

    const json = await res.json()
    const text = json.choices?.[0]?.message?.content ?? ''
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean) as ExplanationContract

    // Force deterministic confidence — never trust AI value
    parsed.confidence = input.confidence

    // Low confidence must not include context
    if (input.confidence === 'low') parsed.context = null

    return parsed
  } catch (err) {
    console.error('[explanation] generation failed:', err)
    return null
  }
}

export async function GET() {
  try {
    const supabase = getServiceClient()
    const day_key  = getOsloDayKey()

    // Fetch today
    const { data, error } = await supabase
      .from('daily_state')
      .select('day_key, state, confidence, final_score, state_trace, sleep_score, recovery_score, hrv, rhr, computed_at, updated_at')
      .eq('user_id', USER_ID_TEXT)
      .eq('day_key', day_key)
      .maybeSingle()

    if (error) {
      console.error('[state/today] db error', error.message)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'No data available for today' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // Fetch last 8 days for pattern engine
    const { data: history } = await supabase
      .from('daily_state')
      .select('day_key, state, hrv, rhr, sleep_score, recovery_score')
      .eq('user_id', USER_ID_TEXT)
      .order('day_key', { ascending: false })
      .limit(8)

    const snapshots: DailyStateSnapshot[] = (history ?? []).map((row) => ({
      day_key:         row.day_key,
      state:           row.state as 'GREEN' | 'YELLOW' | 'RED',
      hrv:             row.hrv ?? null,
      resting_hr:      row.rhr ?? null,
      sleep_score:     row.sleep_score ?? null,
      readiness_score: row.recovery_score ?? null,
    }))

    const candidate      = detectPatterns(snapshots)
    const morningInsight = applyInsightFrequencyGuard(candidate, snapshots)

    const state      = data.state as 'GREEN' | 'YELLOW' | 'RED'
    const confidence = data.confidence as 'HIGH' | 'MEDIUM' | 'LOW'

    const result: ComputeStateV2Result = {
      state,
      confidence,
      final_score:       data.final_score,
      rationale_code:    data.state_trace?.rationale_code ?? 'wearable_only',
      manual_score:      null,
      wearable_score:    data.final_score,
      disagreement_flag: false,
      inputs_used:       { manual: false, wearable: true },
      signal_flags:      [],
    }

    const intervention = computeIntervention(state)
    const contract     = buildDecisionContract(result, intervention, morningInsight)
    const guidance     = guidanceEngineV1(state)

    // Explanation Layer v2 — non-blocking
    const reflectionContext = await fetchRecentReflection(supabase)
    const explanationInput  = buildExplanationInput({
      state,
      hrv:               data.hrv ?? null,
      rhr:               data.rhr ?? null,
      sleep_score:       data.sleep_score ?? null,
      readiness:         data.recovery_score ?? null,
      strongest_pattern: morningInsight?.insight ?? null,
      reflection_context: reflectionContext,
    })
    const aiExplanation = await generateExplanation(explanationInput)

    console.log('[state/today] serving from daily_state', {
      day_key:        data.day_key,
      state,
      confidence,
      final_score:    data.final_score,
      candidate:      candidate?.insight ?? null,
      morningInsight: morningInsight?.insight ?? null,
      explanation:    aiExplanation ? 'generated' : 'null',
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
        contract: {
          ...contract,
          aiExplanation,
        },
        intervention,
        guidance,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error('[state/today] unexpected error', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
