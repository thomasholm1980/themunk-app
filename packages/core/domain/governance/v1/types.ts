// packages/core/domain/governance/v1/types.ts
// Output Governance Layer v1 — I/O contracts
// Last control before UI. Validates, suppresses, enforces.
// v1.0.0

export type GovernanceFlag =
  | 'CONTEXT_SUPPRESSED_CONFLICT'
  | 'CONTEXT_SUPPRESSED_EMPTY'
  | 'CONTEXT_SUPPRESSED_EXPLANATION'
  | 'GUIDANCE_FLAGGED_PRESCRIPTIVE'
  | 'SENTENCE_LIMIT_ENFORCED'

export type GovernanceInput = {
  observation_sentence: string
  context_sentence:     string | null
  guidance_sentence:    string
}

export type GovernedBrief = {
  version:              'governance_v1'
  observation_sentence: string
  context_sentence:     string | null
  guidance_sentence:    string
  governance_flags:     GovernanceFlag[]
}
