// packages/core/gatekeeper/scan.ts
// Deterministic text scanner against ruleset. No LLM.

import ruleset from './ruleset.v1.json';

export interface ScanResult {
  allow: boolean;
  blocked_reasons: string[];
  missing_uncertainty: boolean;
  required_edits: string[];
}

export function scanText(text: string): ScanResult {
  const blocked_reasons: string[] = [];
  const required_edits: string[] = [];

  // Check block rules
  for (const rule of ruleset.block_rules) {
    const regex = new RegExp(rule.pattern, 'i');
    if (regex.test(text)) {
      blocked_reasons.push(rule.reason);
    }
  }

  // Check required uncertainty language
  const uncertaintyPatterns = ruleset.required_uncertainty.patterns;
  const hasUncertainty = uncertaintyPatterns.some(p =>
    new RegExp(p, 'i').test(text)
  );

  const missing_uncertainty = !hasUncertainty;
  if (missing_uncertainty) {
    required_edits.push('missing_uncertainty_language');
  }

  return {
    allow: blocked_reasons.length === 0,
    blocked_reasons,
    missing_uncertainty,
    required_edits,
  };
}
