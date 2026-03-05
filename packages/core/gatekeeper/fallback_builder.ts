// packages/core/gatekeeper/fallback_builder.ts
// Deterministic fallback brief builder. No LLM. Always safe.

import type { DailyBrief } from '../renderer/assemble_brief';
import type { PolicyDecisions } from '../policy/compute_policy';
import { buildDisclaimer } from '../renderer/build_disclaimer';

export function buildFallbackBrief(
  policy: PolicyDecisions,
  user_id: string,
  day_key: string,
  blocked_reasons: string[],
): DailyBrief {
  const disclaimer = buildDisclaimer(
    policy.must_include.disclaimer_level,
    policy.escalation.recommendation,
  );

  return {
    version: '1',
    user_id,
    day_key,
    template_id: 'T-SAFE-FALLBACK',
    readiness_band: null,
    headline: "We'll keep this simple today.",
    what_we_see: [
      'We have limited guidance to offer right now.',
      blocked_reasons.includes('data_missing')
        ? 'Some data appears to be missing.'
        : 'Our system is taking a cautious approach today.',
    ],
    what_it_might_mean:
      'This may be a good moment to rest, reflect, and check in with how you feel.',
    today_plan: [
      'Take things at your own pace.',
      'Rest if you need to.',
      'Check in again tomorrow.',
    ],
    disclaimer,
    fallback_used: true,
    blocked_reasons,
  };
}
