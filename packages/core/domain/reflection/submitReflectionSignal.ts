// packages/core/domain/reflection/submitReflectionSignal.ts
// Assembler: builds a validated ReflectionSignalV1 record
// No side effects. No AI logic. No state mutation.
// v1.0.0

import type { ReflectionSignalV1, ReflectionAccuracy } from './types'

export interface ReflectionSignalInput {
  day_key: string
  accuracy: ReflectionAccuracy
}

export function buildReflectionSignal(input: ReflectionSignalInput): ReflectionSignalV1 {
  return {
    version:    'reflection_v1',
    day_key:    input.day_key,
    accuracy:   input.accuracy,
    created_at: new Date().toISOString(),
  }
}

export function getRecentReflections(
  rows: ReflectionSignalV1[],
  window_days: number
): ReflectionSignalV1[] {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - window_days)
  const cutoffKey = cutoff.toISOString().slice(0, 10)
  return rows.filter(r => r.day_key >= cutoffKey)
}
