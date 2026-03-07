// packages/core/domain/memory/types.ts
// Memory Engine v1 — domain contracts
// Passive storage only. No analysis, scoring, or interpretation.
// v1.0.0

export type DayStateMemory = {
  day_key: string
  state: "GREEN" | "YELLOW" | "RED"
  trajectory?: string
  created_at: string
}

export type ReflectionMemory = {
  day_key: string
  accuracy: "ACCURATE" | "SOMEWHAT_ACCURATE" | "NOT_ACCURATE"
  created_at: string
}

export type MemorySnapshot = {
  day_state?: DayStateMemory
  reflection?: ReflectionMemory
}
