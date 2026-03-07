// packages/core/domain/dailyBrief/mappers.ts
// Deterministic mapping: engine outputs → DailyBrief fields
// No variability. No LLM. No raw metrics in output text.
// v1.0.0

import type { ObservationCode, ConfidenceLevel } from './types'

type MunkState = 'GREEN' | 'YELLOW' | 'RED'

// ── Observation code ────────────────────────────────────────────
export function mapObservationCode(state: MunkState): ObservationCode {
  const map: Record<MunkState, ObservationCode> = {
    GREEN:  'system_steady',
    YELLOW: 'mild_strain',
    RED:    'recovery_needed',
  }
  return map[state]
}

// ── Static text blocks ───────────────────────────────────────────
interface StateText {
  observation_text: string
  context_text: string
  guidance_items: [string, string, string]
  priority_items: [string, string, string]
}

const STATE_TEXT: Record<MunkState, StateText> = {
  GREEN: {
    observation_text: 'Your system looks steady today.',
    context_text:     'Recovery signals are supportive and current strain appears manageable.',
    guidance_items:   [
      'Use the day actively',
      'Prioritize focused work',
      'A moderate training session fits well',
    ],
    priority_items: ['Focus', 'Movement', 'Consistent wind-down'],
  },
  YELLOW: {
    observation_text: 'Your system shows mild strain today.',
    context_text:     'Recovery appears somewhat reduced compared with your recent baseline.',
    guidance_items:   [
      'Keep the first half of the day lighter',
      'Take a short walk',
      'Avoid intense training',
    ],
    priority_items: ['Light load', 'Movement', 'Early reset'],
  },
  RED: {
    observation_text: 'Your system needs a calmer day today.',
    context_text:     'Recovery signals suggest elevated strain and reduced readiness.',
    guidance_items:   [
      'Reduce cognitive and physical load',
      'Prioritize recovery',
      'Keep the day simple',
    ],
    priority_items: ['Recovery', 'Low stimulation', 'Early sleep'],
  },
}

export function mapStateText(state: MunkState): StateText {
  return STATE_TEXT[state]
}

// ── Trajectory text ──────────────────────────────────────────────
type TrajectoryStatus =
  | 'stable'
  | 'improving_recovery'
  | 'accumulating_strain'
  | 'volatile'
  | 'insufficient_data'

const TRAJECTORY_TEXT: Partial<Record<TrajectoryStatus, string>> = {
  stable:               'Your recent pattern looks stable.',
  improving_recovery:   'Your recent pattern looks stable.',
  accumulating_strain:  'Your system has been under mild strain for several days.',
  volatile:             'Your recent pattern suggests increased strain.',
}

export function mapTrajectoryText(
  window7dStatus: TrajectoryStatus | null | undefined
): string | undefined {
  if (!window7dStatus || window7dStatus === 'insufficient_data') return undefined
  return TRAJECTORY_TEXT[window7dStatus]
}

// ── Confidence passthrough ───────────────────────────────────────
export function mapConfidence(
  raw: string | null | undefined
): ConfidenceLevel {
  if (raw === 'HIGH' || raw === 'MEDIUM' || raw === 'LOW') return raw
  return null
}
