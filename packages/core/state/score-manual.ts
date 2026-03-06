import type { ManualInput } from './types'

export function scoreManual(input: ManualInput): number | null {
  const { energy, mood, stress } = input

  if (energy == null && mood == null && stress == null) {
    return null
  }

  const e = energy ?? 3
  const m = mood ?? 3
  const s = stress ?? 3

  const stress_inverted = 6 - s
  const raw = e + m + stress_inverted
  const normalized = Math.round((raw / 15) * 100)

  return Math.max(0, Math.min(100, normalized))
}
