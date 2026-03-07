// packages/core/domain/interpretation/types.ts
// Interpretation Layer v2 — internal selection contracts
// Internal only. Not part of public API response.
// v1.0.0

export type PrimaryFrame =
  | 'READINESS'
  | 'CAUTION'
  | 'PROTECTION'
  | 'STABILIZATION'
  | 'RECOVERY_MOMENTUM'

export type ContextMode =
  | 'NONE'
  | 'RECENT_STRAIN'
  | 'RECENT_STABILIZING'
  | 'INTERPRETATION_UNCERTAIN'

export type InterpretationResult = {
  version: 'interpretation_v2'
  primary_frame: PrimaryFrame
  context_mode: ContextMode
  selected_guidance: string[]
  optional_pattern_code: string | null
}

export type InterpretationInput = {
  state: 'GREEN' | 'YELLOW' | 'RED'
  pattern_codes: string[]
  window_7d_status?: string | null
  confidence?: string | null
}
