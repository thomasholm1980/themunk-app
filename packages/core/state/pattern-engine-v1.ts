import type { MunkState } from './types'

export type PatternInsightKey =
  | 'hrv_decline'
  | 'rhr_elevation'
  | 'recovery_rebound'

export type PatternInsight = {
  insight: PatternInsightKey
  confidence: 'low' | 'medium' | 'high'
  message: string
}

export type DailyStateSnapshot = {
  day_key: string
  state: MunkState
  hrv?: number | null
  resting_hr?: number | null
  sleep_score?: number | null
  readiness_score?: number | null
}

function average(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length
}

// ─── Canonical engine ────────────────────────────────────────────────────────

export function detectPatterns(
  snapshots: DailyStateSnapshot[]
): PatternInsight | null {
  if (!snapshots || snapshots.length < 4) return null

  const sorted = [...snapshots].sort((a, b) =>
    a.day_key.localeCompare(b.day_key)
  )

  // Rule 1 — HRV decline
  const hrvValues = sorted
    .map(s => s.hrv)
    .filter((v): v is number => v != null)

  if (hrvValues.length >= 4) {
    const baseline = average(hrvValues.slice(0, hrvValues.length - 3))
    const recent = hrvValues.slice(-3)
    const allDeclined = recent.every(v => v <= baseline * 0.8)
    if (allDeclined) {
      return {
        insight: 'hrv_decline',
        confidence: 'medium',
        message: 'Your recovery signals have been trending lower this week.',
      }
    }
  }

  // Rule 2 — RHR elevation
  const rhrValues = sorted
    .map(s => s.resting_hr)
    .filter((v): v is number => v != null)

  if (rhrValues.length >= 4) {
    const baseline = average(rhrValues.slice(0, rhrValues.length - 3))
    const recent = rhrValues.slice(-3)
    const allElevated = recent.every(v => v >= baseline + 5)
    if (allElevated) {
      return {
        insight: 'rhr_elevation',
        confidence: 'medium',
        message: 'Your resting heart rate has been elevated for several days.',
      }
    }
  }

  // Rule 3 — Recovery rebound
  const sleepValues = sorted
    .map(s => s.sleep_score)
    .filter((v): v is number => v != null)

  if (sleepValues.length >= 3) {
    const prev2 = sleepValues.slice(-3, -1)
    const latest = sleepValues[sleepValues.length - 1]
    const bothLow = prev2.every(v => v < 70)
    const rebounded = latest >= prev2[prev2.length - 1] + 15
    if (bothLow && rebounded) {
      return {
        insight: 'recovery_rebound',
        confidence: 'medium',
        message: 'Your system is showing signs of recovery after a difficult stretch.',
      }
    }
  }

  return null
}

// ─── Legacy compatibility layer ──────────────────────────────────────────────

type LegacyPatternInput = {
  state: MunkState
  sleep_score: number | null
  recent_states: string[]
  context_tags: string[]
}

type LegacyPatternResult = {
  pattern_detected: boolean
  insight: string
  pattern_id: string | null
}

/**
 * @deprecated Legacy pattern engine. Keep temporarily for interpreter compatibility.
 * Migrate callers to detectPatterns() when ready.
 */
export function patternEngineV1(input: LegacyPatternInput): LegacyPatternResult {
  const { state, sleep_score, recent_states, context_tags } = input

  // Pattern 1: sleep_score < 70 AND state = YELLOW
  if (sleep_score !== null && sleep_score < 70 && state === 'YELLOW') {
    return {
      pattern_detected: true,
      insight: 'Your stress often rises after shorter sleep.',
      pattern_id: 'sleep_stress_link',
    }
  }

  // Pattern 2: 3+ stress days in last 5 days
  const stressDays = recent_states.filter(s => s === 'YELLOW' || s === 'RED').length
  if (stressDays >= 3) {
    return {
      pattern_detected: true,
      insight: 'Your system has been under steady pressure for several days.',
      pattern_id: 'sustained_stress',
    }
  }

  // Pattern 3: context tag = work_stress AND state = YELLOW
  if (context_tags.includes('work_stress') && state === 'YELLOW') {
    return {
      pattern_detected: true,
      insight: 'Work pressure often shows up in your stress signals.',
      pattern_id: 'work_stress_link',
    }
  }

  return {
    pattern_detected: false,
    insight: '',
    pattern_id: null,
  }
}
