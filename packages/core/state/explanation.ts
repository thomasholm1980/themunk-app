// packages/core/state/explanation.ts
// Explanation Layer v2 — deterministic input builder
// AI is language renderer only. Confidence is always deterministic.
// Must never affect computeStateV2.

export type ExplanationConfidence = 'low' | 'medium' | 'high'

export type ExplanationInput = {
  state: 'GREEN' | 'YELLOW' | 'RED'
  hrv: number | null
  rhr: number | null
  sleep_score: number | null
  readiness: number | null
  strongest_pattern: string | null
  reflection_context: {
    energy: number
    stress: number
    focus: number
  } | null
  confidence: ExplanationConfidence
}

export type ExplanationContract = {
  summary: string
  driver: string
  context: string | null
  confidence: ExplanationConfidence
}

export function buildExplanationInput(params: {
  state: 'GREEN' | 'YELLOW' | 'RED'
  hrv: number | null
  rhr: number | null
  sleep_score: number | null
  readiness: number | null
  strongest_pattern: string | null
  reflection_context: { energy: number; stress: number; focus: number } | null
}): ExplanationInput {
  const { strongest_pattern, reflection_context } = params

  // Confidence is always deterministic — never delegated to AI
  let confidence: ExplanationConfidence = 'low'
  if (strongest_pattern && reflection_context) {
    confidence = 'high'
  } else if (strongest_pattern || reflection_context) {
    confidence = 'medium'
  }

  return { ...params, confidence }
}
