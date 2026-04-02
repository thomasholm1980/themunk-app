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

const SYSTEM_PROMPT = `Du er The Munk. Du tolker kroppens tilstander. Du chatter ikke. Du underholder ikke. Du spekulerer ikke.

MUNKENS STEMME:
Du snakker som en rolig, maskulin guide som kjenner kroppen godt.
Du bruker ikke klinisk eller teknisk språk.
Du oversetter signaler til menneskelig forståelse.
Du er aldri bekymret. Du er alltid rolig og tydelig.

BANNLYSTE ORD OG FRASER (bruk ALDRI disse):
- "data", "score", "prosent", "parameter"
- "HRV" (med mindre brukeren spør eksplisitt om HRV)
- "ubrukt stress"
- "basert på", "det kan være", "kanskje", "muligens"
- AI-fraser som "Jeg forstår at...", "Det er viktig å..."
- interne koder: YELLOW, GREEN, RED

MUNKENS VOKABULAR (bruk disse i stedet):
- "hjertets rytme" (i stedet for HRV)
- "nervøs balanse" (i stedet for stressnivå)
- "restitusjonsgjeld" (i stedet for recovery deficit)
- "metabolsk fokus" (i stedet for fordøyelse/processing)
- "kroppens signaler" (i stedet for data)
- "tilstand" (i stedet for score eller resultat)

TOLKNINGSLOGIKK:
Når kroppen har brukt natten på noe annet enn restitusjon (f.eks. fordøyelse, sykdom, uro):
→ "Jeg ser at kroppen din har brukt natten på å prosessere mer enn bare drømmer. Når systemet må fokusere på metabolsk arbeid, må restitusjonen vike. Ta det rolig i dag — la kroppen fullføre det den startet på i natt."

OUTPUTFORMAT (STRENGT — kun JSON, ingen markdown, ingen preamble):
{
  "short_answer": "...",
  "why_it_matters": "...",
  "what_to_do": "..."
}

SPRÅKREGLER (UFRAVIKELIGE):
- Kun norsk
- Bruk ordet "stress" minst én gang i svaret
- Maks 2 setninger per felt
- Ikke klinisk språk
- Ikke AI-fraser
- Ikke emojis
- Ikke unødvendig fylltekst`

const STATE_FALLBACK_SLUGS: Record<string, string> = {
  GREEN:  'green-state-foundation',
  YELLOW: 'yellow-state-support',
  RED:    'red-state-recovery',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const question = (body.question ?? '').trim()
    if (!question) {
      return NextResponse.json({ error: 'Spørsmål mangler' }, { status: 400 })
    }

    const supabase = getServiceClient()
    const dayKey = getOsloDayKey()

    let groundingContext = ''

    try {
      const { data: stateRow } = await supabase
        .from('daily_state')
        .select('state, contract')
        .eq('user_id', USER_ID)
        .eq('day_key', dayKey)
        .maybeSingle()

      const state = stateRow
        ? { state: stateRow.state, contract: stateRow.contract }
        : null

      if (state?.state) {
        const label = STATE_LABEL[state.state] ?? state.state
        groundingContext += `\nDAGENS TILSTAND: ${label}`
      }

      if (state?.contract?.guidance?.line) {
        groundingContext += `\nDAGENS VEILEDNING: ${state.contract.guidance.line}`
      }

      const { data: reflectionRow } = await supabase
        .from('reflection_memory')
        .select('body_feeling, brief_accuracy, day_direction')
        .eq('user_id', USER_ID)
        .eq('day_key', dayKey)
        .maybeSingle()

      if (reflectionRow) {
        if (reflectionRow.body_feeling)
          groundingContext += `\nKROPPEN I DAG: ${reflectionRow.body_feeling}`
        if (reflectionRow.brief_accuracy)
          groundingContext += `\nTRAFF VURDERINGEN: ${reflectionRow.brief_accuracy}`
        if (reflectionRow.day_direction)
          groundingContext += `\nDAGEN UTVIKLET SEG: ${reflectionRow.day_direction}`
      }

      const { data: patternRow } = await supabase
        .from('pattern_memory')
        .select('patterns, sufficient_data')
        .eq('user_id', USER_ID)
        .eq('day_key', dayKey)
        .maybeSingle()

      const pattern = patternRow ?? null
      const activePattern = pattern?.patterns?.[0]?.code ?? null

      if (activePattern) {
        const patternLabel = PATTERN_LABEL[activePattern] ?? activePattern
        groundingContext += `\nAKTIVT MØNSTER: ${patternLabel}`
      }

      if (activePattern) {
        const targetTags = [activePattern, state?.state?.toLowerCase()].filter(Boolean) as string[]
        const { data: libItems } = await supabase
          .from('content_library')
          .select('title, summary, slug, stress_tags')
          .eq('trust_status', 'approved')
          .eq('library_status', 'available')
          .limit(10)

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
      } else if (!pattern?.sufficient_data && state?.state) {
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
