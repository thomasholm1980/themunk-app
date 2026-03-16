// packages/core/state/personal-insight.ts
// Personal Insight Layer v1 — deterministic only
// No AI. No speculation. No life interpretation.
// Only surfaces when stable personal memory matches today's pattern.

export type PersonalInsightResult = {
  title: string
  message: string
} | null

export const PERSONAL_INSIGHT_SUPPRESS_DAYS = 7

// V1: same calm message for all patterns
// Differentiation deferred to v2
const PERSONAL_INSIGHT_MESSAGE = "We've seen this pattern several times in your data."

export function buildPersonalInsightMessage(pattern_key: string): PersonalInsightResult {
  return {
    title: "Personal Insight",
    message: PERSONAL_INSIGHT_MESSAGE,
  }
}
