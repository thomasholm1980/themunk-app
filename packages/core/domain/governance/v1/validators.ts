// packages/core/domain/governance/v1/validators.ts
// Output Governance Layer v1 — validation and suppression rules
// Deterministic. No LLM. No rewriting.
// v1.0.0

import type { GovernanceFlag } from './types'

// ── Rule 4 — No explanation language ─────────────────────────────

const EXPLANATION_PATTERNS = [
  'because', 'therefore', 'which means', 'due to',
  'compared to', 'indicates that',
]

export function containsExplanationLanguage(sentence: string): boolean {
  const lower = sentence.toLowerCase()
  return EXPLANATION_PATTERNS.some(p => lower.includes(p))
}

// ── Rule 6 — Guidance brevity ─────────────────────────────────────

const PRESCRIPTIVE_PATTERNS = [
  /\d+\s*(minute|hour|min|block|rep|set)/i,
  /exactly/i,
  /avoid all/i,
]

export function isPrescriptiveGuidance(sentence: string): boolean {
  return PRESCRIPTIVE_PATTERNS.some(p => p.test(sentence))
}

// ── Rule 3 — Conflict detection ───────────────────────────────────
// Observation signals readiness → context signals strain → guidance activates
// This triplet is incoherent. Suppress context.

export function isConflictingContext(
  observation: string,
  context: string | null,
  guidance: string
): boolean {
  if (!context) return false

  const obsStable   = /stable|building|momentum/i.test(observation)
  const ctxStrain   = /strain|reduced|limited/i.test(context)
  const guidanceAct = /actively|use the day/i.test(guidance)

  return obsStable && ctxStrain && guidanceAct
}

// ── Rule 2 — Weak/empty context ───────────────────────────────────

export function isWeakContext(context: string | null): boolean {
  if (!context) return true
  return context.trim().length < 10
}

// ── Validate context sentence ─────────────────────────────────────

export function validateContext(
  observation: string,
  context: string | null,
  guidance: string
): { suppressed: boolean; flags: GovernanceFlag[] } {
  const flags: GovernanceFlag[] = []

  if (isWeakContext(context)) {
    flags.push('CONTEXT_SUPPRESSED_EMPTY')
    return { suppressed: true, flags }
  }
  if (context && containsExplanationLanguage(context)) {
    flags.push('CONTEXT_SUPPRESSED_EXPLANATION')
    return { suppressed: true, flags }
  }
  if (isConflictingContext(observation, context, guidance)) {
    flags.push('CONTEXT_SUPPRESSED_CONFLICT')
    return { suppressed: true, flags }
  }

  return { suppressed: false, flags }
}

// ── Validate guidance sentence ────────────────────────────────────

export function validateGuidance(guidance: string): GovernanceFlag[] {
  const flags: GovernanceFlag[] = []
  if (isPrescriptiveGuidance(guidance)) {
    flags.push('GUIDANCE_FLAGGED_PRESCRIPTIVE')
  }
  return flags
}
