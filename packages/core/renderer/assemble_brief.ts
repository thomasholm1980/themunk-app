// packages/core/renderer/assemble_brief.ts
// Deterministic brief assembler v1. No LLM. No slot filling.

import type { ReadinessBand, PolicyDecisions } from '../policy/compute_policy';
import { selectTemplate } from './select_template';
import { buildDisclaimer } from './build_disclaimer';
import templates from './templates.v1.json';

export interface DailyBrief {
  version: '1';
  user_id: string;
  day_key: string;
  template_id: string;
  readiness_band: ReadinessBand | null;
  headline: string;
  what_we_see: string[];
  what_it_might_mean: string;
  today_plan: string[];
  disclaimer: string;
  fallback_used: boolean;
  blocked_reasons: string[];
}

export function assembleBrief(
  readiness_band: ReadinessBand,
  policy: PolicyDecisions,
  user_id: string,
  day_key: string,
  flags: string[] = [],
): DailyBrief {
  const template_id = selectTemplate(readiness_band, flags);
  const template = (templates.templates as Record<string, typeof templates.templates['T-GREEN-BASE']>)[template_id];
  const disclaimer = buildDisclaimer(
    policy.must_include.disclaimer_level,
    policy.escalation.recommendation,
  );

  return {
    version: '1',
    user_id,
    day_key,
    template_id,
    readiness_band: template.readiness_band as ReadinessBand | null,
    headline: template.headline,
    what_we_see: template.what_we_see,
    what_it_might_mean: template.what_it_might_mean,
    today_plan: template.today_plan,
    disclaimer,
    fallback_used: false,
    blocked_reasons: [],
  };
}
