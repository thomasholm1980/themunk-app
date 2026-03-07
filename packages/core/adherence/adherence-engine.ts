// packages/core/adherence/adherence-engine.ts
// AdherenceTracker v1
// Calculates adherence score from manual entry vs protocol targets

export type AdherenceInput = {
  deep_work_completed_minutes: number
  training_completed: boolean
  recovery_completed: boolean
  protocol_deep_work_minutes: number
}

export type AdherenceResult = {
  adherence_score: number
  deep_work_ratio: number
  training_completed: boolean
  recovery_completed: boolean
  protocol_deep_work_minutes: number
}

export function computeAdherence(input: AdherenceInput): AdherenceResult {
  const deep_work_ratio = input.protocol_deep_work_minutes > 0
    ? Math.min(input.deep_work_completed_minutes / input.protocol_deep_work_minutes, 1.0)
    : 0

  const training_score = input.training_completed ? 1 : 0
  const recovery_score = input.recovery_completed ? 1 : 0

  const adherence_score = Math.round(
    (0.5 * deep_work_ratio + 0.3 * training_score + 0.2 * recovery_score) * 1000
  ) / 1000

  return {
    adherence_score,
    deep_work_ratio: Math.round(deep_work_ratio * 1000) / 1000,
    training_completed: input.training_completed,
    recovery_completed: input.recovery_completed,
    protocol_deep_work_minutes: input.protocol_deep_work_minutes,
  }
}
