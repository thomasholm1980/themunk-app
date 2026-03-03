// packages/core/state/classifier.ts
// GYR State Classifier v1.0. Deterministic. No LLM.

import { GYRState, TrendReport, StateResult } from "../types";
import {
  SIGNAL_WEIGHTS, SIGNAL_THRESHOLDS,
  COMPOSITE_GREEN, COMPOSITE_YELLOW,
  PENALTY_MISSING_SIGNAL, PENALTY_LOW_COVERAGE, PENALTY_HIGH_VOLATILITY,
  VOLATILITY_STD_THRESHOLD, MAX_MISSING_BEFORE_YELLOW, MIN_COVERAGE_DAYS,
} from "./config";

const STATE_SCORE: Record<GYRState, number> = { GREEN: 1.0, YELLOW: 0.5, RED: 0.0 };
const STATE_ORDER: GYRState[] = ["RED", "YELLOW", "GREEN"];

export function classifyState(
  trendReport: TrendReport,
  latestDayRecord?: Record<string, number | null>,
): StateResult {
  const signals    = trendReport.signals;
  const anchorDate = trendReport.anchor_date;

  const averages   = extract7dAverages(signals);
  const sigStates  = classifySignals(averages);
  const missing    = Object.keys(SIGNAL_WEIGHTS).filter(s => averages[s] === null);

  if (missing.length > MAX_MISSING_BEFORE_YELLOW) {
    return forceInsufficientState(anchorDate, missing, signals);
  }

  const gateTriggered = sigStates["sleep_score"] === "RED"
                     && sigStates["readiness_score"] === "RED";

  const { composite, effectiveWeights } = weightedComposite(sigStates, missing);
  let finalState = compositeToState(composite);
  if (gateTriggered) finalState = "RED";

  let latestModifierApplied = false;
  if (latestDayRecord && finalState !== "RED") {
    const [degraded, applied] = applyLatestModifier(finalState, latestDayRecord);
    finalState = degraded;
    latestModifierApplied = applied;
  }

  const coverageDays   = getCoverageDays(signals);
  const volatilityFlags = checkVolatility(signals);
  const confidence     = computeConfidence(missing, coverageDays, volatilityFlags);

  return {
    classifier_version: "1.0",
    anchor_date: anchorDate,
    state: finalState,
    confidence: Math.round(confidence * 100) / 100,
    composite_score: Math.round(composite * 10000) / 10000,
    gate_triggered: gateTriggered,
    gate_reason: gateTriggered ? "Both sleep and readiness are RED — gate triggered" : null,
    latest_modifier_applied: latestModifierApplied,
    signal_states: sigStates,
    signal_averages_7d: Object.fromEntries(
      Object.entries(averages).map(([k, v]) => [k, v !== null ? Math.round(v * 100) / 100 : null])
    ),
    effective_weights: effectiveWeights,
    missing_signals: missing,
    coverage_days_7d: coverageDays,
    volatility_flags: volatilityFlags,
  };
}

export function classifySignal(signal: string, value: number | null): GYRState | null {
  if (value === null) return null;
  const t = SIGNAL_THRESHOLDS[signal];
  if (value >= t.green)  return "GREEN";
  if (value >= t.yellow) return "YELLOW";
  return "RED";
}

// ---------- internals ----------

function extract7dAverages(signals: TrendReport["signals"]): Record<string, number | null> {
  const out: Record<string, number | null> = {};
  for (const signal of Object.keys(SIGNAL_WEIGHTS)) {
    const w = signals[signal]?.["7d"];
    out[signal] = w?.sufficient ? (w.mean ?? null) : null;
  }
  return out;
}

function classifySignals(averages: Record<string, number | null>): Record<string, GYRState | null> {
  return Object.fromEntries(
    Object.keys(SIGNAL_WEIGHTS).map(s => [s, classifySignal(s, averages[s])])
  );
}

