// packages/core/state/pipeline_v2.ts
// Layer 7 — computeStateV2 stub
// NOT active in production. Activated when WEARABLES_ENABLED=true + real Oura data available.
// v1.0.0

import type { DailyWearableData } from '../wearables/WearableAdapter';

export interface ManualInputV2 {
  energy: number;   // 1-5
  mood: number;     // 1-5
  stress: number;   // 1-5
}

export interface StateV2Result {
  state: 'GREEN' | 'YELLOW' | 'RED';
  confidence: number;
  sources: {
    manual: boolean;
    wearable: boolean;
  };
  reasons: string[];
}

/**
 * Stub — not active in production.
 * Will combine manual inputs + wearable data into unified state signal.
 * Algorithm spec to be defined by Manju before activation.
 */
export function computeStateV2(
  manual: ManualInputV2,
  wearable: DailyWearableData | null
): StateV2Result {
  // Stub: fall back to manual-only logic until wearable algorithm is approved
  const avg = (manual.energy + manual.mood + (6 - manual.stress)) / 3;

  const state: 'GREEN' | 'YELLOW' | 'RED' =
    avg >= 3.5 ? 'GREEN' : avg >= 2.5 ? 'YELLOW' : 'RED';

  return {
    state,
    confidence: 0,
    sources: {
      manual: true,
      wearable: wearable !== null,
    },
    reasons: ['stub: wearable algorithm not yet activated'],
  };
}
