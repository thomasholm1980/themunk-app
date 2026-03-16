export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { computeIntervention } from '@themunk/core/state/intervention'
import { buildDecisionContract } from '@themunk/core/state/decision-contract'
import { guidanceEngineV1 } from '@themunk/core/state/guidance-engine'
import { detectPatterns, applyInsightFrequencyGuard } from '@themunk/core/state/pattern-engine-v1'
import { buildExplanationInput } from '@themunk/core/state/explanation'
import { resolveReflectionKey, resolveStability } from '@themunk/core/state/pattern-memory'
import { selectLearningMessage, LEARNING_ARC_SUPPRESS_DAYS } from '@themunk/core/state/learning-arc'
import type { LearningArcResult } from '@themunk/core/state/learning-arc'
import { buildPersonalInsightMessage, PERSONAL_INSIGHT_SUPPRESS_DAYS } from '@themunk/core/state/personal-insight'
import type { PersonalInsightResult } from '@themunk/core/state/personal-insight'
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

async function fetchRecentReflection(supabase: any) {
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

    parsed.confidence = input.confidence
    if (input.confidence === 'low') parsed.context = null

    return parsed
  } catch (err) {
    console.error('[explanation] generation failed:', err)
    return null
  }
}

// Personal Pattern Memory — internal, non-blocking
async function maybeUpdatePatternMemory(
  supabase: any,
  day_key: string,
  pattern_key: string | null,
  reflection: { energy: number; stress: number; focus: number } | null
): Promise<void> {
  try {
    // Guard 1: real pattern required
    if (!pattern_key) return

    // Guard 2: salient reflection required
    if (!reflection) return
    const reflection_key = resolveReflectionKey(reflection.energy, reflection.stress, reflection.focus)
    if (!reflection_key) return

    // Guard 3: same-day idempotency — abort if already logged today
    const { error: logError } = await supabase
      .from('personal_pattern_memory_log' as any)
      .insert({ user_id: USER_ID_TEXT, pattern_key, reflection_key, day_key } as any)

    if (logError) {
      // Unique constraint violation = already ran today
      console.log('[pattern-memory] already logged today, skipping:', day_key)
      return
    }

    // Count occurrences in rolling windows from log
    const now = new Date()
    const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString().slice(0, 10)

    const { data: log60 } = await supabase
      .from('personal_pattern_memory_log' as any)
      .select('day_key')
      .eq('user_id', USER_ID_TEXT)
      .eq('pattern_key', pattern_key)
      .eq('reflection_key', reflection_key)
      .gte('day_key', daysAgo(60))

    const { data: log30 } = await supabase
      .from('personal_pattern_memory_log' as any)
      .select('day_key')
      .eq('user_id', USER_ID_TEXT)
      .eq('pattern_key', pattern_key)
      .eq('reflection_key', reflection_key)
      .gte('day_key', daysAgo(30))

    const { data: log21 } = await supabase
      .from('personal_pattern_memory_log' as any)
      .select('day_key')
      .eq('user_id', USER_ID_TEXT)
      .eq('pattern_key', pattern_key)
      .eq('reflection_key', reflection_key)
      .gte('day_key', daysAgo(21))

    const counts = {
      last21: log21?.length ?? 0,
      last30: log30?.length ?? 0,
      last60: log60?.length ?? 0,
    }

    const stability = resolveStability(counts)

    // Only upsert into personal_pattern_memory if threshold is met
    if (!stability) {
      console.log('[pattern-memory] below threshold, log written but no memory record yet:', counts)
      return
    }

    const { error: upsertError } = await supabase
      .from('personal_pattern_memory' as any)
      .upsert(
        {
          user_id:          USER_ID_TEXT,
          pattern_key,
          reflection_key,
          occurrence_count: counts.last60,
          first_seen_at:    (log60 as any)?.[log60.length - 1]?.day_key ?? day_key,
          last_seen_at:     day_key,
          stability_level:  stability.stability_level,
          confidence:       stability.confidence,
          updated_at:       new Date().toISOString(),
        } as any,
        { onConflict: 'user_id,pattern_key,reflection_key' }
      )

    if (upsertError) {
      console.error('[pattern-memory] upsert error:', upsertError.message)
    } else {
      console.log('[pattern-memory] memory updated:', { pattern_key, reflection_key, ...stability })
    }
  } catch (err) {
    console.error('[pattern-memory] unexpected error:', err)
  }
}


