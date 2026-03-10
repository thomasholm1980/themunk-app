import type { MunkState, Confidence, ComputeStateV2Result } from './types'
import type { Intervention } from './intervention'

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
  contract_version: 'decision_v1'
}

const PROTOCOL_MAP: Record<MunkState, 'deep_work' | 'balanced_day' | 'recovery'> = {
  GREEN: 'deep_work',
  YELLOW: 'balanced_day',
  RED: 'recovery',
}

const FORECAST: Record<MunkState, { headline: string; line: string }> = {
  GREEN: {
    headline: 'High physiological readiness',
    line: 'Your system is well-recovered. Conditions support sustained focus and physical output.',
  },
  YELLOW: {
    headline: 'Moderate physiological readiness',
    line: 'Your system shows mixed signals. Prioritise lighter cognitive work and monitor energy through the day.',
  },
  RED: {
    headline: 'Low physiological readiness',
    line: 'Your system needs recovery. Reduce demands and protect your resources today.',
  },
}

const GUIDANCE: Record<MunkState, string> = {
  GREEN: 'Schedule your most demanding cognitive or physical work in the first half of the day.',
  YELLOW: 'Keep tasks manageable. Avoid high-stakes decisions in the afternoon.',
  RED: 'Rest is productive today. Protect sleep, reduce stimulation, avoid new stressors.',
}

const WINDOWS: Record<MunkState, DecisionContract['windows']> = {
  GREEN: {
    deep_work: '08:00–12:00',
    training: '12:00–14:00',
    recovery: null,
  },
  YELLOW: {
    deep_work: '09:00–11:00',
    training: null,
    recovery: '14:00–15:00',
  },
  RED: {
    deep_work: null,
    training: null,
    recovery: 'Throughout the day',
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
  _intervention: Intervention
): DecisionContract {
  const { state, confidence } = result

  return {
    state,
    protocol_id: PROTOCOL_MAP[state],
    forecast: FORECAST[state],
    guidance: {
      line: GUIDANCE[state],
      pattern_context: null,
    },
    explanation: resolveExplanation(result),
    windows: WINDOWS[state],
    confidence: confidenceToNumber(confidence),
    contract_version: 'decision_v1',
  }
}
