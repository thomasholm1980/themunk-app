// pattern-context.ts — Phase 17
// Deterministic map: PatternCode → one calm context sentence
// Rules: no analysis language, no metrics, calm tone, max 1 sentence

import type { PatternCode } from './patterns-v2'

const PATTERN_CONTEXT: Record<PatternCode, string> = {
  PATTERN_SLEEP_INSTABILITY:    'Sleep rhythm has been less stable recently.',
  PATTERN_ACCUMULATING_STRAIN:  'The system has been under sustained strain this week.',
  PATTERN_RECOVERY_DEBT:        'Recovery has been lower than usual over recent days.',
  PATTERN_FRAGMENTED_RECOVERY:  'Energy pattern has been uneven this week.',
}

export function getPatternContext(dominant: PatternCode | null): string | null {
  if (!dominant) return null
  return PATTERN_CONTEXT[dominant] ?? null
}
