// packages/core/index.ts
export * from "./types";
export { computeTrendReport } from "./trend/extractor";
export { classifyState, classifySignal } from "./state/classifier";
export { computeState } from "./state/pipeline";
export { computeIntervention } from "./state/intervention";
export { computePolicy } from "./policy/compute_policy";
export type { PolicyDecisions, DailyStateInput, ReadinessBand, GuidanceIntensity } from "./policy/compute_policy";
export { assembleBrief } from "./renderer/assemble_brief";
export type { DailyBrief } from "./renderer/assemble_brief";
export { selectTemplate } from "./renderer/select_template";
export { buildDisclaimer } from "./renderer/build_disclaimer";
export { gatekeep } from "./gatekeeper/decision";
export type { GatekeeperDecision } from "./gatekeeper/decision";
export { buildFallbackBrief } from "./gatekeeper/fallback_builder";
export { scanText } from "./gatekeeper/scan";
export { FallbackAdapter } from "./llm/llm_adapter";
export type { LLMAdapter } from "./llm/llm_adapter";
export type { SlotFillerInput, SlotFillerOutput } from "./llm/types";
export { fillWhatItMightMean } from "./renderer/slot_filler/fill_what_it_might_mean";
export type { LLMRequest, LLMResponse } from "./llm/types";
export * from './wearables';
export { computeStateV2 } from './state/compute-state-v2'
export type { ManualInput, WearableInput, ComputeStateV2Result } from './state/types'
export { computeProtocol } from './protocol/protocol-engine'
export type { DailyProtocol } from './protocol/protocol-types'
export { computeAdherence } from './adherence/adherence-engine'
export type { AdherenceInput, AdherenceResult } from './adherence/adherence-engine'
export { computeDrift } from './drift/drift-engine'
export type { DriftResult, DriftStatus, WearableRow } from './drift/drift-engine'
export { composeBriefV2 } from './brief/brief-v2-composer'
export type { DailyBriefV2, DailyBriefV2Input } from './brief/brief-v2-types'
export { computeProtocolSchedule } from './protocol/timing-engine'
export type { ProtocolSchedule, TimingInput } from './protocol/timing-engine'
export { buildLongitudinalSummary, computeStateDistribution, computeWindowAverages, classifyTrajectory } from './longitudinal/DriftSummaryEngine'
export type { LongitudinalStatus, TrajectoryDirection, ConfidenceLevel, DriverCode, DriftSummaryInput, DriftSummaryResult, WindowResult, WindowMetrics, StateDistribution, LongitudinalSummaryRecord, DailyStateRow, WearableLogRow, NervousSystemDriftRow, ProtocolAdherenceRow } from './longitudinal/types'
export { DRIFT_ENGINE_VERSION, MIN_DAYS_7D, MIN_DAYS_14D } from './longitudinal/constants'
export type { DailyBriefV1, DailyBriefConfidence, ObservationCode } from './domain/dailyBrief/types'
export { buildDailyBrief } from './domain/dailyBrief/buildDailyBrief'
export type { BuildDailyBriefV1Input } from './domain/dailyBrief/buildDailyBrief'
export { buildReflectionSignal, getRecentReflections } from './domain/reflection/submitReflectionSignal'
export { isValidAccuracy, isValidDayKey } from './domain/reflection/validators'
export type { ReflectionSignalV1, ReflectionAccuracy } from './domain/reflection/types'
export type { ReflectionSignalInput } from './domain/reflection/submitReflectionSignal'
