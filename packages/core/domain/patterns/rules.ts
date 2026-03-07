// packages/core/domain/patterns/rules.ts
// Pattern Engine Light v1 — deterministic rule helpers
// Pure functions. No side effects. No scoring. No language.
// v1.0.0

import type { PatternEngineInput } from './types'

// PATTERN_ACCUMULATING_STRAIN
// YELLOW on 3+ of the last 5 valid days
export function detectAccumulatingStrain(
  recentStates: PatternEngineInput['recentStates']
): boolean {
  const last5 = recentStates.slice(-5)
  if (last5.length < 3) return false
  const yellowCount = last5.filter(r => r.state === 'YELLOW').length
  return yellowCount >= 3
}

// PATTERN_INTERPRETATION_DRIFT
// NOT_ACCURATE on 3+ of the last 7 valid reflections
export function detectInterpretationDrift(
  recentReflections: PatternEngineInput['recentReflections']
): boolean {
  const last7 = recentReflections.slice(-7)
  if (last7.length < 3) return false
  const driftCount = last7.filter(r => r.accuracy === 'NOT_ACCURATE').length
  return driftCount >= 3
}

// PATTERN_RECOVERY_STABILIZING
// Last 3 valid days are GREEN
// AND at least 2 of the prior 5 valid days were YELLOW or RED
export function detectRecoveryStabilizing(
  recentStates: PatternEngineInput['recentStates']
): boolean {
  if (recentStates.length < 6) return false
  const last3 = recentStates.slice(-3)
  const prior5 = recentStates.slice(-8, -3)
  const last3AllGreen = last3.every(r => r.state === 'GREEN')
  const prior5StrainCount = prior5.filter(r => r.state === 'YELLOW' || r.state === 'RED').length
  return last3AllGreen && prior5StrainCount >= 2
}
