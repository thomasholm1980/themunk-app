// packages/core/domain/screen/v1/types.ts
// Core Screen Contract v1 — frozen render model
// Defines exactly what the primary screen is allowed to display.
// v1.0.0

export type StateValue = 'GREEN' | 'YELLOW' | 'RED'

export type ReflectionOption = 'ACCURATE' | 'SOMEWHAT_ACCURATE' | 'NOT_ACCURATE'

export type CoreScreenModel = {
  version:          'screen_v1'
  state:            StateValue
  headline:         string
  observation_text: string
  context_text:     string | null   // render only if not null
  guidance_text:    string
  reflection_options: ReflectionOption[]
}

// Render contract — enforced by UI layer
// Always render:   headline, observation_text, guidance_text, reflection_options
// Conditional:     context_text (only if not null)
// Never render:    raw metrics, pattern codes, telemetry, debug values,
//                  multiple context blocks, multiple guidance blocks
