// packages/core/state/pattern-expression-v1.ts
// Pattern Expression V1 — deterministic display gate
// Decides: should a context line be shown, and which one?
// Does NOT detect patterns. Consumes pattern_memory output only.

import type { DetectedPattern } from './pattern-memory-v1'

export interface PatternExpressionResult {
  show_context_line: true
  pattern_code:      string
  context_line:      string
}

export interface PatternExpressionSuppressed {
  show_context_line: false
}

export type PatternExpressionOutput =
  | PatternExpressionResult
  | PatternExpressionSuppressed

// Only these patterns are approved for V1 display
const APPROVED_CONTEXT_LINES: Record<string, string> = {
  repeated_elevated_stress: 'Stresset ser ut til å bygge seg opp over flere dager.',
  day_drift_negative:       'Dagen blir ofte tyngre utover.',
}

// Priority order — first match wins
const PRIORITY_ORDER = [
  'repeated_elevated_stress',
  'day_drift_negative',
] as const

export function resolvePatternExpression(
  patterns: DetectedPattern[],
  sufficient_data: boolean
): PatternExpressionOutput {
  // Gate 1 — sufficient data required
  if (!sufficient_data) return { show_context_line: false }

  // Gate 2 — find first approved high-confidence pattern in priority order
  for (const code of PRIORITY_ORDER) {
    const match = patterns.find(
      p => p.code === code && p.confidence === 'high'
    )
    if (match) {
      return {
        show_context_line: true,
        pattern_code:      match.code,
        context_line:      APPROVED_CONTEXT_LINES[match.code],
      }
    }
  }

  return { show_context_line: false }
}
