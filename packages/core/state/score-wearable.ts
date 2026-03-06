import type { WearableInput, WearableScoreResult } from './types'
import {
  WEARABLE_WEIGHTS,
  SLEEP_SCORE_MAP,
  READINESS_SCORE_MAP,
  HRV_SCORE_MAP,
  RHR_SCORE_MAP,
  SLEEP_DURATION_SCORE_MAP,
  ACTIVITY_SCORE_MAP,
  CRITICAL_LIMITS,
} from './constants'

function lookupMinTable(value: number, table: readonly { min: number; score: number }[]): number {
  for (const band of table) {
    if (value >= band.min) return band.score
  }
  return table[table.length - 1].score
}

function lookupRHR(value: number): number {
  for (const band of RHR_SCORE_MAP) {
    if (value <= band.max) return band.score
  }
  return 20
}

function collectWearableFlags(input: WearableInput): string[] {
  const flags: string[] = []
  if (input.sleep_duration_minutes != null && input.sleep_duration_minutes < CRITICAL_LIMITS.SLEEP_DURATION_VERY_LOW) flags.push('FLAG_SLEEP_VERY_LOW')
  if (input.sleep_score != null && input.sleep_score < CRITICAL_LIMITS.SLEEP_SCORE_CRITICAL) flags.push('FLAG_SLEEP_SCORE_CRITICAL')
  if (input.readiness_score != null && input.readiness_score < CRITICAL_LIMITS.READINESS_CRITICAL) flags.push('FLAG_READINESS_CRITICAL')
  if (input.hrv != null && input.hrv < CRITICAL_LIMITS.HRV_CRITICAL) flags.push('FLAG_HRV_CRITICAL')
  if (input.resting_hr != null && input.resting_hr > CRITICAL_LIMITS.RHR_HIGH) flags.push('FLAG_RHR_HIGH')
  return flags
}

export function scoreWearable(input: WearableInput): WearableScoreResult {
  type SignalEntry = { key: string; sub_score: number; weight: number }
  const available: SignalEntry[] = []

  if (input.sleep_score != null) available.push({ key: 'sleep_score', sub_score: lookupMinTable(input.sleep_score, SLEEP_SCORE_MAP), weight: WEARABLE_WEIGHTS.sleep_score })
  if (input.readiness_score != null) available.push({ key: 'readiness_score', sub_score: lookupMinTable(input.readiness_score, READINESS_SCORE_MAP), weight: WEARABLE_WEIGHTS.readiness_score })
  if (input.hrv != null) available.push({ key: 'hrv', sub_score: lookupMinTable(input.hrv, HRV_SCORE_MAP), weight: WEARABLE_WEIGHTS.hrv })
  if (input.resting_hr != null) available.push({ key: 'resting_hr', sub_score: lookupRHR(input.resting_hr), weight: WEARABLE_WEIGHTS.resting_hr })
  if (input.sleep_duration_minutes != null) available.push({ key: 'sleep_duration_minutes', sub_score: lookupMinTable(input.sleep_duration_minutes, SLEEP_DURATION_SCORE_MAP), weight: WEARABLE_WEIGHTS.sleep_duration_minutes })
  if (input.activity_score != null) available.push({ key: 'activity_score', sub_score: lookupMinTable(input.activity_score, ACTIVITY_SCORE_MAP), weight: WEARABLE_WEIGHTS.activity_score })

  if (available.length === 0) {
    return { wearable_score: null, signal_flags: [], wearable_signals_used: [], wearable_signal_count: 0 }
  }

  const total_weight = available.reduce((sum, s) => sum + s.weight, 0)
  const weighted_sum = available.reduce((sum, s) => sum + (s.sub_score * s.weight), 0)
  const wearable_score = Math.round(weighted_sum / total_weight)

  return {
    wearable_score: Math.max(0, Math.min(100, wearable_score)),
    signal_flags: collectWearableFlags(input),
    wearable_signals_used: available.map(s => s.key),
    wearable_signal_count: available.length,
  }
}
