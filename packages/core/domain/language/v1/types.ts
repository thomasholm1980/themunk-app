// packages/core/domain/language/v1/types.ts
// Language Layer v1 — I/O contracts
// v1.0.0

import type { PrimaryFrame, ContextMode } from '../../interpretation/types'

export type GuidanceMode =
  | 'ACTIVATE'
  | 'ACTIVATE_WITH_RESTRAINT'
  | 'HOLD_STEADY'
  | 'REDUCE_LOAD'
  | 'PROTECT_BASE'

export type LanguageInput = {
  primary_frame:         PrimaryFrame
  context_mode:          ContextMode
  optional_pattern_code: string | null
  selected_guidance:     string[]
}

export type LanguageOutput = {
  version:              'language_v1'
  observation_sentence: string
  context_sentence:     string | null
  guidance_sentence:    string
}
