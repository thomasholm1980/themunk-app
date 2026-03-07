// packages/core/domain/dailyBrief/types.ts
// DailyBrief v1 — product contract
// Layer: Interpretation layer (sits after engine pipeline)
// v1.0.0

export type DailyBriefConfidence = "HIGH" | "MEDIUM" | "LOW" | null

export type ObservationCode =
  | "system_steady"
  | "mild_strain"
  | "recovery_needed"

export type DailyBriefV1 = {
  version: "v1"
  day_key: string

  state: "GREEN" | "YELLOW" | "RED"

  observation_code: ObservationCode

  observation_text: string
  context_text: string

  guidance_items: string[]
  guidance_text:  string
  priority_items: string[]

  trajectory_text?: string
  reflection_prompt?: string
  memory_reference?: string

  confidence: DailyBriefConfidence

  telemetry: {
    protocol_version: string
    brief_version: "v1"
    has_trajectory: boolean
    has_reflection_prompt: boolean
    has_memory_reference: boolean
  }
}
