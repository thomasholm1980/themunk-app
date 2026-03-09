// Decision Engine v1 — deterministic only, no LLM
// contract_version: decision_v1

import { getPatternContext } from './pattern-context'
import type { PatternCode } from './patterns-v2'

export type DecisionState = 'GREEN' | 'YELLOW' | 'RED'
export type ProtocolId = 'deep_work' | 'balanced_day' | 'recovery'

export interface DecisionContract {
  state: DecisionState
  protocol_id: ProtocolId
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
  contract_version: 'decision_v1'
}

interface Signals {
  energy: number
  mood: number
  stress: number
}

const TEMPLATES: Record<DecisionState, {
  headline: string
  line: string
  guidance: string
  windows: DecisionContract['windows']
}> = {
  GREEN: {
    headline: 'Today looks good.',
    line: 'Recovery base appears stable today.',
    guidance: 'Use the day actively.',
    windows: { deep_work: '09:00–12:00', training: '16:00–18:00', recovery: null },
  },
  YELLOW: {
    headline: 'Capacity looks mixed today.',
    line: 'Recovery is acceptable, but strain appears present.',
    guidance: 'Keep the day structured and moderate.',
    windows: { deep_work: '09:00–11:00', training: null, recovery: '20:00–21:30' },
  },
  RED: {
    headline: 'Recovery should come first today.',
    line: 'Signals suggest reduced capacity today.',
    guidance: 'Protect energy and reduce load where possible.',
    windows: { deep_work: null, training: null, recovery: '13:00–15:00' },
  },
}

const PROTOCOL_MAP: Record<DecisionState, ProtocolId> = {
  GREEN: 'deep_work',
  YELLOW: 'balanced_day',
  RED: 'recovery',
}

function buildExplanation(state: DecisionState, signals: Signals): DecisionContract['explanation'] {
  const { energy, mood, stress } = signals
  if (state === 'GREEN') {
    return {
      primary_driver: energy >= 4 ? 'Energy reported high' : 'Recovery stable',
      secondary_driver: stress <= 2 ? 'Stress load low' : 'Mood compensating',
      line: 'Signals suggest capacity is available today.',
    }
  }
  if (state === 'YELLOW') {
    const driver = stress >= 3 ? 'Elevated stress detected' : mood <= 3 ? 'Mood below baseline' : 'Mixed signal pattern'
    return {
      primary_driver: driver,
      secondary_driver: energy >= 3 ? 'Energy acceptable' : 'Energy below baseline',
      line: 'Capacity appears moderate — structure will help today.',
    }
  }
  return {
    primary_driver: energy <= 2 ? 'Energy reported low' : 'High stress load detected',
    secondary_driver: mood <= 2 ? 'Mood significantly reduced' : 'Recovery signals weak',
    line: 'System recommends prioritising recovery today.',
  }
}

function computeConfidence(signals: Signals): number {
  const vals = [signals.energy, signals.mood, 6 - signals.stress]
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length
  const variance = vals.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / vals.length
  return Math.round(Math.max(0, 1 - variance / 4) * 100) / 100
}

export function buildDecisionContract(
  state: DecisionState,
  signals: Signals,
  dominantPattern: PatternCode | null = null
): DecisionContract {
  const template = TEMPLATES[state]
  return {
    state,
    protocol_id: PROTOCOL_MAP[state],
    forecast: { headline: template.headline, line: template.line },
    guidance: {
      line: template.guidance,
      pattern_context: getPatternContext(dominantPattern),
    },
    explanation: buildExplanation(state, signals),
    windows: template.windows,
    confidence: computeConfidence(signals),
    contract_version: 'decision_v1',
  }
}
