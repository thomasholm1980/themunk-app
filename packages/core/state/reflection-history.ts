// reflection-history.ts — Phase 18
// Reflection history type for Pattern Engine input.
// Data layer only — no interpretation, no UI messaging.

export interface ReflectionHistoryEntry {
  day_key:   string
  energy:    1 | 2 | 3   // Low=1, Mid=2, High=3
  stress:    1 | 2 | 3
  focus:     1 | 2 | 3
  created_at?: string
}

export interface ReflectionHistoryWindow {
  entries:       ReflectionHistoryEntry[]
  days_observed: number
  sufficient_data: boolean  // true if >= 3 entries
}

export function buildReflectionWindow(
  rows: ReflectionHistoryEntry[]
): ReflectionHistoryWindow {
  const sorted = [...rows].sort((a, b) => a.day_key.localeCompare(b.day_key))
  return {
    entries:         sorted,
    days_observed:   sorted.length,
    sufficient_data: sorted.length >= 3,
  }
}