function weightedComposite(
  sigStates: Record<string, GYRState | null>,
  missing: string[],
): { composite: number; effectiveWeights: Record<string, number> } {
  const available = Object.fromEntries(
    Object.entries(SIGNAL_WEIGHTS).filter(([s]) => !missing.includes(s))
  );
  const totalWeight = Object.values(available).reduce((a, b) => a + b, 0);
  if (totalWeight === 0) return { composite: 0.5, effectiveWeights: {} };

  const effectiveWeights = Object.fromEntries(
    Object.entries(available).map(([s, w]) => [s, Math.round((w / totalWeight) * 10000) / 10000])
  );
  const composite = Object.entries(effectiveWeights).reduce((sum, [s, w]) => {
    const st = sigStates[s];
    return sum + (st !== null ? STATE_SCORE[st] * w : 0);
  }, 0);

  return { composite, effectiveWeights };
}

function compositeToState(score: number): GYRState {
  if (score >= COMPOSITE_GREEN)  return "GREEN";
  if (score >= COMPOSITE_YELLOW) return "YELLOW";
  return "RED";
}

function applyLatestModifier(
  state: GYRState,
  latest: Record<string, number | null>,
): [GYRState, boolean] {
  const sleepRed = latest["sleep_score"] !== null &&
                   classifySignal("sleep_score", latest["sleep_score"]) === "RED";
  const readyRed = latest["readiness_score"] !== null &&
                   classifySignal("readiness_score", latest["readiness_score"]) === "RED";
  if (sleepRed || readyRed) {
    const degraded = STATE_ORDER[Math.max(0, STATE_ORDER.indexOf(state) - 1)];
    return [degraded, degraded !== state];
  }
  return [state, false];
}

function getCoverageDays(signals: TrendReport["signals"]): Record<string, number> {
  return Object.fromEntries(
    Object.keys(SIGNAL_WEIGHTS).map(s => [s, signals[s]?.["7d"]?.coverage_days ?? 0])
  );
}

function checkVolatility(signals: TrendReport["signals"]): Record<string, boolean> {
  return Object.fromEntries(
    Object.keys(SIGNAL_WEIGHTS).map(s => {
      const w = signals[s]?.["7d"];
      if (w?.min === null || w?.max === null) return [s, false];
      return [s, (w.max - w.min) / 4 > VOLATILITY_STD_THRESHOLD];
    })
  );
}

function computeConfidence(
  missing: string[],
  coverageDays: Record<string, number>,
  volatilityFlags: Record<string, boolean>,
): number {
  let c = 1.0;
  c -= missing.length * PENALTY_MISSING_SIGNAL;
  for (const sig of ["sleep_score", "readiness_score"]) {
    if ((coverageDays[sig] ?? 0) < MIN_COVERAGE_DAYS) c -= PENALTY_LOW_COVERAGE;
  }
  for (const volatile of Object.values(volatilityFlags)) {
    if (volatile) c -= PENALTY_HIGH_VOLATILITY;
  }
  return Math.max(0, Math.min(1, c));
}

function forceInsufficientState(
  anchorDate: string, missing: string[], signals: TrendReport["signals"]
): StateResult {
  const coverageDays = getCoverageDays(signals);
  return {
    classifier_version: "1.0", anchor_date: anchorDate,
    state: "YELLOW",
    confidence: Math.min(0.4, Math.max(0, 1 - missing.length * PENALTY_MISSING_SIGNAL)),
    composite_score: null, gate_triggered: false, gate_reason: null,
    latest_modifier_applied: false,
    signal_states: Object.fromEntries(Object.keys(SIGNAL_WEIGHTS).map(s => [s, null])),
    signal_averages_7d: Object.fromEntries(Object.keys(SIGNAL_WEIGHTS).map(s => [s, null])),
    effective_weights: {}, missing_signals: missing,
    coverage_days_7d: coverageDays, volatility_flags: {},
    insufficient_data: true,
  };
}
