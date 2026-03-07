// packages/core/domain/interpretation/buildInterpretation.ts
// Interpretation Layer v2 — orchestration
// Deterministic. Read-only. Internal selection only.
// v1.0.0

import type { InterpretationInput, InterpretationResult } from './types'
import {
  resolvePrimaryFrame,
  resolveContextMode,
  resolveGuidance,
  resolveOptionalPattern,
} from './rules'

export function buildInterpretation(input: InterpretationInput): InterpretationResult {
  const primary_frame = resolvePrimaryFrame(input.state, input.pattern_codes)
  const context_mode  = resolveContextMode(
    input.pattern_codes,
    input.window_7d_status,
    input.confidence
  )
  const selected_guidance    = resolveGuidance(primary_frame)
  const optional_pattern_code = resolveOptionalPattern(input.pattern_codes, context_mode)

  return {
    version:              'interpretation_v2',
    primary_frame,
    context_mode,
    selected_guidance,
    optional_pattern_code,
  }
}
