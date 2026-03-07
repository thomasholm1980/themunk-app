// packages/core/domain/language/v1/buildLanguageOutput.ts
// Language Layer v1 — orchestration
// Deterministic. No LLM. Sentence lookup only.
// v1.0.0

import type { LanguageInput, LanguageOutput } from './types'
import {
  OBSERVATION_MAP,
  CONTEXT_MAP,
  GUIDANCE_MODE_MAP,
  GUIDANCE_SENTENCE_MAP,
} from './sentenceMap'

export function buildLanguageOutput(input: LanguageInput): LanguageOutput {
  const observation_sentence = OBSERVATION_MAP[input.primary_frame]
  const context_sentence     = CONTEXT_MAP[input.context_mode] ?? null
  const guidance_mode        = GUIDANCE_MODE_MAP[input.primary_frame]
  const guidance_sentence    = GUIDANCE_SENTENCE_MAP[guidance_mode]

  return {
    version: 'language_v1',
    observation_sentence,
    context_sentence,
    guidance_sentence,
  }
}
