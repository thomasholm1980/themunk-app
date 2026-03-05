// packages/core/index.ts
export * from "./types";
export { computeTrendReport } from "./trend/extractor";
export { classifyState, classifySignal } from "./state/classifier";
export { computeState } from "./state/pipeline";
export { computeIntervention } from "./state/intervention";
export { computePolicy } from "./policy/compute_policy";
export type { PolicyDecisions, DailyStateInput, ReadinessBand, GuidanceIntensity } from "./policy/compute_policy";
