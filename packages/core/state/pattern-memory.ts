// packages/core/state/pattern-memory.ts
// Personal Pattern Memory Layer v1 — deterministic only
// No AI. No UI. No DecisionContract changes.
// Evidence storage only.

export type ReflectionKey = 'high_stress' | 'low_energy' | 'low_focus' | 'high_energy'
export type StabilityLevel = 'emerging' | 'repeating' | 'stable'
export type PatternMemoryConfidence = 'low' | 'medium' | 'high'

export type PatternMemoryRecord = {
  user_id:          string
  pattern_key:      string
  reflection_key:   ReflectionKey
  occurrence_count: number
  first_seen_at:    string
  last_seen_at:     string
  stability_level:  StabilityLevel
  confidence:       PatternMemoryConfidence
}

// Deterministic reflection bucket resolver
// Returns null if no salient signal — balanced is never stored in v1
export function resolveReflectionKey(
  energy: number,
  stress: number,
  focus: number
): ReflectionKey | null {
  if (stress === 3) return 'high_stress'
  if (energy === 1) return 'low_energy'
  if (focus === 1) return 'low_focus'
  if (energy === 3 && stress <= 2) return 'high_energy'
  return null
}

// Deterministic stability resolver using rolling window counts
export function resolveStability(
  recentCounts: { last21: number; last30: number; last60: number }
): { stability_level: StabilityLevel; confidence: PatternMemoryConfidence } | null {
  if (recentCounts.last60 >= 5) return { stability_level: 'stable',    confidence: 'high'   }
  if (recentCounts.last30 >= 3) return { stability_level: 'repeating', confidence: 'medium' }
  if (recentCounts.last21 >= 2) return { stability_level: 'emerging',  confidence: 'low'    }
  return null
}
