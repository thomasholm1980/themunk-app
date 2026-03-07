// packages/core/domain/dailyBrief/buildDailyBrief.ts
// Assembler: composes DailyBrief v1 from existing engine outputs
// Read-only. Deterministic. No side effects.
// v1.0.0

import type { DailyBriefV1 } from './types'
import {
  mapObservationCode,
  mapStateText,
  mapTrajectoryText,
  mapConfidence,
} from './mappers'

export interface BuildDailyBriefV1Input {
  day_key: string
  state: 'GREEN' | 'YELLOW' | 'RED'
  confidence: string | null | undefined
  protocol_version: string
  window_7d_status?: string | null
}

const REFLECTION_PROMPT = 'How does this feel today?'

export function buildDailyBrief(input: BuildDailyBriefV1Input): DailyBriefV1 {
  const { day_key, state, confidence, protocol_version, window_7d_status } = input

  const text           = mapStateText(state)
  const trajectory_text = mapTrajectoryText(
    window_7d_status as Parameters<typeof mapTrajectoryText>[0]
  )
  const reflection_prompt = REFLECTION_PROMPT

  return {
    version:          'v1',
    day_key,
    state,
    observation_code: mapObservationCode(state),
    observation_text: text.observation_text,
    context_text:     text.context_text,
    guidance_items:   [...text.guidance_items],
    priority_items:   [...text.priority_items],
    trajectory_text,
    reflection_prompt,
    memory_reference: undefined,
    confidence:       mapConfidence(confidence),
    telemetry: {
      protocol_version,
      brief_version:        'v1',
      has_trajectory:       trajectory_text !== undefined,
      has_reflection_prompt: true,
      has_memory_reference: false,
    },
  }
}
