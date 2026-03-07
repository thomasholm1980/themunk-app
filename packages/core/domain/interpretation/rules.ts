// packages/core/domain/interpretation/rules.ts
// Interpretation Layer v2 — deterministic mapping rules
// v1.0.0

import type { PrimaryFrame, ContextMode, InterpretationInput } from './types'

// ── Primary Frame ────────────────────────────────────────────────

export function resolvePrimaryFrame(
  state: InterpretationInput['state'],
  pattern_codes: string[]
): PrimaryFrame {
  // Pattern refinement (never overrides state authority)
  if (state === 'GREEN' && pattern_codes.includes('PATTERN_RECOVERY_STABILIZING')) {
    return 'RECOVERY_MOMENTUM'
  }
  if (state === 'YELLOW' && pattern_codes.includes('PATTERN_ACCUMULATING_STRAIN')) {
    return 'STABILIZATION'
  }

  // Base state mapping
  const BASE_FRAME: Record<InterpretationInput['state'], PrimaryFrame> = {
    GREEN:  'READINESS',
    YELLOW: 'CAUTION',
    RED:    'PROTECTION',
  }
  return BASE_FRAME[state]
}

// ── Context Mode ─────────────────────────────────────────────────

export function resolveContextMode(
  pattern_codes: string[],
  window_7d_status?: string | null,
  confidence?: string | null
): ContextMode {
  if (confidence === 'LOW') return 'NONE'

  if (pattern_codes.includes('PATTERN_INTERPRETATION_DRIFT')) {
    return 'INTERPRETATION_UNCERTAIN'
  }
  if (
    pattern_codes.includes('PATTERN_ACCUMULATING_STRAIN') ||
    window_7d_status === 'accumulating_strain' ||
    window_7d_status === 'volatile'
  ) {
    return 'RECENT_STRAIN'
  }
  if (
    pattern_codes.includes('PATTERN_RECOVERY_STABILIZING') ||
    window_7d_status === 'improving_recovery' ||
    window_7d_status === 'stable'
  ) {
    return 'RECENT_STABILIZING'
  }

  return 'NONE'
}

// ── Guidance Selection ───────────────────────────────────────────

const GUIDANCE_BY_FRAME: Record<PrimaryFrame, string[]> = {
  READINESS:          ['Prioritize focused work', 'A moderate training session fits well'],
  CAUTION:            ['Keep the first half of the day lighter', 'Avoid intense training'],
  PROTECTION:         ['Reduce cognitive and physical load', 'Prioritize recovery'],
  STABILIZATION:      ['Maintain consistent rhythm', 'Avoid adding new demands today'],
  RECOVERY_MOMENTUM:  ['Use the day actively', 'Prioritize focused work'],
}

export function resolveGuidance(frame: PrimaryFrame): string[] {
  return GUIDANCE_BY_FRAME[frame].slice(0, 2)
}

// ── Pattern Surfacing ─────────────────────────────────────────────

export function resolveOptionalPattern(
  pattern_codes: string[],
  context_mode: ContextMode
): string | null {
  // Only surface if context mode adds temporal meaning
  if (context_mode === 'NONE') return null

  // Priority order: strain > stabilizing > drift
  if (pattern_codes.includes('PATTERN_ACCUMULATING_STRAIN')) {
    return 'PATTERN_ACCUMULATING_STRAIN'
  }
  if (pattern_codes.includes('PATTERN_RECOVERY_STABILIZING')) {
    return 'PATTERN_RECOVERY_STABILIZING'
  }
  // Drift surfaced separately via context_mode — no pattern sentence needed
  return null
}
