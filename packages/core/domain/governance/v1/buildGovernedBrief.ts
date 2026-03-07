// packages/core/domain/governance/v1/buildGovernedBrief.ts
// Output Governance Layer v1 — orchestration
// Validates, suppresses, enforces. No generation. No rewriting.
// v1.0.0

import type { GovernanceInput, GovernedBrief, GovernanceFlag } from './types'
import { validateContext, validateGuidance } from './validators'

export function buildGovernedBrief(input: GovernanceInput): GovernedBrief {
  const flags: GovernanceFlag[] = []

  // Validate context
  const contextResult = validateContext(
    input.observation_sentence,
    input.context_sentence,
    input.guidance_sentence
  )
  flags.push(...contextResult.flags)
  const context_sentence = contextResult.suppressed ? null : input.context_sentence

  // Validate guidance
  const guidanceFlags = validateGuidance(input.guidance_sentence)
  flags.push(...guidanceFlags)

  // Rule 1 — sentence limit audit
  const sentenceCount = [input.observation_sentence, context_sentence, input.guidance_sentence]
    .filter(Boolean).length
  if (sentenceCount > 3) {
    flags.push('SENTENCE_LIMIT_ENFORCED')
  }

  return {
    version:              'governance_v1',
    observation_sentence: input.observation_sentence,
    context_sentence,
    guidance_sentence:    input.guidance_sentence,
    governance_flags:     flags,
  }
}