// Learning Arc resolver — non-blocking, system event only
async function resolveLearningArc(
  supabase: any,
  day_key: string,
  hasReflectionToday: boolean
): Promise<LearningArcResult> {
  try {
    // Condition: reflection must exist for today
    if (!hasReflectionToday) return null

    // Fetch last shown_at for this user
    const { data } = await supabase
      .from('learning_arc_events' as any)
      .select('shown_at')
      .eq('user_id', USER_ID_TEXT)
      .order('shown_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data?.shown_at) {
      const lastShown = new Date(data.shown_at)
      const daysSince = (Date.now() - lastShown.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSince < LEARNING_ARC_SUPPRESS_DAYS) return null
    }

    // Show message and log event
    const message = selectLearningMessage()

    await supabase
      .from('learning_arc_events' as any)
      .insert({ user_id: USER_ID_TEXT } as any)

    return { message }
  } catch (err) {
    console.error('[learning-arc] resolver error:', err)
    return null
  }
}


// Personal Insight resolver — deterministic, non-blocking
async function resolvePersonalInsight(
  supabase: any,
  today_pattern_key: string | null
): Promise<PersonalInsightResult> {
  try {
    // Rule: no pattern today = no personal insight
    if (!today_pattern_key) return null

    // Fetch stable high-confidence matches for today's pattern
    const { data: matches } = await supabase
      .from('personal_pattern_memory' as any)
      .select('pattern_key, reflection_key, last_seen_at')
      .eq('user_id', USER_ID_TEXT)
      .eq('pattern_key', today_pattern_key)
      .eq('stability_level', 'stable')
      .eq('confidence', 'high')
      .order('last_seen_at', { ascending: false })
      .limit(1)

    if (!matches || matches.length === 0) return null

    const match = matches[0]

    // Frequency guard: suppress if shown within last 7 days
    const { data: recentEvent } = await supabase
      .from('personal_insight_events' as any)
      .select('shown_at')
      .eq('user_id', USER_ID_TEXT)
      .order('shown_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (recentEvent?.shown_at) {
      const daysSince = (Date.now() - new Date(recentEvent.shown_at).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSince < PERSONAL_INSIGHT_SUPPRESS_DAYS) return null
    }

    // Log event and return insight
    await supabase
      .from('personal_insight_events' as any)
      .insert({
        user_id:        USER_ID_TEXT,
        pattern_key:    match.pattern_key,
        reflection_key: match.reflection_key,
      } as any)

    return buildPersonalInsightMessage(match.pattern_key)
  } catch (err) {
    console.error('[personal-insight] resolver error:', err)
    return null
  }
}

export async function GET() {
  try {
    const supabase = getServiceClient()
    const day_key  = getOsloDayKey()

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

    // Pattern memory update — non-blocking, internal only
    const todayReflection = await (async () => {
      try {
        const { data: r } = await supabase
          .from('reflection_logs')
          .select('energy, stress, focus')
          .eq('user_id', USER_ID_UUID)
          .eq('day_key', day_key)
          .maybeSingle()
        return r ?? null
      } catch { return null }
    })()

    await maybeUpdatePatternMemory(
      supabase,
      day_key,
      morningInsight?.insight ?? null,
      todayReflection
    )

    // Learning Arc — non-blocking
    const hasReflectionToday = todayReflection !== null
    let learningArc: LearningArcResult = null
    try {
      learningArc = await resolveLearningArc(supabase, day_key, hasReflectionToday)
    } catch {
      learningArc = null
    }

    // Personal Insight — non-blocking
    let personalInsight: PersonalInsightResult = null
    try {
      personalInsight = await resolvePersonalInsight(supabase, morningInsight?.insight ?? null)
    } catch {
      personalInsight = null
    }

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
          explanation: aiExplanation,
          learning_arc: learningArc,
          personal_insight: personalInsight,
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
