// packages/core/tests/test_pattern_guard.ts
// Unit tests for detectPatterns + applyInsightFrequencyGuard

import { detectPatterns, applyInsightFrequencyGuard } from '../state/pattern-engine-v1'
import type { DailyStateSnapshot } from '../state/pattern-engine-v1'

let passed = 0
let failed = 0

function assert(label: string, condition: boolean) {
  if (condition) {
    console.log(`✅ PASS ${label}`)
    passed++
  } else {
    console.log(`❌ FAIL ${label}`)
    failed++
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeSnapshots(overrides: Partial<DailyStateSnapshot>[]): DailyStateSnapshot[] {
  return overrides.map((o, i) => ({
    day_key: `2026-03-${String(i + 1).padStart(2, '0')}`,
    state: 'GREEN' as const,
    hrv: 80,
    resting_hr: 50,
    sleep_score: 75,
    readiness_score: 75,
    ...o,
  }))
}

// ─── detectPatterns tests ─────────────────────────────────────────────────────

// 1. Returns null when fewer than 4 snapshots
{
  const snaps = makeSnapshots([{}, {}, {}])
  assert('detectPatterns: null when < 4 snapshots', detectPatterns(snaps) === null)
}

// 2. Detects HRV decline (>=20% drop for 3 consecutive days vs baseline)
{
  const snaps = makeSnapshots([
    { hrv: 80 }, { hrv: 82 }, { hrv: 81 }, { hrv: 80 },
    { hrv: 60 }, { hrv: 58 }, { hrv: 59 }, // ~27% below baseline of ~80
  ])
  const result = detectPatterns(snaps)
  assert('detectPatterns: detects hrv_decline', result?.insight === 'hrv_decline')
}

// 3. Detects RHR elevation (>=5 bpm rise for 3 consecutive days)
{
  const snaps = makeSnapshots([
    { resting_hr: 50 }, { resting_hr: 51 }, { resting_hr: 50 }, { resting_hr: 50 },
    { resting_hr: 57 }, { resting_hr: 58 }, { resting_hr: 59 },
  ])
  const result = detectPatterns(snaps)
  assert('detectPatterns: detects rhr_elevation', result?.insight === 'rhr_elevation')
}

// 4. Detects recovery rebound (sleep rises >=15 after 2 low days)
{
  const snaps = makeSnapshots([
    { sleep_score: 75 },
    { sleep_score: 60 },
    { sleep_score: 62 },
    { sleep_score: 80 }, // +18 from prev low
  ])
  const result = detectPatterns(snaps)
  assert('detectPatterns: detects recovery_rebound', result?.insight === 'recovery_rebound')
}

// 5. Returns null when no pattern matches
{
  const snaps = makeSnapshots([
    { hrv: 80, resting_hr: 50, sleep_score: 75 },
    { hrv: 79, resting_hr: 51, sleep_score: 74 },
    { hrv: 81, resting_hr: 50, sleep_score: 76 },
    { hrv: 80, resting_hr: 50, sleep_score: 75 },
  ])
  assert('detectPatterns: null when no pattern matches', detectPatterns(snaps) === null)
}

// ─── applyInsightFrequencyGuard tests ────────────────────────────────────────

// 6. Returns null when candidate is null
{
  const snaps = makeSnapshots([{}, {}, {}, {}, {}])
  assert('guard: returns null when candidate is null', applyInsightFrequencyGuard(null, snaps) === null)
}

// 7. Suppresses insight if same as yesterday
{
  // 8 snapshots: days 1-5 baseline HRV ~80, days 6-8 declined → triggers hrv_decline
  // both "yesterday" (days 1-7) and "today" (days 1-8) detect hrv_decline → suppress
  const snaps = makeSnapshots([
    { hrv: 80 }, { hrv: 82 }, { hrv: 81 }, { hrv: 80 },
    { hrv: 60 }, { hrv: 58 }, { hrv: 59 }, // yesterday also triggered
    { hrv: 57 }, // today same pattern
  ])
  const candidate = detectPatterns(snaps)
  const result = applyInsightFrequencyGuard(candidate, snaps)
  assert('guard: suppresses repeated hrv_decline on day 2', result === null)
}

// 8. Surfaces recovery_rebound on first day only
{
  // Days 1-3: normal sleep, days 4-5: low sleep, day 6: rebound
  // "yesterday" window (days 1-5) should NOT trigger rebound
  // "today" window (days 1-6) SHOULD trigger rebound → allow through
  const snaps = makeSnapshots([
    { sleep_score: 75 },
    { sleep_score: 74 },
    { sleep_score: 76 },
    { sleep_score: 60 },
    { sleep_score: 62 },
    { sleep_score: 80 }, // rebound today, not yesterday
  ])
  const candidate = detectPatterns(snaps)
  const result = applyInsightFrequencyGuard(candidate, snaps)
  assert('guard: surfaces recovery_rebound on first day', result?.insight === 'recovery_rebound')
}

// 9. Returns candidate when fewer than 2 snapshots (edge case)
{
  const snaps = makeSnapshots([{}])
  const candidate = { insight: 'hrv_decline' as const, confidence: 'medium' as const, message: 'test' }
  assert('guard: returns candidate when < 2 snapshots', applyInsightFrequencyGuard(candidate, snaps) !== null)
}

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n${passed}/${passed + failed} pattern guard tests passed.`)
if (failed > 0) process.exit(1)
