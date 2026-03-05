// packages/core/gatekeeper/decision.ts
// Deterministic gatekeeper decision. No LLM.

import type { DailyBrief } from '../renderer/assemble_brief';
import type { PolicyDecisions } from '../policy/compute_policy';
import { scanText } from './scan';

export interface GatekeeperDecision {
  allow: boolean;
  blocked_reasons: string[];
  required_edits: string[];
  escalation_override: string | null;
}

export function gatekeep(
  brief: DailyBrief,
  policy: PolicyDecisions,
): GatekeeperDecision {
  // Scan only content fields — exclude disclaimer (it is policy-controlled)
  const allText = [
    brief.headline,
    ...brief.what_we_see,
    brief.what_it_might_mean,
    ...brief.today_plan,
  ].join(' ');

  const scan = scanText(allText);

  const escalation_override =
    policy.escalation.recommendation !== 'none'
      ? policy.escalation.recommendation
      : null;

  return {
    allow: scan.allow,
    blocked_reasons: scan.blocked_reasons,
    required_edits: scan.required_edits,
    escalation_override,
  };
}
