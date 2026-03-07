// packages/core/domain/screen/v1/buildCoreScreen.ts
// Core Screen Contract v1 — assembly
// Consumes governed brief + state. Produces frozen screen model.
// v1.0.0

import type { CoreScreenModel, StateValue } from './types'

const REFLECTION_OPTIONS = ['ACCURATE', 'SOMEWHAT_ACCURATE', 'NOT_ACCURATE'] as const

const HEADLINE_MAP: Record<StateValue, string> = {
  GREEN:  'Today looks good.',
  YELLOW: 'Today requires some care.',
  RED:    'Today calls for rest.',
}

export type BuildCoreScreenInput = {
  state:            StateValue
  observation_text: string
  context_text:     string | null
  guidance_text:    string
}

export function buildCoreScreen(input: BuildCoreScreenInput): CoreScreenModel {
  return {
    version:            'screen_v1',
    state:              input.state,
    headline:           HEADLINE_MAP[input.state],
    observation_text:   input.observation_text,
    context_text:       input.context_text ?? null,
    guidance_text:      input.guidance_text,
    reflection_options: [...REFLECTION_OPTIONS],
  }
}
