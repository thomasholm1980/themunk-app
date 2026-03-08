// Pattern Engine v2 — deterministic, physiology-only, no AI
// Spec: Chief AI Architect (Manju) | Implementation: Aval
// pattern_version: pattern_v2

export type PatternCode =
  | 'PATTERN_SLEEP_INSTABILITY'
  | 'PATTERN_ACCUMULATING_STRAIN'
  | 'PATTERN_RECOVERY_DEBT'
  | 'PATTERN_FRAGMENTED_RECOVERY'

export type Severity = 'LOW' | 'MEDIUM'

export interface StateHistoryEntry {
  day_key: string
  state: 'GREEN' | 'YELLOW' | 'RED'
  sleep_score: number | null
  recovery_score: number | null
}

export interface PatternObject {
  code: PatternCode
  severity: Severity
  confidence: 'RULE_BASED'
  days_observed: number
  evidence: {
    state_distribution?: { green: number; yellow: number; red: number }
    trend_flags?: string[]
  }
}

export interface PatternEngineV2Output {
  version: 'pattern_v2'
  window_days: 7
  sufficient_data: boolean
  dominant_pattern: PatternCode | null
  active_patterns: PatternObject[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const WINDOW = 7
const MIN_VALID_DAYS = 4
const SLEEP_STDDEV_THRESHOLD = 15
const SLEEP_STDDEV_MEDIUM = 22
const SLEEP_MIN_DAYS = 3
const STRAIN_CONSECUTIVE_THRESHOLD = 3
const RECOVERY_DEBT_LOW_SCORE = 50
const RECOVERY_DEBT_MIN_DAYS = 3
const FRAGMENTED_MIN_TRANSITIONS = 4

const PRIORITY_ORDER: PatternCode[] = [
  'PATTERN_RECOVERY_DEBT',
  'PATTERN_ACCUMULATING_STRAIN',
  'PATTERN_SLEEP_INSTABILITY',
  'PATTERN_FRAGMENTED_RECOVERY',
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function stddev(values: number[]): number {
  if (values.length < 2) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
  return Math.sqrt(variance)
}

function stateDist(entries: StateHistoryEntry[]) {
  return {
    green: entries.filter(e => e.state === 'GREEN').length,
    yellow: entries.filter(e => e.state === 'YELLOW').length,
    red: entries.filter(e => e.state === 'RED').length,
  }
}

// ---------------------------------------------------------------------------
// Detectors
// ---------------------------------------------------------------------------
function detectSleepInstability(entries: StateHistoryEntry[]): PatternObject | null {
  const withSleep = entries.filter(e => e.sleep_score !== null)
  if (withSleep.length < SLEEP_MIN_DAYS) return null
  const sd = stddev(withSleep.map(e => e.sleep_score as number))
  if (sd < SLEEP_STDDEV_THRESHOLD) return null
  return {
    code: 'PATTERN_SLEEP_INSTABILITY',
    severity: sd >= SLEEP_STDDEV_MEDIUM ? 'MEDIUM' : 'LOW',
    confidence: 'RULE_BASED',
    days_observed: withSleep.length,
    evidence: { trend_flags: [`sleep_score_stddev:${sd.toFixed(1)}`] },
  }
}

function detectAccumulatingStrain(entries: StateHistoryEntry[]): PatternObject | null {
  let maxRun = 0, currentRun = 0
  for (const e of entries) {
    if (e.state === 'YELLOW' || e.state === 'RED') { currentRun++; maxRun = Math.max(maxRun, currentRun) }
    else currentRun = 0
  }
  if (maxRun < STRAIN_CONSECUTIVE_THRESHOLD) return null
  return {
    code: 'PATTERN_ACCUMULATING_STRAIN',
    severity: maxRun >= 5 ? 'MEDIUM' : 'LOW',
    confidence: 'RULE_BASED',
    days_observed: maxRun,
    evidence: { state_distribution: stateDist(entries), trend_flags: [`max_consecutive_non_green:${maxRun}`] },
  }
}

function detectRecoveryDebt(entries: StateHistoryEntry[]): PatternObject | null {
  const withRecovery = entries.filter(e => e.recovery_score !== null)
  if (withRecovery.length < RECOVERY_DEBT_MIN_DAYS) return null
  const lowDays = withRecovery.filter(e => (e.recovery_score as number) < RECOVERY_DEBT_LOW_SCORE)
  if (lowDays.length < RECOVERY_DEBT_MIN_DAYS) return null
  const avg = lowDays.reduce((s, e) => s + (e.recovery_score as number), 0) / lowDays.length
  return {
    code: 'PATTERN_RECOVERY_DEBT',
    severity: lowDays.length >= 5 ? 'MEDIUM' : 'LOW',
    confidence: 'RULE_BASED',
    days_observed: lowDays.length,
    evidence: { trend_flags: [`low_recovery_days:${lowDays.length}`, `avg_recovery_score:${avg.toFixed(1)}`] },
  }
}

function detectFragmentedRecovery(entries: StateHistoryEntry[]): PatternObject | null {
  if (entries.length < 4) return null
  let transitions = 0
  for (let i = 1; i < entries.length; i++) {
    if ((entries[i - 1].state === 'GREEN') !== (entries[i].state === 'GREEN')) transitions++
  }
  if (transitions < FRAGMENTED_MIN_TRANSITIONS) return null
  return {
    code: 'PATTERN_FRAGMENTED_RECOVERY',
    severity: transitions >= 6 ? 'MEDIUM' : 'LOW',
    confidence: 'RULE_BASED',
    days_observed: entries.length,
    evidence: { state_distribution: stateDist(entries), trend_flags: [`state_transitions:${transitions}`] },
  }
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export function computePatternsV2(rawHistory: StateHistoryEntry[]): PatternEngineV2Output {
  const sorted = [...rawHistory]
    .sort((a, b) => a.day_key.localeCompare(b.day_key))
    .slice(-WINDOW)

  if (sorted.length < MIN_VALID_DAYS) {
    return { version: 'pattern_v2', window_days: 7, sufficient_data: false, dominant_pattern: null, active_patterns: [] }
  }

  const active_patterns = [
    detectSleepInstability(sorted),
    detectAccumulatingStrain(sorted),
    detectRecoveryDebt(sorted),
    detectFragmentedRecovery(sorted),
  ].filter((p): p is PatternObject => p !== null)

  const dominant_pattern = PRIORITY_ORDER.find(code => active_patterns.some(p => p.code === code)) ?? null

  return { version: 'pattern_v2', window_days: 7, sufficient_data: true, dominant_pattern, active_patterns }
}
