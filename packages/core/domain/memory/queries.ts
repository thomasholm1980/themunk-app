// packages/core/domain/memory/queries.ts
// Memory Engine v1 — retrieval helpers
// Pure filter functions. No Supabase dependency.
// v1.0.0

import type { DayStateMemory, ReflectionMemory } from './types'

function getCutoffKey(window_days: number): string {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - window_days)
  return cutoff.toISOString().slice(0, 10)
}

export function getRecentStates(
  rows: DayStateMemory[],
  window_days: number
): DayStateMemory[] {
  const cutoff = getCutoffKey(window_days)
  return rows.filter(r => r.day_key >= cutoff)
}

export function getRecentReflections(
  rows: ReflectionMemory[],
  window_days: number
): ReflectionMemory[] {
  const cutoff = getCutoffKey(window_days)
  return rows.filter(r => r.day_key >= cutoff)
}
