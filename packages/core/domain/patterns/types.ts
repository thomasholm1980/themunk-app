// packages/core/domain/patterns/types.ts
// Pattern Engine Light v1 — domain contracts
// Deterministic, read-only, code-only output.
// v1.0.0

export type PatternCode =
  | "PATTERN_ACCUMULATING_STRAIN"
  | "PATTERN_INTERPRETATION_DRIFT"
  | "PATTERN_RECOVERY_STABILIZING"

export type PatternEngineOutput = {
  version: "pattern_v1"
  day_key: string
  pattern_codes: PatternCode[]
}

export type PatternEngineInput = {
  day_key: string
  recentStates: Array<{ day_key: string; state: "GREEN" | "YELLOW" | "RED" }>
  recentReflections: Array<{ day_key: string; accuracy: "ACCURATE" | "SOMEWHAT_ACCURATE" | "NOT_ACCURATE" }>
}
