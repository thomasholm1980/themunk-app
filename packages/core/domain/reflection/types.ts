// packages/core/domain/reflection/types.ts
// ReflectionSignal v1 — structured feedback contract
// Read-only signal. No influence on state, protocol, or DailyBrief.
// v1.0.0

export type ReflectionAccuracy =
  | "ACCURATE"
  | "SOMEWHAT_ACCURATE"
  | "NOT_ACCURATE"

export type ReflectionSignalV1 = {
  version: "reflection_v1"
  day_key: string
  accuracy: ReflectionAccuracy
  created_at: string
}
