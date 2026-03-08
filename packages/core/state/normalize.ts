// State Engine Adapter — Phase 7
// Normalizes computeStateV2() output to NormalizedStateResult
// buildDecisionContract() reads only this type — never raw engine output

import type { ComputeStateV2Result } from './types'
import type { DecisionState } from './decision'

export type NormalizedStateResult = {
  state: DecisionState
  confidence?: number
  trace?: unknown
}

const CONFIDENCE_MAP: Record<string, number> = {
  HIGH: 0.9,
  MEDIUM: 0.65,
  LOW: 0.4,
}

export function normalizeStateResult(raw: ComputeStateV2Result): NormalizedStateResult {
  return {
    state: raw.state as DecisionState,
    confidence: CONFIDENCE_MAP[raw.confidence] ?? 0.65,
    trace: {
      final_score: raw.final_score,
      manual_score: raw.manual_score,
      wearable_score: raw.wearable_score,
      rationale_code: raw.rationale_code,
      disagreement_flag: raw.disagreement_flag,
      signal_flags: raw.signal_flags,
      inputs_used: raw.inputs_used,
    },
  }
}
