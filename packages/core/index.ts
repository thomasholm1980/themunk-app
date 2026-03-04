// packages/core/index.ts
export * from "./types";
export { computeTrendReport } from "./trend/extractor";
export { classifyState, classifySignal } from "./state/classifier";
export { computeState } from "./state/pipeline";
export { computeIntervention } from "./state/intervention";
