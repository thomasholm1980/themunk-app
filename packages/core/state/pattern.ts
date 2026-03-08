// Pattern Engine v1 — deterministic only, no LLM
// Detects multi-day trends from recent signal history
// pattern_version: pattern_v1

export type PatternEngineResult = {
  pattern_codes: string[]
  pattern_version: 'pattern_v1'
}

export interface DaySignals {
  energy: number   // 1–5
  mood: number     // 1–5
  stress: number   // 1–5
  day_key: string
}

// --- Thresholds (frozen v1) ---
const STRAIN_HIGH_STRESS    = 3    // stress >= this = strain day
const STRAIN_LOW_ENERGY     = 3    // energy <= this = strain day
const STRAIN_MIN_DAYS       = 2    // consecutive strain days to trigger
const RECOVERY_WEAK_ENERGY  = 2    // energy <= this = weak recovery
const RECOVERY_MIN_DAYS     = 2    // consecutive weak days to trigger
const SLEEP_VARIANCE_MIN    = 1.5  // energy std dev to trigger instability
const SLEEP_MIN_DAYS        = 3    // days needed for sleep instability check

// --- Helpers ---

function stdDev(values: number[]): number {
  if (values.length < 2) return 0
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / values.length
  return Math.sqrt(variance)
}

// --- Pattern detectors ---

function detectAccumulatingStrain(days: DaySignals[]): boolean {
  // Requires N consecutive days where stress is high AND energy is low
  if (days.length < STRAIN_MIN_DAYS) return false
  const recent = days.slice(-STRAIN_MIN_DAYS)
  return recent.every(
    d => d.stress >= STRAIN_HIGH_STRESS && d.energy <= STRAIN_LOW_ENERGY
  )
}

function detectRecoveryDebt(days: DaySignals[]): boolean {
  // Requires N consecutive days with weak energy
  if (days.length < RECOVERY_MIN_DAYS) return false
  const recent = days.slice(-RECOVERY_MIN_DAYS)
  return recent.every(d => d.energy <= RECOVERY_WEAK_ENERGY)
}

function detectSleepInstability(days: DaySignals[]): boolean {
  // Requires M days with high variance in energy (proxy for sleep quality)
  if (days.length < SLEEP_MIN_DAYS) return false
  const recent = days.slice(-SLEEP_MIN_DAYS)
  const energyValues = recent.map(d => d.energy)
  return stdDev(energyValues) >= SLEEP_VARIANCE_MIN
}

// --- Main export ---

export function computePatterns(recentDays: DaySignals[]): PatternEngineResult {
  const codes: string[] = []

  // Sort ascending by day_key to ensure correct order
  const sorted = [...recentDays].sort((a, b) => a.day_key.localeCompare(b.day_key))

  if (detectAccumulatingStrain(sorted)) {
    codes.push('PATTERN_ACCUMULATING_STRAIN')
  }

  if (detectRecoveryDebt(sorted)) {
    codes.push('PATTERN_RECOVERY_DEBT')
  }

  if (detectSleepInstability(sorted)) {
    codes.push('PATTERN_SLEEP_INSTABILITY')
  }

  // Cap at 2 active patterns per spec
  const capped = codes.slice(0, 2)

  return {
    pattern_codes: capped,
    pattern_version: 'pattern_v1',
  }
}
