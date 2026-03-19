import type { MunkState, Confidence, ComputeStateV2Result } from './types'
import type { Intervention } from './intervention'
import type { PatternInsight } from './pattern-engine-v1'

export type MorningInsight = {
  id: string
  type: string
  confidence: 'low' | 'medium' | 'high'
  message: string
} | null

function toMorningInsight(p: PatternInsight | null): MorningInsight {
  if (p === null) return null
  const TYPE_LABEL: Record<string, string> = {
    hrv_decline:       'Recovery trend',
    rhr_elevation:     'Stress signal',
    recovery_rebound:  'Recovery signal',
  }
  return {
    id:         p.insight,
    type:       TYPE_LABEL[p.insight] ?? p.insight,
    confidence: p.confidence,
    message:    p.message,
  }
}

export interface DecisionContract {
  state: MunkState
  protocol_id: 'deep_work' | 'balanced_day' | 'recovery'
  forecast: {
    headline: string
    line: string
  }
  guidance: {
    line: string
    pattern_context: string | null
  }
  explanation: {
    primary_driver: string
    secondary_driver: string
    line: string
  }
  windows: {
    deep_work: string | null
    training: string | null
    recovery: string | null
  }
  confidence: number
  morningInsight: MorningInsight
  contract_version: 'decision_v1'
}

const PROTOCOL_MAP: Record<MunkState, 'deep_work' | 'balanced_day' | 'recovery'> = {
  GREEN:  'deep_work',
  YELLOW: 'balanced_day',
  RED:    'recovery',
}

const FORECAST: Record<MunkState, { headline: string; line: string }> = {
  GREEN: {
    headline: 'Systemet er restituert. Klar til å yte.',
    line:     'HRV og søvn er sterke. Kroppen er ladet — bruk morgenen.',
  },
  YELLOW: {
    headline: 'Moderat stress i dag.',
    line:     'Restitusjon er delvis. Stressnivået er forhøyet. Ikke tøm det du ikke har bygget opp.',
  },
  RED: {
    headline: 'Kroppen er i underskudd. Hvil.',
    line:     'HRV er lav og søvnen var utilstrekkelig. Output koster mer enn det gir i dag.',
  },
}

const GUIDANCE: Record<MunkState, string> = {
  GREEN:  'Legg de tyngste oppgavene til morgenen. 08:00–12:00 er ditt toppvindu.',
  YELLOW: 'Hold kontrollen på dagen. Beskytt ettermiddagen.',
  RED:    'Gjør mindre. Hvile er jobben i dag.',
}

const WINDOWS: Record<MunkState, DecisionContract['windows']> = {
  GREEN: {
    deep_work: '08:00–12:00',
    training:  '12:00–14:00',
    recovery:  null,
  },
  YELLOW: {
    deep_work: '09:00–11:00',
    training:  null,
    recovery:  '14:00–15:00',
  },
  RED: {
    deep_work: null,
    training:  null,
    recovery:  'Hele dagen',
  },
}

function resolveExplanation(result: ComputeStateV2Result): DecisionContract['explanation'] {
  const { inputs_used, rationale_code, signal_flags } = result

  const primary = inputs_used.wearable
    ? 'Wearable recovery data'
    : inputs_used.manual
    ? 'Self-reported signals'
    : 'Insufficient data'

  const secondary = signal_flags.length > 0
    ? `Active flags: ${signal_flags.join(', ')}`
    : inputs_used.manual && inputs_used.wearable
    ? 'Manual and wearable signals combined'
    : 'Single source input'

  const line = `State derived via ${rationale_code}.`

  return { primary_driver: primary, secondary_driver: secondary, line }
}

function confidenceToNumber(c: Confidence): number {
  if (c === 'HIGH') return 0.9
  if (c === 'MEDIUM') return 0.6
  return 0.3
}

export function buildDecisionContract(
  result: ComputeStateV2Result,
  _intervention: Intervention,
  morningInsightRaw: PatternInsight | null = null
): DecisionContract {
  const { state, confidence } = result

  return {
    state,
    protocol_id:     PROTOCOL_MAP[state],
    forecast:        FORECAST[state],
    guidance: {
      line:            GUIDANCE[state],
      pattern_context: null,
    },
    explanation:     resolveExplanation(result),
    windows:         WINDOWS[state],
    confidence:      confidenceToNumber(confidence),
    morningInsight:  toMorningInsight(morningInsightRaw),
    contract_version: 'decision_v1',
  }
}

export type { ExplanationContract } from './explanation'
