// packages/core/domain/reflection/validators.ts
// v1.0.0

import type { ReflectionAccuracy } from './types'

const VALID_ACCURACY: ReflectionAccuracy[] = [
  'ACCURATE',
  'SOMEWHAT_ACCURATE',
  'NOT_ACCURATE',
]

export function isValidAccuracy(value: unknown): value is ReflectionAccuracy {
  return typeof value === 'string' && VALID_ACCURACY.includes(value as ReflectionAccuracy)
}

export function isValidDayKey(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}
