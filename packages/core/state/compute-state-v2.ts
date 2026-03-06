import type {
  ManualInput,
  WearableInput,
  ComputeStateV2Result,
  MunkState,
  Confidence,
} from './types'
import { scoreManual } from './score-manual'
import { scoreWearable } from './score-wearable'
import {
  STATE_THRESHOLDS,
  FUSION_WEIGHTS,
  DISAGREEMENT_THRESHOLD,
  CONFIDENCE_MIN_WEARABLE_SIGNALS,
  ESCALATION,
  CRITICAL_LIMITS,
} from './constants'

type ComputeStateV2Input = {
  manualInput: ManualInput | null
  wearableInput: WearableInput | null
}

function classifyState(score: number): MunkState {
  if (score >= STATE_THRESHOLDS.GREEN) return 'GREEN'
  if (score >= STATE_THRESHOLDS.YELLOW_MIN) return 'YELLOW'
  return 'RED'
}

function collectManualFlags(input: ManualInput): string[] {
  const flags: string[] = []
  const { energy, mood, stress } = input
  const isDistress =
    (energy != null && energy <= CRITICAL_LIMITS.MANUAL_ENERGY_LOW) &&
    (mood != null && mood <= CRITICAL_LIMITS.MANUAL_MOOD_LOW) &&
    (stress != null && stress >= CRITICAL_LIMITS.MANUAL_STRESS_HIGH)
  if (isDistress) flags.push('FLAG_MANUAL_DISTRESS')
  return flags
}

function resolveRationaleCode(hasManual: boolean, hasWearable: boolean, disagreement: boolean, state: MunkState): string {
  if (!hasManual && !hasWearable) return 'R-DATA-MISSING'
  if (disagreement && hasManual && hasWearable) return `R-FUSED-DISAGREEMENT-${state}`
  if (hasManual && hasWearable) return `R-FUSED-ALIGNED-${state}`
  if (hasManual) return `R-MANUAL-DOMINANT-${state}`
  return `R-WEARABLE-DOMINANT-${state}`
}

function resolveConfidence(hasManual: boolean, hasWearable: boolean, disagreement: boolean, wearableSignalCount: number): Confidence {
  if (!hasManual && !hasWearable) return 'LOW'
  if (disagreement) return 'MEDIUM'
  if (hasManual && hasWearable && !disagreement && wearableSignalCount >= CONFIDENCE_MIN_WEARABLE_SIGNALS) return 'HIGH'
  return 'MEDIUM'
}

export function computeStateV2({ manualInput, wearableInput }: ComputeStateV2Input): ComputeStateV2Result {
  if (!manualInput && !wearableInput) {
    return {
      state: 'YELLOW',
      manual_score: null,
      wearable_score: null,
      final_score: 50,
      confidence: 'LOW',
      disagreement_flag: false,
      inputs_used: { manual: false, wearable: false },
      signal_flags: [],
      rationale_code: 'R-DATA-MISSING',
    }
  }

  const manual_score = manualInput ? scoreManual(manualInput) : null
  const manual_flags = manualInput ? collectManualFlags(manualInput) : []
  const wearableResult = wearableInput ? scoreWearable(wearableInput) : null
  const wearable_score = wearableResult?.wearable_score ?? null
  const wearable_flags = wearableResult?.signal_flags ?? []
  const wearable_signal_count = wearableResult?.wearable_signal_count ?? 0
  const hasManual = manual_score !== null
  const hasWearable = wearable_score !== null
  const all_flags = [...manual_flags, ...wearable_flags]

  let raw_final_score: number
  if (hasManual && hasWearable) {
    raw_final_score = (manual_score! * FUSION_WEIGHTS.MANUAL) + (wearable_score! * FUSION_WEIGHTS.WEARABLE)
  } else if (hasManual) {
    raw_final_score = manual_score!
  } else {
    raw_final_score = wearable_score!
  }

  const disagreement_flag = hasManual && hasWearable
    ? Math.abs(manual_score! - wearable_score!) >= DISAGREEMENT_THRESHOLD
    : false

  let state = classifyState(Math.round(raw_final_score))

  if (disagreement_flag) {
    if (state === 'GREEN' && wearable_score! < 50 && manual_score! >= 75) state = 'YELLOW'
    if (state === 'RED' && manual_score! >= 70 && wearable_score! < 45 && wearable_flags.length < 2) state = 'YELLOW'
  }

  if (all_flags.length >= ESCALATION.FLAGS_BLOCK_GREEN && state === 'GREEN') state = 'YELLOW'
  if (all_flags.length >= ESCALATION.FLAGS_FORCE_RED_CANDIDATE) {
    const manualWeak = manual_score != null ? manual_score < 50 : false
    const wearableWeak = wearable_score != null ? wearable_score < 50 : false
    if (manualWeak && wearableWeak) state = 'RED'
    else if (state === 'GREEN') state = 'YELLOW'
  }

  const confidence = resolveConfidence(hasManual, hasWearable, disagreement_flag, wearable_signal_count)
  const final_confidence: Confidence = disagreement_flag && confidence === 'HIGH' ? 'MEDIUM' : confidence

  return {
    state,
    manual_score: manual_score ?? null,
    wearable_score: wearable_score ?? null,
    final_score: Math.round(raw_final_score),
    confidence: final_confidence,
    disagreement_flag,
    inputs_used: { manual: hasManual, wearable: hasWearable },
    signal_flags: all_flags,
    rationale_code: resolveRationaleCode(hasManual, hasWearable, disagreement_flag, state),
  }
}
