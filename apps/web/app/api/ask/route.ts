export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { AnthropicAdapter } from '../../../lib/anthropic_adapter'

const USER_ID = 'thomas'

const STATE_LABEL: Record<string, string> = {
  GREEN:  'lavt stress',
  YELLOW: 'moderat stress',
  RED:    'høyt stress',
}

const PATTERN_LABEL: Record<string, string> = {
  repeated_elevated_stress:       'gjentatt forhøyet stressbelastning over flere dager',
  subjective_load_above_baseline: 'subjektiv belastning over normalt nivå',
  recovery_mismatch:              'restitusjon henger etter belastning',
  day_drift_negative:             'negativ utvikling gjennom dagen',
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function getOsloDayKey(): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Oslo',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

function logTelemetry(event: string, meta?: Record<string, unknown>): void {
  try { console.log('[ask-munk]', { event, ...meta }) } catch { /* never throws */ }
}

const SYSTEM_PROMPT = `Du er The Munk. Du forklarer stress. Du chatter ikke. Du underholder ikke. Du spekulerer ikke.

OUTPUTFORMAT (STRENGT — kun JSON, ingen markdown, ingen preamble):
{
  "short_answer": "...",
  "why_it_matters": "...",
  "what_to_do": "..."
}

SPRÅKREGLER (UFRAVIKELIGE):
- Kun norsk
- Bruk ordet "stress" i svaret
- Maks 2 setninger per felt
- Ikke klinisk språk
- Ikke AI-fraser
- Ikke "kanskje", "det kan være", "basert på"
- Ikke emojis
- Ikke unødvendig fylltekst
- Ikke bruk interne koder som YELLOW, GREEN, RED — bruk kun norske beskrivelser

TONE:
- Rolig
- Jordnær
- Direkte
- Maskulin

VARIASJON (PÅKREVD):
- what_to_do skal variere mellom svar — ikke gjenta samme råd
- Unngå å starte flere felt med "Prioriter søvn"
- Gi konkret handling tilpasset spørsmålet, ikke generisk restitusjonsfrase

ATFERDSREGLER:
- Forankre alltid svaret i stress
- Foretrekk enkle forklaringer fremfor tekniske
- Hvis kontekst finnes → bruk den
- Hvis ingen kontekst → svar generelt men fortsatt forankret

GRENSESNITT:
Hvis spørsmålet er utenfor domenet stress/restitusjon/kropp:
short_answer: "Dette handler ikke om stress i kroppen."
why_it_matters: "Munken hjelper deg å forstå stress og belastning — ikke annet."
what_to_do: "Hold fokus på hvordan kroppen din reagerer og hva du trenger i dag."

FORBUD:
- Ingen diagnoser
- Ingen medisinske råd
- Ikke terapeut
- Ikke ChatGPT
- Ikke lange essays`

export async function POST(req: NextRequest) {
  try {
    const body     = await req.json()
    const question = body.question?.trim()

    if (!question || question.length < 3) {
      return NextResponse.json({ error: 'Question required' }, { status: 400 })
    }

    if (question.length > 500) {
      return NextResponse.json({ error: 'Question too long' }, { status: 400 })
    }

    logTelemetry('ask_munk_question_submitted', { length: question.length })

    const supabase = getServiceClient()
    const day_key  = getOsloDayKey()
    let groundingContext = ''

    try {
      const [stateRes, reflectionRes, patternRes] = await Promise.all([
        supabase.from('daily_state').select('state, confidence, hrv, rhr, sleep_score, recovery_score').eq('user_id', USER_ID).eq('day_key', day_key).maybeSingle(),
        supabase.from('reflection_memory').select('body_feeling, brief_accuracy, day_direction').eq('user_id', USER_ID).eq('day_key', day_key).maybeSingle(),
        supabase.from('pattern_memory').select('pattern_codes, sufficient_data').eq('user_id', USER_ID).eq('day_key', day_key).maybeSingle(),
      ])

      const state      = stateRes.data
      const reflection = reflectionRes.data
      const pattern    = patternRes.data

      if (state) {
        const stateLabel = STATE_LABEL[state.state] ?? 'ukjent stressnivå'
        groundingContext += `\nDAGENS TILSTAND: ${stateLabel} (sikkerhet: ${state.confidence})`
        if (state.hrv)            groundingContext += `, HRV: ${state.hrv}`
        if (state.rhr)            groundingContext += `, hvilepuls: ${state.rhr}`
        if (state.sleep_score)    groundingContext += `, søvnscore: ${state.sleep_score}`
        if (state.recovery_score) groundingContext += `, restitusjon: ${state.recovery_score}`
      }
      if (reflection) {
        groundingContext += `\nDAGENS REFLEKSJON: kroppen kjennes ${reflection.body_feeling ?? 'ukjent'}, dag utviklet seg ${reflection.day_direction ?? 'ukjent'}`
      }
      if (pattern?.sufficient_data && pattern.pattern_codes?.length > 0) {
        const norwegianPatterns = (pattern.pattern_codes as string[])
          .map((code: string) => PATTERN_LABEL[code] ?? code)
        groundingContext += `\nAKTIVE MØNSTRE: ${norwegianPatterns.join('; ')}`
      }

      const activePattern = pattern?.sufficient_data && pattern.pattern_codes?.length > 0
        ? pattern.pattern_codes[0] as string
        : null

      // State-based fallback when no pattern — inject one relevant library item
      const STATE_FALLBACK_SLUGS: Record<string, string | null> = {
        RED:    'seed-stress-accumulation-005',
        YELLOW: 'seed-stress-accumulation-005',
        GREEN:  null,
      }

      if (activePattern) {
        const PATTERN_TAG_MAP: Record<string, string[]> = {
          repeated_elevated_stress:        ['chronic_stress', 'allostatic_load', 'physiological', 'work_stress'],
          subjective_load_above_baseline:  ['work_stress', 'chronic_stress', 'regulation'],
          recovery_mismatch:               ['recovery', 'sleep_debt', 'physiological'],
          day_drift_negative:              ['acute_stress', 'regulation', 'sleep_debt'],
        }
        const targetTags = PATTERN_TAG_MAP[activePattern] ?? []

        if (targetTags.length > 0) {
          const { data: libItems } = await supabase
            .from('content_library')
            .select('title, summary, topic_tags, stress_tags, slug')
            .eq('trust_status', 'approved')
            .eq('library_status', 'available')

          if (libItems && libItems.length > 0) {
            const scored = libItems
              .map((item: any) => ({
                item,
                score: (item.stress_tags as string[]).filter((t: string) => targetTags.includes(t)).length,
              }))
              .filter((s: any) => s.score > 0)
              .sort((a: any, b: any) => b.score - a.score)

            if (scored.length > 0) {
              const best = scored[0].item
              groundingContext += `\nRELEVANT KONTEKST: "${best.title}" — ${best.summary ?? ''}`
              logTelemetry('ask_munk_context_used', { pattern: activePattern, title: best.title })
            } else {
              logTelemetry('ask_munk_context_not_used', { reason: 'no_tag_match', pattern: activePattern })
            }
          }
        }
      } else if (!pattern?.sufficient_data && state?.state) {
        // State-based fallback — inject one quiet support item when no pattern exists
        const fallbackSlug = STATE_FALLBACK_SLUGS[state.state] ?? null
        if (fallbackSlug) {
          const { data: fallbackItems } = await supabase
            .from('content_library')
            .select('title, summary, slug')
            .eq('slug', fallbackSlug)
            .eq('trust_status', 'approved')
            .eq('library_status', 'available')
            .limit(1)

          if (fallbackItems && fallbackItems.length > 0) {
            const item = fallbackItems[0]
            groundingContext += `\nRELEVANT KONTEKST: "${item.title}" — ${item.summary ?? ''}`
            logTelemetry('ask_munk_context_state_fallback', { state: state.state, slug: fallbackSlug })
          }
        }
      }
    } catch { /* grounding failure is non-fatal */ }

    const prompt = groundingContext
      ? `BRUKERKONTEKST:${groundingContext}\n\nSPØRSMÅL: ${question}`
      : `SPØRSMÅL: ${question}`

    const adapter = new AnthropicAdapter()
    let answer: { short_answer: string; why_it_matters: string; what_to_do: string } | null = null

    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 12000)
      )
      const res = await Promise.race([
        adapter.complete({
          prompt: `${SYSTEM_PROMPT}\n\n${prompt}`,
          max_tokens: 400,
          temperature: 0.3,
        }),
        timeoutPromise,
      ])
      const clean = res.text.replace(/```json|```/g, '').trim()
      answer = JSON.parse(clean)
      logTelemetry('ask_munk_answer_rendered')
    } catch (err) {
      console.error('[ask] AI error:', err)
      logTelemetry('ask_munk_answer_failed')
      return NextResponse.json(
        { error: 'Munken svarer ikke akkurat nå. Prøv igjen.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { answer },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error('[ask] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
