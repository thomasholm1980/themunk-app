// packages/core/domain/memory/storeMemorySnapshot.ts
// Memory Engine v1 — persistence logic
// No analysis. No scoring. Storage only.
// v1.0.0

export interface StateSnapshotInput {
  user_id: string
  day_key: string
  state: "GREEN" | "YELLOW" | "RED"
  trajectory?: string | null
}

export interface ReflectionSnapshotInput {
  user_id: string
  day_key: string
  reflection_accuracy: "ACCURATE" | "SOMEWHAT_ACCURATE" | "NOT_ACCURATE"
}

export function buildStateSnapshotRecord(input: StateSnapshotInput) {
  return {
    user_id:    input.user_id,
    day_key:    input.day_key,
    state:      input.state,
    trajectory: input.trajectory ?? null,
    updated_at: new Date().toISOString(),
  }
}

export function buildReflectionSnapshotRecord(input: ReflectionSnapshotInput) {
  return {
    user_id:              input.user_id,
    day_key:              input.day_key,
    reflection_accuracy:  input.reflection_accuracy,
    updated_at:           new Date().toISOString(),
  }
}
