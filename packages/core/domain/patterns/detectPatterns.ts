// packages/core/domain/patterns/detectPatterns.ts
// Pattern Engine Light v1 — orchestration
// Deterministic. Read-only. Returns pattern_codes only.
// v1.0.0

import type { PatternEngineInput, PatternEngineOutput, PatternCode } from './types'
import {
  detectAccumulatingStrain,
  detectInterpretationDrift,
  detectRecoveryStabilizing,
} from './rules'

export function detectPatterns(input: PatternEngineInput): PatternEngineOutput {
  const codes: PatternCode[] = []

  if (detectAccumulatingStrain(input.recentStates)) {
    codes.push('PATTERN_ACCUMULATING_STRAIN')
  }

  if (detectInterpretationDrift(input.recentReflections)) {
    codes.push('PATTERN_INTERPRETATION_DRIFT')
  }

  if (detectRecoveryStabilizing(input.recentStates)) {
    codes.push('PATTERN_RECOVERY_STABILIZING')
  }

  return {
    version: 'pattern_v1',
    day_key: input.day_key,
    pattern_codes: codes,
  }
}
