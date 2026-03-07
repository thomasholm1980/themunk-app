// packages/core/protocol/protocol-rules.ts
// Layer 8 — Protocol rules: deterministic mapping from state to protocol fields
// v1.0.0

import type {
  MunkState,
  CognitiveLoad,
  TrainingRecommendation,
  NervousSystemMode,
} from './protocol-types'

export type ProtocolRule = {
  cognitive_load: CognitiveLoad
  training_recommendation: TrainingRecommendation
  nervous_system_mode: NervousSystemMode
  deep_work_minutes: number
  recovery_minutes: number
}

export const PROTOCOL_RULES: Record<MunkState, ProtocolRule> = {
  GREEN: {
    cognitive_load: 'high',
    training_recommendation: 'strength',
    nervous_system_mode: 'activate',
    deep_work_minutes: 90,
    recovery_minutes: 10,
  },
  YELLOW: {
    cognitive_load: 'moderate',
    training_recommendation: 'cardio',
    nervous_system_mode: 'balance',
    deep_work_minutes: 45,
    recovery_minutes: 20,
  },
  RED: {
    cognitive_load: 'low',
    training_recommendation: 'recovery',
    nervous_system_mode: 'downregulate',
    deep_work_minutes: 0,
    recovery_minutes: 60,
  },
}

export const PROTOCOL_VERSION = '1.0.0'
