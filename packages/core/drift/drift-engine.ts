// packages/core/drift/drift-engine.ts
// DriftDetectionEngine v1
// Detects long-term nervous system decline from rolling wearable windows
// [ASSUMPTION] Minimum 7 days of data required before drift can be computed
// Runs as scheduled job — NOT on-demand

export type DriftStatus =
  | 'insufficient_data'
  | 'stable'
  | 'drift_detected'

export type DriftSignal = {
  signal: string
  baseline_avg: number
  recent_avg: number
  change_pct: number
  flagged: boolean
}

export type DriftResult = {
  window_days: number
  drift_flag: boolean
  drift_status: DriftStatus
  hrv_change_pct: number | null
  rhr_change_pct: number | null
  sleep_score_change_pct: number | null
  readiness_change_pct: number | null
  signals_used: string[]
}

export type WearableRow = {
  day_key: string
  hrv_rmssd: number | null
  resting_hr: number | null
  sleep_score: number | null
  readiness_score: number | null
}

// [ASSUMPTION] HRV decline >10% over window = flagged
// [ASSUMPTION] RHR increase >5% over window = flagged
const DRIFT_THRESHOLDS = {
  HRV_DECLINE_PCT: -10,
  RHR_INCREASE_PCT: 5,
  SLEEP_DECLINE_PCT: -8,
  READINESS_DECLINE_PCT: -8,
} as const

function avg(values: number[]): number | null {
  const valid = values.filter(v => v != null && !isNaN(v))
  if (valid.length === 0) return null
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

function changePct(baseline: number | null, recent: number | null): number | null {
  if (baseline == null || recent == null || baseline === 0) return null
  return Math.round(((recent - baseline) / baseline) * 1000) / 10
}

export function computeDrift(rows: WearableRow[], windowDays: number): DriftResult {
  const MIN_DAYS = 7

  if (rows.length < MIN_DAYS) {
    return {
      window_days: windowDays,
      drift_flag: false,
      drift_status: 'insufficient_data',
      hrv_change_pct: null,
      rhr_change_pct: null,
      sleep_score_change_pct: null,
      readiness_change_pct: null,
      signals_used: [],
    }
  }

  // Sort ascending
  const sorted = [...rows].sort((a, b) => a.day_key.localeCompare(b.day_key))

  // Split: first half = baseline, second half = recent
  const half = Math.floor(sorted.length / 2)
  const baseline = sorted.slice(0, half)
  const recent = sorted.slice(half)

  const bHrv = avg(baseline.map(r => r.hrv_rmssd).filter((v): v is number => v != null))
  const rHrv = avg(recent.map(r => r.hrv_rmssd).filter((v): v is number => v != null))

  const bRhr = avg(baseline.map(r => r.resting_hr).filter((v): v is number => v != null))
  const rRhr = avg(recent.map(r => r.resting_hr).filter((v): v is number => v != null))

  const bSleep = avg(baseline.map(r => r.sleep_score).filter((v): v is number => v != null))
  const rSleep = avg(recent.map(r => r.sleep_score).filter((v): v is number => v != null))

  const bReadiness = avg(baseline.map(r => r.readiness_score).filter((v): v is number => v != null))
  const rReadiness = avg(recent.map(r => r.readiness_score).filter((v): v is number => v != null))

  const hrv_change_pct = changePct(bHrv, rHrv)
  const rhr_change_pct = changePct(bRhr, rRhr)
  const sleep_score_change_pct = changePct(bSleep, rSleep)
  const readiness_change_pct = changePct(bReadiness, rReadiness)

  const signals_used: string[] = []
  if (hrv_change_pct != null) signals_used.push('hrv_rmssd')
  if (rhr_change_pct != null) signals_used.push('resting_hr')
  if (sleep_score_change_pct != null) signals_used.push('sleep_score')
  if (readiness_change_pct != null) signals_used.push('readiness_score')

  const drift_flag =
    (hrv_change_pct != null && hrv_change_pct <= DRIFT_THRESHOLDS.HRV_DECLINE_PCT) ||
    (rhr_change_pct != null && rhr_change_pct >= DRIFT_THRESHOLDS.RHR_INCREASE_PCT) ||
    (sleep_score_change_pct != null && sleep_score_change_pct <= DRIFT_THRESHOLDS.SLEEP_DECLINE_PCT) ||
    (readiness_change_pct != null && readiness_change_pct <= DRIFT_THRESHOLDS.READINESS_DECLINE_PCT)

  return {
    window_days: windowDays,
    drift_flag,
    drift_status: drift_flag ? 'drift_detected' : 'stable',
    hrv_change_pct: hrv_change_pct ?? null,
    rhr_change_pct: rhr_change_pct ?? null,
    sleep_score_change_pct: sleep_score_change_pct ?? null,
    readiness_change_pct: readiness_change_pct ?? null,
    signals_used,
  }
}
