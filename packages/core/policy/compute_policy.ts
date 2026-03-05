// packages/core/policy/compute_policy.ts
// Deterministic policy engine v1. No LLM. No medical logic.

export type GuidanceIntensity = 'low' | 'medium' | 'high';
export type DisclaimerLevel = 'none' | 'general' | 'support_suggestion';
export type EscalationRecommendation = 'none' | 'suggest_professional_support' | 'urgent_local_help';

export interface PolicyDecisions {
  guidance_intensity: GuidanceIntensity;
  allowed_intents: string[];
  must_include: {
    disclaimer_level: DisclaimerLevel;
    uncertainty_language: boolean;
  };
  escalation: {
    recommendation: EscalationRecommendation;
    reason_codes: string[];
  };
  content_blocks: {
    medical_advice: true;
    diagnosis: true;
    medication: true;
  };
}

export type ReadinessBand = 'GREEN' | 'YELLOW' | 'RED';

export interface DailyStateInput {
  readiness_band: ReadinessBand;
  flags?: string[];
}

export function computePolicy(
  dailyState: DailyStateInput,
): PolicyDecisions {
  const { readiness_band, flags = [] } = dailyState;

  const content_blocks = {
    medical_advice: true as const,
    diagnosis: true as const,
    medication: true as const,
  };

  switch (readiness_band) {
    case 'GREEN':
      return {
        guidance_intensity: 'high',
        allowed_intents: ['plan_deep', 'plan_light', 'reflect', 'downshift'],
        must_include: {
          disclaimer_level: 'none',
          uncertainty_language: false,
        },
        escalation: {
          recommendation: 'none',
          reason_codes: [],
        },
        content_blocks,
      };

    case 'YELLOW':
      return {
        guidance_intensity: 'medium',
        allowed_intents: ['plan_light', 'reflect', 'downshift'],
        must_include: {
          disclaimer_level: 'general',
          uncertainty_language: true,
        },
        escalation: {
          recommendation: 'none',
          reason_codes: [],
        },
        content_blocks,
      };

    case 'RED': {
      const reason_codes: string[] = ['readiness_red'];
      if (flags.includes('data_missing')) reason_codes.push('data_missing');

      return {
        guidance_intensity: 'low',
        allowed_intents: ['downshift', 'reflect'],
        must_include: {
          disclaimer_level: 'support_suggestion',
          uncertainty_language: true,
        },
        escalation: {
          recommendation: 'suggest_professional_support',
          reason_codes,
        },
        content_blocks,
      };
    }
  }
}
