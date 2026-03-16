content = '''import type { MunkState } from './types'

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

export function detectPatterns(
  snapshots: DailyStateSnapshot[]
): PatternInsight | null {
  if (!snapshots || snapshots.length < 4) return null

  const sorted = [...snapshots].sort((a, b) =>
    a.day_key.localeCompare(b.day_key)
  )

  // --- Rule 1: HRV decline ---
  // Trigger if HRV drops >= 20% vs 7-day baseline for 3 consecutive days
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

  // --- Rule 2: RHR elevation ---
  // Trigger if RHR rises >= 5 bpm vs 7-day baseline for 3 consecutive days
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

  // --- Rule 3: Recovery rebound ---
  // Trigger if sleep score rises >= 15 points after 2 consecutive low days (< 70)
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
'''

with open('/Users/thomas/Desktop/The_Munk_Health/themunk_app/packages/core/state/pattern-engine-v1.ts', 'w') as f:
    f.write(content)

print("pattern-engine-v1.ts written successfully")
