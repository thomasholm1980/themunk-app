// packages/core/protocol/protocol-engine.ts
// Layer 8 — Protocol Engine: deterministic protocol generation from MunkState
// v1.0.0

import type { MunkState, DailyProtocol } from './protocol-types'
import { PROTOCOL_RULES, PROTOCOL_VERSION } from './protocol-rules'

export function computeProtocol(
  state: MunkState,
  dayKey: string
): DailyProtocol {
  const rule = PROTOCOL_RULES[state]

  return {
    day_key: dayKey,
    state,
    cognitive_load: rule.cognitive_load,
    training_recommendation: rule.training_recommendation,
    nervous_system_mode: rule.nervous_system_mode,
    deep_work_minutes: rule.deep_work_minutes,
    recovery_minutes: rule.recovery_minutes,
    protocol_version: PROTOCOL_VERSION,
    generated_at: new Date().toISOString(),
  }
}
