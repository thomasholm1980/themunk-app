// packages/core/domain/language/v1/sentenceMap.ts
// Language Layer v1 — deterministic sentence mappings
// v1.0.0

import type { PrimaryFrame, ContextMode } from '../../interpretation/types'
import type { GuidanceMode } from './types'

export const OBSERVATION_MAP: Record<PrimaryFrame, string> = {
  READINESS:         'Recovery base appears stable today.',
  CAUTION:           'Recovery capacity appears somewhat reduced today.',
  PROTECTION:        'Recovery capacity appears limited today.',
  STABILIZATION:     'Recovery appears to be stabilizing.',
  RECOVERY_MOMENTUM: 'Recovery momentum appears to be building.',
}

export const CONTEXT_MAP: Record<ContextMode, string | null> = {
  NONE:                     null,
  RECENT_STRAIN:            'Recent days may suggest accumulating strain.',
  RECENT_STABILIZING:       'Recent days suggest recovery may be stabilizing.',
  INTERPRETATION_UNCERTAIN: 'Recent signals appear less consistent.',
}

export const GUIDANCE_MODE_MAP: Record<PrimaryFrame, GuidanceMode> = {
  READINESS:         'ACTIVATE',
  CAUTION:           'ACTIVATE_WITH_RESTRAINT',
  PROTECTION:        'PROTECT_BASE',
  STABILIZATION:     'HOLD_STEADY',
  RECOVERY_MOMENTUM: 'ACTIVATE',
}

export const GUIDANCE_SENTENCE_MAP: Record<GuidanceMode, string> = {
  ACTIVATE:                'Use the day actively.',
  ACTIVATE_WITH_RESTRAINT: 'Use the day actively, but keep the rhythm steady.',
  HOLD_STEADY:             'Keep the day steady.',
  REDUCE_LOAD:             'Reduce load and protect recovery.',
  PROTECT_BASE:            'Focus on protecting recovery today.',
}
