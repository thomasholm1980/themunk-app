// packages/core/state/pattern-memory-v1.ts
// Personal Pattern Memory V1 — deterministic, evidence-based
// Crosses daily_state + reflection_memory
// Does NOT affect computeStateV2 or daily_state.

export type PatternCode =
  | 'repeated_elevated_stress'
  | 'subjective_load_above_baseline'
  | 'recovery_mismatch'
  | 'day_drift_negative'

export type PatternConfidence = 'low' | 'medium' | 'high'

export interface DetectedPattern {
  code:          PatternCode
  confidence:    PatternConfidence
  evidence_days: number
}

export interface PatternMemoryResult {
  sufficient_data: boolean
  window_days:     number
  patterns:        DetectedPattern[]
}

export interface DailyStateRow {
  day_key: string
  state:   'GREEN' | 'YELLOW' | 'RED'
}

export interface ReflectionRow {
  day_key:        string
  body_feeling?:  string | null
  brief_accuracy?: string | null
  day_direction?:  string | null
}

const MIN_OBSERVED_DAYS  = 5
const MIN_EVIDENCE_DAYS  = 3
const WINDOW_DAYS        = 7

function daysInWindow(rows: { day_key: string }[], windowDays: number): string[] {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - windowDays)
  const cutoffKey = cutoff.toISOString().slice(0, 10)
  return rows.map(r => r.day_key).filter(k => k >= cutoffKey)
}

// Pattern 1 — repeated_elevated_stress
// YELLOW or RED on 3+ days in window
function detectRepeatedElevatedStress(
  states: DailyStateRow[]
): DetectedPattern | null {
  const elevated = states.filter(s => s.state === 'YELLOW' || s.state === 'RED')
  if (elevated.length < MIN_EVIDENCE_DAYS) return null
  return {
    code:          'repeated_elevated_stress',
    confidence:    elevated.length >= 5 ? 'high' : 'medium',
    evidence_days: elevated.length,
  }
}

// Pattern 2 — subjective_load_above_baseline
// Reflection body_feeling is 'presset' or 'tung' on 3+ days
// regardless of physiology state
function detectSubjectiveLoadAboveBaseline(
  reflections: ReflectionRow[]
): DetectedPattern | null {
  const heavy = reflections.filter(
    r => r.body_feeling === 'presset' || r.body_feeling === 'tung'
  )
  if (heavy.length < MIN_EVIDENCE_DAYS) return null
  return {
    code:          'subjective_load_above_baseline',
    confidence:    heavy.length >= 5 ? 'high' : 'medium',
    evidence_days: heavy.length,
  }
}

// Pattern 3 — recovery_mismatch
// Physiology is GREEN but reflection body_feeling is 'tung' or 'presset'
// on 3+ days — body says recovered, person still feels heavy
function detectRecoveryMismatch(
  states: DailyStateRow[],
  reflections: ReflectionRow[]
): DetectedPattern | null {
  const reflectionMap = new Map(reflections.map(r => [r.day_key, r]))
  const mismatches = states.filter(s => {
    if (s.state !== 'GREEN') return false
    const r = reflectionMap.get(s.day_key)
    if (!r) return false
    return r.body_feeling === 'tung' || r.body_feeling === 'presset'
  })
  if (mismatches.length < MIN_EVIDENCE_DAYS) return null
  return {
    code:          'recovery_mismatch',
    confidence:    'medium',
    evidence_days: mismatches.length,
  }
}

// Pattern 4 — day_drift_negative
// day_direction = 'verre' on 3+ days in window
function detectDayDriftNegative(
  reflections: ReflectionRow[]
): DetectedPattern | null {
  const worse = reflections.filter(r => r.day_direction === 'verre')
  if (worse.length < MIN_EVIDENCE_DAYS) return null
  return {
    code:          'day_drift_negative',
    confidence:    worse.length >= 5 ? 'high' : 'medium',
    evidence_days: worse.length,
  }
}

export function computePatternMemory(
  states:      DailyStateRow[],
  reflections: ReflectionRow[]
): PatternMemoryResult {
  // Filter to window
  const statesInWindow = states.filter(s => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - WINDOW_DAYS)
    return s.day_key >= cutoff.toISOString().slice(0, 10)
  })

  const reflectionsInWindow = reflections.filter(r => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - WINDOW_DAYS)
    return r.day_key >= cutoff.toISOString().slice(0, 10)
  })

  // Sufficient data check — need at least MIN_OBSERVED_DAYS of state data
  if (statesInWindow.length < MIN_OBSERVED_DAYS) {
    return { sufficient_data: false, window_days: WINDOW_DAYS, patterns: [] }
  }

  const candidates = [
    detectRepeatedElevatedStress(statesInWindow),
    detectSubjectiveLoadAboveBaseline(reflectionsInWindow),
    detectRecoveryMismatch(statesInWindow, reflectionsInWindow),
    detectDayDriftNegative(reflectionsInWindow),
  ].filter((p): p is DetectedPattern => p !== null)

  return {
    sufficient_data: true,
    window_days:     WINDOW_DAYS,
    patterns:        candidates,
  }
}
