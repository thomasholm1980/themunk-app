// packages/core/renderer/select_template.ts
// Deterministic template selection. No LLM.

import type { ReadinessBand } from '../policy/compute_policy';

export type TemplateId =
  | 'T-GREEN-BASE'
  | 'T-AMBER-BASE'
  | 'T-RED-BASE'
  | 'T-DATA-MISSING';

export function selectTemplate(
  readiness_band: ReadinessBand,
  flags: string[] = [],
): TemplateId {
  if (flags.includes('data_missing')) return 'T-DATA-MISSING';

  switch (readiness_band) {
    case 'GREEN':  return 'T-GREEN-BASE';
    case 'YELLOW': return 'T-AMBER-BASE';
    case 'RED':    return 'T-RED-BASE';
  }
}
