// packages/core/renderer/build_disclaimer.ts
// Deterministic disclaimer builder. No LLM.

import type { DisclaimerLevel, EscalationRecommendation } from '../policy/compute_policy';

export function buildDisclaimer(
  level: DisclaimerLevel,
  escalation: EscalationRecommendation,
): string {
  if (escalation === 'urgent_local_help') {
    return 'If you are in crisis or need immediate support, please contact a local emergency service or crisis line now.';
  }

  switch (level) {
    case 'support_suggestion':
      return 'This is not medical advice. If you are struggling, consider reaching out to a healthcare professional or someone you trust.';
    case 'general':
      return 'This is not medical advice. These suggestions are for general wellness only.';
    case 'none':
      return '';
  }
}
