// signal-explanation.ts — Phase 20: Signal Explanation Layer
// Generates "Why This Today?" — deterministic, no LLM, no metrics.
// Max 2 sentences. Calm language. Interpretation, not analysis.
// Spec: Manju | Implementation: Aval

import type { DecisionState } from './decision'
import type { PatternCode } from './patterns-v2'

export interface SignalExplanationInput {
  stable_state:     DecisionState
  dominant_pattern: PatternCode | null
  // Raw signal hints — booleans only, no metric values exposed to this layer
  hints: {
    sleep_reduced:    boolean
    hrv_low:          boolean
    resting_hr_high:  boolean
    strain_elevated:  boolean
  }
}

export interface SignalExplanation {
  line_1: string
  line_2: string | null
}

// ─── Sentence banks ───────────────────────────────────────────────────────────
// Indexed by condition — calm, hedged, no numbers

const SLEEP_REDUCED: [string, string] = [
  'Sleep recovery was slightly reduced.',
  'Your system may feel slower today.',
]

const HRV_LOW: [string, string] = [
  'Recovery signals are lower than usual.',
  'Your system may need more time to restore today.',
]

const HR_HIGH: [string, string] = [
  'Resting load appears slightly elevated.',
  'Your system may be working harder in the background.',
]

const STRAIN_ELEVATED: [string, string] = [
  'Some strain appears present in the signals.',
  'A lighter approach may support recovery today.',
]

const PATTERN_STRAIN: [string, string] = [
  'Stress load has been building over several days.',
  'Recovery capacity may be lower today.',
]

const PATTERN_SLEEP: [string, string] = [
  'Sleep rhythm has been less stable recently.',
  'Your system may be adapting to an uneven pattern.',
]

const PATTERN_DEBT: [string, string] = [
  'Recovery has been lower than usual over recent days.',
  'Your system may need additional rest to restore.',
]

const PATTERN_FRAGMENTED: [string, string] = [
  'Energy has been uneven this week.',
  'Consistency may help your system settle.',
]

// GREEN fallback — stable, no concern
const GREEN_STABLE: [string, string | null] = [
  'Signals look stable today.',
  null,
]

// RED fallback — no specific signal identified
const RED_FALLBACK: [string, string] = [
  'Several signals suggest reduced capacity today.',
  'Protecting energy may be the most useful focus.',
]

// ─── Main export ──────────────────────────────────────────────────────────────

export function buildSignalExplanation(
  input: SignalExplanationInput
): SignalExplanation {
  const { stable_state, dominant_pattern, hints } = input

  // Pattern takes priority — most informative when present
  if (dominant_pattern === 'PATTERN_ACCUMULATING_STRAIN') {
    return { line_1: PATTERN_STRAIN[0], line_2: PATTERN_STRAIN[1] }
  }
  if (dominant_pattern === 'PATTERN_SLEEP_INSTABILITY') {
    return { line_1: PATTERN_SLEEP[0], line_2: PATTERN_SLEEP[1] }
  }
  if (dominant_pattern === 'PATTERN_RECOVERY_DEBT') {
    return { line_1: PATTERN_DEBT[0], line_2: PATTERN_DEBT[1] }
  }
  if (dominant_pattern === 'PATTERN_FRAGMENTED_RECOVERY') {
    return { line_1: PATTERN_FRAGMENTED[0], line_2: PATTERN_FRAGMENTED[1] }
  }

  // Signal hints — priority order
  if (hints.sleep_reduced) {
    return { line_1: SLEEP_REDUCED[0], line_2: SLEEP_REDUCED[1] }
  }
  if (hints.hrv_low) {
    return { line_1: HRV_LOW[0], line_2: HRV_LOW[1] }
  }
  if (hints.resting_hr_high) {
    return { line_1: HR_HIGH[0], line_2: HR_HIGH[1] }
  }
  if (hints.strain_elevated) {
    return { line_1: STRAIN_ELEVATED[0], line_2: STRAIN_ELEVATED[1] }
  }

  // State fallbacks
  if (stable_state === 'GREEN') {
    return { line_1: GREEN_STABLE[0], line_2: GREEN_STABLE[1] }
  }

  return { line_1: RED_FALLBACK[0], line_2: RED_FALLBACK[1] }
}
